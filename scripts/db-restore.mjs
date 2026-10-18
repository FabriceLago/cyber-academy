// Recharge une sauvegarde (npm run db:backup) dans la base LOCALE, recréée au préalable :
//   npx supabase db reset
//   npm run db:restore -- backups/<date>/donnees.sql
// Tout se fait en une transaction : en cas d'erreur, rien n'est chargé. Les déclencheurs sont
// suspendus (session_replication_role = replica) pour que la création d'un compte ne recrée pas
// son profil, déjà présent dans la sauvegarde. Pour un projet hébergé, voir docs/architecture.md.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('Indiquez le fichier : npm run db:restore -- backups/<date>/donnees.sql');
  process.exit(1);
}

execFileSync(
  'docker',
  [
    'exec',
    '-i',
    'supabase_db_cyber-academy',
    'psql',
    '-U',
    'postgres',
    '-d',
    'postgres',
    '-v',
    'ON_ERROR_STOP=1',
    '--single-transaction',
    '-c',
    'SET session_replication_role = replica',
    '-f',
    '-',
  ],
  { input: readFileSync(file), stdio: ['pipe', 'inherit', 'inherit'] },
);
console.log(`Sauvegarde rechargée : ${file}`);
