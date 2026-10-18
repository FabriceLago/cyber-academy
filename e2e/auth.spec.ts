import AxeBuilder from '@axe-core/playwright';
import { Page, expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { environment } from '../src/environments/environment';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const PASSWORD = 'une phrase de passe solide';

/** Les parcours de compte ont besoin de Supabase local (npm run db:start) ; sinon, ignorés. */
async function requireSupabase(page: Page) {
  const response = await page.request
    .get(`${environment.supabaseUrl}/auth/v1/health`, {
      headers: { apikey: environment.supabasePublishableKey },
    })
    .catch(() => null);
  test.skip(!response?.ok(), 'Supabase local arrêté : lancez « npm run db:start ».');
}

async function fillForm(page: Page, fields: { name?: string; email: string; password: string }) {
  if (fields.name !== undefined) await page.getByLabel('Prénom ou pseudonyme').fill(fields.name);
  await page.getByLabel('Adresse e-mail').fill(fields.email);
  await page.getByLabel('Mot de passe', { exact: true }).fill(fields.password);
}

test('créer un compte, se déconnecter puis se reconnecter', async ({ page }, testInfo) => {
  await requireSupabase(page);
  const email = `eleve-${Date.now()}-${testInfo.project.name}@exemple.test`;

  await page.goto('/inscription');
  await fillForm(page, { name: 'Léa', email, password: PASSWORD });
  await page.getByRole('button', { name: 'Créer mon compte' }).click();

  await expect(page).toHaveURL(/\/profil$/);
  const account = page.getByRole('region', { name: 'Compte' });
  await expect(account).toContainText(`Session ouverte avec l’adresse ${email}, au nom de Léa.`);
  await expect(page.getByRole('banner').getByRole('link', { name: 'Léa' })).toBeVisible();
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(violations, 'profil avec une session ouverte').toEqual([]);

  await account.getByRole('button', { name: 'Se déconnecter' }).click();
  await expect(account.getByRole('link', { name: 'Se connecter' })).toBeVisible();
  await expect(page.getByRole('banner').getByRole('link', { name: 'Se connecter' })).toBeVisible();

  // La même adresse ne peut pas servir deux fois.
  await page.goto('/inscription');
  await fillForm(page, { name: 'Léa', email, password: PASSWORD });
  await page.getByRole('button', { name: 'Créer mon compte' }).click();
  await expect(page.getByRole('alert')).toContainText('Un compte existe déjà avec cette adresse');

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

/** Clé d'administration de la pile LOCALE, lue au moment du test : jamais écrite dans le dépôt. */
function localServiceKey(): string {
  try {
    const status = execFileSync(
      process.execPath,
      ['node_modules/supabase/dist/supabase.js', 'status', '-o', 'env'],
      { encoding: 'utf8' },
    );
    return /^SERVICE_ROLE_KEY="?([^"\r\n]+)"?/m.exec(status)?.[1] ?? '';
  } catch {
    return '';
  }
}

test('le lien de confirmation reçu par e-mail ouvre la session et quitte l’adresse', async ({
  page,
  baseURL,
}, testInfo) => {
  await requireSupabase(page);
  const key = localServiceKey();
  test.skip(key === '', 'Clé de la pile locale indisponible.');
  const email = `confirmation-${Date.now()}-${testInfo.project.name}@exemple.test`;

  // Le même lien que celui de l'e-mail de confirmation, demandé à l'API d'administration locale.
  const response = await page.request.post(
    `${environment.supabaseUrl}/auth/v1/admin/generate_link`,
    {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      data: {
        type: 'signup',
        email,
        password: PASSWORD,
        data: { display_name: 'Léa' },
        redirect_to: new URL('/profil', baseURL).href,
      },
    },
  );
  expect(response.ok()).toBe(true);
  const { action_link } = (await response.json()) as { action_link: string };

  await page.goto(action_link);
  await expect(page).toHaveURL(/\/profil#?$/);
  await expect(page.getByRole('region', { name: 'Compte' })).toContainText(
    `Session ouverte avec l’adresse ${email}, au nom de Léa.`,
  );
  expect(page.url()).not.toMatch(/access_token|refresh_token/);
});
