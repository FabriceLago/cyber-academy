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

Traduisez aussi en français les modèles d'e-mail « Confirm signup » et « Reset password » (lien
de réinitialisation, qui ramène sur `/nouveau-mot-de-passe`). Le lien de confirmation ramène
sur `/profil` : l'application ouvre la session et retire les jetons de l'adresse (testé de bout en
bout dans `e2e/auth.spec.ts`).

## 4. Construire le site

Complétez d'abord les mentions légales et la politique de confidentialité : remplacez chaque
`A_COMPLETER` de `src/app/features/legal/legal-pages.ts` (éditeur, adresse, contact, coordonnées
des hébergeurs, durée de conservation des sauvegardes). Le script refuse de construire tant qu'il
en reste un. Pour une préproduction sur un domaine temporaire, `npm run build:prod -- --apercu`
les accepte et ajoute `X-Robots-Tag: noindex, nofollow` au `.htaccess`.

La clé à utiliser est la **clé publique** (Project Settings → API Keys → Publishable key,
`sb_publishable_…`). Le script refuse une clé secrète et une adresse en `http`.

```powershell
$env:SUPABASE_URL = "https://<identifiant-du-projet>.supabase.co"
$env:SUPABASE_PUBLISHABLE_KEY = "sb_publishable_..."
$env:SITE_URL = "https://<votre-domaine>"
npm run build:prod
```

Le script construit l'application, remplace l'adresse de Supabase dans la politique de sécurité du
contenu, écrit le `.htaccess` (modèle : `deploy/hostinger.htaccess`) et vérifie qu'aucune adresse
locale ni aucun secret ne part en ligne. Résultat : `dist/cyber-academy/browser`.

Il écrit aussi une page statique par terme du glossaire (`glossaire/<terme>/index.html`), lisible
par les moteurs de recherche sans JavaScript. `SITE_URL` (facultative tant que le domaine n'est pas
choisi) leur ajoute leur adresse canonique et produit `sitemap.xml` et `robots.txt` : à déclarer
ensuite dans Google Search Console.

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

Attendus : `200`, `Content-Security-Policy` avec `frame-ancestors 'none'` et `worker-src 'self'`,
`Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Cache-Control: no-cache`.

Mode hors ligne : `curl -I https://<votre-domaine>/ngsw-worker.js` doit renvoyer
`Cache-Control: no-cache` (sinon une nouvelle version ne serait pas détectée), et
`curl -I https://<votre-domaine>/manifest.webmanifest` le type `application/manifest+json`.

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

## 9. Abonnement Premium (Stripe)

Le parcours Découverte est gratuit ; les parcours marqués `premium: true` dans le contenu (pour
l'instant « Analyste SOC junior ») demandent un abonnement actif. Le serveur le vérifie à chaque
enregistrement (`record_quiz_attempt`, `record_lab_attempt`), pas seulement l'affichage.

1. **Compte Stripe** (stripe.com), en mode test d'abord. Créez un produit « Cyber Academy Premium »
   avec deux prix récurrents : 9,90 € par mois et 99 € par an. Ces montants sont affichés par
   `src/app/features/subscription/subscription-page.ts` (constante `PLANS`) : gardez-les identiques.
2. **Secrets des fonctions** (jamais dans le dépôt) :

   ```bash
   npx supabase secrets set --project-ref <projet> \
     STRIPE_SECRET_KEY=sk_test_... STRIPE_PRICE_MENSUEL=price_... STRIPE_PRICE_ANNUEL=price_... \
     SITE_URL=https://<votre-domaine>
   ```

3. **Fonctions** : `npx supabase functions deploy create-checkout customer-portal stripe-webhook --project-ref <projet>`.
4. **Webhook Stripe** (Developers → Webhooks → Add endpoint) :
   `https://<projet>.supabase.co/functions/v1/stripe-webhook`, événements
   `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`.
   Copiez son secret de signature, puis `npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`.
5. **Portail client Stripe** (Settings → Billing → Customer portal) : activez la résiliation, le
   changement de formule et la mise à jour du moyen de paiement (sans elle, un essai sans carte ne
   peut pas continuer) ; c'est la page ouverte par « Gérer mon abonnement ».
6. **Paiements refusés** (Settings → Billing → Revenue recovery) : relances automatiques (par
   exemple pendant deux semaines), puis résiliation de l'abonnement si toutes échouent ; activez
   les e-mails envoyés au client quand un paiement échoue. Pendant les relances (statut
   `past_due`), l'accès est maintenu et la page Abonnement demande de mettre à jour le moyen de
   paiement ; une fois l'abonnement résilié, l'accès se ferme.
7. **Test** : le premier abonnement d'un compte commence par 7 jours d'essai gratuit, sans carte
   (`TRIAL_DAYS` dans `supabase/functions/_shared/billing.ts`, et dans la page Abonnement) ; la
   page indique « Votre essai gratuit est en cours » et la spécialisation s'ouvre. Un compte (ou
   une adresse) déjà abonné une fois paie directement : carte de test `4242 4242 4242 4242`. Fin
   d'essai et paiement refusé se simulent avec les horloges de test de Stripe (Test clocks) et la
   carte `4000 0000 0000 0341`, acceptée à l'enregistrement puis refusée au prélèvement.
