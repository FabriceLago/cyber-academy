import {
  Component,
  ElementRef,
  Injector,
  Signal,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { SUPABASE } from '../../core/supabase/supabase';

let nextId = 0;

/** Message pour l'apprenant selon le code renvoyé par report_content. */
export function reportMessage(error: { readonly code?: string }): string {
  switch (error.code) {
    case 'CA429':
      return 'Trop de signalements en une heure : réessayez plus tard.';
    case '28000':
    case 'PGRST301':
      return 'Votre session a expiré : reconnectez-vous, puis réessayez.';
    default:
      return 'L’envoi a échoué : vérifiez votre connexion, puis réessayez.';
  }
}

/**
 * « Signaler une erreur » sur une leçon, une question de son quiz ou un laboratoire. Le message
 * part par la fonction serveur report_content, réservée aux comptes : la table des signalements
 * n'est ni lisible ni modifiable depuis le navigateur.
 */
@Component({
  selector: 'ca-report-error',
  imports: [RouterLink],
  template: `
    @if (sent()) {
      <p #done class="done" role="status" tabindex="-1">
        Merci : votre signalement a été envoyé à l’équipe.
      </p>
    } @else if (open()) {
      <div #panel class="panel" role="group" tabindex="-1" [attr.aria-labelledby]="id + '-titre'">
        <p [id]="id + '-titre'" class="title">Signaler une erreur {{ about() }}</p>
        @if (signedIn()) {
          <label [for]="id">Qu’est-ce qui ne va pas ?</label>
          <textarea
            #field
            [id]="id"
            rows="3"
            maxlength="1000"
            [attr.aria-describedby]="id + '-aide'"
            [attr.aria-invalid]="error() ? true : null"
          ></textarea>
          <p [id]="id + '-aide'" class="hint">
            Une erreur, une explication confuse, une réponse discutable : 10 à 1 000 caractères. N’y
            mettez pas de données personnelles.
          </p>
          @if (error()) {
            <p class="error" role="alert">{{ error() }}</p>
          }
          <div class="actions">
            <button
              type="button"
              class="btn btn-primary"
              [disabled]="sending()"
              (click)="send(field.value)"
            >
              {{ sending() ? 'Envoi en cours…' : 'Envoyer le signalement' }}
            </button>
            <button type="button" class="btn btn-secondary" (click)="close()">Annuler</button>
          </div>
        } @else {
          <p>
            Les signalements demandent un compte : <a routerLink="/connexion">connectez-vous</a> ou
            <a routerLink="/inscription">créez un compte</a>, puis revenez sur cette page.
          </p>
          <div class="actions">
            <button type="button" class="btn btn-secondary" (click)="close()">Fermer</button>
          </div>
        }
      </div>
    } @else {
      <button #toggle type="button" class="btn btn-ghost" (click)="show()">
        Signaler une erreur<span class="visually-hidden"> {{ about() }}</span>
      </button>
    }
  `,
  styles: `
    :host {
      display: block;
      margin-top: var(--space-3);
    }

    .panel {
      display: grid;
      gap: var(--space-2);
      padding: var(--space-3);
      border: 1px solid var(--color-control-border);
      border-radius: var(--radius-md);
    }

    .panel p {
      margin: 0;
    }

    .title,
    label {
      font-weight: 650;
    }

    textarea {
      width: 100%;
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--color-control-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      color: var(--color-text);
      font: inherit;
      resize: vertical;
    }

    .hint,
    .done {
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }

    .error {
      color: var(--color-danger);
      font-weight: 650;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
    }
  `,
})
export class ReportError {
  readonly lessonId = input<string>();
  readonly questionId = input<string>();
  readonly labId = input<string>();
  /** Précise ce qui est signalé : « dans cette leçon », « sur la question 2 »… */
  readonly about = input.required<string>();

  private readonly auth = inject(AuthService);
  private readonly client = inject(SUPABASE);
  private readonly injector = inject(Injector);
  private readonly toggle = viewChild<ElementRef<HTMLElement>>('toggle');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly field = viewChild<ElementRef<HTMLElement>>('field');
  private readonly done = viewChild<ElementRef<HTMLElement>>('done');

  protected readonly id = `signalement-${++nextId}`;
  protected readonly signedIn = computed(() => this.auth.userId() !== null);
  protected readonly open = signal(false);
  protected readonly sending = signal(false);
  protected readonly sent = signal(false);
  protected readonly error = signal('');

  protected show(): void {
    this.open.set(true);
    this.focus(this.signedIn() ? this.field : this.panel);
  }

  protected close(): void {
    this.open.set(false);
    this.error.set('');
    this.focus(this.toggle);
  }

  protected async send(message: string): Promise<void> {
    const text = message.trim();
    if (text.length < 10) {
      this.error.set('Décrivez le problème en 10 caractères au moins.');
      this.focus(this.field);
      return;
    }
    this.sending.set(true);
    this.error.set('');
    try {
      const supabase = await this.client;
      const { error } = await supabase.rpc('report_content', {
        p_message: text,
        p_lesson_id: this.lessonId(),
        p_question_id: this.questionId(),
        p_lab_id: this.labId(),
      });
      if (error) {
        this.error.set(reportMessage(error));
      } else {
        this.sent.set(true);
        this.focus(this.done);
      }
    } catch {
      this.error.set(reportMessage({}));
    } finally {
      this.sending.set(false);
    }
  }

  private focus(target: Signal<ElementRef<HTMLElement> | undefined>): void {
    afterNextRender(() => target()?.nativeElement.focus(), { injector: this.injector });
  }
}
