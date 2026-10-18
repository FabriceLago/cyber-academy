/**
 * Configuration de production : remplace environment.ts dans la configuration de build « deploy ».
 * Les valeurs sont injectées par `npm run build:prod`, qui lit les variables d'environnement
 * SUPABASE_URL et SUPABASE_PUBLISHABLE_KEY et refuse toute clé secrète.
 */
declare const CA_SUPABASE_URL: string;
declare const CA_SUPABASE_PUBLISHABLE_KEY: string;

export const environment = {
  supabaseUrl: CA_SUPABASE_URL,
  supabasePublishableKey: CA_SUPABASE_PUBLISHABLE_KEY,
};
