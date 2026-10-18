# Architecture de Cyber Academy

État : étape 2 (socle technique et modèle de contenu). Mise à jour : 2026-10-16.

## 1. Principes

1. **La plateforme fonctionne sans compte.** Sans compte, la progression reste dans le navigateur ; avec un compte (facultatif), elle est enregistrée sur le serveur, qui corrige lui-même les quiz. Le modèle de contenu n'a pas changé.
2. **Aucune commande réelle n'est exécutée**, ni dans le navigateur, ni dans une Edge Function, ni sur un serveur. Les laboratoires sont des simulations écrites en TypeScript.
3. **On n'enregistre que des faits** (tentatives de quiz et de laboratoire). Leçon validée, points, compétences et révisions se calculent à partir d'eux.
4. **Les points récompensent une compétence démontrée** (quiz réussi au-dessus du seuil, objectif de laboratoire atteint), jamais un clic ou une page vue.
5. **Le contenu est du texte brut**, affiché par interpolation Angular, jamais par `innerHTML` : le contenu ne peut pas injecter de HTML.

## 2. Pile technique

Versions installées et vérifiées le 2026-10-16.

| Rôle | Choix | Version |
|---|---|---|
| Framework | Angular, composants standalone, sans zone.js | 22.2.3 |
| Langage | TypeScript strict (actif par défaut depuis TypeScript 6.0) et templates stricts (défaut d'Angular 22) | 6.0.3 |
| Tests unitaires | Vitest, lancé par `ng test` dans jsdom | 5.0.5 |
| Tests de parcours | Playwright sur le build de production (servi par `vite preview`), projets « bureau » (Chrome) et « mobile » (Pixel 7), 2 navigateurs en parallèle | 1.64.1 |
| Accessibilité | axe-core via `@axe-core/playwright`, règles WCAG 2.0 à 2.2 niveaux A et AA | 4.14.0 |
| Lint | angular-eslint : TypeScript, templates et règles d'accessibilité des templates | 22.6.0 |
| Styles | CSS natif ; les jetons du design system sont des variables CSS (étape 3) | — |
| Animations | SVG, CSS, Web Animations API et `animate.enter` / `animate.leave` d'Angular | — |
| Données (étape 9) | Supabase local : PostgreSQL, Auth, Row Level Security ; CLI en dépendance de développement | CLI 2.119.0 |
| Client Supabase | `@supabase/supabase-js`, chargé à la demande (hors du premier affichage) | 2.118.0 |
| Génération du catalogue SQL | esbuild (lit le contenu TypeScript depuis Node) | 0.28.2 |
| Poste | Windows 11, Node 24.22.0, npm 11.19.1, VS Code | — |

**Pas de Tailwind :** le CSS moderne (variables, `clamp()`, grilles, `prefers-color-scheme`) couvre le besoin sans dépendance.
**Pas de bibliothèque d'animation :** `@angular/animations` est déprécié en v22, et les animations pas à pas (paquet réseau, indices de phishing) se font en SVG et CSS, ce qui rend simple le respect de `prefers-reduced-motion`. Une bibliothèque sera ajoutée seulement si une animation l'exige.

## 3. Arborescence

```
src/app/
├─ core/
│  ├─ models/            types du contenu et de la progression            (étape 2, fait)
│  ├─ content/           validation automatique du contenu                (étape 2, fait)
│  ├─ theme/             thème clair, sombre ou selon l'appareil          (étape 3, fait)
│  ├─ progress/          règles de progression, stockage, sauvegarde,     (étapes 4 et 11, fait)
│  │                     portfolio, révision espacée, défi de la semaine  (après l'étape 13, fait)
│  ├─ quiz/              tirage, correction, notions à revoir             (étape 6, fait)
│  ├─ labs/              terminal simulé, phishing, journaux              (étapes 8 et 11, fait)
│  ├─ supabase/          client typé, types générés du schéma             (étape 9, fait)
│  ├─ auth/              session, profil, messages d'erreur               (étape 9, fait)
│  └─ page-title.strategy.ts  titre d'onglet « Page · Cyber Academy »     (étape 3, fait)
├─ shared/
│  ├─ icon/              icônes SVG du design system                      (étape 3, fait)
│  ├─ empty-state/       encadré « rien à afficher, voici pourquoi »      (étape 3, fait)
│  ├─ progress-bar/      jauge accessible (role="progressbar")            (étape 4, fait)
│  └─ animation-player/  lecteur commun des animations pédagogiques       (étape 7, fait)
├─ content/              catalogue, 7 leçons, 3 labos, parcours (paths/)  (étapes 5, 8 et 11)
└─ features/
   ├─ auth/              connexion et création de compte                  (étape 9, fait)
   ├─ errors/            page introuvable, page d'erreur de chargement    (étape 3, fait)
   ├─ profile/           thème, objectif, sauvegarde, réinitialisation    (étapes 5 et 9, fait)
   ├─ dashboard/         tableau de bord, à réviser, défi de la semaine   (étape 4, fait)
   ├─ glossary/          glossaire de toutes les leçons, avec recherche   (après l'étape 13, fait)
   ├─ skills/            compétences                                      (étape 4, fait)
   ├─ learning-paths/    carte des parcours, page d'une spécialisation    (étapes 5 et 11, fait)
   ├─ lessons/           page de leçon, liste, exercice guidé             (étape 5, fait)
   │  └─ animations/     animation « Le trajet d'un paquet »              (étape 7, fait)
   ├─ quizzes/           page de quiz, liste des quiz, saisie des réponses (étape 6, fait)
   ├─ labs/              Cyber Lab : terminal, phishing, journaux simulés (étapes 8 et 11, fait)
   └─ projects/          projets finaux des spécialisations, brouillons   (après l'étape 13, fait)
src/environments/        URL et clé publique de Supabase (local)          (étape 9, fait)
supabase/                config locale, migrations, seed, tests RLS       (étape 9, fait)
scripts/                 génération du catalogue SQL et des types         (étape 9, fait)
e2e/                     tests Playwright
docs/                    ce document
```

Conventions :
- noms de fichiers du guide de style 2025 (`lesson-page.ts`, pas `lesson-page.component.ts`) ;
- sélecteurs préfixés `ca-` ;
- une fonctionnalité = un dossier chargé à la demande (`loadComponent` / `loadChildren`) ;
- état en signals (`signal`, `computed`), services `providedIn: 'root'` ;
- détection des changements OnPush (comportement par défaut d'Angular 22) ;
- textes de l'interface en français, apostrophe typographique (’).

### Design system et navigation

**Jetons** ([`src/styles.css`](../src/styles.css)) : chaque couleur est écrite une seule fois avec
`light-dark(clair, sombre)`. Le thème suit le réglage de l'appareil, ou le choix fait dans
*Profil et paramètres* (attribut `data-theme` sur `<html>`, mémorisé dans le navigateur).

| Rôle | Sombre | Clair |
|---|---|---|
| Fond | `#0b1220` (bleu nuit) | `#f4f7fb` |
| Surface (cartes) | `#111b2e` | `#ffffff` |
| Texte / texte secondaire | `#e6edf7` / `#a3b3cb` | `#0f1b2d` / `#4a5b74` |
| Accent (liens, boutons) | `#22d3ee` (cyan) | `#0e7490` (cyan foncé) |
| Succès / alerte / danger | `#4ade80` / `#fbbf24` / `#f87171` | `#15803d` / `#b45309` / `#b91c1c` |

Contrastes calculés (formule WCAG) : texte ≥ 4,5:1 partout (minimum mesuré : 4,99 pour un lien
clair sur le fond clair), anneau de focus ≥ 3:1. Polices du système (aucun téléchargement),
espacements de 4 à 48 px, cibles cliquables de 44 px minimum.

**Classes globales** : `.btn` (`-primary`, `-secondary`, `-ghost`, `-icon`, état indisponible estompé), `.card`,
`.page-header`, `.status-page`, `.visually-hidden`.
**Composants** : `ca-icon` (15 icônes SVG au trait, toujours décoratives),
`ca-empty-state` (section vide expliquée).

**Navigation** : barre latérale à partir de 1024 px ; en dessous, bouton « Menu » qui déplie la
navigation par-dessus le contenu (`aria-expanded`, fermeture par Échap ou quand le focus quitte le
menu). Page active signalée par `aria-current="page"` et par la forme, pas seulement la couleur.
Lien d'évitement « Aller au contenu principal ». À chaque changement de page : titre d'onglet
propre, retour en haut, focus placé sur le contenu. Les sections pas encore développées affichent
une page provisoire qui annonce l'étape prévue, sans fausses données.

**Erreurs** : adresse inconnue → page introuvable ; échec de chargement d'une page (réseau) →
page d'erreur chargée avec l'application, l'adresse demandée restant affichée pour « Recharger ».

**Mouvement** : `prefers-reduced-motion` rend animations et transitions instantanées.

## 4. Modèle de contenu

Fichier : [`src/app/core/models/content.model.ts`](../src/app/core/models/content.model.ts).

```
LearningPath ─▶ Module (seuil de réussite) ─▶ Lesson ─▶ Quiz ─▶ Question
                                               ├─ labId ─▶ Lab
                                               └─ skillIds ─▶ Skill ◀─ Lab.skillIds
```

### Les 17 sections d'une leçon

| Section du brief | Champ |
|---|---|
| 1. Titre | `title` |
| 2. Niveau et durée estimée | `level`, `durationMinutes` |
| 3. Prérequis | `prerequisiteIds` |
| 4. Objectifs mesurables | `objectives` |
| 5. Explication accessible | `explanation` (titres, paragraphes, listes, encadrés) |
| 6. Glossaire | `glossary` (terme, définition simple, exemple concret) |
| 7. Exemple concret | `example` |
| 8. Animation interactive | `animation` (composant + alternative textuelle) |
| 9. Démonstration visuelle | `demonstration` (composant + alternative textuelle) |
| 10. Exercice guidé | `guidedExercise` (questions avec indices progressifs) |
| 11. Laboratoire pratique | `labId` (facultatif) |
| 12. Quiz de validation | `quiz` (banque de questions, nombre tiré par tentative) |
| 13. Correction détaillée | `explanation` de chaque question, `feedback` de chaque option |
| 14. Résumé | `summary` |
| 15. Critères de réussite | calculés : seuil du module + laboratoire réussi s'il existe |
| 16-17. Recommencer, continuer | interface |

### Types de questions

| Type du brief | Modèle |
|---|---|
| Choix unique | `single` |
| Choix multiples | `multiple` |
| Vrai ou faux | `true-false` |
| Association de concepts | `matching` |
| Classement d'étapes | `ordering` |
| Analyse de journaux | choix + `context.kind = 'log'` |
| Identification de risques, scénarios de décision | choix + `context.kind = 'scenario'` ou `'email'` |

Chaque question est liée à un objectif (`objectiveId`) : c'est ce qui permet d'identifier les notions mal comprises. Sa `difficulty` (1 à 3) permet d'ordonner les questions par difficulté croissante.

### Règles vérifiées automatiquement

[`validate-content.ts`](../src/app/core/content/validate-content.ts) refuse une leçon si :
- une section obligatoire est vide ;
- un objectif commence par un verbe non mesurable (comprendre, connaître, savoir…) ;
- un objectif est évalué par moins de 2 questions ;
- la banque compte moins de 2 fois le nombre de questions tirées par tentative ;
- une question n'a pas de correction, ou une option n'a pas son explication ;
- un choix unique n'a pas exactement une bonne réponse ;
- un choix multiple n'a pas au moins une bonne et une mauvaise réponse ;
- une association compte moins de 3 paires ou est ambiguë ;
- un classement compte moins de 3 étapes ;
- un identifiant est en double.

Au niveau du parcours, il refuse aussi :
- un prérequis placé après la leçon (ce qui empêche les cycles) ;
- un laboratoire ou une compétence inconnus ;
- un seuil de réussite hors de ]0, 1].

