import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Affiché à la place d'un contenu réservé aux abonnés (parcours premium). */
@Component({
  selector: 'ca-paywall',
  imports: [RouterLink],
  template: `
    <section class="card" aria-labelledby="abonnement-requis">
      <h2 id="abonnement-requis">Réservé aux abonnés</h2>
      <p>
        « {{ pathTitle() }} » fait partie de l’abonnement Premium : spécialisations métier,
        laboratoires avancés et projets pratiques. Le parcours Découverte reste gratuit.
      </p>
      <a class="btn btn-primary" routerLink="/abonnement">Voir l’abonnement</a>
    </section>
  `,
})
export class Paywall {
  readonly pathTitle = input.required<string>();
}
