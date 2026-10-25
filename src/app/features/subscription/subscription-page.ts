import { DatePipe } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATALOG } from '../../content/outline.generated';
import { AuthService } from '../../core/auth/auth.service';
import { Plan, SubscriptionService } from '../../core/subscription/subscription.service';

/** Prix affichés : à garder identiques aux prix créés dans Stripe (STRIPE_PRICE_MENSUEL / ANNUEL). */
const PLANS: readonly { id: Plan; label: string; price: string; note: string }[] = [
  { id: 'mensuel', label: 'Mensuel', price: '9,90 € par mois', note: 'Sans engagement' },
  { id: 'annuel', label: 'Annuel', price: '99 € par an', note: 'Deux mois offerts' },
];

@Component({
  selector: 'ca-subscription-page',
  imports: [RouterLink, DatePipe],
  template: `
    <header class="page-header">
      <h1>Abonnement Premium</h1>
      <p>Allez plus loin que la découverte : préparez-vous à un premier poste en cybersécurité.</p>
    </header>

    @if (statut() === 'merci' && !subscriptions.active()) {
      <section class="card" role="status" aria-labelledby="merci">
        <h2 id="merci">Merci pour votre abonnement</h2>
        <p>Le paiement est en cours de confirmation : l’accès s’ouvre dans quelques secondes.</p>
        <button type="button" class="btn btn-secondary" (click)="subscriptions.load()">
          Actualiser
        </button>
      </section>
    }

    <section class="card" aria-labelledby="inclus">
      <h2 id="inclus">Ce qui est inclus</h2>
      <ul>
        @for (path of premiumPaths; track path.id) {
          <li>
            La spécialisation <a [routerLink]="['/parcours', path.id]">{{ path.title }}</a
            >, avec ses laboratoires et son projet final
          </li>
        }
        <li>Les prochaines spécialisations, dès leur publication</li>
        <li>Votre progression vérifiée et enregistrée sur votre compte</li>
      </ul>
      <p class="hint">Le parcours Découverte reste gratuit, avec ou sans compte.</p>
    </section>

    <section class="card" aria-labelledby="formules">
      <h2 id="formules">Votre abonnement</h2>
      @if (!auth.user()) {
        <p>Pour vous abonner, connectez-vous ou créez un compte gratuit.</p>
        <div class="row">
          <a class="btn btn-primary" routerLink="/inscription">Créer un compte</a>
          <a class="btn btn-secondary" routerLink="/connexion">Se connecter</a>
        </div>
      } @else if (subscriptions.active()) {
        @let current = subscriptions.subscription();
        <p>
          <strong>Votre abonnement est actif.</strong>
          @if (current?.currentPeriodEnd; as end) {
            {{ current?.cancelAtPeriodEnd ? 'Il prendra fin le' : 'Prochain renouvellement le' }}
            {{ end | date: 'longDate' }}.
          }
        </p>
        <p class="hint">Moyen de paiement, factures, changement de formule ou résiliation :</p>
        <button type="button" class="btn btn-secondary" (click)="manage()">
          {{ pending() ? 'Patientez…' : 'Gérer mon abonnement' }}
        </button>
      } @else {
        <ul class="plans">
          @for (plan of plans; track plan.id) {
            <li class="plan">
              <h3>{{ plan.label }}</h3>
              <p class="price">{{ plan.price }}</p>
              <p class="hint">{{ plan.note }}</p>
              <button
                type="button"
                class="btn btn-primary"
                [attr.aria-describedby]="waiver() ? null : 'renonciation-aide'"
                [disabled]="!waiver() || pending()"
                (click)="subscribe(plan.id)"
              >
                {{ pending() ? 'Patientez…' : 'Choisir ' + plan.label.toLowerCase() }}
              </button>
            </li>
          }
        </ul>
        <label class="toggle">
          <input type="checkbox" [checked]="waiver()" (change)="waiver.set(!waiver())" />
          Je demande l’accès immédiat aux contenus et reconnais perdre mon droit de rétractation de
          14 jours.
        </label>
        <p id="renonciation-aide" class="hint">
          Cochez cette case pour choisir une formule. Le paiement se fait sur la page sécurisée de
          Stripe ; l’abonnement se résilie à tout moment depuis cette page.
        </p>
      }
      <p role="status" class="hint">{{ message() }}</p>
    </section>
  `,
  styles: `
    section {
      margin-bottom: var(--space-5);
    }

    .plans {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
      gap: var(--space-3);
      margin: 0 0 var(--space-4);
      padding: 0;
      list-style: none;
    }

    .plan {
      padding: var(--space-4);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
    }

    .plan h3 {
      margin: 0;
    }

    .price {
      margin: var(--space-2) 0 0;
      font-size: var(--text-lg);
      font-weight: 700;
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .toggle {
      display: flex;
      align-items: flex-start;
      gap: var(--space-2);
      cursor: pointer;
    }

    .toggle input {
      flex: none;
      width: 1.25rem;
      height: 1.25rem;
      margin: 0.15rem 0 0;
    }

    .hint {
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }
  `,
})
export class SubscriptionPage {
  /** « merci » au retour de Stripe après le paiement (paramètre de l'adresse). */
  readonly statut = input<string>();

  protected readonly auth = inject(AuthService);
  protected readonly subscriptions = inject(SubscriptionService);
  protected readonly plans = PLANS;
  protected readonly premiumPaths = CATALOG.paths.filter((path) => path.premium);
  protected readonly waiver = signal(false);
  protected readonly pending = signal(false);
  protected readonly message = signal('');

  constructor() {
    // Retour de Stripe : le webhook peut arriver quelques secondes après la page.
    effect((onCleanup) => {
      if (this.statut() !== 'merci' || !this.auth.userId()) return;
      let tries = 0;
      const timer = setInterval(() => {
        if (this.subscriptions.active() || ++tries > 10) clearInterval(timer);
        else void this.subscriptions.load();
      }, 2000);
      onCleanup(() => clearInterval(timer));
    });
  }

  protected async subscribe(plan: Plan): Promise<void> {
    await this.run(() => this.subscriptions.checkout(plan));
  }

  protected async manage(): Promise<void> {
    await this.run(() => this.subscriptions.portal());
  }

  private async run(action: () => Promise<string | null>): Promise<void> {
    if (this.pending()) return;
    this.pending.set(true);
    this.message.set('');
    const error = await action();
    this.pending.set(false);
    if (error) this.message.set(error);
  }
}
