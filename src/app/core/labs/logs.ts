import { LogEntry, LogQuestion, LogsLab } from '../models/content.model';

/** Filtres de l'analyseur : texte libre, type d'événement, adresse IP ('' = tous). */
export interface LogFilter {
  readonly text: string;
  readonly event: string;
  readonly ip: string;
}

export const NO_FILTER: LogFilter = { text: '', event: '', ip: '' };

/** Lignes qui passent tous les filtres, dans l'ordre chronologique. */
export function filterLogs(entries: readonly LogEntry[], filter: LogFilter): LogEntry[] {
  const text = filter.text.trim().toLocaleLowerCase('fr');
  return [...entries]
    .sort((a, b) => a.time.localeCompare(b.time))
    .filter(
      (entry) =>
        (filter.event === '' || entry.event === filter.event) &&
        (filter.ip === '' || entry.ip === filter.ip) &&
        (text === '' ||
          [entry.time, entry.host, entry.event, entry.account, entry.ip, entry.detail].some(
            (field) => field.toLocaleLowerCase('fr').includes(text),
          )),
    );
}

/** Valeurs proposées dans un filtre, sans doublon, triées. */
export function distinctValues(entries: readonly LogEntry[], field: 'event' | 'ip'): string[] {
  return [...new Set(entries.map((entry) => entry[field]))].sort((a, b) =>
    a.localeCompare(b, 'fr'),
  );
}

export interface LogQuestionResult {
  readonly question: LogQuestion;
  readonly given: string | null;
  readonly correct: boolean;
}

/** Le laboratoire est réussi quand toutes les conclusions de l'enquête sont justes. */
export function gradeLogQuestions(
  lab: LogsLab,
  answers: ReadonlyMap<string, string>,
): { readonly results: readonly LogQuestionResult[]; readonly passed: boolean } {
  const results = lab.questions.map((question) => {
    const given = answers.get(question.id) ?? null;
    return { question, given, correct: given === question.answer };
  });
  return { results, passed: results.every((r) => r.correct) };
}
