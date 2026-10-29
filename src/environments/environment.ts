/**
 * Connexion à Supabase : ici la pile locale (npm run db:start). La clé « publishable » est faite
 * pour le navigateur : ce sont les politiques RLS qui protègent les données. La clé secrète
 * (service role) ne doit jamais apparaître dans ce dépôt. La configuration de production sera
 * ajoutée au déploiement (étape 13).
 */
export const environment = {
  supabaseUrl: 'http://127.0.0.1:54621',
  supabasePublishableKey: 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH',
  /** Mesure d'audience (Matomo) : vide en local, donc aucune mesure. */
  matomoUrl: '',
  matomoSiteId: '',
  /** Captcha (Cloudflare Turnstile) : vide en local, donc aucun captcha. */
  turnstileSiteKey: '',
};
