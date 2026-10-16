import { DOCUMENT, Injectable, computed, effect, inject, signal } from '@angular/core';

export type ThemePreference = 'system' | 'dark' | 'light';

const STORAGE_KEY = 'ca-theme';
const PREFERENCES: readonly ThemePreference[] = ['system', 'dark', 'light'];

/**
 * Thème de l'interface. « system » suit le réglage de l'appareil ; un choix explicite est
 * appliqué par l'attribut data-theme de <html> (voir styles.css) et mémorisé dans le navigateur.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly darkQuery = this.document.defaultView?.matchMedia?.(
    '(prefers-color-scheme: dark)',
  );
  private readonly systemPrefersDark = signal(this.darkQuery?.matches ?? true);

  readonly preference = signal<ThemePreference>(this.readStoredPreference());

  /** Thème réellement affiché. */
  readonly resolved = computed(() => {
    const preference = this.preference();
    if (preference !== 'system') return preference;
    return this.systemPrefersDark() ? 'dark' : 'light';
  });

  constructor() {
    this.darkQuery?.addEventListener('change', (event) =>
      this.systemPrefersDark.set(event.matches),
    );
    effect(() => {
      const preference = this.preference();
      const root = this.document.documentElement;
      if (preference === 'system') delete root.dataset['theme'];
      else root.dataset['theme'] = preference;
      this.store(preference);
    });
  }

  /** Bascule vers le thème opposé à celui affiché. */
  toggle(): void {
    this.preference.set(this.resolved() === 'dark' ? 'light' : 'dark');
  }

  private readStoredPreference(): ThemePreference {
    try {
      const stored = this.document.defaultView?.localStorage.getItem(STORAGE_KEY);
      return PREFERENCES.find((preference) => preference === stored) ?? 'system';
    } catch {
      return 'system'; // Stockage bloqué (navigation privée, réglages de confidentialité).
    }
  }

  private store(preference: ThemePreference): void {
    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      // Stockage indisponible : le choix vaut seulement pour la session en cours.
    }
  }
}
