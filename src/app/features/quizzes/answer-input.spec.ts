import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PATHS } from '../../content/catalog';
import { Question } from '../../core/models/content.model';
import { Answer, initialAnswer, presentQuestion } from '../../core/quiz/quiz-engine';
import { AnswerInput } from './answer-input';

const QUESTIONS = PATHS.flatMap((p) => p.modules.flatMap((m) => m.lessons)).flatMap(
  (l) => l.quiz.questions,
);
function ofType(type: Question['type']): Question {
  const question = QUESTIONS.find((q) => q.type === type);
  if (!question) throw new Error(`Aucune question de type ${type} dans le catalogue.`);
  return question;
}

@Component({
  imports: [AnswerInput],
  template: `
    <ca-answer-input [presented]="presented()" [(answer)]="answer" [corrected]="corrected()" />
  `,
})
class Host {
  readonly presented = signal(presentQuestion(ofType('single'), () => 0));
  readonly answer = signal<Answer | null>(null);
  readonly corrected = signal(false);
}

async function render(question: Question) {
  const fixture = TestBed.createComponent(Host);
  const host = fixture.componentInstance;
  const presented = presentQuestion(question, () => 0);
  host.presented.set(presented);
  host.answer.set(initialAnswer(presented));
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  const stable = () => fixture.whenStable();
  return { host, root, stable };
}

describe('AnswerInput', () => {
  it.each(['single', 'multiple', 'true-false', 'matching', 'ordering'] as const)(
    '%s : aucune correction avant l’envoi, la correction complète après',
    async (type) => {
      const question = ofType(type);
      const { host, root, stable } = await render(question);
      expect(root.querySelector('.correction')).toBeNull();
      expect(root.textContent).not.toContain(question.explanation);
      expect(root.textContent).not.toContain('Bonne réponse :');
      expect(root.querySelector('fieldset')?.disabled).toBe(false);

      host.corrected.set(true);
      await stable();
      expect(root.querySelector('.correction')?.textContent).toContain(question.explanation);
      expect(root.querySelector('fieldset')?.disabled).toBe(true);
    },
  );

  it('choix unique : cocher une option remplace la précédente', async () => {
    const { host, root, stable } = await render(ofType('single'));
    const radios = [...root.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
    radios[0].click();
    radios[1].click();
    await stable();
    const answer = host.answer();
    expect(answer?.kind === 'choice' && [...answer.selected]).toHaveLength(1);
  });

  it('choix multiples : les options cochées s’ajoutent', async () => {
    const { host, root } = await render(ofType('multiple'));
    const boxes = [...root.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];
    boxes[0].click();
    boxes[1].click();
    const answer = host.answer();
    expect(answer?.kind === 'choice' && [...answer.selected]).toHaveLength(2);
  });

  it('association : chaque liste déroulante enregistre le choix', async () => {
    const question = ofType('matching');
    const { host, root } = await render(question);
    const select = root.querySelector('select') as HTMLSelectElement;
    select.value = select.options[1].value;
    select.dispatchEvent(new Event('change'));
    const answer = host.answer();
    expect(answer?.kind === 'matching' && answer.matches.size).toBe(1);
  });

  it('classement : les boutons déplacent l’étape et annoncent sa nouvelle position', async () => {
    const { host, root, stable } = await render(ofType('ordering'));
    const before = host.answer();
    const first = before?.kind === 'ordering' ? before.order[0] : '';
    const buttons = root.querySelectorAll<HTMLButtonElement>(`[data-item="${first}"] button`);
    expect(buttons[0].disabled).toBe(true); // Monter : déjà en tête
    buttons[1].click(); // Descendre
    await stable();
    const after = host.answer();
    expect(after?.kind === 'ordering' && after.order[1]).toBe(first);
    expect(root.querySelector('[aria-live="polite"]')?.textContent).toContain('en position 2');
  });
});
