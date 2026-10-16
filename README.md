# Cyber Academy

Plateforme gratuite, en français, pour apprendre la cybersécurité en partant de zéro.

Construite avec Angular 22 (composants standalone, signals). Supabase sera ajouté à l'étape 9.
Architecture et choix techniques : [docs/architecture.md](docs/architecture.md).

## Prérequis

- Node.js 22.22.3 ou plus, ou 24.15.0 ou plus (testé avec 24.22.0)
- npm 11

## Commandes

| Commande | Rôle |
|---|---|
| `npm install` | Installer les dépendances |
| `npx playwright install chromium` | Installer le navigateur des tests de parcours (une seule fois) |
| `npm start` | Serveur de développement sur http://localhost:4200 |
| `npm run build` | Build de production dans `dist/` |
| `npm test -- --watch=false` | Tests unitaires (Vitest) |
| `npm run lint` | ESLint : TypeScript, templates et règles d'accessibilité |
| `npm run e2e` | Build de production puis tests de parcours (Playwright, bureau et mobile, audit axe, thèmes clair et sombre) |
