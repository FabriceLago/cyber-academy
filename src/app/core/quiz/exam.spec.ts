import { PATHS } from '../../content/catalog';
import { CATALOG } from '../../content/outline.generated';
import { EXAM_SIZE, drawExam, skillReport } from './exam';

/** Générateur pseudo-aléatoire reproductible, pour des tests déterministes. */
function seeded(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const lessonsOf = (pathId: string) =>
  PATHS.find((p) => p.id === pathId)!.modules.flatMap((m) => m.lessons);
const DECOUVERTE = lessonsOf('decouverte');
const PILOTE = lessonsOf('culture-informatique');

describe('drawExam', () => {
  it.each([1, 2, 3])(
    'répartit les questions entre les leçons, sans doublon (graine %s)',
    (seed) => {
      const exam = drawExam(DECOUVERTE, seeded(seed));
      expect(exam).toHaveLength(EXAM_SIZE); // 5 leçons × 4 questions
      for (const lesson of DECOUVERTE) {
        expect(exam.filter((q) => q.lesson === lesson)).toHaveLength(4);
      }
      const keys = exam.map((q) => `${q.lesson.id}/${q.presented.question.id}`);
      expect(new Set(keys).size).toBe(keys.length);
    },
  );

  it('mélange les leçons au lieu de les enchaîner', () => {
    const lessons = drawExam(DECOUVERTE, seeded(4)).map((q) => q.lesson.id);
    const grouped = DECOUVERTE.flatMap((l) => Array<string>(4).fill(l.id));
    expect(lessons).not.toEqual(grouped);
  });

  it('se contente de toutes les questions d’une leçon seule si elle en a moins', () => {
    const exam = drawExam(PILOTE, seeded(5));
    expect(exam).toHaveLength(Math.min(EXAM_SIZE, PILOTE[0].quiz.questions.length));
  });
});

describe('skillReport', () => {
  const lesson = (id: string, skillIds: string[]) => ({ id, title: `Leçon ${id}`, skillIds });
  const a = lesson('a', ['decrire-un-ordinateur']);
  const b = lesson('b', ['utiliser-un-terminal']);

  it('compte par compétence, la moins réussie en tête, avec les leçons à revoir', () => {
    const report = skillReport(
      [
        { lesson: a, correct: true },
        { lesson: a, correct: true },
        { lesson: b, correct: false },
        { lesson: b, correct: true },
      ],
      CATALOG.skills,
    );
    expect(report.map((r) => [r.skill.id, r.correct, r.total])).toEqual([
      ['utiliser-un-terminal', 1, 2],
      ['decrire-un-ordinateur', 2, 2],
    ]);
    expect(report[0].lessonsToReview).toEqual([{ id: 'b', title: 'Leçon b' }]);
    expect(report[1].lessonsToReview).toEqual([]);
  });
});
