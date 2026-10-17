import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../auth/auth.service';
import { AppSupabaseClient, SUPABASE } from '../supabase/supabase';
import { AccountProgress, RecordError, recordMessage, toAnswerPayload } from './account-progress';
import { ProgressStore } from './progress.store';

/** Faux client : chaque table renvoie ses lignes ; la fonction d'enregistrement est espionnée. */
function fakeSupabase() {
  const rows: Record<string, unknown> = {
    quiz_attempts: [
      {
        lesson_id: 'ordinateur-et-fichiers',
        submitted_at: '2026-10-16T10:00:00.123456+00:00',
        question_ids: ['q1', 'q2'],
        correct_question_ids: ['q1'],
      },
    ],
    lab_attempts: [],
    profiles: { weekly_goal: 3 },
  };
  const from = vi.fn((table: string) => {
    const result = Promise.resolve({ data: rows[table], error: null });
    const query = {
      select: () => query,
      order: () => result,
      eq: () => query,
      maybeSingle: () => result,
    };
    return query;
  });
  return { from, rpc: vi.fn() };
}

const flush = () => new Promise((resolve) => setTimeout(resolve));

function setup({ storedSession = false, authReady = true } = {}) {
  localStorage.clear();
  if (storedSession) localStorage.setItem('sb-127-auth-token', '{}');
  const client = fakeSupabase();
  const user = signal<{ id: string } | null>(null);
  const ready = signal(authReady);
  TestBed.configureTestingModule({
    providers: [
      { provide: SUPABASE, useValue: Promise.resolve(client as unknown as AppSupabaseClient) },
      {
        provide: AuthService,
        useValue: { user, ready, userId: computed(() => user()?.id ?? null) },
      },
    ],
  });
  const account = TestBed.inject(AccountProgress);
  return { client, user, ready, account, store: TestBed.inject(ProgressStore) };
}

describe('AccountProgress', () => {
  it('sans session gardée, les pages s’affichent tout de suite', () => {
    expect(setup().account.settled()).toBe(true);
  });

  it('avec une session gardée, les pages attendent la progression du compte', async () => {
    const { account, user, ready, store } = setup({ storedSession: true, authReady: false });
    TestBed.tick();
    expect(account.settled()).toBe(false);

    user.set({ id: 'u1' });
    ready.set(true);
    TestBed.tick();
    await flush();
    expect(account.settled()).toBe(true);
    expect(store.state().weeklyGoal).toBe(3); // celle du compte, jamais celle du navigateur
  });

  it('affiche la progression du compte à l’ouverture d’une session, puis celle du navigateur', async () => {
    const { user, store, account } = setup();
    TestBed.tick();
    expect(store.fromAccount()).toBe(false);

    user.set({ id: 'u1' });
    TestBed.tick();
    await flush();
    expect(account.status()).toBe('ready');
    expect(store.state()).toEqual({
      schemaVersion: 1,
      quizAttempts: [
        {
          lessonId: 'ordinateur-et-fichiers',
          submittedAt: '2026-10-16T10:00:00.123Z',
          questionIds: ['q1', 'q2'],
          correctQuestionIds: ['q1'],
        },
      ],
      labAttempts: [],
      weeklyGoal: 3,
    });

    user.set(null);
    TestBed.tick();
    await flush();
    expect(store.fromAccount()).toBe(false);
  });

  it('enregistre un quiz par le serveur et garde sa correction', async () => {
    const { user, client, store, account } = setup();
    user.set({ id: 'u1' });
    TestBed.tick();
    await flush();
    client.rpc.mockResolvedValue({
      data: {
        lesson_id: 'ordinateur-et-fichiers',
        submitted_at: '2026-10-17T09:00:00+00:00',
        question_ids: ['q3'],
        correct_question_ids: [],
      },
      error: null,
    });
    const payload = [toAnswerPayload('q3', { kind: 'choice', selected: new Set(['b']) })];
    const attempt = await account.recordQuizAttempt('ordinateur-et-fichiers', payload);

    expect(client.rpc).toHaveBeenCalledWith('record_quiz_attempt', {
      p_lesson_id: 'ordinateur-et-fichiers',
      p_answers: [{ question_id: 'q3', kind: 'choice', selected: ['b'] }],
    });
    expect(attempt.correctQuestionIds).toEqual([]);
    expect(store.state().quizAttempts.at(-1)).toEqual(attempt);
  });

  it('signale un refus du serveur par un message clair', async () => {
    const { user, client, account } = setup();
    user.set({ id: 'u1' });
    TestBed.tick();
    await flush();
    client.rpc.mockResolvedValue({ data: null, error: { code: 'CA429' } });
    await expect(account.recordLabAttempt('lab-terminal', true, 0)).rejects.toEqual(
      new RecordError('Trop de tentatives en une heure : réessayez un peu plus tard.'),
    );
  });
});

describe('format des réponses envoyées', () => {
  it('convertit les trois formes de réponse', () => {
    expect(toAnswerPayload('q1', { kind: 'matching', matches: new Map([['a', 'b']]) })).toEqual({
      question_id: 'q1',
      kind: 'matching',
      matches: { a: 'b' },
    });
    expect(toAnswerPayload('q2', { kind: 'ordering', order: ['c', 'a'] })).toEqual({
      question_id: 'q2',
      kind: 'ordering',
      order: ['c', 'a'],
    });
  });

  it('traduit les codes d’erreur', () => {
    expect(recordMessage({ code: '28000' })).toBe(
      'Votre session a expiré : reconnectez-vous, puis réessayez.',
    );
    expect(recordMessage({})).toBe(
      'L’enregistrement a échoué : vérifiez votre connexion, puis réessayez.',
    );
  });
});
