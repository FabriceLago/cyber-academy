import { Lesson } from '../../core/models/content.model';

/** Personnes, comptes et adresses fictifs (adresses IP réservées à la documentation, RFC 5737). */
export const TRIER_UNE_ALERTE: Lesson = {
  id: 'trier-une-alerte',
  title: 'Trier une alerte de sécurité',
  level: 'intermediaire',
  durationMinutes: 30,
  prerequisiteIds: ['soc-et-journaux'],
  labId: 'lab-journaux',
  skillIds: ['trier-des-alertes'],
  objectives: [
    { id: 'o1', text: 'Distinguer un vrai positif d’un faux positif à partir des faits' },
    { id: 'o2', text: 'Évaluer la gravité d’une alerte selon l’impact et l’étendue' },
    { id: 'o3', text: 'Rédiger une note de triage et décider d’une escalade' },
  ],
  explanation: [
    { kind: 'heading', text: 'Trier, c’est décider vite et bien' },
    {
      kind: 'paragraph',
      text: 'Trier une alerte, c’est répondre à trois questions : est-ce une vraie menace ? À quel point est-ce grave ? Que faut-il faire maintenant ? L’analyste de niveau 1 y répond à partir des faits trouvés dans les journaux, pas de son intuition.',
    },
    { kind: 'heading', text: 'Vrai positif ou faux positif' },
    {
      kind: 'list',
      items: [
        'Vrai positif : l’alerte correspond à une activité malveillante réelle. Exemple : un mot de passe deviné après une série d’essais.',
        'Faux positif : l’alerte s’est déclenchée sans menace réelle. Exemple : un salarié qui se trompe deux fois de mot de passe.',
        'Faux négatif : une attaque réelle qui n’a déclenché aucune alerte. C’est le plus dangereux, car personne ne la voit.',
      ],
    },
    {
      kind: 'paragraph',
      text: 'Pour trancher, on cherche des faits qui confirment ou contredisent l’hypothèse : l’adresse d’origine est-elle habituelle pour ce compte ? Combien d’échecs, en combien de temps ? Une connexion a-t-elle réussi ? Qu’a fait le compte ensuite ?',
    },
    { kind: 'heading', text: 'Évaluer la gravité' },
    {
      kind: 'paragraph',
      text: 'La gravité dépend surtout de deux choses : l’impact (que risque-t-on de perdre : des données sensibles, un service essentiel, de l’argent ?) et l’étendue (un poste, un compte, ou tout le système d’information ?). Une tentative échouée sur un compte de test est de gravité faible ; un accès réussi à des données de clients est de gravité élevée.',
    },
    {
      kind: 'list',
      items: [
        'Faible : aucun accès obtenu, aucune donnée touchée.',
        'Moyenne : accès possible ou limité, à vérifier rapidement.',
        'Élevée : accès confirmé à des données ou à des systèmes sensibles.',
        'Critique : incident en cours, étendu, ou qui bloque l’activité.',
      ],
    },
    {
      kind: 'callout',
      tone: 'info',
      text: 'Chaque organisation définit sa propre échelle de gravité dans ses procédures : celle-ci est un exemple.',
    },
    { kind: 'heading', text: 'Documenter et escalader' },
    {
      kind: 'paragraph',
      text: 'Une note de triage permet à un collègue de reprendre le dossier sans tout refaire. Elle dit quoi, quand, qui (compte, adresse), quels faits, quelle gravité, quelles actions sont déjà faites et ce qui est demandé.',
    },
    {
      kind: 'code',
      text: 'Note de triage, alerte 2026-1014-03\nQuoi : force brute réussie sur le VPN, compte c.martin\nQuand : 14/10, échecs de 02:12 à 02:14, accès à 02:14:52\nIndicateurs : IP 203.0.113.77, export de 48 fichiers (Comptabilité/Factures)\nGravité : élevée (accès confirmé, données sensibles sorties)\nDemande : escalade au niveau 2, blocage de l’IP, réinitialisation du compte',
    },
    {
      kind: 'callout',
      tone: 'warning',
      text: 'Dans le doute, on escalade : une alerte grave traitée trop tard coûte bien plus cher qu’une escalade inutile.',
    },
  ],
  glossary: [
    {
      term: 'Vrai positif',
      definition: 'Alerte qui correspond à une activité malveillante réelle.',
      example:
        'Une connexion réussie après quinze essais de mots de passe depuis une adresse inconnue.',
    },
    {
      term: 'Faux positif',
      definition: 'Alerte déclenchée alors qu’il n’y a pas de menace réelle.',
      example: 'Deux fautes de frappe suivies d’une connexion validée par code.',
    },
    {
      term: 'Faux négatif',
      definition: 'Attaque réelle qui n’a déclenché aucune alerte.',
      example:
        'Un attaquant qui se connecte avec un mot de passe volé, du premier coup, sans éveiller de règle.',
    },
    {
      term: 'Triage',
      definition:
        'Examen d’une alerte pour décider si elle est réelle, quelle est sa gravité et que faire.',
      example: 'Le niveau 1 trie chaque nouvelle alerte de la file d’attente.',
    },
    {
      term: 'Escalade',
      definition: 'Transmission d’un incident à un niveau plus expérimenté, avec une note claire.',
      example: 'Le niveau 1 escalade au niveau 2 un accès confirmé à des données clients.',
    },
    {
      term: 'Gravité',
      definition: 'Importance d’un incident, selon son impact et son étendue.',
      example: 'Accès confirmé à des factures clients : gravité élevée.',
    },
  ],
  example: {
    title: 'Deux alertes, deux décisions',
    text: 'Léa, analyste de niveau 1, reçoit deux alertes. La première : trois échecs de connexion pour un comptable depuis son adresse habituelle, puis une connexion réussie avec le code de double authentification. Faux positif : elle note « faute de frappe, rien d’anormal » et clôt l’alerte. La seconde : une connexion réussie au compte d’un directeur depuis un pays où l’entreprise n’a aucune activité, suivie de la création d’une règle qui transfère ses e-mails vers l’extérieur. Vrai positif, gravité élevée : Léa escalade aussitôt au niveau 2, avec une note claire.',
  },
  animation: {
    id: 'triage-alerte',
    title: 'Le chemin d’une alerte',
    textAlternative:
      'Étape 1 : une alerte arrive dans la file du niveau 1. Étape 2 : l’analyste rassemble les faits dans les journaux. Étape 3 : il qualifie l’alerte : vrai ou faux positif. Étape 4 : il évalue la gravité selon l’impact et l’étendue. Étape 5 : il clôt l’alerte avec une note, ou il l’escalade au niveau 2.',
  },
  demonstration: {
    id: 'grille-gravite',
    title: 'Une grille de gravité',
    textAlternative:
      'Tableau à deux axes. Horizontalement, l’étendue : un compte, un service, toute l’organisation. Verticalement, l’impact : aucune donnée, données internes, données sensibles. En bas à gauche, gravité faible ; en haut à droite, gravité critique. Exemple placé dans la grille : accès à des factures clients par un seul compte, gravité élevée.',
  },
  guidedExercise: {
    intro: 'Entraînez-vous à trier comme un analyste de niveau 1. Les situations sont fictives.',
    steps: [
      {
        question: {
          id: 'g1',
          objectiveId: 'o1',
          type: 'single',
          difficulty: 2,
          prompt: 'Comment qualifier cette alerte ?',
          context: {
            kind: 'log',
            text: '09:01:12  vpn-01  Échec de connexion  j.leroy  198.51.100.40\n09:02:03  vpn-01  Échec de connexion  j.leroy  198.51.100.40\n09:03:10  vpn-01  Connexion réussie  j.leroy  198.51.100.40  (code de double authentification correct)\nAdresse habituelle de j.leroy : 198.51.100.40',
          },
          explanation:
            'Adresse habituelle, deux échecs seulement, code de double authentification validé : très probablement deux fautes de frappe.',
          options: [
            {
              id: 'a',
              label: 'Faux positif probable : deux fautes de frappe',
              correct: true,
              feedback: 'Oui : adresse habituelle, peu d’échecs, code validé.',
            },
            {
              id: 'b',
              label: 'Vrai positif : force brute réussie',
              correct: false,
              feedback:
                'Deux échecs depuis l’adresse habituelle, avec le code : rien d’une attaque.',
            },
            {
              id: 'c',
              label: 'Faux négatif',
              correct: false,
              feedback: 'Un faux négatif est une attaque sans alerte : ici, il y a une alerte.',
            },
          ],
        },
        hints: [
          'Comparez l’adresse avec l’adresse habituelle du compte.',
          'Combien d’échecs ? Le code de double authentification a-t-il été validé ?',
        ],
      },
      {
        question: {
          id: 'g2',
          objectiveId: 'o2',
          type: 'single',
          difficulty: 2,
          prompt: 'Quelle gravité est la plus juste ?',
          context: {
            kind: 'scenario',
            text: 'Un attaquant a obtenu l’accès au compte d’une stagiaire, qui ne peut lire qu’un dossier de documentation publique. Aucune donnée sensible n’a été consultée.',
          },
          explanation:
            'L’accès est réel, mais l’impact et l’étendue sont limités : gravité moyenne. Il faut quand même couper l’accès et réinitialiser le compte.',
          options: [
            {
              id: 'a',
              label: 'Moyenne : accès réel, mais impact et étendue limités',
              correct: true,
              feedback: 'Oui : on agit, sans surestimer.',
            },
            {
              id: 'b',
              label: 'Critique : toute intrusion est critique',
              correct: false,
              feedback: 'La gravité dépend de l’impact et de l’étendue, pas du seul fait.',
            },
            {
              id: 'c',
              label: 'Aucune : il ne s’est rien passé',
              correct: false,
              feedback: 'Un accès non autorisé a eu lieu : il faut agir.',
            },
          ],
        },
        hints: ['Que pouvait atteindre ce compte ?', 'L’impact est faible, mais l’accès est réel.'],
      },
      {
        question: {
          id: 'g3',
          objectiveId: 'o3',
          type: 'multiple',
          difficulty: 2,
          prompt: 'Que doit contenir une note de triage ?',
          explanation:
            'Des faits datés, les indicateurs et la gravité justifiée ; les hypothèses sont signalées comme telles.',
          options: [
            {
              id: 'a',
              label: 'Les faits observés, avec les heures et les sources',
              correct: true,
              feedback: 'Oui.',
            },
            {
              id: 'b',
              label: 'Les indicateurs : adresses IP, comptes, fichiers',
              correct: true,
              feedback: 'Oui.',
            },
            { id: 'c', label: 'La gravité retenue et pourquoi', correct: true, feedback: 'Oui.' },
            {
              id: 'd',
              label: 'Des suppositions présentées comme des certitudes',
              correct: false,
              feedback: 'Séparez toujours les faits des hypothèses.',
            },
          ],
        },
        hints: [
          'Un collègue doit pouvoir reprendre le dossier sans tout refaire.',
          'Quoi, quand, qui, quelle gravité, quelle demande.',
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
        type: 'true-false',
        difficulty: 1,
        prompt: 'Un faux positif est une alerte qui s’est déclenchée sans menace réelle.',
        explanation:
          'Vrai : l’alerte s’est déclenchée, mais il n’y avait pas d’activité malveillante.',
        answer: true,
      },
      {
        id: 'q2',
        objectiveId: 'o1',
        type: 'single',
        difficulty: 2,
        prompt: 'Qu’est-ce qu’un faux négatif ?',
        explanation:
          'Un faux négatif est une attaque réelle qui n’a déclenché aucune alerte : le cas le plus dangereux.',
        options: [
          {
            id: 'a',
            label: 'Une attaque réelle qui n’a déclenché aucune alerte',
            correct: true,
            feedback: 'Exact.',
          },
          {
            id: 'b',
            label: 'Une alerte sans menace réelle',
            correct: false,
            feedback: 'C’est un faux positif.',
          },
          {
            id: 'c',
            label: 'Une alerte confirmée',
            correct: false,
            feedback: 'C’est un vrai positif.',
          },
        ],
      },
      {
        id: 'q3',
        objectiveId: 'o1',
        type: 'single',
        difficulty: 2,
        prompt: 'Comment qualifier cette alerte ?',
        context: {
          kind: 'log',
          text: '02:12:41 → 02:14:41  15 échecs de connexion depuis 203.0.113.77\n02:14:52  vpn-01  Connexion réussie  c.martin  203.0.113.77',
        },
        explanation:
          'Une série d’échecs rapides depuis une adresse inconnue, puis une réussite depuis la même adresse : le mot de passe a été deviné.',
        options: [
          {
            id: 'a',
            label: 'Vrai positif : le mot de passe a été deviné',
            correct: true,
            feedback: 'Exact.',
          },
          {
            id: 'b',
            label: 'Faux positif : des fautes de frappe',
            correct: false,
            feedback:
              'Quinze échecs en deux minutes depuis une adresse inconnue : pas des fautes de frappe.',
          },
          {
            id: 'c',
            label: 'Impossible à dire',
            correct: false,
            feedback: 'Les faits suffisent : série d’échecs puis réussite depuis la même adresse.',
          },
        ],
      },
      {
        id: 'q4',
        objectiveId: 'o1',
        type: 'multiple',
        difficulty: 3,
        prompt: 'Quels faits aident à distinguer une attaque d’une erreur d’utilisateur ?',
        explanation:
          'L’adresse d’origine, le nombre et le rythme des échecs, la réussite éventuelle : ce sont des faits vérifiables dans les journaux.',
        options: [
          {
            id: 'a',
            label: 'L’adresse d’origine est-elle habituelle pour ce compte ?',
            correct: true,
            feedback: 'Oui.',
          },
          { id: 'b', label: 'Le nombre d’échecs et leur rythme', correct: true, feedback: 'Oui.' },
          {
            id: 'c',
            label: 'Une connexion a-t-elle réussi ensuite ?',
            correct: true,
            feedback: 'Oui.',
          },
          {
            id: 'd',
            label: 'La couleur de l’alerte dans l’outil',
            correct: false,
            feedback: 'Un détail d’affichage, pas un fait.',
          },
        ],
      },
      {
        id: 'q5',
        objectiveId: 'o2',
        type: 'matching',
        difficulty: 2,
        prompt: 'Associez chaque situation à sa gravité, selon l’échelle de la leçon.',
        explanation:
          'Aucun accès : faible ; accès à vérifier : moyenne ; accès confirmé à des données sensibles : élevée ; incident étendu en cours : critique.',
        pairs: [
          {
            id: 'a',
            left: 'Tentatives échouées sur un compte de test, aucun accès',
            right: 'Faible',
          },
          { id: 'b', left: 'Accès possible à un compte, à vérifier rapidement', right: 'Moyenne' },
          { id: 'c', left: 'Accès confirmé à des données clients', right: 'Élevée' },
          { id: 'd', left: 'Rançongiciel en cours sur tous les serveurs', right: 'Critique' },
        ],
      },
      {
        id: 'q6',
        objectiveId: 'o2',
        type: 'single',
        difficulty: 2,
        prompt: 'De quoi dépend surtout la gravité d’une alerte ?',
        explanation: 'De l’impact (ce qu’on risque de perdre) et de l’étendue (ce qui est touché).',
        options: [
          { id: 'a', label: 'De l’impact et de l’étendue', correct: true, feedback: 'Exact.' },
          {
            id: 'b',
            label: 'De l’heure à laquelle elle arrive',
            correct: false,
            feedback: 'L’heure peut être un indice, mais elle ne fixe pas la gravité.',
          },
          {
            id: 'c',
            label: 'Du nombre de lignes de journal',
            correct: false,
            feedback: 'Beaucoup de lignes ne veulent pas dire un incident grave.',
          },
        ],
      },
      {
        id: 'q7',
        objectiveId: 'o2',
        type: 'true-false',
        difficulty: 3,
        prompt:
          'Toute intrusion réussie doit être classée « critique », quelle que soit la situation.',
        explanation:
          'Faux : la gravité dépend de l’impact et de l’étendue. Un accès à un compte sans données sensibles peut être de gravité moyenne ; il faut tout de même agir.',
        answer: false,
      },
      {
        id: 'q8',
        objectiveId: 'o3',
        type: 'ordering',
        difficulty: 2,
        prompt: 'Remettez dans l’ordre les étapes du triage.',
        explanation:
          'On lit l’alerte, on rassemble les faits, on qualifie, on évalue la gravité, puis on clôt ou on escalade, avec une note.',
        items: [
          { id: 'a', label: 'Lire l’alerte' },
          { id: 'b', label: 'Rassembler les faits dans les journaux' },
          { id: 'c', label: 'Qualifier : vrai ou faux positif' },
          { id: 'd', label: 'Évaluer la gravité' },
          { id: 'e', label: 'Clore avec une note, ou escalader' },
        ],
      },
      {
        id: 'q9',
        objectiveId: 'o3',
        type: 'single',
        difficulty: 2,
        prompt: 'Que faites-vous ?',
        context: {
          kind: 'scenario',
          text: 'Une alerte pourrait être grave, mais vous n’êtes pas sûr de votre analyse.',
        },
        explanation:
          'Dans le doute, on escalade, en disant clairement ce qui a été vérifié et ce qui reste incertain.',
        options: [
          {
            id: 'a',
            label:
              'J’escalade, avec une note qui dit ce que j’ai vérifié et ce qui reste incertain',
            correct: true,
            feedback: 'Oui : c’est le bon réflexe.',
          },
          {
            id: 'b',
            label: 'Je clos l’alerte pour ne déranger personne',
            correct: false,
            feedback: 'Une alerte grave mal close peut coûter très cher.',
          },
          {
            id: 'c',
            label: 'J’attends demain pour voir',
            correct: false,
            feedback: 'Une attaque en cours n’attend pas.',
          },
        ],
      },
      {
        id: 'q10',
        objectiveId: 'o3',
        type: 'multiple',
        difficulty: 3,
        prompt: 'Quelles phrases ont leur place dans une note de triage ?',
        explanation:
          'Des faits datés, une gravité justifiée et une demande claire ; une supposition sans fait n’a pas sa place telle quelle.',
        options: [
          {
            id: 'a',
            label: '« Accès réussi à 02:14:52 depuis 203.0.113.77 »',
            correct: true,
            feedback: 'Oui : un fait daté.',
          },
          {
            id: 'b',
            label: '« Gravité élevée : accès confirmé à des données clients »',
            correct: true,
            feedback: 'Oui : une gravité justifiée.',
          },
          {
            id: 'c',
            label: '« Demande : escalade au niveau 2 et blocage de l’adresse »',
            correct: true,
            feedback: 'Oui : une demande claire.',
          },
          {
            id: 'd',
            label: '« Je pense que c’est sûrement un concurrent jaloux »',
            correct: false,
            feedback: 'Une supposition sans fait : elle n’a pas sa place telle quelle.',
          },
        ],
      },
    ],
  },
  summary: [
    'Trier une alerte, c’est répondre à trois questions : est-ce réel ? Est-ce grave ? Que faire ?',
    'Vrai positif, faux positif, faux négatif : on tranche avec des faits (adresse habituelle, nombre d’échecs, réussite, actions ensuite).',
    'La gravité dépend de l’impact et de l’étendue, selon l’échelle de l’organisation.',
    'Une note de triage claire dit quoi, quand, qui, quels indicateurs, quelle gravité et quelle demande ; dans le doute, on escalade.',
  ],
};
