import { DOCUMENT, Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { LabAttempt, ProgressState, QuizAttempt } from '../models/progress.model';
import { Answer } from '../quiz/quiz-engine';
import { Json } from '../supabase/database.types';
import { SUPABASE } from '../supabase/supabase';
import { EMPTY_PROGRESS, ProgressStore } from './progress.store';

/** Réponse envoyée au serveur, qui la corrige lui-même (fonction record_quiz_attempt). */
export type AnswerPayload =
  | { readonly question_id: string; readonly kind: 'choice'; readonly selected: readonly string[] }
  | {
      readonly question_id: string;
      readonly kind: 'matching';
      readonly matches: Readonly<Record<string, string>>;
    }
  | { readonly question_id: string; readonly kind: 'ordering'; readonly order: readonly string[] };

export function toAnswerPayload(questionId: string, answer: Answer): AnswerPayload {
  switch (answer.kind) {
    case 'choice':
      return { question_id: questionId, kind: 'choice', selected: [...answer.selected] };
    case 'matching':
      return {
        question_id: questionId,
        kind: 'matching',
        matches: Object.fromEntries(answer.matches),
      };
    case 'ordering':
      return { question_id: questionId, kind: 'ordering', order: [...answer.order] };
  }
}

/** Échec d'un enregistrement ; le message s'adresse à l'apprenant. */
export class RecordError extends Error {}

export function recordMessage(error: { readonly code?: string }): string {
  switch (error.code) {
    case 'CA429':
      return 'Trop de tentatives en une heure : réessayez un peu plus tard.';
    case '28000':
    case 'PGRST301':
      return 'Votre session a expiré : reconnectez-vous, puis réessayez.';
    default:
      return 'L’enregistrement a échoué : vérifiez votre connexion, puis réessayez.';
  }
}

/** Dates du serveur (« …+00:00 ») au format ISO de l'application, pour pouvoir les comparer. */
const iso = (date: string) => new Date(date).toISOString();

/** Délai maximal d'attente de la progression du compte au démarrage. */
const SETTLE_TIMEOUT_MS = 5000;

/** Une session Supabase est-elle gardée par ce navigateur ? (lecture synchrone, sans réseau) */
function hasStoredSession(storage: Storage | undefined): boolean {
  try {
    return Object.keys(storage ?? {}).some((key) => /^sb-.+-auth-token$/.test(key));
  } catch {
    return false;
  }
}

/**
 * Progression du compte : chargée à l'ouverture d'une session, puis enrichie à chaque tentative,
 * enregistrée par les fonctions du serveur. Sans session, rien ne change : la progression du
 * navigateur reste affichée.
 */
@Injectable({ providedIn: 'root' })
export class AccountProgress {
  private readonly auth = inject(AuthService);
  private readonly client = inject(SUPABASE);
  private readonly store = inject(ProgressStore);

  readonly status = signal<'none' | 'loading' | 'ready' | 'error'>('none');
  /** Vrai avec une session ouverte : les tentatives sont enregistrées sur le compte. */
  readonly active = computed(() => this.auth.userId() !== null);
  /**
   * Faux tant qu'une session gardée par le navigateur est en cours de restauration : les pages
   * attendent la progression du compte au lieu d'afficher brièvement celle du navigateur (une
   * leçon verrouillée puis déverrouillée recréerait un laboratoire en cours).
   */
  readonly settled = signal(!hasStoredSession(inject(DOCUMENT).defaultView?.localStorage));

  constructor() {
    effect(() => {
      if (!this.auth.ready()) return;
      const userId = this.auth.userId();
      untracked(() => void this.load(userId));
    });
    // Serveur injoignable ou trop lent : on n'attend pas indéfiniment.
    if (!this.settled()) setTimeout(() => this.settled.set(true), SETTLE_TIMEOUT_MS);
  }

  async recordQuizAttempt(
    lessonId: string,
    answers: readonly AnswerPayload[],
  ): Promise<QuizAttempt> {
    const supabase = await this.client;
    const { data, error } = await supabase.rpc('record_quiz_attempt', {
      p_lesson_id: lessonId,
      p_answers: answers as unknown as Json,
    });
    if (error || !data) throw new RecordError(recordMessage(error ?? {}));
    const attempt: QuizAttempt = {
      lessonId: data.lesson_id,
      submittedAt: iso(data.submitted_at),
      questionIds: data.question_ids,
      correctQuestionIds: data.correct_question_ids,
    };
    this.update((state) => ({ ...state, quizAttempts: [...state.quizAttempts, attempt] }));
    return attempt;
  }

  async recordLabAttempt(
    labId: string,
    succeeded: boolean,
    hintsUsed: number,
  ): Promise<LabAttempt> {
    const supabase = await this.client;
    const { data, error } = await supabase.rpc('record_lab_attempt', {
      p_lab_id: labId,
      p_succeeded: succeeded,
      p_hints_used: hintsUsed,
    });
    if (error || !data) throw new RecordError(recordMessage(error ?? {}));
    const attempt: LabAttempt = {
      labId: data.lab_id,
      completedAt: iso(data.completed_at),
      succeeded: data.succeeded,
      hintsUsed: data.hints_used,
    };
    this.update((state) => ({ ...state, labAttempts: [...state.labAttempts, attempt] }));
    return attempt;
  }

  async setWeeklyGoal(goal: number | null): Promise<void> {
    const userId = this.auth.userId();
    if (!userId) return;
    const supabase = await this.client;
    const { error } = await supabase
      .from('profiles')
      .update({ weekly_goal: goal })
      .eq('id', userId);
    if (error) throw new RecordError(recordMessage(error));
    this.update((state) => ({ ...state, weeklyGoal: goal }));
  }

  /** Numéro du dernier chargement : la réponse d'un chargement dépassé est ignorée. */
  private loadSeq = 0;

  /**
   * Ajoute au compte affiché. Pendant un chargement (dont la réponse pourrait ne pas contenir
   * cette tentative) ou après un échec, tout est rechargé depuis le serveur.
   */
  private update(change: (state: ProgressState) => ProgressState): void {
    if (this.status() === 'ready') this.store.useAccount(change(this.store.state()));
    else void this.load(this.auth.userId());
  }

  private async load(userId: string | null): Promise<void> {
    const seq = ++this.loadSeq;
    if (!userId) {
      this.store.useAccount(null);
      this.status.set('none');
      this.settled.set(true);
      return;
    }
    // Pendant le chargement, une progression vide plutôt que celle du navigateur.
    this.store.useAccount(EMPTY_PROGRESS);
    this.status.set('loading');
    try {
      const supabase = await this.client;
      const [quiz, labs, profile] = await Promise.all([
        supabase
          .from('quiz_attempts')
          .select('lesson_id, submitted_at, question_ids, correct_question_ids')
          .order('submitted_at'),
        supabase
          .from('lab_attempts')
          .select('lab_id, completed_at, succeeded, hints_used')
          .order('completed_at'),
        supabase.from('profiles').select('weekly_goal').eq('id', userId).maybeSingle(),
      ]);
      if (quiz.error || labs.error || profile.error) throw new Error('chargement');
      if (seq !== this.loadSeq) return; // un chargement plus récent est en cours
      this.store.useAccount({
        schemaVersion: 1,
        quizAttempts: quiz.data.map((row) => ({
          lessonId: row.lesson_id,
          submittedAt: iso(row.submitted_at),
          questionIds: row.question_ids,
          correctQuestionIds: row.correct_question_ids,
        })),
        labAttempts: labs.data.map((row) => ({
          labId: row.lab_id,
          completedAt: iso(row.completed_at),
          succeeded: row.succeeded,
          hintsUsed: row.hints_used,
        })),
        weeklyGoal: profile.data?.weekly_goal ?? null,
      });
      this.status.set('ready');
    } catch {
      if (seq !== this.loadSeq) return;
      this.store.useAccount(null);
      this.status.set('error');
    } finally {
      this.settled.set(true);
    }
  }
}
