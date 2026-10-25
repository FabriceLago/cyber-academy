// Ouvre une page de paiement Stripe (abonnement mensuel ou annuel) pour l'utilisateur connecté.
import { hasBilledSubscription } from '../_shared/billing.ts';
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
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle();

  // Un client Stripe par compte, gardé pour les abonnements suivants.
  let customer = existing?.stripe_customer_id;
  if (customer) {
    // Stripe fait foi, pas la table : un paiement fait il y a quelques secondes n'y est peut-être
    // pas encore (webhook en route), et un second abonnement serait facturé en plus.
    const { data: subs } = await stripe.subscriptions.list({ customer, status: 'all', limit: 100 });
    if (hasBilledSubscription(subs)) {
      return json(
        {
          error:
            'Un abonnement existe déjà pour ce compte : gérez-le depuis « Gérer mon abonnement ».',
        },
        409,
      );
    }
    // Une seule page de paiement ouverte à la fois : celles laissées dans d'autres onglets se ferment.
    const { data: open } = await stripe.checkout.sessions.list({
      customer,
      status: 'open',
      limit: 100,
    });
    await Promise.all(open.map((s) => stripe.checkout.sessions.expire(s.id).catch(() => null)));
  } else {
    // Clé d'idempotence : deux premières demandes simultanées reçoivent le même client Stripe, au
    // lieu d'en créer un second, orphelin.
    customer = (
      await stripe.customers.create(
        { email: user.email, metadata: { user_id: user.id } },
        { idempotencyKey: `client-${user.id}` },
      )
    ).id;
    const { error } = await admin
      .from('subscriptions')
      .upsert(
        { user_id: user.id, stripe_customer_id: customer },
        { onConflict: 'user_id', ignoreDuplicates: true },
      );
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
