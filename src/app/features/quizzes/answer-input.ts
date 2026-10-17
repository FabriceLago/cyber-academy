import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import { ChoiceOption } from '../../core/models/content.model';
import { choiceOptions } from '../../core/quiz/choice';
import { Answer, PresentedQuestion } from '../../core/quiz/quiz-engine';
import { Icon } from '../../shared/icon/icon';

let nextId = 0;

/**
 * Saisie de la réponse à une question, pour les 5 types : choix unique ou multiple, vrai ou faux,
 * association (une liste déroulante par élément) et classement (boutons Monter / Descendre,
 * utilisables au clavier). Une fois `corrected`, la saisie est verrouillée et la correction
 * détaillée s'affiche ; jamais avant.
 */
@Component({
  selector: 'ca-answer-input',
  imports: [Icon],
  template: `
    <fieldset [disabled]="corrected()">
      <legend>{{ question().prompt }}</legend>
      @if (question().context; as context) {
        <pre class="context">{{ context.text }}</pre>
      }
      @switch (question().type) {
        @case ('matching') {
          <p class="hint">Pour chaque élément, choisissez l’association qui convient.</p>
          @for (pair of pairs(); track pair.id) {
            <div class="match">
              <label [for]="uid + '-' + pair.id">{{ pair.left }}</label>
              <select [id]="uid + '-' + pair.id" (change)="match(pair.id, $event)">
                <option value="" [selected]="!matches().has(pair.id)">Choisir…</option>
                @for (id of presented().order; track id) {
                  <option [value]="id" [selected]="matches().get(pair.id) === id">
                    {{ rightLabel(id) }}
                  </option>
                }
              </select>
            </div>
          }
        }
        @case ('ordering') {
          <p class="hint">Remettez les étapes dans l’ordre avec les boutons Monter et Descendre.</p>
          <ol class="order">
            @for (id of order(); track id; let i = $index, first = $first, last = $last) {
              <li [attr.data-item]="id">
                <span>{{ itemLabel(id) }}</span>
                <span class="moves">
                  <button
                    type="button"
                    class="btn btn-secondary btn-icon"
                    [disabled]="first"
                    [attr.aria-label]="'Monter « ' + itemLabel(id) + ' »'"
                    (click)="move(i, -1)"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    class="btn btn-secondary btn-icon"
                    [disabled]="last"
                    [attr.aria-label]="'Descendre « ' + itemLabel(id) + ' »'"
                    (click)="move(i, 1)"
                  >
                    ↓
                  </button>
                </span>
              </li>
            }
          </ol>
          <p class="visually-hidden" aria-live="polite">{{ announcement() }}</p>
        }
        @default {
          @if (question().type === 'multiple') {
            <p class="hint">Plusieurs réponses possibles.</p>
          }
          @for (option of choices(); track option.id) {
            <label class="option">
              <input
                [type]="question().type === 'multiple' ? 'checkbox' : 'radio'"
                [name]="uid"
                [checked]="selected().has(option.id)"
                (change)="toggle(option.id)"
              />
              {{ option.label }}
            </label>
          }
        }
      }
    </fieldset>

    @if (corrected()) {
      <div class="correction">
        <p>{{ question().explanation }}</p>
        @switch (question().type) {
          @case ('matching') {
            <ul>
              @for (pair of pairs(); track pair.id) {
                <li>
                  <ca-icon [name]="matches().get(pair.id) === pair.id ? 'check' : 'close'" />
                  <span>
                    {{ pair.left }} → {{ pair.right }}
                    @if (matches().get(pair.id) !== pair.id) {
                      (votre choix : {{ chosenRight(pair.id) }})
                    }
                  </span>
                </li>
              }
            </ul>
          }
          @case ('ordering') {
            <p>Ordre attendu :</p>
            <ol>
              @for (item of items(); track item.id) {
                <li>{{ item.label }}</li>
              }
            </ol>
          }
          @default {
            <ul>
              @for (option of choices(); track option.id) {
                <li>
                  <ca-icon [name]="option.correct ? 'check' : 'close'" />
                  <span>
                    <span class="visually-hidden">{{
                      option.correct ? 'Bonne réponse :' : 'Mauvaise réponse :'
                    }}</span>
                    {{ option.label }}{{ selected().has(option.id) ? ' (votre choix)' : '' }}
                    @if (option.feedback) {
                      — {{ option.feedback }}
                    }
                  </span>
                </li>
              }
            </ul>
          }
        }
      </div>
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--space-3);
    }

    fieldset {
      display: grid;
      gap: var(--space-2);
      min-inline-size: 0; /* par défaut, une fieldset refuse de rétrécir sous son contenu */
      margin: 0;
      padding: 0;
      border: 0;
      overflow-wrap: anywhere;
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

    .hint {
      margin: 0;
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }

    .option,
    .order li,
    .match {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-3);
      min-height: var(--target-min);
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
    }

    .option {
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

    .match {
      display: grid;
      gap: var(--space-2);
    }

    select {
      /* En pourcentage, la liste ne force plus la largeur de la page à celle de sa plus longue
         option (sinon défilement horizontal sur mobile). */
      width: 100%;
      min-height: var(--target-min);
      padding: 0 var(--space-2);
      border: 1px solid var(--color-control-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      color: var(--color-text);
      font: inherit;
    }

    .order {
      display: grid;
      gap: var(--space-2);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .order li > span:first-child {
      flex: 1 1 12rem;
    }

    .moves {
      display: flex;
      gap: var(--space-1);
    }

    .correction {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      background: var(--color-surface-raised);
      font-size: var(--text-sm);
    }

    .correction p {
      margin: 0 0 var(--space-2);
    }

    .correction ul {
      display: grid;
      gap: var(--space-1);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .correction ul li {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: var(--space-2);
    }
  `,
})
export class AnswerInput {
  readonly presented = input.required<PresentedQuestion>();
  readonly answer = model<Answer | null>(null);
  /** Après l'envoi : saisie verrouillée et correction détaillée affichée. */
  readonly corrected = input(false);

