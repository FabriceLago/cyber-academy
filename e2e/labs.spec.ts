import AxeBuilder from '@axe-core/playwright';
import { Page, expect, test } from '@playwright/test';
import { findLesson } from '../src/app/content/catalog';
import { PHISHING_LAB } from '../src/app/content/labs/lab-phishing';
import { TERMINAL_LAB } from '../src/app/content/labs/lab-terminal';
import { EMAIL_ZONES } from '../src/app/core/labs/phishing';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** Démarre avec les quiz de ces leçons réussis à 100 % (une seule fois : les tentatives restent). */
async function seed(page: Page, lessonIds: string[]) {
  const quizAttempts = lessonIds.map((lessonId) => {
    const ids = (findLesson(lessonId)?.lesson.quiz.questions ?? []).slice(0, 5).map((q) => q.id);
    return {
      lessonId,
      submittedAt: new Date().toISOString(),
      questionIds: ids,
      correctQuestionIds: ids,
    };
  });
  await page.addInitScript(
    (value) => {
      if (!sessionStorage.getItem('seeded')) {
        localStorage.setItem('ca-progress', value);
        sessionStorage.setItem('seeded', '1');
      }
    },
    JSON.stringify({ schemaVersion: 1, weeklyGoal: null, labAttempts: [], quizAttempts }),
  );
}

const TERMINAL_OPEN = ['ordinateur-et-fichiers'];
const PHISHING_OPEN = ['ordinateur-et-fichiers', 'voyage-d-une-information', 'securite-et-risques'];

/** Tape une commande dans le terminal simulé et la valide avec Entrée. */
async function type(page: Page, command: string) {
  const input = page.getByLabel(/Commande à exécuter/);
  await input.fill(command);
  await input.press('Enter');
  await expect(input).toHaveValue('');
}

test('le terminal simulé se pilote au clavier, valide la mission et la leçon', async ({ page }) => {
  await seed(page, [...TERMINAL_OPEN, 'decouvrir-le-terminal']);
  await page.goto(`/laboratoires/${TERMINAL_LAB.id}`);
  await expect(page.getByRole('heading', { level: 1, name: TERMINAL_LAB.title })).toBeVisible();
  const log = page.getByRole('log', { name: 'Sortie du terminal' });

  await type(page, 'ls');
  await expect(log).toContainText('Documents/  Images/  notes.txt');
  await type(page, 'rm notes.txt');
  await expect(log).toContainText('rm: commande désactivée');
  // Flèche haut : la dernière commande revient, comme dans un vrai terminal.
  await page.getByLabel(/Commande à exécuter/).press('ArrowUp');
  await expect(page.getByLabel(/Commande à exécuter/)).toHaveValue('rm notes.txt');

  await type(page, 'cd Documents/incidents');
  await expect(page.getByLabel(/Commande à exécuter/)).toHaveAccessibleName(
    /eleve@cyberlab:~\/Documents\/incidents\$/,
  );
  await type(page, 'cat rapport-incident.txt');
  await expect(log).toContainText('RAPPORT D’INCIDENT N° 42');
  await expect(log).toContainText(`Objectif atteint : ${TERMINAL_LAB.tasks[0].text}.`);
  for (const command of ['cd ~', 'mkdir enquete', 'cd enquete', 'touch indices.txt']) {
    await type(page, command);
  }

  await expect(page.getByRole('heading', { level: 2, name: 'Laboratoire réussi' })).toBeFocused();
  await expect(
    page.getByText('Mission accomplie en 8 commandes, dont 1 refusée ou en erreur'),
  ).toBeVisible();
  await expect(page.getByText('La leçon « Découvrir le terminal » est validée.')).toBeVisible();
  await expect(page.getByLabel(/Commande à exécuter/)).toBeDisabled();

  await page.getByRole('link', { name: 'Revenir à la leçon' }).click();
  await expect(page.getByRole('link', { name: 'Refaire le laboratoire' })).toBeVisible();
});

