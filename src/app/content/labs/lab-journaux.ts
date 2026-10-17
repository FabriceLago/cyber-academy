import { LogEntry, LogsLab } from '../../core/models/content.model';

/**
 * Journaux fictifs du VPN et du serveur de fichiers de Société Exemple. Adresses IP réservées à
 * la documentation (RFC 5737 : 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24), comptes inventés.
 */
const ATTACKER = '203.0.113.77';

const line = (
  time: string,
  host: string,
  event: string,
  account: string,
  ip: string,
  detail: string,
): LogEntry => ({ time, host, event, account, ip, detail });

const BRUTE_FORCE: LogEntry[] = [
  '02:13:05',
  '02:13:13',
  '02:13:21',
  '02:13:29',
  '02:13:38',
  '02:13:46',
  '02:13:55',
  '02:14:03',
  '02:14:12',
  '02:14:20',
  '02:14:31',
  '02:14:41',
].map((time) =>
  line(
    `2026-10-14 ${time}`,
    'vpn-01',
    'Échec de connexion',
    'c.martin',
    ATTACKER,
    'Mot de passe incorrect',
  ),
);

export const LOGS_LAB: LogsLab = {
  id: 'lab-journaux',
  kind: 'logs',
  title: 'Analyser des journaux d’authentification',
  skillIds: ['analyser-des-journaux', 'trier-des-alertes'],
  scenario:
    'Lundi 14 octobre, 8 h 30. L’outil de surveillance de Société Exemple a levé une alerte : « Nombreux échecs de connexion sur le VPN cette nuit ». Vous êtes analyste SOC de niveau 1 : examinez les journaux du VPN et du serveur de fichiers, puis qualifiez l’alerte.',
  context:
    'Alerte n° 2026-1014-03, gravité initiale « moyenne ». Les journaux couvrent la soirée du 13 et la nuit du 13 au 14 octobre. Utilisez les filtres pour isoler les événements utiles, puis répondez aux six questions de l’enquête.',
  objectives: [
    'Filtrer des journaux par type d’événement et par adresse IP',
    'Distinguer une faute de frappe isolée d’une attaque par force brute',
    'Reconstituer ce qu’un attaquant a fait après s’être connecté',
    'Qualifier l’alerte et proposer une action prioritaire',
  ],
  hints: [
    'Filtrez sur l’événement « Échec de connexion » : une adresse IP revient beaucoup plus que les autres.',
    'Filtrez ensuite sur cette adresse IP : que se passe-t-il juste après la série d’échecs ?',
    'Regardez ce que fait le compte sur le serveur de fichiers après la connexion réussie, puis demandez-vous si l’attaque a réussi.',
  ],
  debrief:
    'Vous venez de mener un triage complet : quinze échecs en deux minutes depuis une même adresse, suivis d’une connexion réussie sans double authentification, puis l’export de 48 fichiers. C’est un vrai positif, grave, à escalader sans attendre. Les échecs isolés de l.bernard et de p.durand, suivis d’une connexion validée par code, étaient de simples fautes de frappe : les reconnaître évite de noyer l’équipe sous de fausses alertes. En situation réelle, un SIEM rassemble ces journaux et aide à les relier, et votre note d’escalade (quoi, quand, qui, quels indicateurs, quelle gravité, quelles actions) compte autant que la découverte elle-même.',
  entries: [
    line(
      '2026-10-13 17:30:12',
      'vpn-01',
      'Connexion réussie',
      'c.martin',
      '192.0.2.15',
      'Mot de passe correct (double authentification non activée pour ce compte)',
    ),
    line(
      '2026-10-13 18:02:11',
      'vpn-01',
      'Connexion réussie',
      'l.bernard',
      '198.51.100.23',
      'Mot de passe et code de double authentification corrects',
    ),
    line(
      '2026-10-13 18:10:47',
      'srv-fichiers',
      'Ouverture de dossier',
      'l.bernard',
      '198.51.100.23',
      'Dossier Projets/Salon2026',
    ),
    line(
      '2026-10-13 18:41:03',
      'vpn-01',
      'Déconnexion',
      'c.martin',
      '192.0.2.15',
      'Session fermée par l’utilisateur',
    ),
    line(
      '2026-10-13 18:47:30',
      'vpn-01',
      'Déconnexion',
      'l.bernard',
      '198.51.100.23',
      'Session fermée par l’utilisateur',
    ),
    line(
      '2026-10-13 21:15:02',
      'vpn-01',
      'Échec de connexion',
      'p.durand',
      '198.51.100.61',
      'Mot de passe incorrect',
    ),
    line(
      '2026-10-13 21:15:40',
      'vpn-01',
      'Connexion réussie',
      'p.durand',
      '198.51.100.61',
      'Mot de passe et code de double authentification corrects',
    ),
    line(
      '2026-10-13 22:03:12',
      'vpn-01',
      'Déconnexion',
      'p.durand',
      '198.51.100.61',
      'Session fermée par l’utilisateur',
    ),
    line(
      '2026-10-14 02:12:41',
      'vpn-01',
      'Échec de connexion',
      'admin',
      ATTACKER,
      'Compte inconnu',
    ),
    line('2026-10-14 02:12:49', 'vpn-01', 'Échec de connexion', 'test', ATTACKER, 'Compte inconnu'),
    line(
      '2026-10-14 02:12:57',
      'vpn-01',
      'Échec de connexion',
      'administrateur',
      ATTACKER,
      'Compte inconnu',
    ),
    ...BRUTE_FORCE,
    line(
      '2026-10-14 02:14:52',
      'vpn-01',
      'Connexion réussie',
      'c.martin',
      ATTACKER,
      'Mot de passe correct (double authentification non activée pour ce compte)',
    ),
    line(
      '2026-10-14 02:16:10',
      'srv-fichiers',
      'Ouverture de dossier',
      'c.martin',
      ATTACKER,
      'Dossier Comptabilité/Factures',
    ),
    line(
      '2026-10-14 02:17:33',
      'srv-fichiers',
      'Export de fichiers',
      'c.martin',
      ATTACKER,
      'Téléchargement de 48 fichiers (312 Mo)',
    ),
    line('2026-10-14 02:21:05', 'vpn-01', 'Déconnexion', 'c.martin', ATTACKER, 'Session fermée'),
    line(
      '2026-10-14 07:58:20',
      'vpn-01',
      'Connexion réussie',
      'c.martin',
      '192.0.2.15',
      'Mot de passe correct (double authentification non activée pour ce compte)',
    ),
    line(
      '2026-10-14 08:05:44',
      'vpn-01',
      'Échec de connexion',
      'l.bernard',
      '198.51.100.23',
      'Mot de passe incorrect',
    ),
    line(
      '2026-10-14 08:06:02',
      'vpn-01',
      'Connexion réussie',
      'l.bernard',
      '198.51.100.23',
      'Mot de passe et code de double authentification corrects',
    ),
  ],
  questions: [
    {
      id: 'ip',
      prompt: 'Quelle adresse IP est à l’origine de la série d’échecs de connexion ?',
      options: ['198.51.100.23', '198.51.100.61', '192.0.2.15', ATTACKER],
      answer: ATTACKER,
      explanation:
        'Quinze échecs en deux minutes depuis 203.0.113.77, sur plusieurs comptes dont trois qui n’existent pas : c’est une attaque par force brute. Les échecs isolés de l.bernard et de p.durand, suivis d’une connexion validée par code, sont des fautes de frappe.',
    },
    {
      id: 'compte',
      prompt: 'Quel compte a été compromis ?',
      options: ['admin', 'c.martin', 'l.bernard', 'p.durand'],
      answer: 'c.martin',
      explanation:
        'Après douze échecs sur c.martin, une connexion réussit à 2 h 14 depuis la même adresse : le mot de passe a été trouvé. Le compte « admin » n’existe pas : ses tentatives ont échoué.',
    },
    {
      id: 'heure',
      prompt: 'À quelle heure l’attaquant a-t-il obtenu l’accès ?',
      options: ['02:12:41', '02:14:52', '02:17:33', '07:58:20'],
      answer: '02:14:52',
      explanation:
        '2 h 14 min 52 s : première connexion réussie depuis 203.0.113.77. À 7 h 58, c’est la vraie utilisatrice, depuis son adresse habituelle (192.0.2.15).',
    },
    {
      id: 'actions',
      prompt: 'Qu’a fait l’attaquant une fois connecté ?',
      options: [
        'Rien de visible dans les journaux',
        'Il a téléchargé 48 fichiers du dossier Comptabilité/Factures',
        'Il a changé le mot de passe du compte',
        'Il s’est déconnecté aussitôt',
      ],
      answer: 'Il a téléchargé 48 fichiers du dossier Comptabilité/Factures',
      explanation:
        'Le serveur de fichiers montre l’ouverture du dossier Comptabilité/Factures puis l’export de 48 fichiers (312 Mo) : des données ont probablement été volées.',
    },
    {
      id: 'verdict',
      prompt: 'Comment qualifier l’alerte ?',
      options: [
        'Faux positif : des fautes de frappe',
        'Vrai positif, sans conséquence : l’attaque a échoué',
        'Vrai positif : une intrusion a réussi et des données sont sorties',
        'Impossible à dire avec ces journaux',
      ],
      answer: 'Vrai positif : une intrusion a réussi et des données sont sorties',
      explanation:
        'Les faits concordent : force brute, connexion réussie depuis l’adresse de l’attaquant, export de fichiers. La gravité monte à « élevée ».',
    },
    {
      id: 'action',
      prompt: 'Quelle action proposer en priorité ?',
      options: [
        'Clore l’alerte : la vraie utilisatrice s’est reconnectée à 7 h 58',
        'Escalader au niveau 2, bloquer 203.0.113.77, fermer les sessions de c.martin, réinitialiser son mot de passe et activer la double authentification',
        'Écrire à c.martin et attendre sa réponse avant d’agir',
        'Supprimer les journaux de la nuit pour libérer de la place',
      ],
      answer:
        'Escalader au niveau 2, bloquer 203.0.113.77, fermer les sessions de c.martin, réinitialiser son mot de passe et activer la double authentification',
      explanation:
        'Un incident confirmé avec sortie de données s’escalade immédiatement, avec les mesures qui coupent l’accès de l’attaquant. Les journaux sont des preuves : on ne les supprime jamais.',
    },
  ],
};
