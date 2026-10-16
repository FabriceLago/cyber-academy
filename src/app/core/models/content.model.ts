/**
 * Modèle du contenu pédagogique de Cyber Academy.
 *
 * Le contenu du MVP est écrit en TypeScript (src/app/content/) et vérifié par
 * core/content/validate-content.ts. Les mêmes objets serviront de données initiales
 * Supabase à l'étape 9. Tous les textes sont du texte brut, jamais du HTML :
 * ils sont affichés par interpolation.
 */

export type Level = 'debutant' | 'intermediaire' | 'avance';

/** Compétence démontrée par une leçon ou un laboratoire réussi. */
export interface Skill {
  readonly id: string;
  readonly title: string;
  readonly description: string;
}

export interface LearningPath {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly level: Level;
  readonly modules: readonly Module[];
}

export interface Module {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  /** Part minimale de bonnes réponses au quiz (entre 0 exclu et 1) pour valider une leçon du module. */
  readonly passThreshold: number;
  readonly lessons: readonly Lesson[];
}

/**
 * Une leçon suit le modèle pédagogique en 17 sections.
 * Les critères de réussite (15) sont dérivés de `Module.passThreshold` et de `labId` ;
 * les boutons Recommencer et Continuer (16, 17) relèvent de l'interface.
 */
export interface Lesson {
  readonly id: string;
  /** 1. Titre */
  readonly title: string;
  /** 2. Niveau et durée estimée */
  readonly level: Level;
  readonly durationMinutes: number;
  /** 3. Prérequis : identifiants de leçons du même parcours, placées avant celle-ci. */
  readonly prerequisiteIds: readonly string[];
  /** 4. Objectifs pédagogiques mesurables */
  readonly objectives: readonly Objective[];
  /** 5. Explication accessible */
  readonly explanation: readonly ContentBlock[];
  /** 6. Glossaire des nouveaux termes */
  readonly glossary: readonly GlossaryEntry[];
  /** 7. Exemple concret */
  readonly example: Example;
  /** 8. Animation interactive */
  readonly animation: VisualRef;
  /** 9. Démonstration visuelle */
  readonly demonstration: VisualRef;
  /** 10. Exercice guidé */
  readonly guidedExercise: GuidedExercise;
  /** 11. Laboratoire pratique, lorsqu'il est pertinent */
  readonly labId?: string;
  /** 12-13. Quiz de validation ; chaque question porte sa correction détaillée. */
  readonly quiz: Quiz;
  /** 14. Résumé */
  readonly summary: readonly string[];
  /** Compétences démontrées quand la leçon est validée. */
  readonly skillIds: readonly string[];
}

export interface Objective {
  readonly id: string;
  /** Commence par un verbe observable : « Citer », « Identifier », « Expliquer »… */
  readonly text: string;
}

export type ContentBlock =
  | { readonly kind: 'heading'; readonly text: string }
  | { readonly kind: 'paragraph'; readonly text: string }
  | { readonly kind: 'list'; readonly items: readonly string[] }
  | { readonly kind: 'callout'; readonly tone: 'info' | 'tip' | 'warning'; readonly text: string };

export interface GlossaryEntry {
  readonly term: string;
  /** En français simple, sans autre terme technique non défini. */
  readonly definition: string;
  readonly example: string;
}

export interface Example {
  readonly title: string;
  readonly text: string;
}

/** Référence vers une animation ou une démonstration implémentée comme composant. */
export interface VisualRef {
  readonly id: string;
  readonly title: string;
  /** Alternative textuelle complète, pour les lecteurs d'écran et le mouvement réduit. */
  readonly textAlternative: string;
}

export interface GuidedExercise {
  readonly intro: string;
  readonly steps: readonly GuidedStep[];
}

export interface GuidedStep {
  readonly question: Question;
  /** Indices progressifs, du plus léger au plus explicite. */
  readonly hints: readonly string[];
}

export interface Quiz {
  /** Nombre de questions tirées dans `questions` à chaque tentative. */
  readonly questionsPerAttempt: number;
  readonly questions: readonly Question[];
}

export interface QuestionBase {
  /** Unique dans la leçon. */
  readonly id: string;
  /** Objectif évalué : sert à repérer les notions mal comprises. */
  readonly objectiveId: string;
  readonly difficulty: 1 | 2 | 3;
  readonly prompt: string;
  /** Élément à analyser : extrait de journal, e-mail ou scénario de décision. */
  readonly context?: QuestionContext;
  /** Correction détaillée, affichée seulement après la soumission. */
  readonly explanation: string;
}

export interface QuestionContext {
  readonly kind: 'log' | 'email' | 'scenario';
  readonly text: string;
}

export interface ChoiceOption {
  readonly id: string;
  readonly label: string;
  readonly correct: boolean;
  /** Pourquoi cette option est juste ou fausse. */
  readonly feedback: string;
}

/** Choix unique (une seule option correcte) ou choix multiples. */
export interface ChoiceQuestion extends QuestionBase {
  readonly type: 'single' | 'multiple';
  readonly options: readonly ChoiceOption[];
}

export interface TrueFalseQuestion extends QuestionBase {
  readonly type: 'true-false';
  readonly answer: boolean;
}

/** Association de concepts : `pairs` donne les bonnes associations, l'interface mélange la colonne de droite. */
export interface MatchingQuestion extends QuestionBase {
  readonly type: 'matching';
  readonly pairs: readonly { readonly id: string; readonly left: string; readonly right: string }[];
}

/** Classement d'étapes : `items` est dans l'ordre correct, l'interface le mélange. */
export interface OrderingQuestion extends QuestionBase {
  readonly type: 'ordering';
  readonly items: readonly { readonly id: string; readonly label: string }[];
}

export type Question = ChoiceQuestion | TrueFalseQuestion | MatchingQuestion | OrderingQuestion;

export type LabKind = 'terminal' | 'phishing';

/**
 * Partie commune des laboratoires. L'environnement simulé, les actions autorisées et la
 * validation automatique propres à chaque type sont définis avec son moteur (étape 8).
 */
export interface Lab {
  readonly id: string;
  readonly kind: LabKind;
  readonly title: string;
  readonly scenario: string;
  readonly objectives: readonly string[];
  /** Indices progressifs. */
  readonly hints: readonly string[];
  /** Explications données après l'exercice. */
  readonly debrief: string;
  readonly skillIds: readonly string[];
}
