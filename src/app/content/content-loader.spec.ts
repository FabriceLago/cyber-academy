import { LABS, PATHS } from './catalog';
import { findLesson, findPath, loadLab, loadLesson, loadPathLessons } from './content-loader';
import { CATALOG } from './outline.generated';

const LESSONS = PATHS.flatMap((p) => p.modules.flatMap((m) => m.lessons));

describe('chargement à la demande', () => {
  it('le plan reprend chaque parcours, leçon et laboratoire du contenu complet', () => {
    expect(CATALOG.paths.map((p) => p.id)).toEqual(PATHS.map((p) => p.id));
    expect(CATALOG.labs.map((l) => l.id)).toEqual(LABS.map((l) => l.id));
    for (const lesson of LESSONS) expect(findLesson(lesson.id)?.lesson.title).toBe(lesson.title);
  });

  it.each(LESSONS.map((l) => [l.id, l] as const))(
    'charge la leçon « %s » complète, avec son module et son parcours',
    async (id, lesson) => {
      const entry = await loadLesson(id);
      expect(entry?.lesson).toBe(lesson);
      expect(entry?.module.lessons.some((l) => l.id === id)).toBe(true);
      expect(entry?.path.modules).toContain(entry?.module);
    },
  );

  it.each(LABS.map((l) => [l.id, l] as const))('charge le laboratoire « %s »', async (id, lab) => {
    expect(await loadLab(id)).toBe(lab);
  });

  it.each(PATHS.map((p) => [p.id, p] as const))(
    'charge toutes les leçons du parcours « %s », dans l’ordre',
    async (id, path) => {
      const entry = await loadPathLessons(id);
      expect(entry?.path.id).toBe(id);
      expect(entry?.lessons).toEqual(path.modules.flatMap((m) => m.lessons));
    },
  );

  it.each(['inconnue', 'constructor', '__proto__'])(
    'renvoie null pour un identifiant inconnu (« %s »)',
    async (id) => {
      expect(await loadLesson(id)).toBeNull();
      expect(await loadLab(id)).toBeNull();
      expect(await loadPathLessons(id)).toBeNull();
      expect(findPath(id)).toBeUndefined();
    },
  );
});
