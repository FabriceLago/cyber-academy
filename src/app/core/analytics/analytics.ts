import { DOCUMENT, Injectable, InjectionToken, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MatomoConfig {
  /** Adresse de Matomo, avec « / » final (https://stats.exemple.fr/) ; vide : aucune mesure. */
  readonly url: string;
  readonly siteId: string;
}

export const MATOMO_CONFIG = new InjectionToken<MatomoConfig>('MATOMO_CONFIG', {
  providedIn: 'root',
  factory: () => ({ url: environment.matomoUrl, siteId: environment.matomoSiteId }),
});

const OPT_OUT_KEY = 'ca-analytics-opt-out';

/** Tableau d'attente, puis objet de matomo.js une fois chargé : seule `push` compte. */
interface MatomoQueue {
  push(...commands: unknown[][]): unknown;
}

/**
 * Mesure d'audience avec Matomo, hébergé par l'éditeur et réglé pour l'exemption de consentement
 * de la CNIL : sans cookies, sans identifiant, seulement l'adresse de la page (sans paramètres ni
 * fragment : un code de connexion ne part jamais). Inactive tant que l'adresse n'est pas
 * configurée, si le visiteur s'y oppose ou si son navigateur demande de ne pas être suivi.
 */
@Injectable({ providedIn: 'root' })
export class Analytics {
  private readonly config = inject(MATOMO_CONFIG);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly window = this.document.defaultView;
  private started = false;

  readonly configured = this.config.url !== '' && this.config.siteId !== '';
  /** Le visiteur s'oppose à la mesure (choix gardé dans ce navigateur). */
  readonly optedOut = signal(this.readOptOut());
  /** « Ne pas me suivre » ou Global Privacy Control : le navigateur a déjà refusé. */
  readonly browserOptOut = this.doNotTrack();

  /** Lancée au démarrage de l'application (app.config.ts). */
  start(): void {
    if (!this.configured || this.started || this.optedOut() || this.browserOptOut) return;
    const win = this.window as (Window & { _paq?: MatomoQueue }) | null;
    if (!win) return;
    this.started = true;
    // Relu à chaque envoi : une fois chargé, matomo.js remplace le tableau par son propre objet.
    const send = (...commands: unknown[][]) => (win._paq ??= []).push(...commands);
    send(
      ['disableCookies'],
      // Ni résolution d'écran ni liste de fonctionnalités du navigateur : rien pour une empreinte.
      ['disableBrowserFeatureDetection'],
      ['setTrackerUrl', `${this.config.url}matomo.php`],
      ['setSiteId', this.config.siteId],
    );
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const path = event.urlAfterRedirects.split(/[?#]/)[0];
        // Le routeur change le titre juste après NavigationEnd : on attend qu'il l'ait fait.
        queueMicrotask(() => {
          if (this.optedOut()) return;
          send(
            ['setCustomUrl', `${win.location.origin}${path}`],
            ['setDocumentTitle', this.document.title],
            ['trackPageView'],
          );
        });
      });
    const script = this.document.createElement('script');
    script.async = true;
    script.src = `${this.config.url}matomo.js`;
    this.document.head.append(script);
  }

  setOptOut(refused: boolean): void {
    this.optedOut.set(refused);
    try {
      if (refused) this.window?.localStorage.setItem(OPT_OUT_KEY, '1');
      else this.window?.localStorage.removeItem(OPT_OUT_KEY);
    } catch {
      // Stockage indisponible : le choix vaut pour cette visite.
    }
    if (!refused) this.start();
  }

  private readOptOut(): boolean {
    try {
      return this.window?.localStorage.getItem(OPT_OUT_KEY) === '1';
    } catch {
      return false;
    }
  }

  private doNotTrack(): boolean {
    const nav = this.window?.navigator as
      (Navigator & { globalPrivacyControl?: boolean }) | undefined;
    return nav?.doNotTrack === '1' || nav?.globalPrivacyControl === true;
  }
}