  protected readonly uid = `question-${++nextId}`;
  protected readonly announcement = signal('');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  protected readonly question = computed(() => this.presented().question);
  protected readonly choices = computed((): ChoiceOption[] => {
    const question = this.question();
    if (
      question.type !== 'single' &&
      question.type !== 'multiple' &&
      question.type !== 'true-false'
    ) {
      return [];
    }
    const options = choiceOptions(question);
    return this.presented()
      .order.map((id) => options.find((o) => o.id === id))
      .filter((o): o is ChoiceOption => o !== undefined);
  });
  protected readonly pairs = computed(() => {
    const question = this.question();
    return question.type === 'matching' ? question.pairs : [];
  });
  protected readonly items = computed(() => {
    const question = this.question();
    return question.type === 'ordering' ? question.items : [];
  });
  protected readonly selected = computed(() => {
    const answer = this.answer();
    return answer?.kind === 'choice' ? answer.selected : new Set<string>();
  });
  protected readonly matches = computed(() => {
    const answer = this.answer();
    return answer?.kind === 'matching' ? answer.matches : new Map<string, string>();
  });
  protected readonly order = computed(() => {
    const answer = this.answer();
    return answer?.kind === 'ordering' ? answer.order : this.presented().order;
  });

  protected rightLabel(pairId: string): string {
    return this.pairs().find((p) => p.id === pairId)?.right ?? '';
  }

  protected chosenRight(leftId: string): string {
    const chosen = this.matches().get(leftId);
    return chosen === undefined ? 'aucun' : this.rightLabel(chosen);
  }

  protected itemLabel(itemId: string): string {
    return this.items().find((item) => item.id === itemId)?.label ?? '';
  }

  protected toggle(optionId: string): void {
    const next = new Set(this.question().type === 'multiple' ? this.selected() : []);
    if (next.has(optionId)) next.delete(optionId);
    else next.add(optionId);
    this.answer.set({ kind: 'choice', selected: next });
  }

  protected match(leftId: string, event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const next = new Map(this.matches());
    if (value === '') next.delete(leftId);
    else next.set(leftId, value);
    this.answer.set({ kind: 'matching', matches: next });
  }

  protected move(index: number, delta: -1 | 1): void {
    const order = [...this.order()];
    const target = index + delta;
    [order[index], order[target]] = [order[target], order[index]];
    this.answer.set({ kind: 'ordering', order });
    const id = order[target];
    this.announcement.set(
      `« ${this.itemLabel(id)} » est maintenant en position ${target + 1} sur ${order.length}.`,
    );
    // L'élément déplacé change de place dans la page : on lui rend le focus.
    afterNextRender(
      () => {
        const buttons = [
          ...this.host.nativeElement.querySelectorAll<HTMLButtonElement>(
            `[data-item="${id}"] button`,
          ),
        ];
        const preferred = buttons[delta < 0 ? 0 : 1];
        (preferred && !preferred.disabled ? preferred : buttons.find((b) => !b.disabled))?.focus();
      },
      { injector: this.injector },
    );
  }
}
