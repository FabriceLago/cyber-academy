# Cyber Academy

Plateforme gratuite, en français, pour apprendre la cybersécurité en partant de zéro.

Angular 22 (composants standalone, signals) et Supabase (authentification, base PostgreSQL, RLS).
Architecture et choix techniques : [docs/architecture.md](docs/architecture.md).
Mise en ligne (Supabase hébergé + Hostinger) : [docs/deploiement.md](docs/deploiement.md).

## Prérequis

- Node.js 22.22.3 ou plus, ou 24.15.0 ou plus (testé avec 24.22.0), npm 11
- Docker Desktop, pour la pile Supabase locale (comptes, progression enregistrée, tests de base)

## Commandes

| Commande | Rôle |
|---|---|
| `npm install` | Installer les dépendances |
| `npx playwright install chromium` | Installer le navigateur des tests de parcours (une seule fois) |
| `npm run db:start` / `db:stop` | Démarrer ou arrêter Supabase en local (API sur le port 54621) |
| `npm start` | Serveur de développement sur http://localhost:4200 |
| `npm test -- --watch=false` | Tests unitaires et de composants (Vitest) |
| `npm run lint` | ESLint : TypeScript, templates et règles d'accessibilité |
| `npm run verify` | Contrôle complet sans Docker : lint, tests avec seuils de couverture, build, secrets, dépendances, catalogue |
| `npm run db:test` | Tests de la base : RLS, enregistrement, durcissement (pgTAP) |
| `npm run e2e` | Build puis tests de parcours (Playwright, bureau et mobile, audit axe, thèmes clair et sombre) |
| `npm run db:reset` | Recréer la base locale (migrations et catalogue) |
| `npm run db:catalog` / `db:types` | Régénérer le catalogue SQL ou les types TypeScript de la base |
| `npm run db:backup` / `db:restore` | Sauvegarder ou recharger les données des apprenants |
| `npm run build:prod` | Build à publier, avec `SUPABASE_URL` et `SUPABASE_PUBLISHABLE_KEY` (voir la mise en ligne) |

Seule la clé publique de Supabase (`sb_publishable_…`) est dans le dépôt ; la clé secrète n'y
figure jamais (`npm run check:secrets` le vérifie).
