import { CATALOG } from '../../content/catalog';
import { ProgressState, QuizAttempt } from '../models/progress.model';
import { badges, experience } from './achievements';
import { summarizeProgress } from './progress';
import { EMPTY_PROGRESS } from './progress.store';

const NOW = new Date('2026-10-17T12:00:00.000Z');
const quiz = (correct: number, submittedAt: string): QuizAttempt => {
  const ids = ['q1', 'q2', 'q3', 'q4', 'q5'];
  return {
    lessonId: 'ordinateur-et-fichiers',
    submittedAt,
    questionIds: ids,
    correctQuestionIds: ids.slice(0, correct),
  };
};

/** Leçon 1 manquée (2/5) puis réussie (5/5) ; laboratoire du terminal réussi sans indice. */
const STATE: ProgressState = {
  ...EMPTY_PROGRESS,
  quizAttempts: [quiz(2, '2026-10-15T10:00:00.000Z'), quiz(5, '2026-10-16T10:00:00.000Z')],
  labAttempts: [
    {
      labId: 'lab-terminal',
      completedAt: '2026-10-16T11:00:00.000Z',
      succeeded: true,
      hintsUsed: 0,
    },
  ],
};

const run = (state: ProgressState) => {
  const summary = summarizeProgress(CATALOG, state, NOW);
  return { xp: experience(summary, state), badges: badges(summary, state) };
};

describe('points d’expérience', () => {
  it('ne rapportent rien sans compétence démontrée', () => {
    expect(run(EMPTY_PROGRESS).xp.total).toBe(0);
  });

  it('récompensent leçon validée, laboratoire réussi, bonus sans indice et compétence', () => {
    const { xp } = run(STATE);
    expect(xp.lines.map((l) => [l.label, l.count, l.points])).toEqual([
      ['Leçon validée', 1, 100],
      ['Laboratoire réussi', 1, 50],
      ['Bonus : laboratoire réussi sans indice', 1, 25],
      ['Compétence acquise', 1, 150],
    ]);
    expect(xp.total).toBe(325);
  });

  it('ne se cumulent pas en refaisant un quiz déjà réussi', () => {
    const again = {
      ...STATE,
      quizAttempts: [...STATE.quizAttempts, quiz(5, '2026-10-17T09:00:00.000Z')],
    };
    expect(run(again).xp.total).toBe(325);
  });
});

describe('badges', () => {
  it('aucun badge au départ', () => {
    expect(run(EMPTY_PROGRESS).badges.filter((b) => b.earned)).toEqual([]);
  });

  it('sont obtenus selon les faits enregistrés', () => {
    const earned = run(STATE)
      .badges.filter((b) => b.earned)
      .map((b) => b.id);
    expect(earned).toEqual([
      'premier-pas',
      'sans-faute',
      'perseverance',
      'premier-laboratoire',
      'sans-indice',
      'premiere-competence',
    ]);
    expect(run(STATE).badges.find((b) => b.id === 'parcours-decouverte')?.earned).toBe(false);
  });

  it('la persévérance demande un premier essai manqué', () => {
    const firstTry = { ...STATE, quizAttempts: [quiz(5, '2026-10-16T10:00:00.000Z')] };
    expect(run(firstTry).badges.find((b) => b.id === 'perseverance')?.earned).toBe(false);
  });
});
