import { Component, input } from '@angular/core';
import { Icon, IconName } from '../icon/icon';

/** Encadré affiché quand une section n'a pas (encore) de contenu : il dit pourquoi, et quoi faire. */
@Component({
  selector: 'ca-empty-state',
  imports: [Icon],
  host: { class: 'card' },
  template: `
    <ca-icon class="icon" [name]="icon()" />
    <h2>{{ heading() }}</h2>
    <div class="body"><ng-content /></div>
  `,
  styles: `
    :host {
      display: grid;
      justify-items: center;
      gap: var(--space-3);
      padding: var(--space-6) var(--space-5);
      text-align: center;
    }

    .icon {
      box-sizing: content-box;
      width: 1.75rem;
      height: 1.75rem;
      padding: var(--space-3);
      border-radius: 50%;
      color: var(--color-accent);
      background: var(--color-accent-soft);
    }

    h2 {
      margin: 0;
    }

    .body {
      max-width: 60ch;
      color: var(--color-text-muted);
    }
  `,
})
export class EmptyState {
  readonly icon = input.required<IconName>();
  readonly heading = input.required<string>();
}
