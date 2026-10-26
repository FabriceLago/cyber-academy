import { Page, expect, test } from '@playwright/test';

test.use({ serviceWorkers: 'allow' });

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

test('installable : manifeste et icônes servis, service worker accepté par la CSP', async ({
  page,
}) => {
  await recordViolations(page);
  await page.goto('/');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  const manifest = (await (await page.request.get(`/${href}`)).json()) as {
    icons: { src: string; sizes: string }[];
  };
  expect(manifest).toMatchObject({ name: 'Cyber Academy', display: 'standalone', start_url: '/' });
  expect(manifest.icons.map((i) => i.sizes)).toEqual(
    expect.arrayContaining(['192x192', '512x512']),
  );
  for (const icon of manifest.icons) {
    const response = await page.request.get(`/${icon.src}`);
    expect(response.headers()['content-type']).toBe('image/png');
  }

  // Le service worker s'enregistre et s'active, sans violation de la CSP.
  expect(await page.evaluate(async () => (await navigator.serviceWorker.ready).active?.state)).toBe(
    'activated',
  );
  expect(await violations(page)).toEqual([]);
});

test('hors ligne, le site et des leçons jamais ouvertes restent accessibles', async ({
  page,
  context,
}) => {
  await page.goto('/');
  // Installation terminée = tout le site préchargé ; au rechargement, il contrôle la page.
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  expect(await page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);

  // Réseau coupé, y compris pour le service worker (context.setOffline ne le coupe pas pour lui) :
  // ce qui n'est pas en cache échoue.
  await context.route('**/*', (route) => route.abort('internetdisconnected'));
  // Le service worker d'Angular répond 504 quand le réseau ne répond pas.
  expect(
    await page.evaluate(() =>
      fetch('/absent-du-cache.txt').then(
        (r) => r.status,
        () => 0,
      ),
    ),
  ).toBe(504);
  const response = await page.goto('/lecons/hameconnage');
  expect(response?.fromServiceWorker()).toBe(true);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Repérer l’hameçonnage et l’ingénierie sociale',
  );

  // Navigation interne vers une autre leçon : son contenu, chargé à la demande, est en cache.
  await page.goto('/lecons');
  await page
    .getByRole('main')
    .getByRole('link', { name: 'Comprendre un ordinateur, ses fichiers et ses dossiers' })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Comprendre un ordinateur, ses fichiers et ses dossiers',
  );
});
