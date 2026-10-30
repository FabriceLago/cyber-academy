import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KIND_LABELS, TOOLS, TOOLS_BY_DOMAIN } from './tools';

/**
 * Outils du métier (/outils) : logiciels et services réels, rangés par domaine. Le build en écrit
 * aussi une version statique (scripts/prerender-glossary.mjs) pour les moteurs de recherche.
 */
@Component({
  selector: 'ca-tools-page',
  imports: [RouterLink],
  template: `
    <header class="page-header">
      <p class="eyebrow">Outils du métier</p>
      <h1>Les outils des professionnels</h1>
      <p>
        {{ count }} logiciels et services réels, libres ou gratuits, utilisés en cybersécurité.
        Chaque fiche dit à quoi sert l’outil, qui l’utilise, quelle leçon y prépare et comment faire
        un premier essai sans risque.
      </p>
    </header>

    <aside class="card rule" aria-labelledby="regle-titre">
      <h2 id="regle-titre">La règle d’or</h2>
      <p>
        Servez-vous de ces outils uniquement sur vos propres appareils, ou avec l’autorisation
        écrite de leur propriétaire. Cyber Academy ne fournit aucun téléchargement : chaque fiche
        renvoie au site officiel de l’outil.
      </p>
    </aside>

    @for (group of groups; track group.domain) {
      <section [attr.aria-labelledby]="'domaine-' + group.domain">
        <h2 [id]="'domaine-' + group.domain">{{ group.label }}</h2>
        <p class="hint">{{ group.description }}</p>
        <ul class="grid">
          @for (tool of group.tools; track tool.id) {
            <li class="card">
              <h3>
                <a [routerLink]="['/outils', tool.id]">{{ tool.name }}</a>
              </h3>
              <p>{{ tool.summary }}</p>
              <p class="hint">{{ kinds[tool.kind] }}</p>
            </li>
          }
        </ul>
      </section>
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--space-5);
    }

    .rule h2,
    .grid h3 {
      margin-top: 0;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
      gap: var(--space-3);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .grid .card {
      display: grid;
      align-content: start;
      gap: var(--space-2);
    }

    .grid p {
      margin: 0;
    }

    .hint {
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }
  `,
})
export class ToolsPage {
  protected readonly groups = TOOLS_BY_DOMAIN;
  protected readonly kinds = KIND_LABELS;
  protected readonly count = TOOLS.length;
}
