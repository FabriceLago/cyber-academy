import { Page, expect } from '@playwright/test';
import { ORDINATEUR_ET_FICHIERS as LESSON } from '../src/app/content/lessons/01-ordinateur-et-fichiers';
import type { Question } from '../src/app/core/models/content.model';

/** Réponses au quiz de la leçon 1, données comme un apprenant (partagé par plusieurs tests). */
const byPrompt = new Map(LESSON.quiz.questions.map((q) => [q.prompt, q]));

/** Questions affichées, retrouvées dans le contenu de la leçon par leur énoncé. */
export async function shownQuestions(page: Page): Promise<Question[]> {
  const legends = page.locator('ol.questions legend');
  await expect(legends).toHaveCount(LESSON.quiz.questionsPerAttempt); // attend l'affichage
  return (await legends.allInnerTexts()).map((text) => {
    const question = byPrompt.get(text.trim());
    if (!question) throw new Error(`Question inconnue : ${text}`);
    return question;
  });
}

/** Répond comme un apprenant : juste, ou volontairement faux. */
export async function answer(page: Page, question: Question, correctly: boolean) {
  const group = page.getByRole('group', { name: question.prompt, exact: true });
  switch (question.type) {
    case 'single': {
      const option = question.options.find((o) => o.correct === correctly);
      await group.getByRole('radio', { name: option?.label, exact: true }).check();
      break;
    }
    case 'multiple': {
      const options = question.options.filter((o) => o.correct === correctly);
      for (const option of correctly ? options : options.slice(0, 1)) {
        await group.getByRole('checkbox', { name: option.label, exact: true }).check();
      }
      break;
    }
    case 'true-false':
      await group
        .getByRole('radio', { name: question.answer === correctly ? 'Vrai' : 'Faux', exact: true })
        .check();
      break;
    case 'matching':
      for (const [i, pair] of question.pairs.entries()) {
        const right = correctly
          ? pair.right
          : question.pairs[(i + 1) % question.pairs.length].right;
        await group.getByLabel(pair.left, { exact: true }).selectOption({ label: right });
      }
      break;
    case 'ordering':
      if (!correctly) break; // L'ordre de départ n'est jamais le bon.
      for (const [target, item] of question.items.entries()) {
        const labels = await group.locator('ol.order li > span:first-child').allInnerTexts();
        for (let i = labels.indexOf(item.label); i > target; i--) {
          await group.getByRole('button', { name: `Monter « ${item.label} »` }).click();
        }
      }
      break;
  }
}

export async function answerAll(page: Page, correctly: boolean): Promise<Question[]> {
  const questions = await shownQuestions(page);
  for (const question of questions) await answer(page, question, correctly);
  return questions;
}
