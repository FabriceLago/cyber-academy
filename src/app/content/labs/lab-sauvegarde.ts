import { FsDir, FsNode, TerminalLab } from '../../core/models/content.model';

const dir = (children: Record<string, FsNode> = {}): FsDir => ({ kind: 'dir', children });
const file = (lines: readonly string[]): FsNode => ({ kind: 'file', content: lines.join('\n') });

const HOME = '/home/lea';
const BACKUP = '/media/cle-usb/Sauvegarde-2026';

/** Ordinateur portable fictif de Léa : rien n'est exécuté, tout est simulé en mémoire. */
export const SAUVEGARDE_LAB: TerminalLab = {
  id: 'lab-sauvegarde',
  kind: 'terminal',
  title: 'Ranger, copier et sauvegarder des fichiers',
  skillIds: ['sauvegarder-ses-donnees'],
  scenario:
    'Léa vous confie son ordinateur portable : son mémoire de fin d’études n’existe qu’en un seul exemplaire. Elle a branché une clé USB, visible dans /media/cle-usb, et laissé ses consignes dans un fichier caché de son dossier personnel. Rangez ses fichiers, puis faites la sauvegarde.',
  objectives: [
    'Afficher les fichiers cachés avec ls -a',
    'Déplacer un fichier avec mv',
    'Copier des dossiers entiers avec cp -r',
    'Vérifier la sauvegarde avec ls',
  ],
  hints: [
    'Un fichier caché vous attend dans votre dossier personnel : tapez ls -a pour le voir, puis cat .consignes pour le lire.',
    'Pour ranger la facture : mv Téléchargements/facture-octobre.pdf Documents/. Pour préparer la clé : mkdir /media/cle-usb/Sauvegarde-2026.',
    'Pour copier un dossier entier, ajoutez -r : cp -r Documents /media/cle-usb/Sauvegarde-2026/, puis la même commande pour Images. Vérifiez avec ls /media/cle-usb/Sauvegarde-2026.',
  ],
  debrief:
    'Vous avez fait une vraie sauvegarde : ls -a a révélé les consignes cachées, mv a rangé la facture sans la dupliquer, et cp -r a copié Documents et Images sans rien enlever de l’ordinateur. La clé USB est une deuxième copie sur un deuxième support : pour respecter la règle 3-2-1, il manque encore une copie hors de chez Léa. Pensez aussi à débrancher la clé, et à vérifier de temps en temps qu’un fichier s’ouvre bien depuis la sauvegarde. Enfin, le fichier lecteur-video.exe, dans Téléchargements, est une fausse mise à jour obtenue par une publicité : on ne l’ouvre jamais.',
  user: 'lea',
  host: 'portable-lea',
  home: HOME,
  filesystem: dir({
    etc: dir({ hostname: file(['portable-lea']) }),
    home: dir({
      lea: dir({
        '.consignes': file([
          'Consignes de sauvegarde (exercice fictif)',
          '1. Rangez la facture téléchargée (Téléchargements/facture-octobre.pdf) dans Documents.',
          '2. Créez le dossier Sauvegarde-2026 sur la clé USB (/media/cle-usb).',
          '3. Copiez-y les dossiers Documents et Images, avec tout leur contenu.',
          '4. Vérifiez la copie avec ls, puis pensez à débrancher la clé.',
        ]),
        Documents: dir({
          'memoire.odt': file([
            'Mémoire de fin d’études (document fictif)',
            'Chapitre 1 : la sécurité informatique des petites associations',
          ]),
          'budget.ods': file(['Budget 2026 de l’association (document fictif)']),
        }),
        Images: dir({
          vacances: dir({
            'plage.jpg': file(['Image fictive : une plage']),
            'montagne.jpg': file(['Image fictive : un sommet enneigé']),
          }),
        }),
        Téléchargements: dir({
          'facture-octobre.pdf': file(['Facture d’octobre (document fictif)']),
          'lecteur-video.exe': file([
            'Programme fictif : une fausse mise à jour proposée par une publicité. Ne l’ouvrez pas.',
          ]),
        }),
      }),
    }),
    media: dir({ 'cle-usb': dir() }),
    tmp: dir(),
  }),
  tasks: [
    {
      id: 'lire-consignes',
      text: 'Lire les consignes cachées dans le dossier personnel',
      check: { kind: 'read', path: `${HOME}/.consignes` },
    },
    {
      id: 'ranger-facture',
      text: 'Ranger la facture dans Documents',
      check: { kind: 'file', path: `${HOME}/Documents/facture-octobre.pdf` },
    },
    {
      id: 'sans-doublon',
      text: 'La facture ne traîne plus dans Téléchargements (déplacée, pas copiée)',
      check: { kind: 'absent', path: `${HOME}/Téléchargements/facture-octobre.pdf` },
    },
    {
      id: 'preparer-cle',
      text: 'Créer le dossier Sauvegarde-2026 sur la clé USB',
      check: { kind: 'dir', path: BACKUP },
    },
    {
      id: 'copier-documents',
      text: 'Copier le dossier Documents sur la clé, avec tout son contenu',
      check: { kind: 'file', path: `${BACKUP}/Documents/memoire.odt` },
    },
    {
      id: 'copier-images',
      text: 'Copier le dossier Images sur la clé, avec ses sous-dossiers',
      check: { kind: 'file', path: `${BACKUP}/Images/vacances/plage.jpg` },
    },
  ],
};