Le test [`catalog.spec.ts`](../src/app/content/catalog.spec.ts) applique `validatePath` à tout le
catalogue : un contenu incomplet ne passe pas les tests.

**Plan et contenu.** `PathOutline` (titres, durées, prérequis, laboratoires, compétences) suffit à la
navigation et à la progression ; un `LearningPath` complet en est un cas particulier. Les 5 leçons du
parcours « Découverte » sont rédigées dans [`content/lessons/`](../src/app/content/lessons/) : tous les
noms de domaine et adresses d'exemple sont réservés (`.example`, `203.0.113.x`), les organisations
fictives.

### Moteur de leçons (étape 5)

- `/parcours` : carte des parcours (modules, leçons et statuts) et niveaux prévus, présentés comme tels.
- `/lecons` : toutes les leçons ; seules les leçons accessibles sont des liens.
- `/lecons/:id` : les 17 sections, un sommaire, l'exercice guidé (indices progressifs, correction
  seulement après la réponse, rien d'enregistré), les critères de réussite, « Recommencer » et
  « Leçon suivante » (actif seulement si la leçon est validée). Une leçon verrouillée affiche ce qu'il
  faut valider d'abord, sans son contenu. Le titre d'onglet est celui de la leçon.
- Annoncé dans la page, pas simulé : animations des leçons 1, 2, 4 et 5 et schémas des 5
  démonstrations (pas encore planifiés, la description complète est affichée).

