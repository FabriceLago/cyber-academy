import { Component, computed, input, linkedSignal, signal } from '@angular/core';
import {
  PresentedQuestion,
  initialAnswer,
  isAnswerComplete,
  isAnswerCorrect,
} from '../../core/quiz/quiz-engine';
import { AnswerInput } from '../quizzes/answer-input';

/**
 * Question d'entraînement : l'apprenant répond, demande des indices s'il le souhaite, puis
 * vérifie. La correction n'apparaît qu'après. Rien n'est enregistré : c'est de l'entraînement.
 */
@Component({
  selector: 'ca-practice-question',
  imports: [AnswerInput],
  template: `
    <ca-answer-input [presented]="presented()" [(answer)]="answer" [corrected]="checked()" />

    <div class="actions">
      <button
        type="button"
        class="btn btn-primary"
        [disabled]="checked() || !complete()"
        (click)="checked.set(true)"
      >
        Vérifier
      </button>
      @if (!checked() && shownHints() < hints().length) {
        <button type="button" class="btn btn-secondary" (click)="shownHints.set(shownHints() + 1)">
          Afficher un indice
        </button>
      }
      @if (checked()) {
        <button type="button" class="btn btn-secondary" (click)="retry()">Réessayer</button>
      }
    </div>

    @for (hint of hints().slice(0, shownHints()); track $index) {
      <p class="hint">
        <strong>Indice {{ $index + 1 }} :</strong> {{ hint }}
      </p>
    }

    <p role="status" class="verdict" [class.success]="checked() && correct()">
      @if (checked()) {
        <strong>{{ correct() ? 'Bonne réponse.' : 'Pas tout à fait.' }}</strong>
        {{ correct() ? '' : 'Relisez la correction ci-dessus, puis réessayez.' }}
      }
    </p>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--space-3);
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .hint,
    .verdict {
      margin: 0;
    }

    .hint {
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }

    .verdict:not(:empty) {
      padding-left: var(--space-3);
      border-left: 4px solid var(--color-warning);
    }

    .verdict.success {
      border-left-color: var(--color-success);
    }
  `,
})
export class PracticeQuestion {
  readonly presented = input.required<PresentedQuestion>();
  readonly hints = input<readonly string[]>([]);

  protected readonly answer = linkedSignal(() => initialAnswer(this.presented()));
  protected readonly checked = signal(false);
  protected readonly shownHints = signal(0);
  protected readonly complete = computed(() =>
    isAnswerComplete(this.presented().question, this.answer()),
  );
  protected readonly correct = computed(() =>
    isAnswerCorrect(this.presented().question, this.answer()),
  );

  protected retry(): void {
    this.answer.set(initialAnswer(this.presented()));
    this.checked.set(false);
  }
}
