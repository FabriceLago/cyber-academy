// Ouvre une page de paiement Stripe (abonnement mensuel ou annuel) pour l'utilisateur connecté.
import { SITE_URL, admin, json, preflight, requestUser, stripe } from '../_shared/stripe.ts';

const PRICES: Record<string, string | undefined> = {
  mensuel: Deno.env.get('STRIPE_PRICE_MENSUEL'),
  annuel: Deno.env.get('STRIPE_PRICE_ANNUEL'),
};

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;
  const user = await requestUser(req);
  if (!user) return json({ error: 'Connexion requise.' }, 401);
  const { plan } = await req.json().catch(() => ({}));
  const price = PRICES[plan];
  if (!price) return json({ error: 'Formule inconnue.' }, 400);

  const { data: existing } = await admin
    .from('subscriptions')
    .select('stripe_customer_id, status')
    .eq('user_id', user.id)
    .maybeSingle();
  if (existing && ['active', 'trialing', 'past_due'].includes(existing.status)) {
    return json({ error: 'Votre abonnement est déjà actif.' }, 409);
  }

  // Un client Stripe par compte, gardé pour les abonnements suivants.
  let customer = existing?.stripe_customer_id;
  if (!customer) {
    customer = (
      await stripe.customers.create({ email: user.email, metadata: { user_id: user.id } })
    ).id;
    const { error } = await admin
      .from('subscriptions')
      .insert({ user_id: user.id, stripe_customer_id: customer });
    if (error) return json({ error: 'La demande a échoué : réessayez.' }, 500);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer,
    client_reference_id: user.id,
    line_items: [{ price, quantity: 1 }],
    subscription_data: { metadata: { user_id: user.id } },
    allow_promotion_codes: true,
    locale: 'fr',
    success_url: `${SITE_URL}/abonnement?statut=merci`,
    cancel_url: `${SITE_URL}/abonnement`,
  });
  return json({ url: session.url });
});
