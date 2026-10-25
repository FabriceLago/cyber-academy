import { FsDir, FsNode, TerminalLab, TerminalProcess, TerminalTask } from '../models/content.model';
import { sha256 } from './sha256';

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
  readonly processes: readonly TerminalProcess[];
}

type Command = (args: readonly string[], state: TerminalState, ctx: Context) => CommandResult;

const NOT_FOUND = 'Aucun fichier ou dossier de ce type';
/** Noms acceptés pour mkdir, touch, cp et mv : de quoi rester lisible et sans surprise. */
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
  const [name, ...args] = tokenize(line);
  if (!name) return { state, output: [], error: false };
  const command = COMMANDS.get(name);
  if (command) {
    return command(args, state, { home: lab.home, user: lab.user, processes: lab.processes ?? [] });
  }
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
    case 'absent':
      return nodeAt(state.root, check.path) === undefined;
    case 'mode': {
      const node = nodeAt(state.root, check.path);
      return node !== undefined && modeOf(node) === check.mode;
    }
    default:
      return nodeAt(state.root, check.path)?.kind === check.kind;
  }
}

/** Mots de la ligne ; un texte entre guillemets (« grep "mot de passe" … ») reste d'un seul tenant. */
function tokenize(line: string): string[] {
  return [...line.matchAll(/"([^"]*)"?|'([^']*)'?|(\S+)/g)].map((m) => m[1] ?? m[2] ?? m[3]);
}

const COMMANDS = new Map<string, Command>([
  [
    'help',
    (_, state) =>
      ok(state, [
        'Commandes disponibles dans ce laboratoire :',
        '  pwd                  affiche le dossier courant',
        '  ls [-l] [-a] [chemin] liste un dossier (-a montre aussi les fichiers cachés)',
        '  cd [chemin]          change de dossier (cd .. remonte, cd ~ ou cd seul revient chez vous)',
        '  cat fichier          affiche le contenu d’un fichier',
        '  grep [-i] motif fichier  affiche les lignes qui contiennent le motif',
        '  mkdir nom            crée un dossier',
        '  touch nom            crée un fichier vide',
        '  cp [-r] source cible copie un fichier (-r : un dossier et tout son contenu)',
        '  mv source cible      déplace ou renomme',
        '  chmod droits fichier change les droits, par exemple chmod 640 notes.txt ou chmod o-r notes.txt',
        '  ps [aux]             liste vos programmes en cours (aux : tous ceux de la machine)',
        '  sha256sum fichier    calcule l’empreinte d’un fichier',
        '  clear                efface l’écran',
      ]),
  ],
  ['pwd', (_, state) => ok(state, [state.cwd])],
  ['clear', (_, state) => ({ state, output: [], error: false, clear: true })],
  ['ls', ls],
  ['cd', cd],
  ['cat', cat],
  ['grep', grep],
  ['mkdir', (args, state, ctx) => create('dir', args, state, ctx)],
  ['touch', (args, state, ctx) => create('file', args, state, ctx)],
  ['cp', cp],
  ['mv', (args, state, ctx) => transfer('mv', args, state, ctx, false)],
  ['chmod', chmod],
  ['ps', ps],
  ['sha256sum', sha256sum],
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
  const flags = new Set<string>();
  for (const option of args.filter((a) => a.startsWith('-'))) {
    for (const flag of option.slice(1)) {
      if (flag !== 'l' && flag !== 'a') {
        return fail(
          state,
          `ls: option « -${flag} » non disponible dans ce laboratoire (seules -l et -a le sont)`,
        );
      }
      flags.add(flag);
    }
  }
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
    let entries: [string, FsNode][] = [[target, node]];
    if (node.kind === 'dir') {
      // Comme sous Linux : un nom qui commence par un point est caché, sauf avec -a.
      const children = Object.entries(node.children)
        .filter(([name]) => flags.has('a') || !name.startsWith('.'))
        .sort(([a], [b]) => a.localeCompare(b, 'fr'));
      entries = flags.has('a')
        ? [['.', node], ['..', nodeAt(state.root, parentOf(path)) ?? node], ...children]
        : children;
    }
    if (flags.has('l')) {
      for (const [name, child] of entries) {
        output.push(longLine(name, child, ownerOf(path, ctx)));
      }
    } else if (entries.length > 0) {
      output.push(entries.map(([name, child]) => display(name, child)).join('  '));
    }
  }
  return { state, output, error };
}

