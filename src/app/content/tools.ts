// Outils du métier : des logiciels et services réels, libres ou gratuits, reliés aux leçons qui y
// préparent. Licences et systèmes vérifiés sur le site officiel de chaque outil (verifiedOn).
// Cyber Academy n'héberge ni ne relaie aucun téléchargement : chaque fiche renvoie au site officiel.

export type ToolDomain = 'reseau' | 'identite' | 'postes' | 'donnees' | 'liens' | 'soc' | 'web';

export const TOOL_DOMAINS: Readonly<Record<ToolDomain, { label: string; description: string }>> = {
  reseau: { label: 'Réseau', description: 'Observer les échanges et inventorier un réseau.' },
  identite: {
    label: 'Mots de passe et identité',
    description: 'Un mot de passe solide et différent pour chaque compte.',
  },
  postes: { label: 'Protection des postes', description: 'Repérer les logiciels malveillants.' },
  donnees: { label: 'Protection des données', description: 'Chiffrer et sauvegarder.' },
  liens: {
    label: 'Analyse de liens et de fichiers',
    description: 'Savoir où mène un lien ou ce que contient un fichier, sans risque.',
  },
  soc: { label: 'Détection et SOC', description: 'Collecter les journaux, détecter, enquêter.' },
  web: { label: 'Sécurité web et tests', description: 'Tester une application web autorisée.' },
};

export interface ToolEntry {
  /** Adresse de sa fiche : /outils/<id>. */
  readonly id: string;
  readonly name: string;
  readonly domain: ToolDomain;
  /** Licence telle que publiée par le projet. */
  readonly licence: string;
  /** Libre (code ouvert), gratuit mais non libre, ou service en ligne. */
  readonly kind: 'libre' | 'gratuit' | 'service';
  readonly platforms: string;
  /** Site officiel (https). */
  readonly website: string;
  /** Une phrase, pour la liste. */
  readonly summary: string;
  /** À quoi il sert, pour un débutant. */
  readonly purpose: string;
  /** Qui l'utilise. */
  readonly users: string;
  /** Leçons et laboratoires publiés qui y préparent. */
  readonly lessonIds: readonly string[];
  readonly labIds: readonly string[];
  /** Ce qui y préparera, quand ce n'est pas encore publié. */
  readonly upcoming?: string;
  /** Premier exercice, sur ses propres appareils. */
  readonly firstStep: string;
  /** Cadre légal ou précaution propre à l'outil. */
  readonly warning?: string;
  /** Date de la dernière vérification (AAAA-MM-JJ). */
  readonly verifiedOn: string;
}

const VERIFIED = '2026-10-30';
const AUTHORIZED_ONLY =
  'Ne testez jamais un réseau, un site ou une application sans l’autorisation écrite de son ' +
  'propriétaire : c’est le premier geste d’une attaque, et cela peut être poursuivi (articles ' +
  '323-1 et suivants du Code pénal).';

