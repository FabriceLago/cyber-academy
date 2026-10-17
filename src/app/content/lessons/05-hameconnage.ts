import { Lesson } from '../../core/models/content.model';

/** Tous les noms, adresses et organisations de cette leçon sont fictifs (domaines réservés .example). */
export const HAMECONNAGE: Lesson = {
  id: 'hameconnage',
  title: 'Repérer l’hameçonnage et l’ingénierie sociale',
  level: 'debutant',
  durationMinutes: 25,
  prerequisiteIds: ['securite-et-risques'],
  labId: 'lab-phishing',
  skillIds: ['detecter-l-hameconnage'],
  objectives: [
    { id: 'o1', text: 'Identifier les indices d’un message d’hameçonnage' },
    { id: 'o2', text: 'Vérifier la véritable adresse d’un lien avant de cliquer' },
    { id: 'o3', text: 'Appliquer les bons réflexes face à un message suspect' },
  ],
  explanation: [
    { kind: 'heading', text: 'Quand le piège vise l’humain' },
    {
      kind: 'paragraph',
      text: 'L’ingénierie sociale consiste à manipuler une personne pour qu’elle fasse ce qu’elle ne devrait pas : donner un mot de passe, payer, ouvrir une pièce jointe. Plutôt que de forcer un système, l’attaquant exploite la confiance, la peur ou l’urgence.',
    },
    {
      kind: 'paragraph',
      text: 'L’hameçonnage (phishing en anglais) en est la forme la plus courante : un faux message, qui imite une banque, un transporteur, une administration ou un collègue, cherche à vous faire cliquer sur un lien ou donner des informations. Il arrive par e-mail, par SMS ou même par téléphone.',
    },
    { kind: 'heading', text: 'Les indices qui doivent alerter' },
    {
      kind: 'list',
      items: [
        'L’urgence ou la menace : « votre compte sera fermé dans 24 heures ».',
        'Une demande inhabituelle : mot de passe, code reçu par SMS, coordonnées bancaires. Un service sérieux ne demande jamais votre mot de passe.',
        'Un expéditeur trompeur : le nom affiché rassure, mais l’adresse réelle n’appartient pas à l’organisme (alerte@banque-secure.example au lieu du domaine de votre banque).',
        'Un lien dont la vraie destination diffère du texte affiché.',
        'Une pièce jointe inattendue, surtout un fichier compressé ou un programme.',
        'Un ton impersonnel (« Cher client ») et parfois des fautes. Attention : beaucoup de faux messages sont parfaitement écrits.',
      ],
    },
    { kind: 'heading', text: 'Vérifier un lien sans cliquer' },
    {
      kind: 'paragraph',
      text: 'Sur ordinateur, survolez le lien avec la souris : sa vraie adresse s’affiche en bas de la fenêtre. Sur téléphone, un appui long sur le lien l’affiche. Lisez alors le nom de domaine : c’est la fin du nom, juste avant la première barre oblique « / » qui suit « https:// ».',
    },
    {
      kind: 'code',
      text: 'Adresse révélée par le survol :\nhttps://banque-exemple.fr.connexion-securisee.example/login\n\nDomaine réel (la fin, avant le premier « / ») :\nconnexion-securisee.example',
    },
    {
      kind: 'paragraph',
      text: 'Ici, « banque-exemple.fr » n’est qu’un morceau placé au début pour tromper : le site n’appartient pas à la banque.',
    },
    { kind: 'heading', text: 'Les bons réflexes' },
    {
      kind: 'list',
      items: [
        'Ne cliquez pas et ne répondez pas. En cas de doute, contactez l’organisme par un moyen que vous connaissez déjà : son site tapé vous-même, son application officielle, son numéro habituel.',
        'Signalez le message : à votre service informatique au travail, ou au service de signalement de votre pays (par exemple cybermalveillance.gouv.fr en France ou safeonweb.be en Belgique), puis supprimez-le.',
        'Si vous avez cliqué ou donné un mot de passe : changez-le immédiatement, activez la double authentification et prévenez votre service informatique ou votre banque.',
      ],
    },
    {
      kind: 'callout',
      tone: 'info',
      text: 'Personne n’est à l’abri : les attaquants soignent leurs messages. Prendre dix secondes pour vérifier n’a rien de honteux, c’est un geste professionnel.',
    },
  ],
  glossary: [
    {
      term: 'Ingénierie sociale',
      definition:
        'Manipulation d’une personne pour lui faire faire une action contraire à sa sécurité.',
      example: 'Un faux technicien qui appelle pour « réparer » votre ordinateur à distance.',
    },
    {
      term: 'Hameçonnage',
      definition:
        'Faux message qui imite un organisme de confiance pour voler des informations ou de l’argent.',
      example:
        'Un e-mail aux couleurs d’une banque qui demande de « confirmer » votre mot de passe.',
    },
    {
      term: 'Usurpation d’identité',
      definition: 'Le fait de se faire passer pour une autre personne ou un autre organisme.',
      example: 'Un message signé « Service client de votre banque » envoyé par un escroc.',
    },
    {
      term: 'Pièce jointe',
      definition: 'Fichier envoyé avec un e-mail.',
      example:
        'Une facture en PDF jointe à un message ; un faux « .pdf.exe » est en réalité un programme.',
    },
    {
      term: 'Survol',
      definition:
        'Le fait de placer la souris sur un lien sans cliquer, pour voir son adresse réelle.',
      example: 'En survolant « Mon compte », on découvre qu’il mène à connexion-securisee.example.',
    },
    {
      term: 'Signalement',
      definition:
        'Transmission d’un message suspect à un service chargé de l’analyser et de prévenir d’autres victimes.',
      example: 'Transférer un e-mail suspect au service informatique de votre entreprise.',
    },
  ],
  example: {
    title: 'Le faux colis',
    text: 'Nadia reçoit un SMS : « Votre colis est bloqué. Payez 1,99 € de frais de livraison avant ce soir : https://suivi-colis.example/paiement ». Elle n’attend aucun colis précis, le message crée une urgence, et le lien ne mène pas au site d’un transporteur. Au lieu de cliquer, elle ouvre elle-même l’application officielle de son transporteur : aucun colis bloqué. Elle signale le SMS et le supprime. Ces faux frais servent à voler des numéros de carte bancaire.',
  },
  animation: {
    id: 'indices-hameconnage',
    title: 'Un e-mail piégé révèle ses indices',
    textAlternative:
      'Étape 1 : l’e-mail affiché semble venir de « Service Client Banque ». Étape 2 : l’adresse réelle de l’expéditeur apparaît : alerte@banque-secure.example, qui n’est pas le domaine de la banque. Étape 3 : l’objet crée une urgence : « Compte suspendu dans 24 h ». Étape 4 : le survol du bouton révèle un lien vers connexion-banque.example. Étape 5 : le message demande le mot de passe et le code reçu par SMS, ce qu’aucune banque ne fait.',
  },
  demonstration: {
    id: 'anatomie-email',
    title: 'Anatomie d’un e-mail suspect',
    textAlternative:
      'E-mail fictif annoté. Indice 1 : expéditeur affiché « Votre Banque », adresse réelle alerte@banque-secure.example. Indice 2 : objet « URGENT : compte bloqué ». Indice 3 : salutation impersonnelle « Cher client ». Indice 4 : bouton « Débloquer mon compte » dont le survol montre https://connexion-banque.example/login. Indice 5 : demande du mot de passe et du code SMS.',
  },
  guidedExercise: {
    intro:
      'Mettez-vous dans la peau d’une personne qui reçoit des messages douteux. Tous les exemples sont fictifs.',
    steps: [
      {
        question: {
          id: 'g1',
          objectiveId: 'o2',
          type: 'single',
          difficulty: 2,
          prompt: 'À quel domaine appartient vraiment ce lien ?',
          context: {
            kind: 'email',
            text: 'Lien révélé par le survol :\nhttps://www.mairie-exemple.fr.verification-dossier.example/espace',
          },
          explanation:
            'Le domaine réel se lit juste avant le premier « / » qui suit « https:// » : verification-dossier.example.',
          options: [
            {
              id: 'a',
              label: 'verification-dossier.example',
              correct: true,
              feedback: 'Exact : c’est la fin du nom, avant « /espace ».',
            },
            {
              id: 'b',
              label: 'mairie-exemple.fr',
              correct: false,
              feedback:
                'Ce nom est placé au début pour rassurer, mais ce n’est pas le domaine réel.',
            },
            {
              id: 'c',
              label: 'espace',
              correct: false,
              feedback: '« espace » vient après le « / » : c’est une page du site, pas le domaine.',
            },
          ],
        },
        hints: [
          'Le domaine réel se lit juste avant le premier « / » qui suit « https:// ».',
          'Regardez la toute fin du nom, avant « /espace ».',
        ],
      },
      {
        question: {
          id: 'g2',
          objectiveId: 'o1',
          type: 'multiple',
          difficulty: 2,
          prompt: 'Quels indices d’hameçonnage contient ce message ?',
          context: {
            kind: 'email',
            text: 'De : Service Client <alerte@banque-secure.example>\nObjet : URGENT – Votre compte sera suspendu dans 24 h\n\nCher client,\nUne activité inhabituelle a été détectée. Confirmez votre identité en saisissant votre mot de passe et le code reçu par SMS :\nhttps://connexion-banque.example',
          },
          explanation:
            'Urgence, demande du mot de passe et du code SMS, expéditeur hors du domaine de la banque : trois indices nets. La langue, elle, ne prouve rien.',
          options: [
            {
              id: 'a',
              label: 'L’urgence (24 h)',
              correct: true,
              feedback: 'Oui : l’urgence empêche de réfléchir.',
            },
            {
              id: 'b',
              label: 'La demande du mot de passe et du code SMS',
              correct: true,
              feedback: 'Oui : aucune banque ne les demande par e-mail.',
            },
            {
              id: 'c',
              label: 'L’adresse de l’expéditeur, qui n’est pas celle de la banque',
              correct: true,
              feedback: 'Oui : banque-secure.example n’appartient pas à la banque.',
            },
            {
              id: 'd',
              label: 'Le message est écrit en français',
              correct: false,
              feedback:
                'La langue n’est pas un indice : beaucoup de faux messages sont bien rédigés.',
            },
          ],
        },
        hints: [
          'Relisez l’objet.',
          'Une banque demande-t-elle votre mot de passe par e-mail ?',
          'Regardez l’adresse entre < >.',
        ],
      },
      {
        question: {
          id: 'g3',
          objectiveId: 'o3',
          type: 'single',
          difficulty: 2,
          prompt:
            'Vous avez saisi votre mot de passe sur un faux site il y a cinq minutes. Que faites-vous en premier ?',
          explanation:
            'Le mot de passe est compromis : il faut le rendre inutile au plus vite, puis prévenir pour limiter les dégâts.',
          options: [
            {
              id: 'a',
              label:
                'Je change ce mot de passe tout de suite, puis je préviens le service concerné',
              correct: true,
              feedback: 'Exact : chaque minute compte.',
            },
            {
              id: 'b',
              label: 'J’attends de voir s’il se passe quelque chose',
              correct: false,
              feedback: 'L’attaquant peut déjà utiliser le mot de passe.',
            },
            {
              id: 'c',
              label: 'Je supprime l’e-mail et je n’en parle à personne',
              correct: false,
              feedback: 'Supprimer le message n’annule pas le vol du mot de passe.',
            },
          ],
        },
        hints: ['L’attaquant connaît maintenant votre mot de passe : comment le rendre inutile ?'],
      },
    ],
  },
  quiz: {
    questionsPerAttempt: 5,
    questions: [
      {
        id: 'q1',
        objectiveId: 'o1',
        type: 'multiple',
        difficulty: 2,
        prompt: 'Quels éléments de ce message sont des indices d’hameçonnage ?',
        context: {
          kind: 'email',
          text: 'De : Livraison Express <notification@colis-retenu.example>\nObjet : Dernier avis avant renvoi de votre colis\n\nBonjour,\nVotre colis n’a pas pu être livré. Réglez 1,99 € de frais avant 18 h :\nhttps://colis-retenu.example/payer',
        },
        explanation:
          'Le paiement à faire dans l’urgence et le domaine qui n’appartient à aucun transporteur sont des indices ; une formule de politesse ou un message court ne prouvent rien.',
        options: [
          {
            id: 'a',
            label: 'Un paiement demandé avec une échéance très courte',
            correct: true,
            feedback: 'Oui : urgence et paiement vont souvent ensemble.',
          },
          {
            id: 'b',
            label: 'Un domaine d’expéditeur qui n’est pas celui d’un transporteur connu',
            correct: true,
            feedback: 'Oui : colis-retenu.example n’est pas un transporteur.',
          },
          {
            id: 'c',
            label: 'Le mot « Bonjour »',
            correct: false,
            feedback: 'Une formule de politesse n’est pas un indice.',
          },
          {
            id: 'd',
            label: 'Le message est court',
            correct: false,
            feedback: 'La longueur d’un message n’indique rien.',
          },
        ],
      },
      {
        id: 'q2',
        objectiveId: 'o1',
        type: 'true-false',
        difficulty: 1,
        prompt: 'Un message sans aucune faute d’orthographe ne peut pas être de l’hameçonnage.',
        explanation:
          'Faux : de nombreux faux messages sont parfaitement rédigés. Il faut vérifier l’expéditeur, les liens et la demande.',
        answer: false,
      },
      {
        id: 'q3',
        objectiveId: 'o1',
        type: 'single',
        difficulty: 2,
        prompt: 'Lequel de ces messages est le plus suspect ?',
        explanation:
          'Demander de saisir son mot de passe via un lien est le signe le plus net d’hameçonnage.',
        options: [
          {
            id: 'a',
            label: '« Votre mot de passe expire : cliquez ici et saisissez-le pour le conserver »',
            correct: true,
            feedback: 'Exact : il réclame un mot de passe via un lien.',
          },
          {
            id: 'b',
            label:
              '« Votre commande n° 1042 a été expédiée, suivez-la depuis votre espace client »',
            correct: false,
            feedback:
              'Informatif, sans demande sensible ; on le vérifie en passant par son espace client habituel.',
          },
          {
            id: 'c',
            label: '« Le séminaire est déplacé à jeudi, salle B »',
            correct: false,
            feedback: 'Aucune demande d’action risquée.',
          },
        ],
      },
      {
        id: 'q4',
        objectiveId: 'o1',
        type: 'matching',
        difficulty: 2,
        prompt: 'Associez chaque forme d’ingénierie sociale à son exemple.',
        explanation: 'L’hameçonnage passe par tous les canaux : e-mail, SMS et téléphone.',
        pairs: [
          {
            id: 'a',
            left: 'Hameçonnage par e-mail',
            right: 'Un faux message de la banque avec un lien',
          },
          {
            id: 'b',
            left: 'Faux support technique',
            right: 'Un appel prétendant que votre ordinateur est infecté',
          },
          { id: 'c', left: 'Faux colis par SMS', right: 'Un SMS réclamant des frais de livraison' },
        ],
      },
      {
        id: 'q5',
        objectiveId: 'o2',
        type: 'single',
        difficulty: 2,
        prompt: 'Quel lien mène réellement au domaine banque-exemple.fr ?',
        explanation: 'Le domaine réel est la fin du nom, juste avant le premier « / ».',
        options: [
          {
            id: 'a',
            label: 'https://www.banque-exemple.fr/comptes',
            correct: true,
            feedback: 'Exact : le nom se termine par banque-exemple.fr avant « / ».',
          },
          {
            id: 'b',
            label: 'https://banque-exemple.fr.securite-client.example/comptes',
            correct: false,
            feedback: 'Le domaine réel est securite-client.example.',
          },
          {
            id: 'c',
            label: 'https://securite.example/banque-exemple.fr',
            correct: false,
            feedback:
              'banque-exemple.fr vient après le « / » : c’est une page de securite.example.',
          },
        ],
      },
      {
        id: 'q6',
        objectiveId: 'o2',
        type: 'single',
        difficulty: 1,
        prompt: 'Sur ordinateur, comment voir la vraie adresse d’un lien sans l’ouvrir ?',
        explanation:
          'Le survol affiche l’adresse réelle en bas de la fenêtre, sans ouvrir le lien.',
        options: [
          { id: 'a', label: 'En le survolant avec la souris', correct: true, feedback: 'Exact.' },
          {
            id: 'b',
            label: 'En cliquant dessus une seule fois',
            correct: false,
            feedback: 'Un clic ouvre déjà le lien.',
          },
          {
            id: 'c',
            label: 'En transférant l’e-mail à un ami',
            correct: false,
            feedback: 'Cela risquerait de piéger votre ami.',
          },
        ],
      },
      {
        id: 'q7',
        objectiveId: 'o2',
        type: 'true-false',
        difficulty: 2,
        prompt:
          'Le texte affiché d’un lien, par exemple « www.ma-banque.fr », garantit l’adresse vers laquelle il mène.',
        explanation:
          'Faux : le texte visible et la destination réelle sont indépendants. Seul le survol (ou l’appui long) révèle la vraie adresse.',
        answer: false,
      },
      {
        id: 'q8',
        objectiveId: 'o3',
        type: 'ordering',
        difficulty: 2,
        prompt:
          'Vous recevez un e-mail suspect au travail. Classez les bons réflexes dans l’ordre.',
        explanation:
          'On ne clique pas, on signale (le message sert à protéger les autres), puis on supprime.',
        items: [
          { id: 'a', label: 'Ne pas cliquer sur le lien' },
          { id: 'b', label: 'Signaler le message au service informatique' },
          { id: 'c', label: 'Supprimer le message' },
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
          text: 'Un « technicien » vous appelle : votre ordinateur serait infecté. Il vous demande d’installer un logiciel pour en prendre le contrôle à distance.',
        },
        explanation:
          'Un vrai service ne vous appelle pas à l’improviste pour prendre le contrôle de votre ordinateur. On raccroche et on vérifie soi-même.',
        options: [
          {
            id: 'a',
            label:
              'Je raccroche et, en cas de doute, je contacte moi-même mon service informatique',
            correct: true,
            feedback: 'Exact.',
          },
          {
            id: 'b',
            label: 'J’installe le logiciel, puisqu’il veut m’aider',
            correct: false,
            feedback: 'Ce logiciel donnerait le contrôle total de votre ordinateur à un inconnu.',
          },
          {
            id: 'c',
            label: 'Je lui donne mon mot de passe pour qu’il vérifie',
            correct: false,
            feedback: 'On ne donne jamais son mot de passe, à personne.',
          },
        ],
      },
      {
        id: 'q10',
        objectiveId: 'o3',
        type: 'multiple',
        difficulty: 3,
        prompt:
          'Vous avez ouvert la pièce jointe d’un e-mail piégé sur votre poste de travail. Que faites-vous ?',
        explanation:
          'Prévenir vite et précisément permet au service informatique de contenir l’attaque ; cacher l’incident ou faire circuler le message l’aggrave.',
        options: [
          {
            id: 'a',
            label: 'Je préviens immédiatement le service informatique',
            correct: true,
            feedback: 'Oui : plus tôt il sait, plus il peut limiter les dégâts.',
          },
          {
            id: 'b',
            label: 'Je précise ce que j’ai ouvert et à quelle heure',
            correct: true,
            feedback: 'Oui : ces détails aident l’analyse.',
          },
          {
            id: 'c',
            label: 'J’éteins l’écran et je continue comme si de rien n’était',
            correct: false,
            feedback: 'L’attaque peut se poursuivre sans que personne ne réagisse.',
          },
          {
            id: 'd',
            label: 'Je transfère l’e-mail à mes collègues pour avoir leur avis',
            correct: false,
            feedback: 'Vous risqueriez de propager le piège.',
          },
        ],
      },
    ],
  },
  summary: [
    'L’ingénierie sociale vise l’humain : urgence, peur et confiance sont ses leviers.',
    'Expéditeur trompeur, demande de mot de passe, lien piégé, pièce jointe inattendue : autant d’indices.',
    'Le domaine réel d’un lien se lit à la fin du nom, juste avant le premier « / ».',
    'Ne pas cliquer, vérifier par un autre moyen, signaler ; si l’on s’est fait piéger, agir vite et prévenir.',
  ],
};
