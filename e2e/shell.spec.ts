import { expect, test } from '@playwright/test';
import { PAGES } from './pages';

const heading = (page: import('@playwright/test').Page) => page.getByRole('heading', { level: 1 });

test('la page d’accueil se charge en français', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(heading(page)).toHaveText('Tableau de bord');
  await expect(page).toHaveTitle('Tableau de bord · Cyber Academy');
});

test('chaque lien de la navigation ouvre la bonne page et y place le focus', async ({
  page,
  isMobile,
}) => {
  // Départ hors de la navigation : chaque clic mène à une autre page (un lien vers la page
  // en cours ne déclenche pas de navigation).
  await page.goto('/adresse-inexistante');
  const menu = page.getByRole('button', { name: 'Menu' });
  const nav = page.getByRole('navigation', { name: 'Navigation principale' });

  for (const { label, path } of PAGES) {
    if (isMobile) await menu.click();
    await nav.getByRole('link', { name: label, exact: true }).click();

    await expect(heading(page)).toHaveText(label);
    await expect(page).toHaveTitle(`${label} · Cyber Academy`);
    await expect(page).toHaveURL((url) => url.pathname === path);
    await expect(page.locator('main')).toBeFocused();
    await expect(page.locator('#navigation-principale a[aria-current="page"]')).toHaveText(label);
    if (isMobile) await expect(menu).toHaveAttribute('aria-expanded', 'false');
  }
});

test('le lien d’évitement mène directement au contenu', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Navigation au clavier testée sur bureau.');
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Aller au contenu principal' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await expect(page).toHaveURL((url) => url.pathname === '/');
});

test('le menu mobile se ferme avec Échap et rend le focus au bouton', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Le menu n’est replié que sur petit écran.');
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Menu' });
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toBeFocused();
  await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toBeHidden();
});

test('le menu mobile reste visible quand la page a défilé et se ferme quand le focus le quitte', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Le menu n’est replié que sur petit écran.');
  await page.setViewportSize({ width: 412, height: 500 });
  await page.goto('/profil');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  const menu = page.getByRole('button', { name: 'Menu' });
  const nav = page.getByRole('navigation', { name: 'Navigation principale' });
  await menu.click();
  await expect(nav.getByRole('link', { name: 'Tableau de bord' })).toBeInViewport();

  await nav.getByRole('link', { name: 'Profil et paramètres' }).focus();
  await page.keyboard.press('Tab');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(nav).toBeHidden();
});

test('le thème choisi dans le profil s’applique et persiste après rechargement', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/profil');
  const background = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await expect.poll(background).toBe('rgb(11, 18, 32)'); // #0b1220, bleu nuit

  await page.getByRole('radio', { name: 'Clair', exact: true }).check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect.poll(background).toBe('rgb(244, 247, 251)'); // #f4f7fb

  await page.reload();
  await expect(page.getByRole('radio', { name: 'Clair', exact: true })).toBeChecked();
  await expect.poll(background).toBe('rgb(244, 247, 251)');
});

test('le bouton de l’en-tête bascule entre thème sombre et thème clair', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Passer au thème sombre' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Passer au thème clair' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('une adresse inconnue affiche la page introuvable', async ({ page }) => {
  await page.goto('/adresse-inexistante');
  await expect(heading(page)).toHaveText('Page introuvable');
  await expect(page).toHaveTitle('Page introuvable · Cyber Academy');
  await page.getByRole('link', { name: 'Retour au tableau de bord' }).click();
  await expect(heading(page)).toHaveText('Tableau de bord');
});

test('un échec de chargement affiche la page d’erreur en gardant l’adresse', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  await expect(heading(page)).toHaveText('Tableau de bord');
  // Simule une coupure réseau : les pages chargées à la demande ne peuvent plus être téléchargées.
  await page.route(/chunk-[^/]+\.js$/, (route) => route.abort());

  if (isMobile) await page.getByRole('button', { name: 'Menu' }).click();
  await page
    .getByRole('navigation', { name: 'Navigation principale' })
    .getByRole('link', { name: 'Profil et paramètres' })
    .click();

  await expect(heading(page)).toHaveText('Une erreur est survenue');
  await expect(page.getByRole('button', { name: 'Recharger la page' })).toBeVisible();
  await expect(page).toHaveURL((url) => url.pathname === '/profil');
});
