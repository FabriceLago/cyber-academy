import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import {
  ApplicationConfig,
  LOCALE_ID,
  inject,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
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
  ],
};
