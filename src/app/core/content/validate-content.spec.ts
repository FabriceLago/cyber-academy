import { Lab, LearningPath, Lesson, Question, Skill } from '../models/content.model';
import { validateLesson, validatePath } from './validate-content';

const singleChoice = (id: string, objectiveId: string): Question => ({
  id,
  objectiveId,
  type: 'single',
  difficulty: 1,
  prompt: 'Quel composant conserve les fichiers quand l’ordinateur est éteint ?',
  explanation:
    'Le stockage (disque dur ou SSD) garde les données sans électricité ; la mémoire vive se vide.',
  options: [
    { id: 'a', label: 'Le SSD', correct: true, feedback: 'Exact : c’est un stockage permanent.' },
    {
      id: 'b',
      label: 'La mémoire vive',
      correct: false,
      feedback: 'Non : elle se vide à l’extinction.',
    },
  ],
});

/** Leçon minimale mais complète : chaque test la casse d'une seule façon. */
function validLesson(): Lesson {
  return {
    id: 'l1',
    title: 'Comprendre un ordinateur',
    level: 'debutant',
    durationMinutes: 20,
    prerequisiteIds: [],
    objectives: [
      { id: 'o1', text: 'Distinguer le stockage de la mémoire vive' },
      { id: 'o2', text: 'Ordonner les étapes du démarrage d’un ordinateur' },
    ],
    explanation: [
      { kind: 'heading', text: 'Les grandes pièces' },
      {
        kind: 'paragraph',
        text: 'Un ordinateur reçoit des informations, les traite et les conserve.',
      },
      { kind: 'list', items: ['Processeur', 'Mémoire vive', 'Stockage'] },
      {
        kind: 'callout',
        tone: 'tip',
        text: 'La mémoire vive est un plan de travail ; le stockage est une armoire.',
      },
    ],
    glossary: [
      {
        term: 'Processeur',
        definition: 'La pièce qui exécute les calculs.',
        example: 'Il additionne les nombres d’un tableur.',
      },
    ],
    example: {
      title: 'Ouvrir une photo',
      text: 'La photo passe du SSD à la mémoire vive pour être affichée.',
    },
    animation: {
      id: 'boot-sequence',
      title: 'Le démarrage pas à pas',
      textAlternative:
        'Le courant arrive, le micrologiciel teste le matériel, puis le système démarre.',
    },
    demonstration: {
      id: 'computer-parts',
      title: 'Les pièces d’un ordinateur',
      textAlternative: 'Schéma annoté : processeur, mémoire vive, SSD, carte mère.',
    },
    guidedExercise: {
      intro: 'Répondez avec l’aide des indices.',
      steps: [
        {
          question: {
            id: 'g1',
            objectiveId: 'o1',
            type: 'true-false',
            difficulty: 1,
            prompt: 'La mémoire vive se vide à l’extinction.',
            explanation: 'Vrai : elle a besoin de courant.',
            answer: true,
          },
          hints: ['Pensez au plan de travail que l’on range le soir.'],
        },
      ],
    },
    quiz: {
      questionsPerAttempt: 2,
      questions: [
        singleChoice('q1', 'o1'),
        singleChoice('q2', 'o1'),
        {
          id: 'q3',
          objectiveId: 'o2',
          type: 'ordering',
          difficulty: 2,
          prompt: 'Classez les étapes du démarrage.',
          explanation: 'Le matériel est testé avant de charger le système.',
          items: [
            { id: 'a', label: 'Mise sous tension' },
            { id: 'b', label: 'Test du matériel' },
            { id: 'c', label: 'Chargement du système' },
          ],
        },
        {
          id: 'q4',
          objectiveId: 'o2',
          type: 'matching',
          difficulty: 2,
          prompt: 'Associez chaque étape à ce qu’elle fait.',
          explanation: 'Chaque étape prépare la suivante.',
          pairs: [
            { id: 'a', left: 'Mise sous tension', right: 'Alimente les composants' },
            { id: 'b', left: 'Test du matériel', right: 'Vérifie que les pièces répondent' },
            { id: 'c', left: 'Chargement du système', right: 'Lance Windows ou Linux' },
          ],
        },
      ],
    },
    summary: ['Le stockage garde, la mémoire vive travaille.'],
    skillIds: ['s1'],
  };
}

function withQuestion(lesson: Lesson, id: string, change: (q: Question) => Question): Lesson {
  return {
    ...lesson,
    quiz: {
      ...lesson.quiz,
      questions: lesson.quiz.questions.map((q) => (q.id === id ? change(q) : q)),
    },
  };
}

