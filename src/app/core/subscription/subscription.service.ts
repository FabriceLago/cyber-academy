import { DOCUMENT, Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { GroupsService } from '../groups/groups.service';
import { PathOutline } from '../models/content.model';
import { SUPABASE } from '../supabase/supabase';

export interface Subscription {
  readonly status: string;
  /** Date ISO de fin de la période payée. */
  readonly currentPeriodEnd: string | null;
  /** Résilié : reste actif jusqu'à currentPeriodEnd, puis s'arrête. */
  readonly cancelAtPeriodEnd: boolean;
}

export type Plan = 'mensuel' | 'annuel';

/** Ouvrent l'accès : payé, en essai, ou paiement refusé que Stripe retente encore (past_due). */
const ACCESS = ['active', 'trialing', 'past_due'];

/** Mêmes règles que has_active_subscription côté serveur. */
export function isActive(subscription: Subscription | null, now: Date): boolean {
  return (
    subscription !== null &&
    ACCESS.includes(subscription.status) &&
    (subscription.currentPeriodEnd === null || new Date(subscription.currentPeriodEnd) > now)
  );
}

/**
 * Abonnement du compte connecté. Il n'est écrit que par le serveur (webhook Stripe) : ici, on le
 * lit, et on ouvre les pages Stripe de paiement et de gestion.
 */
@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly auth = inject(AuthService);
  private readonly client = inject(SUPABASE);
  private readonly document = inject(DOCUMENT);

  readonly subscription = signal<Subscription | null>(null);
  /** Abonnement personnel (payé, en essai ou en relance). */
  readonly ownActive = computed(() => isActive(this.subscription(), new Date()));
  /** Groupe dont l'administrateur a accordé le Premium (offre sur devis), s'il y en a un. */
  readonly groupPremium = inject(GroupsService).premium;
  /** Accès Premium, par l'abonnement ou par un groupe : comme has_active_subscription. */
  readonly active = computed(() => this.ownActive() || this.groupPremium() !== null);

  constructor() {
    effect(() => {
      const userId = this.auth.userId();
      untracked(() => void this.load(userId));
    });
  }

  /** Parcours réservé aux abonnés, et l'utilisateur n'est pas abonné. */
  locked(path: PathOutline | undefined | null): boolean {
    return path?.premium === true && !this.active();
  }

  async load(userId = this.auth.userId()): Promise<void> {
    if (!userId) {
      this.subscription.set(null);
      return;
    }
    const supabase = await this.client;
    const { data } = await supabase
      .from('subscriptions')
      .select('status, current_period_end, cancel_at_period_end')
      .eq('user_id', userId)
      .maybeSingle();
    if (this.auth.userId() !== userId) return; // Réponse arrivée après un changement de compte.
    this.subscription.set(
      data
        ? {
            status: data.status,
            currentPeriodEnd: data.current_period_end,
            cancelAtPeriodEnd: data.cancel_at_period_end,
          }
        : null,
    );
  }

  /** Page de paiement Stripe. Renvoie un message d'erreur, ou rien si la page s'ouvre. */
  checkout(plan: Plan): Promise<string | null> {
    return this.open('create-checkout', { plan });
  }

  /** Portail Stripe : moyen de paiement, factures, résiliation. */
  portal(): Promise<string | null> {
    return this.open('customer-portal', {});
  }

  private async open(name: string, body: object): Promise<string | null> {
    try {
      const supabase = await this.client;
      const { data, error } = await supabase.functions.invoke<{ url: string }>(name, { body });
      if (error || !data?.url) {
        // Message rédigé par la fonction (« Connexion requise. »…), sinon message générique.
        const detail = await (error?.context as Response | undefined)?.json?.().catch(() => null);
        return detail?.error ?? 'Le service de paiement ne répond pas. Réessayez plus tard.';
      }
      this.document.location.assign(data.url);
      return null;
    } catch {
      return 'Le service de paiement ne répond pas. Réessayez plus tard.';
    }
  }
}
