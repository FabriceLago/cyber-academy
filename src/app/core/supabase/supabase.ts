import { InjectionToken } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { Database } from './database.types';

export type AppSupabaseClient = SupabaseClient<Database>;

/**
 * Client Supabase typé par le schéma de la base (database.types.ts, généré par npm run db:types).
 * Chargé à la demande : la bibliothèque (≈ 230 ko) ne ralentit pas le premier affichage.
 */
export const SUPABASE = new InjectionToken<Promise<AppSupabaseClient>>('SUPABASE', {
  providedIn: 'root',
  factory: () =>
    import('@supabase/supabase-js').then(({ createClient }) =>
      createClient<Database>(environment.supabaseUrl, environment.supabasePublishableKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
      }),
    ),
});
