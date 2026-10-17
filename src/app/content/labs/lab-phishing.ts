import { PhishingLab } from '../../core/models/content.model';

/** Personnes, organisations, adresses et messages fictifs (domaines réservés .example). */
export const PHISHING_LAB: PhishingLab = {
  id: 'lab-phishing',
  kind: 'phishing',
  title: 'Démasquer un e-mail d’hameçonnage',
  skillIds: ['detecter-l-hameconnage'],
  scenario:
    'Lundi matin, votre boîte de réception contient cinq messages. Certains sont des pièges, d’autres sont parfaitement normaux. Analysez-les un par un : signalez les éléments suspects, puis donnez votre verdict.',
  context:
    'Vous êtes Camille Martin, assistante chez Société Exemple : les adresses de vos collègues se terminent toutes par @societe.example. Votre banque, la Banque Exemple, utilise uniquement le domaine banque-exemple.example. Vous n’attendez aucun document particulier aujourd’hui.',
  objectives: [
    'Comparer le nom affiché d’un expéditeur avec son adresse réelle',
    'Lire la vraie destination d’un lien avant de cliquer',
    'Repérer l’urgence, les demandes inhabituelles et les pièces jointes dangereuses',
    'Reconnaître aussi un message légitime',
  ],
  hints: [
    'Affichez l’adresse réelle de chaque expéditeur : le domaine, après le @, correspond-il à l’organisme annoncé ?',
    'Vérifiez la destination des liens : le domaine réel est la fin du nom, juste avant le premier « / » qui suit https://.',
    'Méfiez-vous de l’urgence, du secret, de toute demande de mot de passe, de code ou de paiement, et des fichiers dont le nom se termine par .exe.',
  ],
  debrief:
    'Un hameçonnage se trahit rarement par un seul détail : c’est l’accumulation d’indices qui doit alerter. Les réflexes à garder : afficher l’adresse réelle de l’expéditeur, lire le domaine des liens sans cliquer, se méfier de l’urgence et des demandes inhabituelles, et vérifier par un autre moyen (téléphone, application officielle) au moindre doute. Enfin, un message normal reste normal : l’objectif est de vérifier, pas de tout rejeter.',
  emails: [
    {
      id: 'banque-urgent',
      fromName: 'Service Client Banque Exemple',
      fromAddress: 'alerte@banque-secure.example',
      subject: 'URGENT : votre compte sera suspendu dans 24 h',
      receivedAt: 'Aujourd’hui, 07:42',
      body: [
        'Cher client,',
        'Nous avons détecté une activité inhabituelle sur votre compte. Sans action de votre part, il sera suspendu dans 24 heures.',
        'Pour le débloquer, confirmez votre identifiant, votre mot de passe et le code que vous allez recevoir par SMS.',
      ],
      link: {
        label: 'Débloquer mon compte',
        url: 'https://banque-exemple.example.connexion-securisee.example/login',
      },
      phishing: true,
      zones: {
        expediteur: {
          suspicious: true,
          explanation:
            'Le nom affiché imite la banque, mais l’adresse se termine par banque-secure.example, qui n’est pas le domaine de la banque (banque-exemple.example).',
        },
        objet: {
          suspicious: true,
          explanation:
            'L’urgence et la menace (« suspendu dans 24 h ») poussent à agir sans réfléchir.',
        },
        demande: {
          suspicious: true,
          explanation: 'Une banque ne demande jamais votre mot de passe ni un code reçu par SMS.',
        },
        lien: {
          suspicious: true,
          explanation:
            'Le domaine réel est connexion-securisee.example (la fin, avant le premier « / ») : « banque-exemple.example » n’est qu’un morceau placé au début pour tromper.',
        },
      },
      verdict:
        'Hameçonnage : quatre indices concordants. Bon réflexe : ne pas cliquer, signaler le message, et consulter son compte depuis l’application officielle de la banque.',
    },
    {
      id: 'rh-conges',
      fromName: 'Service RH',
      fromAddress: 'rh@societe.example',
      subject: 'Planning des congés de décembre',
      receivedAt: 'Hier, 16:05',
      body: [
        'Bonjour Camille,',
        'Le planning des congés de décembre est disponible sur l’intranet. Merci d’y indiquer vos dates avant le 30 novembre.',
        'Bonne journée, l’équipe RH',
      ],
      link: { label: 'Ouvrir le planning', url: 'https://intranet.societe.example/conges' },
      phishing: false,
      zones: {
        expediteur: {
          suspicious: false,
          explanation: 'L’adresse se termine par @societe.example, le domaine de l’entreprise.',
        },
        objet: { suspicious: false, explanation: 'Un objet informatif, sans urgence ni menace.' },
        demande: {
          suspicious: false,
          explanation:
            'On vous demande vos dates de congés, pas un mot de passe ni un paiement, avec un délai raisonnable.',
        },
        lien: {
          suspicious: false,
          explanation:
            'Le domaine réel est intranet.societe.example : il se termine bien par societe.example.',
        },
      },
      verdict:
        'Message légitime : l’expéditeur et le lien appartiennent au domaine de l’entreprise, et rien de sensible n’est demandé.',
    },
    {
      id: 'faux-directeur',
      fromName: 'Paul Durand (Directeur général)',
      fromAddress: 'paul.durand.direction@messagerie-gratuite.example',
      subject: 'Urgent et confidentiel',
      receivedAt: 'Aujourd’hui, 11:18',
      body: [
        'Camille,',
        'Je suis en réunion et je ne peux pas téléphoner. J’ai besoin que vous achetiez tout de suite cinq cartes cadeaux de 100 € pour un client important.',
        'Envoyez-moi les codes inscrits au dos des cartes en réponse à ce message. Merci de n’en parler à personne, je compte sur vous.',
      ],
      phishing: true,
      zones: {
        expediteur: {
          suspicious: true,
          explanation:
            'Le nom est celui du directeur, mais l’adresse vient d’une messagerie gratuite, pas de @societe.example.',
        },
        objet: {
          suspicious: true,
          explanation: 'L’urgence et le secret servent à vous empêcher de vérifier.',
        },
        demande: {
          suspicious: true,
          explanation:
            'Des cartes cadeaux à acheter en urgence et en secret : c’est la « fraude au président », une arnaque très répandue.',
        },
      },
      verdict:
        'Hameçonnage : l’attaquant se fait passer pour un dirigeant. Bon réflexe : ne pas répondre, appeler le directeur à son numéro habituel, et signaler le message au service informatique.',
    },
    {
      id: 'banque-releve',
      fromName: 'Banque Exemple',
      fromAddress: 'information@banque-exemple.example',
      subject: 'Votre relevé de compte d’octobre est disponible',
      receivedAt: 'Aujourd’hui, 09:03',
      body: [
        'Bonjour Madame Martin,',
        'Votre relevé de compte d’octobre est disponible dans votre espace client.',
        'Pour le consulter, connectez-vous comme d’habitude. Nous ne vous demanderons jamais votre mot de passe par e-mail.',
      ],
      link: {
        label: 'Accéder à mon espace client',
        url: 'https://www.banque-exemple.example/espace-client',
      },
      phishing: false,
      zones: {
        expediteur: {
          suspicious: false,
          explanation: 'Le domaine est bien banque-exemple.example, celui de votre banque.',
        },
        objet: { suspicious: false, explanation: 'Une information, sans urgence ni menace.' },
        demande: {
          suspicious: false,
          explanation:
            'Rien n’est demandé : le message vous renvoie vers votre espace client habituel.',
        },
        lien: {
          suspicious: false,
          explanation: 'Le domaine réel est www.banque-exemple.example, le site de la banque.',
        },
      },
      verdict:
        'Message légitime. Même dans ce cas, le plus sûr reste d’ouvrir l’application de la banque plutôt que de cliquer sur un lien.',
    },
    {
      id: 'faux-collegue',
      fromName: 'Julie Bernard',
      fromAddress: 'julie.bernard.societe@boite-mail.example',
      subject: 'Compte rendu',
      receivedAt: 'Aujourd’hui, 14:30',
      body: [
        'Salut,',
        'Voici le document dont on a parlé. Ouvre-le vite, il me faut ton avis avant ce soir.',
      ],
      attachment: 'compte-rendu.pdf.exe',
      phishing: true,
      zones: {
        expediteur: {
          suspicious: true,
          explanation:
            'Julie travaille chez Société Exemple : sa vraie adresse se termine par @societe.example. Celle-ci vient d’une autre messagerie.',
        },
        objet: {
          suspicious: false,
          explanation:
            'L’objet est banal : les attaquants imitent les messages du quotidien. Ce n’est pas lui qui trahit le piège.',
        },
        demande: {
          suspicious: true,
          explanation:
            'Le message presse d’ouvrir un fichier sans dire de quoi il s’agit, alors que vous n’attendez aucun document.',
        },
        'piece-jointe': {
          suspicious: true,
          explanation:
            'compte-rendu.pdf.exe se termine par .exe : c’est un programme déguisé en document. L’ouvrir pourrait installer un logiciel malveillant.',
        },
      },
      verdict:
        'Hameçonnage : un faux collègue envoie un programme déguisé en PDF. Bon réflexe : ne pas ouvrir la pièce jointe, vérifier auprès de Julie par un autre moyen, et signaler le message.',
    },
  ],
};
