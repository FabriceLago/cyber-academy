/**
 * Progression d'un apprenant. On n'enregistre que des faits datés, en ajout seul :
 * leçon validée, points d'expérience, compétences et révisions en sont dérivés.
 * Sans compte : stocké dans le navigateur ; avec un compte : tables Supabase quiz_attempts et
 * lab_attempts, remplies par les fonctions serveur (voir account-progress.ts).
 */

export interface QuizAttempt {
  readonly lessonId: string;
  /** Date ISO 8601, par exemple « 2026-10-16T09:30:00.000Z ». */
  readonly submittedAt: string;
  /** Questions tirées pour cette tentative. */
  readonly questionIds: readonly string[];
  /** Sous-ensemble de `questionIds` correctement répondu. */
  readonly correctQuestionIds: readonly string[];
}

export interface LabAttempt {
  readonly labId: string;
  /** Date ISO 8601. */
  readonly completedAt: string;
  readonly succeeded: boolean;
  readonly hintsUsed: number;
}

export interface ProgressState {
  /** Incrémenté à chaque changement de format, pour migrer les données déjà stockées. */
  readonly schemaVersion: 1;
  readonly quizAttempts: readonly QuizAttempt[];
  readonly labAttempts: readonly LabAttempt[];
  /** Objectif hebdomadaire facultatif, en leçons validées par semaine. */
  readonly weeklyGoal: number | null;
}
