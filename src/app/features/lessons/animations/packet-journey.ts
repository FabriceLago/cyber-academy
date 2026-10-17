import {
  Component,
  DOCUMENT,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { AnimationPlayer, AnimationStep } from '../../../shared/animation-player/animation-player';

type NodeId = 'pc' | 'box' | 'fai' | 'dns' | 'r1' | 'r2' | 'srv' | 'internet';
type PacketKind = 'dns' | 'request' | 'response';

interface SceneNode {
  readonly id: NodeId;
  readonly label: string;
  readonly detail?: string;
  readonly x: number;
  readonly y: number;
}

interface Zone {
  /** Une entrée par ligne, pour tenir dans la largeur de la zone. */
  readonly lines: readonly string[];
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface JourneyStep extends AnimationStep {
  /** Équipements traversés par le paquet pendant l'étape, dans l'ordre. */
  readonly path: readonly NodeId[];
  readonly kind: PacketKind;
  /** Texte de l'étiquette du paquet. */
  readonly packet: string;
}

export interface JourneyVersion {
  readonly title: string;
  readonly nodes: readonly SceneNode[];
  readonly links: readonly (readonly [NodeId, NodeId])[];
  readonly zones: readonly Zone[];
  readonly steps: readonly JourneyStep[];
}

/** Distance entre le centre d'un équipement et le centre du paquet posé au-dessus. */
const PACKET_OFFSET = 36;
const SEGMENT_MS = 700;

/** Les légendes reprennent mot pour mot l'alternative textuelle de la leçon (vérifié par test). */
export const DETAILED: JourneyVersion = {
  title:
    'Schéma du réseau. Chez vous : l’ordinateur (192.168.1.23) et la box. Chez le fournisseur d’accès : un routeur et le serveur DNS. Sur Internet : deux routeurs et le serveur du site (203.0.113.10).',
  nodes: [
    { id: 'pc', label: 'Ordinateur', detail: '192.168.1.23', x: 60, y: 55 },
    { id: 'box', label: 'Box', x: 180, y: 55 },
    { id: 'fai', label: 'Routeur', x: 300, y: 55 },
    { id: 'dns', label: 'Serveur DNS', x: 300, y: 150 },
    { id: 'r1', label: 'Routeur', x: 180, y: 150 },
    { id: 'r2', label: 'Routeur', x: 180, y: 245 },
    { id: 'srv', label: 'Serveur', detail: '203.0.113.10', x: 60, y: 245 },
  ],
  links: [
    ['pc', 'box'],
    ['box', 'fai'],
    ['fai', 'dns'],
    ['fai', 'r1'],
    ['r1', 'r2'],
    ['r2', 'srv'],
  ],
  zones: [
    { lines: ['Chez vous'], x: 2, y: 2, width: 236, height: 100 },
    { lines: ['Fournisseur', 'd’accès'], x: 242, y: 2, width: 116, height: 296 },
    { lines: ['Internet'], x: 2, y: 106, width: 236, height: 192 },
  ],
  steps: [
    {
      caption: 'L’ordinateur demande au serveur DNS l’adresse de www.example.com.',
      explanation:
        'Le navigateur ne connaît que le nom du site. Comme on cherche un numéro dans un annuaire, l’ordinateur pose la question au serveur DNS, ici celui du fournisseur d’accès. La question passe par la box.',
      path: ['pc', 'box', 'fai', 'dns'],
      kind: 'dns',
      packet: 'Question',
    },
    {
      caption: 'Le DNS répond 203.0.113.10.',
      explanation:
        'Le DNS a trouvé l’adresse IP qui correspond au nom. L’ordinateur sait maintenant où envoyer sa demande de page.',
      path: ['dns', 'fai', 'box', 'pc'],
      kind: 'dns',
      packet: 'Réponse',
    },
    {
      caption: 'Un paquet part de l’ordinateur vers la box.',
      explanation:
        'La demande de page est découpée en paquets. Chacun porte l’adresse de départ (192.168.1.23, l’adresse privée de l’ordinateur) et l’adresse d’arrivée (203.0.113.10).',
      path: ['pc', 'box'],
      kind: 'request',
      packet: 'Demande',
    },
    {
      caption: 'La box le transmet au routeur du fournisseur d’accès.',
      explanation:
        'La box contient un routeur qui relie votre réseau local à Internet. Vers Internet, elle remplace l’adresse privée de l’ordinateur par sa propre adresse publique.',
      path: ['box', 'fai'],
      kind: 'request',
      packet: 'Demande',
    },
    {
      caption: 'Plusieurs routeurs d’Internet le font avancer.',
      explanation:
        'Chaque routeur lit l’adresse d’arrivée et choisit la prochaine étape. Aucun ne connaît tout le trajet : chacun rapproche simplement le paquet de sa destination.',
      path: ['fai', 'r1', 'r2'],
      kind: 'request',
      packet: 'Demande',
    },
    {
      caption: 'Le paquet atteint le serveur 203.0.113.10.',
      explanation:
        'Le serveur reçoit les paquets, les remet dans l’ordre grâce à leur numéro et prépare la page demandée.',
      path: ['r2', 'srv'],
      kind: 'request',
      packet: 'Demande',
    },
    {
      caption: 'La réponse revient par le même mécanisme.',
      explanation:
        'Le serveur renvoie la page en paquets, adressés à la box, qui les remet à l’ordinateur. Le navigateur les réassemble et affiche la page.',
      path: ['srv', 'r2', 'r1', 'fai', 'box', 'pc'],
      kind: 'response',
      packet: 'Page',
    },
  ],
};

export const SIMPLIFIED: JourneyVersion = {
  title:
    'Schéma simplifié : l’ordinateur, le serveur DNS, Internet et le serveur du site (203.0.113.10).',
  nodes: [
    { id: 'pc', label: 'Ordinateur', x: 60, y: 150 },
    { id: 'dns', label: 'Serveur DNS', x: 180, y: 55 },
    { id: 'internet', label: 'Internet', detail: 'des routeurs', x: 180, y: 245 },
    { id: 'srv', label: 'Serveur', detail: '203.0.113.10', x: 300, y: 150 },
  ],
  links: [
    ['pc', 'dns'],
    ['pc', 'internet'],
    ['internet', 'srv'],
  ],
  zones: [],
  steps: [
    {
      caption: 'L’ordinateur demande au DNS l’adresse IP de www.example.com.',
      explanation: 'Le DNS joue le rôle d’annuaire : il traduit le nom d’un site en adresse IP.',
      path: ['pc', 'dns'],
      kind: 'dns',
      packet: 'Question',
    },
    {
      caption: 'Le DNS répond 203.0.113.10.',
      explanation: 'L’ordinateur sait maintenant à quelle adresse envoyer sa demande.',
      path: ['dns', 'pc'],
      kind: 'dns',
      packet: 'Réponse',
    },
    {
      caption: 'Des paquets traversent Internet jusqu’au serveur.',
      explanation:
        'La demande est découpée en paquets. Des routeurs les font avancer, de proche en proche, jusqu’à l’adresse 203.0.113.10.',
      path: ['pc', 'internet', 'srv'],
      kind: 'request',
      packet: 'Demande',
    },
    {
      caption: 'Le serveur renvoie la page, que le navigateur affiche.',
      explanation:
        'La réponse revient elle aussi en paquets ; l’ordinateur les remet dans l’ordre et affiche la page.',
      path: ['srv', 'internet', 'pc'],
      kind: 'response',
      packet: 'Page',
    },
  ],
};

let nextId = 0;

/** Animation « Le trajet d'un paquet » (leçon 3), en version détaillée ou simplifiée. */
@Component({
  selector: 'ca-packet-journey',
  imports: [AnimationPlayer],
  template: `
    <div class="versions" role="group" aria-label="Version de l’animation">
      <button
        type="button"
        class="btn btn-secondary"
        [attr.aria-pressed]="!simple()"
        (click)="setSimple(false)"
      >
        Version détaillée
      </button>
      <button
        type="button"
        class="btn btn-secondary"
        [attr.aria-pressed]="simple()"
        (click)="setSimple(true)"
      >
        Version simplifiée
      </button>
    </div>

    <ca-animation-player [steps]="version().steps" [(current)]="current" (shown)="animate($event)">
      <svg viewBox="0 0 360 300" role="img" [attr.aria-labelledby]="titleId">
        <title [id]="titleId">{{ version().title }}</title>
        @for (zone of version().zones; track zone.x) {
          <rect
            class="zone"
            [attr.x]="zone.x"
            [attr.y]="zone.y"
            [attr.width]="zone.width"
            [attr.height]="zone.height"
            rx="12"
          />
          @for (line of zone.lines; track $index; let i = $index, count = $count) {
            <text
              class="zone-label"
              [attr.x]="zone.x + 8"
              [attr.y]="zone.y + zone.height - 8 - (count - 1 - i) * 14"
            >
              {{ line }}
            </text>
          }
        }
        @for (link of links(); track link.key) {
          <line
            class="link"
            [class.active]="link.active"
            [attr.x1]="link.from.x"
            [attr.y1]="link.from.y"
            [attr.x2]="link.to.x"
            [attr.y2]="link.to.y"
          />
        }
        @for (node of version().nodes; track node.id) {
          <g
            class="node"
            [class.active]="step().path.includes(node.id)"
            [attr.transform]="'translate(' + node.x + ' ' + node.y + ')'"
          >
            <rect x="-55" y="-24" width="110" height="48" rx="8" />
            <text class="label" [attr.y]="node.detail ? -3 : 5">{{ node.label }}</text>
            @if (node.detail) {
              <text class="detail" y="15">{{ node.detail }}</text>
            }
          </g>
        }
        <g #packet [attr.class]="'packet ' + step().kind" [attr.transform]="packetTransform()">
          <rect x="-36" y="-11" width="72" height="22" rx="11" />
          <text y="4">{{ step().packet }}</text>
        </g>
      </svg>

      <ul class="legend">
        <li><span class="swatch dns" aria-hidden="true"></span>Question ou réponse DNS</li>
        <li><span class="swatch request" aria-hidden="true"></span>Demande envoyée au serveur</li>
        <li><span class="swatch response" aria-hidden="true"></span>Réponse du serveur</li>
      </ul>
    </ca-animation-player>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--space-3);
    }

    .versions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .versions [aria-pressed='true'] {
      border-color: var(--color-accent);
      background: var(--color-accent-soft);
    }

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

    /* Tailles en unités du schéma : sur un téléphone (échelle ≈ 0,8), 15 donne environ 12 px. */
    .zone-label {
      fill: var(--color-text-muted);
      font-size: 12px;
    }

    .link {
      stroke: var(--color-control-border);
      stroke-width: 2;
    }

    .link.active {
      stroke: var(--color-accent);
      stroke-width: 4;
    }

    .node rect {
      fill: var(--color-surface);
      stroke: var(--color-control-border);
      stroke-width: 1.5;
    }

    .node.active rect {
      stroke: var(--color-accent);
      stroke-width: 3;
    }

    .node text {
      fill: var(--color-text);
      text-anchor: middle;
    }

    .label {
      font-size: 15px;
      font-weight: 700;
    }

    .detail {
      font-size: 13px;
    }

    .packet text {
      fill: var(--color-on-accent);
      font-size: 13px;
      font-weight: 700;
      text-anchor: middle;
    }

    .dns {
      --kind: var(--color-warning);
    }

    .request {
      --kind: var(--color-accent);
    }

    .response {
      --kind: var(--color-success);
    }

    .packet rect {
      fill: var(--kind);
    }

    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2) var(--space-4);
      margin: 0;
      padding: 0;
      font-size: var(--text-sm);
      list-style: none;
    }

    .legend li {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .swatch {
      width: 1.5rem;
      height: 0.75rem;
      border-radius: 999px;
      background: var(--kind);
    }
  `,
})
export class PacketJourney {
  private readonly document = inject(DOCUMENT);
  private readonly packet = viewChild.required<ElementRef<SVGGElement>>('packet');

  protected readonly titleId = `trajet-paquet-${++nextId}`;
  protected readonly simple = signal(false);
  protected readonly current = signal(0);
  protected readonly version = computed(() => (this.simple() ? SIMPLIFIED : DETAILED));
  protected readonly step = computed(() => this.version().steps[this.current()]);
  protected readonly packetTransform = computed(() => {
    const end = this.position(this.step().path.at(-1));
    return `translate(${end.x} ${end.y - PACKET_OFFSET})`;
  });
  protected readonly links = computed(() => {
    const path = this.step().path;
    const used = new Set(
      path.slice(1).flatMap((id, i) => [`${path[i]}-${id}`, `${id}-${path[i]}`]),
    );
    return this.version().links.map(([from, to]) => ({
      key: `${from}-${to}`,
      from: this.position(from),
      to: this.position(to),
      active: used.has(`${from}-${to}`),
    }));
  });

  protected setSimple(simple: boolean): void {
    this.simple.set(simple);
    this.current.set(0);
  }

  /** Fait suivre au paquet le trajet de l'étape ; sans mouvement si l'utilisateur l'a demandé. */
  protected animate(index: number): void {
    const element = this.packet().nativeElement;
    element.getAnimations?.().forEach((animation) => animation.cancel());
    const reduced = this.document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (reduced?.matches || typeof element.animate !== 'function') return;
    const points = this.version().steps[index].path.map((id) => this.position(id));
    element.animate(
      points.map(({ x, y }) => ({ transform: `translate(${x}px, ${y - PACKET_OFFSET}px)` })),
      { duration: SEGMENT_MS * (points.length - 1), easing: 'ease-in-out' },
    );
  }

  private position(id: NodeId | undefined): SceneNode {
    const node = this.version().nodes.find((n) => n.id === id);
    if (!node) throw new Error(`Équipement inconnu : ${id}`);
    return node;
  }
}
