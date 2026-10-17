import { Lab, LearningPath, Lesson, PathOutline, Question, Skill } from '../models/content.model';

/**
 * Vérifie qu'une leçon respecte le modèle pédagogique : sections remplies, objectifs
 * mesurables, chaque objectif évalué par au moins 2 questions, banque assez grande pour
 * varier les tentatives, corrections présentes. Renvoie la liste des erreurs (vide si valide).
 */
export function validateLesson(lesson: Lesson): string[] {
  const errors: string[] = [];
  const fail = (where: string, message: string) =>
    errors.push(`${lesson.id} › ${where} : ${message}`);

  if (blank(lesson.title)) fail('titre', 'vide');
  if (!Number.isInteger(lesson.durationMinutes) || lesson.durationMinutes <= 0) {
    fail('durée', 'doit être un nombre entier de minutes supérieur à 0');
  }

  if (lesson.objectives.length === 0) fail('objectifs', 'au moins un objectif est requis');
  for (const id of duplicates(lesson.objectives.map((o) => o.id)))
    fail('objectifs', `identifiant en double « ${id} »`);
  for (const objective of lesson.objectives) {
    const firstWord = objective.text.trim().split(/\s+/)[0].toLowerCase();
    if (blank(objective.text)) {
      fail(`objectif ${objective.id}`, 'texte vide');
    } else if (NON_MEASURABLE_VERBS.includes(firstWord)) {
      fail(
        `objectif ${objective.id}`,
        `« ${firstWord} » n'est pas mesurable : utiliser un verbe observable (citer, identifier, expliquer…)`,
      );
    }
  }

  if (lesson.explanation.length === 0) fail('explication', 'au moins un bloc est requis');
  lesson.explanation.forEach((block, i) => {
    const empty =
      block.kind === 'list'
        ? block.items.length === 0 || block.items.some(blank)
        : blank(block.text);
    if (empty) fail(`explication bloc ${i + 1}`, 'contenu vide');
  });

  if (lesson.glossary.length === 0) fail('glossaire', 'au moins un terme est requis');
  for (const entry of lesson.glossary) {
    if (blank(entry.term) || blank(entry.definition) || blank(entry.example)) {
      fail(`glossaire « ${entry.term} »`, 'terme, définition et exemple sont obligatoires');
    }
  }
  for (const term of duplicates(lesson.glossary.map((g) => g.term.trim().toLowerCase()))) {
    fail('glossaire', `terme en double « ${term} »`);
  }

  if (blank(lesson.example.title) || blank(lesson.example.text))
    fail('exemple', 'titre et texte obligatoires');

  for (const [where, visual] of [
    ['animation', lesson.animation],
    ['démonstration', lesson.demonstration],
  ] as const) {
    if (blank(visual.id) || blank(visual.title) || blank(visual.textAlternative)) {
      fail(where, 'identifiant, titre et alternative textuelle obligatoires');
    }
  }

  if (blank(lesson.guidedExercise.intro)) fail('exercice guidé', 'introduction vide');
  if (lesson.guidedExercise.steps.length === 0)
    fail('exercice guidé', 'au moins une étape est requise');
  lesson.guidedExercise.steps.forEach((step, i) => {
    if (step.hints.length === 0 || step.hints.some(blank))
      fail(`exercice guidé étape ${i + 1}`, 'au moins un indice non vide est requis');
  });

  const { questions, questionsPerAttempt } = lesson.quiz;
  if (!Number.isInteger(questionsPerAttempt) || questionsPerAttempt < 1) {
    fail('quiz', 'questionsPerAttempt doit être un entier supérieur ou égal à 1');
  } else if (questions.length < 2 * questionsPerAttempt) {
    fail(
      'quiz',
      `${questions.length} questions pour ${questionsPerAttempt} par tentative : il en faut au moins ${2 * questionsPerAttempt} pour varier les tentatives`,
    );
  }
  for (const objective of lesson.objectives) {
    const count = questions.filter((q) => q.objectiveId === objective.id).length;
    if (count < 2)
      fail(
        `objectif ${objective.id}`,
        `évalué par ${count} question(s) du quiz, au moins 2 requises`,
      );
  }

  const allQuestions = [...lesson.guidedExercise.steps.map((s) => s.question), ...questions];
  for (const id of duplicates(allQuestions.map((q) => q.id)))
    fail('questions', `identifiant en double « ${id} »`);
  const objectiveIds = new Set(lesson.objectives.map((o) => o.id));
  for (const question of allQuestions) {
    if (!objectiveIds.has(question.objectiveId))
      fail(`question ${question.id}`, `objectif inconnu « ${question.objectiveId} »`);
    for (const message of questionErrors(question)) fail(`question ${question.id}`, message);
  }

  if (lesson.summary.length === 0 || lesson.summary.some(blank))
    fail('résumé', 'au moins un point non vide est requis');
  if (lesson.skillIds.length === 0) fail('compétences', 'au moins une compétence est requise');
  return errors;
}

