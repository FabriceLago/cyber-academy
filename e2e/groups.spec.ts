import AxeBuilder from '@axe-core/playwright';
import { Page, expect, test } from '@playwright/test';
import { findLesson } from '../src/app/content/catalog';
import { confirmedSession, learnerAccount, requireSupabase, signIn } from './account-helpers';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const FIRST_LESSON = 'ordinateur-et-fichiers';

/** axe dans les deux thèmes (la page est rechargée), et pas de défilement horizontal de la page. */
async function audit(page: Page, label: string) {
  for (const colorScheme of ['dark', 'light'] as const) {
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

async function signOut(page: Page) {
  await page.goto('/profil');
  await page.getByRole('button', { name: 'Se déconnecter' }).click();
  await expect(page.getByRole('link', { name: 'Se connecter' }).last()).toBeVisible();
}

test('sans compte, le lien d’invitation garde le code et propose de se connecter', async ({
  page,
}) => {
  await page.goto('/groupes?code=ABCDE-FGHJK');
  await expect(page.getByRole('heading', { name: 'Un compte est nécessaire' })).toBeVisible();
  await expect(page.getByText('ABCDE-FGHJK')).toBeVisible();
  await expect(page.getByLabel('Code du groupe')).toHaveCount(0);
});

test('une responsable crée un groupe, un élève le rejoint par le lien, elle suit sa progression', async ({
  page,
}) => {
  test.setTimeout(120_000); // Deux comptes, trois connexions, deux audits dans les deux thèmes.
  await requireSupabase(page);
  const teacher = await confirmedSession(page.request, 'responsable');
  await signIn(page, teacher.email);

  // La responsable crée le groupe et lit son code.
  await page.goto('/groupes');
  await page.getByLabel('Nom du nouveau groupe').fill('Club cyber du lycée');
  await page.getByRole('button', { name: 'Créer le groupe' }).click();
  await page.getByRole('link', { name: 'Club cyber du lycée' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Club cyber du lycée');
  const groupUrl = page.url();
  const code = ((await page.locator('.code').textContent()) ?? '').trim();
  expect(code).toMatch(/^[A-HJ-NP-Z2-9]{10}$/);
  await expect(page.getByText('Personne n’a encore rejoint ce groupe.')).toBeVisible();
  await signOut(page);

  // L'élève, qui a validé une leçon, rejoint le groupe par le lien (code en minuscules).
  const questionIds = (findLesson(FIRST_LESSON)?.lesson.quiz.questions ?? [])
    .slice(0, 5)
    .map((q) => q.id);
  await learnerAccount(page, {
    subscribed: false,
    quizzes: [{ lessonId: FIRST_LESSON, questionIds }],
  });
  await page.goto(`/groupes?code=${code.toLowerCase()}`);
  await expect(page.getByLabel('Code du groupe')).toHaveValue(code.toLowerCase());
  const join = page.getByRole('button', { name: 'Rejoindre le groupe' });
  await expect(join).toBeDisabled();
  await page.getByLabel(/J’ai 15 ans ou plus/).check();
  await join.click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Vous avez rejoint le groupe.' }),
  ).toBeVisible();
  const mine = page.getByRole('region', { name: 'Mes groupes' });
  await expect(mine.getByText('Club cyber du lycée')).toBeVisible();
  await audit(page, 'page Groupes');
  await signOut(page);

  // La responsable voit le pseudonyme et la leçon validée, puis retire l'élève.
  await signIn(page, teacher.email);
  await page.goto(groupUrl);
  const row = page.getByRole('row').filter({ has: page.getByRole('rowheader') });
  await expect(row).toHaveCount(1);
  await expect(row.getByRole('cell').first()).toHaveText(/^1 \/ \d+$/);
  await audit(page, 'page de suivi du groupe');
  await row.getByRole('button', { name: /^Retirer / }).click();
  await expect(page.getByText('Personne n’a encore rejoint ce groupe.')).toBeVisible();
});
