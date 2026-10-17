import { FsDir, FsNode, TerminalLab } from '../../core/models/content.model';

const dir = (children: Record<string, FsNode> = {}): FsDir => ({ kind: 'dir', children });
const file = (lines: readonly string[]): FsNode => ({ kind: 'file', content: lines.join('\n') });

const HOME = '/home/eleve';

/** Serveur fictif « cyberlab » : rien n'est exécuté, tout est simulé en mémoire. */
export const TERMINAL_LAB: TerminalLab = {
  id: 'lab-terminal',
  kind: 'terminal',
  title: 'Explorer un système de fichiers dans un terminal simulé',
  skillIds: ['utiliser-un-terminal'],
  scenario:
    'Vous rejoignez l’équipe de sécurité de Société Exemple. Votre responsable a déposé un rapport d’incident dans vos documents, sur le serveur cyberlab. Retrouvez-le, lisez-le, puis préparez un dossier de travail pour l’enquête.',
  objectives: [
    'Se repérer avec pwd et ls',
    'Se déplacer avec cd',
    'Lire un fichier avec cat',
    'Créer un dossier et un fichier avec mkdir et touch',
  ],
  hints: [
    'Tapez ls pour voir ce que contient votre dossier personnel : les noms suivis d’un / sont des dossiers.',
    'Entrez dans Documents avec cd Documents, puis dans son sous-dossier incidents. Lisez le rapport avec cat suivi du nom du fichier.',
    'Revenez chez vous avec cd ~, puis tapez mkdir enquete, cd enquete et touch indices.txt.',
  ],
  debrief:
    'Vous avez utilisé les commandes de base de tout administrateur : pwd et ls pour vous repérer, cd pour vous déplacer, cat pour lire, mkdir et touch pour créer. Sur un vrai serveur, ce sont les mêmes commandes, mais elles agissent pour de bon : une suppression avec rm ne se rattrape pas. Les lettres affichées par ls -l (rwx) sont les permissions : qui peut lire, modifier ou exécuter un fichier. Elles seront le sujet d’un prochain laboratoire.',
  user: 'eleve',
  host: 'cyberlab',
  home: HOME,
  filesystem: dir({
    etc: dir({ hostname: file(['cyberlab']) }),
    home: dir({
      eleve: dir({
        'notes.txt': file([
          'Bienvenue sur cyberlab !',
          'Pense-bête : le rapport d’incident est rangé quelque part dans Documents.',
        ]),
        Documents: dir({
          'planning.txt': file([
            'Lundi : formation au terminal',
            'Mardi : analyse de l’incident n° 42',
            'Mercredi : bilan avec l’équipe',
          ]),
          incidents: dir({
            'rapport-incident.txt': file([
              'RAPPORT D’INCIDENT N° 42 (exercice fictif)',
              'Poste concerné : PC-COMPTA-07',
              'Résumé : un e-mail imitant la banque demandait un mot de passe et un code SMS.',
              'L’utilisateur n’a rien saisi et a signalé le message : bon réflexe.',
              '',
              'Consigne : créez le dossier enquete dans votre dossier personnel,',
              'placez-vous dedans et créez-y le fichier vide indices.txt.',
            ]),
          }),
        }),
        Images: dir(),
      }),
    }),
    tmp: dir(),
  }),
  tasks: [
    {
      id: 'lire-rapport',
      text: 'Lire le rapport d’incident rangé dans le dossier Documents',
      check: { kind: 'read', path: `${HOME}/Documents/incidents/rapport-incident.txt` },
    },
    {
      id: 'creer-dossier',
      text: 'Créer le dossier enquete dans votre dossier personnel',
      check: { kind: 'dir', path: `${HOME}/enquete` },
    },
    {
      id: 'creer-fichier',
      text: 'Créer le fichier vide indices.txt dans le dossier enquete',
      check: { kind: 'file', path: `${HOME}/enquete/indices.txt` },
    },
    {
      id: 'se-placer',
      text: 'Terminer en vous plaçant dans le dossier enquete',
      check: { kind: 'cwd', path: `${HOME}/enquete` },
    },
  ],
};
