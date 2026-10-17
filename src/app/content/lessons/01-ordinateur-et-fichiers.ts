import { Lesson } from '../../core/models/content.model';

export const ORDINATEUR_ET_FICHIERS: Lesson = {
  id: 'ordinateur-et-fichiers',
  title: 'Comprendre un ordinateur, ses fichiers et ses dossiers',
  level: 'debutant',
  durationMinutes: 20,
  prerequisiteIds: [],
  skillIds: ['decrire-un-ordinateur'],
  objectives: [
    { id: 'o1', text: 'Associer chaque pièce principale d’un ordinateur à son rôle' },
    { id: 'o2', text: 'Distinguer la mémoire vive du stockage' },
    {
      id: 'o3',
      text: 'Lire le chemin et l’extension d’un fichier pour savoir où il est et ce qu’il contient',
    },
  ],
  explanation: [
    { kind: 'heading', text: 'Un ordinateur, quatre grandes fonctions' },
    {
      kind: 'paragraph',
      text: 'Un ordinateur est une machine qui reçoit des informations, les traite, les garde et les restitue. Ordinateur portable, téléphone ou serveur d’entreprise : tous fonctionnent sur ce même principe.',
    },
    {
      kind: 'list',
      items: [
        'Le processeur calcule : il exécute les instructions des programmes, des milliards de fois par seconde.',
        'La mémoire vive garde les informations en cours d’utilisation. Elle est très rapide, mais elle se vide quand on éteint l’appareil.',
        'Le stockage (disque dur ou SSD) conserve les fichiers durablement, même sans électricité.',
        'Les périphériques permettent d’échanger avec l’ordinateur : clavier, souris, écran, haut-parleurs, carte réseau…',
      ],
    },
    {
      kind: 'callout',
      tone: 'tip',
      text: 'Une image pour retenir : la mémoire vive est le plan de travail d’un atelier, le stockage est l’armoire. On sort les outils de l’armoire pour travailler, puis on les range avant de fermer.',
    },
    { kind: 'heading', text: 'Les fichiers et les dossiers' },
    {
      kind: 'paragraph',
      text: 'Tout ce que vous enregistrez — une photo, un document, un programme — est un fichier. Les fichiers sont rangés dans des dossiers, qui peuvent eux-mêmes contenir d’autres dossiers. Cette organisation en arbre s’appelle une arborescence.',
    },
    {
      kind: 'paragraph',
      text: 'Le nom d’un fichier se termine souvent par une extension, après le dernier point : rapport.pdf, photo.jpg, budget.xlsx. L’extension indique le type de contenu et le programme qui saura l’ouvrir.',
    },
    {
      kind: 'paragraph',
      text: 'Le chemin d’un fichier décrit le trajet pour l’atteindre, dossier après dossier, du plus général au plus précis. Chaque séparateur marque l’entrée dans un dossier : la barre oblique inversée « \\ » sous Windows, la barre oblique « / » sous Linux et macOS.',
    },
    {
      kind: 'code',
      text: 'Windows :        C:\\Users\\Lea\\Documents\\rapport.pdf\nLinux et macOS : /home/lea/Documents/rapport.pdf',
    },
    {
      kind: 'callout',
      tone: 'warning',
      text: 'Pourquoi c’est important en cybersécurité ? Un fichier nommé facture.pdf.exe n’est pas un document : seule la dernière extension compte, et .exe désigne un programme. Comme Windows masque souvent les extensions connues, ce fichier peut s’afficher « facture.pdf ». Savoir lire un nom de fichier complet aide à déjouer ce piège.',
    },
  ],
  glossary: [
    {
      term: 'Processeur',
      definition: 'La pièce qui exécute les instructions des programmes : c’est elle qui calcule.',
      example:
        'Quand vous appliquez un filtre à une photo, le processeur fait les calculs pour chaque point de l’image.',
    },
    {
      term: 'Mémoire vive',
      definition:
        'Mémoire rapide et temporaire qui garde ce que l’ordinateur utilise en ce moment ; elle se vide à l’extinction. On l’appelle aussi RAM.',
      example:
        'Un document ouvert mais pas enregistré n’existe qu’en mémoire vive : une coupure de courant le fait disparaître.',
    },
    {
      term: 'Stockage',
      definition:
        'Support qui conserve les fichiers durablement, même éteint : disque dur, SSD, clé USB.',
      example: 'Vos photos enregistrées sont toujours là quand vous rallumez l’ordinateur.',
    },
    {
      term: 'Périphérique',
      definition:
        'Appareil qui permet d’échanger des informations avec l’ordinateur, pour y entrer des données ou en recevoir.',
      example: 'Le clavier sert à saisir du texte ; l’écran affiche le résultat.',
    },
    {
      term: 'Extension',
      definition: 'Fin du nom d’un fichier, après le dernier point, qui indique son type.',
      example: 'Dans « contrat.pdf », l’extension est « pdf » : c’est un document PDF.',
    },
    {
      term: 'Chemin',
      definition: 'Adresse d’un fichier : la liste des dossiers à traverser pour l’atteindre.',
      example:
        '/home/lea/Documents/contrat.pdf : contrat.pdf est dans Documents, lui-même dans lea, lui-même dans home.',
    },
  ],
  example: {
    title: 'Ouvrir une photo de vacances',
    text: 'Vous double-cliquez sur /home/lea/Images/plage.jpg. Le système lit le chemin pour trouver le fichier sur le stockage (le SSD). Il copie la photo dans la mémoire vive, car c’est là que le processeur travaille vite. Le processeur décode l’image, puis l’écran — un périphérique — l’affiche. Si vous éteignez sans enregistrer vos retouches, elles disparaissent avec la mémoire vive ; la photo d’origine, elle, reste sur le SSD.',
  },
  animation: {
    id: 'ouverture-fichier',
    title: 'Le trajet d’un fichier, du stockage à l’écran',
    textAlternative:
      'Étape 1 : le fichier plage.jpg est rangé sur le SSD. Étape 2 : il est copié dans la mémoire vive. Étape 3 : le processeur décode l’image. Étape 4 : l’image est envoyée à l’écran. Étape 5 : à l’extinction, la mémoire vive se vide, mais le fichier reste sur le SSD.',
  },
  demonstration: {
    id: 'arborescence',
    title: 'Une arborescence annotée',
    textAlternative:
      'Schéma d’un dossier racine « / » qui contient « home », qui contient « lea », qui contient « Documents » (avec rapport.pdf) et « Images » (avec plage.jpg). Chaque flèche correspond à un « / » du chemin /home/lea/Images/plage.jpg.',
  },
  guidedExercise: {
    intro:
      'Trois questions pour vérifier les bases. Les indices sont là pour vous aider : ils ne retirent aucun point.',
    steps: [
      {
        question: {
          id: 'g1',
          objectiveId: 'o2',
          type: 'true-false',
          difficulty: 1,
          prompt:
            'Un document ouvert mais pas encore enregistré est conservé si le courant est coupé.',
          explanation:
            'Faux : tant qu’il n’est pas enregistré, le document n’existe qu’en mémoire vive, qui se vide quand l’ordinateur s’éteint.',
          answer: false,
        },
        hints: [
          'Où se trouve un document que l’on n’a pas encore enregistré ?',
          'La mémoire vive a besoin d’électricité pour garder les informations.',
        ],
      },
      {
        question: {
          id: 'g2',
          objectiveId: 'o3',
          type: 'single',
          difficulty: 1,
          prompt:
            'Dans le chemin /home/lea/Documents/rapport.pdf, quel dossier contient directement le fichier rapport.pdf ?',
          explanation:
            'Le dossier qui contient directement un fichier est le dernier écrit avant son nom.',
          options: [
            {
              id: 'a',
              label: 'home',
              correct: false,
              feedback:
                'home est le premier dossier traversé, pas celui qui contient directement le fichier.',
            },
            {
              id: 'b',
              label: 'lea',
              correct: false,
              feedback: 'lea contient le dossier Documents, pas directement le fichier.',
            },
            {
              id: 'c',
              label: 'Documents',
              correct: true,
              feedback: 'Oui : c’est le dernier dossier avant le nom du fichier.',
            },
          ],
        },
        hints: [
          'Lisez le chemin de gauche à droite : chaque « / » fait entrer dans un dossier.',
          'Regardez ce qui est écrit juste avant « rapport.pdf ».',
        ],
      },
      {
        question: {
          id: 'g3',
          objectiveId: 'o1',
          type: 'single',
          difficulty: 1,
          prompt: 'Quelle pièce exécute les instructions des programmes ?',
          explanation:
            'Le processeur exécute les instructions ; les autres pièces conservent ou affichent les informations.',
          options: [
            {
              id: 'a',
              label: 'Le processeur',
              correct: true,
              feedback: 'Exact : c’est lui qui fait les calculs.',
            },
            {
              id: 'b',
              label: 'Le SSD',
              correct: false,
              feedback: 'Le SSD conserve les fichiers, il ne calcule pas.',
            },
            {
              id: 'c',
              label: 'L’écran',
              correct: false,
              feedback: 'L’écran est un périphérique : il affiche le résultat des calculs.',
            },
          ],
        },
        hints: ['On le compare souvent au cerveau de l’ordinateur.'],
      },
    ],
  },
  quiz: {
    questionsPerAttempt: 5,
    questions: [
      {
        id: 'q1',
        objectiveId: 'o1',
        type: 'matching',
        difficulty: 1,
        prompt: 'Associez chaque pièce à son rôle.',
        explanation:
          'Chaque pièce a un rôle : calculer, travailler vite, conserver, ou échanger avec l’utilisateur.',
        pairs: [
          { id: 'a', left: 'Processeur', right: 'Exécute les instructions des programmes' },
          { id: 'b', left: 'Mémoire vive', right: 'Garde les informations en cours d’utilisation' },
          { id: 'c', left: 'SSD', right: 'Conserve les fichiers même éteint' },
          { id: 'd', left: 'Clavier', right: 'Permet de saisir des informations' },
        ],
      },
      {
        id: 'q2',
        objectiveId: 'o1',
        type: 'single',
        difficulty: 1,
        prompt: 'Lequel de ces éléments est un périphérique ?',
        explanation:
          'Un périphérique sert à échanger avec l’ordinateur : l’écran affiche des informations.',
        options: [
          {
            id: 'a',
            label: 'L’écran',
            correct: true,
            feedback: 'Oui : il montre les informations à l’utilisateur.',
          },
          {
            id: 'b',
            label: 'Le processeur',
            correct: false,
            feedback: 'Le processeur calcule, il n’échange pas directement avec l’utilisateur.',
          },
          {
            id: 'c',
            label: 'La mémoire vive',
            correct: false,
            feedback:
              'La mémoire vive garde les informations en cours, à l’intérieur de l’ordinateur.',
          },
        ],
      },
      {
        id: 'q3',
        objectiveId: 'o1',
        type: 'multiple',
        difficulty: 2,
        prompt:
          'Lesquels de ces éléments servent à traiter ou à garder des informations, plutôt qu’à échanger avec l’utilisateur ?',
        explanation:
          'Le processeur et la mémoire vive travaillent à l’intérieur de l’ordinateur ; la souris et les haut-parleurs sont des périphériques.',
        options: [
          {
            id: 'a',
            label: 'Le processeur',
            correct: true,
            feedback: 'Il traite les informations.',
          },
          {
            id: 'b',
            label: 'La mémoire vive',
            correct: true,
            feedback: 'Elle garde les informations en cours d’utilisation.',
          },
          {
            id: 'c',
            label: 'La souris',
            correct: false,
            feedback: 'C’est un périphérique : elle sert à donner des ordres.',
          },
          {
            id: 'd',
            label: 'Les haut-parleurs',
            correct: false,
            feedback: 'C’est un périphérique : ils restituent le son.',
          },
        ],
      },
      {
        id: 'q4',
        objectiveId: 'o2',
        type: 'true-false',
        difficulty: 1,
        prompt: 'Les fichiers enregistrés sur un SSD disparaissent quand on éteint l’ordinateur.',
        explanation:
          'Faux : le stockage conserve les fichiers sans électricité. C’est la mémoire vive qui se vide.',
        answer: false,
      },
      {
        id: 'q5',
        objectiveId: 'o2',
        type: 'single',
        difficulty: 2,
        prompt: 'Que devient le travail de Karim ?',
        context: {
          kind: 'scenario',
          text: 'Karim travaille sur un tableau depuis une heure sans l’enregistrer. Son ordinateur portable s’éteint d’un coup : la batterie est vide.',
        },
        explanation:
          'Sans enregistrement, le travail n’existe qu’en mémoire vive, qui se vide quand l’alimentation s’arrête. Certains logiciels enregistrent automatiquement, justement pour éviter cette perte.',
        options: [
          {
            id: 'a',
            label: 'Il est perdu, car il n’était qu’en mémoire vive',
            correct: true,
            feedback: 'Exact, sauf si le logiciel avait fait un enregistrement automatique.',
          },
          {
            id: 'b',
            label: 'Il est sur le SSD, car tout y est copié en direct',
            correct: false,
            feedback:
              'Non : un fichier n’est écrit sur le stockage qu’au moment de l’enregistrement.',
          },
          {
            id: 'c',
            label: 'Il est gardé dans le processeur',
            correct: false,
            feedback: 'Le processeur calcule mais ne conserve rien durablement.',
          },
        ],
      },
      {
        id: 'q6',
        objectiveId: 'o2',
        type: 'single',
        difficulty: 2,
        prompt:
          'Pourquoi un programme est-il copié du stockage vers la mémoire vive avant d’être utilisé ?',
        explanation:
          'La mémoire vive est beaucoup plus rapide d’accès que le stockage : le processeur y travaille sans attendre.',
        options: [
          {
            id: 'a',
            label: 'Parce que la mémoire vive est beaucoup plus rapide d’accès',
            correct: true,
            feedback: 'Oui : c’est le plan de travail de l’atelier.',
          },
          {
            id: 'b',
            label: 'Parce que le stockage est déjà plein',
            correct: false,
            feedback: 'La copie a lieu même si le stockage a de la place.',
          },
          {
            id: 'c',
            label: 'Parce que la mémoire vive garde les données plus longtemps',
            correct: false,
            feedback: 'C’est l’inverse : la mémoire vive se vide à l’extinction.',
          },
        ],
      },
      {
        id: 'q7',
        objectiveId: 'o3',
        type: 'single',
        difficulty: 1,
        prompt: 'Dans le nom « photo.jpg », que représente « jpg » ?',
        explanation:
          'La partie après le dernier point est l’extension : elle indique le type de fichier, ici une image.',
        options: [
          {
            id: 'a',
            label: 'L’extension, qui indique le type de fichier',
            correct: true,
            feedback: 'Exact : jpg désigne une image.',
          },
          {
            id: 'b',
            label: 'Le dossier qui contient le fichier',
            correct: false,
            feedback: 'Le dossier apparaît dans le chemin, pas après le point.',
          },
          {
            id: 'c',
            label: 'La taille du fichier',
            correct: false,
            feedback: 'La taille n’apparaît pas dans le nom.',
          },
        ],
      },
      {
        id: 'q8',
        objectiveId: 'o3',
        type: 'single',
        difficulty: 2,
        prompt:
          'Le fichier budget.ods est rangé dans le dossier Factures, lui-même dans le dossier Documents de l’utilisateur tom, sous Linux. Quel est son chemin ?',
        explanation:
          'Un chemin part du dossier le plus général et se termine par le nom du fichier.',
        options: [
          {
            id: 'a',
            label: '/home/tom/Documents/Factures/budget.ods',
            correct: true,
            feedback: 'Exact : home, puis tom, puis Documents, puis Factures.',
          },
          {
            id: 'b',
            label: '/home/tom/Factures/Documents/budget.ods',
            correct: false,
            feedback: 'L’ordre est inversé : c’est Documents qui contient Factures.',
          },
          {
            id: 'c',
            label: '/budget.ods/Factures/Documents/tom',
            correct: false,
            feedback: 'Le nom du fichier se place à la fin, pas au début.',
          },
        ],
      },
      {
        id: 'q9',
        objectiveId: 'o3',
        type: 'true-false',
        difficulty: 3,
        prompt: 'Le fichier « facture.pdf.exe » est un document PDF.',
        explanation:
          'Faux : seule la dernière extension compte, et .exe désigne un programme. Ce double nom est une ruse fréquente pour faire passer un programme malveillant pour un document.',
        answer: false,
      },
      {
        id: 'q10',
        objectiveId: 'o3',
        type: 'ordering',
        difficulty: 2,
        prompt:
          'Classez ces dossiers dans l’ordre du chemin /home/lea/Images/plage.jpg, du plus général au plus précis.',
        explanation:
          'On part de la racine « / », puis on entre dans home, lea et enfin Images, qui contient plage.jpg.',
        items: [
          { id: 'a', label: 'La racine « / »' },
          { id: 'b', label: 'home' },
          { id: 'c', label: 'lea' },
          { id: 'd', label: 'Images' },
        ],
      },
    ],
  },
  summary: [
    'Le processeur calcule, la mémoire vive travaille vite mais oublie à l’extinction, le stockage conserve.',
    'Les fichiers sont rangés dans des dossiers, en arborescence.',
    'Le chemin indique où se trouve un fichier ; l’extension, ce qu’il contient.',
    'Un nom comme facture.pdf.exe cache un programme : seule la dernière extension compte.',
  ],
};
