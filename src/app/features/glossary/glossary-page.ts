import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TERMS, searchGlossary } from './glossary';

@Component({
  selector: 'ca-glossary-page',
  imports: [RouterLink],
  template: `
    <header class="page-header">
      <p class="eyebrow">Référence</p>
      <h1>Glossaire</h1>
      <p>Tous les termes définis dans les leçons, avec un exemple et la leçon où les revoir.</p>
      <p>
        <a routerLink="/cartes-memoire">Réviser ces termes avec les cartes mémoire</a> ·
        <a routerLink="/outils">Les outils du métier</a>
      </p>
    </header>

    <div class="search card" role="search">
      <label for="glossary-query">Rechercher un terme ou une définition</label>
      <input
        #q
        id="glossary-query"
        type="search"
        autocomplete="off"
        spellcheck="false"
        maxlength="80"
        (input)="query.set(q.value)"
      />
      <p class="muted" role="status">
        @if (query().trim() === '') {
          {{ total }} termes
        } @else {
          {{ results().length }} {{ results().length > 1 ? 'termes trouvés' : 'terme trouvé' }} sur
          {{ total }}
        }
      </p>
    </div>

    @if (results().length > 0) {
      <dl class="terms">
        @for (term of results(); track term.term) {
          <div class="card">
            <dt>
              <a [routerLink]="['/glossaire', term.slug]">{{ term.term }}</a>
            </dt>
            <dd>{{ term.definition }}</dd>
            <dd class="muted">Exemple : {{ term.example }}</dd>
            <dd class="muted">
              Vu dans :
              @for (lesson of term.lessons; track lesson.id; let last = $last) {
                <a [routerLink]="['/lecons', lesson.id]">{{ lesson.title }}</a
                >{{ last ? '' : ', ' }}
              }
            </dd>
          </div>
        }
      </dl>
    } @else {
      <p class="card">
        Aucun terme ne correspond. Essayez un mot plus court ou une autre orthographe.
      </p>
    }
  `,
  styles: `
    .search {
      display: grid;
      gap: var(--space-2);
      margin-bottom: var(--space-5);
    }

    .search label {
      font-weight: 650;
    }

    .search p {
      margin: 0;
    }

    input {
      width: 100%;
      min-height: var(--target-min);
      padding: 0 var(--space-3);
      border: 1px solid var(--color-control-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      color: var(--color-text);
      font: inherit;
    }

    .terms {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
      gap: var(--space-4);
      margin: 0;
    }

    .terms > div {
      display: grid;
      align-content: start;
      gap: var(--space-2);
    }

    dt {
      font-family: var(--font-display);
      font-size: var(--text-lg);
      font-weight: 700;
    }

    dd {
      margin: 0;
    }

    .muted {
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }
  `,
})
export class GlossaryPage {
  protected readonly total = TERMS.length;
  protected readonly query = signal('');
  protected readonly results = computed(() => searchGlossary(TERMS, this.query()));
}
