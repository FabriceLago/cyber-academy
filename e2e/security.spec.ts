import { APIRequestContext, Page, expect, test } from '@playwright/test';
import { environment } from '../src/environments/environment';
import { PASSWORD } from './account-helpers';
import { PAGES } from './pages';

const PATHS = [
  ...PAGES.map((p) => p.path),
  '/lecons/ordinateur-et-fichiers',
  '/lecons/ordinateur-et-fichiers/quiz',
  '/laboratoires/lab-terminal',
  '/parcours/analyste-soc-junior',
  '/connexion',
];

/** Relève les violations de la politique de sécurité du contenu (CSP) signalées par la page. */
async function recordViolations(page: Page) {
  await page.addInitScript(() => {
    const seen: string[] = [];
    Object.assign(window, { cspViolations: seen });
    document.addEventListener('securitypolicyviolation', (e) =>
      seen.push(`${e.effectiveDirective} ${e.blockedURI}`),
    );
  });
}
const violations = (page: Page) =>
  page.evaluate(() => (window as unknown as { cspViolations: string[] }).cspViolations);

test('la politique de sécurité du contenu est servie et ne bloque rien de légitime', async ({
  page,
}) => {
  await recordViolations(page);
  await page.goto('/');
  const policies = await page
    .locator('meta[http-equiv="Content-Security-Policy"]')
    .evaluateAll((metas) => metas.map((m) => m.getAttribute('content') ?? ''));
  expect(policies.join(' ')).toContain("'strict-dynamic'");
  expect(policies.join(' ')).toContain("object-src 'none'");
  expect(policies.join(' ')).toContain("frame-src 'none'");

  for (const path of PATHS) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await violations(page), path).toEqual([]);
  }
});

test('un script injecté dans la page est bloqué', async ({ page }) => {
  await recordViolations(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  // Attaque XSS typique : un attribut onerror glissé dans le HTML.
  await page.evaluate(() =>
    document.body.insertAdjacentHTML(
      'beforeend',
      '<img src="/introuvable.png" onerror="window.pwned = true">',
    ),
  );
  await expect.poll(() => violations(page)).toContainEqual(expect.stringMatching(/^script-src/));
  expect(await page.evaluate(() => 'pwned' in window)).toBe(false);
});

/** Compte de test créé par l'API d'authentification locale ; renvoie son jeton d'accès. */
async function apiAccount(request: APIRequestContext, prefix: string): Promise<string> {
  const health = await request
    .get(`${environment.supabaseUrl}/auth/v1/health`, {
      headers: { apikey: environment.supabasePublishableKey },
    })
    .catch(() => null);
  test.skip(!health?.ok(), 'Supabase local arrêté : lancez « npm run db:start ».');
  const response = await request.post(`${environment.supabaseUrl}/auth/v1/signup`, {
    headers: { apikey: environment.supabasePublishableKey },
    data: {
      email: `${prefix}-${Date.now()}-${test.info().project.name}@exemple.test`,
      password: PASSWORD,
    },
  });
  expect(response.ok()).toBe(true);
  return ((await response.json()) as { access_token: string }).access_token;
}

test('la limite de 30 tentatives par heure tient face à des envois simultanés', async ({
  request,
}) => {
  const token = await apiAccount(request, 'debit');
  const record = () =>
    request.post(`${environment.supabaseUrl}/rest/v1/rpc/record_lab_attempt`, {
      headers: {
        apikey: environment.supabasePublishableKey,
        Authorization: `Bearer ${token}`,
      },
      data: { p_lab_id: 'lab-terminal', p_succeeded: false, p_hints_used: 0 },
    });
  const responses = await Promise.all(Array.from({ length: 40 }, record));
  const accepted = responses.filter((r) => r.ok()).length;
  expect(accepted, 'tentatives acceptées sur 40 envois simultanés').toBe(30);
});
