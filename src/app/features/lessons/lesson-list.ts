import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Level } from '../../core/models/content.model';
import { LessonProgress, LessonStatus } from '../../core/progress/progress';
import { Icon, IconName } from '../../shared/icon/icon';

export const LEVELS: Record<Level, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
};

export const LESSON_STATUS: Record<
  LessonStatus,
  { readonly label: string; readonly icon: IconName }
> = {
  completed: { label: 'Validée', icon: 'check' },
  'in-progress': { label: 'Commencée', icon: 'clock' },
  available: { label: 'Disponible', icon: 'circle' },
  locked: { label: 'Verrouillée', icon: 'lock' },
};

/** Liste de leçons avec leur statut ; une leçon verrouillée n'est pas un lien et dit pourquoi. */
@Component({
  selector: 'ca-lesson-list',
  imports: [RouterLink, Icon],
  template: `
    <ol>
      @for (item of lessons(); track item.lesson.id) {
        <li [class]="item.status">
          <ca-icon [name]="status[item.status].icon" />
          <span class="text">
            @if (item.status === 'locked') {
              <span class="title">{{ item.lesson.title }}</span>
            } @else {
              <a class="title" [routerLink]="['/lecons', item.lesson.id]">{{
                item.lesson.title
              }}</a>
            }
            <span class="muted">
              {{ status[item.status].label }} · {{ item.lesson.durationMinutes }} min
              @if (item.blockedBy.length > 0) {
                · après « {{ item.blockedBy[0].title }} »
              }
            </span>
          </span>
        </li>
      }
    </ol>
  `,
  styles: `
    ol {
      display: grid;
      gap: var(--space-3);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    li {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: var(--space-3);
    }

    .text {
      display: grid;
    }

    .title {
      font-weight: 600;
    }

    .muted {
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }

    ca-icon {
      margin-top: 0.15em;
      color: var(--color-accent);
    }

    .completed ca-icon {
      color: var(--color-success);
    }

    .in-progress ca-icon {
      color: var(--color-warning);
    }

    .locked,
    .locked ca-icon {
      color: var(--color-text-muted);
    }
  `,
})
export class LessonList {
  readonly lessons = input.required<readonly LessonProgress[]>();
  protected readonly status = LESSON_STATUS;
}
