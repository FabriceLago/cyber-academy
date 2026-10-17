import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ProgressStore } from '../../core/progress/progress.store';
import { ThemePreference, ThemeService } from '../../core/theme/theme.service';
import { EmptyState } from '../../shared/empty-state/empty-state';

@Component({
  selector: 'ca-profile-page',
  imports: [EmptyState],
  template: `
    <header class="page-header">
      <h1>Profil et paramètres</h1>
      <p>Réglez l’affichage de la plateforme.</p>
    </header>

    <section class="card" aria-labelledby="apparence">
      <h2 id="apparence">Apparence</h2>
      <fieldset>
        <legend>Thème</legend>
        @for (option of themeOptions; track option.value) {
          <div class="choice">
            <input
              type="radio"
              name="theme"
              [id]="'theme-' + option.value"
              [value]="option.value"
              [checked]="theme.preference() === option.value"
              [attr.aria-describedby]="'theme-' + option.value + '-hint'"
              (change)="theme.preference.set(option.value)"
            />
            <label [attr.for]="'theme-' + option.value">{{ option.label }}</label>
            <span class="hint" [id]="'theme-' + option.value + '-hint'">{{ option.hint }}</span>
          </div>
        }
      </fieldset>
    </section>

    <section class="card" aria-labelledby="objectif">
      <h2 id="objectif">Objectif hebdomadaire</h2>
      <label class="field-label" for="weekly-goal">Leçons à valider chaque semaine</label>
      <select id="weekly-goal" aria-describedby="weekly-goal-hint" (change)="setWeeklyGoal($event)">
        <option value="" [selected]="weeklyGoal() === null">Aucun objectif</option>
        @for (goal of goalOptions; track goal) {
          <option [value]="goal" [selected]="weeklyGoal() === goal">
            {{ goal }} {{ goal > 1 ? 'leçons' : 'leçon' }}
          </option>
        }
      </select>
      <p class="hint" id="weekly-goal-hint">
        Facultatif. Le tableau de bord indique où vous en êtes depuis lundi.
      </p>
    </section>

    <section class="card" aria-labelledby="progression">
      <h2 id="progression">Progression</h2>
      <p class="hint">Vos tentatives de quiz et de laboratoire sont gardées dans ce navigateur.</p>
      @if (confirmingReset()) {
        <p>
          <strong>Effacer toutes vos tentatives de quiz et de laboratoire ?</strong> Cette action
          est définitive ; votre objectif hebdomadaire est conservé.
        </p>
        <div class="row">
          <button #confirmResetRef type="button" class="btn btn-primary" (click)="reset()">
            Oui, réinitialiser
          </button>
          <button type="button" class="btn btn-secondary" (click)="cancelReset()">Annuler</button>
        </div>
      } @else {
        <button #askResetRef type="button" class="btn btn-secondary" (click)="askReset()">
          Réinitialiser ma progression
        </button>
      }
      <p role="status" class="hint">{{ resetMessage() }}</p>
    </section>

    <ca-empty-state icon="user" heading="Compte utilisateur">
      <p>
        Le compte utilisateur arrive à l’étape 9 : votre progression pourra alors vous suivre d’un
        appareil à l’autre.
      </p>
    </ca-empty-state>
  `,
  styles: `
    section {
      margin-bottom: var(--space-5);
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

    .choice {
      display: grid;
      grid-template-columns: auto 1fr;
      column-gap: var(--space-3);
      align-items: center;
      padding: var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
    }

    .choice:has(input:checked) {
      border-color: var(--color-accent);
      background: var(--color-accent-soft);
    }

    input {
      width: 1.25rem;
      height: 1.25rem;
      margin: 0;
    }

    label {
      font-weight: 600;
      cursor: pointer;
    }

    .hint {
      grid-column: 2;
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }

    .field-label {
      display: block;
      margin-bottom: var(--space-2);
    }

    select {
      min-height: var(--target-min);
      padding: 0 var(--space-3);
      border: 1px solid var(--color-control-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      color: var(--color-text);
      font: inherit;
    }

    select + .hint {
      margin: var(--space-2) 0 0;
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    [role='status'] {
      margin: var(--space-2) 0 0;
    }
  `,
})
export class ProfilePage {
  private readonly progress = inject(ProgressStore);
  protected readonly weeklyGoal = computed(() => this.progress.state().weeklyGoal);
  protected readonly goalOptions = [1, 2, 3, 4, 5, 6, 7];

  protected setWeeklyGoal(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.progress.setWeeklyGoal(value === '' ? null : Number(value));
  }

  private readonly injector = inject(Injector);
  private readonly askResetButton = viewChild<ElementRef<HTMLButtonElement>>('askResetRef');
  private readonly confirmResetButton = viewChild<ElementRef<HTMLButtonElement>>('confirmResetRef');
  protected readonly confirmingReset = signal(false);
  protected readonly resetMessage = signal('');

  /** Le bouton cliqué disparaît : le focus passe au bouton suivant pour ne pas être perdu. */
  protected askReset(): void {
    this.resetMessage.set('');
    this.confirmingReset.set(true);
    this.focusAfterRender(() => this.confirmResetButton());
  }

  protected cancelReset(): void {
    this.confirmingReset.set(false);
    this.focusAfterRender(() => this.askResetButton());
  }

  protected reset(): void {
    this.progress.reset();
    this.resetMessage.set('Progression réinitialisée.');
    this.cancelReset();
  }

  private focusAfterRender(target: () => ElementRef<HTMLButtonElement> | undefined): void {
    afterNextRender(() => target()?.nativeElement.focus(), { injector: this.injector });
  }

  protected readonly theme = inject(ThemeService);
  protected readonly themeOptions: readonly {
    value: ThemePreference;
    label: string;
    hint: string;
  }[] = [
    {
      value: 'system',
      label: 'Selon l’appareil',
      hint: 'Suit le réglage clair ou sombre de votre système.',
    },
    { value: 'dark', label: 'Sombre', hint: 'Fond bleu nuit, texte clair.' },
    { value: 'light', label: 'Clair', hint: 'Fond clair, texte foncé.' },
  ];
}
