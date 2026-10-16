import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'ca-not-found-page',
  imports: [RouterLink, Icon],
  template: `
    <div class="status-page">
      <ca-icon class="status-icon" name="compass" />
      <h1>Page introuvable</h1>
      <p>L’adresse demandée n’existe pas, ou elle a changé.</p>
      <a class="btn btn-primary" routerLink="/">Retour au tableau de bord</a>
    </div>
  `,
})
export class NotFoundPage {}
