import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATALOG } from '../../content/outline.generated';
import { summarizeProgress } from '../../core/progress/progress';
import { ProgressStore } from '../../core/progress/progress.store';
import { LessonList } from './lesson-list';

@Component({
  selector: 'ca-lessons-page',
  imports: [RouterLink, LessonList],
  template: `
    <header class="page-header">
      <h1>Leçons</h1>
      <p>
        Toutes les leçons, dans l’ordre conseillé. Une leçon s’ouvre quand ses prérequis sont
        validés.
      </p>
      <p><a routerLink="/glossaire">Consulter le glossaire de tous les termes</a></p>
    </header>
    @for (group of modules(); track group.module.id) {
      <section class="card" [attr.aria-labelledby]="'module-' + group.module.id">
        <h2 [id]="'module-' + group.module.id">{{ group.module.title }}</h2>
        <p class="muted">{{ group.path.title }}</p>
        <ca-lesson-list [lessons]="group.lessons" />
      </section>
    }
  `,
  styles: `
    section {
      margin-bottom: var(--space-5);
    }

    .muted {
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }
  `,
})
export class LessonsPage {
  private readonly progress = inject(ProgressStore);

  protected readonly modules = computed(() => {
    const { lessons } = summarizeProgress(CATALOG, this.progress.state(), new Date());
    return CATALOG.paths.flatMap((path) =>
      path.modules.map((module) => ({
        path,
        module,
        lessons: lessons.filter((l) => l.module === module),
      })),
    );
  });
}
