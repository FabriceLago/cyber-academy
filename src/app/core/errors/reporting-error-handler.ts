import { DOCUMENT, ErrorHandler, Injectable, Injector, inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { SUPABASE } from '../supabase/supabase';

/** Réseau coupé ou version du site remplacée : pas un défaut du code, rien à signaler. */
const NOT_A_BUG = /Failed to fetch|NetworkError|Loading chunk|dynamically imported module/i;
/** Au plus cinq erreurs différentes par chargement de page (le serveur limite aussi le débit). */
const MAX_REPORTS = 5;

/**
 * Gestionnaire d'erreurs de l'application : l'erreur s'affiche toujours dans la console, et celle
 * d'un apprenant connecté est envoyée au serveur (report_client_error) pour être corrigée. Sans
 * compte, rien ne part : le navigateur n'appelle aucune fonction sans session.
 */
@Injectable()
export class ReportingErrorHandler extends ErrorHandler {
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private readonly sent = new Set<string>();

  override handleError(error: unknown): void {
    super.handleError(error);
    void this.report(error);
  }

  private async report(error: unknown): Promise<void> {
    const message = error instanceof Error ? error.message : String(error);
    if (NOT_A_BUG.test(message) || this.sent.has(message) || this.sent.size >= MAX_REPORTS) return;
    try {
      // Services lus au moment de l'erreur : le gestionnaire est créé avant eux.
      if (!this.injector.get(AuthService).userId()) return;
      this.sent.add(message);
      const supabase = await this.injector.get(SUPABASE);
      await supabase.rpc('report_client_error', {
        p_message: message,
        p_stack: error instanceof Error ? (error.stack ?? '') : '',
        p_path: this.document.location.pathname,
        p_user_agent: this.document.defaultView?.navigator.userAgent ?? '',
      });
    } catch {
      // L'envoi d'une erreur ne doit jamais en provoquer une autre.
    }
  }
}
