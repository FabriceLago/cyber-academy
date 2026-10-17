import { Lesson } from '../../core/models/content.model';

export const SECURITE_ET_RISQUES: Lesson = {
  id: 'securite-et-risques',
  title: 'Confidentialité, intégrité, disponibilité : évaluer un risque',
  level: 'debutant',
  durationMinutes: 20,
  prerequisiteIds: ['voyage-d-une-information'],
  skillIds: ['evaluer-un-risque'],
  objectives: [
    {
      id: 'o1',
      text: 'Relier un incident à la confidentialité, à l’intégrité ou à la disponibilité',
    },
    { id: 'o2', text: 'Distinguer une menace, une vulnérabilité et un risque' },
    { id: 'o3', text: 'Proposer une mesure de protection adaptée à un risque' },
  ],
  explanation: [
    { kind: 'heading', text: 'Les trois objectifs de la sécurité' },
    {
      kind: 'paragraph',
      text: 'La sécurité de l’information protège trois choses, souvent résumées par le sigle anglais CIA (Confidentiality, Integrity, Availability) :',
    },
    {
      kind: 'list',
      items: [
        'La confidentialité : seules les personnes autorisées peuvent lire l’information. Une fuite de dossiers médicaux y porte atteinte.',
        'L’intégrité : l’information n’est pas modifiée sans autorisation. Un montant de virement changé par un pirate y porte atteinte.',
        'La disponibilité : l’information et les services sont accessibles quand on en a besoin. Un site de réservation en panne y porte atteinte.',
      ],
    },
    { kind: 'heading', text: 'Menace, vulnérabilité, risque' },
    { kind: 'paragraph', text: 'Ces trois mots, souvent confondus, ont un sens précis :' },
    {
      kind: 'list',
      items: [
        'Une menace est ce qui pourrait causer un dommage : un voleur, un pirate, un incendie, une erreur humaine.',
        'Une vulnérabilité est une faiblesse qui permet à la menace d’agir : un mot de passe trop simple, un logiciel pas à jour, une porte sans serrure.',
        'Un risque combine les deux avec leurs conséquences : la probabilité qu’une menace exploite une vulnérabilité, et l’impact si cela arrive.',
      ],
    },
    {
      kind: 'callout',
      tone: 'tip',
      text: 'Une image pour retenir : la pluie est une menace, un trou dans le toit est une vulnérabilité, et le risque est que le salon soit inondé. On ne peut pas supprimer la pluie, mais on peut réparer le toit.',
    },
    { kind: 'heading', text: 'Réduire un risque' },
    {
      kind: 'paragraph',
      text: 'On réduit un risque en diminuant sa probabilité (corriger la vulnérabilité) ou son impact (limiter les dégâts). Quelques mesures courantes :',
    },
    {
      kind: 'list',
      items: [
        'Les mises à jour corrigent des vulnérabilités connues.',
        'Des mots de passe solides et la double authentification protègent la confidentialité des comptes.',
        'Les sauvegardes préservent la disponibilité : elles permettent de retrouver des données intactes.',
        'Le chiffrement protège la confidentialité, même si un appareil est volé.',
      ],
    },
  ],
  glossary: [
    {
      term: 'Confidentialité',
      definition: 'Le fait que seules les personnes autorisées puissent lire une information.',
      example:
        'Vos résultats d’analyses médicales ne doivent être lus que par vous et votre médecin.',
    },
    {
      term: 'Intégrité',
      definition: 'Le fait qu’une information ne soit pas modifiée sans autorisation.',
      example: 'Le RIB d’un fournisseur ne doit pas pouvoir être remplacé par celui d’un escroc.',
    },
    {
      term: 'Disponibilité',
      definition: 'Le fait qu’une information ou un service soit accessible quand on en a besoin.',
      example: 'Le site des urgences doit rester joignable jour et nuit.',
    },
    {
      term: 'Menace',
      definition: 'Ce qui pourrait causer un dommage : une personne, un événement ou une erreur.',
      example: 'Un pirate qui essaie des milliers de mots de passe.',
    },
    {
      term: 'Vulnérabilité',
      definition: 'Une faiblesse qui permet à une menace d’agir.',
      example: 'Le mot de passe « 123456 ».',
    },
    {
      term: 'Risque',
      definition:
        'La combinaison de la probabilité qu’une menace exploite une vulnérabilité et de l’impact si cela arrive.',
      example:
        'Le risque qu’un compte protégé par « 123456 » soit piraté est élevé, et l’impact dépend de ce que contient le compte.',
    },
    {
      term: 'Rançongiciel',
      definition:
        'Logiciel malveillant qui bloque ou chiffre les fichiers d’une victime pour lui réclamer une rançon.',
      example: 'Un hôpital dont tous les dossiers deviennent illisibles du jour au lendemain.',
    },
    {
      term: 'Double authentification',
      definition:
        'Connexion qui demande, en plus du mot de passe, une seconde preuve : un code, une application ou une clé physique.',
      example:
        'Après votre mot de passe, votre banque vous demande de valider la connexion sur votre téléphone.',
    },
  ],
  example: {
    title: 'Le cabinet du docteur Martin',
    text: 'Le cabinet garde les dossiers des patients sur un seul ordinateur, sans sauvegarde, avec un système qui n’est plus mis à jour. Menaces : un rançongiciel, une panne de disque. Vulnérabilités : le système non mis à jour, l’absence de sauvegarde. Risques : perdre l’accès aux dossiers (disponibilité) et voir des données de santé dévoilées (confidentialité). Mesures : mettre le système à jour, sauvegarder chaque jour sur un support débranché après la copie, chiffrer le disque.',
  },
  animation: {
    id: 'triade-cia',
    title: 'Trois incidents, trois objectifs touchés',
    textAlternative:
      'Étape 1 : un e-mail contenant des données clients part chez la mauvaise personne : la confidentialité est touchée. Étape 2 : un pirate modifie le RIB d’une facture : l’intégrité est touchée. Étape 3 : le site de vente ne répond plus pendant les soldes : la disponibilité est touchée.',
  },
  demonstration: {
    id: 'menace-vulnerabilite-risque',
    title: 'De la menace au risque',
    textAlternative:
      'Schéma en trois cases reliées : menace (un pirate qui teste des mots de passe) + vulnérabilité (le mot de passe « 123456 ») = risque (prise de contrôle du compte, impact élevé). Une flèche « mesure » part de la vulnérabilité vers « mot de passe long et double authentification », qui fait baisser le risque.',
  },
  guidedExercise: {
    intro: 'Analysez trois situations, comme le ferait un responsable de la sécurité.',
    steps: [
      {
        question: {
          id: 'g1',
          objectiveId: 'o1',
          type: 'single',
          difficulty: 1,
          prompt:
            'Un pirate modifie le montant d’une facture avant son envoi. Quel objectif de sécurité est touché ?',
          explanation:
            'L’information a été modifiée sans autorisation : c’est l’intégrité qui est touchée.',
          options: [
            { id: 'a', label: 'L’intégrité', correct: true, feedback: 'Exact.' },
            {
              id: 'b',
              label: 'La confidentialité',
              correct: false,
              feedback: 'Personne n’a lu d’information interdite : elle a été modifiée.',
            },
            {
              id: 'c',
              label: 'La disponibilité',
              correct: false,
              feedback: 'La facture reste accessible : elle est seulement fausse.',
            },
          ],
        },
        hints: ['L’information a-t-elle été lue, modifiée ou rendue inaccessible ?'],
      },
      {
        question: {
          id: 'g2',
          objectiveId: 'o2',
          type: 'single',
          difficulty: 2,
          prompt:
            '« Le logiciel de la boutique n’a pas été mis à jour depuis deux ans. » De quoi s’agit-il ?',
          explanation:
            'C’est une faiblesse qu’un attaquant pourrait exploiter : une vulnérabilité.',
          options: [
            {
              id: 'a',
              label: 'D’une vulnérabilité',
              correct: true,
              feedback: 'Exact : c’est une faiblesse.',
            },
            {
              id: 'b',
              label: 'D’une menace',
              correct: false,
              feedback: 'La menace serait par exemple le pirate qui exploite cette faiblesse.',
            },
            {
              id: 'c',
              label: 'D’un risque',
              correct: false,
              feedback:
                'Le risque, c’est la possibilité que cette faiblesse soit exploitée, avec ses conséquences.',
            },
          ],
        },
        hints: ['S’agit-il d’un agresseur, d’une faiblesse ou d’une conséquence possible ?'],
      },
      {
        question: {
          id: 'g3',
          objectiveId: 'o3',
          type: 'multiple',
          difficulty: 1,
          prompt: 'Quelles mesures réduisent le risque de perdre définitivement ses photos ?',
          explanation:
            'Seules des copies sur un autre support permettent de retrouver les photos après une panne, un vol ou un rançongiciel.',
          options: [
            {
              id: 'a',
              label: 'Faire des sauvegardes régulières sur un autre support',
              correct: true,
              feedback: 'Oui : les photos survivent à la perte de l’appareil.',
            },
            {
              id: 'b',
              label: 'Garder une copie dans un service en ligne de confiance',
              correct: true,
              feedback: 'Oui : c’est une autre forme de sauvegarde.',
            },
            {
              id: 'c',
              label: 'Changer de fond d’écran',
              correct: false,
              feedback: 'Cela n’a aucun effet sur la sécurité des fichiers.',
            },
            {
              id: 'd',
              label: 'Désactiver l’antivirus pour aller plus vite',
              correct: false,
              feedback: 'Cela augmente le risque au lieu de le réduire.',
            },
          ],
        },
        hints: ['Qu’est-ce qui permet de retrouver les photos si l’appareil tombe en panne ?'],
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
        prompt: 'Associez chaque incident à l’objectif de sécurité qu’il touche.',
        explanation:
          'Lire sans droit touche la confidentialité ; modifier, l’intégrité ; empêcher l’accès, la disponibilité.',
        pairs: [
          { id: 'a', left: 'Des dossiers médicaux publiés en ligne', right: 'Confidentialité' },
          { id: 'b', left: 'Un RIB modifié sur une facture', right: 'Intégrité' },
          { id: 'c', left: 'Une messagerie inaccessible toute la journée', right: 'Disponibilité' },
        ],
      },
      {
        id: 'q2',
        objectiveId: 'o1',
        type: 'single',
        difficulty: 2,
        prompt: 'Quel objectif est principalement touché ?',
        context: {
          kind: 'scenario',
          text: 'Une attaque inonde le site d’une mairie de fausses requêtes : plus personne ne peut faire ses démarches en ligne.',
        },
        explanation: 'Le service est inaccessible : c’est la disponibilité qui est touchée.',
        options: [
          { id: 'a', label: 'La disponibilité', correct: true, feedback: 'Exact.' },
          {
            id: 'b',
            label: 'La confidentialité',
            correct: false,
            feedback: 'Aucune donnée n’a été lue par l’attaquant.',
          },
          {
            id: 'c',
            label: 'L’intégrité',
            correct: false,
            feedback: 'Aucune donnée n’a été modifiée.',
          },
        ],
      },
      {
        id: 'q3',
        objectiveId: 'o1',
        type: 'true-false',
        difficulty: 2,
        prompt:
          'Un e-mail contenant des informations clients, envoyé par erreur à la mauvaise personne, porte atteinte à la confidentialité.',
        explanation:
          'Vrai : une personne non autorisée peut lire ces informations, même sans mauvaise intention.',
        answer: true,
      },
      {
        id: 'q4',
        objectiveId: 'o2',
        type: 'matching',
        difficulty: 2,
        prompt: 'Associez chaque élément à sa nature.',
        explanation:
          'Le cambrioleur est la menace, la fenêtre la vulnérabilité, et le vol possible le risque.',
        pairs: [
          { id: 'a', left: 'Un cambrioleur', right: 'Menace' },
          { id: 'b', left: 'Une fenêtre qui ne ferme pas', right: 'Vulnérabilité' },
          {
            id: 'c',
            left: 'Le vol possible de l’ordinateur pendant les vacances',
            right: 'Risque',
          },
        ],
      },
      {
        id: 'q5',
        objectiveId: 'o2',
        type: 'single',
        difficulty: 1,
        prompt: 'Qu’est-ce qu’une vulnérabilité ?',
        explanation: 'Une vulnérabilité est une faiblesse qu’une menace peut exploiter.',
        options: [
          {
            id: 'a',
            label: 'Une faiblesse qui peut être exploitée',
            correct: true,
            feedback: 'Exact.',
          },
          {
            id: 'b',
            label: 'Une personne malveillante',
            correct: false,
            feedback: 'C’est une menace.',
          },
          {
            id: 'c',
            label: 'Les dégâts causés par une attaque',
            correct: false,
            feedback: 'C’est l’impact, l’une des composantes du risque.',
          },
        ],
      },
      {
        id: 'q6',
        objectiveId: 'o2',
        type: 'single',
        difficulty: 3,
        prompt:
          'Un serveur a une faille connue, mais il n’est relié à aucun réseau et se trouve dans une salle fermée à clé. Que peut-on dire ?',
        explanation:
          'Un risque dépend de la probabilité et de l’impact, pas seulement de l’existence d’une faille.',
        options: [
          {
            id: 'a',
            label: 'La vulnérabilité existe, mais le risque d’exploitation à distance est faible',
            correct: true,
            feedback: 'Exact : la faille demeure, sa probabilité d’exploitation baisse.',
          },
          {
            id: 'b',
            label: 'Il n’y a aucune vulnérabilité',
            correct: false,
            feedback: 'La faille existe toujours ; c’est la probabilité de l’exploiter qui baisse.',
          },
          {
            id: 'c',
            label: 'Le risque est maximal, puisqu’il y a une faille',
            correct: false,
            feedback: 'Le risque tient aussi compte de la probabilité, ici faible.',
          },
        ],
      },
      {
        id: 'q7',
        objectiveId: 'o3',
        type: 'single',
        difficulty: 1,
        prompt: 'Quelle mesure corrige directement des vulnérabilités connues ?',
        explanation: 'Les mises à jour de sécurité corrigent les failles découvertes.',
        options: [
          { id: 'a', label: 'Installer les mises à jour', correct: true, feedback: 'Exact.' },
          {
            id: 'b',
            label: 'Changer la couleur du site',
            correct: false,
            feedback: 'Cela ne change rien à la sécurité.',
          },
          {
            id: 'c',
            label: 'Supprimer les sauvegardes',
            correct: false,
            feedback: 'Cela augmenterait le risque.',
          },
        ],
      },
      {
        id: 'q8',
        objectiveId: 'o3',
        type: 'multiple',
        difficulty: 2,
        prompt:
          'Un ordinateur portable contenant des fichiers clients risque d’être volé. Quelles mesures limitent l’impact d’un vol ?',
        explanation:
          'Le chiffrement empêche le voleur de lire les fichiers ; la sauvegarde permet de continuer à travailler.',
        options: [
          {
            id: 'a',
            label: 'Chiffrer le disque',
            correct: true,
            feedback: 'Le voleur ne pourra pas lire les fichiers.',
          },
          {
            id: 'b',
            label: 'Avoir une sauvegarde à jour',
            correct: true,
            feedback: 'Les fichiers restent disponibles pour l’entreprise.',
          },
          {
            id: 'c',
            label: 'Coller le mot de passe sous le clavier',
            correct: false,
            feedback: 'Le voleur l’emporterait avec l’ordinateur.',
          },
          {
            id: 'd',
            label: 'Désactiver le verrouillage de session',
            correct: false,
            feedback: 'Cela faciliterait l’accès au voleur.',
          },
        ],
      },
      {
        id: 'q9',
        objectiveId: 'o3',
        type: 'single',
        difficulty: 2,
        prompt: 'Quelle mesure améliore le plus la disponibilité de ses fichiers ?',
        context: {
          kind: 'scenario',
          text: 'Une association stocke tous ses fichiers sur une seule clé USB.',
        },
        explanation:
          'Une copie régulière sur un autre support permet de continuer si la clé est perdue ou abîmée.',
        options: [
          {
            id: 'a',
            label: 'Faire une copie régulière sur un autre support',
            correct: true,
            feedback: 'Exact.',
          },
          {
            id: 'b',
            label: 'Renommer les fichiers',
            correct: false,
            feedback: 'Les fichiers seraient toujours perdus avec la clé.',
          },
          {
            id: 'c',
            label: 'Allonger le mot de passe de la messagerie',
            correct: false,
            feedback: 'Utile pour la confidentialité, mais sans effet si la clé est perdue.',
          },
        ],
      },
      {
        id: 'q10',
        objectiveId: 'o3',
        type: 'true-false',
        difficulty: 2,
        prompt:
          'Avec la double authentification, un mot de passe volé ne suffit plus, à lui seul, pour se connecter au compte.',
        explanation:
          'Vrai : il faut aussi la seconde preuve. Le risque baisse fortement sans disparaître : certains attaquants tentent aussi d’obtenir ce code, par exemple par hameçonnage.',
        answer: true,
      },
    ],
  },
  summary: [
    'La sécurité protège la confidentialité, l’intégrité et la disponibilité de l’information.',
    'Une menace exploite une vulnérabilité ; le risque combine la probabilité et l’impact.',
    'On réduit un risque en corrigeant les faiblesses ou en limitant les dégâts.',
    'Mises à jour, double authentification, sauvegardes et chiffrement sont des mesures essentielles.',
  ],
};
