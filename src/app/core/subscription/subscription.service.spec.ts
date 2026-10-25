import { DOCUMENT, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../auth/auth.service';
import { PathOutline } from '../models/content.model';
import { AppSupabaseClient, SUPABASE } from '../supabase/supabase';
import { SubscriptionService, isActive } from './subscription.service';

const NOW = new Date('2026-10-20T12:00:00Z');
const sub = (status: string, currentPeriodEnd: string | null) => ({
  status,
  currentPeriodEnd,
  cancelAtPeriodEnd: false,
});

describe('isActive (mêmes règles que has_active_subscription côté serveur)', () => {
  it('ouvre l’accès pendant une période payée ou d’essai', () => {
    expect(isActive(sub('active', '2026-11-20T12:00:00Z'), NOW)).toBe(true);
    expect(isActive(sub('trialing', '2026-10-27T12:00:00Z'), NOW)).toBe(true);
  });

  it('ferme l’accès sans abonnement, après la période payée ou si le paiement a échoué', () => {
    expect(isActive(null, NOW)).toBe(false);
    expect(isActive(sub('active', '2026-10-19T12:00:00Z'), NOW)).toBe(false);
    for (const status of ['incomplete', 'past_due', 'unpaid', 'canceled', 'paused']) {
      expect(isActive(sub(status, '2026-11-20T12:00:00Z'), NOW), status).toBe(false);
    }
  });

  it('un abonnement résilié reste actif jusqu’à la fin de la période payée', () => {
    expect(
      isActive(
        { status: 'active', currentPeriodEnd: '2026-11-20T12:00:00Z', cancelAtPeriodEnd: true },
        NOW,
      ),
    ).toBe(true);
  });
});

describe('SubscriptionService', () => {
  function setup(row: object | null, invoke: ReturnType<typeof vi.fn>) {
    const query = {
      select: () => query,
      eq: () => query,
      maybeSingle: vi.fn().mockResolvedValue({ data: row }),
    };
    const client = { from: () => query, functions: { invoke } };
    const assign = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { userId: signal('u1') } },
        { provide: SUPABASE, useValue: Promise.resolve(client as unknown as AppSupabaseClient) },
        { provide: DOCUMENT, useValue: { location: { assign } } },
      ],
    });
    return { service: TestBed.inject(SubscriptionService), assign };
  }
  const premium = { premium: true } as PathOutline;
  const free = { premium: false } as PathOutline;

  it('bloque un parcours premium tant que l’abonnement n’est pas actif', async () => {
    const { service } = setup(
      { status: 'active', current_period_end: '2999-01-01T00:00:00Z', cancel_at_period_end: false },
      vi.fn(),
    );
    expect(service.locked(premium)).toBe(true);
    await service.load();
    expect(service.active()).toBe(true);
    expect(service.locked(premium)).toBe(false);
    expect(service.locked(free)).toBe(false);
  });

  it('ouvre la page de paiement Stripe renvoyée par le serveur', async () => {
    const invoke = vi.fn().mockResolvedValue({ data: { url: 'https://checkout.stripe.com/x' } });
    const { service, assign } = setup(null, invoke);
    expect(await service.checkout('annuel')).toBeNull();
    expect(invoke).toHaveBeenCalledWith('create-checkout', { body: { plan: 'annuel' } });
    expect(assign).toHaveBeenCalledWith('https://checkout.stripe.com/x');
  });

  it('affiche le message du serveur, ou un message générique', async () => {
    const response = new Response(JSON.stringify({ error: 'Connexion requise.' }), { status: 401 });
    const invoke = vi.fn().mockResolvedValue({ data: null, error: { context: response } });
    const { service, assign } = setup(null, invoke);
    expect(await service.portal()).toBe('Connexion requise.');
    invoke.mockRejectedValue(new Error('réseau'));
    expect(await service.portal()).toBe(
      'Le service de paiement ne répond pas. Réessayez plus tard.',
    );
    expect(assign).not.toHaveBeenCalled();
  });
});
