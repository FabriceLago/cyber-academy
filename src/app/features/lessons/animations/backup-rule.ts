import { Component, computed, signal } from '@angular/core';
import { AnimationPlayer, AnimationStep } from '../../../shared/animation-player/animation-player';

type Place = 'ordinateur' | 'disque' | 'enLigne';
type CopyState = 'vide' | 'copie' | 'perdue' | 'restauree';

export interface BackupStep extends AnimationStep {
  readonly copies: Readonly<Record<Place, CopyState>>;
}

/** Une entrée par ligne, pour tenir dans la largeur du cadre. */
const PLACES: readonly { id: Place; lines: readonly string[]; x: number }[] = [
  { id: 'ordinateur', lines: ['Ordinateur'], x: 62 },
  { id: 'disque', lines: ['Disque', 'externe'], x: 178 },
  { id: 'enLigne', lines: ['En ligne'], x: 300 },
];

const STATES: Readonly<Record<CopyState, string>> = {
  vide: 'Aucune copie',
  copie: 'Copie',
  perdue: 'Perdue',
  restauree: 'Restaurée',
};

/** Les légendes reprennent mot pour mot l'alternative textuelle de la leçon (vérifié par test). */
export const STEPS: readonly BackupStep[] = [
  {
    caption: 'Le mémoire de Léa n’existe qu’en un exemplaire, sur son ordinateur.',
    explanation:
      'Une seule copie : une panne, un vol ou une fausse manipulation suffit à tout perdre.',
    copies: { ordinateur: 'copie', disque: 'vide', enLigne: 'vide' },
  },
  {
    caption: 'Léa en copie une version sur un disque externe, qu’elle débranche ensuite.',
    explanation:
      'Deux copies, sur deux supports différents. Débranché, le disque échappe aussi à un rançongiciel qui chiffrerait l’ordinateur.',
    copies: { ordinateur: 'copie', disque: 'copie', enLigne: 'vide' },
  },
  {
    caption: 'Une troisième copie part hors de chez elle, sur un service de sauvegarde en ligne.',
    explanation:
      'La règle 3-2-1 est respectée : 3 copies, sur 2 supports, dont 1 hors site. Le service garde aussi les versions précédentes.',
    copies: { ordinateur: 'copie', disque: 'copie', enLigne: 'copie' },
  },
  {
    caption: 'Le disque de l’ordinateur tombe en panne : l’original est perdu.',
    explanation: 'Une panne de disque arrive sans prévenir. Il reste deux copies intactes.',
    copies: { ordinateur: 'perdue', disque: 'copie', enLigne: 'copie' },
  },
  {
    caption: 'Un dégât des eaux détruit aussi le disque externe, rangé dans le même bureau.',
    explanation:
      'Un même incident détruit tout ce qui se trouve au même endroit : c’est pour cela qu’une copie doit être ailleurs.',
    copies: { ordinateur: 'perdue', disque: 'perdue', enLigne: 'copie' },
  },
  {
    caption: 'La copie hors site est intacte : Léa restaure son mémoire sur un nouvel ordinateur.',
    explanation:
      'La copie hors site a sauvé le travail. Restaurer est le but d’une sauvegarde : essayez-le de temps en temps.',
    copies: { ordinateur: 'restauree', disque: 'perdue', enLigne: 'copie' },
  },
];

let nextId = 0;

