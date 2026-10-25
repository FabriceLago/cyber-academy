import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { ORDINATEUR_ET_FICHIERS as LESSON } from '../src/app/content/lessons/01-ordinateur-et-fichiers';
import { answer, answerAll, shownQuestions } from './quiz-helpers';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const QUIZ_URL = `/lecons/${LESSON.id}/quiz`;

test('réussir le quiz valide la leçon et ouvre la suivante', async ({ page }) => {
  await page.goto(`/lecons/${LESSON.id}`);
  await page.getByRole('link', { name: 'Commencer le quiz' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Quiz : ${LESSON.title}`);

  const questions = await answerAll(page, true);
  expect(questions).toHaveLength(LESSON.quiz.questionsPerAttempt);
  const difficulties = questions.map((q) => q.difficulty);
  expect(difficulties).toEqual([...difficulties].sort((a, b) => a - b));
  await expect(page.locator('.correction')).toHaveCount(0); // aucune correction avant l'envoi

  await page.getByRole('button', { name: 'Envoyer mes réponses' }).click();
  const result = page.getByRole('heading', { name: 'Résultat : 100 %' });
  await expect(result).toBeFocused();
  await expect(page.getByText('Quiz réussi.')).toBeVisible();
  await expect(page.getByText('La leçon est validée.')).toBeVisible();
  await expect(page.getByText('Bonne réponse', { exact: true })).toHaveCount(5);

  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(violations).toEqual([]);

  await page.getByRole('link', { name: 'Leçon suivante : Découvrir le terminal' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Découvrir le terminal');
  await page.goto('/');
  await expect(page.getByRole('progressbar', { name: 'Progression globale' })).toHaveAttribute(
    'aria-valuenow',
    '13', // 1 leçon validée sur 8
  );
});

test('un échec indique les notions à revoir, et le nouvel essai change les questions', async ({
  page,
}) => {
  await page.goto(QUIZ_URL);
  const first = await answerAll(page, false);
  await page.getByRole('button', { name: 'Envoyer mes réponses' }).click();
  await expect(page.getByRole('heading', { name: 'Résultat : 0 %' })).toBeFocused();
  await expect(page.getByText('Pas encore : il faut au moins 80 % pour valider.')).toBeVisible();

  const missedObjectives = LESSON.objectives.filter((o) =>
    first.some((q) => q.objectiveId === o.id),
  );
  const review = page
    .getByRole('heading', { name: 'Notions à revoir' })
    .locator('xpath=following-sibling::ul[1]');
  for (const objective of missedObjectives) await expect(review).toContainText(objective.text);

  await page.getByRole('button', { name: 'Recommencer avec de nouvelles questions' }).click();
  // Le résultat disparaît au moment où le nouveau tirage s'affiche.
  await expect(page.getByRole('heading', { name: /Résultat/ })).toHaveCount(0);
  const second = await shownQuestions(page);
  expect(second.filter((q) => first.includes(q))).toEqual([]);

  await page.goto(`/lecons/${LESSON.id}`);
  await expect(page.getByRole('table', { name: /Historique de vos tentatives/ })).toContainText(
    'À retenter',
  );
});

test('un envoi incomplet est refusé et indique les questions sans réponse', async ({ page }) => {
  await page.goto(QUIZ_URL);
  const [firstQuestion] = await shownQuestions(page);
  await answer(page, firstQuestion, true);
  await page.getByRole('button', { name: 'Envoyer mes réponses' }).click();
  const alert = page.getByRole('alert');
  await expect(alert).toBeFocused();
  await expect(alert).toContainText('sans réponse');
  await expect(page.getByRole('heading', { name: /Résultat/ })).toHaveCount(0);

  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(violations).toEqual([]);
});

test('le classement se fait au clavier et annonce la nouvelle position', async ({ page }) => {
  // Données de test : une tentative précédente avec toutes les questions sauf le classement,
  // pour que le tirage suivant le propose à coup sûr.
  const others = LESSON.quiz.questions.filter((q) => q.type !== 'ordering').map((q) => q.id);
  await page.addInitScript(
    (value) => {
      if (!sessionStorage.getItem('seeded')) {
        localStorage.setItem('ca-progress', value);
        sessionStorage.setItem('seeded', '1');
      }
    },
    JSON.stringify({
      schemaVersion: 1,
      weeklyGoal: null,
      labAttempts: [],
      quizAttempts: [
        {
          lessonId: LESSON.id,
          submittedAt: new Date().toISOString(),
          questionIds: others,
          correctQuestionIds: [],
        },
      ],
    }),
  );
  await page.goto(QUIZ_URL);

  const ordering = LESSON.quiz.questions.find((q) => q.type === 'ordering');
  const group = page.getByRole('group', { name: ordering?.prompt, exact: true });
  const labels = group.locator('ol.order li > span:first-child');
  await expect(labels).toHaveCount(ordering?.type === 'ordering' ? ordering.items.length : 0);
  const firstLabel = (await labels.allInnerTexts())[0];
  const down = group.getByRole('button', { name: `Descendre « ${firstLabel} »` });
  await down.focus();
  await page.keyboard.press('Enter');
  await expect(
    group.getByText(`« ${firstLabel} » est maintenant en position 2 sur`),
  ).toBeAttached();
  await expect(page.locator(':focus')).toHaveAttribute(
    'aria-label',
    new RegExp(`« ${firstLabel} »`),
  );
});

test('la liste des quiz montre ce qui est accessible', async ({ page }) => {
  await page.goto('/quiz');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Quiz et examens');
  await expect(page.getByRole('link', { name: 'Passer le quiz' })).toHaveCount(1);
  await expect(page.getByText('Quiz accessible après la leçon', { exact: false })).toHaveCount(7);
});
