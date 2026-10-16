import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App, NAV_ITEMS } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  async function render() {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    return { fixture, root: fixture.nativeElement as HTMLElement };
  }

  it('affiche les 8 sections de la navigation principale, dans l’ordre', async () => {
    const { root } = await render();
    const links = root.querySelectorAll('nav[aria-label="Navigation principale"] a');
    expect([...links].map((link) => link.textContent?.trim())).toEqual(
      NAV_ITEMS.map((item) => item.label),
    );
  });

  it('ouvre le menu mobile puis le referme avec Échap en mettant à jour aria-expanded', async () => {
    const { fixture, root } = await render();
    const button = root.querySelector<HTMLButtonElement>('[aria-controls="navigation-principale"]');
    expect(button?.getAttribute('aria-expanded')).toBe('false');

    button?.click();
    await fixture.whenStable();
    expect(button?.getAttribute('aria-expanded')).toBe('true');
    expect(root.querySelector('#navigation-principale')?.classList).toContain('open');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(button?.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(button);
  });

  it('propose un lien d’évitement vers le contenu principal', async () => {
    const { root } = await render();
    const skipLink = root.querySelector('a.skip-link');
    expect(skipLink?.textContent?.trim()).toBe('Aller au contenu principal');
    expect(root.querySelector('main#contenu')).not.toBeNull();
  });
});
