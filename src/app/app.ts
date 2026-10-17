import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter, map, skip } from 'rxjs';
import { AuthService } from './core/auth/auth.service';
import { AccountProgress } from './core/progress/account-progress';
import { ThemeService } from './core/theme/theme.service';
import { Icon, IconName } from './shared/icon/icon';

interface NavItem {
  readonly path: string;
  readonly label: string;
  readonly icon: IconName;
}

/** Les 8 sections de la navigation principale ; chaque chemin correspond à une route de app.routes.ts. */
export const NAV_ITEMS: readonly NavItem[] = [
  { path: '/', label: 'Tableau de bord', icon: 'dashboard' },
  { path: '/parcours', label: 'Parcours d’apprentissage', icon: 'route' },
  { path: '/lecons', label: 'Leçons', icon: 'book' },
  { path: '/laboratoires', label: 'Laboratoires', icon: 'flask' },
  { path: '/quiz', label: 'Quiz et examens', icon: 'quiz' },
  { path: '/projets', label: 'Projets pratiques', icon: 'folder' },
  { path: '/competences', label: 'Compétences', icon: 'award' },
  { path: '/profil', label: 'Profil et paramètres', icon: 'user' },
];

@Component({
  selector: 'ca-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: { '(document:keydown.escape)': 'closeMenu()' },
})
export class App {
  protected readonly theme = inject(ThemeService);
  protected readonly auth = inject(AuthService);
  /** Créé dès le démarrage : charge la progression du compte à l'ouverture d'une session. */
  protected readonly accountProgress = inject(AccountProgress);
  protected readonly navItems = NAV_ITEMS;
  protected readonly menuOpen = signal(false);
  protected readonly themeToggleLabel = computed(() =>
    this.theme.resolved() === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre',
  );

  private readonly router = inject(Router);
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');
  private readonly menuButton = viewChild.required<ElementRef<HTMLButtonElement>>('menuButton');

  /** Vrai pendant le chargement d'une page : affiche la barre de progression. */
  protected readonly navigating = toSignal(
    this.router.events.pipe(
      filter(
        (event) =>
          event instanceof NavigationStart ||
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError,
      ),
      map((event) => event instanceof NavigationStart),
    ),
    { initialValue: false },
  );

  constructor() {
    // Après chaque changement de page (sauf le premier affichage) : refermer le menu mobile et
    // placer le focus sur le contenu, pour que clavier et lecteurs d'écran repartent du début.
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        skip(1),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.menuOpen.set(false);
        this.main().nativeElement.focus({ preventScroll: true });
      });
  }

  protected skipToContent(event: Event): void {
    event.preventDefault(); // Un lien #contenu rechargerait la page à cause de <base href="/">.
    this.main().nativeElement.focus();
  }

  protected closeMenu(): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    this.menuButton().nativeElement.focus();
  }

  /** Le menu mobile recouvre le contenu : il se ferme quand le focus clavier en sort (WCAG 2.4.11). */
  protected closeMenuIfFocusLeaves(event: FocusEvent): void {
    const next = event.relatedTarget;
    const nav = event.currentTarget as HTMLElement;
    if (next instanceof Node && !nav.contains(next) && next !== this.menuButton().nativeElement) {
      this.menuOpen.set(false);
    }
  }
}
