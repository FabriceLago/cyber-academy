import { Page, expect, test } from '@playwright/test';
import { environment } from '../src/environments/environment';

export const PASSWORD = 'une phrase de passe solide';

/** Les parcours de compte ont besoin de Supabase local (npm run db:start) ; sinon, ignorés. */
export async function requireSupabase(page: Page) {
  const response = await page.request
    .get(`${environment.supabaseUrl}/auth/v1/health`, {
      headers: { apikey: environment.supabasePublishableKey },
    })
    .catch(() => null);
  test.skip(!response?.ok(), 'Supabase local arrêté : lancez « npm run db:start ».');
}

/** Crée un compte (adresse unique, domaine réservé .test) ; la page arrive sur le profil. */
export async function signUp(page: Page, email: string) {
  await page.goto('/inscription');
  await page.getByLabel('Prénom ou pseudonyme').fill('Léa');
  await page.getByLabel('Adresse e-mail').fill(email);
  await page.getByLabel('Mot de passe', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Créer mon compte' }).click();
  await expect(page).toHaveURL(/\/profil$/);
}

export async function signIn(page: Page, email: string) {
  await page.goto('/connexion');
  await page.getByLabel('Adresse e-mail').fill(email);
  await page.getByLabel('Mot de passe', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).toHaveURL(/\/profil$/);
}
