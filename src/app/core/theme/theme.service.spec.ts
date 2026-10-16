import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  const root = document.documentElement;

  beforeEach(() => {
    localStorage.clear();
    delete root.dataset['theme'];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('suit le réglage de l’appareil par défaut', () => {
    const theme = TestBed.inject(ThemeService);
    TestBed.tick();
    expect(theme.preference()).toBe('system');
    expect(root.dataset['theme']).toBeUndefined();
  });

  it('applique et mémorise un choix explicite', () => {
    const theme = TestBed.inject(ThemeService);
    theme.preference.set('light');
    TestBed.tick();
    expect(root.dataset['theme']).toBe('light');
    expect(localStorage.getItem('ca-theme')).toBe('light');
  });

  it('restaure le choix mémorisé', () => {
    localStorage.setItem('ca-theme', 'dark');
    expect(TestBed.inject(ThemeService).preference()).toBe('dark');
  });

  it('ignore une valeur mémorisée invalide', () => {
    localStorage.setItem('ca-theme', '<script>alert(1)</script>');
    expect(TestBed.inject(ThemeService).preference()).toBe('system');
  });

  it('bascule vers le thème opposé à celui affiché', () => {
    const theme = TestBed.inject(ThemeService);
    theme.preference.set('dark');
    theme.toggle();
    expect(theme.preference()).toBe('light');
    theme.toggle();
    expect(theme.preference()).toBe('dark');
  });

  it('fonctionne quand le stockage du navigateur est bloqué', () => {
    const blocked = () => {
      throw new DOMException('Stockage bloqué', 'SecurityError');
    };
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked);

    const theme = TestBed.inject(ThemeService);
    theme.preference.set('light');
    TestBed.tick();
    expect(root.dataset['theme']).toBe('light');
  });
});
