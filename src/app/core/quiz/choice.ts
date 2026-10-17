import { ChoiceOption, ChoiceQuestion, Question, TrueFalseQuestion } from '../models/content.model';

/** Questions à options : choix unique, choix multiples, vrai ou faux. */
export type ChoiceLikeQuestion = ChoiceQuestion | TrueFalseQuestion;

export function asChoiceQuestion(question: Question): ChoiceLikeQuestion | null {
  return question.type === 'single' ||
    question.type === 'multiple' ||
    question.type === 'true-false'
    ? question
    : null;
}

/** Options proposées à l'apprenant ; un vrai ou faux devient le choix « Vrai » / « Faux ». */
export function choiceOptions(question: ChoiceLikeQuestion): readonly ChoiceOption[] {
  if (question.type !== 'true-false') return question.options;
  return [
    { id: 'true', label: 'Vrai', correct: question.answer, feedback: '' },
    { id: 'false', label: 'Faux', correct: !question.answer, feedback: '' },
  ];
}

/** Juste si toutes les bonnes options sont cochées, et seulement elles. */
export function isChoiceCorrect(
  question: ChoiceLikeQuestion,
  selected: ReadonlySet<string>,
): boolean {
  return choiceOptions(question).every((option) => option.correct === selected.has(option.id));
}
