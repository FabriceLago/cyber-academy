import { Page, expect, test } from '@playwright/test';
import { environment } from '../src/environments/environment';
import { learnerAccount, localServiceKey, requireSupabase } from './account-helpers';
import { answerAll } from './quiz-helpers';

const LESSON = '/lecons/ordinateur-et-fichiers';

/** Ouvre le formulaire de signalement, écrit le message et l'envoie. */
async function report(page: Page, about: string, message: string) {
  await page.getByRole('button', { name: `Signaler une erreur ${about}` }).click();
  const field = page.getByLabel('Qu’est-ce qui ne va pas ?');
  await expect(field).toBeFocused();
  await field.fill(message);
  await page.getByRole('button', { name: 'Envoyer le signalement' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Merci' })).toBeFocused();
}

/** Signalement enregistré, relu avec la clé d'administration de la pile locale. */
async function storedReport(page: Page, message: string) {
  const key = localServiceKey();
  const response = await page.request.get(
    `${environment.supabaseUrl}/rest/v1/content_reports?select=lesson_id,question_id,lab_id&message=eq.${encodeURIComponent(message)}`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } },
  );
  expect(response.ok()).toBe(true);
  return ((await response.json()) as object[])[0];
}

test('sans compte, le signalement invite à se connecter', async ({ page }) => {
  await page.goto(LESSON);
  await page.getByRole('button', { name: 'Signaler une erreur dans cette leçon' }).click();
  const panel = page.getByRole('group', { name: 'Signaler une erreur dans cette leçon' });
  await expect(panel).toBeFocused();
  await expect(panel.getByRole('link', { name: 'connectez-vous' })).toHaveAttribute(
    'href',
    '/connexion',
  );
  await panel.getByRole('button', { name: 'Fermer' }).click();
  await expect(
    page.getByRole('button', { name: 'Signaler une erreur dans cette leçon' }),
  ).toBeFocused();
});

test('avec un compte, une leçon, une question corrigée et un laboratoire se signalent', async ({
  page,
}, testInfo) => {
  await requireSupabase(page);
  // Leçon 1 validée : le laboratoire de la leçon 2 est ouvert.
  await learnerAccount(page, {
    subscribed: false,
    quizzes: [{ lessonId: 'ordinateur-et-fichiers', questionIds: ['q1', 'q2', 'q3', 'q4', 'q5'] }],
  });
  const tag = `${Date.now()}-${testInfo.project.name}`;

  // Leçon : un message trop court est refusé avant l'envoi.
  await page.goto(LESSON);
  await page.getByRole('button', { name: 'Signaler une erreur dans cette leçon' }).click();
  await page.getByLabel('Qu’est-ce qui ne va pas ?').fill('  court ');
  await page.getByRole('button', { name: 'Envoyer le signalement' }).click();
  await expect(page.getByRole('alert')).toHaveText(
    'Décrivez le problème en 10 caractères au moins.',
  );
  await page.getByRole('button', { name: 'Annuler' }).click();
  await report(page, 'dans cette leçon', `Coquille dans l’explication ${tag}`);
  expect(await storedReport(page, `Coquille dans l’explication ${tag}`)).toEqual({
    lesson_id: 'ordinateur-et-fichiers',
    question_id: null,
    lab_id: null,
  });

  // Question : le bouton n'apparaît qu'après la correction, sans rien dévoiler avant.
  await page.goto(`${LESSON}/quiz`);
  await answerAll(page, true);
  await expect(page.getByRole('button', { name: /^Signaler une erreur/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Envoyer mes réponses' }).click();
  await report(page, 'sur la question 1', `Réponse discutable ${tag}`);
  const question = await storedReport(page, `Réponse discutable ${tag}`);
  expect(question).toMatchObject({ lesson_id: 'ordinateur-et-fichiers', lab_id: null });
  expect(question).toHaveProperty('question_id', expect.stringMatching(/^[a-z0-9-]+$/));

  // Laboratoire.
  await page.goto('/laboratoires/lab-terminal');
  await report(page, 'dans ce laboratoire', `Consigne ambiguë ${tag}`);
  expect(await storedReport(page, `Consigne ambiguë ${tag}`)).toEqual({
    lesson_id: null,
    question_id: null,
    lab_id: 'lab-terminal',
  });
});
