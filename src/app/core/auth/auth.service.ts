import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import type { Session } from '@supabase/supabase-js';
import { AppSupabaseClient, SUPABASE } from '../supabase/supabase';

export interface Profile {
  readonly displayName: string;
  readonly role: 'apprenant' | 'admin';
}

export type AuthResult =
  | { readonly ok: true; readonly needsConfirmation: boolean }
  | { readonly ok: false; readonly message: string };

/** Compte de l'apprenant : facultatif, la plateforme reste utilisable sans. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly client = inject(SUPABASE);
  private readonly session = signal<Session | null>(null);

  /** Faux tant que la session gardée par le navigateur n'a pas été relue. */
  readonly ready = signal(false);
  readonly user = computed(() => this.session()?.user ?? null);
  /**
   * Identifiant seul : ne change que si l'utilisateur change. Chaque événement de session crée
   * un nouvel objet `user` ; réagir à `user` relancerait les chargements à chaque événement.
   */
  readonly userId = computed(() => this.session()?.user.id ?? null);
  readonly profile = signal<Profile | null>(null);

  constructor() {
    this.client.then(
      (supabase) =>
        // Pas d'appel à Supabase dans ce rappel (il bloquerait le client) : le profil est
        // chargé par l'effet ci-dessous, après coup.
        supabase.auth.onAuthStateChange((_event, session) => {
          this.session.set(session);
          this.ready.set(true);
        }),
      // Bibliothèque impossible à charger (hors ligne) : on continue sans compte.
      () => this.ready.set(true),
    );
    effect(() => {
      const userId = this.userId();
      untracked(() => void this.loadProfile(userId));
    });
  }

  async signUp(email: string, password: string, displayName: string): Promise<AuthResult> {
    return this.attempt(async (supabase) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      if (error) return { ok: false, message: authMessage(error) };
      // Si la confirmation par e-mail est exigée (en production), aucune session n'est ouverte.
      return { ok: true, needsConfirmation: data.session === null };
    });
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    return this.attempt(async (supabase) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error
        ? { ok: false, message: authMessage(error) }
        : { ok: true, needsConfirmation: false };
    });
  }

  /** Déconnecte ce navigateur seulement. */
  async signOut(): Promise<void> {
    const supabase = await this.client;
    await supabase.auth.signOut({ scope: 'local' });
  }

  private async attempt(action: (supabase: AppSupabaseClient) => Promise<AuthResult>) {
    try {
      return await action(await this.client);
    } catch {
      return {
        ok: false,
        message: authMessage({ name: 'AuthRetryableFetchError', status: 0 }),
      } as const;
    }
  }

  private async loadProfile(userId: string | null): Promise<void> {
    if (!userId) {
      this.profile.set(null);
      return;
    }
    const supabase = await this.client;
    const { data } = await supabase
      .from('profiles')
      .select('display_name, role')
      .eq('id', userId)
      .maybeSingle();
    // Une réponse arrivée après une déconnexion ne doit pas réafficher l'ancien profil.
    if (this.userId() !== userId) return;
    this.profile.set(data ? { displayName: data.display_name, role: data.role } : null);
  }
}

/** Messages compréhensibles pour les erreurs de Supabase Auth. */
export function authMessage(error: {
  readonly code?: string;
  readonly status?: number;
  readonly name?: string;
}): string {
  switch (error.code) {
    case 'invalid_credentials':
      return 'Adresse e-mail ou mot de passe incorrect.';
    case 'user_already_exists':
    case 'email_exists':
      return 'Un compte existe déjà avec cette adresse : connectez-vous plutôt.';
    case 'weak_password':
      return 'Mot de passe trop faible : choisissez au moins 10 caractères.';
    case 'over_request_rate_limit':
      return 'Trop de tentatives : patientez quelques minutes avant de réessayer.';
    case 'email_address_invalid':
      return 'Cette adresse e-mail n’est pas valide.';
    case 'email_not_confirmed':
      return 'Confirmez d’abord votre adresse grâce au message reçu par e-mail.';
    case 'signup_disabled':
      return 'Les inscriptions sont fermées pour le moment.';
  }
  if (error.name === 'AuthRetryableFetchError' || error.status === 0) {
    return 'Le service de comptes ne répond pas. Réessayez plus tard : votre progression reste enregistrée dans ce navigateur.';
  }
  return 'La demande a échoué. Réessayez plus tard.';
}
