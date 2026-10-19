import { TestBed } from '@angular/core/testing';
import { AppSupabaseClient, SUPABASE } from '../supabase/supabase';
import { AuthService, authMessage } from './auth.service';

/** Faux client Supabase : on décide de ses réponses et on déclenche les changements de session. */
function fakeSupabase() {
  let notify: (event: string, session: unknown) => void = () => undefined;
  const query = {
    select: () => query,
    eq: () => query,
    maybeSingle: vi.fn().mockResolvedValue({ data: { display_name: 'Léa', role: 'apprenant' } }),
  };
  const client = {
    auth: {
      onAuthStateChange: vi.fn((callback: typeof notify) => {
        notify = callback;
        return { data: { subscription: { unsubscribe: () => undefined } } };
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      resend: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
    },
    from: vi.fn(() => query),
    rpc: vi.fn(),
  };
  return { client, emit: (session: unknown) => notify('SIGNED_IN', session) };
}

/** Laisse passer les promesses et le setTimeout du chargement du profil. */
const flush = () => new Promise((resolve) => setTimeout(resolve));

function setup() {
  const fake = fakeSupabase();
  TestBed.configureTestingModule({
    providers: [
      { provide: SUPABASE, useValue: Promise.resolve(fake.client as unknown as AppSupabaseClient) },
    ],
  });
  return { ...fake, auth: TestBed.inject(AuthService) };
}

describe('AuthService : mot de passe, confirmation, suppression', () => {
  it('répond pareil qu’une adresse ait un compte ou non, sauf réseau ou limite de débit', async () => {
    const { auth, client } = setup();
    client.auth.resetPasswordForEmail.mockResolvedValue({
      error: { code: 'user_not_found', status: 400 },
    });
    expect(await auth.requestPasswordReset('x@exemple.test')).toEqual({
      ok: true,
      needsConfirmation: false,
    });
    client.auth.resend.mockResolvedValue({ error: { code: 'email_exists', status: 400 } });
    expect((await auth.resendConfirmation('x@exemple.test')).ok).toBe(true);

    client.auth.resetPasswordForEmail.mockResolvedValue({
      error: { code: 'over_email_send_rate_limit', status: 429 },
    });
    expect(await auth.requestPasswordReset('x@exemple.test')).toEqual({
      ok: false,
      message: 'Trop de tentatives : patientez quelques minutes avant de réessayer.',
    });
    expect(client.auth.resetPasswordForEmail).toHaveBeenCalledWith('x@exemple.test', {
      redirectTo: expect.stringMatching(/\/nouveau-mot-de-passe$/),
    });
  });

  it('signale une adresse non confirmée, pour proposer de renvoyer le message', async () => {
    const { auth, client } = setup();
    client.auth.signInWithPassword.mockResolvedValue({
      error: { code: 'email_not_confirmed', status: 400 },
    });
    expect(await auth.signIn('x@exemple.test', 'phrase de passe')).toMatchObject({
      ok: false,
      unconfirmed: true,
    });
  });

  it('explique un nouveau mot de passe refusé', async () => {
    const { auth, client } = setup();
    client.auth.updateUser.mockResolvedValue({ error: { code: 'same_password', status: 422 } });
    expect(await auth.updatePassword('la même phrase')).toEqual({
      ok: false,
      message: 'Choisissez un mot de passe différent de l’actuel.',
    });
  });

  it('ne ferme la session qu’une fois le compte supprimé par le serveur', async () => {
    const { auth, client } = setup();
    client.rpc.mockResolvedValue({ error: { code: '42501' } });
    expect((await auth.deleteAccount()).ok).toBe(false);
    expect(client.auth.signOut).not.toHaveBeenCalled();

    client.rpc.mockResolvedValue({ error: null });
    expect((await auth.deleteAccount()).ok).toBe(true);
    expect(client.rpc).toHaveBeenCalledWith('delete_my_account');
    expect(client.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
  });
});

describe('AuthService', () => {
  it('relit la session puis charge le profil', async () => {
    const { auth, emit } = setup();
    await flush();
    expect(auth.ready()).toBe(false);

    emit({ user: { id: 'u1', email: 'lea@exemple.test' } });
    expect(auth.ready()).toBe(true);
    expect(auth.user()?.id).toBe('u1');
    TestBed.tick();
    await flush();
    expect(auth.profile()).toEqual({ displayName: 'Léa', role: 'apprenant' });

    emit(null);
    TestBed.tick();
    await flush();
    expect(auth.user()).toBeNull();
    expect(auth.profile()).toBeNull();
  });

  it('traduit l’échec de connexion en message clair', async () => {
    const { auth, client } = setup();
    client.auth.signInWithPassword.mockResolvedValue({
      error: { code: 'invalid_credentials', status: 400, name: 'AuthApiError' },
    });
    expect(await auth.signIn('lea@exemple.test', 'mauvais')).toEqual({
      ok: false,
      message: 'Adresse e-mail ou mot de passe incorrect.',
    });
  });

  it('crée le compte avec le nom choisi et signale une confirmation attendue', async () => {
    const { auth, client } = setup();
    client.auth.signUp.mockResolvedValue({ data: { session: null, user: {} }, error: null });
    expect(await auth.signUp('lea@exemple.test', 'une phrase longue', 'Léa')).toEqual({
      ok: true,
      needsConfirmation: true,
    });
    expect(client.auth.signUp).toHaveBeenCalledWith({
      email: 'lea@exemple.test',
      password: 'une phrase longue',
      options: {
        data: { display_name: 'Léa' },
        emailRedirectTo: `${document.location.origin}/profil`,
      },
    });
  });

  it('une adresse déjà inscrite reçoit la même réponse qu’une nouvelle (pas d’énumération)', async () => {
    const { auth, client } = setup();
    client.auth.signUp.mockResolvedValue({
      data: { session: null, user: null },
      error: { code: 'user_already_exists', status: 422, message: 'User already registered' },
    });
    expect(await auth.signUp('lea@exemple.test', 'une phrase longue', 'Léa')).toEqual({
      ok: true,
      needsConfirmation: true,
    });
  });

  it('reste utilisable si la bibliothèque ne peut pas être chargée', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: SUPABASE, useValue: Promise.reject(new Error('hors ligne')) }],
    });
    const auth = TestBed.inject(AuthService);
    await flush();
    expect(auth.ready()).toBe(true);
    const result = await auth.signIn('lea@exemple.test', 'une phrase longue');
    expect(result.ok).toBe(false);
  });
});

describe('authMessage', () => {
  it.each([
    [{ code: 'weak_password' }, 'Mot de passe trop faible : choisissez au moins 10 caractères.'],
    [
      { code: 'over_request_rate_limit' },
      'Trop de tentatives : patientez quelques minutes avant de réessayer.',
    ],
    [
      { name: 'AuthRetryableFetchError', status: 0 },
      'Le service de comptes ne répond pas. Réessayez plus tard : votre progression reste enregistrée dans ce navigateur.',
    ],
    [{ code: 'inconnu', status: 500 }, 'La demande a échoué. Réessayez plus tard.'],
  ])('%o → message en français', (error, message) => {
    expect(authMessage(error)).toBe(message);
  });
});
