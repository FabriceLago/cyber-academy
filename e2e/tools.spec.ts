import AxeBuilder from '@axe-core/playwright';
import { Page, expect, test } from '@playwright/test';
import { DECOUVERTE_DONE, seedProgress } from './quiz-helpers';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const h1 = (page: Page) => page.getByRole('heading', { level: 1 });

/** axe dans les deux thèmes (la page est rechargée), et pas de défilement horizontal de la page. */
async function audit(page: Page, label: string) {
  for (const colorScheme of ['dark', 'light'] as const) {
    await page.emulateMedia({ colorScheme });
    await page.reload();
    await expect(h1(page)).toBeVisible();
    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(violations, `${label}, thème ${colorScheme}`).toEqual([]);
  }
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, `défilement horizontal : ${label}`).toBeLessThanOrEqual(0);
}

test('les outils du métier, rangés par domaine, mènent à une fiche reliée aux leçons', async ({
  page,
}) => {
  await page.goto('/outils');
  await expect(h1(page)).toHaveText('Les outils des professionnels');
  await expect(page.getByRole('complementary', { name: 'La règle d’or' })).toContainText(
    'uniquement sur vos propres appareils',
  );
  await audit(page, 'liste des outils');

  await page
    .getByRole('region', { name: 'Réseau' })
    .getByRole('link', { name: 'Wireshark' })
    .click();
  await expect(h1(page)).toHaveText('Wireshark');
  await expect(page).toHaveTitle('Wireshark : outil du métier · Cyber Academy');
  await expect(page.getByRole('region', { name: 'En bref' })).toContainText('GPL v2');
  await expect(page.getByRole('link', { name: 'wireshark.org' })).toHaveAttribute(
    'href',
    'https://www.wireshark.org/',
  );
  await expect(
    page
      .getByRole('region', { name: 'Dans Cyber Academy' })
      .getByRole('link', { name: 'Comment une information voyage sur Internet' }),
  ).toHaveAttribute('href', '/lecons/voyage-d-une-information');
  await expect(page.getByText(/vérifiés le \d+ \S+ \d{4}/)).toBeVisible();
  await audit(page, 'fiche Wireshark');
});

test('un outil qui sonde un réseau rappelle la loi et dit ce qui y préparera', async ({ page }) => {
  await page.goto('/outils/nmap');
  const tryIt = page.getByRole('region', { name: 'Pour s’y mettre sans risque' });
  await expect(tryIt).toContainText('Attention :');
  await expect(tryIt).toContainText('323-1');
  await expect(page.getByRole('region', { name: 'Dans Cyber Academy' })).toContainText(
    'À venir : Niveau 2',
  );

  await page.goto('/outils/inconnu');
  await expect(h1(page)).toHaveText('Outil introuvable');
});

test('une leçon présente les outils réels auxquels elle prépare', async ({ page }) => {
  await seedProgress(page, DECOUVERTE_DONE);
  await page.goto('/lecons/voyage-d-une-information');
  const tools = page.getByRole('region', { name: 'Outils du métier' });
  await expect(tools).toBeVisible();
  await tools.getByRole('link', { name: 'Wireshark' }).click();
  await expect(h1(page)).toHaveText('Wireshark');

  // Une leçon sans outil associé n'a pas cette section.
  await page.goto('/lecons/ordinateur-et-fichiers');
  await expect(h1(page)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Outils du métier' })).toHaveCount(0);
});

test('la fiche d’un outil se lit sans JavaScript, comme un moteur de recherche', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/outils/wireshark/');
  await expect(page).toHaveTitle('Wireshark : outil du métier · Cyber Academy');
  await expect(h1(page)).toHaveText('Wireshark');
  await expect(page.getByText('Observer le trafic réseau, paquet par paquet.')).toBeVisible();

  await page.goto('/outils/');
  await expect(page.getByRole('link', { name: 'Wireshark', exact: true })).toHaveAttribute(
    'href',
    '/outils/wireshark/',
  );
  await context.close();
});
