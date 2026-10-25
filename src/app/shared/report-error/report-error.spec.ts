import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { AppSupabaseClient, SUPABASE } from '../../core/supabase/supabase';
import { ReportError, reportMessage } from './report-error';

function render(userId: string | null, rpcResult: object = { error: null }) {
  const rpc = vi.fn().mockResolvedValue(rpcResult);
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: AuthService, useValue: { userId: signal(userId) } },
      { provide: SUPABASE, useValue: Promise.resolve({ rpc } as unknown as AppSupabaseClient) },
    ],
  });
  const fixture = TestBed.createComponent(ReportError);
  fixture.componentRef.setInput('about', 'sur la question 2');
  fixture.componentRef.setInput('lessonId', 'ordinateur-et-fichiers');
  fixture.componentRef.setInput('questionId', 'q2');
  fixture.detectChanges();
  const element = fixture.nativeElement as HTMLElement;
  const click = async (label: string) => {
    const button = [...element.querySelectorAll('button')].find((b) =>
      b.textContent?.includes(label),
    );
    button?.click();
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const type = (text: string) => {
    (element.querySelector('textarea') as HTMLTextAreaElement).value = text;
  };
  return { rpc, element, click, type };
}

describe('ReportError', () => {
  it('traduit les erreurs du serveur pour l’apprenant', () => {
    expect(reportMessage({ code: 'CA429' })).toContain('Trop de signalements');
    expect(reportMessage({ code: '28000' })).toContain('session a expiré');
    expect(reportMessage({})).toContain('vérifiez votre connexion');
  });

  it('sans compte, invite à se connecter sans formulaire', async () => {
    const { element, click } = render(null);
    await click('Signaler une erreur');
    expect(element.textContent).toContain('Les signalements demandent un compte');
    expect(element.querySelector('textarea')).toBeNull();
  });

  it('refuse un message trop court, puis envoie la cible et le message nettoyé', async () => {
    const { rpc, element, click, type } = render('u1');
    await click('Signaler une erreur');
    type('  court  ');
    await click('Envoyer le signalement');
    expect(element.querySelector('[role=alert]')?.textContent).toContain('10 caractères');
    expect(rpc).not.toHaveBeenCalled();

    type('  La réponse B est aussi juste.  ');
    await click('Envoyer le signalement');
    expect(rpc).toHaveBeenCalledWith('report_content', {
      p_message: 'La réponse B est aussi juste.',
      p_lesson_id: 'ordinateur-et-fichiers',
      p_question_id: 'q2',
      p_lab_id: undefined,
    });
    expect(element.querySelector('[role=status]')?.textContent).toContain('Merci');
  });

  it('garde le formulaire ouvert et explique l’échec', async () => {
    const { element, click, type } = render('u1', { error: { code: 'CA429' } });
    await click('Signaler une erreur');
    type('Une explication confuse.');
    await click('Envoyer le signalement');
    expect(element.querySelector('[role=alert]')?.textContent).toContain('Trop de signalements');
    expect(element.querySelector('textarea')).not.toBeNull();
  });
});
