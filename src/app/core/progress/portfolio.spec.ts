import { CATALOG, findPath } from '../../content/catalog';
import { LearningPath } from '../models/content.model';
import { ProgressState } from '../models/progress.model';
import { EMPTY_DRAFT, parseDraft, portfolioMarkdown } from './portfolio';
import { summarizeProgress } from './progress';
import { EMPTY_PROGRESS } from './progress.store';

const SOC = findPath('analyste-soc-junior') as LearningPath;
const IDS = ['q1', 'q2', 'q3', 'q4', 'q5'];
const DATE = new Date('2026-10-17T12:00:00.000Z');

const markdown = (state: ProgressState, report = '', checked: string[] = []) =>
  portfolioMarkdown({
    path: SOC,
    summary: summarizeProgress(CATALOG, state, DATE),
    report,
    checked,
    learner: 'Léa',
    date: DATE,
  });

describe('portfolio exportable', () => {
  it('dit honnêtement quand rien n’est encore validé', () => {
    const text = markdown(EMPTY_PROGRESS);
    expect(text).toContain('# Portfolio Cyber Academy : Léa');
    expect(text).toContain('Spécialisation : Analyste SOC junior');
    expect(text).toContain('Exporté le 17 octobre 2026.');
    expect(text).toContain('elles ne remplacent pas une expérience professionnelle');
    expect(text).toContain('_Aucune leçon validée pour l’instant._');
    expect(text).toContain('_Rapport pas encore rédigé._');
  });

  it('reprend les leçons validées, le rapport et l’auto-évaluation', () => {
    const state: ProgressState = {
      ...EMPTY_PROGRESS,
      quizAttempts: [
        {
          lessonId: 'ordinateur-et-fichiers',
          submittedAt: '2026-10-16T10:00:00.000Z',
          questionIds: IDS,
          correctQuestionIds: IDS,
        },
      ],
    };
    const [first, second] = SOC.career?.finalProject.criteria ?? [];
    const text = markdown(state, 'Résumé : force brute réussie sur le VPN.', [first]);
    expect(text).toContain(
      '- Comprendre un ordinateur, ses fichiers et ses dossiers (Découverte de la cybersécurité)',
    );
    expect(text).toContain('Résumé : force brute réussie sur le VPN.');
    expect(text).toContain(`- [x] ${first}`);
    expect(text).toContain(`- [ ] ${second}`);
  });
});

describe('brouillon du projet final', () => {
  const criteria = ['A', 'B'];

  it('relit un brouillon valide et ignore les critères inconnus', () => {
    const raw = JSON.stringify({ report: 'Mon rapport', checked: ['B', 'inconnu'] });
    expect(parseDraft(raw, criteria)).toEqual({ report: 'Mon rapport', checked: ['B'] });
  });

  it('rejette un brouillon absent, illisible ou de mauvaise forme', () => {
    for (const raw of [null, '{', '42', '[]', JSON.stringify({ report: 3, checked: 'A' })])
      expect(parseDraft(raw, criteria), String(raw)).toEqual(EMPTY_DRAFT);
  });
});
