import { CATALOG, PATHS } from '../../content/catalog';
import { REVIEW_INDEX } from '../../content/outline.generated';
import { ProgressState, QuizAttempt } from '../models/progress.model';
import { summarizeProgress } from './progress';
import { EMPTY_PROGRESS } from './progress.store';
import { reviewItems } from './review';

const NOW = new Date('2026-10-17T12:00:00.000Z');
const LESSONS = PATHS.flatMap((p) => p.modules.flatMap((m) => m.lessons));
const IDS = ['q1', 'q4', 'q7', 'q2', 'q5'];

const attempt = (
  lessonId: string,
  correct: readonly string[],
  submittedAt: string,
): QuizAttempt => ({ lessonId, submittedAt, questionIds: IDS, correctQuestionIds: correct });

const run = (quizAttempts: QuizAttempt[]) => {
  const state: ProgressState = { ...EMPTY_PROGRESS, quizAttempts };
  const completed = new Set(
    summarizeProgress(CATALOG, state, NOW)
      .lessons.filter((l) => l.status === 'completed')
      .map((l) => l.lesson.id),
  );
  return reviewItems(LESSONS, REVIEW_INDEX, state, completed, NOW);
};

describe('reviewItems', () => {
  it('ne propose rien sans tentative', () => {
    expect(run([])).toEqual([]);
  });

  it('propose les notions ratées à la dernière tentative', () => {
    // Leçon 1 : q4 et q5 (objectif o2) ratées.
    const [item, ...rest] = run([
      attempt('ordinateur-et-fichiers', ['q1', 'q7', 'q2'], '2026-10-16T10:00:00.000Z'),
    ]);
    expect(rest).toEqual([]);
    expect(item.reason).toBe('notions');
    expect(item.objectives.map((o) => o.id)).toEqual(['o2']);
    expect(item.daysSince).toBe(1);
  });

  it('oublie les erreurs corrigées par une tentative plus récente', () => {
    expect(
      run([
        attempt('ordinateur-et-fichiers', IDS, '2026-10-16T10:00:00.000Z'),
        attempt('ordinateur-et-fichiers', ['q1'], '2026-10-15T10:00:00.000Z'),
      ]),
    ).toEqual([]);
  });

  it('rappelle une leçon validée sans quiz depuis 14 jours', () => {
    const [item] = run([attempt('ordinateur-et-fichiers', IDS, '2026-10-01T10:00:00.000Z')]);
    expect(item.reason).toBe('rappel');
    expect(item.daysSince).toBe(16);
    expect(run([attempt('ordinateur-et-fichiers', IDS, '2026-10-10T10:00:00.000Z')])).toEqual([]);
  });

  it('place les notions ratées, la plus récente en tête, avant les rappels', () => {
    const items = run([
      attempt('ordinateur-et-fichiers', IDS, '2026-09-20T10:00:00.000Z'),
      attempt('decouvrir-le-terminal', [], '2026-10-10T10:00:00.000Z'),
      attempt('voyage-d-une-information', [], '2026-10-16T10:00:00.000Z'),
    ]);
    expect(items.map((i) => [i.lesson.id, i.reason])).toEqual([
      ['voyage-d-une-information', 'notions'],
      ['decouvrir-le-terminal', 'notions'],
      ['ordinateur-et-fichiers', 'rappel'],
    ]);
  });
});
