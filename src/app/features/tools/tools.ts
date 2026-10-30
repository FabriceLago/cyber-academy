// Outils du métier, sans dépendance à Angular : lus par les pages et par
// scripts/prerender-glossary.mjs, qui en tire une page statique par outil.
import { CATALOG } from '../../content/outline.generated';
import { TOOLS, TOOL_DOMAINS, ToolDomain, ToolEntry } from '../../content/tools';

export { TOOLS, TOOL_DOMAINS };
export type { ToolDomain, ToolEntry };

/** Leçon ou laboratoire qui prépare à un outil, avec son adresse. */
export interface ToolLink {
  readonly title: string;
  readonly path: string;
}

const LESSONS = CATALOG.paths.flatMap((path) => path.modules.flatMap((module) => module.lessons));

export const KIND_LABELS: Readonly<Record<ToolEntry['kind'], string>> = {
  libre: 'Libre',
  gratuit: 'Gratuit, non libre',
  service: 'Service en ligne',
};

/** Outils groupés par domaine, dans l'ordre des domaines. */
export const TOOLS_BY_DOMAIN = (Object.keys(TOOL_DOMAINS) as ToolDomain[]).map((domain) => ({
  domain,
  ...TOOL_DOMAINS[domain],
  tools: TOOLS.filter((tool) => tool.domain === domain),
}));

export function findTool(id: string): ToolEntry | undefined {
  return TOOLS.find((tool) => tool.id === id);
}

/** Leçons puis laboratoires publiés qui préparent à l'outil. */
export function preparation(tool: ToolEntry): ToolLink[] {
  return [
    ...tool.lessonIds.flatMap((id) => {
      const lesson = LESSONS.find((l) => l.id === id);
      return lesson ? [{ title: lesson.title, path: `/lecons/${id}` }] : [];
    }),
    ...tool.labIds.flatMap((id) => {
      const lab = CATALOG.labs.find((l) => l.id === id);
      return lab ? [{ title: `Laboratoire : ${lab.title}`, path: `/laboratoires/${id}` }] : [];
    }),
  ];
}

/** Outils auxquels une leçon prépare (encart de la page de leçon). */
export function toolsForLesson(lessonId: string): ToolEntry[] {
  return TOOLS.filter((tool) => tool.lessonIds.includes(lessonId));
}

/** « 2026-10-30 » → « 30 octobre 2026 ». */
export function verifiedLabel(date: string): string {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00Z`),
  );
}
