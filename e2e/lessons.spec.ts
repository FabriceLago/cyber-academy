import AxeBuilder from '@axe-core/playwright';
import { Page, expect, test } from '@playwright/test';
import { ORDINATEUR_ET_FICHIERS as LESSON } from '../src/app/content/lessons/01-ordinateur-et-fichiers';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const FIRST = 'Comprendre un ordinateur, ses fichiers et ses dossiers';
const FIVE = ['a', 'b', 'c', 'd', 'e'];

/** Données de test : la leçon 1 est validée (quiz à 100 %). Injectées une seule fois par onglet. */
const FIRST_LESSON_PASSED = JSON.stringify({
  schemaVersion: 1,
  weeklyGoal: null,
  labAttempts: [],
  quizAttempts: [
    {
      lessonId: 'ordinateur-et-fichiers',
      submittedAt: new Date().toISOString(),
      questionIds: FIVE,
      correctQuestionIds: FIVE,
    },
  ],
});

async function seedOnce(page: Page, raw: string) {
  await page.addInitScript((value) => {
    if (sessionStorage.getItem('seeded')) return;
    localStorage.setItem('ca-progress', value);
    sessionStorage.setItem('seeded', '1');
  }, raw);
}

const h1 = (page: Page) => page.getByRole('heading', { level: 1 });

