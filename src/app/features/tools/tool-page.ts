import { Component, DestroyRef, computed, effect, inject, input } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { KIND_LABELS, TOOL_DOMAINS, findTool, preparation, verifiedLabel } from './tools';

/**
 * Fiche d'un outil du métier (/outils/<outil>). Le build en écrit aussi une version statique
 * (scripts/prerender-glossary.mjs), lisible sans JavaScript par les moteurs de recherche.
 */
@Component({
  selector: 'ca-tool-page',
  imports: [RouterLink],
  template: `
    @if (tool(); as tool) {
      <nav class="crumbs" aria-label="Fil d’Ariane">
        <a routerLink="/outils">Outils du métier</a> › {{ tool.name }}
      </nav>
      <header class="page-header">
        <p class="eyebrow">{{ domains[tool.domain].label }}</p>
        <h1>{{ tool.name }}</h1>
        <p>{{ tool.summary }}</p>
      </header>

      <section class="card stack" aria-labelledby="bref-titre">
        <h2 id="bref-titre">En bref</h2>
        <dl class="facts">
          <dt>Type</dt>
          <dd>{{ kinds[tool.kind] }}</dd>
          <dt>Licence</dt>
          <dd>{{ tool.licence }}</dd>
          <dt>Systèmes</dt>
          <dd>{{ tool.platforms }}</dd>
          <dt>Site officiel</dt>
          <dd>
            <a [href]="tool.website">{{ host() }}</a>
          </dd>
        </dl>
      </section>

      <section class="card stack" aria-labelledby="usage-titre">
        <h2 id="usage-titre">À quoi il sert</h2>
        <p>{{ tool.purpose }}</p>
        <h3>Qui l’utilise</h3>
        <p>{{ tool.users }}</p>
      </section>

      <section class="card stack" aria-labelledby="academie-titre">
        <h2 id="academie-titre">Dans Cyber Academy</h2>
        @if (links().length > 0) {
          <p>Pour comprendre ce que fait cet outil :</p>
          <ul>
            @for (link of links(); track link.path) {
              <li>
                <a [routerLink]="link.path">{{ link.title }}</a>
              </li>
            }
          </ul>
        }
        @if (tool.upcoming; as upcoming) {
          <p>À venir : {{ upcoming }}.</p>
        }
      </section>

      <section class="card stack" aria-labelledby="essai-titre">
        <h2 id="essai-titre">Pour s’y mettre sans risque</h2>
        <p>{{ tool.firstStep }}</p>
        @if (tool.warning; as warning) {
          <p class="warning"><strong>Attention :</strong> {{ warning }}</p>
        }
      </section>

      <p class="hint">
        Licence, systèmes et site vérifiés le {{ verified() }} sur le site officiel de l’outil.
      </p>
      <p>
        <a class="btn btn-secondary" routerLink="/outils">Tous les outils du métier</a>
      </p>
    } @else {
      <div class="status-page">
        <h1>Outil introuvable</h1>
        <p>Cet outil n’est pas dans la liste, ou son adresse a changé.</p>
        <a class="btn btn-primary" routerLink="/outils">Voir les outils du métier</a>
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

    .facts {
      display: grid;
      grid-template-columns: max-content 1fr;
      gap: var(--space-2) var(--space-4);
    }

    .facts dt {
      font-weight: 600;
    }

    .facts dd {
      margin: 0;
      overflow-wrap: anywhere;
    }

    .warning {
      padding: var(--space-3);
      border-left: 4px solid var(--color-danger);
      background: var(--color-surface);
    }

    .hint {
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }
  `,
})
export class ToolPage {
  /** Paramètre de l'adresse : /outils/<outil>. */
  readonly outil = input.required<string>();
  protected readonly tool = computed(() => findTool(this.outil()));
  protected readonly links = computed(() => {
    const tool = this.tool();
    return tool ? preparation(tool) : [];
  });
  protected readonly host = computed(() => {
    const tool = this.tool();
    return tool ? new URL(tool.website).host.replace(/^www\./, '') : '';
  });
  protected readonly verified = computed(() => {
    const tool = this.tool();
    return tool ? verifiedLabel(tool.verifiedOn) : '';
  });
  protected readonly domains = TOOL_DOMAINS;
  protected readonly kinds = KIND_LABELS;

  constructor() {
    // Description de la page : celle de l'outil, puis celle du site en quittant la page.
    const meta = inject(Meta);
    const site = meta.getTag('name="description"')?.content ?? '';
    effect(() => {
      const tool = this.tool();
      meta.updateTag({
        name: 'description',
        content: tool ? `${tool.name} : ${tool.summary} ${tool.purpose}` : site,
      });
    });
    inject(DestroyRef).onDestroy(() => meta.updateTag({ name: 'description', content: site }));
  }
}
