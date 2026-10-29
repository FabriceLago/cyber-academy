import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../auth/auth.service';
import { AppSupabaseClient, SUPABASE } from '../supabase/supabase';
import { ReportingErrorHandler } from './reporting-error-handler';

function setup(userId: string | null, rpc = vi.fn().mockResolvedValue({ error: null })) {
  TestBed.configureTestingModule({
    providers: [
      ReportingErrorHandler,
      { provide: AuthService, useValue: { userId: signal(userId) } },
      { provide: SUPABASE, useValue: Promise.resolve({ rpc } as unknown as AppSupabaseClient) },
    ],
  });
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  return { handler: TestBed.inject(ReportingErrorHandler), rpc, consoleError };
}
const settle = () => new Promise((resolve) => setTimeout(resolve));

describe('ReportingErrorHandler', () => {
  afterEach(() => vi.restoreAllMocks());

  it('connecté : l’erreur s’affiche dans la console et part au serveur', async () => {
    const { handler, rpc, consoleError } = setup('u1');
    handler.handleError(new TypeError('x is undefined'));
    await settle();
    expect(consoleError).toHaveBeenCalled();
    expect(rpc).toHaveBeenCalledWith('report_client_error', {
      p_message: 'x is undefined',
      p_stack: expect.stringContaining('TypeError'),
      p_path: location.pathname,
      p_user_agent: navigator.userAgent,
    });
  });

  it('sans compte : rien ne part au serveur', async () => {
    const { handler, rpc, consoleError } = setup(null);
    handler.handleError(new Error('panne'));
    await settle();
    expect(consoleError).toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it('une même erreur une fois, ni les coupures réseau, et cinq au plus par page', async () => {
    const { handler, rpc } = setup('u1');
    handler.handleError(new Error('répétée'));
    handler.handleError(new Error('répétée'));
    handler.handleError(new TypeError('Failed to fetch'));
    for (let i = 1; i <= 6; i++) handler.handleError(new Error(`erreur ${i}`));
    await settle();
    expect(rpc).toHaveBeenCalledTimes(5);
    expect(rpc.mock.calls.map(([, args]) => args.p_message)).toEqual([
      'répétée',
      'erreur 1',
      'erreur 2',
      'erreur 3',
      'erreur 4',
    ]);
  });

  it('un échec de l’envoi ne provoque pas d’autre erreur', async () => {
    const { handler } = setup('u1', vi.fn().mockRejectedValue(new Error('hors ligne')));
    expect(() => handler.handleError(new Error('panne'))).not.toThrow();
    await settle();
  });
});
