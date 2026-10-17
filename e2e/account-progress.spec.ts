import AxeBuilder from '@axe-core/playwright';
import { Page, expect, test } from '@playwright/test';
import { requireSupabase, signIn, signUp } from './account-helpers';
import { answerAll } from './quiz-helpers';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const IDS = ['q1', 'q2', 'q3', 'q4', 'q5'];

async function solveTerminalLab(page: Page) {
  const input = page.getByLabel(/Commande à exécuter/);
  for (const command of [
    'cd Documents/incidents',
    'cat rapport-incident.txt',
    'cd ~',
    'mkdir enquete',
    'cd enquete',
    'touch indices.txt',
  ]) {
    await input.fill(command);
    await input.press('Enter');
    await expect(input).toHaveValue('');
  }
}

test('la progression suit le compte : vérifiée par le serveur, retrouvée après reconnexion', async ({
  page,
}, testInfo) => {
  await requireSupabase(page);
  // Une tentative réussie, faite sans compte dans ce navigateur.
  await page.addInitScript(
    (value) => {
      if (!sessionStorage.getItem('seeded')) {
        localStorage.setItem('ca-progress', value);
        sessionStorage.setItem('seeded', '1');
      }
    },
    JSON.stringify({
      schemaVersion: 1,
      weeklyGoal: null,
      labAttempts: [],
      quizAttempts: [
        {
          lessonId: 'ordinateur-et-fichiers',
          submittedAt: new Date().toISOString(),
          questionIds: IDS,
          correctQuestionIds: IDS,
        },
      ],
    }),
  );
  const email = `progression-${Date.now()}-${testInfo.project.name}@exemple.test`;
  await signUp(page, email);

  // Elle n'est pas reprise par le compte : le serveur ne l'a pas vérifiée.
  await expect(page.getByText(/Ce navigateur garde aussi 1 tentative/)).toBeVisible();
  await page.goto('/');
  await expect(page.getByText('Leçons validées : 0 sur 7', { exact: true })).toBeVisible();
  await expect(page.getByText('Points d’expérience')).toBeVisible();

  // Quiz réussi avec le compte : corrigé et enregistré par le serveur.
  await page.goto('/lecons/ordinateur-et-fichiers/quiz');
  await answerAll(page, true);
  await page.getByRole('button', { name: 'Envoyer mes réponses' }).click();
  await expect(page.getByRole('heading', { name: 'Résultat : 100 %' })).toBeFocused();
  await expect(page.getByText('La leçon est validée.')).toBeVisible();

  // Laboratoire du terminal, sans indice : il apparaît dans l'historique, même après rechargement.
  await page.goto('/laboratoires/lab-terminal');
  await solveTerminalLab(page);
  await expect(page.getByRole('heading', { level: 2, name: 'Laboratoire réussi' })).toBeVisible();
  const history = page.getByRole('region', { name: 'Historique' });
  await expect(history.getByRole('cell', { name: 'Réussi', exact: true })).toHaveCount(1);
  await page.reload();
  await expect(history.getByRole('cell', { name: 'Réussi', exact: true })).toHaveCount(1);

  // Points et badges, calculés à partir des tentatives du compte.
  await page.goto('/competences');
  await expect(page.getByText('325 points d’expérience')).toBeVisible();
  for (const badge of ['Premier pas', 'Sans faute', 'Premier laboratoire', 'Sans indice']) {
    const item = page.getByRole('listitem').filter({ has: page.getByText(badge, { exact: true }) });
    await expect(item).toContainText('Obtenu');
  }
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(violations, 'points et badges').toEqual([]);

  // Déconnecté : la progression du navigateur revient, sans points.
  await page.goto('/profil');
  await page
    .getByRole('region', { name: 'Compte' })
    .getByRole('button', { name: 'Se déconnecter' })
    .click();
  await page.goto('/competences');
  await expect(page.getByText(/réservés aux comptes/)).toBeVisible();
  await expect(page.getByText('325 points d’expérience')).toHaveCount(0);

  // Reconnecté : la progression du compte est retrouvée.
  await signIn(page, email);
  await page.goto('/competences');
  await expect(page.getByText('325 points d’expérience')).toBeVisible();
});
