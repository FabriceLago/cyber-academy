import { TestBed } from '@angular/core/testing';
import { EMPTY_PROGRESS, ProgressStore, parseProgress } from './progress.store';

const validQuiz = {
  lessonId: 'A',
  submittedAt: '2026-10-14T10:00:00.000Z',
  questionIds: ['q1', 'q2'],
  correctQuestionIds: ['q1'],
};
const validLab = { labId: 'L', completedAt: '2026-10-14T11:00:00Z', succeeded: true, hintsUsed: 1 };
const stored = (patch: object) =>
  JSON.stringify({
    schemaVersion: 1,
    quizAttempts: [],
    labAttempts: [],
    weeklyGoal: null,
    ...patch,
  });

describe('parseProgress', () => {
  it.each([
    ['rien de stocké', null],
    ['du JSON invalide', '{oups'],
    ['une autre version du format', JSON.stringify({ schemaVersion: 2 })],
    ['un tableau', '[]'],
  ])('repart d’une progression vide pour %s', (_, raw) => {
    expect(parseProgress(raw)).toEqual(EMPTY_PROGRESS);
  });

  it('garde les tentatives valides et normalise les dates', () => {
    const state = parseProgress(
      stored({ quizAttempts: [validQuiz], labAttempts: [validLab], weeklyGoal: 3 }),
    );
    expect(state.quizAttempts).toEqual([validQuiz]);
    expect(state.labAttempts).toEqual([{ ...validLab, completedAt: '2026-10-14T11:00:00.000Z' }]);
    expect(state.weeklyGoal).toBe(3);
  });

  it.each([
    ['une date invalide', { ...validQuiz, submittedAt: 'hier' }],
    ['une bonne réponse hors des questions posées', { ...validQuiz, correctQuestionIds: ['q9'] }],
    ['une bonne réponse comptée deux fois', { ...validQuiz, correctQuestionIds: ['q1', 'q1'] }],
    ['un identifiant de leçon manquant', { ...validQuiz, lessonId: 42 }],
  ])('ignore un quiz avec %s', (_, attempt) => {
    expect(parseProgress(stored({ quizAttempts: [attempt, validQuiz] })).quizAttempts).toEqual([
      validQuiz,
    ]);
  });

  it.each([
    ['un nombre d’indices négatif', { ...validLab, hintsUsed: -1 }],
    ['une réussite non booléenne', { ...validLab, succeeded: 'oui' }],
  ])('ignore un laboratoire avec %s', (_, attempt) => {
    expect(parseProgress(stored({ labAttempts: [attempt] })).labAttempts).toEqual([]);
  });

  it.each([0, 8, 2.5, '3'])('ignore un objectif hebdomadaire invalide (%s)', (goal) => {
    expect(parseProgress(stored({ weeklyGoal: goal })).weeklyGoal).toBeNull();
  });
});

describe('ProgressStore', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('relit la progression du navigateur', () => {
    localStorage.setItem('ca-progress', stored({ quizAttempts: [validQuiz] }));
    expect(TestBed.inject(ProgressStore).state().quizAttempts).toEqual([validQuiz]);
  });

  it('enregistre l’objectif hebdomadaire', () => {
    const store = TestBed.inject(ProgressStore);
    store.setWeeklyGoal(2);
    expect(store.state().weeklyGoal).toBe(2);
    expect(parseProgress(localStorage.getItem('ca-progress')).weeklyGoal).toBe(2);
    store.setWeeklyGoal(null);
    expect(store.state().weeklyGoal).toBeNull();
  });

  it('enregistre une tentative de quiz à la suite des précédentes', () => {
    localStorage.setItem('ca-progress', stored({ quizAttempts: [validQuiz] }));
    const store = TestBed.inject(ProgressStore);
    const next = { ...validQuiz, submittedAt: '2026-10-15T10:00:00.000Z' };
    store.recordQuizAttempt(next);
    expect(store.state().quizAttempts).toEqual([validQuiz, next]);
    expect(parseProgress(localStorage.getItem('ca-progress')).quizAttempts).toEqual([
      validQuiz,
      next,
    ]);
  });

  it('enregistre une tentative de laboratoire, réussie ou non', () => {
    const store = TestBed.inject(ProgressStore);
    const failed = { ...validLab, succeeded: false, completedAt: '2026-10-14T11:00:00.000Z' };
    const passed = { ...failed, succeeded: true, completedAt: '2026-10-14T12:00:00.000Z' };
    store.recordLabAttempt(failed);
    store.recordLabAttempt(passed);
    expect(store.state().labAttempts).toEqual([failed, passed]);
    expect(parseProgress(localStorage.getItem('ca-progress')).labAttempts).toEqual([
      failed,
      passed,
    ]);
  });

  it('réinitialise les tentatives en gardant l’objectif hebdomadaire', () => {
    localStorage.setItem(
      'ca-progress',
      stored({ quizAttempts: [validQuiz], labAttempts: [validLab], weeklyGoal: 2 }),
    );
    const store = TestBed.inject(ProgressStore);
    store.reset();
    expect(store.state()).toEqual({ ...EMPTY_PROGRESS, weeklyGoal: 2 });
    expect(parseProgress(localStorage.getItem('ca-progress'))).toEqual(store.state());
  });

  it('fonctionne quand le stockage du navigateur est bloqué', () => {
    const blocked = () => {
      throw new DOMException('Stockage bloqué', 'SecurityError');
    };
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked);
    const store = TestBed.inject(ProgressStore);
    expect(store.state()).toEqual(EMPTY_PROGRESS);
    store.setWeeklyGoal(4);
    expect(store.state().weeklyGoal).toBe(4);
  });
});
