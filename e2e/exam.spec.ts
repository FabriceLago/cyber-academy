import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { ORDINATEUR_ET_FICHIERS } from '../src/app/content/lessons/01-ordinateur-et-fichiers';
import { DECOUVRIR_LE_TERMINAL } from '../src/app/content/lessons/02-decouvrir-le-terminal';
import { VOYAGE_D_UNE_INFORMATION } from '../src/app/content/lessons/03-voyage-d-une-information';
import { SECURITE_ET_RISQUES } from '../src/app/content/lessons/04-securite-et-risques';
import { HAMECONNAGE } from '../src/app/content/lessons/05-hameconnage';
import { DECOUVERTE_DONE, answer, seedProgress } from './quiz-helpers';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const PATH = 'Découverte de la cybersécurité';
const LESSONS = [
  ORDINATEUR_ET_FICHIERS,
  DECOUVRIR_LE_TERMINAL,
  VOYAGE_D_UNE_INFORMATION,
  SECURITE_ET_RISQUES,
  HAMECONNAGE,
];
/** Les énoncés sont uniques dans un parcours (vérifié par les tests de l'examen). */
const BY_PROMPT = new Map(LESSONS.flatMap((l) => l.quiz.questions.map((q) => [q.prompt, q])));

test('l’examen blanc reste fermé tant que les leçons du parcours ne sont pas validées', async ({
  page,
}) => {
  await page.goto('/quiz');
  await expect(page.getByRole('region', { name: 'Examens blancs' })).toContainText(
    'Ouvert quand les 5 leçons sont validées (0 sur 5)',
  );
  await page.goto('/parcours/decouverte/examen');
  await expect(page).toHaveTitle(`Examen blanc : ${PATH} · Cyber Academy`);
  await expect(page.getByRole('heading', { name: 'Examen blanc pas encore ouvert' })).toBeVisible();
  await expect(page.locator('ol.questions')).toHaveCount(0);
});

test('examen blanc : questions mélangées des 5 leçons, puis bilan par compétence', async ({
  page,
}) => {
  await seedProgress(page, DECOUVERTE_DONE);
  await page.goto('/quiz');
  await page.getByRole('link', { name: `Passer l’examen blanc : ${PATH}` }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Examen blanc : ${PATH}`);

  const legends = page.locator('ol.questions legend');
  await expect(legends).toHaveCount(20);
  const numbers = await page.locator('ol.questions .number').allInnerTexts();
  const lessonTitles = numbers.map((text) => text.split(' · ')[1].trim());
  expect(new Set(lessonTitles)).toEqual(new Set(LESSONS.map((l) => l.title)));
  // Aucune correction ni signalement avant l'envoi.
  await expect(page.getByText('Bonne réponse')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^Signaler une erreur/ })).toHaveCount(0);

  await page.getByRole('button', { name: 'Envoyer mes réponses' }).click();
  await expect(page.getByRole('alert')).toContainText(/Il reste \d+ question\(s\) sans réponse/);

  // Toutes justes sauf la première.
  const prompts = await legends.allInnerTexts();
  for (const [i, prompt] of prompts.entries()) {
    const question = BY_PROMPT.get(prompt.trim());
    if (!question) throw new Error(`Question inconnue : ${prompt}`);
    await answer(page, question, i > 0);
  }
  await page.getByRole('button', { name: 'Envoyer mes réponses' }).click();

  await expect(page.getByRole('heading', { name: /^Résultat : 95\s?%$/ })).toBeFocused();
  await expect(page.getByText('Bonnes réponses : 19 sur 20.')).toBeVisible();
  // La compétence de la question manquée arrive en tête du bilan, avec sa leçon à revoir.
  const first = page.locator('ul.skills > li').first();
  await expect(first).toContainText('3 sur 4');
  await expect(first.getByRole('link', { name: lessonTitles[0] })).toBeVisible();
  await expect(page.locator('ul.skills > li')).toHaveCount(5);

  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(results.violations).toEqual([]);

  await page.getByRole('button', { name: 'Repasser avec de nouvelles questions' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.locator('ul.skills')).toHaveCount(0);
  await expect(legends).toHaveCount(20);
});