/** Format long simplifié : type et droits, propriétaire, taille, nom. */
function longLine(name: string, node: FsNode, owner: string): string {
  const size = node.kind === 'dir' ? 4096 : new TextEncoder().encode(node.content).length;
  return `${permissions(node)}  ${owner.padEnd(6)} ${String(size).padStart(5)}  ${display(name, node)}`;
}

/** Les dossiers sont suivis d'un / (sauf « . » et « .. »). */
function display(name: string, node: FsNode): string {
  return node.kind === 'dir' && name !== '.' && name !== '..' ? `${name}/` : name;
}

/** Dans le dossier personnel, tout appartient à l'apprenant ; ailleurs, à root. */
function ownerOf(path: string, ctx: Context): string {
  return path === ctx.home || path.startsWith(`${ctx.home}/`) ? ctx.user : 'root';
}

function modeOf(node: FsNode): string {
  return node.mode ?? (node.kind === 'dir' ? '755' : '644');
}

/** « 640 » → « -rw-r----- ». */
function permissions(node: FsNode): string {
  const rwx = (digit: string) => {
    const n = Number(digit);
    return `${n & 4 ? 'r' : '-'}${n & 2 ? 'w' : '-'}${n & 1 ? 'x' : '-'}`;
  };
  return `${node.kind === 'dir' ? 'd' : '-'}${[...modeOf(node)].map(rwx).join('')}`;
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

/** Recherche d'un texte simple (pas d'expression régulière), avec -i pour ignorer la casse. */
function grep(args: readonly string[], state: TerminalState, ctx: Context): CommandResult {
  const invalid = args.find((a) => a.startsWith('-') && a !== '-i');
  if (invalid) {
    return fail(
      state,
      `grep: option « ${invalid} » non disponible dans ce laboratoire (seule -i l’est)`,
    );
  }
  const ignoreCase = args.includes('-i');
  const [pattern, ...targets] = args.filter((a) => a !== '-i');
  if (pattern === undefined) {
    return fail(
      state,
      'grep: indiquez un motif et un fichier, par exemple : grep erreur journal.txt',
    );
  }
  if (targets.length === 0)
    return fail(state, `grep: indiquez le fichier où chercher « ${pattern} »`);
  const normalize = (text: string) => (ignoreCase ? text.toLowerCase() : text);
  const output: string[] = [];
  let error = false;
  for (const target of targets) {
    const node = nodeAt(state.root, resolve(state.cwd, ctx.home, target));
    if (node?.kind !== 'file') {
      output.push(`grep: ${target}: ${node ? 'est un dossier' : NOT_FOUND}`);
      error = true;
      continue;
    }
    for (const line of node.content.split('\n')) {
      if (normalize(line).includes(normalize(pattern))) {
        output.push(targets.length > 1 ? `${target}:${line}` : line);
      }
    }
  }
  return { state, output, error };
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
    const name = baseName(path);
    const parent = nodeAt(root, parentOf(path));
    const existing = nodeAt(root, path);
    const cannot =
      kind === 'dir'
        ? `mkdir: impossible de créer le répertoire « ${target} »`
        : `touch: impossible de faire un touch « ${target} »`;
    if (!VALID_NAME.test(name) || name === '.' || name === '..') {
      output.push(refusedName(command, target));
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

function cp(args: readonly string[], state: TerminalState, ctx: Context): CommandResult {
  const invalid = args.find((a) => a.startsWith('-') && a !== '-r' && a !== '-R');
  if (invalid) {
    return fail(
      state,
      `cp: option « ${invalid} » non disponible dans ce laboratoire (seule -r l’est)`,
    );
  }
  const recursive = args.some((a) => a === '-r' || a === '-R');
  return transfer(
    'cp',
    args.filter((a) => !a.startsWith('-')),
    state,
    ctx,
    true,
    recursive,
  );
}

/**
 * cp (keep) et mv : chaque source va dans la cible si c'est un dossier existant, sinon prend son
 * nom. Un fichier existant est remplacé, comme sur un vrai système, sans confirmation.
 */
function transfer(
  command: 'cp' | 'mv',
  paths: readonly string[],
  state: TerminalState,
  ctx: Context,
  keep: boolean,
  recursive = false,
): CommandResult {
  if (paths.length === 0) return fail(state, `${command}: opérande de fichier manquant`);
  if (paths.length === 1) {
    return fail(state, `${command}: opérande de fichier cible manquant après « ${paths[0]} »`);
  }
  const sources = paths.slice(0, -1);
  const target = paths[paths.length - 1];
  const destination = resolve(state.cwd, ctx.home, target);
  if (sources.length > 1 && nodeAt(state.root, destination)?.kind !== 'dir') {
    return fail(state, `${command}: la cible « ${target} » n'est pas un dossier`);
  }
  let root = state.root;
  let cwd = state.cwd;
  const output: string[] = [];
  for (const source of sources) {
    const from = resolve(state.cwd, ctx.home, source);
    const node = nodeAt(root, from);
    const to =
      nodeAt(root, destination)?.kind === 'dir'
        ? `${destination === '/' ? '' : destination}/${baseName(from)}`
        : destination;
    const existing = nodeAt(root, to);
    if (!node) {
      output.push(`${command}: impossible d'évaluer « ${source} »: ${NOT_FOUND}`);
    } else if (node.kind === 'dir' && keep && !recursive) {
      output.push(`cp: -r non spécifié ; omission du répertoire « ${source} »`);
    } else if (from === '/' || to === from) {
      output.push(`${command}: « ${source} » et « ${target} » désignent le même élément`);
    } else if (to.startsWith(`${from}/`)) {
      output.push(`${command}: impossible de placer « ${source} » dans lui-même`);
    } else if (!VALID_NAME.test(baseName(to))) {
      output.push(refusedName(command, target));
    } else if (nodeAt(root, parentOf(to))?.kind !== 'dir') {
      output.push(`${command}: impossible de créer « ${target} »: ${NOT_FOUND}`);
    } else if (existing && existing.kind !== node.kind) {
      output.push(
        `${command}: impossible de remplacer ${existing.kind === 'dir' ? 'le dossier' : 'le fichier'} « ${target} » par ${node.kind === 'dir' ? 'un dossier' : 'un fichier'}`,
      );
    } else {
      root = withNode(root, to, node);
      if (!keep) {
        root = withoutNode(root, from);
        // Déplacer le dossier où l'on se trouve : on le suit, comme le ferait le shell.
        if (cwd === from || cwd.startsWith(`${from}/`)) cwd = `${to}${cwd.slice(from.length)}`;
      }
    }
  }
  return { state: { ...state, root, cwd }, output, error: output.length > 0 };
}

/** Droits en octal (640) ou symboliques (o-r, g+w, u=rw, a+x). */
function chmod(args: readonly string[], state: TerminalState, ctx: Context): CommandResult {
  if (args.length === 0) return fail(state, 'chmod: opérande manquant');
  const [spec, ...targets] = args;
  if (targets.length === 0) return fail(state, `chmod: opérande manquant après « ${spec} »`);
  let root = state.root;
  const output: string[] = [];
  for (const target of targets) {
    const path = resolve(state.cwd, ctx.home, target);
    const node = nodeAt(root, path);
    if (!node) {
      output.push(`chmod: impossible d'accéder à « ${target} »: ${NOT_FOUND}`);
      continue;
    }
    const mode = applyMode(modeOf(node), spec);
    if (mode === null) {
      return fail(state, `chmod: mode incorrect : « ${spec} » (exemples : 640, o-r, g+w)`);
    }
    if (ownerOf(path, ctx) !== ctx.user) {
      output.push(`chmod: modification des droits de « ${target} »: Opération non permise`);
      continue;
    }
    root = withNode(root, path, { ...node, mode });
  }
  return { state: { ...state, root }, output, error: output.length > 0 };
}

function applyMode(current: string, spec: string): string | null {
  if (/^[0-7]{3}$/.test(spec)) return spec;
  const match = /^([ugoa]*)([+=-])([rwx]*)$/.exec(spec);
  if (!match) return null;
  const [, who, operator, letters] = match;
  const bits =
    (letters.includes('r') ? 4 : 0) |
    (letters.includes('w') ? 2 : 0) |
    (letters.includes('x') ? 1 : 0);
  const all = who === '' || who.includes('a');
  return [...current]
    .map((digit, i) => {
      if (!all && !who.includes('ugo'[i])) return digit;
      const n = Number(digit);
      return String(operator === '+' ? n | bits : operator === '-' ? n & ~bits : bits);
    })
    .join('');
}

/** ps : le terminal de l'apprenant ; ps aux (ou -ef) : tous les processus fictifs de la machine. */
function ps(args: readonly string[], state: TerminalState, ctx: Context): CommandResult {
  const invalid = args.find((a) => !['aux', 'ax', '-e', '-ef', '-A'].includes(a));
  if (invalid) {
    return fail(
      state,
      `ps: option « ${invalid} » non disponible dans ce laboratoire (essayez ps ou ps aux)`,
    );
  }
  const own: TerminalProcess[] = [
    { pid: 4321, user: ctx.user, command: '-bash' },
    { pid: 4387, user: ctx.user, command: 'ps' },
  ];
  const rows = (args.length > 0 ? [...ctx.processes, ...own] : own).sort((a, b) => a.pid - b.pid);
  return ok(state, [
    `${'PID'.padStart(6)}  ${'UTILISATEUR'.padEnd(12)} COMMANDE`,
    ...rows.map((p) => `${String(p.pid).padStart(6)}  ${p.user.padEnd(12)} ${p.command}`),
  ]);
}

function sha256sum(args: readonly string[], state: TerminalState, ctx: Context): CommandResult {
  if (args.length === 0) {
    return fail(state, 'sha256sum: indiquez le fichier, par exemple : sha256sum notes.txt');
  }
  const output: string[] = [];
  let error = false;
  for (const target of args) {
    const node = nodeAt(state.root, resolve(state.cwd, ctx.home, target));
    if (node?.kind === 'file') {
      output.push(`${sha256(node.content)}  ${target}`);
    } else {
      output.push(`sha256sum: ${target}: ${node ? 'est un dossier' : NOT_FOUND}`);
      error = true;
    }
  }
  return { state, output, error };
}

function refusedName(command: string, target: string): string {
  return `${command}: nom « ${target} » refusé dans ce laboratoire (lettres, chiffres, point, tiret et tiret bas uniquement)`;
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

function baseName(path: string): string {
  return path.split('/').at(-1) ?? '';
}

function parentOf(path: string): string {
  return path.slice(0, path.length - baseName(path).length - 1) || '/';
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
  return { ...dir, children: { ...dir.children, [head]: child } };
}

function withoutNode(dir: FsDir, path: string): FsDir {
  const [head, ...rest] = path.split('/').filter(Boolean);
  const children =
    rest.length === 0
      ? Object.fromEntries(Object.entries(dir.children).filter(([name]) => name !== head))
      : { ...dir.children, [head]: withoutNode(dir.children[head] as FsDir, rest.join('/')) };
  return { ...dir, children };
}

function ok(state: TerminalState, output: readonly string[]): CommandResult {
  return { state, output, error: false };
}

function fail(state: TerminalState, message: string): CommandResult {
  return { state, output: [message], error: true };
}
