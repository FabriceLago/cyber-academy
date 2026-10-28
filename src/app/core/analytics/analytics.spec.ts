import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { PrivacyPage } from '../../features/legal/legal-pages';
import { Analytics, MATOMO_CONFIG, MatomoConfig } from './analytics';

@Component({ template: '' })
class Empty {}

type WithQueue = Window & { _paq?: unknown[][] };
const STATS: MatomoConfig = { url: 'https://stats.exemple.test/', siteId: '1' };

function setup(config: MatomoConfig = STATS) {
  localStorage.clear();
  delete (window as WithQueue)._paq;
  document.head.querySelectorAll('script[src*="matomo"]').forEach((s) => s.remove());
  TestBed.configureTestingModule({
    providers: [
      provideRouter([
        { path: 'profil', component: Empty, title: 'Profil' },
        { path: '**', component: Empty, title: 'Autre page' },
      ]),
      { provide: MATOMO_CONFIG, useValue: config },
    ],
  });
  return { analytics: TestBed.inject(Analytics), router: TestBed.inject(Router) };
}
const queue = () => (window as WithQueue)._paq ?? [];
const pageViews = () => queue().filter(([command]) => command === 'trackPageView');
const scripts = () =>
  document.head.querySelectorAll('script[src="https://stats.exemple.test/matomo.js"]');

describe('Analytics', () => {
  afterEach(() => {
    delete (navigator as { doNotTrack?: string }).doNotTrack;
  });

  it('ne mesure rien tant que Matomo n’est pas configuré', () => {
    const { analytics } = setup({ url: '', siteId: '' });
    analytics.start();
    expect(analytics.configured).toBe(false);
    expect(queue()).toEqual([]);
    expect(document.head.querySelector('script[src*="matomo"]')).toBeNull();
  });

  it('configuré : sans cookies ni empreinte, chaque page sans paramètres ni fragment', async () => {
    const { analytics, router } = setup();
    analytics.start();
    expect(queue().slice(0, 4)).toEqual([
      ['disableCookies'],
      ['disableBrowserFeatureDetection'],
      ['setTrackerUrl', 'https://stats.exemple.test/matomo.php'],
      ['setSiteId', '1'],
    ]);
    expect(scripts()).toHaveLength(1);

    await router.navigateByUrl('/profil?code=secret#jeton');
    expect(queue()).toContainEqual(['setCustomUrl', `${location.origin}/profil`]);
    expect(queue()).toContainEqual(['trackPageView']);
    expect(JSON.stringify(queue())).not.toMatch(/secret|jeton/);
  });

  it('envoie le titre de la nouvelle page, pas celui de la précédente', async () => {
    const { analytics, router } = setup();
    analytics.start();
    await router.navigateByUrl('/lecons');
    await router.navigateByUrl('/profil');
    expect(queue().filter(([command]) => command === 'setDocumentTitle')).toEqual([
      ['setDocumentTitle', 'Autre page'],
      ['setDocumentTitle', 'Profil'],
    ]);
  });

  it('continue de compter quand matomo.js, chargé, remplace la file d’attente', async () => {
    const { analytics, router } = setup();
    analytics.start();
    const loaded: unknown[][] = [];
    (window as WithQueue)._paq = loaded;
    await router.navigateByUrl('/lecons');
    expect(loaded).toContainEqual(['trackPageView']);
  });

  it('ne charge le script et ne compte qu’une fois, même relancée', async () => {
    const { analytics, router } = setup();
    analytics.start();
    analytics.setOptOut(true);
    analytics.setOptOut(false);
    analytics.start();
    expect(scripts()).toHaveLength(1);
    await router.navigateByUrl('/lecons');
    expect(pageViews()).toHaveLength(1);
  });

  it('respecte l’opposition du visiteur, gardée dans ce navigateur', async () => {
    const { analytics, router } = setup();
    analytics.setOptOut(true);
    analytics.start();
    expect(queue()).toEqual([]);
    expect(localStorage.getItem('ca-analytics-opt-out')).toBe('1');

    analytics.setOptOut(false);
    await router.navigateByUrl('/lecons');
    expect(pageViews()).toHaveLength(1);

    analytics.setOptOut(true);
    await router.navigateByUrl('/quiz');
    expect(pageViews()).toHaveLength(1);
  });

  it('respecte « Ne pas me suivre » du navigateur', () => {
    Object.defineProperty(navigator, 'doNotTrack', { value: '1', configurable: true });
    const { analytics } = setup();
    analytics.start();
    expect(analytics.browserOptOut).toBe(true);
    expect(queue()).toEqual([]);
  });
});

describe('Politique de confidentialité et mesure d’audience', () => {
  afterEach(() => {
    delete (navigator as { doNotTrack?: string }).doNotTrack;
  });

  function render(config: MatomoConfig): HTMLElement {
    setup(config);
    const fixture = TestBed.createComponent(PrivacyPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('sans Matomo : annonce l’absence de mesure d’audience', () => {
    const page = render({ url: '', siteId: '' });
    expect(page.textContent).toContain('aucune mesure d’audience');
    expect(page.querySelector('#mesure-audience')).toBeNull();
  });

  it('avec Matomo : explique la mesure et permet de s’y opposer', () => {
    const page = render(STATS);
    expect(page.querySelector('#mesure-audience')?.textContent).toBe('Mesure d’audience');
    expect(page.textContent).toContain('aucun cookie');
    const box = page.querySelector<HTMLInputElement>('.opt-out input');
    box?.click();
    expect(TestBed.inject(Analytics).optedOut()).toBe(true);
    expect(localStorage.getItem('ca-analytics-opt-out')).toBe('1');
  });

  it('navigateur qui refuse le suivi : le dit au lieu de proposer la case', () => {
    Object.defineProperty(navigator, 'doNotTrack', { value: '1', configurable: true });
    const page = render(STATS);
    expect(page.querySelector('.opt-out input')).toBeNull();
    expect(page.textContent).toContain('vous n’êtes pas compté');
  });
});
