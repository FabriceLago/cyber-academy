import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { PAGES } from './pages';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const PATHS = [...PAGES.map((p) => p.path), '/adresse-inexistante', '/erreur'];

for (const [colorScheme, name] of [
  ['dark', 'sombre'],
  ['light', 'clair'],
] as const) {
  test(`aucune violation WCAG 2.2 AA détectable par axe, thème ${name}`, async ({
    page,
    isMobile,
  }) => {
    await page.emulateMedia({ colorScheme });

    for (const path of PATHS) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(violations, `page ${path}`).toEqual([]);
    }

    if (isMobile) {
      await page.getByRole('button', { name: 'Menu' }).click();
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(violations, 'menu mobile ouvert').toEqual([]);
    }
  });
}
