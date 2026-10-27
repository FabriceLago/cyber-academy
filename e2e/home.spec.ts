import { Page, expect, test } from '@playwright/test';
import { DECOUVERTE_DONE, seedProgress } from './quiz-helpers';

const h1 = (page: Page) => page.getByRole('heading', { level: 1 });
const DEFINITION =
  'Faux message qui imite un organisme de confiance pour voler des informations ou de l’argent.';

test('l’accueil public présente la plateforme et mène à la première leçon', async ({ page }) => {
  await page.goto('/');
  await expect(h1(page)).toHaveText('Apprendre la cybersécurité en partant de zéro');
  await expect(page.getByRole('list', { name: 'La plateforme en chiffres' })).toContainText(
    /\d+ leçons/,
  );
  await expect(page.getByText('elle ne garantit pas un emploi')).toBeVisible();
  await page.getByRole('link', { name: 'Commencer la première leçon' }).click();
  await expect(h1(page)).toHaveText('Comprendre un ordinateur, ses fichiers et ses dossiers');
});

test('avec une progression, l’accueil propose de reprendre au tableau de bord', async ({
  page,
}) => {
  await seedProgress(page, DECOUVERTE_DONE);
  await page.goto('/');
  await page.getByRole('link', { name: 'Reprendre mon apprentissage' }).click();
  await expect(page).toHaveURL(/\/tableau-de-bord$/);
  await expect(h1(page)).toHaveText('Tableau de bord');
});

test('chaque terme du glossaire a sa page, avec titre et description', async ({ page }) => {
  await page.goto('/glossaire');
  await page.getByRole('link', { name: 'Hameçonnage', exact: true }).click();
  await expect(page).toHaveURL(/\/glossaire\/hameconnage$/);
  await expect(h1(page)).toHaveText('Hameçonnage');
  await expect(page).toHaveTitle('Hameçonnage : définition · Cyber Academy');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    `Hameçonnage : ${DEFINITION}`,
  );
  await expect(
    page.getByRole('link', { name: 'Repérer l’hameçonnage et l’ingénierie sociale' }),
  ).toBeVisible();

  await page.goto('/glossaire/inexistant');
  await expect(h1(page)).toHaveText('Terme introuvable');
});

test('la page d’un terme se lit sans JavaScript, comme un moteur de recherche', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/glossaire/hameconnage/');
  await expect(page).toHaveTitle('Hameçonnage : définition · Cyber Academy');
  await expect(h1(page)).toHaveText('Hameçonnage');
  await expect(page.getByText(DEFINITION)).toBeVisible();
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    `Hameçonnage : ${DEFINITION}`,
  );

  await page.goto('/glossaire/');
  await expect(page.getByRole('link', { name: 'Hameçonnage', exact: true })).toHaveAttribute(
    'href',
    '/glossaire/hameconnage/',
  );
  await context.close();
});

test('avec JavaScript, la page statique d’un terme devient la page de l’application', async ({
  page,
}) => {
  await page.goto('/glossaire/hameconnage/');
  await expect(page.getByRole('navigation', { name: 'Fil d’Ariane' })).toBeVisible();
  await expect(h1(page)).toHaveText('Hameçonnage');
  await expect(page.getByRole('link', { name: 'Réviser avec les cartes mémoire' })).toBeVisible();
});
