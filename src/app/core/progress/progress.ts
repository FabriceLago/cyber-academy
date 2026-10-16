import {
  Catalog,
  LabOutline,
  LessonOutline,
  ModuleOutline,
  PathOutline,
  Skill,
} from '../models/content.model';
import { ProgressState, QuizAttempt } from '../models/progress.model';

/**
 * Règles de progression. Tout est calculé à partir des tentatives enregistrées :
 * - une leçon est validée quand un quiz atteint le seuil du module et, si elle a un
 *   laboratoire, quand ce laboratoire a été réussi ;
 * - une leçon est verrouillée tant qu'un de ses prérequis n'est pas validé ;
 * - une compétence est acquise quand toutes les leçons et tous les laboratoires qui
 *   l'entraînent sont validés. Lire une page ne rapporte rien.
 */

export type LessonStatus = 'locked' | 'available' | 'in-progress' | 'completed';

export interface LessonProgress {
  readonly lesson: LessonOutline;
  readonly module: ModuleOutline;
  readonly path: PathOutline;
  readonly status: LessonStatus;
  /** Prérequis encore à valider (vide si la leçon est accessible). */
  readonly blockedBy: readonly LessonOutline[];
  /** Date ISO de validation. */
  readonly completedAt: string | null;
}

export interface PathProgress {
  readonly path: PathOutline;
  readonly lessons: readonly LessonProgress[];
  readonly completed: number;
  /** Durée estimée des leçons pas encore validées. */
  readonly remainingMinutes: number;
}

export interface QuizResult {
  readonly lesson: LessonOutline;
  readonly attempts: number;
  readonly bestScore: number;
  readonly lastScore: number;
  readonly lastAttemptAt: string;
  readonly passed: boolean;
}

export interface SkillProgress {
  readonly skill: Skill;
  readonly activities: readonly {
    readonly kind: 'lesson' | 'lab';
    readonly title: string;
    readonly completed: boolean;
  }[];
  readonly acquired: boolean;
}

export interface ProgressSummary {
  readonly lessons: readonly LessonProgress[];
  readonly completedLessons: number;
  /** Parcours commencé et pas terminé, sinon le premier pas terminé. */
  readonly currentPath: PathProgress | null;
  /** Leçon commencée à terminer en priorité, sinon la première accessible. */
  readonly nextLesson: LessonProgress | null;
  readonly labs: readonly { readonly lab: LabOutline; readonly completed: boolean }[];
  /** Du plus récent au plus ancien. */
  readonly quizResults: readonly QuizResult[];
  readonly skills: readonly SkillProgress[];
  /** Objectif facultatif : leçons validées depuis lundi 0 h. */
  readonly weekly: { readonly goal: number; readonly completedThisWeek: number } | null;
}

export function quizScore(attempt: QuizAttempt): number {
  return attempt.questionIds.length === 0
    ? 0
    : attempt.correctQuestionIds.length / attempt.questionIds.length;
}

