import { LOGS_LAB } from '../../content/labs/lab-journaux';
import { NO_FILTER, distinctValues, filterLogs, gradeLogQuestions } from './logs';

const ATTACKER = '203.0.113.77';
const rightAnswers = () => new Map(LOGS_LAB.questions.map((q) => [q.id, q.answer]));

describe('analyseur de journaux', () => {
  it('sans filtre, rend toutes les lignes dans l’ordre chronologique', () => {
    const all = filterLogs(LOGS_LAB.entries, NO_FILTER);
    expect(all).toHaveLength(LOGS_LAB.entries.length);
    expect(all.map((e) => e.time)).toEqual([...all.map((e) => e.time)].sort());
  });

  it('combine les filtres par événement, par adresse IP et par texte (sans casse)', () => {
    const failures = filterLogs(LOGS_LAB.entries, {
      ...NO_FILTER,
      event: 'Échec de connexion',
      ip: ATTACKER,
    });
    expect(failures.length).toBeGreaterThanOrEqual(12);
    expect(failures.every((e) => e.event === 'Échec de connexion' && e.ip === ATTACKER)).toBe(true);

    const text = filterLogs(LOGS_LAB.entries, { ...NO_FILTER, text: '  C.MARTIN ' });
    expect(text.length).toBeGreaterThan(0);
    expect(text.every((e) => Object.values(e).join(' ').toLowerCase().includes('c.martin'))).toBe(
      true,
    );
  });

  it('propose chaque valeur de filtre une seule fois', () => {
    const ips = distinctValues(LOGS_LAB.entries, 'ip');
    expect(new Set(ips).size).toBe(ips.length);
    expect(ips).toContain(ATTACKER);
  });

  it('les journaux contiennent bien ce que l’enquête attend', () => {
    const attacker = filterLogs(LOGS_LAB.entries, { ...NO_FILTER, ip: ATTACKER });
    const success = attacker.find((e) => e.event === 'Connexion réussie');
    expect(success?.account).toBe('c.martin');
    expect(success?.time).toContain('02:14:52');
    expect(attacker.some((e) => e.event === 'Export de fichiers')).toBe(true);
  });

  it('chaque question a des identifiants uniques et sa réponse parmi les choix', () => {
    const ids = LOGS_LAB.questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const q of LOGS_LAB.questions) expect(q.options, q.id).toContain(q.answer);
  });

  it('réussi seulement si toutes les conclusions sont justes', () => {
    expect(gradeLogQuestions(LOGS_LAB, rightAnswers()).passed).toBe(true);

    const [first] = LOGS_LAB.questions;
    const wrong = rightAnswers();
    wrong.set(first.id, first.options.find((o) => o !== first.answer) ?? '');
    const graded = gradeLogQuestions(LOGS_LAB, wrong);
    expect(graded.passed).toBe(false);
    expect(graded.results.filter((r) => !r.correct).map((r) => r.question.id)).toEqual([first.id]);

    const missing = rightAnswers();
    missing.delete(first.id);
    const partial = gradeLogQuestions(LOGS_LAB, missing);
    expect(partial.passed).toBe(false);
    expect(partial.results[0].given).toBeNull();
  });
});