describe('validateLesson', () => {
  it('accepte une leçon complète', () => {
    expect(validateLesson(validLesson())).toEqual([]);
  });

  const cases: [string, (lesson: Lesson) => Lesson, string][] = [
    ['un titre vide', (l) => ({ ...l, title: '  ' }), 'l1 › titre : vide'],
    ['une durée nulle', (l) => ({ ...l, durationMinutes: 0 }), 'l1 › durée'],
    [
      'un objectif non mesurable',
      (l) => ({
        ...l,
        objectives: [{ id: 'o1', text: 'Comprendre le stockage' }, l.objectives[1]],
      }),
      "« comprendre » n'est pas mesurable",
    ],
    [
      'un objectif évalué par une seule question',
      (l) => ({
        ...l,
        quiz: { ...l.quiz, questions: l.quiz.questions.filter((q) => q.id !== 'q2') },
      }),
      'objectif o1 : évalué par 1 question(s)',
    ],
    [
      'une banque trop petite pour varier les tentatives',
      (l) => ({ ...l, quiz: { ...l.quiz, questionsPerAttempt: 3 } }),
      'il en faut au moins 6',
    ],
    [
      'un choix unique à deux bonnes réponses',
      (l) =>
        withQuestion(l, 'q1', (q) =>
          q.type === 'single'
            ? { ...q, options: q.options.map((o) => ({ ...o, correct: true })) }
            : q,
        ),
      'question q1 : choix unique avec 2 bonne(s) réponse(s)',
    ],
    [
      'une option sans correction',
      (l) =>
        withQuestion(l, 'q1', (q) =>
          q.type === 'single'
            ? { ...q, options: [q.options[0], { ...q.options[1], feedback: '' }] }
            : q,
        ),
      'chaque option doit avoir un libellé et une correction',
    ],
    [
      'une question sans correction détaillée',
      (l) => withQuestion(l, 'q2', (q) => ({ ...q, explanation: '' })),
      'question q2 : correction détaillée vide',
    ],
    [
      'un identifiant de question en double',
      (l) => ({
        ...l,
        guidedExercise: {
          ...l.guidedExercise,
          steps: [
            {
              ...l.guidedExercise.steps[0],
              question: { ...l.guidedExercise.steps[0].question, id: 'q1' },
            },
          ],
        },
      }),
      'identifiant en double « q1 »',
    ],
    [
      'une question liée à un objectif inconnu',
      (l) => withQuestion(l, 'q2', (q) => ({ ...q, objectiveId: 'o9' })),
      'objectif inconnu « o9 »',
    ],
    [
      'un classement de deux étapes',
      (l) =>
        withQuestion(l, 'q3', (q) =>
          q.type === 'ordering' ? { ...q, items: q.items.slice(0, 2) } : q,
        ),
      'au moins 3 étapes à classer',
    ],
    [
      'une association ambiguë',
      (l) =>
        withQuestion(l, 'q4', (q) =>
          q.type === 'matching'
            ? { ...q, pairs: q.pairs.map((p) => ({ ...p, right: 'Pareil' })) }
            : q,
        ),
      'association ambiguë',
    ],
    [
      'une animation sans alternative textuelle',
      (l) => ({ ...l, animation: { ...l.animation, textAlternative: '' } }),
      'animation : identifiant, titre et alternative textuelle obligatoires',
    ],
    [
      'un terme de glossaire sans exemple',
      (l) => ({ ...l, glossary: [{ ...l.glossary[0], example: '' }] }),
      'glossaire « Processeur »',
    ],
    [
      'une étape guidée sans indice',
      (l) => ({
        ...l,
        guidedExercise: {
          ...l.guidedExercise,
          steps: [{ ...l.guidedExercise.steps[0], hints: [] }],
        },
      }),
      'exercice guidé étape 1',
    ],
    [
      'un bloc de liste vide',
      (l) => ({ ...l, explanation: [{ kind: 'list', items: [] }] }),
      'explication bloc 1 : contenu vide',
    ],
    ['un résumé vide', (l) => ({ ...l, summary: [] }), 'résumé'],
    ['une leçon sans compétence', (l) => ({ ...l, skillIds: [] }), 'compétences'],
  ];

  it.each(cases)('signale %s', (_, breakLesson, expected) => {
    expect(validateLesson(breakLesson(validLesson())).join('\n')).toContain(expected);
  });
});

describe('validatePath', () => {
  const skills: Skill[] = [
    { id: 's1', title: 'Décrire un ordinateur', description: 'Nommer ses pièces et leur rôle.' },
  ];
  const labs: Lab[] = [
    {
      id: 'lab-terminal',
      kind: 'terminal',
      title: 'Explorer les dossiers',
      scenario: 'Retrouver un fichier.',
      objectives: ['Trouver rapport.txt'],
      hints: ['Utilisez ls.'],
      debrief: 'ls liste le contenu.',
      skillIds: ['s1'],
    },
  ];
  const second = (): Lesson => ({
    ...validLesson(),
    id: 'l2',
    prerequisiteIds: ['l1'],
    labId: 'lab-terminal',
  });
  const pathOf = (lessons: Lesson[], passThreshold = 0.8): LearningPath => ({
    id: 'decouverte',
    title: 'Découverte',
    description: 'Premiers pas.',
    level: 'debutant',
    modules: [
      { id: 'm1', title: 'Bases', description: 'Ordinateur et terminal.', passThreshold, lessons },
    ],
  });

  it('accepte un parcours cohérent', () => {
    expect(validatePath(pathOf([validLesson(), second()]), labs, skills)).toEqual([]);
  });

  it('signale un prérequis placé après la leçon', () => {
    expect(validatePath(pathOf([second(), validLesson()]), labs, skills).join('\n')).toContain(
      '« l1 » doit être une leçon placée avant',
    );
  });

  it('signale un laboratoire inconnu', () => {
    expect(validatePath(pathOf([validLesson(), second()]), [], skills).join('\n')).toContain(
      'laboratoire : « lab-terminal » inconnu',
    );
  });

  it('signale une compétence inconnue', () => {
    expect(validatePath(pathOf([validLesson()]), labs, []).join('\n')).toContain(
      'compétences : « s1 » inconnue',
    );
  });

  it('signale une leçon en double', () => {
    expect(validatePath(pathOf([validLesson(), validLesson()]), labs, skills).join('\n')).toContain(
      'leçon en double « l1 »',
    );
  });

  it.each([0, 1.5])('signale un seuil de réussite hors bornes (%s)', (threshold) => {
    expect(validatePath(pathOf([validLesson()], threshold), labs, skills).join('\n')).toContain(
      'passThreshold',
    );
  });
});
