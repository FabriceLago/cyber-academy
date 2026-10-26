import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { DECOUVERTE_DONE, seedProgress } from './quiz-helpers';

const SECTION = 'Attestation de fin de parcours';
const BUTTON = 'Télécharger l’attestation (PDF)';
const NAME = 'Nom à faire figurer sur l’attestation';

test('l’attestation attend que toutes les leçons du parcours soient validées', async ({ page }) => {
  await page.goto('/parcours/decouverte');
  const section = page.getByRole('region', { name: SECTION });
  await expect(section).toContainText('n’est pas une certification professionnelle');
  await expect(section).toContainText('0 sur 5 pour l’instant');
  await expect(section.getByRole('button')).toHaveCount(0);
});

test('parcours terminé : l’attestation se télécharge en PDF, avec l’avertissement', async ({
  page,
}) => {
  await seedProgress(page, DECOUVERTE_DONE);
  await page.goto('/parcours/decouverte');
  const section = page.getByRole('region', { name: SECTION });

  // Sans nom, rien n'est téléchargé.
  await section.getByRole('button', { name: BUTTON }).click();
  await expect(section.getByRole('alert')).toHaveText(
    'Indiquez le nom à faire figurer sur l’attestation.',
  );
  await expect(section.getByLabel(NAME)).toBeFocused();

  await section.getByLabel(NAME).fill('Léa Martin');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    section.getByRole('button', { name: BUTTON }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('attestation-decouverte.pdf');
  const pdf = (await readFile(await download.path())).toString('latin1');
  expect(pdf.startsWith('%PDF-1.4')).toBe(true);
  expect(pdf).toContain('(L\xe9a Martin) Tj');
  expect(pdf).toContain('(Attestation de fin de parcours) Tj');
  expect(pdf).toContain('certification');
  await expect(section.getByRole('status')).toHaveText(
    'Fichier « attestation-decouverte.pdf » téléchargé.',
  );
});
