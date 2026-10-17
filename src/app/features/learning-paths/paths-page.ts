import { PercentPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { CATALOG } from '../../content/catalog';
import { summarizeProgress } from '../../core/progress/progress';
import { ProgressStore } from '../../core/progress/progress.store';
import { ProgressBar } from '../../shared/progress-bar/progress-bar';
import { LessonList } from '../lessons/lesson-list';

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
  'Spécialisation et préparation à l’emploi',
];

@Component({
  selector: 'ca-paths-page',
  imports: [PercentPipe, ProgressBar, LessonList],
  template: `
    <header class="page-header">
      <h1>Parcours d’apprentissage</h1>
      <p>
        Chaque parcours enchaîne des modules, et chaque module des leçons à valider dans l’ordre.
      </p>
    </header>

    @for (item of paths(); track item.path.id) {
      <section class="card path" [attr.aria-labelledby]="'parcours-' + item.path.id">
        <p class="eyebrow">Niveau débutant · aucun prérequis</p>
        <h2 [id]="'parcours-' + item.path.id">{{ item.path.title }}</h2>
        <p>{{ item.path.description }}</p>
        <ca-progress-bar
          [label]="'Progression du parcours ' + item.path.title"
          [value]="item.completed / item.total"
          [valueText]="'Leçons validées : ' + item.completed + ' sur ' + item.total"
        />
        <p class="muted">Leçons validées : {{ item.completed }} sur {{ item.total }}</p>
        <ol class="modules">
          @for (group of item.modules; track group.module.id; let i = $index) {
            <li>
              <h3>Module {{ i + 1 }} : {{ group.module.title }}</h3>
              <p class="muted">
                {{ group.module.description }} Validation :
                {{ group.module.passThreshold | percent }} au quiz de chaque leçon.
              </p>
              <ca-lesson-list [lessons]="group.lessons" />
            </li>
          }
        </ol>
      </section>
    }

    <section class="card" aria-labelledby="a-venir">
      <h2 id="a-venir">Parcours en préparation</h2>
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

    .modules > li {
      padding-left: var(--space-4);
      border-left: 3px solid var(--color-accent-track);
    }

    .planned {
      columns: 2 14rem;
      margin: 0;
    }
  `,
})
export class PathsPage {
  private readonly progress = inject(ProgressStore);
  protected readonly planned = PLANNED;

  protected readonly paths = computed(() => {
    const { lessons } = summarizeProgress(CATALOG, this.progress.state(), new Date());
    return CATALOG.paths.map((path) => {
      const pathLessons = lessons.filter((l) => l.path === path);
      return {
        path,
        total: pathLessons.length,
        completed: pathLessons.filter((l) => l.status === 'completed').length,
        modules: path.modules.map((module) => ({
          module,
          lessons: pathLessons.filter((l) => l.module === module),
        })),
      };
    });
  });
}
