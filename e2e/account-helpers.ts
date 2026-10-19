import { APIRequestContext, Page, expect, test } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { environment } from '../src/environments/environment';

export const PASSWORD = 'une phrase de passe solide';

/** Boîte de réception de test de la pile locale (Mailpit) : aucun e-mail ne part réellement. */
const MAILPIT = 'http://127.0.0.1:54624';

/** Les parcours de compte ont besoin de Supabase local (npm run db:start) ; sinon, ignorés. */
export async function requireSupabase(page: Page) {
  const response = await page.request
    .get(`${environment.supabaseUrl}/auth/v1/health`, {
      headers: { apikey: environment.supabasePublishableKey },
    })
    .catch(() => null);
  test.skip(!response?.ok(), 'Supabase local arrêté : lancez « npm run db:start ».');
}

/**
 * Lien du dernier e-mail reçu par cette adresse (confirmation par défaut). `subject` filtre les
 * messages (« Reset » : réinitialisation) ; `count` attend qu'il y en ait au moins autant
 * (un message renvoyé).
 */
export async function confirmationLink(
  request: APIRequestContext,
  email: string,
  { subject = '', count = 1 }: { subject?: string; count?: number } = {},
) {
  let link = '';
  const query = `to:"${email}"${subject ? ` subject:"${subject}"` : ''}`;
  await expect
    .poll(
      async () => {
        const search = await request.get(
          `${MAILPIT}/api/v1/search?query=${encodeURIComponent(query)}`,
        );
        const { messages } = (await search.json()) as { messages?: { ID: string }[] };
        if (!messages || messages.length < count) return '';
        const message = await request.get(`${MAILPIT}/api/v1/message/${messages[0].ID}`);
        const { Text } = (await message.json()) as { Text: string };
        link = /https?:\/\/\S+\/auth\/v1\/verify\?[^\s)\]]+/.exec(Text)?.[0] ?? '';
        return link;
      },
      { message: `e-mail de confirmation pour ${email}`, timeout: 15_000 },
    )
    .not.toBe('');
  return link.replaceAll('&amp;', '&');
}

/**
 * Crée un compte comme un vrai apprenant : formulaire, e-mail de confirmation, lien.
 * La page arrive sur le profil, session ouverte.
 */
export async function signUp(page: Page, email: string) {
  await page.goto('/inscription');
  await page.getByLabel('Prénom ou pseudonyme').fill('Léa');
  await page.getByLabel('Adresse e-mail').fill(email);
  await page.getByLabel('Mot de passe', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Créer mon compte' }).click();
  await expect(
    page.getByRole('heading', { name: 'Vérifiez votre boîte de réception' }),
  ).toBeVisible();
  await page.goto(await confirmationLink(page.request, email));
  await expect(page).toHaveURL(/\/profil$/);
  await expect(page.getByRole('region', { name: 'Compte' })).toContainText(
    `Session ouverte avec l’adresse ${email}`,
  );
}

export async function signIn(page: Page, email: string) {
  await page.goto('/connexion');
  await page.getByLabel('Adresse e-mail').fill(email);
  await page.getByLabel('Mot de passe', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).toHaveURL(/\/profil$/);
}

/** Clé d'administration de la pile LOCALE, lue au moment du test : jamais écrite dans le dépôt. */
export function localServiceKey(): string {
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

export interface ApiSession {
  readonly email: string;
  readonly access_token: string;
  readonly refresh_token: string;
  readonly expires_in: number;
  readonly expires_at: number;
}

/** Compte confirmé créé par l'API d'administration locale, puis connecté : ses jetons. */
export async function confirmedSession(
  request: APIRequestContext,
  prefix: string,
): Promise<ApiSession> {
  const key = localServiceKey();
  test.skip(key === '', 'Clé de la pile locale indisponible.');
  const email = `${prefix}-${Date.now()}-${test.info().project.name}@exemple.test`;
  const created = await request.post(`${environment.supabaseUrl}/auth/v1/admin/users`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    data: { email, password: PASSWORD, email_confirm: true },
  });
  expect(created.ok()).toBe(true);
  const response = await request.post(
    `${environment.supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      headers: { apikey: environment.supabasePublishableKey },
      data: { email, password: PASSWORD },
    },
  );
  expect(response.ok()).toBe(true);
  return { email, ...((await response.json()) as Omit<ApiSession, 'email'>) };
}
