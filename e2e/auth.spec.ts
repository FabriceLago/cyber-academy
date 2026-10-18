import AxeBuilder from '@axe-core/playwright';
import { Page, expect, test } from '@playwright/test';
import { PASSWORD, confirmationLink, confirmedSession, requireSupabase } from './account-helpers';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function fillForm(page: Page, fields: { name?: string; email: string; password: string }) {
  if (fields.name !== undefined) await page.getByLabel('Prénom ou pseudonyme').fill(fields.name);
  await page.getByLabel('Adresse e-mail').fill(fields.email);
  await page.getByLabel('Mot de passe', { exact: true }).fill(fields.password);
}

test('créer un compte (e-mail de confirmation), se déconnecter puis se reconnecter', async ({
  page,
}, testInfo) => {
  await requireSupabase(page);
  const email = `eleve-${Date.now()}-${testInfo.project.name}@exemple.test`;
  const confirmation = page.getByRole('heading', { name: 'Vérifiez votre boîte de réception' });

  await page.goto('/inscription');
  await fillForm(page, { name: 'Léa', email, password: PASSWORD });
  await page.getByRole('button', { name: 'Créer mon compte' }).click();
  await expect(confirmation).toBeVisible();

  // Le lien de l'e-mail ramène sur le profil, session ouverte, sans code laissé dans l'adresse.
  await page.goto(await confirmationLink(page.request, email));
  await expect(page).toHaveURL(/\/profil$/);
  const account = page.getByRole('region', { name: 'Compte' });
  await expect(account).toContainText(`Session ouverte avec l’adresse ${email}, au nom de Léa.`);
  await expect(page.getByRole('banner').getByRole('link', { name: 'Léa' })).toBeVisible();
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(violations, 'profil avec une session ouverte').toEqual([]);

  await account.getByRole('button', { name: 'Se déconnecter' }).click();
  await expect(account.getByRole('link', { name: 'Se connecter' })).toBeVisible();
  await expect(page.getByRole('banner').getByRole('link', { name: 'Se connecter' })).toBeVisible();

  // Une adresse déjà inscrite reçoit exactement la même réponse qu'une nouvelle : l'inscription
  // ne permet pas de savoir qui a un compte (énumération).
  await page.goto('/inscription');
  await fillForm(page, { name: 'Léa', email, password: PASSWORD });
  await page.getByRole('button', { name: 'Créer mon compte' }).click();
  await expect(confirmation).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);

  await page.goto('/connexion');
  await fillForm(page, { email, password: 'mauvais mot de passe' });
  await page.getByRole('button', { name: 'Se connecter' }).click();
  const alert = page.getByRole('alert');
  await expect(alert).toContainText('Adresse e-mail ou mot de passe incorrect.');
  await expect(alert).toBeFocused();

  await page.getByLabel('Mot de passe', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).toHaveURL(/\/profil$/);
  await expect(account).toContainText(`Session ouverte avec l’adresse ${email}`);
});

test('un formulaire incomplet est expliqué, champ par champ', async ({ page }) => {
  await page.goto('/inscription');
  await page.getByRole('button', { name: 'Créer mon compte' }).click();

  const alert = page.getByRole('alert');
  await expect(alert).toBeFocused();
  await expect(alert.getByRole('listitem')).toHaveCount(3);
  await alert.getByRole('link', { name: /adresse e-mail valide/ }).click();

  const email = page.getByLabel('Adresse e-mail');
  await expect(email).toBeFocused();
  await expect(email).toHaveAttribute('aria-invalid', 'true');
  await expect(email).toHaveAccessibleDescription(/adresse e-mail valide/);

  await page.getByLabel('Afficher le mot de passe').check();
  await expect(page.getByLabel('Mot de passe', { exact: true })).toHaveAttribute('type', 'text');
});

test('un lien contenant les jetons d’un autre compte n’ouvre aucune session (connexion forcée)', async ({
  page,
}) => {
  await requireSupabase(page);
  // L'attaquant prend les jetons de son propre compte et les glisse dans un lien qui imite le
  // retour d'un e-mail de confirmation, puis l'envoie à sa victime.
  const attacker = await confirmedSession(page.request, 'attaquant');
  const fragment = new URLSearchParams({
    access_token: attacker.access_token,
    refresh_token: attacker.refresh_token,
    expires_in: String(attacker.expires_in),
    expires_at: String(attacker.expires_at),
    token_type: 'bearer',
    type: 'signup',
  });

  await page.goto(`/profil#${fragment}`);
  // Laisse au client le temps de traiter l'adresse : en flux implicite, la session pirate
  // s'ouvrait à ce moment-là (vérifié par mutation).
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  const account = page.getByRole('region', { name: 'Compte' });
  await expect(account.getByRole('link', { name: 'Se connecter' })).toBeVisible();
  await expect(account).not.toContainText(attacker.email);
  await expect(page.getByRole('banner').getByRole('link', { name: 'Se connecter' })).toBeVisible();
});
