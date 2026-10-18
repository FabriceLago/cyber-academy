import { CATALOG } from '../../content/catalog';
import { LabAttempt, ProgressState, QuizAttempt } from '../models/progress.model';
import { weeklyChallenge } from './challenges';
import { summarizeProgress } from './progress';
import { EMPTY_PROGRESS } from './progress.store';

const DAY = 24 * 60 * 60 * 1000;
/** Quatre samedis midi consécutifs : le même jour de la semaine dans tous les fuseaux courants. */
const SATURDAYS = [0, 1, 2, 3].map(
  (i) => new Date(Date.parse('2026-10-17T12:00:00.000Z') + i * 7 * DAY),
);
const IDS = ['q1', 'q2', 'q3', 'q4', 'q5'];

const quiz = (correct: number, at: Date): QuizAttempt => ({
  lessonId: 'ordinateur-et-fichiers',
  submittedAt: at.toISOString(),
  questionIds: IDS,
  correctQuestionIds: IDS.slice(0, correct),
});
const lab = (hintsUsed: number, at: Date): LabAttempt => ({
  labId: 'lab-terminal',
  completedAt: at.toISOString(),
  succeeded: true,
  hintsUsed,
});

const challengeAt = (now: Date, state: ProgressState) =>
  weeklyChallenge(summarizeProgress(CATALOG, state, now), state, now);

/** Un quiz raté (3/5) la semaine précédente : les quatre défis sont faisables. */
const before = (now: Date): ProgressState => ({
  ...EMPTY_PROGRESS,
  quizAttempts: [quiz(3, new Date(now.getTime() - 10 * DAY))],
});

/** Tentatives de la veille, ajoutées à `before`. */
const withYesterday = (now: Date, correct: number, hintsUsed: number): ProgressState => {
  const yesterday = new Date(now.getTime() - DAY);
  return {
    ...before(now),
    quizAttempts: [...before(now).quizAttempts, quiz(correct, yesterday)],
    labAttempts: [lab(hintsUsed, yesterday)],
  };
};

describe('weeklyChallenge', () => {
  it('change chaque semaine et propose tour à tour les quatre défis', () => {
    const ids = SATURDAYS.map((now) => challengeAt(now, before(now)).id);
    expect(new Set(ids).size).toBe(4);
  });

  it('reste le même du lundi au samedi', () => {
    const now = SATURDAYS[0];
    const monday = new Date(now.getTime() - 5 * DAY + 2 * 60 * 60 * 1000);
    expect(challengeAt(monday, before(now)).id).toBe(challengeAt(now, before(now)).id);
  });

  it('n’est pas relevé sans tentative réussie cette semaine', () => {
    for (const now of SATURDAYS) expect(challengeAt(now, before(now)).done).toBe(false);
  });

  it('est relevé par les tentatives de la semaine, quel que soit le défi', () => {
    for (const now of SATURDAYS) expect(challengeAt(now, withYesterday(now, 5, 0)).done).toBe(true);
  });

  it('ne compte ni un laboratoire réussi avec indice, ni un score seulement égalé', () => {
    for (const now of SATURDAYS)
      expect(challengeAt(now, withYesterday(now, 3, 1)).done).toBe(false);
  });

  it('ne propose pas de battre un record quand aucun quiz n’a été tenté avant', () => {
    const ids = SATURDAYS.map((now) => challengeAt(now, EMPTY_PROGRESS).id);
    expect(ids).not.toContain('score-ameliore');
  });
});
