// Règles d'abonnement des fonctions Stripe. Lancé par `npm run test:functions` (Node, sans Deno).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hasBilledSubscription, pickSubscription, subscriptionRow, trialFor } from './billing.ts';

const sub = (id: string, status: string, created: number, end?: number) => ({
  id,
  status,
  created,
  cancel_at_period_end: false,
  items: { data: [{ current_period_end: end, price: { id: 'price_mensuel' } }] },
});

test('un événement tardif d’un ancien abonnement résilié n’efface pas le nouveau', () => {
  const ancien = sub('sub_ancien', 'canceled', 1_000);
  const nouveau = sub('sub_nouveau', 'active', 2_000);
  assert.equal(pickSubscription([ancien, nouveau])?.id, 'sub_nouveau');
  assert.equal(pickSubscription([nouveau, ancien])?.id, 'sub_nouveau');
});

test('un abonnement actif plus ancien passe avant un essai de paiement incomplet plus récent', () => {
  const actif = sub('sub_actif', 'active', 1_000);
  const incomplet = sub('sub_incomplet', 'incomplete', 2_000);
  assert.equal(pickSubscription([incomplet, actif])?.id, 'sub_actif');
});

test('entre deux abonnements résiliés, le plus récent fait foi', () => {
  const premier = sub('sub_premier', 'canceled', 1_000);
  const second = sub('sub_second', 'canceled', 2_000);
  assert.equal(pickSubscription([premier, second])?.id, 'sub_second');
  assert.equal(pickSubscription([]), null);
});

test('un abonnement encore facturé ou à régulariser bloque un second paiement', () => {
  for (const status of ['active', 'trialing', 'past_due', 'unpaid']) {
    assert.equal(hasBilledSubscription([sub('sub_1', status, 1)]), true, status);
  }
  for (const status of ['canceled', 'incomplete', 'incomplete_expired', 'paused']) {
    assert.equal(hasBilledSubscription([sub('sub_1', status, 1)]), false, status);
  }
  assert.equal(hasBilledSubscription([]), false);
});

test('essai de 7 jours sans carte au premier abonnement seulement, même après une résiliation', () => {
  assert.deepEqual(trialFor([]), {
    trial_period_days: 7,
    trial_settings: { end_behavior: { missing_payment_method: 'cancel' } },
  });
  for (const status of ['canceled', 'incomplete_expired', 'active', 'trialing']) {
    assert.equal(trialFor([sub('sub_1', status, 1)]), undefined, status);
  }
});

test('la ligne enregistrée reprend l’abonnement, avec une fin de période en date ISO', () => {
  const row = subscriptionRow({
    ...sub('sub_1', 'active', 1, 1_763_600_000),
    cancel_at_period_end: true,
  });
  assert.deepEqual(row, {
    stripe_subscription_id: 'sub_1',
    status: 'active',
    price_id: 'price_mensuel',
    current_period_end: '2025-11-20T00:53:20.000Z',
    cancel_at_period_end: true,
  });
  // Anciennes versions de l'API : la fin de période est sur l'abonnement, pas sur l'article.
  const ancienneApi = { ...sub('sub_2', 'active', 1), current_period_end: 1_763_600_000 };
  assert.equal(subscriptionRow(ancienneApi).current_period_end, '2025-11-20T00:53:20.000Z');
});
