import AxeBuilder from '@axe-core/playwright';
import { Page, expect, test } from '@playwright/test';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const FIVE = ['a', 'b', 'c', 'd', 'e'];
/** Quelques secondes avant maintenant : reste dans la semaine en cours. */
const secondsAgo = (seconds: number) => new Date(Date.now() - seconds * 1000).toISOString();

/** Données de test : leçon 1 réussie (100 %) après un échec, leçon 2 tentée (40 %), objectif 2. */
const IN_PROGRESS = JSON.stringify({
  schemaVersion: 1,
  weeklyGoal: 2,
  labAttempts: [],
  quizAttempts: [
    {
      lessonId: 'ordinateur-et-fichiers',
      submittedAt: secondsAgo(3),
      questionIds: FIVE,
      correctQuestionIds: FIVE.slice(0, 3),
    },
    {
      lessonId: 'ordinateur-et-fichiers',
      submittedAt: secondsAgo(2),
      questionIds: FIVE,
      correctQuestionIds: FIVE,
    },
    {
      lessonId: 'decouvrir-le-terminal',
      submittedAt: secondsAgo(1),
      questionIds: FIVE,
      correctQuestionIds: FIVE.slice(0, 2),
    },
  ],
});

/** Place une progression dans le navigateur avant le chargement de l'application. */
async function seed(page: Page, raw: string) {
  await page.addInitScript((value) => localStorage.setItem('ca-progress', value), raw);
}

const nextLesson = (page: Page) => page.locator('#next-title');

