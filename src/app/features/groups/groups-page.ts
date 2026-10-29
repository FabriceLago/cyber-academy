import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { Group, GroupsService } from '../../core/groups/groups.service';

/**
 * Groupes (associations, écoles, formations) : rejoindre avec un code, quitter, créer un groupe
 * à animer. Lien d'invitation : /groupes?code=… (le code préremplit le champ).
 */
@Component({
  selector: 'ca-groups-page',
  imports: [RouterLink, DatePipe],
  template: `
    <header class="page-header">
      <h1>Groupes</h1>
      <p>
        Associations, écoles, formations : le responsable d’un groupe suit la progression de ses
        membres.
      </p>
    </header>

    @if (!auth.user()) {
      <section class="card" aria-labelledby="compte-requis">
        <h2 id="compte-requis">Un compte est nécessaire</h2>
        <p>
          Pour rejoindre ou créer un groupe, connectez-vous ou créez un compte gratuit.
          @if (code(); as value) {
            Gardez ce code pour rejoindre ensuite le groupe : <strong>{{ value }}</strong
            >.
          }
        </p>
        <div class="row">
          <a class="btn btn-primary" routerLink="/connexion">Se connecter</a>
          <a class="btn btn-secondary" routerLink="/inscription">Créer un compte</a>
        </div>
      </section>
    } @else {
      <section class="card" aria-labelledby="rejoindre">
        <h2 id="rejoindre">Rejoindre un groupe</h2>
        <form class="form" (submit)="join($event, codeField.value)">
          <div class="field">
            <label for="code-groupe">Code du groupe</label>
            <input
              #codeField
              id="code-groupe"
              autocomplete="off"
              spellcheck="false"
              [value]="code() ?? ''"
            />
          </div>
          <label class="toggle">
            <input type="checkbox" [checked]="accepted()" (change)="accepted.set(!accepted())" />
            J’ai 15 ans ou plus, et j’accepte que le responsable du groupe voie mon prénom ou
            pseudonyme et ma progression : leçons validées, laboratoires réussis, dernière activité.
          </label>
          <button type="submit" class="btn btn-primary" [disabled]="!accepted() || pending()">
            {{ pending() ? 'Patientez…' : 'Rejoindre le groupe' }}
          </button>
        </form>
        <p class="hint">
          Ni votre adresse e-mail ni vos réponses ne sont montrées, et vous pouvez quitter un groupe
          à tout moment. Les groupes ne sont pas ouverts aux moins de 15 ans, pour qui l’accord des
          parents serait nécessaire.
        </p>
      </section>

      @if (joined().length > 0) {
        <section class="card" aria-labelledby="mes-groupes">
          <h2 id="mes-groupes">Mes groupes</h2>
          <ul class="groups">
            @for (group of joined(); track group.id) {
              <li>
                <span>
                  <strong>{{ group.name }}</strong>
                  @if (premiumUntil(group); as until) {
                    <span class="hint">Premium offert jusqu’au {{ until | date: 'longDate' }}</span>
                  }
                </span>
                <button type="button" class="btn btn-secondary" (click)="leave(group)">
                  Quitter
                </button>
              </li>
            }
          </ul>
        </section>
      }

      <section class="card" aria-labelledby="animer">
        <h2 id="animer">Animer un groupe</h2>
        @if (owned().length > 0) {
          <ul class="groups">
            @for (group of owned(); track group.id) {
              <li>
                <a [routerLink]="['/groupes', group.id]">{{ group.name }}</a>
                <span class="hint">Code {{ group.joinCode }}</span>
              </li>
            }
          </ul>
        }
        <form class="form" (submit)="create($event, nameField)">
          <div class="field">
            <label for="nom-groupe">Nom du nouveau groupe</label>
            <input #nameField id="nom-groupe" maxlength="60" autocomplete="off" />
          </div>
          <button type="submit" class="btn btn-secondary" [disabled]="pending()">
            Créer le groupe
          </button>
        </form>
        <p class="hint">
          Vous obtenez un code à donner aux membres. Accès Premium pour tout le groupe : sur devis,
          en écrivant à l’adresse de contact des
          <a routerLink="/mentions-legales">mentions légales</a>.
        </p>
      </section>
    }
    <p role="status" class="hint">{{ message() }}</p>
  `,
  styles: `
    section {
      margin-bottom: var(--space-5);
    }

    .form,
    .field {
      display: grid;
      gap: var(--space-3);
      justify-items: start;
    }

    .field {
      width: 100%;
      max-width: 28rem;
    }

    label {
      font-weight: 600;
    }

    input:not([type='checkbox']) {
      width: 100%;
      min-height: var(--target-min);
      padding: 0 var(--space-3);
      border: 1px solid var(--color-control-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      color: var(--color-text);
      font: inherit;
    }

    .toggle {
      display: flex;
      align-items: flex-start;
      gap: var(--space-2);
      font-weight: 400;
    }

    .toggle input {
      flex: none;
      width: 1.25rem;
      height: 1.25rem;
      margin: 0.15rem 0 0;
    }

    .groups {
      display: grid;
      gap: var(--space-2);
      margin: 0 0 var(--space-4);
      padding: 0;
      list-style: none;
    }

    .groups li {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
    }

    .groups li > span {
      display: grid;
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
    }

    .hint {
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }
  `,
})
export class GroupsPage {
  /** Code reçu dans le lien d'invitation (?code=…). */
  readonly code = input<string>();

  protected readonly auth = inject(AuthService);
  private readonly service = inject(GroupsService);
  protected readonly joined = computed(() => this.service.groups().filter((g) => !g.owned));
  protected readonly owned = computed(() => this.service.groups().filter((g) => g.owned));
  protected readonly accepted = signal(false);
  protected readonly pending = signal(false);
  protected readonly message = signal('');

  protected premiumUntil(group: Group): string | null {
    return group.premiumUntil && new Date(group.premiumUntil) > new Date()
      ? group.premiumUntil
      : null;
  }

  protected async join(event: Event, code: string): Promise<void> {
    event.preventDefault();
    if (await this.run(() => this.service.join(code, this.accepted()))) {
      this.accepted.set(false);
      this.message.set('Vous avez rejoint le groupe.');
    }
  }

  protected async leave(group: Group): Promise<void> {
    if (await this.run(() => this.service.leave(group.id))) {
      this.message.set(`Vous avez quitté « ${group.name} ».`);
    }
  }

  protected async create(event: Event, field: HTMLInputElement): Promise<void> {
    event.preventDefault();
    if (await this.run(() => this.service.create(field.value))) {
      this.message.set(`Groupe « ${field.value.trim()} » créé : donnez son code aux membres.`);
      field.value = '';
    }
  }

  /** Vrai si l'opération a réussi ; sinon, son message d'erreur est affiché. */
  private async run(action: () => Promise<string | null>): Promise<boolean> {
    if (this.pending()) return false;
    this.pending.set(true);
    this.message.set('');
    const error = await action();
    this.pending.set(false);
    if (error) this.message.set(error);
    return error === null;
  }
}
