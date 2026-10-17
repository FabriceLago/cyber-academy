import { FsDir, FsNode, TerminalLab, TerminalTask } from '../models/content.model';

/**
 * Terminal simulé : un interpréteur de quelques commandes pédagogiques, qui transforme un état
 * en mémoire. Aucune commande n'est exécutée : tout nom absent de la liste est refusé.
 */

export interface TerminalState {
  readonly root: FsDir;
  /** Dossier courant, en chemin absolu. */
  readonly cwd: string;
  /** Fichiers affichés avec cat, en chemins absolus : sert à valider les tâches de lecture. */
  readonly read: readonly string[];
}

export interface CommandResult {
  readonly state: TerminalState;
  readonly output: readonly string[];
  readonly error: boolean;
  /** « clear » : effacer l'écran. */
  readonly clear?: boolean;
}

interface Context {
  readonly home: string;
  readonly user: string;
}

type Command = (args: readonly string[], state: TerminalState, ctx: Context) => CommandResult;

const NOT_FOUND = 'Aucun fichier ou dossier de ce type';
/** Noms acceptés pour mkdir et touch : de quoi rester lisible et sans surprise. */
const VALID_NAME = /^[\p{L}\p{N}._-]+$/u;

export function startTerminal(lab: TerminalLab): TerminalState {
  return { root: lab.filesystem, cwd: lab.home, read: [] };
}

/** Invite de commande, par exemple « eleve@cyberlab:~/Documents$ ». */
export function prompt(lab: TerminalLab, state: TerminalState): string {
  const { cwd } = state;
  const where =
    cwd === lab.home
      ? '~'
      : cwd.startsWith(`${lab.home}/`)
        ? `~${cwd.slice(lab.home.length)}`
        : cwd;
  return `${lab.user}@${lab.host}:${where}$`;
}

export function runCommand(lab: TerminalLab, state: TerminalState, line: string): CommandResult {
  const [name, ...args] = line.trim().split(/\s+/);
  if (!name) return { state, output: [], error: false };
  const command = COMMANDS.get(name);
  if (command) return command(args, state, { home: lab.home, user: lab.user });
  const disabled = DISABLED.get(name);
  return fail(
    state,
    disabled
      ? `${name}: ${disabled}`
      : `${name}: commande introuvable. Tapez help pour voir les commandes disponibles.`,
  );
}

export function isTaskDone(state: TerminalState, { check }: TerminalTask): boolean {
  switch (check.kind) {
    case 'read':
      return state.read.includes(check.path);
    case 'cwd':
      return state.cwd === check.path;
    default:
      return nodeAt(state.root, check.path)?.kind === check.kind;
  }
}

const COMMANDS = new Map<string, Command>([
  [
    'help',
    (_, state) =>
      ok(state, [
        'Commandes disponibles dans ce laboratoire :',
        '  pwd              affiche le dossier courant',
        '  ls [-l] [chemin] liste un dossier (les dossiers sont suivis d’un /)',
        '  cd [chemin]      change de dossier (cd .. remonte, cd ~ ou cd seul revient chez vous)',
        '  cat fichier      affiche le contenu d’un fichier',
        '  mkdir nom        crée un dossier',
        '  touch nom        crée un fichier vide',
        '  clear            efface l’écran',
      ]),
  ],
  ['pwd', (_, state) => ok(state, [state.cwd])],
  ['clear', (_, state) => ({ state, output: [], error: false, clear: true })],
  ['ls', ls],
  ['cd', cd],
  ['cat', cat],
  ['mkdir', (args, state, ctx) => create('dir', args, state, ctx)],
  ['touch', (args, state, ctx) => create('file', args, state, ctx)],
]);

/** Commandes connues mais refusées, avec la raison : le refus fait partie de la leçon. */
const DISABLED = new Map<string, string>([
  [
    'rm',
    'commande désactivée dans ce laboratoire. Sur un vrai système, elle supprime définitivement, sans corbeille.',
  ],
  [
    'rmdir',
    'commande désactivée dans ce laboratoire. Sur un vrai système, elle supprime un dossier.',
  ],
  ['sudo', 'commande désactivée : ce laboratoire n’accorde pas les droits d’administrateur.'],
  ['su', 'commande désactivée : ce laboratoire n’accorde pas les droits d’administrateur.'],
]);

function ls(args: readonly string[], state: TerminalState, ctx: Context): CommandResult {
  const options = args.filter((a) => a.startsWith('-'));
  const invalid = options.find((o) => o !== '-l');
  if (invalid)
    return fail(
      state,
      `ls: option « ${invalid} » non disponible dans ce laboratoire (seule -l l’est)`,
    );
  const long = options.length > 0;
  const targets = args.filter((a) => !a.startsWith('-'));
  const output: string[] = [];
  let error = false;
  for (const target of targets.length > 0 ? targets : ['.']) {
    const path = resolve(state.cwd, ctx.home, target);
    const node = nodeAt(state.root, path);
    if (!node) {
      output.push(`ls: impossible d'accéder à '${target}': ${NOT_FOUND}`);
      error = true;
      continue;
    }
    if (targets.length > 1) output.push(`${target}:`);
    const entries: [string, FsNode][] =
      node.kind === 'dir'
        ? Object.entries(node.children).sort(([a], [b]) => a.localeCompare(b, 'fr'))
        : [[target, node]];
    if (long) {
      for (const [name, child] of entries) output.push(longLine(name, child, path, ctx));
    } else if (entries.length > 0) {
      output.push(
        entries.map(([name, child]) => (child.kind === 'dir' ? `${name}/` : name)).join('  '),
      );
    }
  }
  return { state, output, error };
}

