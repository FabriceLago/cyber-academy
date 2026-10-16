import { Component, computed, input } from '@angular/core';

/**
 * Jauge horizontale. Le remplissage (accent) se détache de la piste, un ton plus clair de la
 * même couleur. La valeur est toujours aussi écrite en texte à côté, jamais portée par la
 * couleur seule.
 */
@Component({
  selector: 'ca-progress-bar',
  host: {
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    '[attr.aria-valuenow]': 'percent()',
    '[attr.aria-valuetext]': 'valueText() ?? null',
    '[attr.aria-label]': 'label()',
  },
  template: `<span class="fill" [style.width.%]="percent()"></span>`,
  styles: `
    :host {
      display: block;
      height: 0.5rem;
      overflow: hidden;
      border-radius: 999px;
      background: var(--color-accent-track);
    }

    .fill {
      display: block;
      height: 100%;
      border-radius: inherit;
      background: var(--color-accent);
    }
  `,
})
export class ProgressBar {
  /** Part accomplie, entre 0 et 1. */
  readonly value = input.required<number>();
  readonly label = input.required<string>();
  /** Valeur lue par les lecteurs d'écran, par exemple « 2 leçons sur 5 ». */
  readonly valueText = input<string>();

  protected readonly percent = computed(
    () => Math.round(Math.min(1, Math.max(0, this.value() || 0)) * 100), // 0/0 → 0
  );
}
