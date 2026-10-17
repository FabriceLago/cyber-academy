import { Catalog } from '../models/content.model';
import { ProgressState, QuizAttempt } from '../models/progress.model';
import { summarizeProgress } from './progress';

/** A ; B (après A, avec un laboratoire) ; C (après A). Seuil de réussite : 80 %. */
const catalog: Catalog = {
  paths: [
    {
      id: 'p',
      title: 'Parcours',
      description: 'Test',
      level: 'debutant',
      modules: [
        {
          id: 'm',
          title: 'Module',
          description: 'Test',
          passThreshold: 0.8,
          lessons: [
            {
              id: 'A',
              title: 'Leçon A',
              durationMinutes: 10,
              prerequisiteIds: [],
              skillIds: ['s1'],
            },
            {
              id: 'B',
              title: 'Leçon B',
              durationMinutes: 20,
              prerequisiteIds: ['A'],
              labId: 'L',
              skillIds: ['s2'],
            },
            {
              id: 'C',
              title: 'Leçon C',
              durationMinutes: 30,
              prerequisiteIds: ['A'],
              skillIds: ['s1'],
            },
          ],
        },
      ],
    },
  ],
  labs: [{ id: 'L', kind: 'terminal', title: 'Labo L', skillIds: ['s2'] }],
  skills: [
    { id: 's1', title: 'Compétence 1', description: 'A et C' },
    { id: 's2', title: 'Compétence 2', description: 'B et L' },
  ],
};

const NOW = new Date(2026, 9, 14, 12); // mercredi 14 octobre 2026, 12 h (heure locale)
const iso = (day: number, hour = 10) => new Date(2026, 9, day, hour).toISOString();

/** Tentative de quiz avec `correct` bonnes réponses sur 5. */
const quiz = (lessonId: string, correct: number, day = 14, hour = 10): QuizAttempt => ({
  lessonId,
  submittedAt: iso(day, hour),
  questionIds: ['1', '2', '3', '4', '5'],
  correctQuestionIds: ['1', '2', '3', '4', '5'].slice(0, correct),
});

const state = (patch: Partial<ProgressState> = {}): ProgressState => ({
  schemaVersion: 1,
  quizAttempts: [],
  labAttempts: [],
  weeklyGoal: null,
  ...patch,
});

const statuses = (s: ProgressState) =>
  Object.fromEntries(
    summarizeProgress(catalog, s, NOW).lessons.map((l) => [l.lesson.id, l.status]),
  );

