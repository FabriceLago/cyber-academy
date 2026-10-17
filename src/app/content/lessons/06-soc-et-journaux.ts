import { Lesson } from '../../core/models/content.model';

/** Comptes et adresses fictifs (adresses IP réservées à la documentation, RFC 5737). */
export const SOC_ET_JOURNAUX: Lesson = {
  id: 'soc-et-journaux',
  title: 'Le SOC et les journaux de sécurité',
  level: 'intermediaire',
  durationMinutes: 30,
  prerequisiteIds: [],
  skillIds: ['analyser-des-journaux'],
  objectives: [
    { id: 'o1', text: 'Décrire le rôle d’un SOC et des analystes de niveau 1, 2 et 3' },
    {
      id: 'o2',
      text: 'Identifier les champs d’une ligne de journal : date, source, événement, compte, adresse',
    },
    { id: 'o3', text: 'Repérer dans un journal un enchaînement d’événements suspect' },
  ],
  explanation: [
    { kind: 'heading', text: 'Le centre des opérations de sécurité' },
    {
      kind: 'paragraph',
      text: 'Un SOC (Security Operations Center, ou centre des opérations de sécurité) est l’équipe qui surveille en continu les systèmes d’une organisation pour détecter les attaques et y répondre. Il travaille souvent en horaires étendus, parfois jour et nuit, car les attaques n’attendent pas les heures de bureau.',
    },
    {
      kind: 'list',
      items: [
        'Niveau 1 : surveille les alertes, fait les premières vérifications, trie et documente. C’est souvent le premier poste.',
        'Niveau 2 : approfondit les incidents confirmés, mesure leur étendue et pilote la réponse.',
        'Niveau 3 : traque les menaces discrètes, analyse les attaques complexes et améliore les règles de détection.',
      ],
    },
    {
      kind: 'callout',
      tone: 'info',
      text: 'Les intitulés et la répartition des tâches varient d’une organisation à l’autre : ces trois niveaux sont un repère courant, pas une règle.',
    },
    { kind: 'heading', text: 'Les journaux, mémoire des systèmes' },
    {
      kind: 'paragraph',
      text: 'Un journal (log en anglais) est un fichier où un système note, ligne après ligne, ce qui lui arrive : connexions, erreurs, fichiers ouverts, règles de pare-feu appliquées. Chaque ligne décrit un événement. Sans journaux, impossible de savoir ce qui s’est passé.',
    },
    {
      kind: 'paragraph',
      text: 'Une ligne de journal contient presque toujours les mêmes informations :',
    },
    {
      kind: 'code',
      text: '2026-10-14 02:14:52  vpn-01  Connexion réussie  c.martin  203.0.113.77',
    },
    {
      kind: 'list',
      items: [
        'La date et l’heure : quand l’événement a eu lieu.',
        'La source : le système qui l’a noté, ici le serveur VPN vpn-01.',
        'L’événement : ce qui s’est passé.',
        'Le compte : l’utilisateur concerné.',
        'L’adresse IP : d’où venait la demande.',
      ],
    },
    { kind: 'heading', text: 'De l’événement à l’alerte' },
    {
      kind: 'paragraph',
      text: 'Un système produit des milliers d’événements par jour : personne ne peut tout lire. Un SIEM (gestion des informations et des événements de sécurité) rassemble les journaux de nombreux systèmes et leur applique des règles de détection. Quand une règle se déclenche, par exemple « plus de 10 échecs de connexion en 2 minutes depuis la même adresse », il crée une alerte, que l’analyste examine.',
    },
    {
      kind: 'paragraph',
      text: 'Un événement isolé dit peu de choses ; c’est l’enchaînement qui alerte. Une erreur de mot de passe suivie d’une connexion réussie une minute plus tard est banale. Des dizaines d’échecs depuis une adresse inconnue, puis une réussite, puis des fichiers téléchargés en pleine nuit : voilà une histoire suspecte.',
    },
    {
      kind: 'callout',
      tone: 'warning',
      text: 'Les journaux sont des preuves : on les lit, on les copie si nécessaire, mais on ne les modifie ni ne les supprime jamais.',
    },
  ],
  glossary: [
    {
      term: 'SOC',
      definition:
        'Équipe qui surveille les systèmes d’une organisation pour détecter les attaques et y répondre.',
      example: 'Le SOC d’une banque surveille ses serveurs et ses postes de travail jour et nuit.',
    },
    {
      term: 'Journal (log)',
      definition:
        'Fichier où un système note les événements qui lui arrivent, une ligne par événement.',
      example: 'Le journal du VPN note chaque connexion réussie ou échouée.',
    },
    {
      term: 'Événement',
      definition:
        'Fait noté dans un journal : une connexion, une erreur, l’ouverture d’un fichier.',
      example: '« Échec de connexion du compte p.durand à 21 h 15 ».',
    },
    {
      term: 'SIEM',
      definition:
        'Outil qui rassemble les journaux de nombreux systèmes, les relie et déclenche des alertes selon des règles.',
      example: 'Le SIEM crée une alerte après dix échecs de connexion en deux minutes.',
    },
    {
      term: 'Alerte',
      definition: 'Signal créé par une règle de détection, qu’un analyste doit examiner.',
      example: '« Nombreux échecs de connexion sur le VPN cette nuit ».',
    },
    {
      term: 'Analyste de niveau 1',
      definition:
        'Membre du SOC qui surveille et trie les alertes, puis transmet les incidents confirmés.',
      example:
        'Il vérifie si une alerte correspond à une vraie attaque et documente sa conclusion.',
    },
  ],
  example: {
    title: 'Une nuit au SOC',
    text: 'Samir est analyste de niveau 1. À 3 h, le SIEM lève une alerte : beaucoup d’échecs de connexion sur la messagerie. Il ouvre les journaux : 40 échecs en trois minutes sur le compte d’une comptable, depuis une adresse inconnue, puis plus rien. Aucune connexion réussie : l’attaque a échoué. Samir note ses vérifications, bloque l’adresse selon la procédure et signale le compte, pour qu’on y active la double authentification.',
  },
  animation: {
    id: 'evenement-alerte',
    title: 'Un événement devient une alerte',
    textAlternative:
      'Étape 1 : le serveur VPN note un échec de connexion dans son journal. Étape 2 : le SIEM reçoit cette ligne avec celles des autres systèmes. Étape 3 : dix échecs arrivent en deux minutes depuis la même adresse. Étape 4 : la règle de détection se déclenche et crée une alerte. Étape 5 : l’analyste de niveau 1 examine l’alerte et les journaux pour décider de la suite.',
  },
  demonstration: {
    id: 'anatomie-ligne-journal',
    title: 'Anatomie d’une ligne de journal',
    textAlternative:
      'Ligne annotée : 2026-10-14 02:14:52 | vpn-01 | Connexion réussie | c.martin | 203.0.113.77. La date et l’heure disent quand. vpn-01 est la source. « Connexion réussie » est l’événement. c.martin est le compte. 203.0.113.77 est l’adresse IP d’origine.',
  },
  guidedExercise: {
    intro: 'Lisez ces extraits de journaux fictifs comme le ferait un analyste de niveau 1.',
    steps: [
      {
        question: {
          id: 'g1',
          objectiveId: 'o2',
          type: 'single',
          difficulty: 1,
          prompt: 'Dans cette ligne, quel champ indique d’où venait la demande ?',
          context: {
            kind: 'log',
            text: '2026-10-13 21:15:40  vpn-01  Connexion réussie  p.durand  198.51.100.61',
          },
          explanation:
            'L’adresse IP (198.51.100.61) indique d’où venait la demande ; vpn-01 est le système qui l’a notée.',
          options: [
            {
              id: 'a',
              label: '198.51.100.61',
              correct: true,
              feedback: 'Oui : c’est l’adresse IP d’origine.',
            },
            {
              id: 'b',
              label: 'vpn-01',
              correct: false,
              feedback: 'C’est la source : le système qui a noté l’événement.',
            },
            { id: 'c', label: 'p.durand', correct: false, feedback: 'C’est le compte concerné.' },
          ],
        },
        hints: [
          'Cherchez une suite de quatre nombres séparés par des points.',
          'C’est le dernier champ de la ligne.',
        ],
      },
      {
        question: {
          id: 'g2',
          objectiveId: 'o3',
          type: 'single',
          difficulty: 2,
          prompt: 'Lequel de ces extraits est le plus suspect ?',
          explanation:
            'C’est l’enchaînement qui alerte : beaucoup d’échecs rapides depuis une même adresse, puis une réussite.',
          options: [
            {
              id: 'a',
              label:
                'Un échec de connexion de l.bernard à 8 h 05, puis une connexion réussie à 8 h 06 avec le code de double authentification',
              correct: false,
              feedback: 'Une faute de frappe corrigée aussitôt : c’est banal.',
            },
            {
              id: 'b',
              label:
                'Quinze échecs en deux minutes depuis 203.0.113.77, puis une connexion réussie au compte c.martin',
              correct: true,
              feedback:
                'Oui : une série d’échecs suivie d’une réussite signale un mot de passe deviné.',
            },
            {
              id: 'c',
              label: 'Une déconnexion de p.durand à 22 h 03',
              correct: false,
              feedback: 'Un événement normal de fin de session.',
            },
          ],
        },
        hints: [
          'Un événement isolé dit peu de choses : cherchez un enchaînement.',
          'Combien d’échecs, en combien de temps, et que se passe-t-il ensuite ?',
        ],
      },
      {
        question: {
          id: 'g3',
          objectiveId: 'o1',
          type: 'matching',
          difficulty: 2,
          prompt: 'Associez chaque tâche au niveau qui s’en charge le plus souvent.',
          explanation:
            'Le niveau 1 trie et documente, le niveau 2 approfondit et répond, le niveau 3 traque et améliore la détection. La répartition exacte varie selon les organisations.',
          pairs: [
            {
              id: 'a',
              left: 'Trier les nouvelles alertes et documenter les vérifications',
              right: 'Niveau 1',
            },
            {
              id: 'b',
              left: 'Mesurer l’étendue d’un incident confirmé et piloter la réponse',
              right: 'Niveau 2',
            },
            {
              id: 'c',
              left: 'Traquer les menaces discrètes et améliorer les règles de détection',
              right: 'Niveau 3',
            },
          ],
        },
        hints: [
          'Le niveau 1 est le premier à voir les alertes.',
          'Plus le niveau est élevé, plus l’analyse est approfondie.',
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
        prompt: 'Quel est le rôle d’un SOC ?',
        explanation:
          'Un SOC surveille les systèmes d’une organisation pour détecter les attaques et y répondre.',
        options: [
          {
            id: 'a',
            label: 'Surveiller les systèmes pour détecter les attaques et y répondre',
            correct: true,
            feedback: 'Exact.',
          },
          {
            id: 'b',
            label: 'Développer les applications de l’entreprise',
            correct: false,
            feedback: 'C’est le rôle des équipes de développement.',
          },
          {
            id: 'c',
            label: 'Vendre des antivirus',
            correct: false,
            feedback: 'Un SOC est une équipe de surveillance, pas un vendeur.',
          },
        ],
      },
      {
        id: 'q2',
        objectiveId: 'o1',
        type: 'true-false',
        difficulty: 1,
        prompt:
          'Un analyste SOC de niveau 1 trie les alertes et transmet les incidents confirmés aux niveaux supérieurs.',
        explanation:
          'Vrai : c’est le cœur du niveau 1. Il vérifie, documente, puis escalade ce qui le demande.',
        answer: true,
      },
      {
        id: 'q3',
        objectiveId: 'o1',
        type: 'multiple',
        difficulty: 2,
        prompt: 'Quelles tâches relèvent d’un analyste de niveau 1 ?',
        explanation:
          'Le niveau 1 examine, documente et escalade. Supprimer des journaux n’est jamais une option.',
        options: [
          { id: 'a', label: 'Examiner une nouvelle alerte', correct: true, feedback: 'Oui.' },
          { id: 'b', label: 'Documenter ses vérifications', correct: true, feedback: 'Oui.' },
          {
            id: 'c',
            label: 'Transmettre un incident confirmé au niveau 2',
            correct: true,
            feedback: 'Oui : c’est l’escalade.',
          },
          {
            id: 'd',
            label: 'Supprimer les journaux gênants',
            correct: false,
            feedback: 'Jamais : les journaux sont des preuves.',
          },
        ],
      },
      {
        id: 'q4',
        objectiveId: 'o2',
        type: 'single',
        difficulty: 1,
        prompt: 'Quel système a noté cet événement ?',
        context: {
          kind: 'log',
          text: '2026-10-14 02:16:10  srv-fichiers  Ouverture de dossier  c.martin  203.0.113.77',
        },
        explanation: 'srv-fichiers est la source : le serveur de fichiers qui a noté l’événement.',
        options: [
          { id: 'a', label: 'srv-fichiers', correct: true, feedback: 'Exact : c’est la source.' },
          { id: 'b', label: 'c.martin', correct: false, feedback: 'C’est le compte concerné.' },
          {
            id: 'c',
            label: '203.0.113.77',
            correct: false,
            feedback: 'C’est l’adresse d’où venait la demande.',
          },
        ],
      },
      {
        id: 'q5',
        objectiveId: 'o2',
        type: 'matching',
        difficulty: 2,
        prompt: 'Associez chaque partie de la ligne à ce qu’elle indique.',
        context: {
          kind: 'log',
          text: '2026-10-13 18:02:11  vpn-01  Connexion réussie  l.bernard  198.51.100.23',
        },
        explanation:
          'Date et heure : quand ; vpn-01 : la source ; l.bernard : le compte ; 198.51.100.23 : l’adresse d’origine.',
        pairs: [
          { id: 'a', left: '2026-10-13 18:02:11', right: 'Quand l’événement a eu lieu' },
          { id: 'b', left: 'vpn-01', right: 'Le système qui l’a noté' },
          { id: 'c', left: 'l.bernard', right: 'Le compte concerné' },
          { id: 'd', left: '198.51.100.23', right: 'L’adresse d’origine' },
        ],
      },
      {
        id: 'q6',
        objectiveId: 'o2',
        type: 'true-false',
        difficulty: 2,
        prompt: 'On peut supprimer une ligne de journal qui révèle une erreur embarrassante.',
        explanation:
          'Faux : un journal est une preuve. Le modifier ou le supprimer empêche de comprendre un incident et peut constituer une faute grave.',
        answer: false,
      },
      {
        id: 'q7',
        objectiveId: 'o3',
        type: 'single',
        difficulty: 2,
        prompt: 'Que montre cet extrait ?',
        context: {
          kind: 'log',
          text: '21:15:02  vpn-01  Échec de connexion  p.durand  198.51.100.61\n21:15:40  vpn-01  Connexion réussie  p.durand  198.51.100.61  (code de double authentification correct)',
        },
        explanation:
          'Un seul échec, puis une connexion validée par le code depuis la même adresse : une faute de frappe, pas une attaque.',
        options: [
          {
            id: 'a',
            label: 'Une faute de frappe, corrigée aussitôt',
            correct: true,
            feedback: 'Exact : un échec isolé suivi d’une connexion validée.',
          },
          {
            id: 'b',
            label: 'Une attaque par force brute réussie',
            correct: false,
            feedback: 'Il n’y a qu’un échec : ce n’est pas une série.',
          },
          {
            id: 'c',
            label: 'Une panne du VPN',
            correct: false,
            feedback: 'La connexion a fini par réussir : le VPN fonctionne.',
          },
        ],
      },
      {
        id: 'q8',
        objectiveId: 'o3',
        type: 'ordering',
        difficulty: 3,
        prompt: 'Remettez dans l’ordre cette intrusion, telle que la racontent les journaux.',
        explanation:
          'L’attaquant essaie des mots de passe, réussit à se connecter, explore, emporte des données, puis s’en va.',
        items: [
          { id: 'a', label: 'Série d’échecs de connexion depuis une adresse inconnue' },
          { id: 'b', label: 'Connexion réussie depuis la même adresse' },
          { id: 'c', label: 'Ouverture d’un dossier sensible' },
          { id: 'd', label: 'Export de nombreux fichiers' },
          { id: 'e', label: 'Déconnexion' },
        ],
      },
      {
        id: 'q9',
        objectiveId: 'o3',
        type: 'multiple',
        difficulty: 3,
        prompt: 'Quels éléments rendent un enchaînement d’événements suspect ?',
        explanation:
          'Des échecs nombreux et rapides depuis une même adresse, une réussite juste après, puis des téléchargements massifs à une heure inhabituelle forment une histoire suspecte.',
        options: [
          {
            id: 'a',
            label: 'De nombreux échecs en peu de temps depuis la même adresse',
            correct: true,
            feedback: 'Oui : signe d’essais de mots de passe.',
          },
          {
            id: 'b',
            label: 'Une connexion réussie juste après ces échecs',
            correct: true,
            feedback: 'Oui : le mot de passe a peut-être été trouvé.',
          },
          {
            id: 'c',
            label: 'Des téléchargements massifs en pleine nuit',
            correct: true,
            feedback: 'Oui : un possible vol de données.',
          },
          {
            id: 'd',
            label: 'Une déconnexion en fin de journée',
            correct: false,
            feedback: 'Un événement normal.',
          },
        ],
      },
      {
        id: 'q10',
        objectiveId: 'o3',
        type: 'single',
        difficulty: 3,
        prompt: 'Quelle est la conclusion la plus raisonnable ?',
        context: {
          kind: 'scenario',
          text: 'Le SIEM signale trois échecs de connexion en une heure pour le compte d’un salarié, depuis son adresse habituelle, sans connexion réussie ensuite.',
        },
        explanation:
          'Peu d’échecs, depuis l’adresse habituelle : probablement un mot de passe oublié. On vérifie rapidement et on documente ; on ne coupe pas tout, on n’ignore pas non plus.',
        options: [
          {
            id: 'a',
            label: 'Probablement un mot de passe oublié : vérifier rapidement et documenter',
            correct: true,
            feedback: 'Oui : une réponse proportionnée, documentée.',
          },
          {
            id: 'b',
            label: 'Une attaque majeure : couper tout le réseau',
            correct: false,
            feedback: 'Une réaction disproportionnée par rapport aux faits.',
          },
          {
            id: 'c',
            label: 'Ignorer l’alerte sans rien noter',
            correct: false,
            feedback: 'Même une alerte bénigne se documente.',
          },
        ],
      },
    ],
  },
  summary: [
    'Un SOC surveille les systèmes pour détecter les attaques et y répondre ; le niveau 1 trie et documente les alertes.',
    'Une ligne de journal dit quand, quelle source, quel événement, quel compte et quelle adresse.',
    'Un SIEM rassemble les journaux et crée des alertes selon des règles ; l’analyste les examine.',
    'C’est l’enchaînement d’événements qui révèle une attaque ; les journaux sont des preuves à ne jamais modifier.',
  ],
};
