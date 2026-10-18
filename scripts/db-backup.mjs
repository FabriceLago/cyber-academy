// Sauvegarde les données des apprenants : comptes, profils, tentatives.
// Le schéma (supabase/migrations) et le catalogue (supabase/seed.sql) sont versionnés dans git :
// ils ne sont pas dans la sauvegarde, qu'on recharge sur une base recréée à partir d'eux.
// Usage : npm run db:backup                (base locale)
//         npm run db:backup -- --linked     (projet hébergé lié, étape 13)
// Le fichier contient des adresses e-mail et des empreintes de mots de passe : le dossier
// backups/ est exclu de git, et une copie hors du poste doit être chiffrée.
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

/**
 * Tables exclues : celles que recréent les migrations et le seed (les recharger créerait des
 * doublons), et celles qu'il ne faut pas copier : sessions et jetons (une sauvegarde qui fuit ne
 * doit ouvrir aucune session ; après une restauration, chacun se reconnecte) et journal d'audit
 * (adresses IP, inutiles à la reprise).
 */
const EXCLUDED = [
  'public.learning_paths',
  'public.modules',
  'public.lessons',
  'public.labs',
  'public.quiz_answer_keys',
  'supabase_migrations.schema_migrations',
  'supabase_migrations.seed_files',
  'auth.schema_migrations',
  'auth.sessions',
  'auth.refresh_tokens',
  'auth.mfa_amr_claims',
  'auth.one_time_tokens',
  'auth.flow_state',
  'auth.audit_log_entries',
];

const target = process.argv.length > 2 ? process.argv.slice(2) : ['--local'];
const dir = `backups/${new Date().toISOString().slice(0, 19).replaceAll(':', '-')}`;
mkdirSync(dir, { recursive: true });
execFileSync(
  process.execPath,
  [
    'node_modules/supabase/dist/supabase.js',
    'db',
    'dump',
    ...target,
    '--data-only',
    '--use-copy',
    ...EXCLUDED.flatMap((table) => ['-x', table]),
    '-f',
    `${dir}/donnees.sql`,
  ],
  { stdio: 'inherit' },
);
console.log(`Sauvegarde écrite : ${dir}/donnees.sql`);
