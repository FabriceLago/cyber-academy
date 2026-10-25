import { TERMINAL_LAB as LAB } from '../../content/labs/lab-terminal';
import { TerminalTask } from '../models/content.model';
import { sha256 } from './sha256';
import { isTaskDone, prompt, runCommand, startTerminal } from './terminal';

/** Tape les commandes à la suite ; renvoie le dernier résultat. */
function play(...lines: string[]) {
  let state = startTerminal(LAB);
  let result = runCommand(LAB, state, '');
  for (const line of lines) {
    result = runCommand(LAB, state, line);
    state = result.state;
  }
  return result;
}

const task = (check: TerminalTask['check']): TerminalTask => ({ id: 't', text: 't', check });

describe('terminal simulé', () => {
  it('démarre dans le dossier personnel, avec l’invite ~', () => {
    const state = startTerminal(LAB);
    expect(prompt(LAB, state)).toBe('eleve@cyberlab:~$');
    expect(runCommand(LAB, state, 'pwd').output).toEqual(['/home/eleve']);
  });

  it('liste un dossier : les dossiers sont suivis d’un /', () => {
    expect(play('ls').output).toEqual(['Documents/  Images/  notes.txt']);
    expect(play('ls Images').output).toEqual([]);
  });

  it('affiche le format long avec ls -l', () => {
    const output = play('ls -l Documents').output;
    expect(output[0]).toMatch(/^drwxr-xr-x\s+eleve\s+4096\s+incidents\/$/);
    expect(output[1]).toMatch(/^-rw-r--r--\s+eleve\s+\d+\s+planning\.txt$/);
  });

  it('se déplace avec cd : chemins relatifs, .., ~, / et cd seul', () => {
    const at = (...lines: string[]) => prompt(LAB, play(...lines).state);
    expect(at('cd Documents/incidents')).toBe('eleve@cyberlab:~/Documents/incidents$');
    expect(at('cd Documents/incidents', 'cd ..')).toBe('eleve@cyberlab:~/Documents$');
    expect(at('cd /', 'cd tmp')).toBe('eleve@cyberlab:/tmp$');
    expect(at('cd /etc', 'cd ~/Documents')).toBe('eleve@cyberlab:~/Documents$');
    expect(at('cd /etc', 'cd')).toBe('eleve@cyberlab:~$');
  });

  it('affiche un fichier avec cat et retient qu’il a été lu', () => {
    const result = play('cd Documents/incidents', 'cat rapport-incident.txt');
    expect(result.output[0]).toBe('RAPPORT D’INCIDENT N° 42 (exercice fictif)');
    expect(result.state.read).toEqual(['/home/eleve/Documents/incidents/rapport-incident.txt']);
  });

  it.each([
    ['cd Inexistant', 'cd: Inexistant: Aucun fichier ou dossier de ce type'],
    ['cd notes.txt', "cd: notes.txt: N'est pas un dossier"],
    ['cat Documents', 'cat: Documents: est un dossier'],
    ['cat', 'cat: indiquez le fichier à afficher, par exemple : cat notes.txt'],
    [
      'mkdir Documents',
      'mkdir: impossible de créer le répertoire « Documents »: Le fichier existe',
    ],
    [
      'touch absent/a.txt',
      'touch: impossible de faire un touch « absent/a.txt »: Aucun fichier ou dossier de ce type',
    ],
    ['ls -x', 'ls: option « -x » non disponible dans ce laboratoire (seules -l et -a le sont)'],
    ['cp notes.txt', 'cp: opérande de fichier cible manquant après « notes.txt »'],
    ['cp Documents /tmp', 'cp: -r non spécifié ; omission du répertoire « Documents »'],
    ['mv Documents Documents/incidents', 'mv: impossible de placer « Documents » dans lui-même'],
    [
      'mv absent.txt /tmp',
      "mv: impossible d'évaluer « absent.txt »: Aucun fichier ou dossier de ce type",
    ],
    ['chmod 999 notes.txt', 'chmod: mode incorrect : « 999 » (exemples : 640, o-r, g+w)'],
    [
      'chmod 600 /etc/hostname',
      'chmod: modification des droits de « /etc/hostname »: Opération non permise',
    ],
    ['grep lundi', 'grep: indiquez le fichier où chercher « lundi »'],
    ['ps -x', 'ps: option « -x » non disponible dans ce laboratoire (essayez ps ou ps aux)'],
    ['sha256sum Documents', 'sha256sum: Documents: est un dossier'],
  ])('signale l’erreur de « %s » comme un vrai terminal', (line, message) => {
    const result = play(line);
    expect(result.error).toBe(true);
    expect(result.output).toEqual([message]);
  });

  it('crée dossiers et fichiers sans modifier l’état précédent', () => {
    const start = startTerminal(LAB);
    const created = runCommand(LAB, start, 'mkdir enquete');
    const filled = runCommand(LAB, created.state, 'touch enquete/indices.txt');
    expect(isTaskDone(filled.state, task({ kind: 'dir', path: '/home/eleve/enquete' }))).toBe(true);
    expect(
      isTaskDone(filled.state, task({ kind: 'file', path: '/home/eleve/enquete/indices.txt' })),
    ).toBe(true);
    expect(isTaskDone(start, task({ kind: 'dir', path: '/home/eleve/enquete' }))).toBe(false);
    expect(runCommand(LAB, start, 'ls').output).toEqual(['Documents/  Images/  notes.txt']);
  });

  it.each(['rm notes.txt', 'curl https://exemple.example', 'constructor', '__proto__'])(
    'n’exécute rien hors de la liste : « %s » est refusé et l’état ne change pas',
    (line) => {
      const start = startTerminal(LAB);
      const result = runCommand(LAB, start, line);
      expect(result.error).toBe(true);
      expect(result.state).toBe(start);
    },
  );

  it('explique pourquoi rm est désactivé', () => {
    expect(play('rm notes.txt').output[0]).toContain('supprime définitivement, sans corbeille');
  });

  it('refuse les noms inhabituels et ne trouve pas les propriétés héritées', () => {
    expect(play('mkdir <script>').output[0]).toContain('refusé dans ce laboratoire');
    expect(play('cd constructor').output).toEqual([
      'cd: constructor: Aucun fichier ou dossier de ce type',
    ]);
  });

  it('cache les fichiers dont le nom commence par un point, sauf avec ls -a', () => {
    expect(play('touch .cache', 'ls').output).toEqual(['Documents/  Images/  notes.txt']);
    expect(play('touch .cache', 'ls -a').output).toEqual([
      '.  ..  .cache  Documents/  Images/  notes.txt',
    ]);
    expect(play('touch .cache', 'ls -la').output[2]).toMatch(/^-rw-r--r--\s+eleve\s+0\s+\.cache$/);
  });

  it('copie un fichier, et un dossier entier avec cp -r', () => {
    const file = play('cp notes.txt Documents');
    expect(
      isTaskDone(file.state, task({ kind: 'file', path: '/home/eleve/Documents/notes.txt' })),
    ).toBe(true);
    expect(isTaskDone(file.state, task({ kind: 'file', path: '/home/eleve/notes.txt' }))).toBe(
      true,
    );
    const folder = play('cp -r Documents /tmp/sauvegarde');
    expect(folder.error).toBe(false);
    expect(
      isTaskDone(
        folder.state,
        task({ kind: 'file', path: '/tmp/sauvegarde/incidents/rapport-incident.txt' }),
      ),
    ).toBe(true);
  });

  it('déplace et renomme avec mv : l’original disparaît, le dossier courant suit', () => {
    const moved = play('mv notes.txt Documents/rappel.txt');
    expect(isTaskDone(moved.state, task({ kind: 'absent', path: '/home/eleve/notes.txt' }))).toBe(
      true,
    );
    expect(
      isTaskDone(moved.state, task({ kind: 'file', path: '/home/eleve/Documents/rappel.txt' })),
    ).toBe(true);
    const followed = play('cd Documents/incidents', 'mv ~/Documents ~/Archives');
    expect(followed.state.cwd).toBe('/home/eleve/Archives/incidents');
  });

  it('change les droits avec chmod, en octal ou en lettres', () => {
    const octal = play('chmod 600 notes.txt', 'ls -l notes.txt');
    expect(octal.output[0]).toMatch(/^-rw-------\s+eleve/);
    expect(
      isTaskDone(octal.state, task({ kind: 'mode', path: '/home/eleve/notes.txt', mode: '600' })),
    ).toBe(true);
    expect(play('chmod o-r notes.txt', 'ls -l notes.txt').output[0]).toMatch(/^-rw-r-----/);
    expect(play('chmod u+x,g+w notes.txt').error).toBe(true); // une seule clause à la fois
    expect(play('chmod go-rx Documents', 'ls -l').output[0]).toMatch(
      /^drwx------\s+eleve.*Documents\/$/,
    );
  });

  it('cherche un texte avec grep, -i et les guillemets', () => {
    expect(play('grep -i lundi Documents/planning.txt').output).toEqual([
      'Lundi : formation au terminal',
    ]);
    expect(play('grep lundi Documents/planning.txt').output).toEqual([]);
    expect(play('grep "analyse de" Documents/planning.txt notes.txt').output).toEqual([
      'Documents/planning.txt:Mardi : analyse de l’incident n° 42',
    ]);
  });

  it('liste les processus avec ps ; ps aux montre aussi ceux de la machine', () => {
    const lab = { ...LAB, processes: [{ pid: 1, user: 'root', command: '/sbin/init' }] };
    const own = runCommand(lab, startTerminal(lab), 'ps').output;
    expect(own).toHaveLength(3);
    expect(own[0]).toMatch(/PID\s+UTILISATEUR\s+COMMANDE/);
    const all = runCommand(lab, startTerminal(lab), 'ps aux').output;
    expect(all[1]).toMatch(/^\s+1\s+root\s+\/sbin\/init$/);
    expect(all).toHaveLength(4);
  });

  it('calcule l’empreinte SHA-256 d’un fichier', () => {
    expect(play('sha256sum /etc/hostname').output).toEqual([
      `${sha256('cyberlab')}  /etc/hostname`,
    ]);
  });

  it('efface l’écran avec clear et ignore une ligne vide', () => {
    expect(play('clear').clear).toBe(true);
    expect(play('   ')).toMatchObject({ output: [], error: false });
  });
});
