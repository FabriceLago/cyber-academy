// Cherche des secrets dans les fichiers suivis par git et dans le build (dist/).
// Usage : npm run check:secrets            (dépôt + build)
//         node scripts/check-secrets.mjs f… (fichiers donnés)
// La valeur trouvée n'est jamais affichée : seulement le fichier, la ligne et le type.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const RULES = [
  ['clé secrète Supabase', /sb_secret_[A-Za-z0-9_-]{8,}/],
  ['clé privée', /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
  ['variable de clé de service renseignée', /SERVICE_ROLE_KEY\s*[=:]\s*['"]?[A-Za-z0-9._-]{20,}/],
];
const JWT = /eyJ[A-Za-z0-9_-]+\.(eyJ[A-Za-z0-9_-]+)\.[A-Za-z0-9_-]+/g;

/** Un jeton JWT n'est un secret que s'il donne le rôle service_role (la clé « anon » est publique). */
function isServiceRoleJwt(payload) {
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString()).role === 'service_role';
  } catch {
    return false;
  }
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const files =
  process.argv.length > 2
    ? process.argv.slice(2)
    : [
        ...execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
          encoding: 'utf8',
        })
          .split('\n')
          .filter(Boolean),
        ...(existsSync('dist') ? walk('dist') : []),
      ];

const findings = [];
for (const file of files) {
  if (/(^|[\\/])\.env(\..+)?$/.test(file) && !file.endsWith('.example')) {
    findings.push(`${file} : fichier .env versionné`);
  }
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    continue; // Fichier supprimé mais encore suivi, ou illisible.
  }
  text.split('\n').forEach((line, i) => {
    for (const [label, pattern] of RULES) {
      if (pattern.test(line)) findings.push(`${file}:${i + 1} : ${label}`);
    }
    for (const [, payload] of line.matchAll(JWT)) {
      if (isServiceRoleJwt(payload)) findings.push(`${file}:${i + 1} : jeton service_role`);
    }
  });
}

if (findings.length > 0) {
  console.error(`Secrets possibles (${findings.length}) :\n${findings.join('\n')}`);
  process.exit(1);
}
console.log(`Aucun secret trouvé dans ${files.length} fichiers.`);