describe('summarizeProgress', () => {
  it('nouvel apprenant : seule la première leçon est accessible', () => {
    const summary = summarizeProgress(catalog, state(), NOW);
    expect(statuses(state())).toEqual({ A: 'available', B: 'locked', C: 'locked' });
    expect(summary.nextLesson?.lesson.id).toBe('A');
    expect(summary.completedLessons).toBe(0);
    expect(summary.currentPath?.remainingMinutes).toBe(60);
    expect(summary.lessons.find((l) => l.lesson.id === 'B')?.blockedBy.map((l) => l.id)).toEqual([
      'A',
    ]);
  });

  it('un quiz au seuil (4/5 = 80 %) valide la leçon et déverrouille la suite', () => {
    const s = state({ quizAttempts: [quiz('A', 4)] });
    expect(statuses(s)).toEqual({ A: 'completed', B: 'available', C: 'available' });
    const summary = summarizeProgress(catalog, s, NOW);
    expect(summary.nextLesson?.lesson.id).toBe('B');
    expect(summary.currentPath?.remainingMinutes).toBe(50);
  });

  it('un quiz sous le seuil laisse la leçon commencée, à terminer en priorité', () => {
    const s = state({ quizAttempts: [quiz('A', 3)] });
    expect(statuses(s)['A']).toBe('in-progress');
    expect(summarizeProgress(catalog, s, NOW).nextLesson?.lesson.id).toBe('A');
  });

  it('une leçon avec laboratoire n’est validée qu’après le laboratoire réussi', () => {
    const quizOnly = state({ quizAttempts: [quiz('A', 5), quiz('B', 5)] });
    expect(statuses(quizOnly)['B']).toBe('in-progress');

    const failedLab = state({
      ...quizOnly,
      labAttempts: [{ labId: 'L', completedAt: iso(14, 11), succeeded: false, hintsUsed: 3 }],
    });
    expect(statuses(failedLab)['B']).toBe('in-progress');

    const done = state({
      ...quizOnly,
      labAttempts: [{ labId: 'L', completedAt: iso(14, 11), succeeded: true, hintsUsed: 0 }],
    });
    const lessonB = summarizeProgress(catalog, done, NOW).lessons.find((l) => l.lesson.id === 'B');
    expect(lessonB?.status).toBe('completed');
    expect(lessonB?.completedAt).toBe(iso(14, 11)); // la plus tardive des deux réussites
  });

  it('propose d’abord une leçon commencée, même si une autre est accessible avant elle', () => {
    const s = state({ quizAttempts: [quiz('A', 5), quiz('C', 1)] });
    expect(statuses(s)).toEqual({ A: 'completed', B: 'available', C: 'in-progress' });
    expect(summarizeProgress(catalog, s, NOW).nextLesson?.lesson.id).toBe('C');
  });

  it('résume les quiz : tentatives, meilleur et dernier score, du plus récent au plus ancien', () => {
    const s = state({
      quizAttempts: [quiz('A', 2, 12), quiz('A', 5, 13), quiz('A', 3, 14), quiz('C', 4, 13)],
    });
    const [first, second] = summarizeProgress(catalog, s, NOW).quizResults;
    expect(first).toMatchObject({ attempts: 3, bestScore: 1, lastScore: 0.6, passed: true });
    expect(first.lesson.id).toBe('A');
    expect(second.lesson.id).toBe('C');
  });

  it('acquiert une compétence quand toutes ses activités sont validées', () => {
    const partial = summarizeProgress(catalog, state({ quizAttempts: [quiz('A', 5)] }), NOW);
    expect(partial.skills.find((s) => s.skill.id === 's1')).toMatchObject({ acquired: false });

    const full = summarizeProgress(
      catalog,
      state({
        quizAttempts: [quiz('A', 5), quiz('B', 5), quiz('C', 5)],
        labAttempts: [{ labId: 'L', completedAt: iso(14), succeeded: true, hintsUsed: 0 }],
      }),
      NOW,
    );
    expect(full.skills.map((s) => s.acquired)).toEqual([true, true]);
    expect(full.labs).toEqual([{ lab: catalog.labs[0], completed: true }]);
    expect(full.nextLesson).toBeNull();
    expect(full.currentPath).toBeNull();
    expect(full.completedLessons).toBe(3);
  });

  it('compte l’objectif hebdomadaire depuis lundi 0 h', () => {
    const s = state({
      weeklyGoal: 2,
      quizAttempts: [quiz('A', 5, 11, 23), quiz('C', 5, 12, 0)], // dimanche 23 h, lundi 0 h
    });
    expect(summarizeProgress(catalog, s, NOW).weekly).toEqual({ goal: 2, completedThisWeek: 1 });
    expect(summarizeProgress(catalog, state(), NOW).weekly).toBeNull();
  });

  it('ignore les tentatives sur des leçons absentes du catalogue', () => {
    const summary = summarizeProgress(catalog, state({ quizAttempts: [quiz('inconnue', 5)] }), NOW);
    expect(summary.quizResults).toEqual([]);
    expect(summary.completedLessons).toBe(0);
  });

  it('une spécialisation reste verrouillée tant que son parcours prérequis n’est pas terminé', () => {
    const special: Catalog = {
      ...catalog,
      paths: [
        ...catalog.paths,
        {
          id: 'spe',
          title: 'Spécialisation',
          description: 'Test',
          level: 'intermediaire',
          prerequisitePathIds: ['p'],
          modules: [
            {
              id: 'ms',
              title: 'Module S',
              description: 'Test',
              passThreshold: 0.8,
              lessons: [
                {
                  id: 'S',
                  title: 'Leçon S',
                  durationMinutes: 10,
                  prerequisiteIds: [],
                  skillIds: ['s1'],
                },
              ],
            },
          ],
        },
      ],
    };
    const lessonS = (s: ProgressState) =>
      summarizeProgress(special, s, NOW).lessons.find((l) => l.lesson.id === 'S');

    const partial = state({ quizAttempts: [quiz('A', 5), quiz('C', 5)] });
    expect(lessonS(partial)?.status).toBe('locked');
    expect(lessonS(partial)?.blockedBy.map((l) => l.id)).toEqual(['B']);

    const done = state({
      quizAttempts: [quiz('A', 5), quiz('B', 5), quiz('C', 5)],
      labAttempts: [{ labId: 'L', completedAt: iso(14), succeeded: true, hintsUsed: 0 }],
    });
    expect(lessonS(done)?.status).toBe('available');
    const summary = summarizeProgress(special, done, NOW);
    expect(summary.paths.map((p) => [p.path.id, p.completed, p.lessons.length])).toEqual([
      ['p', 3, 3],
      ['spe', 0, 1],
    ]);
    expect(summary.currentPath?.path.id).toBe('spe');
  });
});
