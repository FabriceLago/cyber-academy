// Génère le plan léger du catalogue, lu par l'application au démarrage, à partir du contenu
// complet (src/app/content) : titres, durées, prérequis et objectifs, sans le texte des leçons ni
// les quiz, qui sont chargés à la demande (src/app/content/content-loader.ts).
// Usage : npm run content:outline          (écrit les fichiers)
//         npm run content:outline -- --check (échoue s'ils ne sont plus à jour)
import { build } from 'esbuild';
import { readdir, readFile, writeFile } from 'node:fs/promises';

const { outputFiles } = await build({
  stdin: {
    contents: [
      "export { CATALOG, LABS, PATHS } from './src/app/content/catalog';",
      "export { lessonReview } from './src/app/core/quiz/quiz-engine';",
    ].join('\n'),
    resolveDir: '.',
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
  logLevel: 'error',
});
const source = Buffer.from(outputFiles[0].text).toString('base64');
const { CATALOG, LABS, PATHS, lessonReview } = await import(
  `data:text/javascript;base64,${source}`
);

const lessons = PATHS.flatMap((path) => path.modules.flatMap((module) => module.lessons));
const outline = {
  paths: PATHS.map(({ modules, ...path }) => ({
    ...path,
    modules: modules.map(({ lessons, ...module }) => ({
      ...module,
      lessons: lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        durationMinutes: lesson.durationMinutes,
        prerequisiteIds: lesson.prerequisiteIds,
        ...(lesson.labId === undefined ? {} : { labId: lesson.labId }),
        skillIds: lesson.skillIds,
      })),
    })),
  })),
  labs: LABS.map(({ id, kind, title, skillIds, scenario }) => ({
    id,
    kind,
    title,
    skillIds,
    scenario,
  })),
  skills: CATALOG.skills,
};
const reviews = Object.fromEntries(lessons.map((lesson) => [lesson.id, lessonReview(lesson)]));
const glossary = lessons.flatMap((lesson) =>
  lesson.glossary.map((entry) => ({ ...entry, lessonId: lesson.id, lessonTitle: lesson.title })),
);

const HEADER = [
  '// Généré par scripts/generate-outline.mjs à partir de src/app/content : ne pas modifier à la',
  '// main. Relancer « npm run content:outline » après chaque changement du contenu.',
];
const json = (value) => JSON.stringify(value, null, 2);
const FILES = {
  'src/app/content/outline.generated.ts': [
    ...HEADER,
    "import { Catalog, LessonReview } from '../core/models/content.model';",
    '',
    '/** Plan du catalogue : parcours, leçons, laboratoires et compétences, sans le contenu. */',
    `export const CATALOG: Catalog = ${json(outline)};`,
    '',
    '/** Objectifs de chaque leçon et objectif évalué par chaque question, pour les révisions. */',
    `export const REVIEW_INDEX: Readonly<Record<string, LessonReview>> = ${json(reviews)};`,
    '',
  ],
  'src/app/content/glossary.generated.ts': [
    ...HEADER,
    "import { GlossaryEntry } from '../core/models/content.model';",
    '',
    '/** Termes de toutes les leçons, avec la leçon où ils sont définis (page Glossaire). */',
    `export const GLOSSARY: readonly (GlossaryEntry & {
  readonly lessonId: string;
  readonly lessonTitle: string;
})[] = ${json(glossary)};`,
    '',
  ],
};

/**
 * Garde-fou : hors de src/app/content et des tests, le code de l'application n'importe pas le
 * contenu complet, sinon il repartirait dans le code chargé au démarrage.
 */
async function fullContentImports(dir = 'src/app') {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = `${dir}/${entry.name}`;
    if (entry.isDirectory()) {
      if (file !== 'src/app/content') found.push(...(await fullContentImports(file)));
    } else if (file.endsWith('.ts') && !file.endsWith('.spec.ts')) {
      const text = await readFile(file, 'utf8');
      if (/from '[^']*content\/(catalog|lessons\/|labs\/|paths\/)/.test(text)) found.push(file);
    }
  }
  return found;
}

const forbidden = await fullContentImports();
if (forbidden.length > 0) {
  console.error(
    `Import du contenu complet hors de src/app/content : ${forbidden.join(', ')}. Lire le plan (content/outline.generated) ou charger à la demande (content/content-loader).`,
  );
  process.exit(1);
}

if (process.argv.includes('--check')) {
  let stale = false;
  for (const [file, lines] of Object.entries(FILES)) {
    const current = await readFile(file, 'utf8').catch(() => '');
    if (current.replaceAll('\r\n', '\n') !== lines.join('\n')) {
      console.error(`${file} n'est plus à jour : lancez « npm run content:outline ».`);
      stale = true;
    }
  }
  if (stale) process.exit(1);
  console.log('Le plan du catalogue est à jour.');
} else {
  for (const [file, lines] of Object.entries(FILES)) await writeFile(file, lines.join('\n'));
  console.log(
    `Plan du catalogue : ${outline.paths.length} parcours, ${lessons.length} leçons, ${outline.labs.length} laboratoires, ${glossary.length} termes.`,
  );
}
