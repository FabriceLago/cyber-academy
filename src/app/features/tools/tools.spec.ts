import { CATALOG } from '../../content/outline.generated';
import {
  TOOLS,
  TOOLS_BY_DOMAIN,
  findTool,
  preparation,
  toolsForLesson,
  verifiedLabel,
} from './tools';

const LESSON_IDS = new Set(
  CATALOG.paths.flatMap((p) => p.modules.flatMap((m) => m.lessons.map((l) => l.id))),
);
const LAB_IDS = new Set(CATALOG.labs.map((lab) => lab.id));

describe('Outils du métier (données)', () => {
  it('identifiants uniques, utilisables dans une adresse', () => {
    const ids = TOOLS.map((tool) => tool.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id, id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('chaque leçon et chaque laboratoire cités existent', () => {
    for (const tool of TOOLS) {
      for (const id of tool.lessonIds) expect(LESSON_IDS.has(id), `${tool.id} → ${id}`).toBe(true);
      for (const id of tool.labIds) expect(LAB_IDS.has(id), `${tool.id} → ${id}`).toBe(true);
    }
  });

  it('chaque outil est relié à une leçon publiée, ou dit honnêtement ce qui y préparera', () => {
    for (const tool of TOOLS) {
      expect(tool.lessonIds.length + tool.labIds.length > 0 || !!tool.upcoming, tool.id).toBe(true);
    }
  });

  it('site officiel en https, date de vérification valide et pas dans le futur', () => {
    const today = new Date().toISOString().slice(0, 10);
    for (const tool of TOOLS) {
      expect(new URL(tool.website).protocol, tool.id).toBe('https:');
      expect(tool.verifiedOn, tool.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(tool.verifiedOn <= today, tool.id).toBe(true);
    }
  });

  it('les outils qui sondent ou testent rappellent le cadre légal ; les services, ce qu’ils partagent', () => {
    for (const id of ['nmap', 'zap', 'burp-suite-community']) {
      expect(findTool(id)?.warning, id).toContain('323-1');
    }
    for (const tool of TOOLS.filter((t) => t.kind === 'service')) {
      expect(tool.warning, tool.id).toBeTruthy();
    }
  });

  it('chaque outil apparaît une fois dans la liste par domaine, sans domaine vide', () => {
    const listed = TOOLS_BY_DOMAIN.flatMap((group) => group.tools.map((t) => t.id));
    expect(listed.sort()).toEqual(TOOLS.map((t) => t.id).sort());
    for (const group of TOOLS_BY_DOMAIN)
      expect(group.tools.length, group.domain).toBeGreaterThan(0);
  });
});

describe('Outils du métier (liens)', () => {
  it('les leçons et laboratoires qui préparent à un outil, avec leur adresse', () => {
    const links = preparation(findTool('urlscan')!);
    expect(links.map((l) => l.path)).toEqual(['/lecons/hameconnage', '/laboratoires/lab-phishing']);
    expect(links[1].title).toMatch(/^Laboratoire : /);
  });

  it('les outils auxquels prépare une leçon', () => {
    const ids = toolsForLesson('hameconnage').map((t) => t.id);
    expect(ids).toEqual(expect.arrayContaining(['urlscan', 'virustotal']));
    expect(toolsForLesson('lecon-inconnue')).toEqual([]);
  });

  it('date de vérification en français', () => {
    expect(verifiedLabel('2026-10-30')).toBe('30 octobre 2026');
  });
});
