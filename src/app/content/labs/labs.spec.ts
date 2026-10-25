import { MIN_CLUES, zonesOf } from '../../core/labs/phishing';
import { isTaskDone, runCommand, startTerminal } from '../../core/labs/terminal';
import { LABS, PATHS } from '../catalog';
import { PHISHING_LAB } from './lab-phishing';
import { SAUVEGARDE_LAB } from './lab-sauvegarde';
import { TERMINAL_LAB } from './lab-terminal';

describe('contenu des laboratoires', () => {
  it('chaque laboratoire accompagne exactement une leçon', () => {
    const lessons = PATHS.flatMap((p) => p.modules.flatMap((m) => m.lessons));
    for (const lab of LABS) {
      expect(lessons.filter((l) => l.labId === lab.id)).toHaveLength(1);
    }
  });

  it('terminal : aucune tâche n’est faite au départ, et la solution les remplit toutes', () => {
    let state = startTerminal(TERMINAL_LAB);
    expect(TERMINAL_LAB.tasks.some((t) => isTaskDone(state, t))).toBe(false);
    for (const line of [
      'cd Documents/incidents',
      'cat rapport-incident.txt',
      'cd ~',
      'mkdir enquete',
      'cd enquete',
      'touch indices.txt',
    ]) {
      const result = runCommand(TERMINAL_LAB, state, line);
      expect(result.error, line).toBe(false);
      state = result.state;
    }
    expect(TERMINAL_LAB.tasks.every((t) => isTaskDone(state, t))).toBe(true);
  });

  it('sauvegarde : aucune tâche n’est faite au départ, et la solution les remplit toutes', () => {
    let state = startTerminal(SAUVEGARDE_LAB);
    expect(SAUVEGARDE_LAB.tasks.some((t) => isTaskDone(state, t))).toBe(false);
    for (const line of [
      'ls -a',
      'cat .consignes',
      'mv Téléchargements/facture-octobre.pdf Documents/',
      'mkdir /media/cle-usb/Sauvegarde-2026',
      'cp -r Documents /media/cle-usb/Sauvegarde-2026/',
      'cp -r Images /media/cle-usb/Sauvegarde-2026/',
      'ls /media/cle-usb/Sauvegarde-2026',
    ]) {
      const result = runCommand(SAUVEGARDE_LAB, state, line);
      expect(result.error, line).toBe(false);
      state = result.state;
    }
    expect(SAUVEGARDE_LAB.tasks.every((t) => isTaskDone(state, t))).toBe(true);
  });

  it('sauvegarde : copier la facture au lieu de la déplacer laisse une tâche à faire', () => {
    let state = startTerminal(SAUVEGARDE_LAB);
    state = runCommand(
      SAUVEGARDE_LAB,
      state,
      'cp Téléchargements/facture-octobre.pdf Documents/',
    ).state;
    const done = SAUVEGARDE_LAB.tasks.filter((t) => isTaskDone(state, t)).map((t) => t.id);
    expect(done).toEqual(['ranger-facture']);
  });

  it('hameçonnage : des pièges et des messages légitimes, analysables sans ambiguïté', () => {
    const { emails } = PHISHING_LAB;
    expect(emails.some((e) => e.phishing)).toBe(true);
    expect(emails.some((e) => !e.phishing)).toBe(true);
    for (const email of emails) {
      const suspicious = zonesOf(email).filter((id) => email.zones[id]?.suspicious);
      if (email.phishing) expect(suspicious.length, email.id).toBeGreaterThanOrEqual(MIN_CLUES);
      else expect(suspicious, email.id).toEqual([]);
      expect(email.zones.lien !== undefined, email.id).toBe(email.link !== undefined);
      expect(email.zones['piece-jointe'] !== undefined, email.id).toBe(
        email.attachment !== undefined,
      );
    }
  });

  it('hameçonnage : toutes les adresses et tous les liens sont fictifs (domaines .example)', () => {
    for (const email of PHISHING_LAB.emails) {
      expect(email.fromAddress).toMatch(/^[\w.-]+@[\w.-]+\.example$/);
      if (email.link) expect(new URL(email.link.url).hostname).toMatch(/\.example$/);
    }
  });
});
