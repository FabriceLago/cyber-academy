# Architecture de Cyber Academy

État : étape 2 (socle technique et modèle de contenu). Mise à jour : 2026-10-16.

## 1. Principes

1. **Le MVP fonctionne entièrement dans le navigateur.** Supabase arrive à l'étape 9 sans changer le modèle de contenu.
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
| Données (étape 9) | Supabase : PostgreSQL, Auth, Row Level Security | — |
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
│  ├─ quiz/              correction des questions à options               (étape 5, fait)
│  └─ page-title.strategy.ts  titre d'onglet « Page · Cyber Academy »     (étape 3, fait)
├─ shared/
│  ├─ icon/              icônes SVG du design system                      (étape 3, fait)
│  ├─ empty-state/       encadré « rien à afficher, voici pourquoi »      (étape 3, fait)
│  └─ progress-bar/      jauge accessible (role="progressbar")            (étape 4, fait)
├─ content/              catalogue et 5 leçons complètes (lessons/)       (étape 5, fait)
└─ features/
   ├─ coming-soon/       page provisoire des sections à venir             (étape 3, fait)
   ├─ errors/            page introuvable, page d'erreur de chargement    (étape 3, fait)
   ├─ profile/           thème, objectif hebdomadaire, réinitialisation   (étape 5, fait)
   ├─ dashboard/         tableau de bord                                  (étape 4, fait)
   ├─ skills/            compétences                                      (étape 4, fait)
   ├─ learning-paths/    carte des parcours                               (étape 5, fait)
   ├─ lessons/           page de leçon, liste, exercice guidé             (étape 5, fait)
   ├─ quizzes/           moteur et interface de quiz                      (étape 6)
   ├─ labs/              Cyber Lab : terminal et phishing simulés         (étape 8)
   └─ projects/          projets pratiques                                (après le MVP)
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

**Classes globales** : `.btn` (`-primary`, `-secondary`, `-ghost`, `-icon`), `.card`,
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
- Annoncé dans la page, pas simulé : animation et démonstration illustrées (étape 7, la description
  complète est affichée), quiz jouable (étape 6), laboratoire (étape 8).

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
- **Notions mal comprises :** elles demandent le lien question → objectif, qui vient avec les quiz
  (étape 6).

## 6. Sécurité et périmètre des simulations

| Catégorie (brief §9) | Dans le MVP |
|---|---|
| Simulations visuelles | Animations SVG, terminal et détecteur de phishing simulés en TypeScript |
| Outils réellement exécutés | Aucun |
| Données fictives | E-mails, journaux et noms de domaine synthétiques (domaines réservés `.example` et `.test`, RFC 2606) |
| Environnements isolés | Aucun. Si l'exécution réelle devient nécessaire : service séparé, éphémère et limité en ressources |

Limites connues du MVP :
- **Les réponses sont visibles par un apprenant curieux :** elles se trouvent dans le JavaScript envoyé au navigateur. Aucun badge ni examen ne sera présenté comme certifiant avant la correction côté serveur (étapes 9-10).
- **Clé Supabase :** la clé de service ne sera jamais dans le front ; seule la clé publique, protégée par RLS, y figurera.

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
