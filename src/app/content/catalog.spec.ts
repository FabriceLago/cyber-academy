import { validatePath } from '../core/content/validate-content';
import { CATALOG, PATHS, findLesson, findPath } from './catalog';

describe('Catalogue', () => {
  it.each(PATHS.map((path) => [path.id, path] as const))(
    'le parcours « %s » et chacune de ses leçons sont complets et cohérents',
    (_, path) => {
      expect(validatePath(path, CATALOG.labs, CATALOG.skills)).toEqual([]);
    },
  );

  it('chaque parcours prérequis existe et le précède dans le catalogue', () => {
    PATHS.forEach((path, index) => {
      for (const id of path.prerequisitePathIds ?? []) {
        const position = PATHS.findIndex((p) => p.id === id);
        expect(position, `${path.id} → ${id}`).toBeGreaterThanOrEqual(0);
        expect(position, `${path.id} → ${id}`).toBeLessThan(index);
      }
    });
  });

  it('chaque spécialisation a une fiche métier complète', () => {
    const specialties = PATHS.filter((path) => path.career);
    expect(specialties.map((p) => p.id)).toContain('analyste-soc-junior');
    for (const { id, career } of specialties) {
      if (!career) continue;
      for (const list of [
        career.requiredSkills,
        career.prerequisites,
        career.finalProject.deliverables,
        career.finalProject.criteria,
        career.interviewQuestions,
        career.interviewExercises,
        career.certifications,
      ])
        expect(list.length, id).toBeGreaterThan(0);
      const prompts = [...career.interviewQuestions, ...career.interviewExercises];
      expect(new Set(prompts.map((p) => p.id)).size, id).toBe(prompts.length);
      for (const prompt of prompts)
        expect(prompt.expectations.length, prompt.id).toBeGreaterThan(0);
    }
  });

  it('retrouve un parcours par son identifiant', () => {
    expect(findPath('analyste-soc-junior')?.career?.role).toContain('Analyste SOC');
    expect(findPath('inconnu')).toBeUndefined();
  });

  it('retrouve une leçon complète par son identifiant', () => {
    expect(findLesson('hameconnage')?.module.id).toBe('internet-et-menaces');
    expect(findLesson('inconnue')).toBeUndefined();
  });

  it('chaque laboratoire vise des compétences connues', () => {
    const skillIds = CATALOG.skills.map((skill) => skill.id);
    for (const lab of CATALOG.labs)
      expect(skillIds).toEqual(expect.arrayContaining([...lab.skillIds]));
  });

  it('chaque compétence est entraînée par au moins une leçon ou un laboratoire', () => {
    const lessons = CATALOG.paths.flatMap((p) => p.modules.flatMap((m) => m.lessons));
    const trained = new Set([...lessons, ...CATALOG.labs].flatMap((activity) => activity.skillIds));
    for (const skill of CATALOG.skills) expect(trained, skill.id).toContain(skill.id);
  });

  it('chaque laboratoire est rattaché à une leçon', () => {
    const lessons = CATALOG.paths.flatMap((p) => p.modules.flatMap((m) => m.lessons));
    for (const lab of CATALOG.labs) {
      expect(
        lessons.some((lesson) => lesson.labId === lab.id),
        lab.id,
      ).toBe(true);
    }
  });
});
