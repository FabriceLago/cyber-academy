import { validatePath } from '../core/content/validate-content';
import { CATALOG, PATHS, findLesson } from './catalog';

describe('Catalogue', () => {
  it.each(PATHS.map((path) => [path.id, path] as const))(
    'le parcours « %s » et chacune de ses leçons sont complets et cohérents',
    (_, path) => {
      expect(validatePath(path, CATALOG.labs, CATALOG.skills)).toEqual([]);
    },
  );

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
