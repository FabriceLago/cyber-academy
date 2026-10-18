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
      height: 0.625rem;
      overflow: hidden;
      border-radius: var(--radius-pill);
      background: var(--color-accent-track);
      box-shadow: inset 0 1px 2px var(--shadow-color);
    }

    /* Remplissage en dégradé lumineux ; un reflet le parcourt (coupé en mouvement réduit). */
    .fill {
      position: relative;
      display: block;
      height: 100%;
      overflow: hidden;
      border-radius: inherit;
      background: var(--gradient-progress);
      box-shadow: 0 0 12px var(--glow-accent);
      transition: width 700ms var(--ease-out);
    }

    .fill::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgb(255 255 255 / 0.45), transparent);
      transform: translateX(-100%);
      animation: shine 2.8s ease-in-out 600ms infinite;
    }

    @keyframes shine {
      60%,
      to {
        transform: translateX(100%);
      }
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
