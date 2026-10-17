import { Lesson, Objective, Question, Quiz } from '../models/content.model';
import { QuizAttempt } from '../models/progress.model';
import { isChoiceCorrect } from './choice';

/** Réponse de l'apprenant, selon le type de question. */
export type Answer =
  | { readonly kind: 'choice'; readonly selected: ReadonlySet<string> }
  /** Association : identifiant de la paire de gauche → identifiant de la paire choisie à droite. */
  | { readonly kind: 'matching'; readonly matches: ReadonlyMap<string, string> }
  | { readonly kind: 'ordering'; readonly order: readonly string[] };

/**
 * Question telle qu'elle est présentée : `order` fixe l'ordre d'affichage des options (choix),
 * de la colonne de droite (association) ou de départ des étapes (classement).
 */
export interface PresentedQuestion {
  readonly question: Question;
  readonly order: readonly string[];
}

/** Mélange les options, pour que la bonne réponse ne soit pas toujours à la même place. */
export function presentQuestion(question: Question, random = Math.random): PresentedQuestion {
  switch (question.type) {
    case 'single':
    case 'multiple':
      return {
        question,
        order: shuffle(
          question.options.map((o) => o.id),
          random,
        ),
      };
    case 'true-false':
      return { question, order: ['true', 'false'] };
    case 'matching':
      return {
        question,
        order: shuffle(
          question.pairs.map((p) => p.id),
          random,
        ),
      };
    case 'ordering': {
      // L'ordre de départ n'est jamais déjà le bon.
      const ids = question.items.map((item) => item.id);
      const order = shuffle(ids, random);
      const unchanged = order.every((id, i) => id === ids[i]);
      return { question, order: unchanged ? [...ids.slice(1), ids[0]] : order };
    }
  }
}

/**
 * Tire les questions d'une tentative : d'abord celles qui n'étaient pas dans la tentative
 * précédente (au moins une par objectif si possible), puis de la plus facile à la plus difficile.
 */
export function drawQuiz(
  quiz: Quiz,
  previousQuestionIds: readonly string[],
  random = Math.random,
): PresentedQuestion[] {
  const seen = new Set(previousQuestionIds);
  const fresh = shuffle(
    quiz.questions.filter((q) => !seen.has(q.id)),
    random,
  );
  const old = shuffle(
    quiz.questions.filter((q) => seen.has(q.id)),
    random,
  );
  const picked: Question[] = [];
  const add = (question: Question | undefined) => {
    if (question && picked.length < quiz.questionsPerAttempt && !picked.includes(question)) {
      picked.push(question);
    }
  };
  for (const objectiveId of new Set(fresh.map((q) => q.objectiveId))) {
    add(fresh.find((q) => q.objectiveId === objectiveId));
  }
  fresh.forEach(add);
  old.forEach(add);
  return picked.sort((a, b) => a.difficulty - b.difficulty).map((q) => presentQuestion(q, random));
}

/** Réponse de départ : vide, sauf pour un classement, qui part de l'ordre mélangé. */
export function initialAnswer(presented: PresentedQuestion): Answer | null {
  return presented.question.type === 'ordering'
    ? { kind: 'ordering', order: presented.order }
    : null;
}

export function isAnswerComplete(question: Question, answer: Answer | null): boolean {
  if (answer === null) return false;
  switch (answer.kind) {
    case 'choice':
      return answer.selected.size > 0;
    case 'matching':
      return question.type === 'matching' && question.pairs.every((p) => answer.matches.has(p.id));
    case 'ordering':
      return true;
  }
}

export function isAnswerCorrect(question: Question, answer: Answer | null): boolean {
  if (answer === null) return false;
  switch (question.type) {
    case 'single':
    case 'multiple':
    case 'true-false':
      return answer.kind === 'choice' && isChoiceCorrect(question, answer.selected);
    case 'matching':
      return (
        answer.kind === 'matching' && question.pairs.every((p) => answer.matches.get(p.id) === p.id)
      );
    case 'ordering':
      return (
        answer.kind === 'ordering' &&
        answer.order.length === question.items.length &&
        question.items.every((item, i) => answer.order[i] === item.id)
      );
  }
}

/** Notions mal comprises : objectifs des questions ratées, dans l'ordre de la leçon. */
export function objectivesToReview(lesson: Lesson, attempt: QuizAttempt): Objective[] {
  const correct = new Set(attempt.correctQuestionIds);
  const missed = new Set(
    lesson.quiz.questions
      .filter((q) => attempt.questionIds.includes(q.id) && !correct.has(q.id))
      .map((q) => q.objectiveId),
  );
  return lesson.objectives.filter((objective) => missed.has(objective.id));
}

/** Mélange de Fisher-Yates, sans modifier le tableau reçu. */
function shuffle<T>(values: readonly T[], random: () => number): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
