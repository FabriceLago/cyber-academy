import { LessonOutline, LessonReview, Objective } from '../models/content.model';
import { ProgressState, QuizAttempt } from '../models/progress.model';
import { objectivesToReview } from '../quiz/quiz-engine';

/** Une leçon validée revient en révision après ce délai sans nouveau quiz (révision espacée). */
export const REVIEW_AFTER_DAYS = 14;

export interface ReviewItem {
  readonly lesson: LessonOutline;
  /** « notions » : la dernière tentative a raté des notions ; « rappel » : révision espacée. */
  readonly reason: 'notions' | 'rappel';
  /** Notions mal comprises lors de la dernière tentative (vide pour un rappel). */
  readonly objectives: readonly Objective[];
  /** Jours entiers écoulés depuis la dernière tentative. */
  readonly daysSince: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Leçons à réviser, calculées à partir des tentatives de quiz (lire une page ne compte pas) :
 * d'abord celles dont la dernière tentative a raté des notions, de la plus récente à la plus
 * ancienne, puis les leçons validées sans quiz depuis REVIEW_AFTER_DAYS, la plus ancienne en tête.
 * `reviews` : objectifs de chaque leçon (REVIEW_INDEX du plan), sans charger leur contenu.
 */
export function reviewItems(
  lessons: readonly LessonOutline[],
  reviews: Readonly<Record<string, LessonReview>>,
  state: ProgressState,
  completedIds: ReadonlySet<string>,
  now: Date,
): ReviewItem[] {
  const last = new Map<string, QuizAttempt>();
  for (const attempt of state.quizAttempts) {
    const previous = last.get(attempt.lessonId);
    if (!previous || attempt.submittedAt > previous.submittedAt) {
      last.set(attempt.lessonId, attempt);
    }
  }

  const missed: ReviewItem[] = [];
  const reminders: ReviewItem[] = [];
  for (const lesson of lessons) {
    const attempt = last.get(lesson.id);
    const review = Object.hasOwn(reviews, lesson.id) ? reviews[lesson.id] : undefined;
    if (!attempt || !review) continue;
    const daysSince = Math.floor((now.getTime() - Date.parse(attempt.submittedAt)) / DAY_MS);
    const objectives = objectivesToReview(review, attempt);
    if (objectives.length > 0) {
      missed.push({ lesson, reason: 'notions', objectives, daysSince });
    } else if (completedIds.has(lesson.id) && daysSince >= REVIEW_AFTER_DAYS) {
      reminders.push({ lesson, reason: 'rappel', objectives: [], daysSince });
    }
  }
  missed.sort((a, b) => a.daysSince - b.daysSince);
  reminders.sort((a, b) => b.daysSince - a.daysSince);
  return [...missed, ...reminders];
}
