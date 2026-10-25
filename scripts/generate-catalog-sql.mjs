// Génère supabase/seed.sql à partir du contenu TypeScript de l'application (src/app/content) :
// le catalogue de la base reste identique à celui de l'application.
// Usage : npm run db:catalog          (écrit le fichier)
//         npm run db:catalog -- --check (échoue si le fichier n'est plus à jour)
import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';

const OUT = 'supabase/seed.sql';

const { outputFiles } = await build({
  entryPoints: ['src/app/content/catalog.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
  logLevel: 'error',
});
const source = Buffer.from(outputFiles[0].text).toString('base64');
const { PATHS, LABS } = await import(`data:text/javascript;base64,${source}`);

const quote = (text) => `'${text.replaceAll("'", "''")}'`;
const literal = (value) =>
  typeof value === 'number' || typeof value === 'boolean'
    ? String(value)
    : typeof value === 'object'
      ? `${quote(JSON.stringify(value))}::jsonb`
      : quote(String(value));

/** insert … on conflict do update : le fichier peut être rejoué pour publier une mise à jour. */
function upsert(table, rows, key = ['id']) {
  const columns = Object.keys(rows[0]);
  const values = rows.map((row) => `  (${columns.map((c) => literal(row[c])).join(', ')})`);
  const updates = columns.filter((c) => !key.includes(c)).map((c) => `${c} = excluded.${c}`);
  return [
    `insert into public.${table} (${columns.join(', ')}) values`,
    `${values.join(',\n')}`,
    `on conflict (${key.join(', ')}) do update set ${updates.join(', ')};`,
    '',
  ].join('\n');
}

/** Clé de correction lue par record_quiz_attempt (voir la migration d'enregistrement). */
function answerKey(question) {
  switch (question.type) {
    case 'single':
    case 'multiple':
      return { type: 'choice', correct: question.options.filter((o) => o.correct).map((o) => o.id) };
    case 'true-false':
      return { type: 'choice', correct: [String(question.answer)] };
    case 'matching':
      return { type: 'matching', pairs: question.pairs.map((p) => p.id) };
    case 'ordering':
      return { type: 'ordering', items: question.items.map((i) => i.id) };
    default:
      throw new Error(`Type de question inconnu : ${question.type}`);
  }
}

const paths = PATHS.map((path, position) => ({
  id: path.id,
  title: path.title,
  level: path.level,
  position,
  premium: path.premium === true,
}));
const modules = PATHS.flatMap((path) =>
  path.modules.map((module, position) => ({
    id: module.id,
    path_id: path.id,
    title: module.title,
    pass_threshold: module.passThreshold,
    position,
  })),
);
const lessonOutlines = PATHS.flatMap((path) => path.modules.flatMap((module) => module.lessons));
const lessons = PATHS.flatMap((path) =>
  path.modules.flatMap((module) =>
    module.lessons.map((lesson, position) => ({
      id: lesson.id,
      module_id: module.id,
      title: lesson.title,
      duration_minutes: lesson.durationMinutes,
      position,
      quiz_size: lesson.quiz.questionsPerAttempt,
    })),
  ),
);
const answerKeys = lessonOutlines.flatMap((lesson) =>
  lesson.quiz.questions.map((question) => ({
    lesson_id: lesson.id,
    question_id: question.id,
    answer: answerKey(question),
  })),
);
const labs = LABS.map((lab) => {
  const lesson = lessonOutlines.find((l) => l.labId === lab.id);
  if (!lesson) throw new Error(`Laboratoire sans leçon : ${lab.id}`);
  return { id: lab.id, lesson_id: lesson.id, kind: lab.kind, title: lab.title };
});

const sql = [
  '-- Généré par scripts/generate-catalog-sql.mjs à partir de src/app/content : ne pas modifier',
  '-- à la main. Relancer « npm run db:catalog » après chaque changement du contenu.',
  '',
  upsert('learning_paths', paths),
  upsert('modules', modules),
  upsert('lessons', lessons),
  upsert('labs', labs),
  '-- Clés de correction : illisibles depuis le navigateur (aucune politique RLS).',
  upsert('quiz_answer_keys', answerKeys, ['lesson_id', 'question_id']),
].join('\n');

if (process.argv.includes('--check')) {
  const current = await readFile(OUT, 'utf8').catch(() => '');
  if (current.replaceAll('\r\n', '\n') !== sql) {
    console.error(`${OUT} n'est plus à jour : lancez « npm run db:catalog ».`);
    process.exit(1);
  }
  console.log(`${OUT} est à jour.`);
} else {
  await writeFile(OUT, sql);
  console.log(
    `${OUT} : ${paths.length} parcours, ${modules.length} modules, ${lessons.length} leçons, ${labs.length} laboratoires, ${answerKeys.length} clés de correction.`,
  );
}