8. **Avant de vendre** : conditions générales de vente (CGV, qui décrivent l'essai sans carte et
   le maintien de l'accès pendant les relances), mentions légales complètes, puis clés Stripe en
   mode réel (`sk_live_…`, nouveaux prix, nouveau webhook).

Contrôles locaux : `supabase/tests/database/subscriptions.test.sql` (accès, enregistrements,
suppression du compte) et les tests de parcours de `e2e/specialization.spec.ts`.

## 10. Statistiques : décrochage et mesure d'audience

**Décrochage des apprenants avec un compte** (aucun traceur) : dans le tableau de bord Supabase,
SQL Editor, lancer `select * from public.learning_funnel();`. Pour chaque leçon, dans l'ordre :
apprenants qui ont tenté le quiz, qui l'ont réussi, qui ont réussi le laboratoire. Seulement des
totaux ; la fonction n'est pas appelable depuis le site.

**Mesure d'audience (Matomo, facultative)**, pour les visiteurs avec ou sans compte :

1. Hostinger : créer le sous-domaine `stats.<votre-domaine>` et une base MySQL, puis y installer
   Matomo (installateur d'applications ou archive officielle de matomo.org).
2. Matomo : ajouter le site, noter son numéro (« ID du site »), puis, dans les réglages de
   confidentialité, activer le mode CNIL (« Enforce compliance where possible ») et vérifier à la
   main ce qui reste « Unknown ». Garder l'IP tronquée sur 2 octets et une conservation de 25 mois
   au plus. Vérifier que le journal des visites et les profils de visiteurs sont désactivés
   (Système › Réglages généraux, rubrique « Live ») : la politique de confidentialité annonce des
   statistiques seulement agrégées. Le site n'utilise pas l'iframe d'opposition de Matomo (les
   cadres sont interdits par la CSP) : la case « Ne pas être compté » de la politique de
   confidentialité la remplace.
3. Reconstruire avec les deux variables :

   ```powershell
   $env:MATOMO_URL = "https://stats.<votre-domaine>/"
   $env:MATOMO_SITE_ID = "1"
   npm run build:prod
   ```

   Le script ajoute ce sous-domaine à la politique de sécurité du contenu (`connect-src`,
   `img-src`). Sans ces variables, aucune mesure n'a lieu et la politique de confidentialité
   annonce « aucune mesure d'audience ».

Le réglage relève de l'éditeur : la CNIL ne publie plus de liste d'outils exemptés, il faut
documenter que la configuration respecte ses conditions (page « Cookies : solutions pour les
outils de mesure d'audience » sur cnil.fr).

## 11. Groupes : associations et écoles

Tout compte peut créer un groupe depuis la page **Groupes** (lien dans le profil) et en donner le
code à ses membres ; ils le rejoignent en acceptant que le responsable voie leur progression
(15 ans et plus). Rien à configurer, sauf la migration `20261029100000_groupes.sql`, appliquée avec
les autres.

**Premium pour tout un groupe (offre sur devis)** : après accord et paiement (devis et facture
établis hors du site), demandez au responsable le code de son groupe, puis, dans le tableau de
bord Supabase, SQL Editor :

```sql
update public.groups set premium_until = '2027-06-30'
where join_code = 'ABCDEFGHJK';  -- code donné par le responsable
```

Le responsable et tous les membres ont alors accès au Premium jusqu'à cette date ; la page
Abonnement l'indique. Pour l'arrêter plus tôt : `set premium_until = null`. Les conditions de
cette offre (prix, durée, nombre de membres) sont à écrire dans les CGV ou dans le devis.

## 12. Surveillance : erreurs, disponibilité, captcha

**Erreurs du site** : les erreurs JavaScript des apprenants connectés arrivent dans la table
`client_errors` (migration `20261030100000_erreurs_client.sql`), 20 par heure et par compte au
plus, effacées au bout de 90 jours. Pour les lire (SQL Editor) :

```sql
select message, path, count(*) as fois, max(created_at) as derniere
from public.client_errors
group by message, path
order by derniere desc;
```

Sans compte, rien n'est envoyé (le navigateur n'appelle aucune fonction sans session) : les
erreurs des visiteurs restent dans la console de leur navigateur.

**Disponibilité** :

1. Service externe, pour être alerté en quelques minutes : compte gratuit sur UptimeRobot ou
   Better Stack, moniteur HTTPS sur `https://<votre-domaine>/` toutes les 5 minutes avec le
   mot-clé « Cyber Academy » (une page d'erreur de l'hébergeur ne passe pas), alerte par e-mail.
   Pour Supabase : s'abonner aux alertes de status.supabase.com.
2. Workflow GitHub « Disponibilité » (`.github/workflows/disponibilite.yml`), filet dans le
   dépôt : définir les variables du dépôt (Settings → Secrets and variables → Actions →
   Variables) `SITE_URL`, `SUPABASE_URL` et `SUPABASE_PUBLISHABLE_KEY` (clé publique). Il vérifie
   le site et Supabase toutes les 30 minutes (horaires approximatifs chez GitHub) ; en cas
   d'échec, GitHub envoie un e-mail à la personne qui a modifié son planning en dernier. GitHub
   suspend les workflows planifiés d'un dépôt public sans activité depuis 60 jours : le
   réactiver depuis l'onglet Actions. Essai : Actions → Disponibilité → Run workflow, ou
   `node scripts/check-availability.mjs` avec les trois variables.

**Captcha (Cloudflare Turnstile)**, dans cet ordre :

1. Cloudflare (compte gratuit) → Turnstile → Add widget : votre domaine, mode « Managed ».
   Notez la clé de site et la clé secrète.
2. Reconstruire et publier le site avec la clé de site : `$env:TURNSTILE_SITE_KEY = "0x…"`, puis
   `npm run build:prod` (le script refuse une clé secrète et ajoute
   `https://challenges.cloudflare.com` à `frame-src`).
3. Seulement ensuite : Supabase → Authentication → Attack Protection → Enable Captcha
   protection → Turnstile, avec la clé secrète. Dans l'autre ordre, plus personne ne pourrait se
   connecter le temps de publier le site.

Le captcha est alors demandé à l'inscription, à la connexion, au renvoi du message de
confirmation et pour le mot de passe oublié ; la politique de confidentialité le mentionne dès
que la clé est fournie. Clés de test de Cloudflare (validation toujours réussie) pour un essai :
`1x00000000000000000000AA` (site) et `1x0000000000000000000000000000000AA` (secrète).
