import { Component, DOCUMENT, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon/icon';

/**
 * Affichée quand une page ne peut pas être chargée (voir withNavigationErrorHandler dans
 * app.config.ts). Chargée avec l'application, pour fonctionner même sans réseau.
 */
@Component({
  selector: 'ca-error-page',
  imports: [RouterLink, Icon],
  template: `
    <div class="status-page">
      <ca-icon class="status-icon" name="alert" />
      <h1>Une erreur est survenue</h1>
      <p>La page n’a pas pu être chargée. Vérifiez votre connexion internet, puis réessayez.</p>
      <div class="actions">
        <button type="button" class="btn btn-primary" (click)="reload()">Recharger la page</button>
        <a class="btn btn-secondary" routerLink="/">Retour au tableau de bord</a>
      </div>
    </div>
  `,
})
export class ErrorPage {
  private readonly document = inject(DOCUMENT);

  protected reload(): void {
    this.document.location.reload();
  }
}
