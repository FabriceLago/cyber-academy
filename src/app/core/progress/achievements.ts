import { ProgressState } from '../models/progress.model';
import { ProgressSummary, quizScore } from './progress';

/**
 * Points d'expérience et badges : déduits des tentatives, comme le reste de la progression.
 * Ils récompensent des compétences démontrées (leçon validée, laboratoire réussi, compétence
 * acquise), jamais un clic ni une page lue. Refaire un quiz déjà réussi ne rapporte rien de plus.
 */
export const XP_RULES = {
  lesson: { label: 'Leçon validée', points: 100 },
  lab: { label: 'Laboratoire réussi', points: 50 },
  labWithoutHint: { label: 'Bonus : laboratoire réussi sans indice', points: 25 },
  skill: { label: 'Compétence acquise', points: 150 },
} as const;

export interface ExperienceLine {
  readonly label: string;
  readonly count: number;
  /** Points pour une occurrence. */
  readonly each: number;
  readonly points: number;
}

export interface Experience {
  readonly total: number;
  readonly lines: readonly ExperienceLine[];
}

export interface Badge {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly earned: boolean;
}

export function experience(summary: ProgressSummary, state: ProgressState): Experience {
  const counts = {
    lesson: summary.completedLessons,
    lab: summary.labs.filter((l) => l.completed).length,
    labWithoutHint: new Set(
      state.labAttempts.filter((a) => a.succeeded && a.hintsUsed === 0).map((a) => a.labId),
    ).size,
    skill: summary.skills.filter((s) => s.acquired).length,
  };
  const lines = (Object.keys(XP_RULES) as (keyof typeof XP_RULES)[]).map((key) => ({
    label: XP_RULES[key].label,
    count: counts[key],
    each: XP_RULES[key].points,
    points: counts[key] * XP_RULES[key].points,
  }));
  return { total: lines.reduce((sum, line) => sum + line.points, 0), lines };
}

export function badges(summary: ProgressSummary, state: ProgressState): Badge[] {
  const threshold = new Map(summary.lessons.map((l) => [l.lesson.id, l.module.passThreshold]));
  // Réussi après au moins un essai manqué : le premier succès n'est pas la première tentative.
  const persevered = [...groupBy(state.quizAttempts, (a) => a.lessonId)].some(
    ([lessonId, attempts]) =>
      attempts.findIndex((a) => quizScore(a) >= (threshold.get(lessonId) ?? 1)) > 0,
  );

  return [
    {
      id: 'premier-pas',
      title: 'Premier pas',
      description: 'Valider une première leçon.',
      earned: summary.completedLessons > 0,
    },
    {
      id: 'sans-faute',
      title: 'Sans faute',
      description: 'Réussir un quiz à 100 %.',
      earned: state.quizAttempts.some((a) => a.questionIds.length > 0 && quizScore(a) === 1),
    },
    {
      id: 'perseverance',
      title: 'Persévérance',
      description: 'Réussir un quiz après un premier essai manqué.',
      earned: persevered,
    },
    {
      id: 'premier-laboratoire',
      title: 'Premier laboratoire',
      description: 'Réussir un laboratoire du Cyber Lab.',
      earned: summary.labs.some((l) => l.completed),
    },
    {
      id: 'sans-indice',
      title: 'Sans indice',
      description: 'Réussir un laboratoire sans afficher d’indice.',
      earned: state.labAttempts.some((a) => a.succeeded && a.hintsUsed === 0),
    },
    {
      id: 'premiere-competence',
      title: 'Première compétence',
      description: 'Acquérir une compétence : toutes ses leçons et tous ses laboratoires validés.',
      earned: summary.skills.some((s) => s.acquired),
    },
    ...[...groupBy(summary.lessons, (l) => l.path.id).values()].map((lessons) => ({
      id: `parcours-${lessons[0].path.id}`,
      title: `Parcours terminé : ${lessons[0].path.title}`,
      description: 'Valider toutes les leçons du parcours.',
      earned: lessons.every((l) => l.status === 'completed'),
    })),
  ];
}

function groupBy<T>(items: readonly T[], key: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) groups.set(key(item), [...(groups.get(key(item)) ?? []), item]);
  return groups;
}
