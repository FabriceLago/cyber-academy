import { DatePipe } from '@angular/common';
import {
  Component,
  DOCUMENT,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CATALOG } from '../../content/outline.generated';
import { GroupsService, MemberProgress } from '../../core/groups/groups.service';

const LESSON_COUNT = CATALOG.paths.reduce(
  (sum, path) => sum + path.modules.reduce((n, module) => n + module.lessons.length, 0),
  0,
);

/** Suivi d'un groupe par son responsable : code d'invitation, progression des membres. */
@Component({
  selector: 'ca-group-page',
  imports: [RouterLink, DatePipe],
  template: `
    @if (group(); as current) {
      <header class="page-header">
        <h1>{{ current.name }}</h1>
        <p>Groupe que vous animez : progression de ses membres.</p>
      </header>

      <section class="card" aria-labelledby="inviter">
        <h2 id="inviter">Inviter</h2>
        <p>
          Code du groupe : <strong class="code">{{ current.joinCode }}</strong>
        </p>
        <p>
          Lien à partager :
          <span class="link">{{ origin }}/groupes?code={{ current.joinCode }}</span>
        </p>
        <p class="hint">
          Chaque membre rejoint le groupe avec son compte, en acceptant que vous voyiez son prénom
          ou pseudonyme et sa progression, jamais son adresse e-mail ni ses réponses. Un nouveau
          code rend l’ancien inutilisable ; les membres déjà présents restent.
        </p>
        <button type="button" class="btn btn-secondary" (click)="renew()">Nouveau code</button>
        @if (premiumUntil(); as until) {
          <p>Premium offert aux membres jusqu’au {{ until | date: 'longDate' }}.</p>
        } @else {
          <p class="hint">
            Premium pour tout le groupe : sur devis, en écrivant à l’adresse de contact des
            <a routerLink="/mentions-legales">mentions légales</a>.
          </p>
        }
      </section>

      <section class="card" aria-labelledby="membres">
        <h2 id="membres">Membres ({{ members().length }})</h2>
        @if (members().length === 0) {
          <p>Personne n’a encore rejoint ce groupe.</p>
        } @else {
          <div class="scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Membre</th>
                  <th scope="col">Leçons validées</th>
                  <th scope="col">Laboratoires réussis</th>
                  <th scope="col">Dernière activité</th>
                  <th scope="col"><span class="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                @for (member of members(); track member.userId) {
                  <tr>
                    <th scope="row">
                      {{ member.displayName }}
                      <span class="hint">depuis le {{ member.joinedAt | date: 'longDate' }}</span>
                    </th>
                    <td>{{ member.lessonsCompleted }} / {{ lessonCount }}</td>
                    <td>{{ member.labsSucceeded }} / {{ labCount }}</td>
                    <td>
                      {{
                        member.lastActivity ? (member.lastActivity | date: 'longDate') : 'Aucune'
                      }}
                    </td>
                    <td>
                      <button
                        type="button"
                        class="btn btn-secondary"
                        [attr.aria-label]="'Retirer ' + member.displayName + ' du groupe'"
                        (click)="removeMember(member)"
                      >
                        Retirer
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>

      <section class="card" aria-labelledby="supprimer">
        <h2 id="supprimer">Supprimer le groupe</h2>
        @if (confirming()) {
          <p>
            <strong>Supprimer « {{ current.name }} » ?</strong> Ses membres en sortent ; leur
            progression reste sur leur compte. Cette action ne peut pas être annulée.
          </p>
          <div class="row">
            <button type="button" class="btn btn-primary" (click)="remove()">
              Oui, supprimer le groupe
            </button>
            <button type="button" class="btn btn-secondary" (click)="confirming.set(false)">
              Annuler
            </button>
          </div>
        } @else {
          <button type="button" class="btn btn-secondary" (click)="confirming.set(true)">
            Supprimer le groupe
          </button>
        }
      </section>
    } @else if (groups.loaded()) {
      <header class="page-header">
        <h1>Groupe introuvable</h1>
        <p>Ce groupe n’existe pas, ou vous n’en êtes pas le responsable.</p>
      </header>
      <a class="btn btn-secondary" routerLink="/groupes">Retour aux groupes</a>
    }
    <p role="status" class="hint">{{ message() }}</p>
  `,
  styles: `
    section {
      margin-bottom: var(--space-5);
    }

    .code {
      font-family: var(--font-mono);
      font-size: var(--text-lg);
      letter-spacing: 0.08em;
    }

    .link {
      font-family: var(--font-mono);
      overflow-wrap: anywhere;
    }

    .scroll {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--text-sm);
    }

    th,
    td {
      padding: var(--space-3) var(--space-2) var(--space-3) 0;
      border-bottom: 1px solid var(--glass-border);
      text-align: left;
      vertical-align: top;
    }

    thead th {
      color: var(--color-text-muted);
      font-size: var(--text-xs);
      text-transform: uppercase;
    }

    tbody th span {
      display: block;
      font-weight: 400;
    }

    td {
      font-variant-numeric: tabular-nums;
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
export class GroupPage {
  readonly groupId = input.required<string>();

  protected readonly groups = inject(GroupsService);
  private readonly router = inject(Router);
  protected readonly origin = inject(DOCUMENT).location.origin;
  protected readonly lessonCount = LESSON_COUNT;
  protected readonly labCount = CATALOG.labs.length;
  protected readonly group = computed(
    () => this.groups.groups().find((g) => g.id === this.groupId() && g.owned) ?? null,
  );
  protected readonly premiumUntil = computed(() => {
    const until = this.group()?.premiumUntil;
    return until && new Date(until) > new Date() ? until : null;
  });
  protected readonly members = signal<readonly MemberProgress[]>([]);
  protected readonly confirming = signal(false);
  protected readonly message = signal('');
  private readonly openedId = computed(() => this.group()?.id ?? null);

  constructor() {
    effect(() => {
      const id = this.openedId();
      if (id) untracked(() => void this.refresh(id));
    });
  }

  protected async renew(): Promise<void> {
    const error = await this.groups.renewCode(this.groupId());
    this.message.set(
      error ?? 'Nouveau code créé : l’ancien ne permet plus de rejoindre le groupe.',
    );
  }

  protected async removeMember(member: MemberProgress): Promise<void> {
    const error = await this.groups.removeMember(this.groupId(), member.userId);
    if (error) {
      this.message.set(error);
      return;
    }
    this.message.set(`${member.displayName} ne fait plus partie du groupe.`);
    await this.refresh(this.groupId());
  }

  protected async remove(): Promise<void> {
    const error = await this.groups.remove(this.groupId());
    this.confirming.set(false);
    if (error) this.message.set(error);
    else await this.router.navigateByUrl('/groupes');
  }

  private async refresh(id: string): Promise<void> {
    const result = await this.groups.progress(id);
    if (typeof result === 'string') this.message.set(result);
    else this.members.set(result);
  }
}
