import { PercentPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATALOG } from '../../content/catalog';
import { PathProgress, summarizeProgress } from '../../core/progress/progress';
import { ProgressStore } from '../../core/progress/progress.store';
import { Icon } from '../../shared/icon/icon';
import { ProgressBar } from '../../shared/progress-bar/progress-bar';
import { LEVELS, LessonList } from '../lessons/lesson-list';

/** Niveaux prévus par le programme ; affichés comme tels, sans contenu factice. */
const PLANNED = [
  'Culture informatique',
  'Réseaux informatiques',
  'Linux et administration système',
  'Fondamentaux de la cybersécurité',
  'SOC et analyste cybersécurité junior',
  'Sécurité web et applications',
  'Pentesting éthique',
  'Cloud et DevSecOps',
];

/** Spécialisations prévues, pas encore rédigées. */
const PLANNED_SPECIALIZATIONS = [
  'Pentester junior',
  'Ingénieur sécurité cloud junior',
  'Analyste vulnérabilités',
  'Développeur orienté sécurité',
  'Junior DevSecOps',
];

@Component({
  selector: 'ca-paths-page',
  imports: [RouterLink, PercentPipe, Icon, ProgressBar, LessonList],
  template: `
    <header class="page-header">
      <h1>Parcours d’apprentissage</h1>
      <p>
        Chaque parcours enchaîne des modules, et chaque module des leçons à valider dans l’ordre.
      </p>
    </header>

    @for (item of base(); track item.path.id) {
      <section class="card path" [attr.aria-labelledby]="'parcours-' + item.path.id">
        <p class="eyebrow">
          Niveau {{ levels[item.path.level].toLowerCase() }} · {{ prerequisites(item) }}
        </p>
        <h2 [id]="'parcours-' + item.path.id">
          <a [routerLink]="['/parcours', item.path.id]">{{ item.path.title }}</a>
        </h2>
        <p>{{ item.path.description }}</p>
        <ca-progress-bar
          [label]="'Progression du parcours ' + item.path.title"
          [value]="item.completed / item.lessons.length"
          [valueText]="'Leçons validées : ' + item.completed + ' sur ' + item.lessons.length"
        />
        <p class="muted">Leçons validées : {{ item.completed }} sur {{ item.lessons.length }}</p>
        <ol class="modules">
          @for (module of item.path.modules; track module.id; let i = $index) {
            <li>
              <h3>Module {{ i + 1 }} : {{ module.title }}</h3>
              <p class="muted">
                {{ module.description }} Validation : {{ module.passThreshold | percent }} au quiz
                de chaque leçon.
              </p>
              <ca-lesson-list [lessons]="lessonsOf(item, module.id)" />
            </li>
          }
        </ol>
      </section>
    }

    <section class="card" aria-labelledby="specialisations">
      <h2 id="specialisations">Spécialisations</h2>
      <p class="muted">
        Elles préparent à un premier poste : compétences attendues, projet final, portfolio
        exportable et entraînement aux entretiens. Elles ne garantissent pas un emploi et ne
        remplacent pas une expérience professionnelle.
      </p>
      <ul class="specialties">
        @for (item of specialties(); track item.path.id) {
          <li>
            <h3>
              <a [routerLink]="['/parcours', item.path.id]">{{ item.path.title }}</a>
            </h3>
            <p class="eyebrow">
              Niveau {{ levels[item.path.level].toLowerCase() }} · {{ prerequisites(item) }}
            </p>
            <p>{{ item.path.description }}</p>
            @if (locked(item)) {
              <p class="muted lock">
                <ca-icon name="lock" /> Verrouillée tant que le parcours prérequis n’est pas
                terminé.
              </p>
            }
            <ca-progress-bar
              [label]="'Progression de la spécialisation ' + item.path.title"
              [value]="item.completed / item.lessons.length"
              [valueText]="'Leçons validées : ' + item.completed + ' sur ' + item.lessons.length"
            />
            <p class="muted">
              Leçons validées : {{ item.completed }} sur {{ item.lessons.length }}
            </p>
          </li>
        }
      </ul>
      <h3>Spécialisations en préparation</h3>
      <ul class="planned">
        @for (title of plannedSpecializations; track title) {
          <li>{{ title }}</li>
        }
      </ul>
    </section>

    <section class="card" aria-labelledby="a-venir">
      <h2 id="a-venir">Niveaux en préparation</h2>
      <p class="muted">
        Ces niveaux sont prévus au programme, mais pas encore disponibles. Aucun parcours ne
        garantit un emploi : ils visent à construire des compétences et un portfolio.
      </p>
      <ol class="planned">
        @for (title of planned; track title) {
          <li>{{ title }}</li>
        }
      </ol>
    </section>
  `,
  styles: `
    section {
      margin-bottom: var(--space-5);
    }

    .eyebrow {
      margin: 0 0 var(--space-1);
      color: var(--color-accent);
      font-size: var(--text-sm);
      font-weight: 700;
    }

    .muted {
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }

    .modules {
      display: grid;
      gap: var(--space-5);
      margin: var(--space-5) 0 0;
      padding: 0;
      list-style: none;
    }

    .modules > li,
    .specialties > li {
      padding-left: var(--space-4);
      border-left: 3px solid var(--color-accent-track);
    }

    .specialties {
      display: grid;
      gap: var(--space-5);
      margin: var(--space-4) 0;
      padding: 0;
      list-style: none;
    }

    .specialties h3 {
      margin: 0 0 var(--space-1);
    }

    .lock {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .planned {
      columns: 2 14rem;
      margin: 0;
    }
  `,
})
export class PathsPage {
  private readonly progress = inject(ProgressStore);
  protected readonly levels = LEVELS;
  protected readonly planned = PLANNED;
  protected readonly plannedSpecializations = PLANNED_SPECIALIZATIONS;

  private readonly paths = computed(
    () => summarizeProgress(CATALOG, this.progress.state(), new Date()).paths,
  );
  protected readonly base = computed(() => this.paths().filter((p) => !p.path.career));
  protected readonly specialties = computed(() => this.paths().filter((p) => p.path.career));

  protected lessonsOf(item: PathProgress, moduleId: string) {
    return item.lessons.filter((l) => l.module.id === moduleId);
  }

  /** « aucun prérequis » ou « après le parcours « Découverte… » ». */
  protected prerequisites(item: PathProgress): string {
    const titles = (item.path.prerequisitePathIds ?? []).map(
      (id) => this.paths().find((p) => p.path.id === id)?.path.title ?? id,
    );
    return titles.length === 0
      ? 'aucun prérequis'
      : `après le parcours ${titles.map((t) => `« ${t} »`).join(', ')}`;
  }

  protected locked(item: PathProgress): boolean {
    return item.lessons.every((l) => l.status === 'locked');
  }
}
