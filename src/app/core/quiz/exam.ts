import { Lesson, Skill } from '../models/content.model';
import { PresentedQuestion, drawQuiz, shuffle } from './quiz-engine';

/** Nombre visé de questions d'un examen blanc, réparties à parts égales entre les leçons. */
export const EXAM_SIZE = 20;

export interface ExamQuestion {
  readonly lesson: Lesson;
  readonly presented: PresentedQuestion;
}

/**
 * Tire un examen blanc : autant de questions dans chaque leçon (au moins une par objectif quand
 * c'est possible, comme pour un quiz), puis toutes mélangées.
 */
export function drawExam(lessons: readonly Lesson[], random = Math.random): ExamQuestion[] {
  const perLesson = Math.ceil(EXAM_SIZE / Math.max(lessons.length, 1));
  return shuffle(
    lessons.flatMap((lesson) =>
      drawQuiz({ ...lesson.quiz, questionsPerAttempt: perLesson }, [], random).map((presented) => ({
        lesson,
        presented,
      })),
    ),
    random,
  );
}

export interface SkillResult {
  readonly skill: Skill;
  readonly correct: number;
  readonly total: number;
  /** Leçons où une question de cette compétence a été manquée. */
  readonly lessonsToReview: readonly Pick<Lesson, 'id' | 'title'>[];
}

/** Bilan par compétence, de la moins réussie à la mieux réussie (ordre du catalogue à égalité). */
export function skillReport(
  results: readonly {
    readonly lesson: Pick<Lesson, 'id' | 'title' | 'skillIds'>;
    readonly correct: boolean;
  }[],
  skills: readonly Skill[],
): SkillResult[] {
  return skills
    .flatMap((skill) => {
      const mine = results.filter((r) => r.lesson.skillIds.includes(skill.id));
      if (mine.length === 0) return [];
      const missed = new Map(
        mine.filter((r) => !r.correct).map(({ lesson }) => [lesson.id, lesson] as const),
      );
      return [
        {
          skill,
          correct: mine.filter((r) => r.correct).length,
          total: mine.length,
          lessonsToReview: [...missed.values()].map(({ id, title }) => ({ id, title })),
        },
      ];
    })
    .sort((a, b) => a.correct / a.total - b.correct / b.total);
}
