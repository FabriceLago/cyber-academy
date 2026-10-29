import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PrivacyPage } from '../../features/legal/legal-pages';
import { Captcha, TURNSTILE_SITE_KEY } from './captcha';

@Component({ imports: [Captcha], template: '<ca-captcha />' })
class Host {
  readonly captcha = viewChild.required(Captcha);
}

type WithTurnstile = Window & { turnstile?: unknown };
/** Clé de test publique de Cloudflare (la vérification réussit toujours). */
const TEST_KEY = '1x00000000000000000000AA';

function render(siteKey: string) {
  TestBed.configureTestingModule({
    providers: [{ provide: TURNSTILE_SITE_KEY, useValue: siteKey }],
  });
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  return fixture;
}
const settle = () => new Promise((resolve) => setTimeout(resolve));

describe('Captcha', () => {
  afterEach(() => delete (window as WithTurnstile).turnstile);

  it('sans clé : rien ne s’affiche et aucun jeton n’est demandé', () => {
    const fixture = render('');
    const captcha = fixture.componentInstance.captcha();
    expect(captcha.configured).toBe(false);
    expect(captcha.take()).toBeUndefined();
    expect((fixture.nativeElement as HTMLElement).querySelector('ca-captcha div')).toBeNull();
  });

  it('avec clé : Turnstile en français, un jeton par demande, puis une nouvelle vérification', async () => {
    const api = { render: vi.fn().mockReturnValue('w1'), reset: vi.fn(), remove: vi.fn() };
    (window as WithTurnstile).turnstile = api;
    const fixture = render(TEST_KEY);
    await settle();
    expect(api.render).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ sitekey: TEST_KEY, language: 'fr' }),
    );

    const captcha = fixture.componentInstance.captcha();
    expect(captcha.take()).toBeNull(); // Vérification pas encore faite.
    const options = api.render.mock.calls[0][1] as Record<string, (token?: string) => void>;
    options['callback']('jeton');
    expect(captcha.take()).toBe('jeton');

    captcha.reset();
    expect(api.reset).toHaveBeenCalledWith('w1');
    expect(captcha.take()).toBeNull();

    options['callback']('jeton-2');
    options['expired-callback']();
    expect(captcha.take()).toBeNull();

    fixture.destroy();
    expect(api.remove).toHaveBeenCalledWith('w1');
  });

  it('la politique de confidentialité décrit le captcha seulement s’il est configuré', () => {
    for (const [siteKey, shown] of [
      ['', false],
      [TEST_KEY, true],
    ] as const) {
      TestBed.configureTestingModule({
        providers: [provideRouter([]), { provide: TURNSTILE_SITE_KEY, useValue: siteKey }],
      });
      const fixture = TestBed.createComponent(PrivacyPage);
      fixture.detectChanges();
      const page = fixture.nativeElement as HTMLElement;
      expect(page.querySelector('#anti-robot') !== null, siteKey || 'sans clé').toBe(shown);
      TestBed.resetTestingModule();
    }
  });
});
