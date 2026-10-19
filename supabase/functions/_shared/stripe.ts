// Outils communs aux fonctions d'abonnement. Secrets (jamais dans le dépôt) :
// STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_MENSUEL, STRIPE_PRICE_ANNUEL, SITE_URL.
// SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont fournis par Supabase.
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.118.0';

export { Stripe };

export const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  httpClient: Stripe.createFetchHttpClient(),
});

/** Adresse du site : seule origine autorisée, et retour après paiement (jamais celle de la requête). */
export const SITE_URL = Deno.env.get('SITE_URL') ?? '';

/** Client serveur (service_role) : seul autorisé à écrire dans subscriptions. */
export const admin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false } },
);

const CORS = {
  'Access-Control-Allow-Origin': SITE_URL,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  Vary: 'Origin',
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

/** Réponse à la requête de vérification du navigateur (CORS), sinon null. */
export function preflight(req: Request): Response | null {
  return req.method === 'OPTIONS' ? new Response(null, { headers: CORS }) : null;
}

/** Utilisateur connecté qui fait la requête (jeton de session du navigateur), sinon null. */
export async function requestUser(req: Request) {
  const token = req.headers.get('Authorization')?.replace(/^Bearer /, '');
  if (!token) return null;
  const { data } = await admin.auth.getUser(token);
  return data.user;
}
