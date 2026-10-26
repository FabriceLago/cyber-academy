import { Component, input } from '@angular/core';

/**
 * Schémas de démonstration des leçons, en SVG statique. Chacun reprend l'alternative textuelle
 * de sa leçon, affichée juste en dessous : le dessin est masqué aux lecteurs d'écran pour ne pas
 * la lire deux fois. Les adresses et noms sont fictifs (plages 203.0.113.0/24, domaines .example).
 */

interface TreeNode {
  readonly label: string;
  readonly depth: number;
  readonly kind: 'dossier' | 'fichier' | 'note';
  /** chemin : sur le chemin suivi ; attention, range, copie : états du rangement. */
  readonly mark?: 'chemin' | 'attention' | 'range' | 'copie';
}

interface PlacedNode extends TreeNode {
  readonly x: number;
  readonly y: number;
  /** Trait depuis le dossier parent (null au premier niveau). */
  readonly link: string | null;
}

/** Place une arborescence : une ligne par entrée, décalée selon sa profondeur. */
export function placeTree(
  nodes: readonly TreeNode[],
  x0: number,
  y0: number,
  row: number,
  indent: number,
): PlacedNode[] {
  const placed: PlacedNode[] = [];
  nodes.forEach((node, i) => {
    const x = x0 + node.depth * indent;
    const y = y0 + i * row;
    const parent = [...placed].reverse().find((p) => p.depth === node.depth - 1);
    const link = parent ? `M${parent.x + 9} ${parent.y + 8} V${y} H${x - 3}` : null;
    placed.push({ ...node, x, y, link });
  });
  return placed;
}

const FOLDER = 'M0 -7 h7 l2 2 h9 v12 h-18 z';
const FILE = 'M2 -9 h9 l5 5 v13 h-14 z';

const FILE_TREE = placeTree(
  [
    { label: '/', depth: 0, kind: 'dossier', mark: 'chemin' },
    { label: 'home', depth: 1, kind: 'dossier', mark: 'chemin' },
    { label: 'lea', depth: 2, kind: 'dossier', mark: 'chemin' },
    { label: 'Documents', depth: 3, kind: 'dossier' },
    { label: 'rapport.pdf', depth: 4, kind: 'fichier' },
    { label: 'Images', depth: 3, kind: 'dossier', mark: 'chemin' },
    { label: 'plage.jpg', depth: 4, kind: 'fichier', mark: 'chemin' },
  ],
  14,
  22,
  32,
  34,
);

const TIDY = [
  {
    title: 'Avant',
    x: 92,
    nodes: placeTree(
      [
        { label: 'Téléchargements', depth: 0, kind: 'dossier' },
        { label: 'facture.pdf', depth: 1, kind: 'fichier', mark: 'attention' },
        { label: 'Documents', depth: 0, kind: 'dossier' },
        { label: 'Images', depth: 0, kind: 'dossier' },
        { label: '/media/cle-usb', depth: 0, kind: 'dossier' },
        { label: '(vide)', depth: 1, kind: 'note' },
      ],
      8,
      52,
      26,
      16,
    ),
  },
  {
    title: 'Après',
    x: 272,
    nodes: placeTree(
      [
        { label: 'Téléchargements', depth: 0, kind: 'dossier' },
        { label: 'Documents', depth: 0, kind: 'dossier' },
        { label: 'facture.pdf', depth: 1, kind: 'fichier', mark: 'range' },
        { label: 'Images', depth: 0, kind: 'dossier' },
        { label: '/media/cle-usb', depth: 0, kind: 'dossier' },
        { label: 'Sauvegarde-2026', depth: 1, kind: 'dossier', mark: 'copie' },
        { label: 'Documents', depth: 2, kind: 'dossier', mark: 'copie' },
        { label: 'Images', depth: 2, kind: 'dossier', mark: 'copie' },
      ],
      188,
      52,
      26,
      16,
    ),
  },
];

