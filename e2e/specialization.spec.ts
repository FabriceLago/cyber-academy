import AxeBuilder from '@axe-core/playwright';
import { Page, expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { findLesson, findPath } from '../src/app/content/catalog';
import { LOGS_LAB } from '../src/app/content/labs/lab-journaux';
import { PHISHING_LAB } from '../src/app/content/labs/lab-phishing';
import { TERMINAL_LAB } from '../src/app/content/labs/lab-terminal';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const SOC = '/parcours/analyste-soc-junior';
const FIRST_LESSON = 'Le SOC et les journaux de sécurité';
const ATTACKER = '203.0.113.77';
const DECOUVERTE = (findPath('decouverte')?.modules ?? []).flatMap((m) =>
  m.lessons.map((l) => l.id),
);

/** Parcours Découverte terminé (quiz à 100 %, laboratoires réussis), plus ces leçons. */
async function seedCompleted(page: Page, extra: string[] = []) {
  const now = new Date().toISOString();
  const quizAttempts = [...DECOUVERTE, ...extra].map((lessonId) => {
    const ids = (findLesson(lessonId)?.lesson.quiz.questions ?? []).slice(0, 5).map((q) => q.id);
    return { lessonId, submittedAt: now, questionIds: ids, correctQuestionIds: ids };
  });
  const labAttempts = [TERMINAL_LAB.id, PHISHING_LAB.id].map((labId) => ({
    labId,
    completedAt: now,
    succeeded: true,
    hintsUsed: 0,
  }));
  await page.addInitScript(
    (value) => {
      if (!sessionStorage.getItem('seeded')) {
        localStorage.setItem('ca-progress', value);
        sessionStorage.setItem('seeded', '1');
      }
    },
    JSON.stringify({ schemaVersion: 1, weeklyGoal: null, labAttempts, quizAttempts }),
  );
}

/** axe dans les deux thèmes (la page est rechargée), et pas de défilement horizontal de la page (WCAG 1.4.10). */
async function audit(page: Page, label: string) {
  for (const colorScheme of ['dark', 'light'] as const) {
    // Page rechargée dans le thème : sinon axe peut mesurer les couleurs pendant la transition.
    await page.emulateMedia({ colorScheme });
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(violations, `${label}, thème ${colorScheme}`).toEqual([]);
  }
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, `défilement horizontal : ${label}`).toBeLessThanOrEqual(0);
}

