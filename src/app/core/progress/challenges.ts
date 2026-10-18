import { ProgressState } from '../models/progress.model';
import { ProgressSummary, quizScore, startOfWeek } from './progress';

/**
 * Défi de la semaine, facultatif : un seul à la fois, choisi selon le numéro de semaine. Il n'est
 * relevé que par des tentatives réussies depuis lundi 0 h : ouvrir une page ne compte pas.
 */
export interface WeeklyChallenge {
  readonly id: 'quiz-parfait' | 'labo-sans-indice' | 'nouvelle-lecon' | 'score-ameliore';
  readonly title: string;
  readonly description: string;
  /** Page où relever le défi. */
  readonly link: string;
  readonly done: boolean;
}

interface Rule {
  readonly challenge: Omit<WeeklyChallenge, 'done'>;
  /** Faisable cette semaine (ex. : battre un score suppose un quiz tenté avant lundi). */
  readonly available: () => boolean;
  readonly done: () => boolean;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function weeklyChallenge(
  summary: ProgressSummary,
  state: ProgressState,
  now: Date,
): WeeklyChallenge {
  const weekStart = startOfWeek(now);
  const thisWeek = (date: string) => new Date(date) >= weekStart;
  /** Meilleur score obtenu avant lundi sur cette leçon, -1 si aucune tentative. */
  const bestBefore = (lessonId: string) =>
    Math.max(
      -1,
      ...state.quizAttempts
        .filter((a) => a.lessonId === lessonId && !thisWeek(a.submittedAt))
        .map(quizScore),
    );

  const rules: readonly Rule[] = [
    {
      challenge: {
        id: 'quiz-parfait',
        title: 'Un quiz sans faute',
        description: 'Obtenez 100 % à un quiz, sur la leçon de votre choix.',
        link: '/quiz',
      },
      available: () => true,
      done: () => state.quizAttempts.some((a) => thisWeek(a.submittedAt) && quizScore(a) === 1),
    },
    {
      challenge: {
        id: 'labo-sans-indice',
        title: 'Un laboratoire sans indice',
        description: 'Réussissez un laboratoire du Cyber Lab sans afficher d’indice.',
        link: '/laboratoires',
      },
      available: () => summary.labs.length > 0,
      done: () =>
        state.labAttempts.some((a) => thisWeek(a.completedAt) && a.succeeded && a.hintsUsed === 0),
    },
    {
      challenge: {
        id: 'nouvelle-lecon',
        title: 'Une nouvelle leçon validée',
        description: 'Validez une leçon que vous n’aviez pas encore terminée.',
        link: '/lecons',
      },
      available: () =>
        summary.lessons.some((l) => l.completedAt === null || thisWeek(l.completedAt)),
      done: () => summary.lessons.some((l) => l.completedAt !== null && thisWeek(l.completedAt)),
    },
    {
      challenge: {
        id: 'score-ameliore',
        title: 'Battre votre record',
        description: 'Repassez un quiz tenté avant cette semaine et dépassez votre meilleur score.',
        link: '/quiz',
      },
      available: () =>
        state.quizAttempts.some((a) => !thisWeek(a.submittedAt) && bestBefore(a.lessonId) < 1),
      done: () =>
        state.quizAttempts.some((a) => {
          const best = bestBefore(a.lessonId);
          return thisWeek(a.submittedAt) && best >= 0 && quizScore(a) > best;
        }),
    },
  ];

  // Même défi toute la semaine, puis le suivant ; on saute ceux qui ne sont pas faisables.
  // Date du lundi lue en UTC : le numéro ne dépend ni du fuseau ni de l'heure d'été.
  const week = Math.floor(
    Date.UTC(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate()) / WEEK_MS,
  );
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[(week + i) % rules.length];
    if (rule.available()) return { ...rule.challenge, done: rule.done() };
  }
  return { ...rules[0].challenge, done: rules[0].done() };
}
