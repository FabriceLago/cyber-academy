import { Lesson } from '../../core/models/content.model';

/** Niveau 1, leçon pilote : la première rédigée selon le plan de contenu (docs/plan-contenu.md). */
export const MISES_A_JOUR_ET_SAUVEGARDES: Lesson = {
  id: 'mises-a-jour-et-sauvegardes',
  title: 'Mises à jour et sauvegardes',
  level: 'debutant',
  durationMinutes: 25,
  prerequisiteIds: [],
  labId: 'lab-sauvegarde',
  skillIds: ['sauvegarder-ses-donnees'],
  objectives: [
    {
      id: 'o1',
      text: 'Expliquer pourquoi une mise à jour de sécurité doit être installée sans tarder',
    },
    { id: 'o2', text: 'Appliquer la règle 3-2-1 pour organiser ses sauvegardes' },
    { id: 'o3', text: 'Utiliser ls -a, mv et cp -r pour ranger et copier des fichiers' },
  ],
  explanation: [
    { kind: 'heading', text: 'Pourquoi mettre à jour' },
    {
      kind: 'paragraph',
      text: 'Tout logiciel contient des erreurs. Certaines sont des failles de sécurité, que l’on appelle vulnérabilités : un attaquant peut s’en servir pour entrer dans l’appareil ou voler des données. Quand l’éditeur découvre une faille, il publie un correctif : c’est la mise à jour.',
    },
    {
      kind: 'paragraph',
      text: 'Dès sa publication, la faille n’est plus un secret. Les attaquants comparent l’ancienne et la nouvelle version, puis visent les appareils qui n’ont pas encore installé le correctif. Chaque jour d’attente augmente donc le risque.',
    },
    {
      kind: 'list',
      items: [
        'Activez les mises à jour automatiques du système, du navigateur et des applications.',
        'Redémarrez quand l’ordinateur le demande : beaucoup de correctifs ne s’appliquent qu’au redémarrage.',
        'Installez les mises à jour depuis le système ou l’application elle-même, jamais depuis une fenêtre publicitaire.',
        'Remplacez un logiciel ou un appareil en fin de support : il ne reçoit plus aucun correctif.',
      ],
    },
    {
      kind: 'callout',
      tone: 'warning',
      text: 'Une page web qui annonce « Votre lecteur vidéo doit être mis à jour, téléchargez-le ici » est un piège classique : elle fait installer un programme malveillant. Une vraie mise à jour ne passe pas par une publicité.',
    },
    { kind: 'heading', text: 'Sauvegarder : la règle 3-2-1' },
    {
      kind: 'paragraph',
      text: 'Une sauvegarde est une copie de vos données, qui permet de les retrouver après une panne, un vol, une fausse manipulation ou un rançongiciel. La règle 3-2-1 résume une bonne organisation :',
    },
    {
      kind: 'list',
      items: [
        '3 copies de vos données : l’original et deux sauvegardes.',
        '2 supports différents : par exemple le disque de l’ordinateur et un disque externe.',
        '1 copie hors de chez vous : un service de sauvegarde en ligne de confiance, ou un disque confié à un proche.',
      ],
    },
    {
      kind: 'callout',
      tone: 'info',
      text: 'Un disque qui reste branché en permanence peut être chiffré par un rançongiciel en même temps que l’ordinateur. Débranchez-le une fois la sauvegarde terminée.',
    },
    {
      kind: 'callout',
      tone: 'tip',
      text: 'Une sauvegarde ne vaut que si l’on sait la restaurer : de temps en temps, essayez de récupérer un fichier depuis la sauvegarde.',
    },
    {
      kind: 'callout',
      tone: 'warning',
      text: 'Synchroniser n’est pas sauvegarder. Un dossier synchronisé en ligne recopie aussi les suppressions et les fichiers chiffrés par un rançongiciel. Il ne protège que s’il garde l’historique des versions précédentes.',
    },
    { kind: 'heading', text: 'Ranger et copier dans le terminal' },
    {
      kind: 'code',
      text: 'ls -a\nmv Téléchargements/facture.pdf Documents/\ncp -r Documents /media/cle-usb/Sauvegarde/',
    },
    {
      kind: 'list',
      items: [
        'ls -a affiche aussi les fichiers cachés : sous Linux, leur nom commence par un point.',
        'mv déplace ou renomme : le fichier quitte son ancien emplacement.',
        'cp copie : l’original reste en place.',
        'cp -r copie un dossier avec tout son contenu (r comme récursif) ; sans -r, cp refuse les dossiers.',
      ],
    },
  ],
  glossary: [
    {
      term: 'Mise à jour',
      definition: 'Nouvelle version d’un logiciel, qui corrige souvent des failles de sécurité.',
      example: 'La mise à jour mensuelle du système corrige plusieurs failles du navigateur.',
    },
    {
      term: 'Vulnérabilité',
      definition: 'Faille d’un logiciel qu’un attaquant peut exploiter.',
      example:
        'Une erreur dans un lecteur de PDF permet d’exécuter un programme en ouvrant un fichier piégé.',
    },
    {
      term: 'Fin de support',
      definition: 'Date après laquelle l’éditeur ne publie plus de correctifs pour un logiciel.',
      example:
        'Un vieux système d’exploitation en fin de support reste vulnérable aux nouvelles failles.',
    },
    {
      term: 'Sauvegarde',
      definition: 'Copie de données gardée à part, pour les retrouver en cas de problème.',
      example: 'Le dossier Documents copié chaque semaine sur un disque externe.',
    },
    {
      term: 'Règle 3-2-1',
      definition:
        'Trois copies des données, sur deux supports différents, dont une hors du domicile ou du bureau.',
      example: 'L’ordinateur, un disque externe rangé à part et un service de sauvegarde en ligne.',
    },
    {
      term: 'Rançongiciel',
      definition: 'Programme malveillant qui chiffre les fichiers puis réclame une rançon.',
      example: 'Tous les documents deviennent illisibles et un message exige un paiement.',
    },
    {
      term: 'Fichier caché',
      definition:
        'Fichier que la liste ordinaire n’affiche pas ; sous Linux, son nom commence par un point.',
      example: '.consignes n’apparaît qu’avec ls -a.',
    },
  ],
  example: {
    title: 'Le disque de Léa lâche la veille de la remise',
    text: 'La veille de remettre son mémoire, Léa ne peut plus démarrer son ordinateur : le disque est en panne. Elle avait suivi la règle 3-2-1 : une copie sur un disque externe, débranché après chaque sauvegarde, et une sauvegarde en ligne qui garde les anciennes versions. Elle emprunte un ordinateur, récupère son mémoire depuis la sauvegarde en ligne et le remet à l’heure. Son ami Karim, lui, comptait sur un simple dossier synchronisé : quand un rançongiciel a chiffré ses fichiers, la synchronisation a recopié les fichiers chiffrés partout.',
  },
  animation: {
    id: 'sauvegarde-3-2-1',
    title: 'La règle 3-2-1 face aux incidents',
    textAlternative:
      'Étape 1 : le mémoire de Léa n’existe qu’en un exemplaire, sur son ordinateur. Étape 2 : Léa en copie une version sur un disque externe, qu’elle débranche ensuite. Étape 3 : une troisième copie part hors de chez elle, sur un service de sauvegarde en ligne. Étape 4 : le disque de l’ordinateur tombe en panne : l’original est perdu. Étape 5 : un dégât des eaux détruit aussi le disque externe, rangé dans le même bureau. Étape 6 : la copie hors site est intacte : Léa restaure son mémoire sur un nouvel ordinateur.',
  },
  demonstration: {
    id: 'rangement-sauvegarde',
    title: 'Avant et après le rangement',
    textAlternative:
      'Deux arborescences côte à côte. Avant : la facture traîne dans Téléchargements et la clé USB /media/cle-usb est vide. Après : la facture est dans Documents, et la clé contient le dossier Sauvegarde-2026 avec une copie complète de Documents et d’Images. Sur l’ordinateur, Documents et Images sont toujours là : cp copie sans rien enlever.',
  },
  guidedExercise: {
    intro:
      'Léa veut protéger son ordinateur et son mémoire de fin d’études. Aidez-la à choisir les bons réflexes.',
    steps: [
      {
        question: {
          id: 'g1',
          objectiveId: 'o1',
          type: 'single',
          difficulty: 1,
          prompt:
            'Sur un site de recettes, une fenêtre annonce : « Votre navigateur est obsolète, téléchargez la mise à jour ici ». Que doit faire Léa ?',
          explanation:
            'Une vraie mise à jour vient du navigateur ou du système lui-même. Une fenêtre sur un site web qui propose un téléchargement est un piège classique.',
          options: [
            {
              id: 'a',
              label: 'Fermer la page, puis lancer la mise à jour depuis les réglages du navigateur',
              correct: true,
              feedback: 'Exact : on passe toujours par le logiciel lui-même.',
            },
            {
              id: 'b',
              label: 'Cliquer pour télécharger, puisque les mises à jour sont importantes',
              correct: false,
              feedback: 'C’est précisément le piège : le fichier proposé serait malveillant.',
            },
            {
              id: 'c',
              label: 'Désactiver les mises à jour pour ne plus voir ces fenêtres',
              correct: false,
              feedback:
                'Les vraies mises à jour doivent rester actives : seule la fenêtre est fausse.',
            },
          ],
        },
        hints: [
          'D’où vient normalement une mise à jour : d’un site web, ou du logiciel lui-même ?',
          'Une publicité qui propose un téléchargement n’est jamais une mise à jour officielle.',
        ],
      },
      {
        question: {
          id: 'g2',
          objectiveId: 'o2',
          type: 'multiple',
          difficulty: 2,
          prompt: 'Lesquelles de ces organisations respectent la règle 3-2-1 ?',
          explanation:
            'Il faut trois copies, sur au moins deux supports, dont une hors du lieu de l’ordinateur. Deux dossiers sur le même disque ne font qu’un support ; un disque rangé dans le même bureau n’est pas hors site.',
          options: [
            {
              id: 'a',
              label: 'Ordinateur, disque externe débranché, sauvegarde en ligne',
              correct: true,
              feedback: 'Oui : trois copies, deux supports, une hors site.',
            },
            {
              id: 'b',
              label: 'Ordinateur, clé USB, disque confié à un proche',
              correct: true,
              feedback: 'Oui : le disque chez un proche joue le rôle de copie hors site.',
            },
            {
              id: 'c',
              label: 'Deux dossiers « Copie » sur le disque de l’ordinateur',
              correct: false,
              feedback: 'Un seul support : si le disque tombe en panne, tout disparaît.',
            },
            {
              id: 'd',
              label: 'Ordinateur et disque externe rangé dans le même bureau',
              correct: false,
              feedback:
                'Deux copies seulement, et aucune hors site : un incendie emporterait tout.',
            },
          ],
        },
        hints: [
          'Comptez les copies, les supports, puis cherchez la copie hors du bureau.',
          'Deux dossiers sur le même disque ne comptent que pour un support.',
        ],
      },
      {
        question: {
          id: 'g3',
          objectiveId: 'o3',
          type: 'single',
          difficulty: 2,
          prompt:
            'Quelle commande copie le dossier Documents, avec tout son contenu, sur la clé USB /media/cle-usb ?',
          explanation:
            'cp -r copie un dossier et tout ce qu’il contient. mv déplacerait le dossier : il n’y aurait plus d’original sur l’ordinateur. Sans -r, cp refuse de copier un dossier.',
          options: [
            {
              id: 'a',
              label: 'cp -r Documents /media/cle-usb/',
              correct: true,
              feedback: 'Exact : -r copie le dossier et son contenu.',
            },
            {
              id: 'b',
              label: 'mv Documents /media/cle-usb/',
              correct: false,
              feedback:
                'mv déplace : Documents quitterait l’ordinateur, ce n’est plus une sauvegarde.',
            },
            {
              id: 'c',
              label: 'cp Documents /media/cle-usb/',
              correct: false,
              feedback: 'Sans -r, cp refuse de copier un dossier.',
            },
          ],
        },
        hints: [
          'Une sauvegarde laisse l’original en place.',
          'Pour un dossier, la commande de copie demande une option.',
        ],
      },
    ],
  },
  quiz: {
    questionsPerAttempt: 5,
    questions: [
      {
        id: 'q1',
        objectiveId: 'o1',
        type: 'single',
        difficulty: 1,
        prompt: 'Pourquoi faut-il installer rapidement une mise à jour de sécurité ?',
        explanation:
          'Une fois le correctif publié, la faille est connue : les attaquants visent les appareils qui ne l’ont pas encore installé.',
        options: [
          {
            id: 'a',
            label:
              'Parce que la faille devient connue et que les attaquants visent les appareils non mis à jour',
            correct: true,
            feedback: 'Exact : le délai joue en faveur des attaquants.',
          },
          {
            id: 'b',
            label: 'Parce qu’une mise à jour rend toujours l’ordinateur plus rapide',
            correct: false,
            feedback: 'Ce n’est pas son but, et ce n’est pas toujours le cas.',
          },
          {
            id: 'c',
            label: 'Parce que sinon la garantie de l’ordinateur est annulée',
            correct: false,
            feedback: 'La garantie n’a rien à voir avec les mises à jour de sécurité.',
          },
        ],
      },
      {
        id: 'q2',
        objectiveId: 'o1',
        type: 'true-false',
        difficulty: 1,
        prompt: 'Un logiciel en fin de support continue de recevoir des correctifs de sécurité.',
        answer: false,
        explanation:
          'En fin de support, l’éditeur ne publie plus aucun correctif : les nouvelles failles restent ouvertes. Il faut le remplacer.',
      },
      {
        id: 'q3',
        objectiveId: 'o1',
        type: 'single',
        difficulty: 2,
        prompt: 'Que faites-vous ?',
        context: {
          kind: 'scenario',
          text: 'Sur un site de vidéos, une fenêtre annonce : « Votre lecteur vidéo doit être mis à jour. Téléchargez lecteur-video.exe pour continuer. »',
        },
        explanation:
          'Les vraies mises à jour viennent du système ou de l’application. Un fichier proposé par une fenêtre de site web est très probablement malveillant.',
        options: [
          {
            id: 'a',
            label: 'Je ferme la page sans rien télécharger',
            correct: true,
            feedback: 'Exact : c’est une fausse mise à jour.',
          },
          {
            id: 'b',
            label: 'Je télécharge le fichier, puis je l’analyse plus tard',
            correct: false,
            feedback: 'Télécharger un programme piégé, c’est déjà prendre le risque de l’ouvrir.',
          },
          {
            id: 'c',
            label: 'Je l’installe : un lecteur à jour est plus sûr',
            correct: false,
            feedback: 'Ce fichier ne vient pas d’une source officielle : c’est le piège.',
          },
        ],
      },
      {
        id: 'q4',
        objectiveId: 'o2',
        type: 'single',
        difficulty: 1,
        prompt: 'Dans la règle 3-2-1, que signifie le « 1 » ?',
        explanation:
          'Une copie est gardée hors du domicile ou du bureau, pour survivre à un incendie, un vol ou un dégât des eaux.',
        options: [
          {
            id: 'a',
            label: 'Une copie conservée hors du domicile ou du bureau',
            correct: true,
            feedback: 'Exact.',
          },
          {
            id: 'b',
            label: 'Une seule sauvegarde suffit',
            correct: false,
            feedback: 'La règle en demande deux, en plus de l’original.',
          },
          {
            id: 'c',
            label: 'Une sauvegarde par jour',
            correct: false,
            feedback: 'La fréquence dépend de vos besoins ; ce n’est pas le sens du « 1 ».',
          },
        ],
      },
      {
        id: 'q5',
        objectiveId: 'o2',
        type: 'multiple',
        difficulty: 2,
        prompt: 'Face à quels incidents une copie hors site permet-elle de retrouver ses données ?',
        explanation:
          'La copie hors site protège de ce qui détruit tout un lieu. Elle ne peut pas rendre un fichier qui n’a jamais été sauvegardé.',
        options: [
          {
            id: 'a',
            label: 'Un incendie du logement',
            correct: true,
            feedback: 'Oui : la copie est ailleurs.',
          },
          {
            id: 'b',
            label: 'Le vol de l’ordinateur et du disque externe',
            correct: true,
            feedback: 'Oui : le voleur n’emporte pas la copie hors site.',
          },
          {
            id: 'c',
            label: 'Un fichier créé puis supprimé avant la première sauvegarde',
            correct: false,
            feedback: 'Aucune sauvegarde ne contient un fichier qui n’y a jamais été copié.',
          },
        ],
      },
      {
        id: 'q6',
        objectiveId: 'o2',
        type: 'true-false',
        difficulty: 2,
        prompt:
          'Un dossier synchronisé en ligne, sans historique des versions, suffit à se protéger d’un rançongiciel.',
        answer: false,
        explanation:
          'La synchronisation recopie aussi les fichiers chiffrés. Sans versions précédentes à restaurer, la copie en ligne est perdue avec l’original.',
      },
      {
        id: 'q7',
        objectiveId: 'o2',
        type: 'ordering',
        difficulty: 2,
        prompt: 'Classez les étapes d’une sauvegarde sur disque externe.',
        explanation:
          'On branche, on copie, on vérifie que la copie s’ouvre, puis on débranche pour la mettre à l’abri d’un rançongiciel.',
        items: [
          { id: 'a', label: 'Brancher le disque externe' },
          { id: 'b', label: 'Copier les dossiers importants' },
          { id: 'c', label: 'Vérifier qu’un fichier s’ouvre depuis la sauvegarde' },
          { id: 'd', label: 'Débrancher le disque et le ranger à part' },
        ],
      },
      {
        id: 'q8',
        objectiveId: 'o3',
        type: 'matching',
        difficulty: 1,
        prompt: 'Associez chaque commande à son effet.',
        explanation:
          'ls -a montre aussi les fichiers cachés, mv déplace, cp copie un fichier, cp -r copie un dossier entier.',
        pairs: [
          { id: 'a', left: 'ls -a', right: 'Liste aussi les fichiers cachés' },
          { id: 'b', left: 'mv', right: 'Déplace ou renomme : l’original disparaît' },
          { id: 'c', left: 'cp', right: 'Copie un fichier : l’original reste' },
          { id: 'd', left: 'cp -r', right: 'Copie un dossier et tout son contenu' },
        ],
      },
      {
        id: 'q9',
        objectiveId: 'o3',
        type: 'single',
        difficulty: 2,
        prompt: 'Pourquoi la copie n’a-t-elle pas eu lieu ?',
        context: {
          kind: 'scenario',
          text: 'Léa tape cp Documents /media/cle-usb/ et le terminal répond : cp: -r non spécifié ; omission du répertoire « Documents »',
        },
        explanation: 'Documents est un dossier : pour le copier avec son contenu, il faut cp -r.',
        options: [
          {
            id: 'a',
            label: 'Il faut l’option -r pour copier un dossier',
            correct: true,
            feedback: 'Exact : cp -r Documents /media/cle-usb/',
          },
          {
            id: 'b',
            label: 'La clé USB est pleine',
            correct: false,
            feedback: 'Le message parle de l’option -r, pas de place disponible.',
          },
          {
            id: 'c',
            label: 'Il faut utiliser mv à la place',
            correct: false,
            feedback: 'mv déplacerait le dossier : il n’y aurait plus d’original.',
          },
        ],
      },
      {
        id: 'q10',
        objectiveId: 'o3',
        type: 'single',
        difficulty: 1,
        prompt: 'Après mv Téléchargements/facture.pdf Documents/, où se trouve la facture ?',
        explanation: 'mv déplace : le fichier quitte Téléchargements pour Documents.',
        options: [
          {
            id: 'a',
            label: 'Seulement dans Documents',
            correct: true,
            feedback: 'Exact : elle a été déplacée.',
          },
          {
            id: 'b',
            label: 'Dans Téléchargements et dans Documents',
            correct: false,
            feedback: 'C’est ce que ferait cp, pas mv.',
          },
          {
            id: 'c',
            label: 'Seulement dans Téléchargements',
            correct: false,
            feedback: 'mv a bien déplacé le fichier.',
          },
        ],
      },
    ],
  },
  summary: [
    'Une mise à jour corrige des failles : installez-la sans tarder, depuis le système ou l’application, jamais depuis une publicité.',
    'Un logiciel en fin de support ne reçoit plus de correctifs : remplacez-le.',
    'Règle 3-2-1 : 3 copies, sur 2 supports, dont 1 hors site ; débranchez le disque après la sauvegarde.',
    'Synchroniser n’est pas sauvegarder, sauf si l’historique des versions est conservé.',
    'ls -a montre les fichiers cachés, mv déplace, cp copie et cp -r copie un dossier entier.',
  ],
};
