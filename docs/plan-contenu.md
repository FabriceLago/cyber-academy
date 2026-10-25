# Plan de contenu : niveaux 1 à 8 et spécialisations

**Validé le 25 octobre 2026**, avec les recommandations D1 à D6 (section 3). Aucune leçon n'est
encore rédigée : ce document fixe ce qu'il faut écrire, dans quel ordre, avec quels laboratoires
et animations, et les décisions retenues.

## 1. Point de départ

| | Existant | Annoncé (« en préparation ») |
|---|---|---|
| Parcours | Découverte (gratuit) ; spécialisation Analyste SOC junior (Premium) | Niveaux 1 à 8 ; 5 spécialisations |
| Leçons | 7 (5 Découverte, 2 SOC), 20 à 30 min, 17 sections chacune | |
| Laboratoires | Terminal simulé, détecteur d'hameçonnage, analyseur de journaux | |
| Animations | 1 sur 7 leçons (« Le trajet d'un paquet ») ; les 6 autres affichent leur description | |
| Compétences | 7 | |

L'offre Premium ne contient aujourd'hui que 2 leçons et 1 laboratoire : c'est le principal frein à
la vente.

## 2. Règles qui s'appliquent à chaque contenu

- **Modèle de leçon inchangé** : les 17 sections, des objectifs mesurables (verbe observable), au
  moins 2 questions par objectif, une banque d'au moins 2 fois le nombre de questions tirées, une
  correction pour chaque question et chaque option (vérifié par `validate-content.ts`).
- **Tout est simulé** : aucune commande, aucun outil, aucune requête réelle. Les sorties d'outils
  (scan, capture, pipeline) sont des données fictives écrites à l'avance et comparées à une liste.
- **Données fictives** : domaines `.example` et `.test`, adresses IP de documentation (RFC 5737),
  organisations et personnes inventées.
- **Offensif = cadre d'abord** : tout contenu d'attaque (niveaux 6 et 7, spécialisation Pentester)
  commence par le cadre légal et l'autorisation écrite, porte sur une cible fictive, et s'arrête à
  la compréhension et à la correction : aucune charge utile réutilisable telle quelle.
- **Correction après réponse** : jamais de bonne réponse affichée avant l'envoi.
- **Pas de promesse d'emploi** : les compétences sont pédagogiques et simulées ; le rappel figure
  dans chaque spécialisation et dans le portfolio.
- **Accessibilité** : chaque animation a une version texte complète et respecte le mouvement réduit.
- **Relecture experte** : chaque leçon est relue par une personne du métier avant publication
  (exactitude technique, à jour). Sources de référence pour les auteurs : ANSSI, CNIL,
  cybermalveillance.gouv.fr, OWASP, MITRE ATT&CK.

## 3. Décisions retenues

Les six recommandations ci-dessous ont été validées telles quelles.

| | Question | Décision |
|---|---|---|
| D1 | Que devient le parcours Découverte ? | Le garder tel quel, gratuit, comme porte d'entrée ; le niveau 1 l'exige et commence là où il s'arrête. Une leçon n'appartient qu'à un module : on ne la réutilise pas, on l'approfondit. |
| D2 | Le niveau 5 et la spécialisation Analyste SOC se recouvrent. | Déplacer les 2 leçons SOC existantes dans le niveau 5 (leur identifiant ne change pas : les tentatives des apprenants sont conservées) ; la spécialisation garde la fiche métier, le projet final et les modules avancés déjà annoncés. |
| D3 | Quels niveaux sont gratuits ? | Niveaux 1 à 4 gratuits (fondations, cohérent avec la mission d'initiation) ; niveaux 5 à 8 et spécialisations en Premium. |
| D4 | Volume par niveau | 6 leçons (2 modules de 3), 1 à 2 laboratoires, 1 à 2 animations. |
| D5 | Spécialisations Cloud et DevSecOps proches | Les garder séparées mais partager le niveau 8 comme socle ; réévaluer après le niveau 8. |
| D6 | Qui relit ? | Une personne du métier par domaine (réseau, système, SOC, web, offensif, cloud), avant publication. |

## 4. Moteurs à construire une fois, réutilisés partout

Les laboratoires s'appuient sur peu de moteurs : chaque nouveau laboratoire sur un moteur existant
n'est que du contenu.

| Moteur | État | Sert aux niveaux et spécialisations | Taille (indicative) |
|---|---|---|---|
| Terminal simulé | Existant ; à étendre (`cp`, `mv`, `ls -a`, `chmod`, `ps`, `grep`, `sha256sum` simulés) | 1, 3, 4 | Moyenne |
| Analyseur de journaux | Existant ; à généraliser en « explorateur de données » (journaux, captures réseau, rapports de scan) | 2, 5, SOC, Analyste vulnérabilités | Moyenne |
| Détecteur d'hameçonnage | Existant | 1, 4 | — |
| Relecture de code et de configuration (nouveau) | Repérer la ligne fautive dans un code ou une configuration fictive, choisir le correctif | 6, 8, Développeur sécurité, Cloud, DevSecOps | Moyenne à grande |
| Scénario à décisions (nouveau) | Étapes successives, sorties d'outils fictives, conséquences des choix, sortie de périmètre sanctionnée | 7, SOC (réponse à incident), Pentester | Grande |
| Lecteur d'animations | Existant (`animation-player`) ; chaque animation est un schéma SVG en étapes | Tous | Petite par animation |

Chaque nouveau type de laboratoire demande aussi une migration (valeur autorisée de `labs.kind`),
comme pour l'analyseur de journaux.

## 5. Niveaux 1 à 8

Chaque niveau exige le précédent de sa branche : 1 → 2 → 3 → 4, puis 4 → 5 (défense),
4 → 6 → 7 (applications et offensif) et 4 → 8 (cloud). Leçons de 20 à 30 minutes.

### Niveau 1 : Culture informatique (débutant)

Prérequis : parcours Découverte. But : utiliser un ordinateur et ses comptes en sécurité.

| Module | Leçons |
|---|---|
| Matériel et systèmes | Du disque au processeur : le trajet d'une donnée · Le système d'exploitation : processus et utilisateurs · Mises à jour et sauvegardes |
| Données et comptes | Formats de fichiers et extensions trompeuses · Mots de passe et gestionnaire de mots de passe · L'authentification à plusieurs facteurs |

- Laboratoire : terminal étendu, « Ranger, copier et sauvegarder des fichiers ».
- Animations : la règle 3-2-1 face aux incidents (leçon pilote « Mises à jour et sauvegardes »,
  publiée avec son laboratoire) ; le trajet d'une donnée ; un mot de passe face à une attaque par
  dictionnaire.
- Compétences : protéger ses comptes ; organiser et sauvegarder ses données.

### Niveau 2 : Réseaux informatiques (débutant)

Prérequis : niveau 1. But : lire et expliquer ce qui circule sur un réseau.

| Module | Leçons |
|---|---|
| Adresses et routes | Adresses IP, masques et sous-réseaux · Routeurs, passerelles et traduction d'adresses (NAT) · Le DNS en détail |
| Transport et services | TCP, UDP et ports · HTTP, HTTPS et certificats · Sécuriser son réseau domestique et le Wi-Fi |

- Laboratoire : explorateur de données, « Analyser une capture réseau fictive ».
- Animations : la poignée de main TCP ; l'encapsulation des données.
- Compétences : lire une adresse et son masque ; identifier un service par son port.

### Niveau 3 : Linux et administration système (intermédiaire)

Prérequis : niveau 2. But : administrer un serveur Linux sans en ouvrir les portes.

| Module | Leçons |
|---|---|
| Fichiers et droits | L'arborescence Linux et les fichiers de configuration · Utilisateurs, groupes et permissions · Processus et services |
| Administration | Paquets et mises à jour · Les journaux du système · SSH et accès à distance sécurisé |

- Laboratoires : terminal étendu, « Corriger des permissions trop larges » ; « Trouver le processus
  suspect ».
- Animation : lecture des droits `rwx`.
- Compétences : gérer les droits d'un fichier ; inspecter processus et journaux.

### Niveau 4 : Fondamentaux de la cybersécurité (intermédiaire)

Prérequis : niveau 3. But : raisonner en risques, en défenses et en correctifs.

| Module | Leçons |
|---|---|
| Menaces et défenses | Panorama des menaces (logiciels malveillants, rançongiciels, déni de service) · Défense en profondeur et moindre privilège · Vulnérabilités, CVE et score CVSS |
| Cryptographie et réaction | Hachage et intégrité · Chiffrement symétrique et asymétrique · Cadre légal et réflexes en cas d'incident (RGPD, signalement) |

- Laboratoire : terminal étendu, « Vérifier l'intégrité d'un fichier téléchargé ».
- Animations : le chiffrement asymétrique ; la défense en profondeur.
- Compétences : expliquer hachage et chiffrement ; prioriser une vulnérabilité.

### Niveau 5 : SOC et analyste cybersécurité junior (intermédiaire)

Prérequis : niveau 4. But : surveiller, détecter et qualifier.

| Module | Leçons |
|---|---|
| Surveiller | Le SOC et les journaux de sécurité (existante) · Trier une alerte de sécurité (existante) · Les sources de journaux : poste, réseau, proxy, DNS |
| Détecter | Règles de détection et faux positifs · Indicateurs de compromission · Reconstituer la chronologie d'un incident |

- Laboratoires : analyseur de journaux (existant) ; explorateur de données, « Reconstituer une
  chronologie ».
- Animation : le cycle de vie d'une alerte.
- Compétences : analyser des journaux et trier des alertes (existantes) ; reconstituer un incident.

### Niveau 6 : Sécurité web et applications (intermédiaire)

Prérequis : niveau 4. But : comprendre les failles web pour les corriger.

| Module | Leçons |
|---|---|
| Une application web | Requêtes, réponses, cookies et sessions · Authentification et gestion des sessions · Le Top 10 de l'OWASP |
| Failles courantes | Injection SQL : comprendre et corriger · Script intersite (XSS) : comprendre et corriger · Contrôle d'accès défaillant |

- Laboratoires : relecture de code, « Trouver la ligne vulnérable et choisir le correctif » ;
  « Inspecter des requêtes d'une boutique fictive » (réponses écrites à l'avance).
- Animation : comment une injection SQL détourne la requête.
- Compétences : reconnaître une faille web courante ; proposer son correctif.

### Niveau 7 : Pentesting éthique (avancé)

Prérequis : niveau 6. But : connaître la méthode et ses limites, sur des cibles fictives.

| Module | Leçons |
|---|---|
| Cadre et méthode | Cadre légal, autorisation écrite et périmètre (obligatoire, en premier) · Les phases d'un test d'intrusion · Reconnaissance d'une cible fictive |
| Analyse et restitution | Lire des résultats de scan fictifs · Prouver une faille sans causer de dommage · Rédiger le rapport |

- Laboratoire : scénario à décisions, « Test d'intrusion d'une entreprise fictive », où sortir du
  périmètre fait échouer l'exercice.
- Animation : les phases d'un test d'intrusion.
- Compétences : mener une démarche de test cadrée ; rédiger un rapport.

### Niveau 8 : Cloud et DevSecOps (avancé)

Prérequis : niveau 4. But : sécuriser l'infrastructure et la chaîne de livraison.

| Module | Leçons |
|---|---|
| Cloud | La responsabilité partagée · Identités et droits (IAM) · Stockage et erreurs de configuration fréquentes |
| DevSecOps | La chaîne d'intégration et de déploiement et ses risques · Secrets et dépendances · Conteneurs : bonnes pratiques |

- Laboratoires : relecture de configuration, « Repérer une politique d'accès trop permissive » ;
  « Sécuriser un pipeline fictif ».
- Animations : la responsabilité partagée ; un secret qui fuit dans un pipeline.
- Compétences : auditer une configuration cloud ; sécuriser un pipeline.

## 6. Spécialisations (niveau 9)

Chaque spécialisation garde le format actuel : fiche métier, modules, projet final avec grille
d'auto-évaluation, préparation aux entretiens, pistes de certifications **à vérifier** auprès des
organismes.

| Spécialisation | Prérequis proposés | Modules (2 leçons chacun) | Laboratoire et projet final |
|---|---|---|---|
| Analyste SOC junior (existante, à compléter) | Niveau 5 | SIEM et corrélation · Indicateurs de compromission avancés · Réponse à incident · MITRE ATT&CK · Documentation et rapports (déjà annoncés) | Explorateur multi-sources ; scénario de réponse à incident ; projet existant |
| Pentester junior | Niveau 7 | Test d'une application web · Test d'un réseau interne fictif · Restitution au client | Scénario complet ; rapport de test d'intrusion |
| Analyste vulnérabilités | Niveau 6 | Qualifier un rapport de scan · Prioriser et suivre la remédiation · Dialoguer avec les équipes | Explorateur sur un rapport fictif ; plan de remédiation |
| Développeur orienté sécurité | Niveaux 6 et 8 | Développement sécurisé · Revue de code sécurité · Tests de sécurité automatisés | Relecture de code ; correctifs d'une application fictive |
| Ingénieur sécurité cloud junior | Niveau 8 | IAM avancé · Réseau cloud et segmentation · Journalisation et détection dans le cloud | Relecture de configuration ; audit d'un compte cloud fictif |
| Junior DevSecOps | Niveau 8 | Pipeline sécurisé · Dépendances et nomenclature logicielle (SBOM) · Infrastructure décrite en code | Relecture de configuration ; durcissement d'un pipeline fictif |

Attention : ajouter le niveau 5 comme prérequis de la spécialisation SOC (aujourd'hui : Découverte)
verrouillerait les apprenants qui l'ont déjà commencée. À faire au moment où le niveau 5 est
publié, avec un message explicite.

## 7. Ordre de réalisation et volume

| Phase | Contenu | Leçons nouvelles | Moteurs et animations |
|---|---|---|---|
| 1 | Niveaux 1 à 4 (fondations) | 24 (dont 1 publiée, la leçon pilote) | Terminal étendu (fait) ; 8 animations (dont 1 faite) |
| 2 | Niveau 5, puis compléter la spécialisation SOC | 4 + 10 | Explorateur de données ; scénario à décisions ; 1 animation |
| 3 | Niveaux 6 et 7, puis Pentester et Analyste vulnérabilités | 12 + 12 | Relecture de code et de configuration ; 2 animations |
| 4 | Niveau 8, puis Développeur sécurité, Cloud et DevSecOps | 6 + 18 | (moteurs déjà construits) ; 2 animations |
| En parallèle | Animations des 6 leçons existantes qui n'en ont pas | — | 6 animations |

Total : 86 leçons nouvelles, 4 moteurs (2 extensions, 2 nouveaux), 19 animations. Repère
indicatif, à affiner sur la première phase : une leçon complète demande environ une journée de
rédaction, plus la relecture experte ; un laboratoire sur un moteur existant, environ une journée ;
un nouveau moteur, plusieurs jours avec ses tests.

Mesure du premier pilote (terminal étendu, niveau 1) : environ 1 h 45 de travail assisté pour le
moteur, la leçon, son laboratoire, son animation et leurs tests, hors relecture experte.

Recommandation : rédiger d'abord **une leçon pilote par moteur** (par exemple niveau 3 avec le
terminal étendu, niveau 6 avec la relecture de code), faire relire, mesurer le temps réel, puis
recaler ce plan.

## 8. Hors périmètre et limites

- Pas d'environnement réel (machines virtuelles, outils d'attaque, comptes cloud) : si un jour
  nécessaire, service séparé, éphémère et isolé, à décider à part.
- Pas de correction humaine des projets : l'auto-évaluation reste la règle tant qu'aucun mentor
  n'est prévu.
- Les pistes de certifications ne sont pas des recommandations : contenus, prix et prérequis sont
  à vérifier sur le site de chaque organisme au moment de la rédaction.
