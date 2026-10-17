import { Component, computed, effect, input, linkedSignal, model, output } from '@angular/core';

export interface AnimationStep {
  /** Ce qui se passe, en une phrase : annoncé aux lecteurs d'écran à chaque étape. */
  readonly caption: string;
  /** Pourquoi cela se passe ainsi. */
  readonly explanation: string;
}

/** Temps d'affichage d'une étape en lecture automatique : de quoi lire légende et explication. */
export const STEP_DURATION_MS = 6000;

/**
 * Lecteur commun à toutes les animations : lecture et pause, étapes précédente et suivante, retour
 * au début, légende de l'étape (annoncée aux lecteurs d'écran) et explication. La scène est
 * projetée : elle s'affiche selon `current` et anime le mouvement quand `shown` est émis, jamais
 * au chargement de la page.
 */
@Component({
  selector: 'ca-animation-player',
  template: `
    <ng-content />

    <div class="controls" role="group" aria-label="Commandes de l’animation">
      <button type="button" class="btn btn-primary" (click)="togglePlay()">
        {{ playing() ? 'Pause' : last() ? 'Rejouer' : 'Lecture' }}
      </button>
      <!-- aria-disabled plutôt que disabled : le bouton garde le focus clavier aux extrémités. -->
      <button
        type="button"
        class="btn btn-secondary"
        [attr.aria-disabled]="first()"
        (click)="go(-1)"
      >
        Étape précédente
      </button>
      <button type="button" class="btn btn-secondary" [attr.aria-disabled]="last()" (click)="go(1)">
        Étape suivante
      </button>
      <button type="button" class="btn btn-secondary" (click)="show(0, false)">
        Revenir au début
      </button>
    </div>

    <p class="caption" aria-live="polite">
      <strong>Étape {{ index() + 1 }} sur {{ steps().length }} :</strong> {{ step().caption }}
    </p>
    <p class="explanation">{{ step().explanation }}</p>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--space-3);
    }

    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .caption,
    .explanation {
      margin: 0;
    }

    .explanation {
      color: var(--color-text-muted);
    }
  `,
})
export class AnimationPlayer {
  readonly steps = input.required<readonly AnimationStep[]>();
  readonly current = model(0);
  /** Une étape vient d'être montrée par une commande ou par la lecture : la scène l'anime. */
  readonly shown = output<number>();

  /** La lecture s'arrête quand les étapes changent (passage à la version simplifiée, par exemple). */
  protected readonly playing = linkedSignal({ source: this.steps, computation: () => false });
  protected readonly index = computed(() => Math.min(this.current(), this.steps().length - 1));
  protected readonly step = computed(() => this.steps()[this.index()]);
  protected readonly first = computed(() => this.index() === 0);
  protected readonly last = computed(() => this.index() === this.steps().length - 1);

  constructor() {
    effect((onCleanup) => {
      if (!this.playing()) return;
      const next = this.index() + 1;
      const timer = setTimeout(() => this.show(next, true), STEP_DURATION_MS);
      onCleanup(() => clearTimeout(timer));
    });
  }

  protected togglePlay(): void {
    if (this.playing()) this.playing.set(false);
    else this.show(this.last() ? 0 : this.index(), true);
  }

  protected go(delta: -1 | 1): void {
    const target = this.index() + delta;
    if (target >= 0 && target < this.steps().length) this.show(target, false);
  }

  /** La lecture s'arrête d'elle-même sur la dernière étape. */
  protected show(index: number, playing: boolean): void {
    this.current.set(index);
    this.playing.set(playing && index < this.steps().length - 1);
    this.shown.emit(index);
  }
}
