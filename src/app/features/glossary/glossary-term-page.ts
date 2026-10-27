import { Component, DestroyRef, computed, effect, inject, input } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { findTerm } from './glossary';

/**
 * Page d'un terme du glossaire (/glossaire/<terme>). Le build en écrit aussi une version statique
 * (scripts/prerender-glossary.mjs), lisible sans JavaScript par les moteurs de recherche.
 */
@Component({
  selector: 'ca-glossary-term-page',
  imports: [RouterLink],
  template: `
    @if (term(); as term) {
      <nav class="crumbs" aria-label="Fil d’Ariane">
        <a routerLink="/glossaire">Glossaire</a> › {{ term.term }}
      </nav>
      <header class="page-header">
        <p class="eyebrow">Définition</p>
        <h1>{{ term.term }}</h1>
        <p>{{ term.definition }}</p>
      </header>
      <section class="card stack" aria-labelledby="exemple-titre">
        <h2 id="exemple-titre">Exemple</h2>
        <p>{{ term.example }}</p>
      </section>
      <section class="card stack" aria-labelledby="lecons-titre">
        <h2 id="lecons-titre">Pour aller plus loin</h2>
        <p>Ce terme est expliqué dans :</p>
        <ul>
          @for (lesson of term.lessons; track lesson.id) {
            <li>
              <a [routerLink]="['/lecons', lesson.id]">{{ lesson.title }}</a>
            </li>
          }
        </ul>
        <p class="actions">
          <a class="btn btn-secondary" routerLink="/glossaire">Tout le glossaire</a>
          <a routerLink="/cartes-memoire">Réviser avec les cartes mémoire</a>
        </p>
      </section>
    } @else {
      <div class="status-page">
        <h1>Terme introuvable</h1>
        <p>Ce terme n’est pas dans le glossaire, ou son adresse a changé.</p>
        <a class="btn btn-primary" routerLink="/glossaire">Voir le glossaire</a>
      </div>
    }
  `,
  styles: `
    .crumbs {
      margin-bottom: var(--space-3);
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }

    .stack {
      display: grid;
      gap: var(--space-3);
      margin-bottom: var(--space-4);
    }

    .stack > * {
      margin: 0;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-3);
    }
  `,
})
export class GlossaryTermPage {
  /** Paramètre de l'adresse : /glossaire/<terme>. */
  readonly terme = input.required<string>();
  protected readonly term = computed(() => findTerm(this.terme()));

  constructor() {
    // Description de la page : la définition du terme, puis celle du site en quittant la page.
    const meta = inject(Meta);
    const site = meta.getTag('name="description"')?.content ?? '';
    effect(() => {
      const term = this.term();
      meta.updateTag({
        name: 'description',
        content: term ? `${term.term} : ${term.definition}` : site,
      });
    });
    inject(DestroyRef).onDestroy(() => meta.updateTag({ name: 'description', content: site }));
  }
}
