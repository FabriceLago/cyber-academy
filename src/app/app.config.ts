import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
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

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
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
