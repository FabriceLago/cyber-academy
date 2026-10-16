import { Component, inject } from '@angular/core';
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

    <ca-empty-state icon="user" heading="Compte et progression">
      <p>
        L’objectif hebdomadaire et la réinitialisation de la progression arrivent à l’étape 5, le
        compte utilisateur à l’étape 9.
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
  `,
})
export class ProfilePage {
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