export function summarizeProgress(
  catalog: Catalog,
  state: ProgressState,
  now: Date,
): ProgressSummary {
  const labCompletedAt = new Map<string, string>();
  for (const attempt of [...state.labAttempts].sort((a, b) =>
    compare(a.completedAt, b.completedAt),
  )) {
    if (attempt.succeeded && !labCompletedAt.has(attempt.labId)) {
      labCompletedAt.set(attempt.labId, attempt.completedAt);
    }
  }

  const quizAttempts = new Map<string, QuizAttempt[]>();
  for (const attempt of [...state.quizAttempts].sort((a, b) =>
    compare(a.submittedAt, b.submittedAt),
  )) {
    quizAttempts.set(attempt.lessonId, [...(quizAttempts.get(attempt.lessonId) ?? []), attempt]);
  }

  const lessons: LessonProgress[] = [];
  const quizResults: QuizResult[] = [];
  const byId = new Map<string, LessonProgress>();

  for (const path of catalog.paths) {
    for (const module of path.modules) {
      for (const lesson of module.lessons) {
        const attempts = quizAttempts.get(lesson.id) ?? [];
        const firstPass = attempts.find((a) => quizScore(a) >= module.passThreshold);
        const labDate =
          lesson.labId === undefined ? null : (labCompletedAt.get(lesson.labId) ?? null);
        const completedAt =
          firstPass && (lesson.labId === undefined || labDate)
            ? latest(firstPass.submittedAt, labDate)
            : null;
        const blockedBy = lesson.prerequisiteIds
          .map((id) => byId.get(id))
          .filter((p): p is LessonProgress => p !== undefined && p.status !== 'completed')
          .map((p) => p.lesson);

        let status: LessonStatus = 'available';
        if (completedAt) status = 'completed';
        else if (blockedBy.length > 0) status = 'locked';
        else if (attempts.length > 0 || labDate) status = 'in-progress';

        const progress: LessonProgress = { lesson, module, path, status, blockedBy, completedAt };
        lessons.push(progress);
        byId.set(lesson.id, progress);

        if (attempts.length > 0) {
          const scores = attempts.map(quizScore);
          const last = attempts[attempts.length - 1];
          quizResults.push({
            lesson,
            attempts: attempts.length,
            bestScore: Math.max(...scores),
            lastScore: quizScore(last),
            lastAttemptAt: last.submittedAt,
            passed: firstPass !== undefined,
          });
        }
      }
    }
  }

  const paths = catalog.paths.map((path): PathProgress => {
    const pathLessons = lessons.filter((l) => l.path === path);
    const remaining = pathLessons.filter((l) => l.status !== 'completed');
    return {
      path,
      lessons: pathLessons,
      completed: pathLessons.length - remaining.length,
      remainingMinutes: remaining.reduce((sum, l) => sum + l.lesson.durationMinutes, 0),
    };
  });
  const unfinished = paths.filter((p) => p.completed < p.lessons.length);
  const currentPath =
    unfinished.find((p) =>
      p.lessons.some((l) => l.status !== 'available' && l.status !== 'locked'),
    ) ??
    unfinished[0] ??
    null;
  const nextLesson =
    currentPath?.lessons.find((l) => l.status === 'in-progress') ??
    currentPath?.lessons.find((l) => l.status === 'available') ??
    null;

  const skills = catalog.skills.map((skill): SkillProgress => {
    const activities = [
      ...lessons
        .filter((l) => l.lesson.skillIds.includes(skill.id))
        .map((l) => ({
          kind: 'lesson' as const,
          title: l.lesson.title,
          completed: l.status === 'completed',
        })),
      ...catalog.labs
        .filter((lab) => lab.skillIds.includes(skill.id))
        .map((lab) => ({
          kind: 'lab' as const,
          title: lab.title,
          completed: labCompletedAt.has(lab.id),
        })),
    ];
    return {
      skill,
      activities,
      acquired: activities.length > 0 && activities.every((a) => a.completed),
    };
  });

  const weekStart = startOfWeek(now);
  return {
    lessons,
    completedLessons: lessons.filter((l) => l.status === 'completed').length,
    currentPath,
    nextLesson,
    labs: catalog.labs.map((lab) => ({ lab, completed: labCompletedAt.has(lab.id) })),
    quizResults: quizResults.sort((a, b) => compare(b.lastAttemptAt, a.lastAttemptAt)),
    skills,
    weekly:
      state.weeklyGoal === null
        ? null
        : {
            goal: state.weeklyGoal,
            completedThisWeek: lessons.filter(
              (l) => l.completedAt !== null && new Date(l.completedAt) >= weekStart,
            ).length,
          },
  };
}

/** Lundi 0 h, heure locale. */
function startOfWeek(now: Date): Date {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
}

/** Dates ISO normalisées (voir parseProgress) : l'ordre alphabétique est l'ordre chronologique. */
function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function latest(a: string, b: string | null): string {
  return b !== null && b > a ? b : a;
}