/** Animation « La règle 3-2-1 face aux incidents » (niveau 1, mises à jour et sauvegardes). */
@Component({
  selector: 'ca-backup-rule',
  imports: [AnimationPlayer],
  template: `
    <ca-animation-player [steps]="steps" [(current)]="current">
      <svg viewBox="0 0 360 236" role="img" [attr.aria-labelledby]="titleId">
        <title [id]="titleId">{{ description() }}</title>
        <rect class="zone" x="2" y="2" width="236" height="206" rx="12" />
        <rect class="zone" x="242" y="2" width="116" height="206" rx="12" />
        <text class="zone-label" x="12" y="200">Chez Léa</text>
        <text class="zone-label" x="252" y="200">Hors site</text>
        @for (place of places; track place.id) {
          @let copy = step().copies[place.id];
          <g [attr.class]="'place ' + copy" [attr.transform]="'translate(' + place.x + ' 0)'">
            <rect class="frame" x="-52" y="12" width="104" height="166" rx="10" />
            @for (line of place.lines; track $index) {
              <text class="label" [attr.y]="32 + $index * 16">{{ line }}</text>
            }
            <g transform="translate(0 96)">
              <path class="doc" d="M-20 -30 h26 l14 14 v46 h-40 z" />
              <path class="fold" d="M6 -30 v14 h14" />
              @if (copy === 'perdue') {
                <path class="cross" d="M-26 -34 L26 34 M26 -34 L-26 34" />
              }
            </g>
            <text class="state" y="162">{{ states[copy] }}</text>
          </g>
        }
        <text class="count" x="180" y="230">Copies intactes : {{ intact() }} sur 3</text>
      </svg>
    </ca-animation-player>
  `,
  styles: `
    svg {
      display: block;
      width: 100%;
      max-width: 34rem;
      margin-inline: auto;
      font-family: var(--font-sans);
    }

    .zone {
      fill: var(--color-surface-raised);
      stroke: var(--color-border);
      stroke-dasharray: 4 4;
    }

    text {
      fill: var(--color-text);
      text-anchor: middle;
    }

    /* Tailles en unités du schéma : sur un téléphone (échelle ≈ 0,8), 13 donne environ 10 px. */
    .zone-label {
      fill: var(--color-text-muted);
      font-size: 12px;
      text-anchor: start;
    }

    .label {
      font-size: 14px;
      font-weight: 700;
    }

    .state,
    .count {
      font-size: 13px;
      font-weight: 700;
    }

    .frame {
      fill: var(--color-surface);
      stroke: var(--color-control-border);
      stroke-width: 1.5;
    }

    .doc,
    .fold {
      fill: var(--color-surface);
      stroke: var(--color-text-muted);
      stroke-width: 2;
      stroke-dasharray: 4 3;
      transition:
        fill 300ms ease,
        stroke 300ms ease;
    }

    .copie {
      --state: var(--color-accent);
    }

    .perdue {
      --state: var(--color-danger);
    }

    .restauree {
      --state: var(--color-success);
    }

    .copie .doc,
    .restauree .doc,
    .perdue .doc {
      fill: var(--state);
      fill-opacity: 0.25;
      stroke: var(--state);
      stroke-dasharray: none;
    }

    .copie .fold,
    .restauree .fold,
    .perdue .fold {
      stroke: var(--state);
      stroke-dasharray: none;
    }

    .copie .frame,
    .restauree .frame,
    .perdue .frame {
      stroke: var(--state);
      stroke-width: 2.5;
    }

    .cross {
      stroke: var(--color-danger);
      stroke-width: 4;
      stroke-linecap: round;
    }
  `,
})
export class BackupRule {
  protected readonly titleId = `sauvegarde-3-2-1-${++nextId}`;
  protected readonly steps = STEPS;
  protected readonly places = PLACES;
  protected readonly states = STATES;
  protected readonly current = signal(0);
  protected readonly step = computed(() => STEPS[this.current()]);
  protected readonly intact = computed(
    () => PLACES.filter((p) => ['copie', 'restauree'].includes(this.step().copies[p.id])).length,
  );
  /** Ce que montre le schéma, pour les lecteurs d'écran. */
  protected readonly description = computed(
    () =>
      `Schéma : ${PLACES.map((p) => `${p.lines.join(' ')}, ${STATES[this.step().copies[p.id]].toLowerCase()}`).join(' ; ')}. Copies intactes : ${this.intact()} sur 3.`,
  );
}