test('la spécialisation reste verrouillée tant que le parcours Découverte n’est pas terminé', async ({
  page,
}) => {
  await page.goto('/parcours');
  const specialties = page.getByRole('region', { name: 'Spécialisations' });
  await expect(specialties.getByRole('link', { name: 'Analyste SOC junior' })).toBeVisible();
  await expect(specialties).toContainText('Verrouillée tant que le parcours prérequis');
  await expect(specialties).toContainText('Pentester junior');

  await specialties.getByRole('link', { name: 'Analyste SOC junior' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Analyste SOC junior');
  await expect(page.getByRole('heading', { name: 'Spécialisation verrouillée' })).toBeVisible();
  await expect(page.getByText(`${DECOUVERTE.length} leçons à valider`)).toBeVisible();
  await expect(page.getByRole('link', { name: FIRST_LESSON })).toHaveCount(0);

  await page.goto(`/laboratoires/${LOGS_LAB.id}`);
  await expect(page.getByRole('heading', { name: 'Laboratoire verrouillé' })).toBeVisible();
  await expect(page.getByRole('table')).toHaveCount(0);
});

test('le parcours Découverte terminé ouvre la spécialisation', async ({ page }) => {
  await seedCompleted(page);
  await page.goto(SOC);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Analyste SOC junior');
  await expect(page.getByRole('heading', { name: 'Spécialisation verrouillée' })).toHaveCount(0);
  await page.getByRole('link', { name: FIRST_LESSON }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(FIRST_LESSON);
});

test('le laboratoire de journaux se filtre puis se résout jusqu’au verdict', async ({ page }) => {
  await seedCompleted(page, ['soc-et-journaux']);
  await page.goto(`/laboratoires/${LOGS_LAB.id}`);
  await expect(page.getByRole('heading', { level: 1, name: LOGS_LAB.title })).toBeVisible();
  const total = LOGS_LAB.entries.length;
  const count = page.getByRole('status').filter({ hasText: /ligne\(s\) sur/ });
  await expect(count).toHaveText(`${total} ligne(s) sur ${total}`);

  await page.getByLabel('Événement').selectOption('Échec de connexion');
  await page.getByLabel('Adresse IP').selectOption(ATTACKER);
  const failures = LOGS_LAB.entries.filter(
    (e) => e.event === 'Échec de connexion' && e.ip === ATTACKER,
  ).length;
  await expect(count).toHaveText(`${failures} ligne(s) sur ${total}`);
  await expect(page.getByRole('cell', { name: 'Connexion réussie' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Effacer les filtres' }).click();
  await page.getByLabel('Rechercher').fill('export');
  await expect(page.getByRole('cell', { name: 'Export de fichiers' })).toBeVisible();

  await audit(page, 'laboratoire de journaux');

  // Envoi incomplet : refusé, avec le nombre de questions restantes.
  await page.getByRole('button', { name: 'Valider mes conclusions' }).click();
  await expect(page.getByRole('alert')).toContainText(
    `Il reste ${LOGS_LAB.questions.length} question(s) sans réponse`,
  );

  for (const question of LOGS_LAB.questions) {
    await page
      .getByRole('group')
      .filter({ hasText: question.prompt })
      .getByLabel(question.answer, { exact: true })
      .check();
  }
  await page.getByRole('button', { name: 'Valider mes conclusions' }).click();
  await expect(page.getByRole('heading', { name: 'Laboratoire réussi' })).toBeFocused();
  const n = LOGS_LAB.questions.length;
  await expect(page.getByText(`Conclusions justes : ${n} sur ${n}.`)).toBeVisible();
});

test('spécialisation : brouillon gardé, attendus après réponse, portfolio exporté', async ({
  page,
}) => {
  const [criterion] = findPath('analyste-soc-junior')?.career?.finalProject.criteria ?? [];
  const report = 'Résumé : force brute réussie sur le VPN.';
  await page.goto(SOC);
  await expect(page.getByRole('heading', { name: /^Projet final/ })).toBeVisible();

  await page.getByLabel('Votre rapport').fill(report);
  await page.getByLabel(criterion, { exact: true }).check();
  await page.reload();
  await expect(page.getByLabel('Votre rapport')).toHaveValue(report);
  await expect(page.getByLabel(criterion, { exact: true })).toBeChecked();

  // Les éléments attendus restent cachés tant qu'aucune réponse n'est écrite.
  const first = page.getByRole('article').first();
  await expect(page.getByRole('heading', { name: 'Éléments attendus' })).toHaveCount(0);
  await first.getByRole('button', { name: 'Comparer avec les éléments attendus' }).click();
  await expect(first.getByRole('alert')).toContainText('Écrivez d’abord votre réponse');
  await expect(first.getByRole('heading', { name: 'Éléments attendus' })).toHaveCount(0);
  await first.getByRole('textbox').fill('Un faux positif est une alerte sans menace réelle.');
  await first.getByRole('button', { name: 'Comparer avec les éléments attendus' }).click();
  await expect(first.getByRole('heading', { name: 'Éléments attendus' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Éléments attendus' })).toHaveCount(1);

  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exporter mon portfolio (Markdown)' }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe('portfolio-analyste-soc-junior.md');
  const text = await readFile(await download.path(), 'utf8');
  expect(text).toContain('Spécialisation : Analyste SOC junior');
  expect(text).toContain('elles ne remplacent pas une expérience professionnelle');
  expect(text).toContain(report);
  expect(text).toContain(`- [x] ${criterion}`);
  await expect(page.getByRole('status').filter({ hasText: 'téléchargé' })).toBeVisible();

  await audit(page, 'page de spécialisation');
});
