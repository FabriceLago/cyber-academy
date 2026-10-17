import { ChoiceQuestion } from '../models/content.model';
import { choiceOptions, isChoiceCorrect } from './choice';

const base = { id: 'q', objectiveId: 'o', difficulty: 1 as const, prompt: '?', explanation: '!' };
const option = (id: string, correct: boolean) => ({ id, label: id, correct, feedback: id });
const single: ChoiceQuestion = {
  ...base,
  type: 'single',
  options: [option('a', true), option('b', false)],
};
const multiple: ChoiceQuestion = {
  ...base,
  type: 'multiple',
  options: [option('a', true), option('b', true), option('c', false)],
};

describe('isChoiceCorrect', () => {
  it('choix unique : juste seulement avec la bonne option', () => {
    expect(isChoiceCorrect(single, new Set(['a']))).toBe(true);
    expect(isChoiceCorrect(single, new Set(['b']))).toBe(false);
  });

  it('choix multiples : il faut toutes les bonnes options, et aucune mauvaise', () => {
    expect(isChoiceCorrect(multiple, new Set(['a', 'b']))).toBe(true);
    expect(isChoiceCorrect(multiple, new Set(['a']))).toBe(false);
    expect(isChoiceCorrect(multiple, new Set(['a', 'b', 'c']))).toBe(false);
  });

  it('vrai ou faux : propose « Vrai » et « Faux » et corrige selon la réponse attendue', () => {
    const statement = { ...base, type: 'true-false' as const, answer: false };
    expect(choiceOptions(statement).map((o) => o.label)).toEqual(['Vrai', 'Faux']);
    expect(isChoiceCorrect(statement, new Set(['false']))).toBe(true);
    expect(isChoiceCorrect(statement, new Set(['true']))).toBe(false);
  });
});
