import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PATHS } from '../../content/catalog';
import { GlossaryEntry, Lesson } from '../../core/models/content.model';

export interface GlossaryTerm extends GlossaryEntry {
  /** Leçons où le terme est défini, dans l'ordre du catalogue. */
  readonly lessons: readonly Pick<Lesson, 'id' | 'title'>[];
}

/** Minuscules sans accents : « Hameçonnage » et « hameconnage » se retrouvent. */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

/** Termes de toutes les leçons, fusionnés s'ils reviennent, dans l'ordre alphabétique français. */
export function buildGlossary(lessons: readonly Lesson[]): GlossaryTerm[] {
  const byTerm = new Map<string, GlossaryTerm>();
  for (const lesson of lessons) {
    for (const entry of lesson.glossary) {
      const key = normalize(entry.term);
      const seen = { id: lesson.id, title: lesson.title };
      const known = byTerm.get(key);
      byTerm.set(
        key,
        known ? { ...known, lessons: [...known.lessons, seen] } : { ...entry, lessons: [seen] },
      );
    }
  }
  const collator = new Intl.Collator('fr', { sensitivity: 'base' });
  return [...byTerm.values()].sort((a, b) => collator.compare(a.term, b.term));
}

/** Recherche dans le terme et la définition, sans tenir compte des accents ni de la casse. */
export function searchGlossary(terms: readonly GlossaryTerm[], query: string): GlossaryTerm[] {
  const q = normalize(query);
  return q === ''
    ? [...terms]
    : terms.filter((t) => normalize(t.term).includes(q) || normalize(t.definition).includes(q));
}

const TERMS = buildGlossary(PATHS.flatMap((p) => p.modules.flatMap((m) => m.lessons)));

@Component({
  selector: 'ca-glossary-page',
  imports: [RouterLink],
  template: `
    <header class="page-header">
      <p class="eyebrow">Référence</p>
      <h1>Glossaire</h1>
      <p>Tous les termes définis dans les leçons, avec un exemple et la leçon où les revoir.</p>
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
            <dt>{{ term.term }}</dt>
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
