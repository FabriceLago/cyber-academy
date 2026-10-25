import { Component, DOCUMENT, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATALOG, PATHS } from '../../content/catalog';
import { parseDraft } from '../../core/progress/portfolio';
import { summarizeProgress } from '../../core/progress/progress';
import { ProgressStore } from '../../core/progress/progress.store';
import { SubscriptionService } from '../../core/subscription/subscription.service';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { Icon } from '../../shared/icon/icon';

/**
 * Projets finaux des spécialisations : leur sujet, l'état du brouillon gardé dans ce navigateur
 * (clé ca-projet-<parcours>, écrite par la page du parcours) et l'avancement du parcours.
 */
@Component({
  selector: 'ca-projects-page',
  imports: [RouterLink, EmptyState, Icon],
  template: `
    <header class="page-header">
      <h1>Projets pratiques</h1>
      <p>
        Chaque spécialisation se termine par un projet : un livrable rédigé à partir d’un
        laboratoire, comme celui qu’on attendrait en poste, puis relu avec une grille d’évaluation.
      </p>
    </header>

    <ul class="projects">
      @for (item of projects(); track item.path.id) {
        <li class="card">
          <p class="eyebrow">Spécialisation · {{ item.role }}</p>
          <h2>{{ item.project.title }}</h2>
          <p>{{ item.project.brief }}</p>
          <p class="muted">
            Livrables : {{ item.project.deliverables.length }} · critères d’évaluation :
            {{ item.project.criteria.length }}
          </p>

          @let subscriberOnly = subscriptions.locked(item.path);
          <p class="state" [class.started]="item.started && !subscriberOnly">
            <ca-icon [name]="subscriberOnly ? 'lock' : item.started ? 'clock' : 'circle'" />
            @if (subscriberOnly) {
              Réservé aux abonnés{{
                item.started ? ' · votre brouillon reste gardé dans ce navigateur' : ''
              }}
            } @else if (item.started) {
              Brouillon commencé dans ce navigateur · critères cochés : {{ item.checked }} sur
              {{ item.project.criteria.length }}
            } @else {
              Pas encore commencé
            }
          </p>
          <p class="muted">
            @if (item.locked) {
              <ca-icon name="lock" /> Les leçons de ce parcours s’ouvrent après les parcours
              prérequis ; vous pouvez déjà lire le sujet.
            } @else {
              Leçons du parcours validées : {{ item.completed }} sur {{ item.total }}
            }
          </p>
          <p>
            @if (subscriberOnly) {
              <a class="btn btn-primary" routerLink="/abonnement">
                Voir l’abonnement<span class="visually-hidden"> : {{ item.project.title }}</span>
              </a>
            } @else {
              <a
                class="btn btn-primary"
                [routerLink]="['/parcours', item.path.id]"
                fragment="projet"
              >
                {{ item.started ? 'Reprendre le projet' : 'Ouvrir le projet' }}
                <span class="visually-hidden"> : {{ item.project.title }}</span>
              </a>
            }
          </p>
        </li>
      }
    </ul>

    <ca-empty-state icon="folder" heading="D’autres projets en préparation">
      <p>
        Les <a routerLink="/parcours">spécialisations en préparation</a> auront chacune leur projet
        final ; il apparaîtra ici quand elles seront rédigées. En attendant, les
        <a routerLink="/laboratoires">laboratoires</a> permettent de s’exercer sur des cas simulés.
      </p>
    </ca-empty-state>
  `,
  styles: `
    .projects {
      display: grid;
      gap: var(--space-5);
      margin: 0 0 var(--space-5);
      padding: 0;
      list-style: none;
    }

    .projects p {
      margin: 0 0 var(--space-3);
    }

    .muted {
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }

    .state {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-weight: 650;
    }

    .state.started {
      color: var(--color-warning);
    }

    ca-icon {
      width: 1.1rem;
      height: 1.1rem;
      vertical-align: text-bottom;
    }
  `,
})
export class ProjectsPage {
  private readonly progress = inject(ProgressStore);
  protected readonly subscriptions = inject(SubscriptionService);
  private readonly window = inject(DOCUMENT).defaultView;

  protected readonly projects = computed(() => {
    const summary = summarizeProgress(CATALOG, this.progress.state(), new Date());
    return PATHS.flatMap((path) => {
      if (!path.career) return [];
      const project = path.career.finalProject;
      const draft = parseDraft(this.read(`ca-projet-${path.id}`), project.criteria);
      const overview = summary.paths.find((p) => p.path.id === path.id);
      return [
        {
          path,
          role: path.career.role,
          project,
          started: draft.report.trim() !== '' || draft.checked.length > 0,
          checked: draft.checked.length,
          locked: overview?.lessons.every((l) => l.status === 'locked') ?? false,
          completed: overview?.completed ?? 0,
          total: overview?.lessons.length ?? 0,
        },
      ];
    });
  });

  private read(key: string): string | null {
    try {
      return this.window?.localStorage.getItem(key) ?? null;
    } catch {
      return null; // Stockage bloqué (navigation privée) : aucun brouillon lisible.
    }
  }
}
