import { Lesson } from '../../core/models/content.model';

export const DECOUVRIR_LE_TERMINAL: Lesson = {
  id: 'decouvrir-le-terminal',
  title: 'Découvrir le terminal',
  level: 'debutant',
  durationMinutes: 25,
  prerequisiteIds: ['ordinateur-et-fichiers'],
  labId: 'lab-terminal',
  skillIds: ['utiliser-un-terminal'],
  objectives: [
    { id: 'o1', text: 'Expliquer ce qu’est un terminal et lire son invite de commande' },
    { id: 'o2', text: 'Utiliser pwd, ls et cd pour se repérer et se déplacer dans les dossiers' },
    { id: 'o3', text: 'Lire et créer des fichiers avec cat, mkdir et touch' },
  ],
  explanation: [
    { kind: 'heading', text: 'Parler à l’ordinateur par écrit' },
    {
      kind: 'paragraph',
      text: 'Un terminal est une fenêtre où l’on dirige l’ordinateur en tapant du texte, au lieu de cliquer. Chaque ordre s’appelle une commande ; on la valide avec la touche Entrée. Les professionnels de la cybersécurité l’utilisent tous les jours : sur les serveurs, il n’y a souvent aucune interface graphique.',
    },
    {
      kind: 'paragraph',
      text: 'Le terminal affiche une invite de commande, qui signale qu’il attend vos instructions. Par exemple :',
    },
    { kind: 'code', text: 'eleve@cyberlab:~$' },
    {
      kind: 'list',
      items: [
        'eleve est le nom de l’utilisateur connecté.',
        'cyberlab est le nom de la machine.',
        '~ indique le dossier où vous êtes : c’est un raccourci pour votre dossier personnel.',
        '$ signale un utilisateur ordinaire ; un # signalerait l’administrateur, qui a tous les droits.',
      ],
    },
    { kind: 'heading', text: 'Se repérer et se déplacer' },
    { kind: 'code', text: 'pwd\nls\ncd Documents\ncd ..\ncd ~' },
    {
      kind: 'list',
      items: [
        'pwd (print working directory) affiche le chemin du dossier où vous êtes.',
        'ls (list) liste le contenu de ce dossier.',
        'cd (change directory) change de dossier : cd Documents entre dans Documents, cd .. remonte d’un niveau, cd ~ revient au dossier personnel.',
      ],
    },
    { kind: 'heading', text: 'Lire et créer' },
    { kind: 'code', text: 'cat notes.txt\nmkdir projets\ntouch projets/idees.txt' },
    {
      kind: 'list',
      items: [
        'cat affiche le contenu d’un fichier texte.',
        'mkdir (make directory) crée un dossier.',
        'touch crée un fichier vide (ou met à jour sa date s’il existe déjà).',
      ],
    },
    {
      kind: 'callout',
      tone: 'info',
      text: 'Une commande, c’est un nom, parfois suivi d’options et d’arguments. Dans ls -l Documents, ls est la commande, -l une option (affichage détaillé) et Documents l’argument (le dossier à lister).',
    },
    {
      kind: 'callout',
      tone: 'warning',
      text: 'Le terminal n’a pas de corbeille : une commande comme rm supprime un fichier définitivement. Lisez toujours une commande avant de l’exécuter, surtout si elle vient d’Internet. Dans le laboratoire de cette leçon, tout est simulé : vous ne pouvez rien abîmer.',
    },
  ],
  glossary: [
    {
      term: 'Terminal',
      definition: 'Fenêtre où l’on dirige l’ordinateur en tapant des commandes.',
      example:
        'Sous Linux, l’application « Terminal » ; sous Windows, « Terminal Windows » ou PowerShell.',
    },
    {
      term: 'Commande',
      definition: 'Ordre écrit donné à l’ordinateur, validé avec la touche Entrée.',
      example: 'pwd est une commande qui affiche le dossier où l’on se trouve.',
    },
    {
      term: 'Invite de commande',
      definition: 'Texte affiché par le terminal pour indiquer qu’il attend une commande.',
      example:
        'eleve@cyberlab:~$ : l’utilisateur eleve, sur la machine cyberlab, dans son dossier personnel.',
    },
    {
      term: 'Dossier courant',
      definition: 'Dossier dans lequel on se trouve ; les commandes s’y appliquent par défaut.',
      example: 'Après cd Documents, le dossier courant est Documents : ls en liste le contenu.',
    },
    {
      term: 'Dossier personnel',
      definition: 'Dossier propre à chaque utilisateur, noté ~ dans le terminal.',
      example: 'Pour l’utilisatrice lea sous Linux, c’est /home/lea.',
    },
    {
      term: 'Option',
      definition:
        'Précision ajoutée à une commande pour modifier son comportement ; elle commence souvent par un tiret.',
      example: 'Dans ls -l, l’option -l demande un affichage détaillé.',
    },
  ],
  example: {
    title: 'Retrouver un rapport sur un serveur',
    text: 'Léa doit relire un rapport sur un serveur sans interface graphique. Elle tape pwd : le terminal répond /home/lea. Elle tape ls et voit Documents et Images. Elle entre dans Documents avec cd Documents, liste son contenu avec ls, puis affiche le rapport avec cat rapport.txt. Quatre commandes, et pas besoin de souris.',
  },
  animation: {
    id: 'commande-terminal',
    title: 'Ce qui se passe quand on tape une commande',
    textAlternative:
      'Étape 1 : l’utilisateur tape cd Documents puis Entrée. Étape 2 : le terminal découpe la ligne en commande (cd) et en argument (Documents). Étape 3 : le système vérifie que le dossier Documents existe dans le dossier courant. Étape 4 : le dossier courant devient /home/lea/Documents. Étape 5 : l’invite affiche maintenant ~/Documents.',
  },
  demonstration: {
    id: 'anatomie-commande',
    title: 'Anatomie d’une ligne de commande',
    textAlternative:
      'Ligne annotée : eleve@cyberlab:~$ ls -l Documents. eleve : l’utilisateur. cyberlab : la machine. ~ : le dossier courant. $ : un utilisateur ordinaire. ls : la commande. -l : l’option d’affichage détaillé. Documents : l’argument, le dossier à lister.',
  },
  guidedExercise: {
    intro:
      'Imaginez ce terminal : vous êtes dans /home/eleve, qui contient les dossiers Documents et Images.',
    steps: [
      {
        question: {
          id: 'g1',
          objectiveId: 'o2',
          type: 'single',
          difficulty: 1,
          prompt: 'Quelle commande affiche le chemin du dossier où vous êtes ?',
          explanation: 'pwd affiche le chemin du dossier courant, ici /home/eleve.',
          options: [
            { id: 'a', label: 'pwd', correct: true, feedback: 'Exact : print working directory.' },
            {
              id: 'b',
              label: 'ls',
              correct: false,
              feedback: 'ls liste le contenu du dossier, il n’affiche pas son chemin.',
            },
            { id: 'c', label: 'cd', correct: false, feedback: 'cd change de dossier.' },
          ],
        },
        hints: [
          'Cette commande « imprime » le dossier de travail.',
          'Ses lettres viennent de print working directory.',
        ],
      },
      {
        question: {
          id: 'g2',
          objectiveId: 'o2',
          type: 'single',
          difficulty: 1,
          prompt:
            'Vous êtes maintenant dans /home/eleve/Documents. Quelle commande vous ramène dans /home/eleve ?',
          explanation: '« .. » désigne le dossier parent : cd .. remonte d’un niveau.',
          options: [
            {
              id: 'a',
              label: 'cd ..',
              correct: true,
              feedback: 'Exact : vous remontez dans /home/eleve.',
            },
            {
              id: 'b',
              label: 'cd Documents',
              correct: false,
              feedback: 'Vous y êtes déjà, et il n’y a pas de dossier Documents dans Documents.',
            },
            {
              id: 'c',
              label: 'ls ..',
              correct: false,
              feedback: 'ls .. liste le dossier parent sans vous y déplacer.',
            },
          ],
        },
        hints: [
          '« .. » désigne le dossier parent.',
          'Pour se déplacer, la commande commence par cd.',
        ],
      },
      {
        question: {
          id: 'g3',
          objectiveId: 'o3',
          type: 'multiple',
          difficulty: 2,
          prompt: 'Quelles commandes créent quelque chose ?',
          explanation:
            'mkdir crée un dossier et touch un fichier vide ; cat et pwd ne font qu’afficher.',
          options: [
            { id: 'a', label: 'mkdir', correct: true, feedback: 'Oui : elle crée un dossier.' },
            {
              id: 'b',
              label: 'touch',
              correct: true,
              feedback: 'Oui : elle crée un fichier vide.',
            },
            {
              id: 'c',
              label: 'cat',
              correct: false,
              feedback: 'cat lit un fichier sans rien créer.',
            },
            {
              id: 'd',
              label: 'pwd',
              correct: false,
              feedback: 'pwd affiche seulement le dossier courant.',
            },
          ],
        },
        hints: ['Une de ces commandes crée un dossier, une autre un fichier vide.'],
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
        prompt: 'Dans l’invite eleve@cyberlab:~$, que désigne « cyberlab » ?',
        explanation: 'L’invite se lit : utilisateur@machine:dossier, puis $ ou #.',
        options: [
          {
            id: 'a',
            label: 'Le nom de la machine',
            correct: true,
            feedback: 'Exact : il suit le @.',
          },
          {
            id: 'b',
            label: 'Le nom de l’utilisateur',
            correct: false,
            feedback: 'L’utilisateur est eleve, avant le @.',
          },
          {
            id: 'c',
            label: 'Le dossier courant',
            correct: false,
            feedback: 'Le dossier courant est ~, après les deux-points.',
          },
        ],
      },
      {
        id: 'q2',
        objectiveId: 'o1',
        type: 'true-false',
        difficulty: 1,
        prompt: 'Dans le terminal, le symbole ~ désigne le dossier personnel de l’utilisateur.',
        explanation: 'Vrai : ~ est un raccourci, par exemple pour /home/eleve.',
        answer: true,
      },
      {
        id: 'q3',
        objectiveId: 'o1',
        type: 'single',
        difficulty: 2,
        prompt: 'Que lui indique le # à la fin de l’invite ?',
        context: {
          kind: 'scenario',
          text: 'Sur le serveur d’une entreprise, Samir voit l’invite root@srv-web:/var/www#',
        },
        explanation:
          'Par convention, # signale le compte administrateur (root) et $ un utilisateur ordinaire. Une erreur en administrateur peut avoir de lourdes conséquences : prudence.',
        options: [
          {
            id: 'a',
            label: 'Il est connecté en administrateur, avec tous les droits',
            correct: true,
            feedback: 'Exact : root est le compte administrateur.',
          },
          {
            id: 'b',
            label: 'La commande précédente a échoué',
            correct: false,
            feedback: 'Le # n’indique rien sur la commande précédente.',
          },
          {
            id: 'c',
            label: 'Il est dans son dossier personnel',
            correct: false,
            feedback: 'Le dossier courant est /var/www, affiché juste avant le #.',
          },
        ],
      },
      {
        id: 'q4',
        objectiveId: 'o1',
        type: 'true-false',
        difficulty: 3,
        prompt:
          'Une commande trouvée sur un forum peut être exécutée sans risque, puisque le terminal ne fait qu’afficher du texte.',
        explanation:
          'Faux : une commande peut supprimer des fichiers ou installer un logiciel malveillant. Il faut comprendre une commande avant de l’exécuter, surtout si elle vient d’une source inconnue.',
        answer: false,
      },
      {
        id: 'q5',
        objectiveId: 'o2',
        type: 'single',
        difficulty: 1,
        prompt: 'Quelle commande liste le contenu du dossier courant ?',
        explanation: 'ls (list) affiche les fichiers et dossiers du dossier courant.',
        options: [
          { id: 'a', label: 'ls', correct: true, feedback: 'Exact.' },
          {
            id: 'b',
            label: 'cat',
            correct: false,
            feedback: 'cat affiche le contenu d’un fichier, pas d’un dossier.',
          },
          { id: 'c', label: 'mkdir', correct: false, feedback: 'mkdir crée un dossier.' },
        ],
      },
      {
        id: 'q6',
        objectiveId: 'o2',
        type: 'ordering',
        difficulty: 2,
        prompt:
          'Vous êtes dans /home/eleve. Classez ces commandes pour vous rendre dans /home/eleve/Documents/projets, puis vérifier où vous êtes.',
        explanation:
          'On entre d’abord dans Documents, puis dans projets, et pwd confirme le chemin.',
        items: [
          { id: 'a', label: 'cd Documents' },
          { id: 'b', label: 'cd projets' },
          { id: 'c', label: 'pwd' },
        ],
      },
      {
        id: 'q7',
        objectiveId: 'o2',
        type: 'single',
        difficulty: 2,
        prompt: 'Vous êtes dans /home/eleve/Documents/projets. Où vous mène la commande cd .. ?',
        explanation: 'cd .. remonte d’un seul niveau, vers le dossier parent.',
        options: [
          {
            id: 'a',
            label: '/home/eleve/Documents',
            correct: true,
            feedback: 'Exact : le dossier parent de projets.',
          },
          {
            id: 'b',
            label: '/home/eleve',
            correct: false,
            feedback: 'Il faudrait remonter deux fois, par exemple avec cd ../..',
          },
          {
            id: 'c',
            label: '/ (la racine)',
            correct: false,
            feedback: 'cd .. ne remonte que d’un niveau.',
          },
        ],
      },
      {
        id: 'q8',
        objectiveId: 'o2',
        type: 'matching',
        difficulty: 2,
        prompt: 'Associez chaque commande à son effet.',
        explanation:
          'pwd situe, ls liste, cd déplace : les trois commandes de base pour s’orienter.',
        pairs: [
          { id: 'a', left: 'pwd', right: 'Afficher le dossier courant' },
          { id: 'b', left: 'ls', right: 'Lister le contenu d’un dossier' },
          { id: 'c', left: 'cd', right: 'Changer de dossier' },
        ],
      },
      {
        id: 'q9',
        objectiveId: 'o3',
        type: 'single',
        difficulty: 1,
        prompt: 'Quelle commande affiche le contenu du fichier notes.txt ?',
        explanation: 'cat affiche le contenu d’un fichier texte dans le terminal.',
        options: [
          { id: 'a', label: 'cat notes.txt', correct: true, feedback: 'Exact.' },
          {
            id: 'b',
            label: 'ls notes.txt',
            correct: false,
            feedback: 'ls notes.txt affiche seulement le nom du fichier, s’il existe.',
          },
          {
            id: 'c',
            label: 'cd notes.txt',
            correct: false,
            feedback: 'cd ne s’applique qu’aux dossiers.',
          },
        ],
      },
      {
        id: 'q10',
        objectiveId: 'o3',
        type: 'multiple',
        difficulty: 2,
        prompt:
          'Vous voulez créer un dossier rapports puis, dedans, un fichier vide mars.txt. Quelles commandes conviennent ?',
        explanation: 'mkdir crée le dossier, puis touch crée le fichier vide à l’intérieur.',
        options: [
          {
            id: 'a',
            label: 'mkdir rapports',
            correct: true,
            feedback: 'Oui : elle crée le dossier.',
          },
          {
            id: 'b',
            label: 'touch rapports/mars.txt',
            correct: true,
            feedback: 'Oui : elle crée le fichier vide dans rapports.',
          },
          {
            id: 'c',
            label: 'cat rapports/mars.txt',
            correct: false,
            feedback: 'cat lit un fichier, il ne le crée pas.',
          },
          {
            id: 'd',
            label: 'cd mars.txt',
            correct: false,
            feedback: 'cd ne crée rien et ne s’applique qu’aux dossiers.',
          },
        ],
      },
    ],
  },
  summary: [
    'Le terminal permet de diriger l’ordinateur par des commandes écrites.',
    'L’invite indique l’utilisateur, la machine et le dossier courant ; # signale l’administrateur.',
    'pwd affiche où l’on est, ls liste, cd déplace ; .. désigne le dossier parent et ~ le dossier personnel.',
    'cat lit un fichier, mkdir crée un dossier, touch crée un fichier vide.',
    'On n’exécute jamais une commande que l’on ne comprend pas.',
  ],
};
