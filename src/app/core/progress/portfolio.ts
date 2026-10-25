import { PathOutline } from '../models/content.model';
import { ProgressSummary } from './progress';

export interface PortfolioInput {
  readonly path: PathOutline;
  readonly summary: ProgressSummary;
  /** Rapport du projet final, rédigé par l'apprenant. */
  readonly report: string;
  /** Critères d'évaluation que l'apprenant estime remplis. */
  readonly checked: readonly string[];
  readonly learner: string | null;
  readonly date: Date;
}

/**
 * Portfolio exportable, en Markdown : ce que l'apprenant a validé, puis son projet final et son
 * auto-évaluation. Il précise que ces compétences viennent d'exercices simulés.
 */
export function portfolioMarkdown(input: PortfolioInput): string {
  const { path, summary } = input;
  const list = (items: readonly string[], empty: string) =>
    items.length > 0 ? items.map((item) => `- ${item}`) : [`_${empty}_`];
  const project = path.career?.finalProject;
  const date = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(input.date);

  return [
    `# Portfolio Cyber Academy${input.learner ? ` : ${input.learner}` : ''}`,
    '',
    `Spécialisation : ${path.title}`,
    '',
    `Exporté le ${date}.`,
    '',
    '> Compétences démontrées dans des exercices pédagogiques simulés, sur des données fictives : elles ne remplacent pas une expérience professionnelle.',
    '',
    '## Leçons validées',
    '',
    ...list(
      summary.lessons
        .filter((l) => l.status === 'completed')
        .map((l) => `${l.lesson.title} (${l.path.title})`),
      'Aucune leçon validée pour l’instant.',
    ),
    '',
    '## Laboratoires réussis',
    '',
    ...list(
      summary.labs.filter((l) => l.completed).map((l) => l.lab.title),
      'Aucun laboratoire réussi pour l’instant.',
    ),
    '',
    '## Compétences acquises',
    '',
    ...list(
      summary.skills
        .filter((s) => s.acquired)
        .map((s) => `${s.skill.title} : ${s.skill.description}`),
      'Aucune compétence acquise pour l’instant.',
    ),
    ...(project
      ? [
          '',
          `## Projet final : ${project.title}`,
          '',
          input.report.trim() || '_Rapport pas encore rédigé._',
          '',
          '### Auto-évaluation',
          '',
          ...project.criteria.map((c) => `- [${input.checked.includes(c) ? 'x' : ' '}] ${c}`),
        ]
      : []),
    '',
  ].join('\n');
}

/** Brouillon du projet final, gardé dans le navigateur. */
export interface ProjectDraft {
  readonly report: string;
  readonly checked: readonly string[];
}

export const EMPTY_DRAFT: ProjectDraft = { report: '', checked: [] };

/** Brouillon modifiable par l'utilisateur : on ne garde que ce qui a la bonne forme. */
export function parseDraft(raw: string | null, criteria: readonly string[]): ProjectDraft {
  try {
    const value: unknown = JSON.parse(raw ?? 'null');
    if (typeof value !== 'object' || value === null) return EMPTY_DRAFT;
    const { report, checked } = value as Record<string, unknown>;
    return {
      report: typeof report === 'string' ? report : '',
      checked: Array.isArray(checked) ? criteria.filter((c) => checked.includes(c)) : [],
    };
  } catch {
    return EMPTY_DRAFT;
  }
}
