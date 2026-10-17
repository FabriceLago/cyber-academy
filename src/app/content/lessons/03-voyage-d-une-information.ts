import { Lesson } from '../../core/models/content.model';

export const VOYAGE_D_UNE_INFORMATION: Lesson = {
  id: 'voyage-d-une-information',
  title: 'Comment une information voyage sur Internet',
  level: 'debutant',
  durationMinutes: 25,
  prerequisiteIds: ['ordinateur-et-fichiers'],
  skillIds: ['expliquer-le-reseau'],
  objectives: [
    { id: 'o1', text: 'Décrire le rôle d’une adresse IP et reconnaître une adresse IPv4 valable' },
    { id: 'o2', text: 'Expliquer comment le DNS traduit un nom de domaine en adresse IP' },
    { id: 'o3', text: 'Ordonner les étapes du trajet d’une page web, de l’ordinateur au serveur' },
  ],
  explanation: [
    { kind: 'heading', text: 'Un réseau, des adresses' },
    {
      kind: 'paragraph',
      text: 'Un réseau relie des appareils pour qu’ils échangent des informations. Internet est un réseau de réseaux : des milliards d’appareils reliés par des câbles, des fibres optiques et des ondes.',
    },
    {
      kind: 'paragraph',
      text: 'Pour qu’un message arrive au bon endroit, chaque appareil connecté reçoit une adresse IP, un peu comme l’adresse postale d’une maison. Une adresse IPv4 s’écrit avec quatre nombres de 0 à 255 séparés par des points, par exemple 203.0.113.10.',
    },
    {
      kind: 'paragraph',
      text: 'À la maison, votre box attribue à chaque appareil une adresse privée, comme 192.168.1.23, valable seulement sur votre réseau local. Vers Internet, tous ces appareils sortent par l’adresse publique de la box.',
    },
    {
      kind: 'callout',
      tone: 'info',
      text: 'Les adresses publiques de cette leçon (203.0.113.x) et le nom example.com sont réservés aux exemples : ils ne désignent aucun vrai appareil ni aucun vrai site.',
    },
    { kind: 'heading', text: 'Le DNS, l’annuaire d’Internet' },
    {
      kind: 'paragraph',
      text: 'Retenir des suites de nombres n’est pas pratique. On utilise donc des noms de domaine, comme example.com. Quand vous tapez un nom dans votre navigateur, votre ordinateur demande d’abord à un serveur DNS l’adresse IP qui correspond à ce nom, comme on cherche un numéro dans un annuaire.',
    },
    { kind: 'heading', text: 'Des paquets qui voyagent de routeur en routeur' },
    {
      kind: 'paragraph',
      text: 'Les informations ne voyagent pas d’un seul bloc : elles sont découpées en petits morceaux appelés paquets. Chaque paquet porte l’adresse de départ et celle d’arrivée. Votre box, qui contient un routeur, l’envoie vers votre fournisseur d’accès ; puis des routeurs successifs le font avancer, chacun choisissant la prochaine étape, jusqu’au serveur. Le serveur répond de la même façon, et votre appareil réassemble les paquets.',
    },
    {
      kind: 'list',
      items: [
        '1. Vous tapez www.example.com dans le navigateur.',
        '2. L’ordinateur demande au DNS l’adresse IP de ce nom.',
        '3. Le DNS répond, par exemple 203.0.113.10.',
        '4. L’ordinateur envoie des paquets vers 203.0.113.10, via la box et les routeurs d’Internet.',
        '5. Le serveur renvoie la page en paquets ; le navigateur les réassemble et l’affiche.',
      ],
    },
    {
      kind: 'callout',
      tone: 'warning',
      text: 'Pourquoi c’est important en cybersécurité ? Un attaquant qui falsifie une réponse DNS peut vous envoyer vers un faux site qui porte le bon nom. C’est une des raisons d’utiliser HTTPS : le navigateur vérifie alors que le site présente un certificat valable pour ce nom, et chiffre les échanges.',
    },
  ],
  glossary: [
    {
      term: 'Réseau',
      definition: 'Ensemble d’appareils reliés pour échanger des informations.',
      example: 'Les ordinateurs et téléphones connectés à votre box forment un réseau local.',
    },
    {
      term: 'Adresse IP',
      definition:
        'Numéro qui identifie un appareil sur un réseau, pour que les messages lui parviennent.',
      example: '203.0.113.10 (une adresse réservée aux exemples).',
    },
    {
      term: 'Nom de domaine',
      definition: 'Nom facile à retenir qui désigne un site ou un service sur Internet.',
      example: 'example.com',
    },
    {
      term: 'DNS',
      definition: 'Service qui traduit un nom de domaine en adresse IP, comme un annuaire.',
      example: 'Le DNS répond que www.example.com correspond à 203.0.113.10.',
    },
    {
      term: 'Paquet',
      definition:
        'Petit morceau d’information qui voyage seul sur le réseau, avec une adresse de départ et d’arrivée.',
      example: 'Une photo envoyée par message part en centaines de paquets.',
    },
    {
      term: 'Routeur',
      definition:
        'Appareil qui fait passer les paquets d’un réseau à un autre en choisissant la suite du trajet.',
      example: 'Votre box contient un routeur qui relie votre réseau domestique à Internet.',
    },
    {
      term: 'HTTPS',
      definition:
        'Version sécurisée du protocole du Web : les échanges sont chiffrés et le site prouve son identité par un certificat.',
      example: 'Une adresse qui commence par https:// et un cadenas dans la barre du navigateur.',
    },
  ],
  example: {
    title: 'Lire un article en ligne',
    text: 'Inès tape www.example.com sur son téléphone, connecté au Wi-Fi de la maison. Le téléphone interroge le DNS, qui répond 203.0.113.10. Les paquets partent du téléphone (adresse privée 192.168.1.23), passent par la box, traversent plusieurs routeurs de fournisseurs d’accès et arrivent au serveur. Le serveur renvoie l’article en paquets ; le téléphone les remet dans l’ordre et affiche la page, en moins d’une seconde.',
  },
  animation: {
    id: 'trajet-paquet',
    title: 'Le trajet d’un paquet',
    textAlternative:
      'Étape 1 : l’ordinateur demande au serveur DNS l’adresse de www.example.com. Étape 2 : le DNS répond 203.0.113.10. Étape 3 : un paquet part de l’ordinateur vers la box. Étape 4 : la box le transmet au routeur du fournisseur d’accès. Étape 5 : plusieurs routeurs d’Internet le font avancer. Étape 6 : le paquet atteint le serveur 203.0.113.10. Étape 7 : la réponse revient par le même mécanisme.',
  },
  demonstration: {
    id: 'anatomie-paquet',
    title: 'Ce que contient un paquet',
    textAlternative:
      'Schéma d’un paquet en deux parties. Les en-têtes : l’adresse de départ, l’adresse d’arrivée (203.0.113.10) et un numéro d’ordre pour remettre les morceaux dans l’ordre. Les données : un morceau de la page demandée.',
  },
  guidedExercise: {
    intro: 'Vous voulez afficher le site www.example.com. Suivez son trajet en trois questions.',
    steps: [
      {
        question: {
          id: 'g1',
          objectiveId: 'o2',
          type: 'single',
          difficulty: 1,
          prompt:
            'Avant d’envoyer quoi que ce soit au site www.example.com, que doit obtenir votre ordinateur ?',
          explanation:
            'Les paquets voyagent avec des adresses IP : il faut d’abord demander au DNS l’adresse du site.',
          options: [
            {
              id: 'a',
              label: 'Son adresse IP, auprès du DNS',
              correct: true,
              feedback: 'Exact : le DNS joue le rôle d’annuaire.',
            },
            {
              id: 'b',
              label: 'Le mot de passe du site',
              correct: false,
              feedback: 'Un site public n’a pas besoin de mot de passe pour être affiché.',
            },
            {
              id: 'c',
              label: 'La liste de tous les routeurs du trajet',
              correct: false,
              feedback:
                'Chaque routeur choisit lui-même la suite : l’ordinateur n’a pas besoin de connaître le trajet.',
            },
          ],
        },
        hints: [
          'Les paquets voyagent avec des adresses IP, pas avec des noms.',
          'Quel service joue le rôle d’annuaire ?',
        ],
      },
      {
        question: {
          id: 'g2',
          objectiveId: 'o1',
          type: 'true-false',
          difficulty: 1,
          prompt:
            'Une adresse IPv4 comme 203.0.113.10 est composée de quatre nombres compris entre 0 et 255.',
          explanation: 'Vrai : quatre nombres de 0 à 255, séparés par des points.',
          answer: true,
        },
        hints: ['Comptez les nombres séparés par des points.'],
      },
      {
        question: {
          id: 'g3',
          objectiveId: 'o3',
          type: 'single',
          difficulty: 2,
          prompt: 'Qui choisit le chemin suivi par un paquet sur Internet ?',
          explanation:
            'Chaque routeur décide de la prochaine étape, comme un aiguilleur, jusqu’à la destination.',
          options: [
            {
              id: 'a',
              label: 'Chaque routeur, étape par étape',
              correct: true,
              feedback: 'Exact.',
            },
            {
              id: 'b',
              label: 'L’ordinateur de départ, à l’avance',
              correct: false,
              feedback: 'L’ordinateur ne connaît que l’adresse de destination, pas le trajet.',
            },
            {
              id: 'c',
              label: 'Le serveur DNS',
              correct: false,
              feedback: 'Le DNS donne une adresse, il ne transporte pas les paquets.',
            },
          ],
        },
        hints: ['Un routeur décide de la prochaine étape, comme un aiguilleur.'],
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
        prompt: 'À quoi sert une adresse IP ?',
        explanation:
          'Elle identifie un appareil sur un réseau, pour que les paquets lui parviennent.',
        options: [
          {
            id: 'a',
            label: 'À identifier un appareil pour lui faire parvenir des informations',
            correct: true,
            feedback: 'Exact.',
          },
          {
            id: 'b',
            label: 'À protéger un appareil des virus',
            correct: false,
            feedback: 'Une adresse IP ne protège de rien : elle sert à acheminer.',
          },
          {
            id: 'c',
            label: 'À donner un nom facile à retenir à un site',
            correct: false,
            feedback: 'C’est le rôle du nom de domaine.',
          },
        ],
      },
      {
        id: 'q2',
        objectiveId: 'o1',
        type: 'single',
        difficulty: 2,
        prompt: 'Laquelle de ces adresses IPv4 n’est pas valable ?',
        explanation: 'Chacun des quatre nombres d’une adresse IPv4 va de 0 à 255.',
        options: [
          { id: 'a', label: '203.0.113.300', correct: true, feedback: 'Exact : 300 dépasse 255.' },
          {
            id: 'b',
            label: '192.0.2.15',
            correct: false,
            feedback: 'Elle est valable : quatre nombres entre 0 et 255.',
          },
          {
            id: 'c',
            label: '198.51.100.7',
            correct: false,
            feedback: 'Elle est valable : quatre nombres entre 0 et 255.',
          },
        ],
      },
      {
        id: 'q3',
        objectiveId: 'o1',
        type: 'true-false',
        difficulty: 1,
        prompt:
          'Chez vous, la box attribue aux appareils des adresses privées, valables seulement sur votre réseau local.',
        explanation:
          'Vrai : des adresses comme 192.168.1.23 ne servent qu’à l’intérieur de la maison.',
        answer: true,
      },
      {
        id: 'q4',
        objectiveId: 'o2',
        type: 'single',
        difficulty: 1,
        prompt: 'Que fait un serveur DNS ?',
        explanation: 'Le DNS traduit un nom de domaine en adresse IP, comme un annuaire.',
        options: [
          {
            id: 'a',
            label: 'Il traduit un nom de domaine en adresse IP',
            correct: true,
            feedback: 'Exact.',
          },
          {
            id: 'b',
            label: 'Il stocke les pages des sites',
            correct: false,
            feedback: 'C’est le rôle du serveur web.',
          },
          {
            id: 'c',
            label: 'Il chiffre vos communications',
            correct: false,
            feedback: 'Le chiffrement relève de HTTPS.',
          },
        ],
      },
      {
        id: 'q5',
        objectiveId: 'o2',
        type: 'single',
        difficulty: 3,
        prompt:
          'D’après cet échange, à quelle adresse le navigateur enverra-t-il ses paquets pour obtenir la page ?',
        context: {
          kind: 'log',
          text: 'requête DNS : www.example.com ?\nréponse     : www.example.com → 203.0.113.10',
        },
        explanation:
          'Le DNS a fourni l’adresse ; la page est ensuite demandée directement au serveur 203.0.113.10.',
        options: [
          {
            id: 'a',
            label: '203.0.113.10',
            correct: true,
            feedback: 'Exact : c’est l’adresse du serveur du site.',
          },
          {
            id: 'b',
            label: 'Au serveur DNS',
            correct: false,
            feedback: 'Le DNS a seulement donné l’adresse : il ne fournit pas la page.',
          },
          {
            id: 'c',
            label: 'À « www.example.com », sans adresse',
            correct: false,
            feedback: 'Les paquets voyagent toujours avec une adresse IP.',
          },
        ],
      },
      {
        id: 'q6',
        objectiveId: 'o2',
        type: 'true-false',
        difficulty: 2,
        prompt:
          'Avec une réponse DNS falsifiée, on peut être envoyé vers un faux site alors que la barre d’adresse affiche le bon nom.',
        explanation:
          'Vrai. C’est pourquoi HTTPS compte : le navigateur vérifie le certificat du site, ce qui permet de détecter la plupart de ces détournements.',
        answer: true,
      },
      {
        id: 'q7',
        objectiveId: 'o3',
        type: 'ordering',
        difficulty: 2,
        prompt: 'Classez les étapes de l’affichage d’une page web.',
        explanation:
          'Le nom est d’abord traduit par le DNS ; les paquets voyagent ensuite jusqu’au serveur, qui renvoie la page.',
        items: [
          { id: 'a', label: 'Vous tapez www.example.com' },
          { id: 'b', label: 'L’ordinateur demande l’adresse IP au DNS' },
          { id: 'c', label: 'Les paquets traversent la box et les routeurs' },
          { id: 'd', label: 'Le serveur renvoie la page' },
          { id: 'e', label: 'Le navigateur réassemble et affiche la page' },
        ],
      },
      {
        id: 'q8',
        objectiveId: 'o3',
        type: 'matching',
        difficulty: 2,
        prompt: 'Associez chaque élément à son rôle dans le trajet.',
        explanation:
          'Chacun a sa place : l’annuaire, la porte de sortie de la maison, les aiguilleurs, et le site lui-même.',
        pairs: [
          { id: 'a', left: 'DNS', right: 'Donne l’adresse IP d’un nom de domaine' },
          { id: 'b', left: 'Box', right: 'Relie le réseau de la maison à Internet' },
          { id: 'c', left: 'Routeur', right: 'Choisit la prochaine étape d’un paquet' },
          { id: 'd', left: 'Serveur', right: 'Fournit la page demandée' },
        ],
      },
      {
        id: 'q9',
        objectiveId: 'o3',
        type: 'single',
        difficulty: 2,
        prompt: 'Pourquoi les informations sont-elles découpées en paquets ?',
        explanation:
          'De petits morceaux circulent plus facilement, peuvent prendre des chemins différents et sont réassemblés à l’arrivée.',
        options: [
          {
            id: 'a',
            label: 'Pour circuler plus facilement, puis être réassemblées à l’arrivée',
            correct: true,
            feedback: 'Exact.',
          },
          {
            id: 'b',
            label: 'Pour être chiffrées automatiquement',
            correct: false,
            feedback: 'Le découpage ne protège pas le contenu : c’est le rôle du chiffrement.',
          },
          {
            id: 'c',
            label: 'Pour tenir dans la mémoire du DNS',
            correct: false,
            feedback: 'Le DNS ne transporte pas les données.',
          },
        ],
      },
      {
        id: 'q10',
        objectiveId: 'o3',
        type: 'true-false',
        difficulty: 1,
        prompt:
          'La réponse du serveur revient vers votre appareil sous forme de paquets, elle aussi.',
        explanation: 'Vrai : le mécanisme est le même dans les deux sens.',
        answer: true,
      },
    ],
  },
  summary: [
    'Chaque appareil connecté a une adresse IP, comme une adresse postale.',
    'Le DNS traduit un nom de domaine en adresse IP.',
    'Les informations voyagent en paquets, de routeur en routeur, puis sont réassemblées.',
    'Un DNS falsifié peut mener vers un faux site : HTTPS et son certificat aident à le détecter.',
  ],
};
