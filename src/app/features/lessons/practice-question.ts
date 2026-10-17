import { Component, computed, input, signal } from '@angular/core';
import { ChoiceLikeQuestion, choiceOptions, isChoiceCorrect } from '../../core/quiz/choice';
import { Icon } from '../../shared/icon/icon';

/**
 * Question d'entraînement : l'apprenant répond, demande des indices s'il le souhaite, puis
 * vérifie. La correction (bonne réponse et explication de chaque option) n'apparaît qu'après.
 * Rien n'est enregistré : c'est de l'entraînement, pas une évaluation.
 */
@Component({
  selector: 'ca-practice-question',
  imports: [Icon],
  template: `
    <fieldset [disabled]="checked()">
      <legend>{{ question().prompt }}</legend>
      @if (question().context; as context) {
        <pre class="context">{{ context.text }}</pre>
      }
      @if (multiple()) {
        <p class="hint">Plusieurs réponses possibles.</p>
      }
      @for (option of options(); track option.id) {
        <label class="option">
          <input
            [type]="multiple() ? 'checkbox' : 'radio'"
            [name]="question().id"
            [checked]="selected().has(option.id)"
            (change)="toggle(option.id)"
          />
          {{ option.label }}
        </label>
      }
    </fieldset>

    <div class="actions">
      <button
        type="button"
        class="btn btn-primary"
        [disabled]="checked() || selected().size === 0"
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

    <div role="status">
      @if (checked()) {
        <div class="feedback" [class.success]="correct()">
          <p>
            <strong>{{ correct() ? 'Bonne réponse.' : 'Pas tout à fait.' }}</strong>
            {{ question().explanation }}
          </p>
          <ul>
            @for (option of options(); track option.id) {
              <li>
                <ca-icon [name]="option.correct ? 'check' : 'close'" />
                <span>
                  <span class="visually-hidden">{{
                    option.correct ? 'Bonne réponse :' : 'Mauvaise réponse :'
                  }}</span>
                  {{ option.label }}
                  @if (option.feedback) {
                    — {{ option.feedback }}
                  }
                </span>
              </li>
            }
          </ul>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--space-3);
    }

    fieldset {
      display: grid;
      gap: var(--space-2);
      margin: 0;
      padding: 0;
      border: 0;
    }

    legend {
      margin-bottom: var(--space-2);
      font-weight: 600;
    }

    .context {
      margin: 0 0 var(--space-2);
      padding: var(--space-3);
      border-radius: var(--radius-md);
      background: var(--color-surface-raised);
      font-size: var(--text-sm);
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }

    .option {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      min-height: var(--target-min);
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      cursor: pointer;
    }

    .option:has(input:checked) {
      border-color: var(--color-accent);
      background: var(--color-accent-soft);
    }

    input {
      flex-shrink: 0;
      width: 1.25rem;
      height: 1.25rem;
      margin: 0;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .hint {
      margin: 0;
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }

    .feedback {
      padding: var(--space-3) var(--space-4);
      border-left: 4px solid var(--color-warning);
      border-radius: var(--radius-md);
      background: var(--color-surface-raised);
    }

    .feedback.success {
      border-left-color: var(--color-success);
    }

    .feedback p {
      margin: 0 0 var(--space-2);
    }

    .feedback ul {
      display: grid;
      gap: var(--space-1);
      margin: 0;
      padding: 0;
      list-style: none;
      font-size: var(--text-sm);
    }

    .feedback li {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: var(--space-2);
    }
  `,
})
export class PracticeQuestion {
  readonly question = input.required<ChoiceLikeQuestion>();
  readonly hints = input<readonly string[]>([]);

  protected readonly options = computed(() => choiceOptions(this.question()));
  protected readonly multiple = computed(() => this.question().type === 'multiple');
  protected readonly selected = signal<ReadonlySet<string>>(new Set());
  protected readonly checked = signal(false);
  protected readonly shownHints = signal(0);
  protected readonly correct = computed(() => isChoiceCorrect(this.question(), this.selected()));

  protected toggle(id: string): void {
    if (!this.multiple()) {
      this.selected.set(new Set([id]));
      return;
    }
    const next = new Set(this.selected());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.selected.set(next);
  }

  protected retry(): void {
    this.selected.set(new Set());
    this.checked.set(false);
  }
}
