import { InjectionToken } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Database } from './database.types';

export type AppSupabaseClient = SupabaseClient<Database>;

/**
 * Client Supabase typé par le schéma de la base (database.types.ts, généré par npm run db:types).
 * Chargé à la demande : la bibliothèque (≈ 230 ko) ne ralentit pas le premier affichage.
 * `detectSessionInUrl` : au retour du lien de confirmation envoyé par e-mail, le client ouvre la
 * session puis retire le code de l'adresse (barre d'adresse, historique).
 * `flowType: 'pkce'` : ce retour n'est accepté que par le navigateur qui a lancé l'inscription
 * (code lié à un secret gardé par ce navigateur). En flux implicite, un lien contenant les jetons
 * d'un autre compte connectait la victime à ce compte (connexion forcée, CWE-352).
 */
export const SUPABASE = new InjectionToken<Promise<AppSupabaseClient>>('SUPABASE', {
  providedIn: 'root',
  factory: () =>
    import('@supabase/supabase-js').then(({ createClient }) =>
      createClient<Database>(environment.supabaseUrl, environment.supabasePublishableKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
        },
      }),
    ),
});
