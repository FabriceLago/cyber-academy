// Généré par scripts/generate-outline.mjs à partir de src/app/content : ne pas modifier à la
// main. Relancer « npm run content:outline » après chaque changement du contenu.
import { GlossaryEntry } from '../core/models/content.model';

/** Termes de toutes les leçons, avec la leçon où ils sont définis (page Glossaire). */
export const GLOSSARY: readonly (GlossaryEntry & {
  readonly lessonId: string;
  readonly lessonTitle: string;
})[] = [
  {
    "term": "Processeur",
    "definition": "La pièce qui exécute les instructions des programmes : c’est elle qui calcule.",
    "example": "Quand vous appliquez un filtre à une photo, le processeur fait les calculs pour chaque point de l’image.",
    "lessonId": "ordinateur-et-fichiers",
    "lessonTitle": "Comprendre un ordinateur, ses fichiers et ses dossiers"
  },
  {
    "term": "Mémoire vive",
    "definition": "Mémoire rapide et temporaire qui garde ce que l’ordinateur utilise en ce moment ; elle se vide à l’extinction. On l’appelle aussi RAM.",
    "example": "Un document ouvert mais pas enregistré n’existe qu’en mémoire vive : une coupure de courant le fait disparaître.",
    "lessonId": "ordinateur-et-fichiers",
    "lessonTitle": "Comprendre un ordinateur, ses fichiers et ses dossiers"
  },
  {
    "term": "Stockage",
    "definition": "Support qui conserve les fichiers durablement, même éteint : disque dur, SSD, clé USB.",
    "example": "Vos photos enregistrées sont toujours là quand vous rallumez l’ordinateur.",
    "lessonId": "ordinateur-et-fichiers",
    "lessonTitle": "Comprendre un ordinateur, ses fichiers et ses dossiers"
  },
  {
    "term": "Périphérique",
    "definition": "Appareil qui permet d’échanger des informations avec l’ordinateur, pour y entrer des données ou en recevoir.",
    "example": "Le clavier sert à saisir du texte ; l’écran affiche le résultat.",
    "lessonId": "ordinateur-et-fichiers",
    "lessonTitle": "Comprendre un ordinateur, ses fichiers et ses dossiers"
  },
  {
    "term": "Extension",
    "definition": "Fin du nom d’un fichier, après le dernier point, qui indique son type.",
    "example": "Dans « contrat.pdf », l’extension est « pdf » : c’est un document PDF.",
    "lessonId": "ordinateur-et-fichiers",
    "lessonTitle": "Comprendre un ordinateur, ses fichiers et ses dossiers"
  },
  {
    "term": "Chemin",
    "definition": "Adresse d’un fichier : la liste des dossiers à traverser pour l’atteindre.",
    "example": "/home/lea/Documents/contrat.pdf : contrat.pdf est dans Documents, lui-même dans lea, lui-même dans home.",
    "lessonId": "ordinateur-et-fichiers",
    "lessonTitle": "Comprendre un ordinateur, ses fichiers et ses dossiers"
  },
  {
    "term": "Terminal",
    "definition": "Fenêtre où l’on dirige l’ordinateur en tapant des commandes.",
    "example": "Sous Linux, l’application « Terminal » ; sous Windows, « Terminal Windows » ou PowerShell.",
    "lessonId": "decouvrir-le-terminal",
    "lessonTitle": "Découvrir le terminal"
  },
  {
    "term": "Commande",
    "definition": "Ordre écrit donné à l’ordinateur, validé avec la touche Entrée.",
    "example": "pwd est une commande qui affiche le dossier où l’on se trouve.",
    "lessonId": "decouvrir-le-terminal",
    "lessonTitle": "Découvrir le terminal"
  },
  {
    "term": "Invite de commande",
    "definition": "Texte affiché par le terminal pour indiquer qu’il attend une commande.",
    "example": "eleve@cyberlab:~$ : l’utilisateur eleve, sur la machine cyberlab, dans son dossier personnel.",
    "lessonId": "decouvrir-le-terminal",
    "lessonTitle": "Découvrir le terminal"
  },
  {
    "term": "Dossier courant",
    "definition": "Dossier dans lequel on se trouve ; les commandes s’y appliquent par défaut.",
    "example": "Après cd Documents, le dossier courant est Documents : ls en liste le contenu.",
    "lessonId": "decouvrir-le-terminal",
    "lessonTitle": "Découvrir le terminal"
  },
  {
    "term": "Dossier personnel",
    "definition": "Dossier propre à chaque utilisateur, noté ~ dans le terminal.",
    "example": "Pour l’utilisatrice lea sous Linux, c’est /home/lea.",
    "lessonId": "decouvrir-le-terminal",
    "lessonTitle": "Découvrir le terminal"
  },
  {
    "term": "Option",
    "definition": "Précision ajoutée à une commande pour modifier son comportement ; elle commence souvent par un tiret.",
    "example": "Dans ls -l, l’option -l demande un affichage détaillé.",
    "lessonId": "decouvrir-le-terminal",
    "lessonTitle": "Découvrir le terminal"
  },
  {
    "term": "Réseau",
    "definition": "Ensemble d’appareils reliés pour échanger des informations.",
    "example": "Les ordinateurs et téléphones connectés à votre box forment un réseau local.",
    "lessonId": "voyage-d-une-information",
    "lessonTitle": "Comment une information voyage sur Internet"
  },
  {
    "term": "Adresse IP",
    "definition": "Numéro qui identifie un appareil sur un réseau, pour que les messages lui parviennent.",
    "example": "203.0.113.10 (une adresse réservée aux exemples).",
    "lessonId": "voyage-d-une-information",
    "lessonTitle": "Comment une information voyage sur Internet"
  },
  {
    "term": "Nom de domaine",
    "definition": "Nom facile à retenir qui désigne un site ou un service sur Internet.",
    "example": "example.com",
    "lessonId": "voyage-d-une-information",
    "lessonTitle": "Comment une information voyage sur Internet"
  },
  {
    "term": "DNS",
    "definition": "Service qui traduit un nom de domaine en adresse IP, comme un annuaire.",
    "example": "Le DNS répond que www.example.com correspond à 203.0.113.10.",
    "lessonId": "voyage-d-une-information",
    "lessonTitle": "Comment une information voyage sur Internet"
  },
  {
    "term": "Paquet",
    "definition": "Petit morceau d’information qui voyage seul sur le réseau, avec une adresse de départ et d’arrivée.",
    "example": "Une photo envoyée par message part en centaines de paquets.",
    "lessonId": "voyage-d-une-information",
    "lessonTitle": "Comment une information voyage sur Internet"
  },
  {
    "term": "Routeur",
    "definition": "Appareil qui fait passer les paquets d’un réseau à un autre en choisissant la suite du trajet.",
    "example": "Votre box contient un routeur qui relie votre réseau domestique à Internet.",
    "lessonId": "voyage-d-une-information",
    "lessonTitle": "Comment une information voyage sur Internet"
  },
  {
    "term": "HTTPS",
    "definition": "Version sécurisée du protocole du Web : les échanges sont chiffrés et le site prouve son identité par un certificat.",
    "example": "Une adresse qui commence par https:// et un cadenas dans la barre du navigateur.",
    "lessonId": "voyage-d-une-information",
    "lessonTitle": "Comment une information voyage sur Internet"
  },
  {
    "term": "Confidentialité",
    "definition": "Le fait que seules les personnes autorisées puissent lire une information.",
    "example": "Vos résultats d’analyses médicales ne doivent être lus que par vous et votre médecin.",
    "lessonId": "securite-et-risques",
    "lessonTitle": "Confidentialité, intégrité, disponibilité : évaluer un risque"
  },
  {
    "term": "Intégrité",
    "definition": "Le fait qu’une information ne soit pas modifiée sans autorisation.",
    "example": "Le RIB d’un fournisseur ne doit pas pouvoir être remplacé par celui d’un escroc.",
    "lessonId": "securite-et-risques",
    "lessonTitle": "Confidentialité, intégrité, disponibilité : évaluer un risque"
  },
  {
    "term": "Disponibilité",
    "definition": "Le fait qu’une information ou un service soit accessible quand on en a besoin.",
    "example": "Le site des urgences doit rester joignable jour et nuit.",
    "lessonId": "securite-et-risques",
    "lessonTitle": "Confidentialité, intégrité, disponibilité : évaluer un risque"
  },
  {
    "term": "Menace",
    "definition": "Ce qui pourrait causer un dommage : une personne, un événement ou une erreur.",
    "example": "Un pirate qui essaie des milliers de mots de passe.",
    "lessonId": "securite-et-risques",
    "lessonTitle": "Confidentialité, intégrité, disponibilité : évaluer un risque"
  },
  {
    "term": "Vulnérabilité",
    "definition": "Une faiblesse qui permet à une menace d’agir.",
    "example": "Le mot de passe « 123456 ».",
    "lessonId": "securite-et-risques",
    "lessonTitle": "Confidentialité, intégrité, disponibilité : évaluer un risque"
  },
  {
    "term": "Risque",
    "definition": "La combinaison de la probabilité qu’une menace exploite une vulnérabilité et de l’impact si cela arrive.",
    "example": "Le risque qu’un compte protégé par « 123456 » soit piraté est élevé, et l’impact dépend de ce que contient le compte.",
    "lessonId": "securite-et-risques",
    "lessonTitle": "Confidentialité, intégrité, disponibilité : évaluer un risque"
  },
  {
    "term": "Rançongiciel",
    "definition": "Logiciel malveillant qui bloque ou chiffre les fichiers d’une victime pour lui réclamer une rançon.",
    "example": "Un hôpital dont tous les dossiers deviennent illisibles du jour au lendemain.",
    "lessonId": "securite-et-risques",
    "lessonTitle": "Confidentialité, intégrité, disponibilité : évaluer un risque"
  },
  {
    "term": "Double authentification",
    "definition": "Connexion qui demande, en plus du mot de passe, une seconde preuve : un code, une application ou une clé physique.",
    "example": "Après votre mot de passe, votre banque vous demande de valider la connexion sur votre téléphone.",
    "lessonId": "securite-et-risques",
    "lessonTitle": "Confidentialité, intégrité, disponibilité : évaluer un risque"
  },
  {
    "term": "Ingénierie sociale",
    "definition": "Manipulation d’une personne pour lui faire faire une action contraire à sa sécurité.",
    "example": "Un faux technicien qui appelle pour « réparer » votre ordinateur à distance.",
    "lessonId": "hameconnage",
    "lessonTitle": "Repérer l’hameçonnage et l’ingénierie sociale"
  },
  {
    "term": "Hameçonnage",
    "definition": "Faux message qui imite un organisme de confiance pour voler des informations ou de l’argent.",
    "example": "Un e-mail aux couleurs d’une banque qui demande de « confirmer » votre mot de passe.",
    "lessonId": "hameconnage",
    "lessonTitle": "Repérer l’hameçonnage et l’ingénierie sociale"
  },
  {
    "term": "Usurpation d’identité",
    "definition": "Le fait de se faire passer pour une autre personne ou un autre organisme.",
    "example": "Un message signé « Service client de votre banque » envoyé par un escroc.",
    "lessonId": "hameconnage",
    "lessonTitle": "Repérer l’hameçonnage et l’ingénierie sociale"
  },
  {
    "term": "Pièce jointe",
    "definition": "Fichier envoyé avec un e-mail.",
    "example": "Une facture en PDF jointe à un message ; un faux « .pdf.exe » est en réalité un programme.",
    "lessonId": "hameconnage",
    "lessonTitle": "Repérer l’hameçonnage et l’ingénierie sociale"
  },
  {
    "term": "Survol",
    "definition": "Le fait de placer la souris sur un lien sans cliquer, pour voir son adresse réelle.",
    "example": "En survolant « Mon compte », on découvre qu’il mène à connexion-securisee.example.",
    "lessonId": "hameconnage",
    "lessonTitle": "Repérer l’hameçonnage et l’ingénierie sociale"
  },
  {
    "term": "Signalement",
    "definition": "Transmission d’un message suspect à un service chargé de l’analyser et de prévenir d’autres victimes.",
    "example": "Transférer un e-mail suspect au service informatique de votre entreprise.",
    "lessonId": "hameconnage",
    "lessonTitle": "Repérer l’hameçonnage et l’ingénierie sociale"
  },
  {
    "term": "Mise à jour",
    "definition": "Nouvelle version d’un logiciel, qui corrige souvent des failles de sécurité.",
    "example": "La mise à jour mensuelle du système corrige plusieurs failles du navigateur.",
    "lessonId": "mises-a-jour-et-sauvegardes",
    "lessonTitle": "Mises à jour et sauvegardes"
  },
  {
    "term": "Vulnérabilité",
    "definition": "Faille d’un logiciel qu’un attaquant peut exploiter.",
    "example": "Une erreur dans un lecteur de PDF permet d’exécuter un programme en ouvrant un fichier piégé.",
    "lessonId": "mises-a-jour-et-sauvegardes",
    "lessonTitle": "Mises à jour et sauvegardes"
  },
  {
    "term": "Fin de support",
    "definition": "Date après laquelle l’éditeur ne publie plus de correctifs pour un logiciel.",
    "example": "Un vieux système d’exploitation en fin de support reste vulnérable aux nouvelles failles.",
    "lessonId": "mises-a-jour-et-sauvegardes",
    "lessonTitle": "Mises à jour et sauvegardes"
  },
  {
    "term": "Sauvegarde",
    "definition": "Copie de données gardée à part, pour les retrouver en cas de problème.",
    "example": "Le dossier Documents copié chaque semaine sur un disque externe.",
    "lessonId": "mises-a-jour-et-sauvegardes",
    "lessonTitle": "Mises à jour et sauvegardes"
  },
  {
    "term": "Règle 3-2-1",
    "definition": "Trois copies des données, sur deux supports différents, dont une hors du domicile ou du bureau.",
    "example": "L’ordinateur, un disque externe rangé à part et un service de sauvegarde en ligne.",
    "lessonId": "mises-a-jour-et-sauvegardes",
    "lessonTitle": "Mises à jour et sauvegardes"
  },
  {
    "term": "Rançongiciel",
    "definition": "Programme malveillant qui chiffre les fichiers puis réclame une rançon.",
    "example": "Tous les documents deviennent illisibles et un message exige un paiement.",
    "lessonId": "mises-a-jour-et-sauvegardes",
    "lessonTitle": "Mises à jour et sauvegardes"
  },
  {
    "term": "Fichier caché",
    "definition": "Fichier que la liste ordinaire n’affiche pas ; sous Linux, son nom commence par un point.",
    "example": ".consignes n’apparaît qu’avec ls -a.",
    "lessonId": "mises-a-jour-et-sauvegardes",
    "lessonTitle": "Mises à jour et sauvegardes"
  },
  {
    "term": "SOC",
    "definition": "Équipe qui surveille les systèmes d’une organisation pour détecter les attaques et y répondre.",
    "example": "Le SOC d’une banque surveille ses serveurs et ses postes de travail jour et nuit.",
    "lessonId": "soc-et-journaux",
    "lessonTitle": "Le SOC et les journaux de sécurité"
  },
  {
    "term": "Journal (log)",
    "definition": "Fichier où un système note les événements qui lui arrivent, une ligne par événement.",
    "example": "Le journal du VPN note chaque connexion réussie ou échouée.",
    "lessonId": "soc-et-journaux",
    "lessonTitle": "Le SOC et les journaux de sécurité"
  },
  {
    "term": "Événement",
    "definition": "Fait noté dans un journal : une connexion, une erreur, l’ouverture d’un fichier.",
    "example": "« Échec de connexion du compte p.durand à 21 h 15 ».",
    "lessonId": "soc-et-journaux",
    "lessonTitle": "Le SOC et les journaux de sécurité"
  },
  {
    "term": "SIEM",
    "definition": "Outil qui rassemble les journaux de nombreux systèmes, les relie et déclenche des alertes selon des règles.",
    "example": "Le SIEM crée une alerte après dix échecs de connexion en deux minutes.",
    "lessonId": "soc-et-journaux",
    "lessonTitle": "Le SOC et les journaux de sécurité"
  },
  {
    "term": "Alerte",
    "definition": "Signal créé par une règle de détection, qu’un analyste doit examiner.",
    "example": "« Nombreux échecs de connexion sur le VPN cette nuit ».",
    "lessonId": "soc-et-journaux",
    "lessonTitle": "Le SOC et les journaux de sécurité"
  },
  {
    "term": "Analyste de niveau 1",
    "definition": "Membre du SOC qui surveille et trie les alertes, puis transmet les incidents confirmés.",
    "example": "Il vérifie si une alerte correspond à une vraie attaque et documente sa conclusion.",
    "lessonId": "soc-et-journaux",
    "lessonTitle": "Le SOC et les journaux de sécurité"
  },
  {
    "term": "Vrai positif",
    "definition": "Alerte qui correspond à une activité malveillante réelle.",
    "example": "Une connexion réussie après quinze essais de mots de passe depuis une adresse inconnue.",
    "lessonId": "trier-une-alerte",
    "lessonTitle": "Trier une alerte de sécurité"
  },
  {
    "term": "Faux positif",
    "definition": "Alerte déclenchée alors qu’il n’y a pas de menace réelle.",
    "example": "Deux fautes de frappe suivies d’une connexion validée par code.",
    "lessonId": "trier-une-alerte",
    "lessonTitle": "Trier une alerte de sécurité"
  },
  {
    "term": "Faux négatif",
    "definition": "Attaque réelle qui n’a déclenché aucune alerte.",
    "example": "Un attaquant qui se connecte avec un mot de passe volé, du premier coup, sans éveiller de règle.",
    "lessonId": "trier-une-alerte",
    "lessonTitle": "Trier une alerte de sécurité"
  },
  {
    "term": "Triage",
    "definition": "Examen d’une alerte pour décider si elle est réelle, quelle est sa gravité et que faire.",
    "example": "Le niveau 1 trie chaque nouvelle alerte de la file d’attente.",
    "lessonId": "trier-une-alerte",
    "lessonTitle": "Trier une alerte de sécurité"
  },
  {
    "term": "Escalade",
    "definition": "Transmission d’un incident à un niveau plus expérimenté, avec une note claire.",
    "example": "Le niveau 1 escalade au niveau 2 un accès confirmé à des données clients.",
    "lessonId": "trier-une-alerte",
    "lessonTitle": "Trier une alerte de sécurité"
  },
  {
    "term": "Gravité",
    "definition": "Importance d’un incident, selon son impact et son étendue.",
    "example": "Accès confirmé à des factures clients : gravité élevée.",
    "lessonId": "trier-une-alerte",
    "lessonTitle": "Trier une alerte de sécurité"
  }
];
