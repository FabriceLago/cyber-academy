import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { CAPTCHA_PENDING, Captcha } from '../../shared/captcha/captcha';
import { validateAuthForm } from './auth-page';

/**
 * Mot de passe oublié (/mot-de-passe-oublie : demande du lien) et nouveau mot de passe
 * (/nouveau-mot-de-passe : page ouverte par le lien, ou depuis le profil après une connexion).
 */
@Component({
  selector: 'ca-password-page',
  imports: [RouterLink, Captcha],
  styleUrl: './auth-page.css',
  template: `
    <header class="page-header">
      <h1>{{ request() ? 'Mot de passe oublié' : 'Nouveau mot de passe' }}</h1>
      <p>
        @if (request()) {
          Indiquez l’adresse de votre compte : vous recevrez un lien pour choisir un nouveau mot de
          passe.
        } @else {
          Choisissez le mot de passe qui remplacera l’ancien.
        }
      </p>
    </header>

    @if (done()) {
      <section class="card" role="status" aria-labelledby="fait">
        @if (request()) {
          <h2 id="fait">Vérifiez votre boîte de réception</h2>
          <p>
            Si un compte existe pour {{ value() }}, un message vient de lui être envoyé. Ouvrez le
            lien qu’il contient <strong>dans ce navigateur</strong> : par sécurité, il ne fonctionne
            pas ailleurs.
          </p>
        } @else {
          <h2 id="fait">Mot de passe modifié</h2>
          <p>Utilisez désormais votre nouveau mot de passe pour vous connecter.</p>
          <a class="btn btn-primary" routerLink="/profil">Voir mon compte</a>
        }
      </section>
    } @else if (!request() && !auth.ready()) {
      <p role="status">Vérification du lien…</p>
    } @else if (!request() && !auth.user()) {
      <section class="card" aria-labelledby="lien-invalide">
        <h2 id="lien-invalide">Lien expiré ou déjà utilisé</h2>
        <p>
          Ce lien n’est plus valable, ou il a été ouvert dans un autre navigateur que celui de la
          demande. Demandez-en un nouveau.
        </p>
        <a class="btn btn-primary" routerLink="/mot-de-passe-oublie">Demander un nouveau lien</a>
      </section>
    } @else {
      <form class="card form" novalidate (submit)="submit($event)">
        @if (error(); as message) {
          <div #summary class="error-summary" role="alert" tabindex="-1">
            <p>{{ message }}</p>
            @if (!request() && message.includes('lien')) {
              <a routerLink="/mot-de-passe-oublie">Demander un lien de réinitialisation</a>
            }
          </div>
        }
        <div class="field">
          @if (request()) {
            <label for="email">Adresse e-mail</label>
            <input
              #field
              id="email"
              type="email"
              autocomplete="email"
              spellcheck="false"
              [value]="value()"
              (input)="value.set(field.value)"
              [attr.aria-invalid]="error() ? true : null"
            />
          } @else {
            <label for="mot-de-passe">Nouveau mot de passe</label>
            <p id="mot-de-passe-aide" class="hint">
              Au moins 10 caractères. Une phrase de plusieurs mots, facile à retenir, est plus sûre
              qu’un mot compliqué.
            </p>
            <input
              #field
              id="mot-de-passe"
              [type]="showPassword() ? 'text' : 'password'"
              autocomplete="new-password"
              aria-describedby="mot-de-passe-aide"
              [value]="value()"
              (input)="value.set(field.value)"
              [attr.aria-invalid]="error() ? true : null"
            />
            <label class="toggle">
              <input
                type="checkbox"
                [checked]="showPassword()"
                (change)="showPassword.set(!showPassword())"
              />
              Afficher le mot de passe
            </label>
          }
        </div>
        @if (request()) {
          <ca-captcha />
        }
        <button type="submit" class="btn btn-primary">
          {{ pending() ? 'Patientez…' : request() ? 'Recevoir le lien' : 'Enregistrer' }}
        </button>
        @if (request()) {
          <p class="switch"><a routerLink="/connexion">Retour à la connexion</a></p>
        }
      </form>
    }
  `,
})
export class PasswordPage {
  /** Fourni par les données de la route. */
  readonly mode = input<'demande' | 'nouveau'>('demande');

  protected readonly auth = inject(AuthService);
  private readonly injector = inject(Injector);
  private readonly summary = viewChild<ElementRef<HTMLElement>>('summary');
  private readonly captcha = viewChild(Captcha);

  protected readonly request = computed(() => this.mode() === 'demande');
  protected readonly value = signal('');
  protected readonly showPassword = signal(false);
  protected readonly pending = signal(false);
  protected readonly error = signal('');
  protected readonly done = signal(false);

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.pending()) return;
    // Mêmes règles qu'à l'inscription, pour l'adresse ou pour le mot de passe.
    const errors = this.request()
      ? validateAuthForm({ name: 'x', email: this.value(), password: 'x' }, false)
      : validateAuthForm({ name: 'x', email: 'a@b.fr', password: this.value() }, true);
    const invalid = errors.email ?? errors['mot-de-passe'];
    if (invalid) return this.fail(invalid);
    const captchaToken = this.captcha()?.take();
    if (captchaToken === null) return this.fail(CAPTCHA_PENDING);

    this.pending.set(true);
    const result = this.request()
      ? await this.auth.requestPasswordReset(this.value().trim(), captchaToken)
      : await this.auth.updatePassword(this.value());
    this.pending.set(false);
    this.captcha()?.reset();
    if (!result.ok) return this.fail(result.message);
    this.error.set('');
    this.done.set(true);
  }

  private fail(message: string): void {
    this.error.set(message);
    afterNextRender(() => this.summary()?.nativeElement.focus(), { injector: this.injector });
  }
}
