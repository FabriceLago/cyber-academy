import {
  Component,
  DOCUMENT,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { AccountProgress, RecordError, recordMessage } from '../../core/progress/account-progress';
import { ProgressState } from '../../core/models/progress.model';
import { FlashcardStore } from '../../core/progress/flashcards';
import { ProgressStore, readBackup } from '../../core/progress/progress.store';
import { ThemePreference, ThemeService } from '../../core/theme/theme.service';

/** Une sauvegarde réelle pèse quelques dizaines de ko : au-delà, le fichier n'est pas lu. */
const MAX_BACKUP_BYTES = 1_000_000;

@Component({
  selector: 'ca-profile-page',
  imports: [RouterLink],
  template: `
    <header class="page-header">
      <h1>Profil et paramètres</h1>
      <p>Réglez l’affichage de la plateforme.</p>
    </header>

    <section class="card" aria-labelledby="apparence">
      <h2 id="apparence">Apparence</h2>
      <fieldset>
        <legend>Thème</legend>
        @for (option of themeOptions; track option.value) {
          <div class="choice">
            <input
              type="radio"
              name="theme"
              [id]="'theme-' + option.value"
              [value]="option.value"
              [checked]="theme.preference() === option.value"
              [attr.aria-describedby]="'theme-' + option.value + '-hint'"
              (change)="theme.preference.set(option.value)"
            />
            <label [attr.for]="'theme-' + option.value">{{ option.label }}</label>
            <span class="hint" [id]="'theme-' + option.value + '-hint'">{{ option.hint }}</span>
          </div>
        }
      </fieldset>
    </section>

    <section class="card" aria-labelledby="objectif">
      <h2 id="objectif">Objectif hebdomadaire</h2>
      <label class="field-label" for="weekly-goal">Leçons à valider chaque semaine</label>
      <select id="weekly-goal" aria-describedby="weekly-goal-hint" (change)="setWeeklyGoal($event)">
        <option value="" [selected]="weeklyGoal() === null">Aucun objectif</option>
        @for (goal of goalOptions; track goal) {
          <option [value]="goal" [selected]="weeklyGoal() === goal">
            {{ goal }} {{ goal > 1 ? 'leçons' : 'leçon' }}
          </option>
        }
      </select>
      <p class="hint" id="weekly-goal-hint">
        Facultatif. Le tableau de bord indique où vous en êtes depuis lundi.
      </p>
      <p role="status" class="hint">{{ goalMessage() }}</p>
    </section>

    <section class="card" aria-labelledby="progression">
      <h2 id="progression">Progression</h2>
      @if (progress.fromAccount()) {
        <p class="hint">
          Vos tentatives sont enregistrées sur votre compte, après vérification par le serveur.
          Elles forment votre historique et ne peuvent pas être effacées.
        </p>
      } @else {
        <p class="hint">
          Vos tentatives de quiz et de laboratoire sont gardées dans ce navigateur.
        </p>
        @if (confirmingReset()) {
          <p>
            <strong>Effacer vos tentatives et vos cartes mémoire ?</strong> Quiz, laboratoires et
            cartes repartent de zéro. Cette action est définitive ; votre objectif hebdomadaire est
            conservé.
          </p>
          <div class="row">
            <button #confirmResetRef type="button" class="btn btn-primary" (click)="reset()">
              Oui, réinitialiser
            </button>
            <button type="button" class="btn btn-secondary" (click)="cancelReset()">Annuler</button>
          </div>
        } @else {
          <button #askResetRef type="button" class="btn btn-secondary" (click)="askReset()">
            Réinitialiser ma progression
          </button>
        }
        <p role="status" class="hint">{{ resetMessage() }}</p>
      }

      <h3>Sauvegarde</h3>
      <p class="hint">
        Téléchargez votre progression dans un fichier pour la garder, ou la reprendre dans un autre
        navigateur sans compte. Il contient vos tentatives et votre objectif hebdomadaire, sans
        adresse e-mail. Le rapport du projet final s’exporte depuis sa page, avec le portfolio.
      </p>
      <button type="button" class="btn btn-secondary" (click)="download()">
        Télécharger une sauvegarde
      </button>
      @if (progress.fromAccount()) {
        <p class="hint">
          La restauration ne concerne que la progression sans compte : celle de votre compte est
          vérifiée par le serveur.
        </p>
      } @else {
        <label class="field-label backup-label" for="backup-file">
          Restaurer une sauvegarde (fichier .json, 1 Mo au plus)
        </label>
        <input
          #backupFile
          id="backup-file"
          type="file"
          accept=".json,application/json"
          (change)="readFile(backupFile)"
        />
        @if (pendingBackup(); as pending) {
          <p>
            <strong>Remplacer la progression de ce navigateur ?</strong> Le fichier contient
            {{ pending.state.quizAttempts.length }} tentative(s) de quiz et
            {{ pending.state.labAttempts.length }} de laboratoire{{
              pending.ignored > 0
                ? ' ; ' + pending.ignored + ' entrée(s) invalide(s) seront ignorée(s)'
                : ''
            }}. Vos {{ localAttempts() }} tentative(s) actuelle(s) seront remplacées.
          </p>
          <div class="row">
            <button #confirmRestoreRef type="button" class="btn btn-primary" (click)="restore()">
              Oui, remplacer
            </button>
            <button type="button" class="btn btn-secondary" (click)="cancelRestore()">
              Annuler
            </button>
          </div>
        }
      }
      <p role="status" class="hint">{{ backupMessage() }}</p>
    </section>

    <section class="card" aria-labelledby="compte">
      <h2 id="compte">Compte</h2>
      @if (auth.user(); as user) {
        <p>
          Session ouverte avec l’adresse <strong>{{ user.email }}</strong
          >{{ auth.profile() ? ', au nom de ' + auth.profile()?.displayName : '' }}.
        </p>
        <p class="hint">
          Votre progression est enregistrée sur votre compte : vous la retrouvez sur tous vos
          appareils.
        </p>
        @if (localAttempts() > 0) {
          <p class="hint">
            Ce navigateur garde aussi {{ localAttempts() }} tentative(s) faite(s) sans compte. Elles
            ne sont pas ajoutées à votre compte, car le serveur n’a pas pu les vérifier ; elles
            réapparaissent si vous vous déconnectez.
          </p>
        }
        <div class="row">
          <button type="button" class="btn btn-secondary" (click)="auth.signOut()">
            Se déconnecter
          </button>
          <a class="btn btn-secondary" routerLink="/nouveau-mot-de-passe">
            Changer de mot de passe
          </a>
          <a class="btn btn-secondary" routerLink="/abonnement">Mon abonnement</a>
        </div>

        <h3>Supprimer le compte</h3>
        @if (confirmingDelete()) {
          <p>
            <strong>Supprimer définitivement votre compte ?</strong> Votre adresse, votre profil,
            vos tentatives, vos points et vos badges seront effacés du serveur. Cette action ne peut
            pas être annulée. Pensez à télécharger une sauvegarde avant, si vous voulez la garder.
          </p>
          <div class="row">
            <button
              #confirmDeleteRef
              type="button"
              class="btn btn-primary"
              (click)="deleteAccount()"
            >
              {{ deleting() ? 'Patientez…' : 'Oui, supprimer mon compte' }}
            </button>
            <button type="button" class="btn btn-secondary" (click)="cancelDelete()">
              Annuler
            </button>
          </div>
        } @else {
          <button #askDeleteRef type="button" class="btn btn-secondary" (click)="askDelete()">
            Supprimer mon compte
          </button>
        }
      } @else {
        <p class="hint">
          Sans compte, tout fonctionne : votre progression est gardée dans ce navigateur. Un compte
          gratuit l’enregistre sur le serveur, la rend disponible sur vos autres appareils et vous
          fait gagner des points et des badges.
        </p>
        <div class="row">
          <a class="btn btn-primary" routerLink="/connexion">Se connecter</a>
          <a class="btn btn-secondary" routerLink="/inscription">Créer un compte</a>
        </div>
      }
      <p role="status" class="hint">{{ accountMessage() }}</p>
    </section>
  `,
  styles: `
    section {
      margin-bottom: var(--space-5);
    }

    fieldset {
      display: grid;
      gap: var(--space-2);
      margin: 0;
      padding: 0;
      border: 0;
    }

    legend {
      margin-bottom: var(--space-2);
      font-weight: 600;
    }

    .choice {
      display: grid;
      grid-template-columns: auto 1fr;
      column-gap: var(--space-3);
      align-items: center;
      padding: var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
    }

    .choice:has(input:checked) {
      border-color: var(--color-accent);
      background: var(--color-accent-soft);
    }

    input[type='radio'] {
      width: 1.25rem;
      height: 1.25rem;
      margin: 0;
    }

    h3 {
      margin: var(--space-5) 0 var(--space-2);
    }

    .backup-label {
      margin-top: var(--space-4);
    }

    input[type='file'] {
      display: block;
      max-width: 100%;
      margin-bottom: var(--space-3);
      font: inherit;
    }

    label {
      font-weight: 600;
      cursor: pointer;
    }

    .hint {
      grid-column: 2;
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }

    .field-label {
      display: block;
      margin-bottom: var(--space-2);
    }

    select {
      min-height: var(--target-min);
      padding: 0 var(--space-3);
      border: 1px solid var(--color-control-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      color: var(--color-text);
      font: inherit;
    }

    select + .hint {
      margin: var(--space-2) 0 0;
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    [role='status'] {
      margin: var(--space-2) 0 0;
    }
  `,
})
export class ProfilePage {
  protected readonly auth = inject(AuthService);
  protected readonly progress = inject(ProgressStore);
  private readonly flashcards = inject(FlashcardStore);
  private readonly account = inject(AccountProgress);
  protected readonly weeklyGoal = computed(() => this.progress.state().weeklyGoal);
  protected readonly goalOptions = [1, 2, 3, 4, 5, 6, 7];
  protected readonly goalMessage = signal('');
  /** Tentatives faites sans compte dans ce navigateur. */
  protected readonly localAttempts = computed(
    () => this.progress.local().quizAttempts.length + this.progress.local().labAttempts.length,
  );

  protected async setWeeklyGoal(event: Event): Promise<void> {
    const value = (event.target as HTMLSelectElement).value;
    const goal = value === '' ? null : Number(value);
    this.goalMessage.set('');
    if (!this.account.active()) {
      this.progress.setWeeklyGoal(goal);
      return;
    }
    try {
      await this.account.setWeeklyGoal(goal);
      this.goalMessage.set('Objectif enregistré sur votre compte.');
    } catch (error) {
      this.goalMessage.set(error instanceof RecordError ? error.message : recordMessage({}));
    }
  }

  private readonly injector = inject(Injector);
  private readonly askResetButton = viewChild<ElementRef<HTMLButtonElement>>('askResetRef');
  private readonly confirmResetButton = viewChild<ElementRef<HTMLButtonElement>>('confirmResetRef');
  protected readonly confirmingReset = signal(false);
  protected readonly resetMessage = signal('');

  /** Le bouton cliqué disparaît : le focus passe au bouton suivant pour ne pas être perdu. */
  protected askReset(): void {
    this.resetMessage.set('');
    this.confirmingReset.set(true);
    this.focusAfterRender(() => this.confirmResetButton());
  }

  protected cancelReset(): void {
    this.confirmingReset.set(false);
    this.focusAfterRender(() => this.askResetButton());
  }

  protected reset(): void {
    this.progress.reset();
    this.flashcards.reset();
    this.resetMessage.set('Progression réinitialisée.');
    this.cancelReset();
  }

  private readonly askDeleteButton = viewChild<ElementRef<HTMLButtonElement>>('askDeleteRef');
  private readonly confirmDeleteButton =
    viewChild<ElementRef<HTMLButtonElement>>('confirmDeleteRef');
  protected readonly confirmingDelete = signal(false);
  protected readonly deleting = signal(false);
  protected readonly accountMessage = signal('');

  protected askDelete(): void {
    this.accountMessage.set('');
    this.confirmingDelete.set(true);
    this.focusAfterRender(() => this.confirmDeleteButton());
  }

  protected cancelDelete(): void {
    this.confirmingDelete.set(false);
    this.focusAfterRender(() => this.askDeleteButton());
  }

  protected async deleteAccount(): Promise<void> {
    if (this.deleting()) return;
    this.deleting.set(true);
    const result = await this.auth.deleteAccount();
    this.deleting.set(false);
    this.confirmingDelete.set(false);
    this.accountMessage.set(
      result.ok ? 'Votre compte et ses données ont été supprimés.' : result.message,
    );
  }

  private readonly document = inject(DOCUMENT);
  private readonly confirmRestoreButton =
    viewChild<ElementRef<HTMLButtonElement>>('confirmRestoreRef');
  private readonly backupInput = viewChild<ElementRef<HTMLInputElement>>('backupFile');
  /** Sauvegarde lue et validée, en attente de confirmation. */
  protected readonly pendingBackup = signal<{ state: ProgressState; ignored: number } | null>(null);
  protected readonly backupMessage = signal('');

  protected download(): void {
    const state = this.progress.state();
    const name = `cyber-academy-progression-${new Date().toISOString().slice(0, 10)}.json`;
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = this.document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url));
    this.backupMessage.set(`Fichier « ${name} » téléchargé.`);
  }

  /** Lit le fichier choisi ; rien n'est remplacé avant la confirmation. */
  protected async readFile(input: HTMLInputElement): Promise<void> {
    const file = input.files?.[0];
    input.value = ''; // Le même fichier pourra être choisi de nouveau.
    this.pendingBackup.set(null);
    if (!file) return;
    if (file.size > MAX_BACKUP_BYTES) {
      this.backupMessage.set('Fichier trop volumineux : une sauvegarde fait moins de 1 Mo.');
      return;
    }
    const backup = readBackup(await file.text());
    if (!backup) {
      this.backupMessage.set('Ce fichier n’est pas une sauvegarde Cyber Academy lisible.');
      return;
    }
    this.backupMessage.set('');
    this.pendingBackup.set(backup);
    this.focusAfterRender(() => this.confirmRestoreButton());
  }

  protected restore(): void {
    const backup = this.pendingBackup();
    if (!backup) return;
    this.progress.restore(backup.state);
    this.backupMessage.set('Progression restaurée depuis le fichier.');
    this.cancelRestore();
  }

  protected cancelRestore(): void {
    this.pendingBackup.set(null);
    afterNextRender(() => this.backupInput()?.nativeElement.focus(), { injector: this.injector });
  }

  private focusAfterRender(target: () => ElementRef<HTMLButtonElement> | undefined): void {
    afterNextRender(() => target()?.nativeElement.focus(), { injector: this.injector });
  }

  protected readonly theme = inject(ThemeService);
  protected readonly themeOptions: readonly {
    value: ThemePreference;
    label: string;
    hint: string;
  }[] = [
    {
      value: 'system',
      label: 'Selon l’appareil',
      hint: 'Suit le réglage clair ou sombre de votre système.',
    },
    { value: 'dark', label: 'Sombre', hint: 'Fond bleu nuit, texte clair.' },
    { value: 'light', label: 'Clair', hint: 'Fond clair, texte foncé.' },
  ];
}
