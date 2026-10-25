import { ORDINATEUR_ET_FICHIERS as LESSON } from '../../content/lessons/01-ordinateur-et-fichiers';
import { MatchingQuestion, OrderingQuestion } from '../models/content.model';
import {
  drawQuiz,
  initialAnswer,
  isAnswerComplete,
  isAnswerCorrect,
  lessonReview,
  objectivesToReview,
  presentQuestion,
} from './quiz-engine';

/** Générateur pseudo-aléatoire reproductible, pour des tests déterministes. */
function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const SEEDS = Array.from({ length: 30 }, (_, i) => i + 1);
const ids = (drawn: { question: { id: string } }[]) => drawn.map((d) => d.question.id);

describe('drawQuiz', () => {
  it.each(SEEDS)('tire 5 questions distinctes couvrant les 3 objectifs (graine %s)', (seed) => {
    const drawn = drawQuiz(LESSON.quiz, [], seeded(seed));
    expect(new Set(ids(drawn)).size).toBe(LESSON.quiz.questionsPerAttempt);
    expect(new Set(drawn.map((d) => d.question.objectiveId))).toEqual(new Set(['o1', 'o2', 'o3']));
  });

  it.each(SEEDS)('ne repose aucune question de la tentative précédente (graine %s)', (seed) => {
    const first = ids(drawQuiz(LESSON.quiz, [], seeded(seed)));
    const second = ids(drawQuiz(LESSON.quiz, first, seeded(seed + 100)));
    expect(second.filter((id) => first.includes(id))).toEqual([]);
  });

  it('présente les questions de la plus facile à la plus difficile', () => {
    const difficulties = drawQuiz(LESSON.quiz, [], seeded(7)).map((d) => d.question.difficulty);
    expect(difficulties).toEqual([...difficulties].sort((a, b) => a - b));
  });
});

describe('presentQuestion', () => {
  const ordering = LESSON.quiz.questions.find((q) => q.type === 'ordering') as OrderingQuestion;
  const matching = LESSON.quiz.questions.find((q) => q.type === 'matching') as MatchingQuestion;

  it('mélange sans perdre d’option', () => {
    const presented = presentQuestion(matching, seeded(3));
    expect([...presented.order].sort()).toEqual(matching.pairs.map((p) => p.id).sort());
  });

  it.each([0, 0.5, 0.999])(
    'ne présente jamais un classement déjà dans le bon ordre (aléa constant %s)',
    (value) => {
      const order = presentQuestion(ordering, () => value).order;
      expect(order).not.toEqual(ordering.items.map((i) => i.id));
    },
  );
});

describe('correction', () => {
  const matching = LESSON.quiz.questions.find((q) => q.type === 'matching') as MatchingQuestion;
  const ordering = LESSON.quiz.questions.find((q) => q.type === 'ordering') as OrderingQuestion;

  it('association : juste seulement si chaque élément a sa paire', () => {
    const all = new Map(matching.pairs.map((p) => [p.id, p.id]));
    expect(isAnswerCorrect(matching, { kind: 'matching', matches: all })).toBe(true);
    const swapped = new Map(all).set('a', 'b').set('b', 'a');
    expect(isAnswerCorrect(matching, { kind: 'matching', matches: swapped })).toBe(false);
    const partial = new Map([['a', 'a']]);
    expect(isAnswerComplete(matching, { kind: 'matching', matches: partial })).toBe(false);
  });

  it('classement : juste seulement dans l’ordre attendu ; l’ordre de départ compte comme réponse', () => {
    const right = ordering.items.map((i) => i.id);
    expect(isAnswerCorrect(ordering, { kind: 'ordering', order: right })).toBe(true);
    const start = initialAnswer(presentQuestion(ordering, seeded(5)));
    expect(isAnswerComplete(ordering, start)).toBe(true);
    expect(isAnswerCorrect(ordering, start)).toBe(false);
  });

  it('une question sans réponse est incomplète et fausse', () => {
    expect(isAnswerComplete(matching, null)).toBe(false);
    expect(isAnswerCorrect(matching, null)).toBe(false);
  });
});

describe('objectivesToReview', () => {
  it('liste les objectifs des questions ratées, sans doublon', () => {
    const review = objectivesToReview(lessonReview(LESSON), {
      lessonId: LESSON.id,
      submittedAt: '2026-10-17T08:00:00.000Z',
      questionIds: ['q1', 'q2', 'q4', 'q7', 'q8', 'constructor', 'inconnue'],
      correctQuestionIds: ['q4'],
    });
    // Les identifiants inconnus (progression modifiée à la main) sont ignorés.
    expect(review.map((o) => o.id)).toEqual(['o1', 'o3']);
  });
});