/** Vérifie un parcours entier : sa structure, puis le contenu de chaque leçon. */
export function validatePath(
  path: LearningPath,
  labs: readonly Pick<Lab, 'id'>[],
  skills: readonly Pick<Skill, 'id'>[],
): string[] {
  return [
    ...validatePathStructure(path, labs, skills),
    ...path.modules.flatMap((module) => module.lessons.flatMap((lesson) => validateLesson(lesson))),
  ];
}

/**
 * Vérifie la structure d'un parcours, même quand seul son plan existe : unicité des leçons,
 * seuils de réussite, prérequis placés avant, laboratoires et compétences connus.
 */
export function validatePathStructure(
  path: PathOutline,
  labs: readonly Pick<Lab, 'id'>[],
  skills: readonly Pick<Skill, 'id'>[],
): string[] {
  const errors: string[] = [];
  const labIds = new Set(labs.map((l) => l.id));
  const skillIds = new Set(skills.map((s) => s.id));
  const lessons = path.modules.flatMap((m) => m.lessons);

  for (const module of path.modules) {
    if (!(module.passThreshold > 0 && module.passThreshold <= 1)) {
      errors.push(
        `${path.id} › module ${module.id} : passThreshold doit être compris entre 0 (exclu) et 1`,
      );
    }
    if (module.lessons.length === 0) errors.push(`${path.id} › module ${module.id} : aucune leçon`);
  }
  for (const id of duplicates(lessons.map((l) => l.id)))
    errors.push(`${path.id} : leçon en double « ${id} »`);

  const earlierLessonIds = new Set<string>();
  for (const lesson of lessons) {
    for (const id of lesson.prerequisiteIds) {
      if (!earlierLessonIds.has(id))
        errors.push(
          `${lesson.id} › prérequis : « ${id} » doit être une leçon placée avant dans le parcours`,
        );
    }
    if (lesson.labId !== undefined && !labIds.has(lesson.labId)) {
      errors.push(`${lesson.id} › laboratoire : « ${lesson.labId} » inconnu`);
    }
    for (const id of lesson.skillIds) {
      if (!skillIds.has(id)) errors.push(`${lesson.id} › compétences : « ${id} » inconnue`);
    }
    earlierLessonIds.add(lesson.id);
  }
  return errors;
}

// ponytail: heuristique sur le premier mot de l'objectif ; une relecture pédagogique reste nécessaire.
const NON_MEASURABLE_VERBS = [
  'comprendre',
  'connaître',
  'connaitre',
  'savoir',
  'découvrir',
  'apprendre',
  'maîtriser',
];

function questionErrors(question: Question): string[] {
  const errors: string[] = [];
  if (blank(question.prompt)) errors.push('énoncé vide');
  if (blank(question.explanation)) errors.push('correction détaillée vide');
  if (question.context && blank(question.context.text)) errors.push('contexte vide');

  switch (question.type) {
    case 'single':
    case 'multiple': {
      const correct = question.options.filter((o) => o.correct).length;
      const minOptions = question.type === 'single' ? 2 : 3;
      if (question.options.length < minOptions)
        errors.push(`au moins ${minOptions} options requises`);
      if (question.type === 'single' && correct !== 1)
        errors.push(`choix unique avec ${correct} bonne(s) réponse(s) au lieu de 1`);
      if (question.type === 'multiple' && (correct === 0 || correct === question.options.length)) {
        errors.push('choix multiples : il faut au moins une bonne et une mauvaise réponse');
      }
      if (question.options.some((o) => blank(o.label) || blank(o.feedback)))
        errors.push('chaque option doit avoir un libellé et une correction');
      errors.push(
        ...duplicates(question.options.map((o) => o.id)).map((id) => `option en double « ${id} »`),
      );
      break;
    }
    case 'true-false':
      break;
    case 'matching':
      if (question.pairs.length < 3) errors.push('au moins 3 paires requises');
      if (question.pairs.some((p) => blank(p.left) || blank(p.right)))
        errors.push('paire incomplète');
      errors.push(
        ...duplicates(question.pairs.map((p) => p.id)).map((id) => `paire en double « ${id} »`),
      );
      errors.push(
        ...duplicates(question.pairs.map((p) => p.right)).map(
          (right) => `association ambiguë : « ${right} » apparaît deux fois`,
        ),
      );
      break;
    case 'ordering':
      if (question.items.length < 3) errors.push('au moins 3 étapes à classer requises');
      if (question.items.some((item) => blank(item.label))) errors.push('étape sans libellé');
      errors.push(
        ...duplicates(question.items.map((item) => item.id)).map(
          (id) => `étape en double « ${id} »`,
        ),
      );
      break;
  }
  return errors;
}

function blank(text: string): boolean {
  return text.trim() === '';
}

function duplicates(values: readonly string[]): string[] {
  return [...new Set(values.filter((value, i) => values.indexOf(value) !== i))];
}
