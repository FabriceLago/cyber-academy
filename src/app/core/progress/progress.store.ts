import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { LabAttempt, ProgressState, QuizAttempt } from '../models/progress.model';

const STORAGE_KEY = 'ca-progress';

export const EMPTY_PROGRESS: ProgressState = {
  schemaVersion: 1,
  quizAttempts: [],
  labAttempts: [],
  weeklyGoal: null,
};

/**
 * Progression de l'apprenant, gardée dans le navigateur jusqu'à l'arrivée de Supabase
 * (étape 10). Les tentatives sont enregistrées par les quiz et les laboratoires.
 */
@Injectable({ providedIn: 'root' })
export class ProgressStore {
  private readonly window = inject(DOCUMENT).defaultView;
  private readonly current = signal(this.read());

  readonly state = this.current.asReadonly();

  /** Objectif facultatif : nombre de leçons à valider par semaine (1 à 7), ou aucun. */
  setWeeklyGoal(goal: number | null): void {
    this.save({ ...this.current(), weeklyGoal: isWeeklyGoal(goal) ? goal : null });
  }

  /** Ajoute une tentative de quiz ; les tentatives ne sont jamais modifiées ensuite. */
  recordQuizAttempt(attempt: QuizAttempt): void {
    const state = this.current();
    this.save({ ...state, quizAttempts: [...state.quizAttempts, attempt] });
  }

  /** Ajoute une tentative de laboratoire, réussie ou non. */
  recordLabAttempt(attempt: LabAttempt): void {
    const state = this.current();
    this.save({ ...state, labAttempts: [...state.labAttempts, attempt] });
  }

  /** Efface toutes les tentatives ; l'objectif hebdomadaire, qui est un réglage, est conservé. */
  reset(): void {
    this.save({ ...EMPTY_PROGRESS, weeklyGoal: this.current().weeklyGoal });
  }

  private read(): ProgressState {
    try {
      return parseProgress(this.window?.localStorage.getItem(STORAGE_KEY) ?? null);
    } catch {
      return EMPTY_PROGRESS; // Stockage bloqué (navigation privée, réglages de confidentialité).
    }
  }

  private save(state: ProgressState): void {
    this.current.set(state);
    try {
      this.window?.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Stockage indisponible : la progression vaut seulement pour la session en cours.
    }
  }
}

/**
 * Relit la progression stockée. L'utilisateur peut modifier ces données : chaque entrée est
 * vérifiée, celles qui sont invalides sont ignorées, et les dates sont normalisées en ISO.
 */
export function parseProgress(raw: string | null): ProgressState {
  let data: unknown;
  try {
    data = JSON.parse(raw ?? 'null');
  } catch {
    return EMPTY_PROGRESS;
  }
  if (!isRecord(data) || data['schemaVersion'] !== 1) return EMPTY_PROGRESS;
  return {
    schemaVersion: 1,
    quizAttempts: validEntries(data['quizAttempts'], toQuizAttempt),
    labAttempts: validEntries(data['labAttempts'], toLabAttempt),
    weeklyGoal: isWeeklyGoal(data['weeklyGoal']) ? data['weeklyGoal'] : null,
  };
}

function toQuizAttempt(value: unknown): QuizAttempt | null {
  if (!isRecord(value)) return null;
  const { lessonId, submittedAt, questionIds, correctQuestionIds } = value;
  const date = isoDate(submittedAt);
  if (typeof lessonId !== 'string' || !date) return null;
  if (!isUniqueStrings(questionIds) || !isUniqueStrings(correctQuestionIds)) return null;
  if (!correctQuestionIds.every((id) => questionIds.includes(id))) return null;
  return { lessonId, submittedAt: date, questionIds, correctQuestionIds };
}

function toLabAttempt(value: unknown): LabAttempt | null {
  if (!isRecord(value)) return null;
  const { labId, completedAt, succeeded, hintsUsed } = value;
  const date = isoDate(completedAt);
  if (typeof labId !== 'string' || !date || typeof succeeded !== 'boolean') return null;
  if (typeof hintsUsed !== 'number' || !Number.isInteger(hintsUsed) || hintsUsed < 0) return null;
  return { labId, completedAt: date, succeeded, hintsUsed };
}

function validEntries<T>(value: unknown, toEntry: (item: unknown) => T | null): T[] {
  return Array.isArray(value) ? value.map(toEntry).filter((entry) => entry !== null) : [];
}

function isWeeklyGoal(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 7;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isUniqueStrings(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === 'string') &&
    new Set(value).size === value.length
  );
}

function isoDate(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : new Date(time).toISOString();
}
