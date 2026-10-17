// Régénère les types TypeScript du schéma de la base locale (« npm run db:start » d'abord).
// Le fichier produit par Supabase ne suit pas les règles de style du projet : il est exclu du lint.
import { execSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';

const OUT = 'src/app/core/supabase/database.types.ts';
const types = execSync('supabase gen types typescript --local', { encoding: 'utf8' });
await writeFile(
  OUT,
  `/* eslint-disable */\n// Généré par « npm run db:types » à partir du schéma de la base : ne pas modifier.\n${types}`,
);
console.log(`${OUT} régénéré.`);