/** Ligne de commande découpée : position en caractères, numéro et rôle de chaque partie. */
const CHAR = 9;
const COMMAND = [
  { text: 'eleve', at: 0, n: 1, role: 'l’utilisateur' },
  { text: '@', at: 5 },
  { text: 'cyberlab', at: 6, n: 2, role: 'la machine' },
  { text: ':', at: 14 },
  { text: '~', at: 15, n: 3, role: 'le dossier courant' },
  { text: '$', at: 16, n: 4, role: 'un utilisateur ordinaire' },
  { text: 'ls', at: 18, n: 5, role: 'la commande' },
  { text: '-l', at: 21, n: 6, role: 'l’option d’affichage détaillé' },
  { text: 'Documents', at: 24, n: 7, role: 'l’argument, le dossier à lister' },
].map((part) => ({
  ...part,
  x: 20 + part.at * CHAR,
  center: 20 + (part.at + part.text.length / 2) * CHAR,
}));
const COMMAND_PARTS = COMMAND.filter((part) => part.n !== undefined);

const LOG_FIELDS = [
  { value: '2026-10-14 02:14:52', role: 'Quand : la date et l’heure', tone: 'cyan' },
  { value: 'vpn-01', role: 'La source', tone: 'violet' },
  { value: 'Connexion réussie', role: 'L’événement', tone: 'amber' },
  { value: 'c.martin', role: 'Le compte', tone: 'green' },
  { value: '203.0.113.77', role: 'L’adresse IP d’origine', tone: 'red' },
];

const EMAIL_CLUES = [
  'Nom affiché « Votre Banque », adresse réelle différente',
  'Urgence dans l’objet, pour vous presser',
  'Salutation impersonnelle',
  'Le bouton mène vers un autre site',
  'Demande du mot de passe et du code SMS',
];

/** Gravité selon la somme des positions (étendue + impact), de faible à critique. */
const LEVELS = [
  { label: 'faible', tone: 'low' },
  { label: 'moyenne', tone: 'mid' },
  { label: 'élevée', tone: 'high' },
  { label: 'critique', tone: 'critical' },
  { label: 'critique', tone: 'critical' },
];
const IMPACTS = [
  ['Données', 'sensibles'],
  ['Données', 'internes'],
  ['Aucune', 'donnée'],
];
const SCOPES = [
  ['Un', 'compte'],
  ['Un', 'service'],
  ['Toute', 'l’organisation'],
];
const GRID = IMPACTS.flatMap((_, row) =>
  SCOPES.map((__, col) => ({
    x: 104 + col * 82,
    y: 14 + row * 58,
    level: LEVELS[col + (2 - row)],
  })),
);

/** Identifiants des démonstrations dessinées ; les autres gardent leur seule description. */
export const DIAGRAM_IDS: readonly string[] = [
  'arborescence',
  'anatomie-commande',
  'anatomie-paquet',
  'menace-vulnerabilite-risque',
  'anatomie-email',
  'rangement-sauvegarde',
  'anatomie-ligne-journal',
  'grille-gravite',
];

