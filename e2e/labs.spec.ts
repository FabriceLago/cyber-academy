import AxeBuilder from '@axe-core/playwright';
import { Page, expect, test } from '@playwright/test';
import { findLesson, findPath } from '../src/app/content/catalog';
import { PHISHING_LAB } from '../src/app/content/labs/lab-phishing';
import { SAUVEGARDE_LAB } from '../src/app/content/labs/lab-sauvegarde';
import { TERMINAL_LAB } from '../src/app/content/labs/lab-terminal';
import { EMAIL_ZONES } from '../src/app/core/labs/phishing';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/**
 * Démarre avec les quiz de ces leçons réussis à 100 % et ces laboratoires réussis (une seule
 * fois : les tentatives restent).
 */
async function seed(page: Page, lessonIds: string[], labIds: string[] = []) {
  const labAttempts = labIds.map((labId) => ({
    labId,
    completedAt: new Date().toISOString(),
    succeeded: true,
    hintsUsed: 0,
  }));
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
    JSON.stringify({ schemaVersion: 1, weeklyGoal: null, labAttempts, quizAttempts }),
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

test('le terminal vide le champ même quand Entrée suit la frappe avant tout rendu', async ({
  page,
}) => {
  await seed(page, TERMINAL_OPEN);
  await page.goto(`/laboratoires/${TERMINAL_LAB.id}`);
  const input = page.getByLabel(/Commande à exécuter/);
  // Frappe et Entrée dans la même tâche, comme un poste chargé qui les traite d'un bloc :
  // aucun rendu ne passe entre les deux.
  await input.evaluate((el: HTMLInputElement) => {
    el.value = 'ls';
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.form?.requestSubmit();
  });
  await expect(page.getByRole('log', { name: 'Sortie du terminal' })).toContainText(
    'Documents/  Images/  notes.txt',
  );
  await expect(input).toHaveValue('');
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

test('niveau 1 : la leçon pilote, son animation 3-2-1 et le laboratoire de sauvegarde', async ({
  page,
}) => {
  // Le niveau 1 s'ouvre quand le parcours Découverte est terminé (quiz et laboratoires).
  const decouverte = (findPath('decouverte')?.modules ?? []).flatMap((m) =>
    m.lessons.map((l) => l.id),
  );
  await seed(page, decouverte, [TERMINAL_LAB.id, PHISHING_LAB.id]);
  await page.goto('/lecons/mises-a-jour-et-sauvegardes');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mises à jour et sauvegardes');

  // Animation : les copies changent d'étape en étape.
  // exact : le titre du schéma, pour les lecteurs d'écran, reprend aussi ce décompte.
  const count = (text: string) => page.getByText(text, { exact: true });
  await expect(count('Copies intactes : 1 sur 3')).toBeVisible();
  const next = page.getByRole('button', { name: 'Étape suivante' });
  await next.click();
  await next.click();
  await expect(count('Copies intactes : 3 sur 3')).toBeVisible();
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(violations, 'leçon pilote').toEqual([]);

  // Laboratoire : fichiers cachés, déplacement, copies récursives.
  await page.goto(`/laboratoires/${SAUVEGARDE_LAB.id}`);
  const log = page.getByRole('log', { name: 'Sortie du terminal' });
  await type(page, 'ls');
  await expect(log).not.toContainText('.consignes');
  await type(page, 'ls -a');
  await expect(log).toContainText('.consignes');
  await type(page, 'cp Documents /media/cle-usb/');
  await expect(log).toContainText('cp: -r non spécifié');
  for (const command of [
    'cat .consignes',
    'mv Téléchargements/facture-octobre.pdf Documents/',
    'mkdir /media/cle-usb/Sauvegarde-2026',
    'cp -r Documents /media/cle-usb/Sauvegarde-2026/',
    'cp -r Images /media/cle-usb/Sauvegarde-2026/',
  ]) {
    await type(page, command);
  }
  await expect(page.getByRole('heading', { level: 2, name: 'Laboratoire réussi' })).toBeFocused();
  const audit = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(audit.violations, 'laboratoire de sauvegarde').toEqual([]);
});

test('sans progression, les laboratoires sont verrouillés et le disent', async ({ page }) => {
  await page.goto('/laboratoires');
  await expect(page.getByText(/^Accessible après la leçon/)).toHaveCount(4);
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
