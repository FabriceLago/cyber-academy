import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('la page d’accueil se charge en français', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Cyber Academy');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByRole('heading', { level: 1, name: 'Cyber Academy' })).toBeVisible();
});

test('la page d’accueil ne présente aucune violation WCAG 2.2 AA détectable par axe', async ({
  page,
}) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
