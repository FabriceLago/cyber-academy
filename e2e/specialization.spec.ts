import AxeBuilder from '@axe-core/playwright';
import { Page, expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { findLesson, findPath } from '../src/app/content/catalog';
import { LOGS_LAB } from '../src/app/content/labs/lab-journaux';
import { PHISHING_LAB } from '../src/app/content/labs/lab-phishing';
import { TERMINAL_LAB } from '../src/app/content/labs/lab-terminal';
import { learnerAccount, requireSupabase } from './account-helpers';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const SOC = '/parcours/analyste-soc-junior';
const FIRST_LESSON = 'Le SOC et les journaux de sécurité';
const ATTACKER = '203.0.113.77';
const DECOUVERTE = (findPath('decouverte')?.modules ?? []).flatMap((m) =>
  m.lessons.map((l) => l.id),
);

/** Quiz réussis à 100 % : le parcours Découverte, plus ces leçons. */
function passedQuizzes(extra: string[] = []) {
  return [...DECOUVERTE, ...extra].map((lessonId) => ({
    lessonId,
    questionIds: (findLesson(lessonId)?.lesson.quiz.questions ?? []).slice(0, 5).map((q) => q.id),
  }));
}
const DECOUVERTE_LABS = [TERMINAL_LAB.id, PHISHING_LAB.id];

/** Sans compte : parcours Découverte terminé dans ce navigateur (quiz à 100 %, laboratoires réussis). */
async function seedCompleted(page: Page, extra: string[] = []) {
  const now = new Date().toISOString();
  const quizAttempts = passedQuizzes(extra).map((q) => ({
    ...q,
    submittedAt: now,
    correctQuestionIds: q.questionIds,
  }));
  const labAttempts = DECOUVERTE_LABS.map((labId) => ({
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

test('sans abonnement, la spécialisation présente l’offre au lieu de ses leçons', async ({
  page,
}) => {
  // Première leçon validée dans ce navigateur : le laboratoire de la suivante est accessible.
  await seedCompleted(page, ['soc-et-journaux']);

  // Vitrine : la fiche métier reste lisible ; projet final et entretiens sont réservés.
  await page.goto(SOC);
  await expect(page.getByRole('heading', { name: /^Le métier :/ })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Projet final et préparation aux entretiens' }),
  ).toBeVisible();
  await expect(page.getByLabel('Votre rapport')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Préparer les entretiens' })).toHaveCount(0);
  await page.goto('/projets');
  await expect(page.getByText('Réservé aux abonnés')).toBeVisible();
  await expect(page.getByRole('link', { name: /^Ouvrir le projet/ })).toHaveCount(0);

  await page.goto(`/lecons/soc-et-journaux`);
  await expect(page.getByRole('heading', { name: 'Réservé aux abonnés' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sommaire' })).toHaveCount(0);
  await page.goto(`/laboratoires/${LOGS_LAB.id}`);
  await expect(page.getByRole('heading', { name: 'Réservé aux abonnés' })).toBeVisible();
  await expect(page.getByRole('table')).toHaveCount(0);

  await page.getByRole('link', { name: 'Voir l’abonnement' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Abonnement Premium');
  // Sans compte, on propose d'en créer un ; aucune formule ne s'achète sans compte.
  await expect(page.getByRole('link', { name: 'Créer un compte' }).last()).toBeVisible();
  await expect(page.getByRole('button', { name: /^Choisir/ })).toHaveCount(0);
  await audit(page, 'page abonnement');
});

test('abonné, le parcours Découverte terminé ouvre la spécialisation', async ({ page }) => {
  await requireSupabase(page);
  await learnerAccount(page, { quizzes: passedQuizzes(), labs: DECOUVERTE_LABS });
  await page.goto(SOC);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Analyste SOC junior');
  await expect(page.getByRole('heading', { name: 'Spécialisation verrouillée' })).toHaveCount(0);
  await page.getByRole('link', { name: FIRST_LESSON }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(FIRST_LESSON);
});

test('abonné, la page Projets mène au projet final, affiché sous la barre du haut', async ({
  page,
}) => {
  await requireSupabase(page);
  test.setTimeout(60_000); // Création du compte et connexion.
  await learnerAccount(page, {});
  await page.goto('/projets');
  await expect(page.getByText('Pas encore commencé')).toBeVisible();
  await page.getByRole('link', { name: /^Ouvrir le projet/ }).click();
  await expect(page).toHaveURL(new RegExp(`${SOC}#projet$`));
  const title = page.getByRole('heading', { name: /^Projet final :/ });
  await expect(title).toBeInViewport();
  // Le titre n'est pas caché sous la barre fixe (défilement d'ancre décalé).
  await expect
    .poll(() =>
      title.evaluate(
        (el) =>
          el.getBoundingClientRect().top -
          (document.querySelector('.topbar')?.getBoundingClientRect().bottom ?? 0),
      ),
    )
    .toBeGreaterThanOrEqual(0);
});

test('le laboratoire de journaux se filtre puis se résout jusqu’au verdict', async ({ page }) => {
  await requireSupabase(page);
  // Création du compte et connexion, puis le laboratoire et ses audits : plus long qu'à l'ordinaire.
  test.setTimeout(60_000);
  await learnerAccount(page, {
    quizzes: passedQuizzes(['soc-et-journaux']),
    labs: DECOUVERTE_LABS,
  });
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

test('abonné : brouillon gardé, attendus après réponse, portfolio exporté', async ({ page }) => {
  await requireSupabase(page);
  test.setTimeout(60_000); // Création du compte et connexion, puis audits dans les deux thèmes.
  await learnerAccount(page, {});
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
