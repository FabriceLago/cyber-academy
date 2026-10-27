import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { PAGES } from './pages';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const PATHS = [
  ...PAGES.map((p) => p.path),
  '/', // accueil public
  '/glossaire/hameconnage', // page d'un terme
  '/glossaire/inexistant',
  '/lecons/ordinateur-et-fichiers', // leçon ouverte, avec toutes ses sections
  '/lecons/hameconnage', // leçon verrouillée
  '/lecons/ordinateur-et-fichiers/quiz',
  '/lecons/securite-et-risques/quiz', // quiz verrouillé
  '/laboratoires/lab-phishing', // laboratoire verrouillé
  '/laboratoires/lab-journaux', // laboratoire d'une spécialisation verrouillée
  '/parcours/analyste-soc-junior', // spécialisation verrouillée, avec sa fiche métier
  '/parcours/culture-informatique', // niveau 1, verrouillé tant que Découverte n'est pas terminé
  '/glossaire',
  '/cartes-memoire',
  '/parcours/decouverte/examen', // examen blanc pas encore ouvert
  '/parcours/inexistant',
  '/laboratoires/inexistant',
  '/connexion',
  '/inscription',
  '/mot-de-passe-oublie',
  '/nouveau-mot-de-passe', // sans session : lien expiré
  '/abonnement',
  '/mentions-legales',
  '/confidentialite',
  '/lecons/inexistante',
  '/adresse-inexistante',
  '/erreur',
];

for (const [colorScheme, name] of [
  ['dark', 'sombre'],
  ['light', 'clair'],
] as const) {
  // Un test par page : chacune a son propre délai. Un test unique pour toutes les pages dépassait
  // son délai global sur un poste chargé (échecs au hasard, mesurés : 5 sur 8).
  for (const path of PATHS) {
    test(`WCAG 2.2 AA (axe), thème ${name} : ${path}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(violations, `page ${path}`).toEqual([]);
      // WCAG 1.4.10 : pas de défilement horizontal, même sur un écran de téléphone.
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `défilement horizontal sur ${path}`).toBeLessThanOrEqual(0);
    });
  }

  test(`WCAG 2.2 AA (axe), thème ${name} : menu mobile ouvert`, async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Le menu n’est replié que sur petit écran.');
    await page.emulateMedia({ colorScheme });
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(violations, 'menu mobile ouvert').toEqual([]);
  });
}