### Moteur de quiz (étape 6)

Fichier : [`quiz-engine.ts`](../src/app/core/quiz/quiz-engine.ts), testé dans `quiz-engine.spec.ts`.

- **Tirage** (`drawQuiz`) : 5 questions parmi 10, prises d'abord hors de la tentative précédente
  (au moins une par objectif si possible), puis triées de la plus facile à la plus difficile. Avec une
  banque d'au moins deux fois la taille d'un tirage (règle du validateur), deux tentatives successives
  n'ont aucune question commune.
- **Présentation** (`presentQuestion`) : options et colonne de droite mélangées ; un classement n'est
  jamais présenté déjà dans le bon ordre.
- **Saisie** ([`answer-input.ts`](../src/app/features/quizzes/answer-input.ts)) : choix (boutons radio
  ou cases), association (une liste déroulante par élément), classement (boutons Monter / Descendre,
  utilisables au clavier, nouvelle position annoncée aux lecteurs d'écran).
- **Correction** : rien n'est montré avant l'envoi. Ensuite : score immédiat, réussite selon le seuil
  du module, explication de chaque question et de chaque option, notions à revoir (objectifs des
  questions ratées) et conseil de révision.
- **Enregistrement** : chaque envoi ajoute une tentative (`recordQuizAttempt`) ; un quiz réussi valide
  la leçon (ou la moitié des critères si elle a un laboratoire) et débloque la suite.
- **Envoi incomplet** : refusé, avec un message d'erreur qui reçoit le focus et liste les questions
  sans réponse.
- **Avec un compte**, la tentative est corrigée et enregistrée par le serveur (étape 10) : la
  correction affichée est celle qu'il a retenue.
- **Limite assumée (décision de l'étape 12) :** les réponses attendues restent dans le JavaScript
  envoyé au navigateur, car elles servent à corriger sans compte. Les déplacer sur le serveur
  obligerait à corriger aussi les visiteurs par le serveur ; ce correcteur ouvert permettrait de
  récolter les corrigés en quelques appels, pour un coût élevé. Les comptes restent corrigés par le
  serveur avec ses propres clés.

### Animations (étape 7)

- **Lecteur commun** ([`animation-player.ts`](../src/app/shared/animation-player/animation-player.ts)) :
  lecture et pause (une étape toutes les 6 s, arrêt sur la dernière), étapes précédente et suivante,
  « Revenir au début », légende de l'étape annoncée aux lecteurs d'écran (`aria-live`) et explication.
  Boutons natifs, donc utilisables au clavier ; aux extrémités, `aria-disabled` plutôt que `disabled`,
  pour que le focus ne se perde pas. Rien ne bouge au chargement de la page.
- **Le trajet d'un paquet** (leçon 3, [`packet-journey.ts`](../src/app/features/lessons/animations/packet-journey.ts)) :
  schéma SVG en trois zones (chez vous, fournisseur d'accès, Internet), paquet coloré selon son rôle
  (question DNS, demande, réponse) avec légende des couleurs, trajet de l'étape mis en évidence.
  Version détaillée (7 étapes, dont la résolution DNS et le retour) ou simplifiée (4 étapes, 4
  équipements). Le mouvement utilise la Web Animations API.
- **Mouvement réduit** : si le système le demande, le paquet saute directement à sa position, sans
  trajet animé (vérifié par test e2e).
- **Alternative textuelle** : la description complète reste disponible sous l'animation ; un test
  vérifie que les légendes reprennent mot pour mot celle de la leçon.

### Laboratoires (étape 8)

Le Cyber Lab (`/laboratoires`) liste les laboratoires ; chacun s'ouvre en même temps que sa leçon
(`/laboratoires/:id`). Page commune ([`lab-page`](../src/app/features/labs/lab-page.ts)) : scénario,
objectifs, actions autorisées, environnement simulé, indices progressifs (comptés), puis bilan,
explications et « Recommencer ». Chaque fin d'exercice est enregistrée (`recordLabAttempt`, réussie
ou non) ; un laboratoire réussi, avec le quiz, valide la leçon.

- **Terminal simulé** ([`terminal.ts`](../src/app/core/labs/terminal.ts)) : interpréteur d'une liste
  fermée de commandes (`pwd`, `ls [-l]`, `cd`, `cat`, `mkdir`, `touch`, `clear`, `help`) sur un système
  de fichiers fictif en mémoire, jamais modifié en place. Messages d'erreur proches des vrais (en
  français) ; `rm`, `rmdir`, `sudo` et `su` sont refusés avec leur raison ; tout autre nom est
  « commande introuvable ». Les tâches de la mission sont vérifiées sur l'état simulé : fichier lu,
  dossier ou fichier créé, dossier courant. Invite qui suit le dossier courant, rappel des commandes
  avec les flèches, sortie lue par les lecteurs d'écran (`role="log"`).
- **Détecteur d'hameçonnage** ([`phishing.ts`](../src/app/core/labs/phishing.ts)) : 5 e-mails fictifs
  (3 pièges, 2 légitimes). L'apprenant affiche l'adresse réelle, vérifie la destination du lien,
  coche les éléments suspects et donne son verdict ; la correction, élément par élément, n'apparaît
  qu'après. Un e-mail est réussi si le verdict est juste, si aucun élément sain n'est signalé à tort,
  et, pour un piège, si au moins 2 indices sont relevés ; le laboratoire, si les 5 le sont.
- **Sécurité** : aucune commande n'est exécutée, ni dans le navigateur ni ailleurs ; la saisie n'est
  qu'une chaîne comparée à une liste, et tout est affiché comme du texte (jamais comme du HTML). Les
  recherches passent par `Map` et `Object.hasOwn`, pour qu'un nom comme `constructor` ne trouve rien.
  Les données sont fictives (domaines réservés `.example`, vérifié par test).
- **Limite connue** : l'ordre des e-mails est fixe ; la correction est dans le JavaScript envoyé au
  navigateur (comme pour les quiz, jusqu'à la vérification côté serveur).

### Parcours spécialisés (étape 11)

Un parcours peut exiger d'autres parcours (`prerequisitePathIds`) : tant qu'ils ne sont pas
terminés, toutes ses leçons restent verrouillées, avec la liste de ce qui manque. Une
**spécialisation** est un parcours qui porte une fiche métier (`career`). Page commune :
`/parcours/:id` ([`path-page`](../src/app/features/learning-paths/path-page.ts)).

- **Rédigée : Analyste SOC junior** ([`analyste-soc-junior.ts`](../src/app/content/paths/analyste-soc-junior.ts)),
  ouverte après le parcours « Découverte ». Un module de 2 leçons (« Le SOC et les journaux de
  sécurité », « Trier une alerte de sécurité ») et le laboratoire **Analyser des journaux
  d'authentification** ([`logs.ts`](../src/app/core/labs/logs.ts)) : environ 30 lignes fictives
  (VPN et serveur de fichiers, adresses IP réservées à la documentation, RFC 5737), filtres par
  texte, événement et adresse IP, puis 6 questions d'enquête ; réussi si les 6 réponses sont justes,
  correction affichée après l'envoi seulement.
- **Fiche métier** : poste visé, compétences attendues, prérequis, modules en préparation (annoncés
  comme tels), projet final (livrables et critères), 4 questions et 2 mises en situation d'entretien
  (les éléments attendus ne s'affichent qu'après une réponse écrite), pistes de certifications à
  vérifier auprès des organismes.
- **Projet final et portfolio** : le rapport et l'auto-évaluation sont gardés dans le navigateur
  (`ca-projet-<id>`, relus avec vérification par `parseDraft`) ; « Exporter mon portfolio » télécharge
  un fichier Markdown ([`portfolio.ts`](../src/app/core/progress/portfolio.ts)) : leçons, laboratoires
  et compétences réellement validés, rapport, auto-évaluation, et l'avertissement que ces exercices
  simulés ne remplacent pas une expérience professionnelle.
- **En préparation** (affichées comme telles, sans contenu factice) : Pentester junior, Ingénieur
  sécurité cloud junior, Analyste vulnérabilités, Développeur orienté sécurité, Junior DevSecOps.
- **Limites** : le brouillon n'est pas enregistré sur le compte ; pas de relecture par un mentor
  (l'auto-évaluation en tient lieu) ; le verrouillage des leçons est appliqué par l'application, pas
  par le serveur (comme à l'étape 10).

### Supabase et comptes (étape 9)

**Où :** une pile Supabase **locale** (`npm run db:start`), sur les ports 546xx (API 54621, base
54622) pour ne pas gêner les autres projets du poste, réduite à la base, l'authentification, l'API
et la passerelle (Studio, temps réel, stockage, e-mails, fonctions et analytique désactivés). Le
projet hébergé se crée et se configure selon [docs/deploiement.md](deploiement.md) (étape 13).

**Schéma** (migrations versionnées dans [`supabase/migrations`](../supabase/migrations)) :

| Table | Contenu | Accès depuis le navigateur |
|---|---|---|
| `profiles` | nom affiché, rôle (`apprenant` ou `admin`), objectif hebdomadaire | lire et modifier son seul profil, et seulement le nom et l'objectif |
| `learning_paths`, `modules`, `lessons`, `labs` | structure du catalogue publié | lecture pour tous ; écriture réservée aux administrateurs |
| `quiz_attempts`, `lab_attempts` | tentatives (faits datés) | lire les siennes ; écriture seulement par les fonctions `record_quiz_attempt` et `record_lab_attempt` |
| `quiz_answer_keys` | clés de correction des 50 questions de quiz | aucun accès (aucune politique) |

Clés étrangères, index sur `(user_id, …, date)`, horodatages, contraintes (bonnes réponses incluses
dans les questions posées, sans doublon ; seuils entre 0 et 1 ; identifiants en minuscules). Le
profil est créé par un déclencheur à l'inscription, toujours avec le rôle `apprenant` : le rôle
`admin` ne s'attribue qu'en SQL. Tables du brief **non créées, volontairement** :
`user_lesson_progress` (calculée à partir des tentatives), `lesson_content`, `quizzes`,
`quiz_questions`, `quiz_options` (le contenu reste versionné avec l'application ; seules les clés
de correction sont en base, dans `quiz_answer_keys`), `achievements`, `user_achievements` (points
et badges calculés à partir des tentatives, comme la progression), `projects`,
`project_submissions` (après le MVP).

**Catalogue :** `supabase/seed.sql` est généré à partir du contenu TypeScript
(`npm run db:catalog`, et `-- --check` pour vérifier qu'il est à jour) ; ses `insert … on conflict`
peuvent être rejoués pour publier une mise à jour.

**Authentification :** e-mail et mot de passe (10 caractères minimum, contrôlés dans le formulaire
et par le serveur), limite de 30 connexions ou inscriptions par tranche de 5 minutes et par adresse
IP (réglage Supabase), déconnexion de ce navigateur seulement. En local, la confirmation par e-mail
est désactivée (aucun serveur de messagerie) ; l'application gère déjà le cas où elle est exigée.
Pages `/connexion` et `/inscription` : résumé d'erreurs qui reçoit le focus, champs reliés à leur
message, affichage du mot de passe à la demande, collage et gestionnaires de mots de passe permis
(WCAG 3.3.8). Lien de compte dans l'en-tête, section « Compte » dans le profil.

**Clés :** le navigateur n'a que l'URL et la clé « publishable » ([`environment.ts`](../src/environments/environment.ts)) ;
la clé secrète n'est nulle part dans le dépôt. Le client est chargé à la demande : le premier
affichage reste à environ 290 ko de JavaScript.

**Tests :** [`supabase/tests/database/rls.test.sql`](../supabase/tests/database/rls.test.sql)
(pgTAP, `npm run db:test`) vérifie l'isolation entre utilisateurs, le rôle non modifiable, les
tentatives non modifiables, le catalogue en lecture seule et les contraintes ;
[`recording.test.sql`](../supabase/tests/database/recording.test.sql) la correction côté serveur et
la limite de débit ; [`hardening.test.sql`](../supabase/tests/database/hardening.test.sql) les droits
d'exécution, la taille des réponses et les noms affichés. Les tests e2e de compte s'exécutent contre
la pile locale et sont signalés « ignorés » si elle est arrêtée.

Commandes : `npm run db:start`, `db:stop`, `db:reset` (réapplique migrations et catalogue),
`db:test`, `db:catalog`, `db:types` (régénère `database.types.ts`), `db:backup` et `db:restore`
(voir la section 6).

Contrôles d'ensemble, sans Docker : `npm run verify` (lint, tests unitaires avec seuils de
couverture, build, recherche de secrets, audit des dépendances, catalogue à jour). Avec la pile
locale : `npm run db:test` et `npm run e2e`.

## 5. Progression

Fichiers : [`progress.model.ts`](../src/app/core/models/progress.model.ts) (format),
[`progress.ts`](../src/app/core/progress/progress.ts) (règles),
[`progress.store.ts`](../src/app/core/progress/progress.store.ts) (stockage).

| Enregistré | Calculé à partir des tentatives |
|---|---|
| Tentatives de quiz : questions tirées et questions réussies | Score, meilleur et dernier score, nombre de tentatives |
| Tentatives de laboratoire : réussite et indices utilisés | Statut de chaque leçon, leçon recommandée, compétences, progression globale |
| Objectif hebdomadaire facultatif (1 à 7 leçons) | Leçons validées depuis lundi 0 h |

Règles (testées dans [`progress.spec.ts`](../src/app/core/progress/progress.spec.ts)) :
- **leçon validée** : un quiz atteint le seuil du module (80 %) et, si la leçon a un laboratoire, ce
  laboratoire a été réussi ; la date de validation est la plus tardive des deux réussites ;
- **statuts** : verrouillée (un prérequis n'est pas validé, ou un parcours prérequis n'est pas
  terminé), disponible, commencée (tentée sans être
  validée), validée ;
- **leçon recommandée** : une leçon commencée d'abord, sinon la première disponible du parcours en cours ;
- **compétence acquise** : toutes les leçons et tous les laboratoires qui l'entraînent sont validés ;
- lire une page ne rapporte rien.

- **MVP :** stockage dans le navigateur (`localStorage`, clé `ca-progress`), avec `schemaVersion`
  pour migrer le format. L'utilisateur peut modifier ces données : chaque entrée est vérifiée à la
  lecture (`parseProgress`), les entrées invalides sont ignorées, les dates normalisées.
- **Avec un compte (étape 10)** : la progression affichée est celle du compte, chargée à l'ouverture
  de la session ([`account-progress.ts`](../src/app/core/progress/account-progress.ts)). Chaque
  tentative passe par une fonction serveur :
  - `record_quiz_attempt(leçon, réponses)` vérifie que les questions appartiennent au quiz (bon
    nombre, sans doublon), **corrige les réponses avec ses propres clés**, date avec l'heure du
    serveur et renvoie la tentative enregistrée ;
  - `record_lab_attempt(laboratoire, réussite, indices)` vérifie le laboratoire et date la fin ;
  - limitation de débit : 30 tentatives de chaque sorte par heure et par compte.
  L'objectif hebdomadaire est enregistré dans le profil. En cas d'échec réseau, un message le dit
  et l'envoi peut être refait (les réponses sont conservées).
- **Tentatives faites sans compte** : elles restent dans le navigateur et réapparaissent à la
  déconnexion, mais ne sont pas ajoutées au compte, car le serveur n'a pas pu les vérifier ; le
  profil l'indique.
- **Au démarrage avec une session gardée**, les pages attendent la progression du compte (5 s au
  plus) : sinon une leçon apparaîtrait verrouillée puis déverrouillée, ce qui recréerait un
  laboratoire en cours. Les chargements ne réagissent qu'à un changement d'utilisateur, et un
  chargement dépassé est ignoré.
- **Temps d'apprentissage :** le temps passé n'est pas mesurable de façon fiable dans le navigateur,
  il n'est donc pas affiché. Le tableau de bord affiche à la place le **temps de cours restant estimé**
  (somme des durées prévues des leçons non validées), présenté comme une estimation.
- **Notions mal comprises :** calculées à partir de la dernière tentative (`objectivesToReview`),
  affichées après un quiz et dans la page « Quiz et examens ».
- **Points d'expérience et badges** ([`achievements.ts`](../src/app/core/progress/achievements.ts)),
  réservés aux comptes (calculés à partir de tentatives vérifiées) : leçon validée 100, laboratoire
  réussi 50, bonus sans indice 25, compétence acquise 150. Refaire un quiz réussi ne rapporte rien.
  Badges : Premier pas, Sans faute, Persévérance (réussir après un échec), Premier laboratoire,
  Sans indice, Première compétence, et un badge par parcours terminé. Affichés sur la page
  Compétences ; total sur le tableau de bord.
- **Historique des laboratoires** : date, résultat et indices de chaque tentative, sur la page du
  laboratoire.

## 6. Sécurité et périmètre des simulations

| Catégorie (brief §9) | Dans le MVP |
|---|---|
| Simulations visuelles | Animations SVG, terminal, détecteur de phishing et analyseur de journaux simulés en TypeScript |
| Outils réellement exécutés | Aucun |
| Données fictives | E-mails, journaux et noms de domaine synthétiques (domaines réservés `.example` et `.test`, RFC 2606) |
| Environnements isolés | Aucun. Si l'exécution réelle devient nécessaire : service séparé, éphémère et limité en ressources |

### Mesures de sécurité (étape 12)

| Principe (brief §14) | Mise en œuvre | Vérifié par |
|---|---|---|
| Protection contre les injections (XSS) | Politique de sécurité du contenu : scripts limités aux empreintes générées au build (`autoCsp`, `strict-dynamic`), `object-src 'none'`, `base-uri 'self'` ; connexions limitées au site et à Supabase, aucun cadre, aucun worker. Angular échappe tout affichage ; ni `innerHTML`, ni `eval`, ni contournement de la sanitisation dans le code | `e2e/security.spec.ts` : aucune violation sur les pages principales, script injecté bloqué |
| Protection contre les injections (SQL) | Fonctions paramétrées, `search_path` vide, aucun SQL dynamique construit avec une saisie | relecture, pgTAP |
| Validation côté client et côté serveur | Formulaires validés dans l'application ; côté serveur : contraintes de tables, réponses d'un quiz limitées à 8 Ko, questions vérifiées, nom affiché sans caractères de contrôle ou invisibles | pgTAP |
| Contrôle d'accès systématique | RLS sur toutes les tables ; sans compte, aucune fonction appelable ; avec un compte, seulement `record_quiz_attempt`, `record_lab_attempt` et `is_admin` ; fonctions futures fermées par défaut | `hardening.test.sql`, `rls.test.sql` |
| Limitation de débit | 30 tentatives de chaque sorte par heure et par compte, avec un verrou par compte : des envois simultanés ne la dépassent plus (mesuré avant : 37 acceptés sur 40) ; limites de Supabase Auth pour l'inscription et la connexion (`config.toml`) | `e2e/security.spec.ts` (40 envois simultanés, 30 acceptés) |
| Gestion sécurisée des secrets | Seule la clé publique est dans le dépôt ; `npm run check:secrets` cherche clés secrètes, jetons `service_role`, clés privées et fichiers `.env` dans le dépôt (fichiers nouveaux compris) et le build | `npm run verify` |
| Journaux sans données sensibles | Un seul `console.error` (échec de démarrage) ; les erreurs Supabase sont traduites sans afficher de jeton | relecture |
| Dépendances maintenues | `npm run check:deps` (`npm audit`, 0 vulnérabilité) ; correctifs appliqués ; montées de version majeures (TypeScript 7) et du CLI Supabase décidées à part | `npm run verify` |
| Sauvegardes et restauration | Voir ci-dessous | restauration vérifiée en local |
| Tests des politiques RLS | 44 tests pgTAP | `npm run db:test` |
| Isolation des futurs laboratoires exécutables | Aucun outil réellement exécuté ; si besoin : service séparé, éphémère, sans accès à la base | relecture |

**Audit offensif (après l'étape 13).** Failles trouvées, prouvées puis corrigées :

| Faille | Gravité | Correction | Vérifié par |
|---|---|---|---|
| Connexion forcée (CWE-352) : un lien contenant les jetons du compte d'un attaquant connectait la victime à ce compte (flux implicite) | moyenne | flux PKCE : le retour d'e-mail n'est accepté que par le navigateur qui a lancé l'inscription | `e2e/auth.spec.ts` (attaque rejouée, échoue sans PKCE) |
| Énumération des comptes : l'inscription d'une adresse déjà confirmée répondait « compte existant » | faible | confirmation e-mail et téléphone exigée en local comme en production ; l'interface répond pareil dans tous les cas | `e2e/auth.spec.ts`, test unitaire de `AuthService` |
| Droits TRUNCATE (ignore la RLS), TRIGGER et REFERENCES pour les rôles de l'API | faible | migration `20261018120000_droits_tables.sql` | `hardening.test.sql` |
| Chaîne d'approvisionnement de la CI : actions sur étiquettes déplaçables (CWE-829), scripts d'installation exécutés | faible | actions épinglées par commit, `npm ci --ignore-scripts`, Dependabot | relecture, CI |
| Mot de passe modifiable avec un simple jeton de session | faible | `secure_password_change` | configuration |

Risque résiduel : l'API d'inscription de Supabase renvoie un utilisateur factice sans identité pour une adresse déjà inscrite ; un script peut donc encore le deviner. Parade en production : captcha à l'inscription (voir docs/deploiement.md).

**Sauvegarde et restauration.** La sauvegarde ne contient que les données des apprenants (comptes,
profils, tentatives) : le schéma et le catalogue se recréent depuis git.
- Sauvegarder : `npm run db:backup` (local) ou `npm run db:backup -- --linked` (projet hébergé,
  étape 13). Le fichier `backups/<date>/donnees.sql` contient des adresses e-mail et des empreintes
  de mots de passe : `backups/` est exclu de git, et toute copie hors du poste doit être chiffrée.
- Restaurer en local : `npx supabase db reset`, puis `npm run db:restore -- backups/<date>/donnees.sql`.
  Le chargement se fait en une transaction, déclencheurs suspendus.
- Restaurer un projet hébergé : `supabase db push` sur un projet vide, puis `psql` sur l'adresse de
  la base avec `--single-transaction -v ON_ERROR_STOP=1`, la commande
  `SET session_replication_role = replica` et le fichier `donnees.sql`. Les sauvegardes
  automatiques de l'hébergeur dépendent de l'offre choisie (étape 13).

Limites connues du MVP :
- **Les réponses de quiz sont lisibles par un apprenant curieux** dans le JavaScript envoyé au navigateur (décision de l'étape 12, voir « Moteur de quiz ») : points et badges restent des repères pédagogiques, pas une certification.
- **La réussite d'un laboratoire est déclarée par le navigateur** (simulation côté client) : le serveur vérifie le laboratoire et la date, pas le travail fait.
- **Clé Supabase :** la clé secrète n'est jamais dans le front ni dans le dépôt ; seule la clé publique, protégée par RLS, y figure.
- **En-têtes HTTP** (`frame-ancestors`, HSTS, `X-Content-Type-Options`, politique de référent) : une balise `<meta>` ne peut pas les porter ; ils sont posés par le `.htaccess` du site (étape 13, ci-dessous).
- **Mots de passe :** 10 caractères au minimum, sans règle de composition (recommandation NIST) ; la vérification des mots de passe divulgués n'existe que sur certaines offres hébergées.

### Déploiement (étape 13)

Procédure complète, pas à pas : [docs/deploiement.md](deploiement.md). Rien n'est publié
automatiquement.

- **Configuration de production** : la configuration de build `deploy` remplace `environment.ts`
  par `environment.prod.ts`, dont les valeurs sont injectées par `npm run build:prod` (`--define`)
  à partir de `SUPABASE_URL` et `SUPABASE_PUBLISHABLE_KEY`. Le script refuse une clé secrète et une
  adresse en `http`, remplace l'adresse de Supabase dans la politique de sécurité du contenu, écrit
  le `.htaccess` et vérifie qu'aucune adresse locale ni aucun secret ne part en ligne.
- **Hébergement (Hostinger, LiteSpeed compatible Apache)** :
  [`deploy/hostinger.htaccess`](../deploy/hostinger.htaccess) force HTTPS, sert `index.html` pour
  les adresses de l'application (un fichier absent reste une vraie erreur 404), pose les en-têtes
  de sécurité (CSP avec `frame-ancestors 'none'`, HSTS, `nosniff`, `X-Frame-Options`, politique de
  référent, `Permissions-Policy`, `Cross-Origin-Opener-Policy`) et règle le cache (fichiers à
  empreinte : un an ; `index.html` : toujours revalidé). Vérifié sur Apache 2.4 dans Docker : en-têtes,
  404, redirection HTTPS, et toute la suite e2e (`E2E_BASE_URL`).
- **Confirmation par e-mail** : à activer en production. Le lien ramène sur `/profil` ; le client
  Supabase (`detectSessionInUrl`) ouvre la session et retire les jetons de l'adresse. Testé de
  bout en bout avec un lien généré par la pile locale.
- **Intégration continue** : [`.github/workflows/ci.yml`](../.github/workflows/ci.yml), à
  l'activation du dépôt GitHub : `npm run verify`, puis pile Supabase éphémère, pgTAP et Playwright.
- **Tests sur le site en ligne** : `E2E_BASE_URL=https://<domaine>` vise le site publié, sans build.

## 7. Feuille de route

| Étape | Contenu |
|---|---|
| 3 | Design system (thèmes sombre et clair), navigation principale, pages d'erreur et états vides |
| 4 | Tableau de bord |
| 5 | Moteur de parcours et de leçons, 5 leçons du parcours « Découverte », progression locale |
| 6 | Moteur de quiz et corrections |
| 7 | Animation réseau interactive |
| 8 | Laboratoires : terminal Linux simulé, détection de phishing |
| 9 | Supabase : schéma, migrations, RLS, authentification |
| 10 | Progression et résultats enregistrés côté serveur |
| 11 | Parcours spécialisés |
| 12 | Renforcement de la sécurité et des tests |
| 13 | Préparation du déploiement : build de production, `.htaccess` Hostinger, CI, procédure de mise en ligne |
