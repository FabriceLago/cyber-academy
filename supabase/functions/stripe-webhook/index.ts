// Événements Stripe : tient à jour la table subscriptions. Seule écriture de l'abonnement.
// Les événements peuvent arriver en double, dans le désordre, ou concerner un ancien abonnement du
// même client (résilié puis réabonné) : on relit donc chez Stripe tous les abonnements du client
// et on enregistre celui qui fait foi, plutôt que celui de l'événement.
import { pickSubscription, subscriptionRow } from '../_shared/billing.ts';
import { Stripe, admin, stripe } from '../_shared/stripe.ts';

const SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';
const crypto = Stripe.createSubtleCryptoProvider();

Deno.serve(async (req) => {
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      req.headers.get('Stripe-Signature') ?? '',
      SECRET,
      undefined,
      crypto,
    );
  } catch {
    return new Response('Signature invalide.', { status: 400 });
  }
  if (!event.type.startsWith('customer.subscription.')) return new Response('ignoré');

  const { customer: owner } = event.data.object as Stripe.Subscription;
  const customer = typeof owner === 'string' ? owner : owner.id;
  const { data } = await stripe.subscriptions.list({ customer, status: 'all', limit: 100 });
  const sub = pickSubscription(data);
  if (!sub) return new Response('ignoré');

  const { error } = await admin
    .from('subscriptions')
    .update(subscriptionRow(sub))
    .eq('stripe_customer_id', customer);
  // Erreur : Stripe renverra l'événement plus tard.
  return error ? new Response('Enregistrement impossible.', { status: 500 }) : new Response('ok');
});