test('un nouvel apprenant voit la première leçon et des états vides expliqués', async ({
  page,
}) => {
  await page.goto('/');
  await expect(nextLesson(page)).toHaveText(
    'Comprendre un ordinateur, ses fichiers et ses dossiers',
  );
  await expect(page.getByRole('progressbar', { name: 'Progression globale' })).toHaveAttribute(
    'aria-valuenow',
    '0',
  );
  await expect(page.getByText('Aucun quiz passé pour l’instant.')).toBeVisible();
  await expect(page.getByText('Verrouillée', { exact: false })).toHaveCount(4);
  await expect(page.getByText('temps de cours restant estimé : 1 h 55 min')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Commencer la leçon' })).toBeVisible();
});

test('la progression enregistrée met à jour le tableau de bord et les compétences', async ({
  page,
}) => {
  await seed(page, IN_PROGRESS);
  await page.goto('/');

  await expect(nextLesson(page)).toHaveText('Découvrir le terminal');
  await expect(
    page.getByText('réussissez son quiz et son laboratoire pour la valider'),
  ).toBeVisible();
  await expect(page.getByRole('progressbar', { name: 'Progression globale' })).toHaveAttribute(
    'aria-valuenow',
    '14',
  );

  const rows = page.getByRole('table').getByRole('row');
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(1)).toContainText('Découvrir le terminal');
  await expect(rows.nth(1)).toContainText('40 %');
  await expect(rows.nth(1)).toContainText('À retenter');
  await expect(rows.nth(2)).toContainText('100 %');
  await expect(rows.nth(2)).toContainText('Réussi');
  await expect(page.getByText('Leçons validées depuis lundi : 1 sur 2.')).toBeVisible();

  for (const colorScheme of ['dark', 'light'] as const) {
    // Page rechargée dans le thème : sinon axe peut mesurer les couleurs pendant le changement.
    await page.emulateMedia({ colorScheme });
    await page.reload();
    await expect(nextLesson(page)).toHaveText('Découvrir le terminal');
    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(violations, `tableau de bord, thème ${colorScheme}`).toEqual([]);
  }

  await page.getByRole('link', { name: 'Voir le détail' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Compétences');
  await expect(page.getByText('Compétences acquises : 1 sur 7')).toBeVisible();
  const skill = page
    .getByRole('listitem')
    .filter({ has: page.getByRole('heading', { name: 'Décrire un ordinateur' }) });
  await expect(skill).toContainText('Acquise');
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(violations, 'compétences').toEqual([]);
});

test('l’objectif hebdomadaire se règle dans le profil et s’affiche au tableau de bord', async ({
  page,
}) => {
  await page.goto('/profil');
  const goal = page.getByLabel('Leçons à valider chaque semaine');
  await goal.selectOption('3');
  await page.goto('/');
  await expect(page.getByText('Leçons validées depuis lundi : 0 sur 3.')).toBeVisible();

  await page.goto('/profil');
  await expect(goal).toHaveValue('3');
  await goal.selectOption('');
  await page.goto('/');
  await expect(page.getByText('Facultatif : fixez-vous un nombre de leçons')).toBeVisible();
});

test('les notions manquées sont proposées à la révision, avec le défi de la semaine', async ({
  page,
}) => {
  // Leçon 1 : q4 et q5, sur la mémoire vive et le stockage, sont ratées.
  const ids = ['q1', 'q2', 'q3', 'q4', 'q5'];
  await seed(
    page,
    JSON.stringify({
      schemaVersion: 1,
      weeklyGoal: null,
      labAttempts: [],
      quizAttempts: [
        {
          lessonId: 'ordinateur-et-fichiers',
          submittedAt: secondsAgo(1),
          questionIds: ids,
          correctQuestionIds: ids.slice(0, 3),
        },
      ],
    }),
  );
  await page.goto('/');

  const review = page.getByRole('region', { name: 'À réviser' });
  await expect(review).toContainText('Distinguer la mémoire vive du stockage');
  await expect(
    review.getByRole('link', { name: 'Refaire le quiz : Comprendre un ordinateur' }),
  ).toHaveAttribute('href', '/lecons/ordinateur-et-fichiers/quiz');
  // Aucune tentative ne relève encore le défi : il reste à relever, quel qu'il soit cette semaine.
  await expect(page.getByText('Défi de la semaine · facultatif')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Relever le défi' })).toBeVisible();
});

test('la progression se sauvegarde dans un fichier puis se restaure', async ({ page }) => {
  // Injectée une seule fois : la restauration ne doit pas être écrasée au rechargement.
  await page.addInitScript((value) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('ca-progress', value);
      sessionStorage.setItem('seeded', '1');
    }
  }, IN_PROGRESS);
  await page.goto('/profil');

  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Télécharger une sauvegarde' }).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toMatch(/^cyber-academy-progression-[\d-]{10}\.json$/);

  await page.getByRole('button', { name: 'Réinitialiser ma progression' }).click();
  await page.getByRole('button', { name: 'Oui, réinitialiser' }).click();
  await expect(page.getByText('Progression réinitialisée.')).toBeVisible();

  const restore = page.getByLabel('Restaurer une sauvegarde');
  await restore.setInputFiles({
    name: 'autre.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{oups'),
  });
  await expect(
    page.getByText('Ce fichier n’est pas une sauvegarde Cyber Academy lisible.'),
  ).toBeVisible();
  await restore.setInputFiles(await download.path());
  await expect(page.getByText('Le fichier contient 3 tentative(s) de quiz')).toBeVisible();
  await page.getByRole('button', { name: 'Oui, remplacer' }).click();
  await expect(page.getByText('Progression restaurée depuis le fichier.')).toBeVisible();

  await page.goto('/');
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(3);
});

test('des données de progression corrompues n’empêchent pas l’affichage', async ({ page }) => {
  await seed(page, '{"schemaVersion":1,"quizAttempts":"oups"');
  await page.goto('/');
  await expect(nextLesson(page)).toHaveText(
    'Comprendre un ordinateur, ses fichiers et ses dossiers',
  );
  await expect(page.getByRole('progressbar', { name: 'Progression globale' })).toHaveAttribute(
    'aria-valuenow',
    '0',
  );
});
