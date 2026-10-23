// Événements Stripe : tient à jour la table subscriptions. Seule écriture de l'abonnement.
// Les événements peuvent arriver en double ou dans le désordre : on relit donc l'abonnement chez
// Stripe à chaque fois, pour enregistrer son état actuel plutôt que celui de l'événement.
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

  const sub = await stripe.subscriptions.retrieve((event.data.object as Stripe.Subscription).id);
  const item = sub.items.data[0];
  // Selon la version de l'API Stripe, la fin de période est sur l'abonnement ou sur l'article.
  const end =
    (item as { current_period_end?: number } | undefined)?.current_period_end ??
    (sub as { current_period_end?: number }).current_period_end;
  const customer = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

  const { error } = await admin
    .from('subscriptions')
    .update({
      stripe_subscription_id: sub.id,
      status: sub.status,
      price_id: item?.price.id ?? null,
      current_period_end: end ? new Date(end * 1000).toISOString() : null,
      cancel_at_period_end: sub.cancel_at_period_end,
    })
    .eq('stripe_customer_id', customer);
  // Erreur : Stripe renverra l'événement plus tard.
  return error ? new Response('Enregistrement impossible.', { status: 500 }) : new Response('ok');
});
