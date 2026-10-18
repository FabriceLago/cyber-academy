import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { PAGES } from './pages';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const PATHS = [
  ...PAGES.map((p) => p.path),
  '/lecons/ordinateur-et-fichiers', // leçon ouverte, avec toutes ses sections
  '/lecons/hameconnage', // leçon verrouillée
  '/lecons/ordinateur-et-fichiers/quiz',
  '/lecons/securite-et-risques/quiz', // quiz verrouillé
  '/laboratoires/lab-phishing', // laboratoire verrouillé
  '/laboratoires/lab-journaux', // laboratoire d'une spécialisation verrouillée
  '/parcours/analyste-soc-junior', // spécialisation verrouillée, avec sa fiche métier
  '/glossaire',
  '/parcours/inexistant',
  '/laboratoires/inexistant',
  '/connexion',
  '/inscription',
  '/lecons/inexistante',
  '/adresse-inexistante',
  '/erreur',
];

for (const [colorScheme, name] of [
  ['dark', 'sombre'],
  ['light', 'clair'],
] as const) {
  test(`aucune violation WCAG 2.2 AA détectable par axe, thème ${name}`, async ({
    page,
    isMobile,
  }) => {
    // Un seul test parcourt toutes les pages : son délai grandit avec leur nombre (≈ 1 s par page
    // mesurée, 3 s de marge sur un poste chargé).
    test.setTimeout(PATHS.length * 3_000);
    await page.emulateMedia({ colorScheme });

    for (const path of PATHS) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(violations, `page ${path}`).toEqual([]);
      // WCAG 1.4.10 : pas de défilement horizontal, même sur un écran de téléphone.
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `défilement horizontal sur ${path}`).toBeLessThanOrEqual(0);
    }

    if (isMobile) {
      await page.getByRole('button', { name: 'Menu' }).click();
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(violations, 'menu mobile ouvert').toEqual([]);
    }
  });
}
