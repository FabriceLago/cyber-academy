import {
  Component,
  DOCUMENT,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

type Field = 'nom' | 'email' | 'mot-de-passe';
export type FieldErrors = Partial<Record<Field, string>>;

/** Contrôles faits avant l'envoi ; le serveur revérifie (longueur du mot de passe, adresse). */
export function validateAuthForm(
  values: { readonly name: string; readonly email: string; readonly password: string },
  signup: boolean,
): FieldErrors {
  const errors: FieldErrors = {};
  const name = values.name.trim();
  if (signup && (name.length === 0 || name.length > 50)) {
    errors.nom = 'Indiquez un prénom ou un pseudonyme (50 caractères au plus).';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Indiquez une adresse e-mail valide, par exemple nom@exemple.fr.';
  }
  if (values.password.length === 0) {
    errors['mot-de-passe'] = 'Indiquez votre mot de passe.';
  } else if (signup && values.password.length < 10) {
    errors['mot-de-passe'] = 'Choisissez un mot de passe d’au moins 10 caractères.';
  } else if (signup && values.password.length > 72) {
    errors['mot-de-passe'] = 'Le mot de passe ne doit pas dépasser 72 caractères.';
  }
  return errors;
}

/** Connexion ou création de compte, selon la route (/connexion ou /inscription). */
@Component({
  selector: 'ca-auth-page',
  imports: [RouterLink],
  templateUrl: './auth-page.html',
  styleUrl: './auth-page.css',
})
export class AuthPage {
  /** Fourni par les données de la route. */
  readonly mode = input<'connexion' | 'inscription'>('connexion');

  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private readonly summary = viewChild<ElementRef<HTMLElement>>('summary');

  protected readonly signup = computed(() => this.mode() === 'inscription');
  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly showPassword = signal(false);
  protected readonly pending = signal(false);
  protected readonly fieldErrors = signal<FieldErrors>({});
  protected readonly serverError = signal('');
  protected readonly confirmationSent = signal(false);
  protected readonly errors = computed(() => [
    ...(Object.entries(this.fieldErrors()) as [Field, string][]).map(([field, text]) => ({
      field,
      text,
    })),
    ...(this.serverError() ? [{ field: null, text: this.serverError() }] : []),
  ]);
  /** Aide (à l'inscription) et message d'erreur éventuel, lus avec le champ mot de passe. */
  protected readonly passwordDescription = computed(
    () =>
      [
        this.signup() ? 'mot-de-passe-aide' : '',
        this.fieldErrors()['mot-de-passe'] ? 'mot-de-passe-erreur' : '',
      ]
        .filter(Boolean)
        .join(' ') || null,
  );

  protected async submit(event: Event): Promise<void> {
    event.preventDefault();
    if (this.pending()) return;
    const values = { name: this.name(), email: this.email(), password: this.password() };
    const errors = validateAuthForm(values, this.signup());
    this.fieldErrors.set(errors);
    this.serverError.set('');
    if (Object.keys(errors).length > 0) {
      this.focusSummary();
      return;
    }

    this.pending.set(true);
    const email = values.email.trim();
    const result = this.signup()
      ? await this.auth.signUp(email, values.password, values.name.trim())
      : await this.auth.signIn(email, values.password);
    this.pending.set(false);

    if (!result.ok) {
      this.serverError.set(result.message);
      this.focusSummary();
    } else if (result.needsConfirmation) {
      this.confirmationSent.set(true);
    } else {
      await this.router.navigateByUrl('/profil');
    }
  }

  /** Lien du résumé d'erreurs : place le focus sur le champ (lien « # » sans routeur). */
  protected focusField(event: Event, field: Field): void {
    event.preventDefault();
    this.document.getElementById(field)?.focus();
  }

  private focusSummary(): void {
    afterNextRender(() => this.summary()?.nativeElement.focus(), { injector: this.injector });
  }
}