test('un nouvel apprenant ouvre la première leçon et y trouve les 17 sections', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Commencer la leçon' }).click();
  await expect(h1(page)).toHaveText(FIRST);
  await expect(page).toHaveTitle(`${FIRST} · Cyber Academy`);
  for (const name of [
    'Objectifs',
    'Explication',
    'Glossaire',
    'Exemple concret',
    'Animation',
    'Démonstration',
    'Exercice guidé',
    'Quiz de validation',
    'Résumé',
    'Critères de réussite',
  ]) {
    await expect(page.getByRole('heading', { level: 2, name, exact: true })).toBeVisible();
  }
  await expect(page.getByRole('button', { name: 'Recommencer la leçon' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Leçon suivante' })).toBeDisabled();
});

test('l’exercice guidé donne des indices et ne corrige qu’après la réponse', async ({ page }) => {
  await page.goto('/lecons/ordinateur-et-fichiers');
  const question = page
    .locator('ca-practice-question')
    .filter({ hasText: 'quel dossier contient directement' });

  await expect(question.getByRole('status')).toBeEmpty();
  await question.getByRole('button', { name: 'Afficher un indice' }).click();
  await expect(question.getByText('Indice 1 :')).toBeVisible();

  await question.getByRole('radio', { name: 'home' }).check();
  await question.getByRole('button', { name: 'Vérifier' }).click();
  await expect(question.getByRole('status')).toContainText('Pas tout à fait');

  await question.getByRole('button', { name: 'Réessayer' }).click();
  await question.getByRole('radio', { name: 'Documents' }).check();
  await question.getByRole('button', { name: 'Vérifier' }).click();
  await expect(question.getByRole('status')).toContainText('Bonne réponse');

  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(violations).toEqual([]);
});

test('une leçon verrouillée indique quoi valider d’abord', async ({ page }) => {
  await page.goto('/lecons/decouvrir-le-terminal');
  await expect(page.getByRole('heading', { name: 'Leçon verrouillée' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Explication' })).toHaveCount(0);
  await page
    .getByRole('region', { name: 'Leçon verrouillée' })
    .getByRole('link', { name: FIRST })
    .click();
  await expect(h1(page)).toHaveText(FIRST);
});

test('une leçon validée ouvre la suivante', async ({ page }) => {
  await seedOnce(page, FIRST_LESSON_PASSED);
  await page.goto('/lecons/ordinateur-et-fichiers');
  await expect(page.getByText('Leçon validée.')).toBeVisible();
  await page.getByRole('link', { name: 'Leçon suivante : Découvrir le terminal' }).click();
  await expect(h1(page)).toHaveText('Découvrir le terminal');
  await expect(page.getByRole('heading', { level: 2, name: 'Laboratoire' })).toBeVisible();
});

test('la carte des parcours et la liste des leçons reflètent les verrous', async ({ page }) => {
  await page.goto('/parcours');
  await expect(
    page.getByRole('heading', { level: 2, name: 'Découverte de la cybersécurité' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 3, name: 'Module 1 : Premiers pas avec l’ordinateur' }),
  ).toBeVisible();
  await expect(page.getByRole('main').getByRole('link', { name: FIRST })).toBeVisible();
  await expect(
    page.getByRole('main').getByRole('link', { name: 'Découvrir le terminal' }),
  ).toHaveCount(0);

  // Seule la première leçon est un lien ; le lien vers le glossaire est toujours présent.
  await page.goto('/lecons');
  await expect(
    page.getByRole('main').getByRole('link').filter({ hasNotText: 'glossaire' }),
  ).toHaveCount(1);
});

test('la progression peut être réinitialisée depuis le profil', async ({ page }) => {
  await seedOnce(page, FIRST_LESSON_PASSED);
  await page.goto('/profil');
  await page.getByRole('button', { name: 'Réinitialiser ma progression' }).click();
  const confirm = page.getByRole('button', { name: 'Oui, réinitialiser' });
  await expect(confirm).toBeFocused();
  await confirm.click();
  await expect(
    page.getByRole('status').filter({ hasText: 'Progression réinitialisée.' }),
  ).toBeVisible();
  await page.goto('/');
  await expect(page.getByRole('progressbar', { name: 'Progression globale' })).toHaveAttribute(
    'aria-valuenow',
    '0',
  );
});

test('le glossaire rassemble les termes des leçons et se filtre sans accents', async ({ page }) => {
  await page.goto('/lecons');
  await page.getByRole('link', { name: 'Consulter le glossaire de tous les termes' }).click();
  await expect(h1(page)).toHaveText('Glossaire');
  const count = page.getByRole('status').filter({ hasText: 'terme' });
  await expect(count).toHaveText(/\d+ termes/);

  await page.getByLabel('Rechercher un terme ou une définition').fill('HAMECON');
  await expect(count).toHaveText(/1 terme trouvé sur \d+/);
  await page.getByRole('link', { name: 'Repérer l’hameçonnage et l’ingénierie sociale' }).click();
  await expect(page).toHaveURL(/\/lecons\/hameconnage$/);
});

test('les cartes mémoire reprennent les termes des leçons tentées, définition cachée d’abord', async ({
  page,
}) => {
  await page.goto('/cartes-memoire');
  await expect(page.getByText('Aucune carte pour l’instant')).toBeVisible();

  await seedOnce(page, FIRST_LESSON_PASSED);
  await page.goto('/glossaire');
  await page.getByRole('link', { name: 'Réviser ces termes avec les cartes mémoire' }).click();
  await expect(h1(page)).toHaveText('Cartes mémoire');
  const count = LESSON.glossary.length;
  await page.getByRole('button', { name: `Commencer la révision (${count} cartes)` }).click();

  const heading = page.getByRole('main').getByRole('heading', { level: 2 });
  for (let i = 1; i <= count; i++) {
    await expect(page.getByText(`Carte ${i} sur ${count}`)).toBeVisible();
    await expect(heading).toBeFocused();
    const term = (await heading.innerText()).trim();
    const entry = LESSON.glossary.find((e) => e.term === term);
    if (!entry) throw new Error(`Terme inconnu : ${term}`);
    const definition = page.getByText(entry.definition, { exact: true });
    await expect(definition).toBeHidden();
    await page.getByRole('button', { name: 'Afficher la définition' }).click();
    await expect(definition).toBeVisible();
    await page.getByRole('button', { name: i === 1 ? 'À revoir' : 'Je savais' }).click();
  }

  await expect(page.getByRole('heading', { name: 'Séance terminée' })).toBeFocused();
  await expect(page.getByText(`${count - 1} cartes connues sur ${count}.`)).toBeVisible();
  await page.reload();
  await expect(page.getByText(`Rien à revoir aujourd’hui sur vos ${count} cartes.`)).toBeVisible();
});

test('une adresse de leçon inconnue est signalée', async ({ page }) => {
  await page.goto('/lecons/inexistante');
  await expect(h1(page)).toHaveText('Leçon introuvable');
  await expect(page).toHaveTitle('Leçon introuvable · Cyber Academy');
});
