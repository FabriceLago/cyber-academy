import { Component, input } from '@angular/core';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { IconName } from '../../shared/icon/icon';

/**
 * Page provisoire d'une section pas encore développée : elle l'annonce explicitement, avec
 * l'étape prévue, au lieu d'afficher de fausses données. Alimentée par les data de la route.
 */
@Component({
  selector: 'ca-coming-soon-page',
  imports: [EmptyState],
  template: `
    <header class="page-header">
      <h1>{{ heading() }}</h1>
      <p>{{ intro() }}</p>
    </header>
    <ca-empty-state [icon]="icon()" heading="Section en construction">
      <p>
        Cette section sera disponible {{ availability() }}. Elle n’affiche pour l’instant aucune
        donnée.
      </p>
    </ca-empty-state>
  `,
})
export class ComingSoonPage {
  readonly heading = input.required<string>();
  readonly intro = input.required<string>();
  readonly icon = input.required<IconName>();
  readonly availability = input.required<string>();
}
