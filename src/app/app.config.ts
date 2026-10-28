import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import {
  ApplicationConfig,
  LOCALE_ID,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import {
  RedirectCommand,
  Router,
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withNavigationErrorHandler,
} from '@angular/router';
import { routes } from './app.routes';
import { Analytics } from './core/analytics/analytics';
import { PageTitleStrategy } from './core/page-title.strategy';

// Dates et nombres à la française : « 16 octobre », « 80 % ».
registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useValue: 'fr' },
    provideRouter(
      routes,
      withComponentInputBinding(),
      // anchorScrolling : un lien vers /parcours/x#projet ouvre la page à la bonne section.
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
      // Échec de chargement d'une page (réseau coupé…) : page d'erreur, en affichant l'adresse
      // demandée dans la barre du navigateur pour que « Recharger » réessaie la bonne page.
      withNavigationErrorHandler(
        (error) =>
          new RedirectCommand(inject(Router).parseUrl('/erreur'), { browserUrl: error.url }),
      ),
    ),
    { provide: TitleStrategy, useClass: PageTitleStrategy },
    // Mesure d'audience Matomo, sans cookies : inactive tant que son adresse n'est pas configurée.
    provideAppInitializer(() => inject(Analytics).start()),
    // Application installable et utilisable hors ligne (build de production seulement) : le
    // service worker précharge tous les fichiers du site, contenu des leçons compris. Les appels
    // à Supabase ne passent pas par lui : aucune donnée personnelle n'est mise en cache.
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
