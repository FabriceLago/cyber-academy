import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import {
  Subscription,
  SubscriptionService,
  isActive,
} from '../../core/subscription/subscription.service';
import { SubscriptionPage } from './subscription-page';

const IN_A_WEEK = new Date(Date.now() + 7 * 86_400_000).toISOString();

/** Page Abonnement d'un compte connecté, avec cet abonnement. */
function render(current: Subscription | null): HTMLElement {
  const subscription = signal(current);
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: AuthService, useValue: { user: signal({ id: 'u1' }), userId: signal('u1') } },
      {
        provide: SubscriptionService,
        useValue: {
          subscription,
          active: computed(() => isActive(subscription(), new Date())),
          load: vi.fn(),
        },
      },
    ],
  });
  const fixture = TestBed.createComponent(SubscriptionPage);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}
const sub = (status: string, cancelAtPeriodEnd = false): Subscription => ({
  status,
  currentPeriodEnd: IN_A_WEEK,
  cancelAtPeriodEnd,
});
const choices = (page: HTMLElement) =>
  [...page.querySelectorAll('button')].filter((b) => b.textContent?.includes('Choisir'));

describe('SubscriptionPage', () => {
  it('jamais abonné : propose 7 jours d’essai gratuit, sans carte', () => {
    for (const current of [null, sub('incomplete')]) {
      const page = render(current);
      expect(page.textContent).toContain('7 jours d’essai gratuit, sans carte bancaire');
      expect(page.textContent).toContain('rien n’est prélevé');
      expect(choices(page)).toHaveLength(2);
      TestBed.resetTestingModule();
    }
  });

  it('déjà abonné une fois : les formules, sans promettre d’essai', () => {
    const page = render(sub('canceled'));
    expect(page.textContent).not.toContain('essai gratuit');
    expect(choices(page)).toHaveLength(2);
  });

  it('essai en cours : sa fin, et ce qui se passe sans moyen de paiement', () => {
    const page = render(sub('trialing'));
    expect(page.textContent).toContain('Votre essai gratuit est en cours.');
    expect(page.textContent).toContain('s’arrête de lui-même, sans frais');
    expect(choices(page)).toHaveLength(0);
    expect(page.textContent).toContain('Gérer mon abonnement');
  });

  it('essai résilié : rien ne sera prélevé', () => {
    const page = render(sub('trialing', true));
    expect(page.textContent).toContain('rien ne sera prélevé');
  });

  it('paiement refusé : l’accès est maintenu et le moyen de paiement à mettre à jour', () => {
    const page = render(sub('past_due'));
    expect(page.textContent).toContain('Le dernier paiement a été refusé.');
    expect(page.textContent).toContain('Votre accès est maintenu');
    expect(choices(page)).toHaveLength(0);
  });
});