export const TOOLS: readonly ToolEntry[] = [
  {
    id: 'wireshark',
    name: 'Wireshark',
    domain: 'reseau',
    licence: 'GPL v2',
    kind: 'libre',
    platforms: 'Windows, macOS, Linux et d’autres systèmes Unix',
    website: 'https://www.wireshark.org/',
    summary: 'Observer le trafic réseau, paquet par paquet.',
    purpose:
      'Wireshark enregistre et affiche les échanges qui passent par une carte réseau : qui parle à ' +
      'qui, avec quel protocole, et ce que contient chaque paquet. C’est l’outil de référence pour ' +
      'comprendre un réseau ou reconstituer un incident.',
    users: 'Administrateurs réseau, analystes SOC, analystes en réponse à incident.',
    lessonIds: ['voyage-d-une-information'],
    labIds: [],
    firstStep:
      'Sur votre ordinateur, lancez une capture, ouvrez un site web, puis arrêtez-la. Tapez « dns » ' +
      'dans le filtre : vous retrouvez la question posée pour trouver l’adresse du site, et sa ' +
      'réponse, comme dans la leçon.',
    warning:
      'Écouter les communications des autres sans leur accord est interdit : limitez-vous à votre ' +
      'ordinateur et à votre propre réseau.',
    verifiedOn: VERIFIED,
  },
  {
    id: 'nmap',
    name: 'Nmap',
    domain: 'reseau',
    licence: 'Nmap Public Source License (gratuite, non certifiée par l’Open Source Initiative)',
    kind: 'gratuit',
    platforms: 'Windows, macOS, Linux, BSD',
    website: 'https://nmap.org/',
    summary: 'Inventorier les appareils et les services d’un réseau.',
    purpose:
      'Nmap interroge les machines d’un réseau pour savoir lesquelles répondent, quels services ' +
      'elles proposent (site web, partage de fichiers…) et dans quelle version. Les administrateurs ' +
      's’en servent pour faire l’inventaire de leur réseau, les testeurs d’intrusion pour préparer un ' +
      'audit autorisé.',
    users: 'Administrateurs réseau, pentesters, analystes vulnérabilités.',
    lessonIds: ['voyage-d-une-information'],
    labIds: [],
    upcoming: 'Niveau 2 : Réseaux informatiques (en préparation)',
    firstStep:
      'Scannez uniquement votre propre ordinateur (l’adresse 127.0.0.1) et cherchez à quoi sert ' +
      'chacun des services qu’il propose.',
    warning: AUTHORIZED_ONLY,
    verifiedOn: VERIFIED,
  },
  {
    id: 'bitwarden',
    name: 'Bitwarden',
    domain: 'identite',
    licence: 'GPL v3 (applications)',
    kind: 'libre',
    platforms: 'Navigateurs, Windows, macOS, Linux, Android, iOS, version web',
    website: 'https://bitwarden.com/',
    summary: 'Un gestionnaire de mots de passe, sur tous vos appareils.',
    purpose:
      'Bitwarden retient pour vous un mot de passe long et différent pour chaque compte, chiffré avec ' +
      'votre mot de passe principal, et le remplit à votre place. Il génère aussi des mots de passe ' +
      'solides.',
    users: 'Tout le monde, chez soi comme au travail.',
    lessonIds: ['securite-et-risques', 'hameconnage'],
    labIds: [],
    firstStep:
      'Créez un compte avec une longue phrase de passe que vous n’utilisez nulle part ailleurs, ' +
      'activez la double authentification, puis remplacez en premier le mot de passe de votre ' +
      'messagerie.',
    verifiedOn: VERIFIED,
  },
  {
    id: 'keepassxc',
    name: 'KeePassXC',
    domain: 'identite',
    licence: 'GPL v2 ou v3',
    kind: 'libre',
    platforms: 'Windows, macOS, Linux',
    website: 'https://keepassxc.org/',
    summary: 'Un gestionnaire de mots de passe hors ligne, dans un fichier chiffré.',
    purpose:
      'KeePassXC range vos mots de passe dans un fichier chiffré que vous gardez où vous voulez : rien ' +
      'n’est envoyé sur un serveur. En contrepartie, c’est à vous de sauvegarder ce fichier et de le ' +
      'copier sur vos autres appareils.',
    users:
      'Les personnes qui préfèrent garder leurs mots de passe chez elles, sans service en ligne.',
    lessonIds: ['securite-et-risques', 'mises-a-jour-et-sauvegardes'],
    labIds: [],
    firstStep:
      'Créez une base, ajoutez-y un premier compte, puis copiez le fichier sur une clé USB : c’est ' +
      'votre première sauvegarde (règle 3-2-1).',
    verifiedOn: VERIFIED,
  },
  {
    id: 'clamav',
    name: 'ClamAV',
    domain: 'postes',
    licence: 'GPL v2',
    kind: 'libre',
    platforms: 'Linux, macOS, FreeBSD, Windows',
    website: 'https://www.clamav.net/',
    summary: 'Un antivirus libre, surtout pour les serveurs et les messageries.',
    purpose:
      'ClamAV recherche les logiciels malveillants connus dans des fichiers. Maintenu par Cisco, il ' +
      'sert surtout sur les serveurs, par exemple pour analyser les pièces jointes avant qu’elles ' +
      'arrivent dans les boîtes de réception. Sur un ordinateur personnel, l’antivirus intégré au ' +
      'système reste la protection de base.',
    users: 'Administrateurs de serveurs et de messageries.',
    lessonIds: ['hameconnage', 'securite-et-risques'],
    labIds: [],
    firstStep:
      'Sur Linux, mettez à jour ses signatures (commande freshclam), puis analysez votre dossier ' +
      'Téléchargements (clamscan -r suivi du chemin du dossier).',
    verifiedOn: VERIFIED,
  },
  {
    id: 'veracrypt',
    name: 'VeraCrypt',
    domain: 'donnees',
    licence: 'Apache 2.0 et TrueCrypt License 3.0',
    kind: 'libre',
    platforms: 'Windows, macOS, Linux',
    website: 'https://veracrypt.io/',
    summary: 'Chiffrer un disque, une clé USB ou un « coffre » de fichiers.',
    purpose:
      'VeraCrypt crée des volumes chiffrés : sans le mot de passe, leur contenu est illisible, même si ' +
      'la clé USB ou l’ordinateur est perdu ou volé. C’est la confidentialité vue dans les leçons, ' +
      'appliquée aux données stockées.',
    users: 'Toute personne qui transporte des données sensibles, administrateurs.',
    lessonIds: ['securite-et-risques', 'mises-a-jour-et-sauvegardes'],
    labIds: [],
    firstStep:
      'Créez un petit conteneur chiffré (un fichier de quelques mégaoctets), montez-le, déposez-y un ' +
      'document, puis démontez-le : sans le mot de passe, le fichier est illisible.',
    warning:
      'Si vous oubliez le mot de passe, personne ne pourra récupérer les données : rangez-le dans ' +
      'votre gestionnaire de mots de passe.',
    verifiedOn: VERIFIED,
  },
  {
    id: 'restic',
    name: 'restic',
    domain: 'donnees',
    licence: 'BSD 2-Clause',
    kind: 'libre',
    platforms: 'Windows, macOS, Linux, BSD',
    website: 'https://restic.net/',
    summary: 'Des sauvegardes chiffrées, version par version, en ligne de commande.',
    purpose:
      'restic copie vos dossiers dans un dépôt de sauvegarde (disque externe, serveur, stockage en ' +
      'ligne), chiffré, et garde chaque version : on retrouve un fichier tel qu’il était avant une ' +
      'erreur ou un rançongiciel.',
    users: 'Administrateurs systèmes, et toute personne à l’aise avec le terminal.',
    lessonIds: ['mises-a-jour-et-sauvegardes', 'decouvrir-le-terminal'],
    labIds: ['lab-sauvegarde'],
    firstStep:
      'Créez un dépôt sur un disque externe (restic init), sauvegardez un dossier (restic backup), ' +
      'puis restaurez un fichier (restic restore) : une sauvegarde n’est fiable qu’une fois restaurée.',
    verifiedOn: VERIFIED,
  },
  {
    id: 'urlscan',
    name: 'urlscan.io',
    domain: 'liens',
    licence: 'Service en ligne gratuit, avec des offres payantes',
    kind: 'service',
    platforms: 'Navigateur web',
    website: 'https://urlscan.io/',
    summary: 'Voir où mène un lien suspect, sans l’ouvrir soi-même.',
    purpose:
      'urlscan.io visite pour vous l’adresse d’un lien suspect et montre une capture de la page, les ' +
      'domaines contactés et les redirections : on sait où mène le lien sans exposer son ordinateur.',
    users: 'Analystes SOC, équipes qui traitent les signalements d’hameçonnage.',
    lessonIds: ['hameconnage'],
    labIds: ['lab-phishing'],
    firstStep:
      'Analysez l’adresse d’un site que vous connaissez bien, puis comparez la capture et les ' +
      'domaines contactés avec ce que vous voyez dans votre navigateur.',
    warning:
      'Une analyse publique est visible par tout le monde et peut être indexée par les moteurs de ' +
      'recherche : choisissez la visibilité « Private » quand c’est possible, et n’envoyez jamais un ' +
      'lien qui contient des informations personnelles (lien de réinitialisation, adresse e-mail…).',
    verifiedOn: VERIFIED,
  },
  {
    id: 'virustotal',
    name: 'VirusTotal',
    domain: 'liens',
    licence: 'Service en ligne gratuit, avec des offres payantes',
    kind: 'service',
    platforms: 'Navigateur web',
    website: 'https://www.virustotal.com/',
    summary: 'Faire examiner un fichier ou un lien par des dizaines d’antivirus.',
    purpose:
      'VirusTotal soumet un fichier, un lien ou une empreinte à de nombreux moteurs d’analyse et ' +
      'regroupe leurs verdicts. Il aide à décider si une pièce jointe est déjà connue comme ' +
      'malveillante.',
    users: 'Analystes SOC, analystes en réponse à incident.',
    lessonIds: ['hameconnage', 'trier-une-alerte'],
    labIds: ['lab-phishing', 'lab-terminal'],
    firstStep:
      'Calculez l’empreinte d’un fichier (commande sha256sum du laboratoire du terminal) et ' +
      'cherchez-la, au lieu d’envoyer le fichier : si elle est connue, vous avez le verdict sans rien ' +
      'partager.',
    warning:
      'Ce que vous envoyez peut être partagé avec les partenaires antivirus et les clients payants de ' +
      'VirusTotal : n’envoyez jamais un document personnel ou d’entreprise, seulement son empreinte.',
    verifiedOn: VERIFIED,
  },
  {
    id: 'wazuh',
    name: 'Wazuh',
    domain: 'soc',
    licence: 'GPL v2 (moteur de détection : AGPL v3)',
    kind: 'libre',
    platforms: 'Serveur : Linux 64 bits ; agents : Windows, macOS, Linux et d’autres systèmes',
    website: 'https://wazuh.com/',
    summary: 'Une plateforme de détection libre : collecte et analyse des journaux.',
    purpose:
      'Wazuh rassemble les journaux des ordinateurs et serveurs d’une organisation, les compare à des ' +
      'règles de détection et lève des alertes : connexions échouées à répétition, fichier système ' +
      'modifié, logiciel vulnérable… C’est le travail du SOC vu dans les leçons, avec un vrai outil.',
    users: 'Analystes SOC, administrateurs systèmes.',
    lessonIds: ['soc-et-journaux', 'trier-une-alerte'],
    labIds: ['lab-journaux'],
    firstStep:
      'Installez-le dans une machine virtuelle Linux en suivant le guide de démarrage rapide ' +
      'officiel, ajoutez votre ordinateur comme agent, provoquez trois échecs de connexion, puis ' +
      'retrouvez l’alerte.',
    verifiedOn: VERIFIED,
  },
  {
    id: 'suricata',
    name: 'Suricata',
    domain: 'soc',
    licence: 'GPL v2',
    kind: 'libre',
    platforms: 'Linux ; Windows en compilant le code source',
    website: 'https://suricata.io/',
    summary: 'Détecter les attaques dans le trafic réseau.',
    purpose:
      'Suricata observe le trafic réseau et le compare à des milliers de règles qui décrivent des ' +
      'attaques connues. Il peut seulement alerter (détection d’intrusion) ou bloquer (prévention). ' +
      'Il est développé par l’Open Information Security Foundation et sa communauté.',
    users: 'Analystes SOC, ingénieurs sécurité réseau.',
    lessonIds: ['soc-et-journaux', 'voyage-d-une-information'],
    labIds: [],
    firstStep:
      'Plutôt que d’écouter un réseau, faites-lui lire une capture enregistrée avec Wireshark sur ' +
      'votre ordinateur, puis lisez les alertes produites.',
    verifiedOn: VERIFIED,
  },
  {
    id: 'cyberchef',
    name: 'CyberChef',
    domain: 'soc',
    licence: 'Apache 2.0',
    kind: 'libre',
    platforms: 'Navigateur web, rien à installer',
    website: 'https://gchq.github.io/CyberChef/',
    summary: 'Décoder, convertir et analyser des données dans le navigateur.',
    purpose:
      'CyberChef enchaîne des opérations sur un texte ou un fichier : décoder du Base64, convertir une ' +
      'date, extraire les adresses IP d’un journal, calculer une empreinte… Tout se passe dans votre ' +
      'navigateur. Il est publié par le GCHQ, le service britannique de renseignement électronique.',
    users: 'Analystes SOC, analystes en réponse à incident.',
    lessonIds: ['trier-une-alerte', 'soc-et-journaux'],
    labIds: ['lab-journaux'],
    firstStep:
      'Collez une ligne de journal du laboratoire « Analyser des journaux » et appliquez l’opération ' +
      '« Extract IP addresses » pour en sortir les adresses.',
    verifiedOn: VERIFIED,
  },
  {
    id: 'zap',
    name: 'ZAP (Zed Attack Proxy)',
    domain: 'web',
    licence: 'Apache 2.0',
    kind: 'libre',
    platforms: 'Windows, macOS, Linux',
    website: 'https://www.zaproxy.org/',
    summary: 'Tester la sécurité d’une application web, de façon libre.',
    purpose:
      'ZAP se place entre le navigateur et une application web pour observer et modifier les ' +
      'échanges, et cherche automatiquement des failles courantes. C’est un projet libre, soutenu par ' +
      'l’éditeur Checkmarx.',
    users: 'Développeurs, pentesters, analystes vulnérabilités.',
    lessonIds: [],
    labIds: [],
    upcoming: 'Niveau 6 : Sécurité web et applications (en préparation)',
    firstStep:
      'Entraînez-vous seulement sur une application volontairement vulnérable installée chez vous, ' +
      'comme OWASP Juice Shop, jamais sur un vrai site.',
    warning: AUTHORIZED_ONLY,
    verifiedOn: VERIFIED,
  },
  {
    id: 'burp-suite-community',
    name: 'Burp Suite Community',
    domain: 'web',
    licence: 'Licence propriétaire de PortSwigger, édition Community gratuite',
    kind: 'gratuit',
    platforms: 'Windows, macOS, Linux',
    website: 'https://portswigger.net/burp/communitydownload',
    summary: 'La boîte à outils des testeurs d’applications web.',
    purpose:
      'Burp Suite intercepte les requêtes entre le navigateur et une application web pour les ' +
      'observer, les rejouer et les modifier. L’édition Community est gratuite mais limitée ; ' +
      'l’édition Professional, payante, est très répandue chez les pentesters web.',
    users: 'Pentesters, chercheurs de failles, développeurs.',
    lessonIds: [],
    labIds: [],
    upcoming: 'Niveau 6 : Sécurité web et applications (en préparation)',
    firstStep:
      'Exercez-vous sur des laboratoires conçus pour être attaqués, comme la Web Security Academy, ' +
      'publiée gratuitement par PortSwigger, jamais sur un vrai site.',
    warning: AUTHORIZED_ONLY,
    verifiedOn: VERIFIED,
  },
];
