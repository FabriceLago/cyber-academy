# Architecture de Cyber Academy

État : étape 2 (socle technique et modèle de contenu). Mise à jour : 2026-10-16.

## 1. Principes

1. **La plateforme fonctionne sans compte.** Le compte (Supabase, étape 9) est facultatif ; jusqu'à l'étape 10, la progression reste dans le navigateur. Le modèle de contenu n'a pas changé.
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
│  ├─ progress/          règles de progression, stockage validé           (étape 4, fait)
│  ├─ quiz/              tirage, correction, notions à revoir             (étape 6, fait)
│  ├─ labs/              moteur du terminal simulé, correction phishing   (étape 8, fait)
│  ├─ supabase/          client typé, types générés du schéma             (étape 9, fait)
│  ├─ auth/              session, profil, messages d'erreur               (étape 9, fait)
│  └─ page-title.strategy.ts  titre d'onglet « Page · Cyber Academy »     (étape 3, fait)
├─ shared/
│  ├─ icon/              icônes SVG du design system                      (étape 3, fait)
│  ├─ empty-state/       encadré « rien à afficher, voici pourquoi »      (étape 3, fait)
│  ├─ progress-bar/      jauge accessible (role="progressbar")            (étape 4, fait)
│  └─ animation-player/  lecteur commun des animations pédagogiques       (étape 7, fait)
├─ content/              catalogue, 5 leçons (lessons/), 2 labos (labs/)  (étapes 5 et 8, fait)
└─ features/
   ├─ coming-soon/       page provisoire des sections à venir             (étape 3, fait)
   ├─ auth/              connexion et création de compte                  (étape 9, fait)
   ├─ errors/            page introuvable, page d'erreur de chargement    (étape 3, fait)
   ├─ profile/           thème, objectif, réinitialisation, compte        (étapes 5 et 9, fait)
   ├─ dashboard/         tableau de bord                                  (étape 4, fait)
   ├─ skills/            compétences                                      (étape 4, fait)
   ├─ learning-paths/    carte des parcours                               (étape 5, fait)
   ├─ lessons/           page de leçon, liste, exercice guidé             (étape 5, fait)
   │  └─ animations/     animation « Le trajet d'un paquet »              (étape 7, fait)
   ├─ quizzes/           page de quiz, liste des quiz, saisie des réponses (étape 6, fait)
   ├─ labs/              Cyber Lab : terminal et phishing simulés         (étape 8, fait)
   └─ projects/          projets pratiques                                (après le MVP)
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
- **Limite connue :** les réponses attendues sont dans le JavaScript envoyé au navigateur ; une
  correction côté serveur est prévue avec Supabase (étapes 9-10).

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

### Supabase et comptes (étape 9)

**Où :** une pile Supabase **locale** (`npm run db:start`), sur les ports 546xx (API 54621, base
54622) pour ne pas gêner les autres projets du poste, réduite à la base, l'authentification, l'API
et la passerelle (Studio, temps réel, stockage, e-mails, fonctions et analytique désactivés). Le
projet hébergé sera créé au déploiement (étape 13).

**Schéma** (migrations versionnées dans [`supabase/migrations`](../supabase/migrations)) :

| Table | Contenu | Accès depuis le navigateur |
|---|---|---|
| `profiles` | nom affiché, rôle (`apprenant` ou `admin`), objectif hebdomadaire | lire et modifier son seul profil, et seulement le nom et l'objectif |
| `learning_paths`, `modules`, `lessons`, `labs` | structure du catalogue publié | lecture pour tous ; écriture réservée aux administrateurs |
| `quiz_attempts`, `lab_attempts` | tentatives (faits datés) | lire les siennes ; aucune écriture (étape 10 : fonctions serveur qui corrigent elles-mêmes) |

Clés étrangères, index sur `(user_id, …, date)`, horodatages, contraintes (bonnes réponses incluses
dans les questions posées, sans doublon ; seuils entre 0 et 1 ; identifiants en minuscules). Le
profil est créé par un déclencheur à l'inscription, toujours avec le rôle `apprenant` : le rôle
`admin` ne s'attribue qu'en SQL. Tables du brief **non créées, volontairement** :
`user_lesson_progress` (calculée à partir des tentatives), `lesson_content`, `quizzes`,
`quiz_questions`, `quiz_options` (le contenu reste versionné avec l'application ; les clés de
correction rejoindront la base à l'étape 10, dans une table illisible depuis le navigateur),
`projects`, `project_submissions`, `achievements`, `user_achievements` (après le MVP et à
l'étape 10).

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
tentatives non modifiables, le catalogue en lecture seule et les contraintes. Les tests e2e de
compte s'exécutent contre la pile locale et sont signalés « ignorés » si elle est arrêtée.

Commandes : `npm run db:start`, `db:stop`, `db:reset` (réapplique migrations et catalogue),
`db:test`, `db:catalog`, `db:types` (régénère `database.types.ts`).

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
- **statuts** : verrouillée (un prérequis n'est pas validé), disponible, commencée (tentée sans être
  validée), validée ;
- **leçon recommandée** : une leçon commencée d'abord, sinon la première disponible du parcours en cours ;
- **compétence acquise** : toutes les leçons et tous les laboratoires qui l'entraînent sont validés ;
- lire une page ne rapporte rien.

- **MVP :** stockage dans le navigateur (`localStorage`, clé `ca-progress`), avec `schemaVersion`
  pour migrer le format. L'utilisateur peut modifier ces données : chaque entrée est vérifiée à la
  lecture (`parseProgress`), les entrées invalides sont ignorées, les dates normalisées.
- **Enregistrement des tentatives :** par les quiz (étape 6) et les laboratoires (étape 8).
- **Étape 10 :** tables Supabase `quiz_attempts` et `lab_attempts`, en insertion seule, protégées par RLS.
- **Temps d'apprentissage :** le temps passé n'est pas mesurable de façon fiable dans le navigateur,
  il n'est donc pas affiché. Le tableau de bord affiche à la place le **temps de cours restant estimé**
  (somme des durées prévues des leçons non validées), présenté comme une estimation.
- **Notions mal comprises :** calculées à partir de la dernière tentative (`objectivesToReview`),
  affichées après un quiz et dans la page « Quiz et examens ».
- **Points d'expérience et badges :** pas encore. Stockés dans le navigateur, ils seraient
  modifiables par l'apprenant ; ils viendront avec la progression enregistrée côté serveur (étape 10).

## 6. Sécurité et périmètre des simulations

| Catégorie (brief §9) | Dans le MVP |
|---|---|
| Simulations visuelles | Animations SVG, terminal et détecteur de phishing simulés en TypeScript |
| Outils réellement exécutés | Aucun |
| Données fictives | E-mails, journaux et noms de domaine synthétiques (domaines réservés `.example` et `.test`, RFC 2606) |
| Environnements isolés | Aucun. Si l'exécution réelle devient nécessaire : service séparé, éphémère et limité en ressources |

Limites connues du MVP :
- **Les réponses sont visibles par un apprenant curieux :** elles se trouvent dans le JavaScript envoyé au navigateur. Aucun badge ni examen ne sera présenté comme certifiant avant la correction côté serveur (étapes 9-10).
- **Clé Supabase :** la clé secrète n'est jamais dans le front ni dans le dépôt ; seule la clé publique, protégée par RLS, y figure.

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
| 13 | Déploiement |
