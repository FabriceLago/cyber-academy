import AxeBuilder from '@axe-core/playwright';
import { Page, expect, test } from '@playwright/test';
import { ORDINATEUR_ET_FICHIERS as FIRST_LESSON } from '../src/app/content/lessons/01-ordinateur-et-fichiers';
import { DETAILED, SIMPLIFIED } from '../src/app/features/lessons/animations/packet-journey';
import { STEP_DURATION_MS } from '../src/app/shared/animation-player/animation-player';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const caption = (page: Page) => page.locator('.caption');
const stepText = (index: number, steps = DETAILED.steps) =>
  `Étape ${index + 1} sur ${steps.length} : ${steps[index].caption}`;

/** Ouvre la leçon 3 : la leçon 1 est validée (quiz réussi à 100 %). */
async function openLesson(page: Page) {
  const ids = FIRST_LESSON.quiz.questions.slice(0, 5).map((q) => q.id);
  await page.addInitScript(
    (value) => localStorage.setItem('ca-progress', value),
    JSON.stringify({
      schemaVersion: 1,
      weeklyGoal: null,
      labAttempts: [],
      quizAttempts: [
        {
          lessonId: FIRST_LESSON.id,
          submittedAt: new Date().toISOString(),
          questionIds: ids,
          correctQuestionIds: ids,
        },
      ],
    }),
  );
  await page.goto('/lecons/voyage-d-une-information');
  await expect(page.getByRole('img', { name: /Schéma du réseau/ })).toBeVisible();
}

/**
 * Trajets du paquet en cours. Les transitions CSS sont ignorées : en mouvement réduit, la règle
 * globale leur donne 0,01 ms, ce qui revient à un saut instantané.
 */
const packetAnimations = (page: Page) =>
  page.evaluate(
    () =>
      document
        .getAnimations()
        .filter((a) => !(a instanceof CSSTransition))
        .filter((a) => (a.effect as KeyframeEffect | null)?.target?.classList.contains('packet'))
        .length,
  );

test('l’animation réseau se pilote entièrement au clavier', async ({ page }) => {
  await openLesson(page);
  await expect(caption(page)).toHaveText(stepText(0));
  const next = page.getByRole('button', { name: 'Étape suivante' });

  await next.focus();
  for (let i = 1; i < DETAILED.steps.length; i++) {
    await page.keyboard.press('Enter');
    await expect(caption(page)).toHaveText(stepText(i));
  }
  // Dernière étape : le bouton est signalé indisponible mais garde le focus.
  await expect(next).toHaveAttribute('aria-disabled', 'true');
  await expect(next).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(caption(page)).toHaveText(stepText(DETAILED.steps.length - 1));

  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Revenir au début' })).toBeFocused();
  await page.keyboard.press('Space');
  await expect(caption(page)).toHaveText(stepText(0));

  const simple = page.getByRole('button', { name: 'Version simplifiée' });
  await simple.focus();
  await page.keyboard.press('Enter');
  await expect(simple).toHaveAttribute('aria-pressed', 'true');
  await expect(caption(page)).toHaveText(stepText(0, SIMPLIFIED.steps));
  await expect(page.getByRole('img', { name: /Schéma simplifié/ })).toBeVisible();
});

test('la lecture avance seule, puis s’arrête sur la dernière étape', async ({ page }) => {
  await page.clock.install();
  await openLesson(page);
  await page.getByRole('button', { name: 'Lecture' }).click();
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();

  for (let i = 1; i < DETAILED.steps.length; i++) {
    await page.clock.fastForward(STEP_DURATION_MS);
    await expect(caption(page)).toHaveText(stepText(i));
  }
  await expect(page.getByRole('button', { name: 'Rejouer' })).toBeVisible();
  await page.clock.fastForward(STEP_DURATION_MS);
  await expect(caption(page)).toHaveText(stepText(DETAILED.steps.length - 1));
});

test('le paquet se déplace, sauf si le système demande de réduire les animations', async ({
  page,
}) => {
  await openLesson(page);
  expect(await packetAnimations(page)).toBe(0); // rien ne bouge au chargement
  await page.getByRole('button', { name: 'Étape suivante' }).click();
  expect(await packetAnimations(page)).toBe(1);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Étape suivante' }).click();
  await expect(caption(page)).toHaveText(stepText(2));
  expect(await packetAnimations(page)).toBe(0); // l'animation précédente est annulée, aucune autre
});

test('la leçon animée respecte WCAG 2.2 AA dans les deux thèmes, sans défilement horizontal', async ({
  page,
}) => {
  await openLesson(page);
  for (const colorScheme of ['dark', 'light'] as const) {
    await page.emulateMedia({ colorScheme });
    await page.reload();
    await expect(page.getByRole('img', { name: /Schéma du réseau/ })).toBeVisible();
    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(violations, `thème ${colorScheme}`).toEqual([]);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  }
});
