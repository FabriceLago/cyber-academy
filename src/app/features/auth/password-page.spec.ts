import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { PasswordPage } from './password-page';

function render(mode: 'demande' | 'nouveau', user: object | null = null) {
  const auth = {
    ready: signal(true),
    user: signal(user),
    requestPasswordReset: vi.fn().mockResolvedValue({ ok: true, needsConfirmation: false }),
    updatePassword: vi.fn().mockResolvedValue({ ok: true, needsConfirmation: false }),
  };
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
  });
  const fixture = TestBed.createComponent(PasswordPage);
  fixture.componentRef.setInput('mode', mode);
  fixture.detectChanges();
  const element = fixture.nativeElement as HTMLElement;
  const submit = async (value: string) => {
    const input = element.querySelector('input:not([type=checkbox])') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    (element.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    fixture.detectChanges();
  };
  return { auth, element, submit };
}

describe('PasswordPage', () => {
  it('demande un lien, après avoir vérifié l’adresse', async () => {
    const { auth, element, submit } = render('demande');
    await submit('pas-une-adresse');
    expect(element.querySelector('[role=alert]')?.textContent).toContain('adresse e-mail valide');
    expect(auth.requestPasswordReset).not.toHaveBeenCalled();

    await submit('  lea@exemple.test ');
    expect(auth.requestPasswordReset).toHaveBeenCalledWith('lea@exemple.test');
    expect(element.textContent).toContain('Si un compte existe pour');
  });

  it('sans la session du lien, explique qu’il faut en redemander un', () => {
    const { element } = render('nouveau');
    expect(element.textContent).toContain('Lien expiré ou déjà utilisé');
    expect(element.querySelector('form')).toBeNull();
  });

  it('enregistre un nouveau mot de passe d’au moins 10 caractères', async () => {
    const { auth, element, submit } = render('nouveau', { id: 'u1' });
    await submit('court');
    expect(element.querySelector('[role=alert]')?.textContent).toContain('au moins 10 caractères');
    expect(auth.updatePassword).not.toHaveBeenCalled();

    await submit('une phrase de passe solide');
    expect(auth.updatePassword).toHaveBeenCalledWith('une phrase de passe solide');
    expect(element.textContent).toContain('Mot de passe modifié');
  });
});
