# Mise en ligne de Cyber Academy

Cible retenue : **Supabase hébergé** pour les comptes et la base, **Hostinger** pour le site (fichiers
statiques servis par LiteSpeed, qui lit le `.htaccess` comme Apache). Rien n'est publié
automatiquement : chaque étape ci-dessous se fait à la main, dans l'ordre.

## 1. Ce qu'il faut avant de commencer

- Un compte Supabase. L'offre gratuite suffit pour démarrer ; vérifiez ses limites (projet mis en
  pause après une période d'inactivité, sauvegardes) avant d'ouvrir le site au public.
- Un hébergement Hostinger avec un nom de domaine et le certificat SSL activé (hPanel → SSL).
- Une adresse e-mail d'envoi pour les messages de confirmation, avec ses paramètres SMTP (par
  exemple une boîte Hostinger : serveur `smtp.hostinger.com`, port 465, SSL).
- Ce dépôt, Node.js 24 et `npm ci`.

## 2. Créer la base Supabase

1. Créez un projet, région Europe (Paris ou Francfort). Gardez le mot de passe de la base dans un
   gestionnaire de mots de passe.
2. Reliez le dépôt au projet, puis appliquez les migrations et le catalogue :

   ```bash
   npx supabase login
   npx supabase link --project-ref <identifiant-du-projet>
   npx supabase db push --include-seed
   ```

3. Facultatif, avant l'ouverture : `npx supabase test db --linked` exécute les 44 tests pgTAP sur la
   base hébergée (chaque fichier s'exécute dans une transaction annulée à la fin).
4. Tableau de bord → Advisors (Security et Performance) : aucune alerte ne doit rester ouverte.

## 3. Réglages de l'authentification (tableau de bord → Authentication)

| Réglage | Valeur |
|---|---|
| URL Configuration → Site URL | `https://<votre-domaine>` |
| URL Configuration → Redirect URLs | `https://<votre-domaine>/**` |
| Sign In / Providers → Email → Confirm email | activé : sans confirmation, n'importe qui pourrait s'inscrire avec l'adresse d'un autre |
| Emails → SMTP Settings | votre serveur SMTP : le service d'envoi fourni par défaut est limité à quelques messages par heure et n'est pas fait pour un site public |
| Mot de passe → longueur minimale | 10 caractères (comme en local) |
| Connexions anonymes | désactivées (réglage par défaut) |
| Sign In / Providers → Phone → Confirm phone | activé, même sans inscription par SMS : sinon l'inscription d'une adresse déjà confirmée répond « User already registered » et révèle qui a un compte |
| Mot de passe → Secure password change | activé : un jeton de session volé ne suffit pas à changer le mot de passe |
| Rate Limits | vérifier les limites d'inscription, de connexion et d'envoi d'e-mails |
| Attack Protection → Captcha | recommandé avant d'ouvrir l'inscription au public (Turnstile ou hCaptcha) : l'API d'inscription laisse deviner qu'une adresse a déjà un compte (comportement de Supabase), le captcha empêche de le tester en masse ; il faudra autoriser son domaine dans la politique de sécurité du contenu |

Traduisez aussi le modèle d'e-mail « Confirm signup » en français. Le lien de confirmation ramène
sur `/profil` : l'application ouvre la session et retire les jetons de l'adresse (testé de bout en
bout dans `e2e/auth.spec.ts`).

## 4. Construire le site

La clé à utiliser est la **clé publique** (Project Settings → API Keys → Publishable key,
`sb_publishable_…`). Le script refuse une clé secrète et une adresse en `http`.

```powershell
$env:SUPABASE_URL = "https://<identifiant-du-projet>.supabase.co"
$env:SUPABASE_PUBLISHABLE_KEY = "sb_publishable_..."
npm run build:prod
```

Le script construit l'application, remplace l'adresse de Supabase dans la politique de sécurité du
contenu, écrit le `.htaccess` (modèle : `deploy/hostinger.htaccess`) et vérifie qu'aucune adresse
locale ni aucun secret ne part en ligne. Résultat : `dist/cyber-academy/browser`.

## 5. Publier sur Hostinger

1. Gardez une copie de la version en ligne (compressez `public_html` depuis le gestionnaire de
   fichiers) : c'est votre retour arrière.
2. Videz `public_html`, puis téléversez **tout** le contenu de `dist/cyber-academy/browser`,
   y compris `.htaccess` (fichier caché : activez l'affichage des fichiers cachés), par exemple
   sous forme d'archive zip décompressée sur place.
3. Le `.htaccess` gère déjà la redirection vers HTTPS, le routage de l'application, le cache et les
   en-têtes de sécurité (vérifiés sur un serveur Apache, en local).

## 6. Vérifier après la mise en ligne

```bash
curl -I https://<votre-domaine>/profil
```

Attendus : `200`, `Content-Security-Policy` avec `frame-ancestors 'none'`,
`Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Cache-Control: no-cache`.

Tests de parcours sur le site en ligne, sans création de compte (PowerShell) :

```powershell
$env:E2E_BASE_URL = "https://<votre-domaine>"
npx playwright test e2e/shell.spec.ts e2e/accessibility.spec.ts e2e/lessons.spec.ts e2e/quiz.spec.ts e2e/labs.spec.ts e2e/specialization.spec.ts e2e/security.spec.ts --grep-invert "simultanés"
```

Puis, à la main : créez un compte avec une vraie adresse, vérifiez que l'e-mail de confirmation
arrive (en français), que le lien ramène sur le profil avec la session ouverte, puis supprimez ce
compte de test (Authentication → Users).

## 7. Sauvegardes et retour arrière

- Données : `npm run db:backup -- --linked` (projet relié à l'étape 2), puis copie chiffrée hors du
  poste. Vérifiez aussi ce que votre offre Supabase sauvegarde (Database → Backups).
- Restauration sur un projet neuf : `npx supabase db push --include-seed`, puis `psql` sur l'adresse
  de la base avec `--single-transaction -v ON_ERROR_STOP=1`, la commande
  `SET session_replication_role = replica` et le fichier `donnees.sql` (procédure vérifiée en local
  avec `npm run db:restore`, voir docs/architecture.md, section 6).
- Site : re-téléversez la copie gardée à l'étape 5.
- Base : les migrations ne s'annulent pas ; une erreur se corrige par une nouvelle migration.

## 8. Intégration continue

Une fois le dépôt publié sur GitHub (privé conseillé), `.github/workflows/ci.yml` s'exécute à
chaque envoi : `npm run verify`, puis une pile Supabase créée pour l'occasion, les tests pgTAP et
les tests de parcours. Aucun secret n'est nécessaire. Pour durcir la chaîne d'approvisionnement,
remplacez les versions des actions (`@v4`) par leur empreinte de commit.

La publication automatique vers Hostinger depuis la CI n'est pas mise en place : elle demanderait
de confier un accès FTP ou SSH à GitHub. C'est une décision à prendre à part.