/** Format long simplifié : type et permissions, propriétaire, taille, nom. */
function longLine(name: string, node: FsNode, parent: string, ctx: Context): string {
  const owner = parent === ctx.home || parent.startsWith(`${ctx.home}/`) ? ctx.user : 'root';
  const [mode, size] =
    node.kind === 'dir'
      ? ['drwxr-xr-x', 4096]
      : ['-rw-r--r--', new TextEncoder().encode(node.content).length];
  return `${mode}  ${owner.padEnd(6)} ${String(size).padStart(5)}  ${node.kind === 'dir' ? `${name}/` : name}`;
}

function cd(args: readonly string[], state: TerminalState, ctx: Context): CommandResult {
  if (args.length > 1) return fail(state, 'cd: trop d’arguments');
  const target = args[0] ?? '~';
  const path = resolve(state.cwd, ctx.home, target);
  const node = nodeAt(state.root, path);
  if (!node) return fail(state, `cd: ${target}: ${NOT_FOUND}`);
  if (node.kind !== 'dir') return fail(state, `cd: ${target}: N'est pas un dossier`);
  return ok({ ...state, cwd: path }, []);
}

function cat(args: readonly string[], state: TerminalState, ctx: Context): CommandResult {
  if (args.length === 0)
    return fail(state, 'cat: indiquez le fichier à afficher, par exemple : cat notes.txt');
  const output: string[] = [];
  const read = [...state.read];
  let error = false;
  for (const target of args) {
    const path = resolve(state.cwd, ctx.home, target);
    const node = nodeAt(state.root, path);
    if (node?.kind === 'file') {
      output.push(...node.content.split('\n'));
      if (!read.includes(path)) read.push(path);
    } else {
      output.push(`cat: ${target}: ${node ? 'est un dossier' : NOT_FOUND}`);
      error = true;
    }
  }
  return { state: { ...state, read }, output, error };
}

function create(
  kind: 'dir' | 'file',
  args: readonly string[],
  state: TerminalState,
  ctx: Context,
): CommandResult {
  const command = kind === 'dir' ? 'mkdir' : 'touch';
  if (args.length === 0) return fail(state, `${command}: opérande manquant`);
  let root = state.root;
  const output: string[] = [];
  for (const target of args) {
    const path = resolve(state.cwd, ctx.home, target);
    const name = path.split('/').at(-1) ?? '';
    const parent = nodeAt(root, path.slice(0, path.length - name.length - 1) || '/');
    const existing = nodeAt(root, path);
    const cannot =
      kind === 'dir'
        ? `mkdir: impossible de créer le répertoire « ${target} »`
        : `touch: impossible de faire un touch « ${target} »`;
    if (!VALID_NAME.test(name) || name === '.' || name === '..') {
      output.push(
        `${command}: nom « ${target} » refusé dans ce laboratoire (lettres, chiffres, point, tiret et tiret bas uniquement)`,
      );
    } else if (!parent) {
      output.push(`${cannot}: ${NOT_FOUND}`);
    } else if (parent.kind !== 'dir') {
      output.push(`${cannot}: N'est pas un dossier`);
    } else if (existing) {
      // touch sur un élément existant : rien à créer (la date n'est pas simulée).
      if (kind === 'dir') output.push(`${cannot}: Le fichier existe`);
    } else {
      root = withNode(
        root,
        path,
        kind === 'dir' ? { kind: 'dir', children: {} } : { kind: 'file', content: '' },
      );
    }
  }
  return { state: { ...state, root }, output, error: output.length > 0 };
}

/** Chemin absolu normalisé : gère « / », « ~ », « . » et « .. ». */
function resolve(cwd: string, home: string, target: string): string {
  const fromHome = target === '~' || target.startsWith('~/');
  const start = target.startsWith('/') ? '' : fromHome ? home : cwd;
  const parts: string[] = [];
  for (const part of `${start}/${fromHome ? target.slice(1) : target}`.split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..') parts.pop();
    else parts.push(part);
  }
  return `/${parts.join('/')}`;
}

function nodeAt(root: FsDir, path: string): FsNode | undefined {
  let node: FsNode = root;
  for (const part of path.split('/').filter(Boolean)) {
    // Object.hasOwn : un nom comme « constructor » ne doit pas trouver une propriété héritée.
    if (node.kind !== 'dir' || !Object.hasOwn(node.children, part)) return undefined;
    node = node.children[part];
  }
  return node;
}

/** Copie du chemin modifié seulement : l'état précédent reste intact. */
function withNode(dir: FsDir, path: string, node: FsNode): FsDir {
  const [head, ...rest] = path.split('/').filter(Boolean);
  const child =
    rest.length === 0 ? node : withNode(dir.children[head] as FsDir, rest.join('/'), node);
  return { kind: 'dir', children: { ...dir.children, [head]: child } };
}

function ok(state: TerminalState, output: readonly string[]): CommandResult {
  return { state, output, error: false };
}

function fail(state: TerminalState, message: string): CommandResult {
  return { state, output: [message], error: true };
}