test('le détecteur d’hameçonnage ne corrige qu’après l’analyse, puis dresse le bilan', async ({
  page,
}) => {
  await seed(page, PHISHING_OPEN);
  await page.goto(`/laboratoires/${PHISHING_LAB.id}`);
  await page.getByRole('button', { name: 'Afficher un indice (3 restants)' }).click();
  await expect(page.getByText(PHISHING_LAB.hints[0])).toBeVisible();

  for (const [i, email] of PHISHING_LAB.emails.entries()) {
    await expect(page.getByText(`E-mail ${i + 1} sur ${PHISHING_LAB.emails.length}`)).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: email.subject })).toBeVisible();
    await expect(page.getByText(email.verdict)).toHaveCount(0); // rien avant l'envoi

    await page.getByRole('button', { name: 'Afficher l’adresse réelle' }).click();
    await expect(page.getByText(`<${email.fromAddress}>`)).toBeVisible();
    if (email.link) {
      await page.getByRole('button', { name: 'Vérifier la destination du lien' }).click();
      await expect(page.getByText(email.link.url)).toBeVisible();
    }
    for (const zone of EMAIL_ZONES.filter((z) => email.zones[z.id]?.suspicious)) {
      await page.getByRole('checkbox', { name: zone.label }).check();
    }
    await page
      .getByRole('radio', { name: email.phishing ? 'Hameçonnage' : 'Message légitime' })
      .check();
    await page.getByRole('button', { name: 'Valider mon analyse' }).click();

    await expect(page.getByRole('heading', { level: 3, name: 'Analyse juste' })).toBeFocused();
    await expect(page.getByText(email.verdict)).toBeVisible();
    const last = i === PHISHING_LAB.emails.length - 1;
    await page.getByRole('button', { name: last ? 'Voir le bilan' : 'E-mail suivant' }).click();
  }

  await expect(page.getByRole('heading', { level: 2, name: 'Laboratoire réussi' })).toBeFocused();
  await expect(page.getByText('E-mails correctement analysés : 5 sur 5.')).toBeVisible();
  await expect(page.getByText('Indices utilisés : 1 sur 3.')).toBeVisible();
  await expect(page.getByText(/il faut aussi réussir son quiz/)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Passer le quiz' })).toBeVisible();
});

test('une analyse fausse fait échouer le laboratoire, et la tentative est enregistrée', async ({
  page,
}) => {
  await seed(page, PHISHING_OPEN);
  await page.goto(`/laboratoires/${PHISHING_LAB.id}`);
  for (const i of PHISHING_LAB.emails.keys()) {
    await page.getByRole('radio', { name: 'Message légitime' }).check();
    await page.getByRole('button', { name: 'Valider mon analyse' }).click();
    if (i === 0) {
      await expect(page.getByRole('heading', { level: 3, name: 'Analyse à revoir' })).toBeVisible();
      await expect(page.getByText('L’expéditeur : indice manqué.')).toBeVisible();
    }
    await page.getByRole('button', { name: /E-mail suivant|Voir le bilan/ }).click();
  }
  await expect(
    page.getByRole('heading', { level: 2, name: 'Laboratoire pas encore réussi' }),
  ).toBeFocused();
  await expect(page.getByText('E-mails correctement analysés : 2 sur 5.')).toBeVisible();

  await page.getByRole('button', { name: 'Recommencer le laboratoire' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.getByText('E-mail 1 sur 5')).toBeVisible();

  await page.goto('/laboratoires');
  await expect(page.getByText('Pas encore réussi · Tentatives : 1')).toBeVisible();
});

test('sans progression, les laboratoires sont verrouillés et le disent', async ({ page }) => {
  await page.goto('/laboratoires');
  await expect(page.getByText(/^Accessible après la leçon/)).toHaveCount(2);
  await expect(page.getByRole('link', { name: 'Ouvrir le laboratoire' })).toHaveCount(0);
  await page.goto(`/laboratoires/${PHISHING_LAB.id}`);
  await expect(
    page.getByRole('heading', { level: 2, name: 'Laboratoire verrouillé' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Boîte de réception' })).toHaveCount(0);
});

test('les laboratoires ouverts respectent WCAG 2.2 AA dans les deux thèmes', async ({ page }) => {
  await seed(page, PHISHING_OPEN);
  for (const colorScheme of ['dark', 'light'] as const) {
    await page.emulateMedia({ colorScheme });
    const audit = async (state: string) => {
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
      expect(violations, `${state}, thème ${colorScheme}`).toEqual([]);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `défilement horizontal : ${state}`).toBeLessThanOrEqual(0);
    };

    await page.goto(`/laboratoires/${TERMINAL_LAB.id}`);
    await type(page, 'ls -l');
    await type(page, 'commande-inconnue');
    await audit('terminal avec sorties et erreur');

    await page.goto(`/laboratoires/${PHISHING_LAB.id}`);
    await page.getByRole('button', { name: 'Afficher l’adresse réelle' }).click();
    await page.getByRole('button', { name: 'Vérifier la destination du lien' }).click();
    await audit('e-mail inspecté');
    await page.getByRole('checkbox', { name: 'L’objet' }).check();
    await page.getByRole('radio', { name: 'Hameçonnage' }).check();
    await page.getByRole('button', { name: 'Valider mon analyse' }).click();
    await expect(page.getByRole('heading', { level: 3, name: 'Analyse à revoir' })).toBeVisible();
    await audit('correction affichée');
  }
});
