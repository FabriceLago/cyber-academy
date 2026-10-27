// Build de production pour Hostinger : npm run build:prod
// Lit SUPABASE_URL et SUPABASE_PUBLISHABLE_KEY (variables d'environnement), vérifie que ce sont
// des valeurs publiques, construit l'application, adapte la politique de sécurité (CSP) et écrit
// le .htaccess : dist/cyber-academy/browser est alors prêt à copier dans public_html.
// --essai-local : accepte la pile locale (http://127.0.0.1:54621), pour un essai sur ce poste.
// --apercu : site de préproduction (domaine temporaire) ; accepte les mentions légales encore
// incomplètes et interdit l'indexation par les moteurs de recherche.
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const LOCAL_URL = 'http://127.0.0.1:54621';
const OUT = 'dist/cyber-academy/browser';
const localTest = process.argv.includes('--essai-local');
const preview = process.argv.includes('--apercu');

function fail(message) {
  console.error(`build:prod — ${message}`);
  process.exit(1);
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

let origin = '';
try {
  origin = new URL(process.env.SUPABASE_URL ?? '').origin;
} catch {
  fail('SUPABASE_URL manquante ou invalide (exemple : https://abcdefgh.supabase.co).');
}
if (!origin.startsWith('https://') && !(localTest && origin === LOCAL_URL)) {
  fail('SUPABASE_URL doit commencer par https://.');
}
const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? '';
if (!/^sb_publishable_[A-Za-z0-9_-]{10,}$/.test(key)) {
  fail(
    'SUPABASE_PUBLISHABLE_KEY doit être la clé publique (sb_publishable_…), jamais la clé secrète.',
  );
}

const define = (name, value) => ['--define', `${name}=${JSON.stringify(value)}`];
execFileSync(
  process.execPath,
  [
    'node_modules/@angular/cli/bin/ng.js',
    'build',
    '--configuration',
    'production,deploy',
    ...define('CA_SUPABASE_URL', origin),
    ...define('CA_SUPABASE_PUBLISHABLE_KEY', key),
  ],
  { stdio: 'inherit' },
);

// index.html : la politique des connexions vise la pile locale ; on la remplace par la vraie.
const index = join(OUT, 'index.html');
const html = readFileSync(index, 'utf8');
if (!html.includes(`connect-src 'self' ${LOCAL_URL}`)) {
  fail('index.html : politique des connexions (connect-src) introuvable.');
}
writeFileSync(index, html.replaceAll(LOCAL_URL, origin));
// Le service worker vérifie l'empreinte de chaque fichier : index.html vient de changer, son
// manifeste (ngsw.json) est régénéré, sinon le mode hors ligne refuserait cette version.
execFileSync(process.execPath, [
  'node_modules/@angular/service-worker/ngsw-config.js',
  OUT,
  'ngsw-config.json',
  '/',
]);
// Pages statiques du glossaire (moteurs de recherche), copiées de l'index.html définitif.
// SITE_URL, facultative, ajoute les adresses canoniques, sitemap.xml et robots.txt.
execFileSync(process.execPath, ['scripts/prerender-glossary.mjs', OUT], { stdio: 'inherit' });
writeFileSync(
  join(OUT, '.htaccess'),
  readFileSync('deploy/hostinger.htaccess', 'utf8').replaceAll('__SUPABASE_ORIGIN__', origin) +
    (preview
      ? '\n# Aperçu : aucune indexation.\n<IfModule mod_headers.c>\n  Header always set X-Robots-Tag "noindex, nofollow"\n</IfModule>\n'
      : ''),
);

// Rien de ce qui sera publié ne doit viser la pile locale ni contenir de secret.
const files = walk(OUT);
if (!localTest) {
  const local = files.filter((file) => readFileSync(file, 'utf8').includes(LOCAL_URL));
  if (local.length > 0) fail(`adresse locale encore présente dans : ${local.join(', ')}`);
  // Mentions légales et politique de confidentialité : obligatoires et complètes avant publication.
  const todo = files.filter((file) => readFileSync(file, 'utf8').includes('A_COMPLETER'));
  if (todo.length > 0 && !preview) {
    fail('complétez les informations A_COMPLETER de src/app/features/legal/legal-pages.ts.');
  }
}
execFileSync(process.execPath, ['scripts/check-secrets.mjs', ...files], { stdio: 'inherit' });
console.log(`Prêt à publier : copiez le contenu de ${OUT} (y compris .htaccess) dans public_html.`);
