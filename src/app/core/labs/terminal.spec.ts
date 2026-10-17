import { TERMINAL_LAB as LAB } from '../../content/labs/lab-terminal';
import { TerminalTask } from '../models/content.model';
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

const task = (kind: TerminalTask['check']['kind'], path: string): TerminalTask => ({
  id: 't',
  text: 't',
  check: { kind, path },
});

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
    ['ls -a', 'ls: option « -a » non disponible dans ce laboratoire (seule -l l’est)'],
  ])('signale l’erreur de « %s » comme un vrai terminal', (line, message) => {
    const result = play(line);
    expect(result.error).toBe(true);
    expect(result.output).toEqual([message]);
  });

  it('crée dossiers et fichiers sans modifier l’état précédent', () => {
    const start = startTerminal(LAB);
    const created = runCommand(LAB, start, 'mkdir enquete');
    const filled = runCommand(LAB, created.state, 'touch enquete/indices.txt');
    expect(isTaskDone(filled.state, task('dir', '/home/eleve/enquete'))).toBe(true);
    expect(isTaskDone(filled.state, task('file', '/home/eleve/enquete/indices.txt'))).toBe(true);
    expect(isTaskDone(start, task('dir', '/home/eleve/enquete'))).toBe(false);
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

  it('efface l’écran avec clear et ignore une ligne vide', () => {
    expect(play('clear').clear).toBe(true);
    expect(play('   ')).toMatchObject({ output: [], error: false });
  });
});