@Component({
  selector: 'ca-lesson-diagram',
  template: `
    @switch (id()) {
      @case ('arborescence') {
        <svg viewBox="0 0 360 298" aria-hidden="true" focusable="false">
          @for (n of fileTree; track $index) {
            @if (n.link) {
              <path class="link" [class.on]="n.mark === 'chemin'" [attr.d]="n.link" />
            }
            <g
              [attr.class]="'node kind-' + n.kind + ' ' + (n.mark ?? '')"
              [attr.transform]="'translate(' + n.x + ' ' + n.y + ')'"
            >
              <path class="icon" [attr.d]="n.kind === 'dossier' ? folder : file" />
              <text x="24" y="5">{{ n.label }}</text>
            </g>
          }
          <text class="mono path" x="180" y="260">
            <tspan class="slash">/</tspan>
            home
            <tspan class="slash">/</tspan>
            lea
            <tspan class="slash">/</tspan>
            Images
            <tspan class="slash">/</tspan>
            plage.jpg
          </text>
          <text class="note" x="180" y="284">Chaque « / » descend d’un dossier.</text>
        </svg>
      }
      @case ('anatomie-commande') {
        <svg viewBox="0 0 360 230" aria-hidden="true" focusable="false">
          <rect class="terminal" x="8" y="6" width="344" height="46" rx="8" />
          @for (part of command; track part.at) {
            <text class="mono term" [class.sep]="!part.n" [attr.x]="part.x" y="35">
              {{ part.text }}
            </text>
          }
          @for (part of commandParts; track part.n; let odd = $odd) {
            <path class="underline" [attr.d]="'M' + part.x + ' 42 h' + part.text.length * char" />
            <path class="leader" [attr.d]="'M' + part.center + ' 52 V' + (odd ? 80 : 64)" />
            <circle class="badge" [attr.cx]="part.center" [attr.cy]="odd ? 88 : 72" r="8" />
            <text class="badge-text" [attr.x]="part.center" [attr.y]="odd ? 92 : 76">
              {{ part.n }}
            </text>
          }
          @for (part of commandParts; track part.n; let i = $index) {
            <circle class="badge" cx="20" [attr.cy]="116 + i * 17" r="7" />
            <text class="badge-text small" x="20" [attr.y]="120 + i * 17">{{ part.n }}</text>
            <text class="legend" x="34" [attr.y]="121 + i * 17">
              <tspan class="mono">{{ part.text }}</tspan>
              : {{ part.role }}
            </text>
          }
        </svg>
      }
      @case ('anatomie-paquet') {
        <svg viewBox="0 0 360 214" aria-hidden="true" focusable="false">
          <text class="title" x="108" y="22">En-têtes</text>
          <text class="title" x="280" y="22">Données</text>
          <rect class="headers" x="8" y="32" width="200" height="124" rx="8" />
          <rect class="data" x="208" y="32" width="144" height="124" rx="8" />
          <text class="field" x="22" y="62">De : adresse de départ</text>
          <text class="field" x="22" y="94">
            À :
            <tspan class="mono">203.0.113.10</tspan>
          </text>
          <text class="field" x="22" y="126">N° d’ordre : 3</text>
          @for (bar of bars; track bar) {
            <rect
              class="bar"
              x="224"
              [attr.y]="50 + bar * 14"
              [attr.width]="bar === 3 ? 60 : 112"
              height="6"
              rx="3"
            />
          }
          <text class="centered" x="280" y="126">Un morceau</text>
          <text class="centered" x="280" y="142">de la page</text>
          <text class="note" x="180" y="184">Les en-têtes guident ; les données voyagent.</text>
          <text class="note" x="180" y="204">
            Le numéro d’ordre remet les morceaux dans l’ordre.
          </text>
        </svg>
      }
      @case ('menace-vulnerabilite-risque') {
        <svg viewBox="0 0 360 252" aria-hidden="true" focusable="false">
          <rect class="box" x="4" y="8" width="100" height="112" rx="10" />
          <text class="title" x="54" y="32">Menace</text>
          <text class="centered" x="54" y="54">Un pirate</text>
          <text class="centered" x="54" y="71">qui teste</text>
          <text class="centered" x="54" y="88">des mots</text>
          <text class="centered" x="54" y="105">de passe</text>
          <text class="operator" x="114" y="72">+</text>
          <rect class="box warn" x="124" y="8" width="104" height="112" rx="10" />
          <text class="title" x="176" y="32">Vulnérabilité</text>
          <text class="centered" x="176" y="54">Le mot</text>
          <text class="centered" x="176" y="71">de passe</text>
          <text class="centered mono" x="176" y="92">« 123456 »</text>
          <text class="operator" x="238" y="72">=</text>
          <rect class="box danger" x="248" y="8" width="108" height="112" rx="10" />
          <text class="title" x="302" y="32">Risque</text>
          <text class="centered" x="302" y="54">Prise de</text>
          <text class="centered" x="302" y="71">contrôle</text>
          <text class="centered" x="302" y="88">du compte</text>
          <text class="centered strong" x="302" y="108">Impact élevé</text>
          <path class="arrow" d="M176 120 V150" />
          <path class="head" d="M170 144 L176 152 L182 144 Z" />
          <rect class="box ok" x="86" y="154" width="180" height="64" rx="10" />
          <text class="title" x="176" y="176">Mesure</text>
          <text class="centered" x="176" y="194">Mot de passe long</text>
          <text class="centered" x="176" y="210">+ double authentification</text>
          <path class="arrow" d="M266 186 H302 V128" />
          <path class="head" d="M296 134 L302 126 L308 134 Z" />
          <text class="note" x="180" y="244">La mesure fait baisser le risque.</text>
        </svg>
      }
      @case ('anatomie-email') {
        <svg viewBox="0 0 360 340" aria-hidden="true" focusable="false">
          <rect class="box" x="8" y="8" width="344" height="196" rx="10" />
          <text class="field strong" x="22" y="32">De : Votre Banque</text>
          <text class="mono small" x="22" y="50">&lt;alerte&#64;banque-secure.example&gt;</text>
          <text class="field strong" x="22" y="74">Objet : URGENT : compte bloqué</text>
          <path class="divider" d="M20 86 H340" />
          <text class="field" x="22" y="108">Cher client,</text>
          <text class="field muted" x="22" y="128">Votre compte est bloqué. Confirmez votre</text>
          <text class="field muted" x="22" y="146">mot de passe et le code reçu par SMS.</text>
          <rect class="cta" x="22" y="158" width="176" height="32" rx="6" />
          <text class="cta-text" x="110" y="179">Débloquer mon compte</text>
          <path class="tip" d="M60 210 l8 -8 l8 8 z" />
          <rect class="tooltip" x="22" y="210" width="290" height="26" rx="6" />
          <text class="mono tooltip-text" x="32" y="227">
            https://connexion-banque.example/login
          </text>
          @for (spot of emailSpots; track spot.n) {
            <circle class="badge danger" [attr.cx]="spot.x" [attr.cy]="spot.y" r="9" />
            <text class="badge-text" [attr.x]="spot.x" [attr.y]="spot.y + 4">{{ spot.n }}</text>
          }
          @for (clue of emailClues; track $index; let i = $index) {
            <circle class="badge danger" cx="20" [attr.cy]="262 + i * 17" r="7" />
            <text class="badge-text small" x="20" [attr.y]="266 + i * 17">{{ i + 1 }}</text>
            <text class="legend" x="34" [attr.y]="267 + i * 17">{{ clue }}</text>
          }
        </svg>
      }
      @case ('rangement-sauvegarde') {
        <svg viewBox="0 0 360 300" aria-hidden="true" focusable="false">
          <path class="divider" d="M180 8 V240" />
          @for (column of tidy; track column.title) {
            <text class="title" [attr.x]="column.x" y="24">{{ column.title }}</text>
            @for (n of column.nodes; track $index) {
              @if (n.link) {
                <path class="link" [attr.d]="n.link" />
              }
              <g
                [attr.class]="'node small kind-' + n.kind + ' ' + (n.mark ?? '')"
                [attr.transform]="'translate(' + n.x + ' ' + n.y + ')'"
              >
                @if (n.kind !== 'note') {
                  <path class="icon" [attr.d]="n.kind === 'dossier' ? folder : file" />
                }
                <text [attr.x]="n.kind === 'note' ? 4 : 23" y="5">{{ n.label }}</text>
              </g>
            }
          }
          <text class="note" x="180" y="268">cp copie sans rien enlever : Documents</text>
          <text class="note" x="180" y="286">et Images restent sur l’ordinateur.</text>
        </svg>
      }
      @case ('anatomie-ligne-journal') {
        <svg viewBox="0 0 360 240" aria-hidden="true" focusable="false">
          <rect class="terminal" x="8" y="6" width="344" height="68" rx="8" />
          <text class="mono log" x="20" y="34">
            <tspan class="cyan">2026-10-14 02:14:52</tspan>
            |
            <tspan class="violet">vpn-01</tspan>
            |
          </text>
          <text class="mono log" x="20" y="58">
            <tspan class="amber">Connexion réussie</tspan>
            |
            <tspan class="green">c.martin</tspan>
            |
            <tspan class="red">203.0.113.77</tspan>
          </text>
          @for (field of logFields; track field.value; let i = $index) {
            <rect
              [attr.class]="'swatch ' + field.tone"
              x="8"
              [attr.y]="92 + i * 29"
              width="5"
              height="22"
              rx="2"
            />
            <text class="mono small" x="20" [attr.y]="107 + i * 29">{{ field.value }}</text>
            <text class="legend" x="190" [attr.y]="107 + i * 29">{{ field.role }}</text>
          }
        </svg>
      }
      @case ('grille-gravite') {
        <svg viewBox="0 0 360 300" aria-hidden="true" focusable="false">
          @for (cell of grid; track $index) {
            <rect
              [attr.class]="'cell ' + cell.level.tone"
              [attr.x]="cell.x"
              [attr.y]="cell.y"
              width="80"
              height="56"
              rx="6"
            />
            <text class="title small" [attr.x]="cell.x + 40" [attr.y]="cell.y + 33">
              {{ cell.level.label }}
            </text>
          }
          @for (impact of impacts; track $index; let row = $index) {
            <text class="axis" x="96" [attr.y]="38 + row * 58">{{ impact[0] }}</text>
            <text class="axis" x="96" [attr.y]="54 + row * 58">{{ impact[1] }}</text>
          }
          @for (scope of scopes; track $index; let col = $index) {
            <text class="centered small" [attr.x]="144 + col * 82" y="204">{{ scope[0] }}</text>
            <text class="centered small" [attr.x]="144 + col * 82" y="220">{{ scope[1] }}</text>
          }
          <text class="axis-title" x="227" y="242">Étendue →</text>
          <text class="axis-title" transform="translate(16 101) rotate(-90)">Impact →</text>
          <path class="star" [attr.d]="star(114, 18)" />
          <path class="star" [attr.d]="star(18, 266)" />
          <text class="legend" x="34" y="276">Accès à des factures clients par un seul</text>
          <text class="legend" x="34" y="294">compte : gravité élevée.</text>
        </svg>
      }
    }
  `,
  styles: `
    :host {
      display: block;
      margin-bottom: var(--space-4);
    }

    svg {
      display: block;
      width: 100%;
      max-width: 34rem;
      margin-inline: auto;
      font-family: var(--font-sans);
    }

    /* Tailles en unités du schéma : sur un téléphone (échelle ≈ 0,9), 13 donne environ 12 px. */
    text {
      fill: var(--color-text);
      font-size: 13px;
    }

    .mono {
      font-family: var(--font-mono);
    }

    .small,
    .note,
    .legend,
    .axis {
      font-size: 12px;
    }

    .title {
      font-weight: 700;
      text-anchor: middle;
    }

    .centered,
    .note,
    .operator,
    .cta-text,
    .badge-text,
    .path,
    .axis-title {
      text-anchor: middle;
    }

    .strong {
      font-weight: 700;
    }

    .note,
    .muted,
    .axis-title,
    .kind-note text {
      fill: var(--color-text-muted);
    }

    .kind-note text {
      font-style: italic;
    }

    .operator {
      font-size: 24px;
      font-weight: 700;
    }

    .link {
      fill: none;
      stroke: var(--color-control-border);
      stroke-width: 1.5;
    }

    .link.on {
      stroke: var(--color-accent);
      stroke-width: 2.5;
    }

    .icon {
      fill: var(--color-surface-raised);
      stroke: var(--color-control-border);
      stroke-width: 1.5;
    }

    .chemin .icon,
    .range .icon {
      fill: var(--color-accent-soft);
      stroke: var(--color-accent);
    }

    .chemin text,
    .range text {
      fill: var(--color-accent);
      font-weight: 700;
    }

    .attention .icon {
      stroke: var(--color-warning);
      stroke-width: 2;
    }

    .copie .icon {
      stroke: var(--color-success);
      stroke-width: 2;
    }

    .copie text {
      fill: var(--color-success);
      font-weight: 700;
    }

    .path {
      font-size: 14px;
    }

    .slash {
      fill: var(--color-accent);
      font-weight: 700;
    }

    /* Terminal et info-bulle : sombres dans les deux thèmes, couleurs fixes contrastées. */
    .terminal,
    .tooltip,
    .tip {
      fill: #0b1526;
    }

    .tooltip {
      stroke: var(--color-control-border);
    }

    .term,
    .log,
    .tooltip-text {
      fill: #e8eefb;
    }

    .term {
      font-size: 15px;
    }

    .log,
    .tooltip-text {
      font-size: 11.5px;
    }

    .term.sep {
      fill: #9fb0c9;
    }

    .underline {
      stroke: var(--color-accent);
      stroke-width: 2;
    }

    .leader {
      stroke: var(--color-control-border);
      stroke-width: 1;
    }

    .badge {
      fill: var(--color-accent);
    }

    .badge.danger {
      fill: var(--color-danger);
    }

    .badge-text {
      fill: var(--color-surface);
      font-size: 11px;
      font-weight: 700;
    }

    .badge-text.small {
      font-size: 10px;
    }

    .headers {
      fill: var(--color-accent-soft);
      stroke: var(--color-accent);
      stroke-width: 1.5;
    }

    .data {
      fill: var(--color-surface-raised);
      stroke: var(--color-border);
      stroke-width: 1.5;
    }

    .bar {
      fill: var(--color-control-border);
      opacity: 0.6;
    }

    .box {
      fill: var(--color-surface);
      stroke: var(--color-control-border);
      stroke-width: 1.5;
    }

    .box.warn {
      stroke: var(--color-warning);
      stroke-width: 2;
    }

    .box.danger {
      stroke: var(--color-danger);
      stroke-width: 2;
    }

    .box.ok {
      stroke: var(--color-success);
      stroke-width: 2;
    }

    .arrow {
      fill: none;
      stroke: var(--color-success);
      stroke-width: 2;
    }

    .head {
      fill: var(--color-success);
    }

    .divider {
      stroke: var(--color-border);
      stroke-width: 1.5;
    }

    .cta {
      fill: var(--color-accent);
    }

    .cta-text {
      fill: var(--color-surface);
      font-weight: 700;
    }

    .cyan {
      fill: #67e8f9;
    }

    .violet {
      fill: #c4b5fd;
    }

    .amber {
      fill: #fcd34d;
    }

    .green {
      fill: #86efac;
    }

    .red {
      fill: #fca5a5;
    }

    .swatch.cyan {
      fill: var(--color-accent);
    }

    .swatch.violet {
      fill: var(--color-violet);
    }

    .swatch.amber {
      fill: var(--color-warning);
    }

    .swatch.green {
      fill: var(--color-success);
    }

    .swatch.red {
      fill: var(--color-danger);
    }

    .cell {
      stroke: var(--color-border);
    }

    .cell.low {
      fill: color-mix(in srgb, var(--color-success) 22%, var(--color-surface));
    }

    .cell.mid {
      fill: color-mix(in srgb, var(--color-warning) 20%, var(--color-surface));
    }

    .cell.high {
      fill: color-mix(in srgb, var(--color-warning) 42%, var(--color-surface));
    }

    .cell.critical {
      fill: color-mix(in srgb, var(--color-danger) 38%, var(--color-surface));
    }

    .axis {
      text-anchor: end;
    }

    .axis-title {
      font-size: 12px;
      font-weight: 700;
    }

    .star {
      fill: var(--color-accent);
      stroke: var(--color-surface);
      stroke-width: 1;
    }
  `,
})
export class LessonDiagram {
  /** Identifiant de la démonstration (lesson.demonstration.id). */
  readonly id = input.required<string>();

  protected readonly folder = FOLDER;
  protected readonly file = FILE;
  protected readonly char = CHAR;
  protected readonly fileTree = FILE_TREE;
  protected readonly tidy = TIDY;
  protected readonly command = COMMAND;
  protected readonly commandParts = COMMAND_PARTS;
  protected readonly bars = [0, 1, 2, 3];
  protected readonly logFields = LOG_FIELDS;
  protected readonly emailClues = EMAIL_CLUES;
  /** Repères numérotés posés sur l'e-mail, à côté de chaque indice. */
  protected readonly emailSpots = [
    { n: 1, x: 336, y: 38 },
    { n: 2, x: 336, y: 70 },
    { n: 3, x: 336, y: 104 },
    { n: 5, x: 336, y: 138 },
    { n: 4, x: 214, y: 174 },
  ];
  protected readonly grid = GRID;
  protected readonly impacts = IMPACTS;
  protected readonly scopes = SCOPES;

  /** Étoile à cinq branches, dont le sommet supérieur est en (x, y). */
  protected star(x: number, y: number): string {
    return `M${x} ${y} l3 6 6 1 -4.5 4 1 6.5 -5.5 -3 -5.5 3 1 -6.5 -4.5 -4 6 -1 z`;
  }
}
