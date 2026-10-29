import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Analytics } from '../../core/analytics/analytics';
import { TURNSTILE_SITE_KEY } from '../../shared/captcha/captcha';

// Les informations propres à l'éditeur sont marquées A_COMPLETER : `npm run build:prod` refuse de
// construire le site tant qu'il en reste une (une page légale incomplète ne doit pas partir).

/** Mentions légales (loi pour la confiance dans l'économie numérique, article 6). */
@Component({
  selector: 'ca-legal-notice-page',
  imports: [RouterLink],
  template: `
    <header class="page-header">
      <h1>Mentions légales</h1>
    </header>
    <section class="card prose" aria-labelledby="editeur">
      <h2 id="editeur">Éditeur du site</h2>
      <p>
        A_COMPLETER : nom et prénom, ou raison sociale, forme juridique et capital.<br />
        A_COMPLETER : adresse postale.<br />
        A_COMPLETER : numéro SIREN ou RCS (si vous en avez un).<br />
        Contact : A_COMPLETER : adresse e-mail.
      </p>
      <p>Directeur ou directrice de la publication : A_COMPLETER.</p>
    </section>
    <section class="card prose" aria-labelledby="hebergeurs">
      <h2 id="hebergeurs">Hébergement</h2>
      <p>
        Site : Hostinger International Ltd, A_COMPLETER : adresse et téléphone indiqués dans votre
        contrat Hostinger.
      </p>
      <p>
        Comptes et base de données : Supabase Inc., A_COMPLETER : adresse indiquée dans votre
        contrat Supabase. Les données sont stockées dans la région choisie pour le projet (Union
        européenne).
      </p>
    </section>
    <section class="card prose" aria-labelledby="contenus">
      <h2 id="contenus">Contenus</h2>
      <p>
        Les leçons, quiz et laboratoires sont pédagogiques. Les e-mails, journaux et noms de domaine
        des exercices sont fictifs. Aucun outil d’attaque n’est exécuté : les manipulations se font
        dans des simulations, à ne pas reproduire sur un système sans autorisation écrite de son
        propriétaire.
      </p>
      <p>
        Données personnelles : voir la
        <a routerLink="/confidentialite">politique de confidentialité</a>.
      </p>
    </section>
  `,
  styles: `
    section {
      margin-bottom: var(--space-5);
    }
  `,
})
export class LegalNoticePage {}

/** Politique de confidentialité (RGPD, articles 12 à 14). */
@Component({
  selector: 'ca-privacy-page',
  imports: [RouterLink],
  template: `
    <header class="page-header">
      <h1>Politique de confidentialité</h1>
      <p>Ce que Cyber Academy enregistre, pourquoi, et comment exercer vos droits.</p>
    </header>
    <section class="card prose" aria-labelledby="responsable">
      <h2 id="responsable">Responsable du traitement</h2>
      <p>
        L’éditeur indiqué dans les <a routerLink="/mentions-legales">mentions légales</a>. Contact
        pour toute question sur vos données : A_COMPLETER : adresse e-mail.
      </p>
    </section>
    <section class="card prose" aria-labelledby="sans-compte">
      <h2 id="sans-compte">Sans compte</h2>
      <p>
        Votre progression et le thème choisi sont gardés dans votre navigateur (stockage local),
        uniquement pour faire fonctionner la plateforme. Aucun cookie publicitaire, aucun service
        tiers de suivi{{
          analytics.configured
            ? ' ; une mesure d’audience anonyme, sans cookies (voir plus bas)'
            : ', aucune mesure d’audience'
        }}. L’avancement dans les cartes mémoire reste lui aussi dans le navigateur, même avec un
        compte.
      </p>
    </section>
    <section class="card prose" aria-labelledby="avec-compte">
      <h2 id="avec-compte">Avec un compte</h2>
      <ul>
        <li>
          Adresse e-mail et mot de passe (gardé sous forme d’empreinte, jamais en clair) : pour vous
          connecter.
        </li>
        <li>Prénom ou pseudonyme : pour l’affichage dans l’application.</li>
        <li>
          Tentatives de quiz et de laboratoire, objectif hebdomadaire : pour calculer et retrouver
          votre progression sur vos appareils. Elles servent aussi, sous forme de totaux anonymes
          par leçon, à repérer les leçons où les apprenants s’arrêtent, pour les améliorer.
        </li>
        <li>
          Signalements d’erreurs (message, contenu concerné, date) : pour corriger les leçons, les
          questions et les laboratoires. Ils ne sont lus que par l’équipe.
        </li>
        <li>
          Groupes (associations, écoles), si vous en rejoignez un avec son code : son responsable
          voit votre prénom ou pseudonyme, la date à laquelle vous l’avez rejoint, le nombre de
          leçons validées et de laboratoires réussis, et la date de votre dernière activité, jamais
          votre adresse e-mail ni vos réponses. Base légale : votre consentement, donné en
          rejoignant le groupe (réservé aux 15 ans et plus) ; vous le retirez en quittant le groupe
          depuis la page <a routerLink="/groupes">Groupes</a>. Pour un groupe que vous animez : son
          nom et son code.
        </li>
        <li>
          Erreurs techniques rencontrées sur le site (message technique, page sans ses paramètres,
          navigateur) : pour corriger le site. Elles ne sont lues que par l’équipe et sont effacées
          au bout de 90 jours.
        </li>
      </ul>
      <p>
        Base légale : l’exécution du service que vous demandez en créant un compte (RGPD, article 6,
        paragraphe 1, b). Ces données ne sont ni vendues ni utilisées pour de la publicité.
      </p>
      <p>
        Elles sont traitées par Supabase (comptes et base de données, région Union européenne) et
        Hostinger (hébergement du site, qui garde des journaux techniques de connexion). Elles sont
        conservées jusqu’à la suppression de votre compte, puis disparaissent des sauvegardes au
        bout de A_COMPLETER : durée de conservation des sauvegardes.
      </p>
      <p>
        Abonnement : le paiement est traité par Stripe (Stripe Payments Europe), qui reçoit votre
        adresse e-mail et vos données de paiement. Cyber Academy ne voit ni ne garde votre numéro de
        carte : seulement l’état de l’abonnement (actif, date de fin). Les factures sont conservées
        dix ans, comme l’exige la loi pour les pièces comptables.
      </p>
    </section>
    @if (captcha) {
      <section class="card prose" aria-labelledby="anti-robot">
        <h2 id="anti-robot">Protection contre les robots</h2>
        <p>
          Les formulaires de connexion, d’inscription et de mot de passe oublié vérifient qu’ils
          sont remplis par une personne, avec Cloudflare Turnstile (Cloudflare, Inc.). Cloudflare
          reçoit pour cela votre adresse IP et des informations techniques sur votre navigateur,
          sans cookie de suivi ni publicité ; le transfert vers les États-Unis est encadré par le
          cadre de protection des données UE–États-Unis. Base légale : l’intérêt légitime à protéger
          les comptes contre les créations et connexions automatisées (RGPD, article 6, paragraphe
          1, f).
        </p>
      </section>
    }
    @if (analytics.configured) {
      <section class="card prose" aria-labelledby="mesure-audience">
        <h2 id="mesure-audience">Mesure d’audience</h2>
        <p>
          Pour savoir quelles pages sont consultées et où les visiteurs s’arrêtent, le site utilise
          Matomo, installé sur notre propre hébergement : aucune donnée ne part chez un tiers. Le
          réglage suit les conditions de la CNIL pour une mesure sans consentement : aucun cookie,
          aucun identifiant, adresse IP tronquée, seulement des statistiques agrégées sur ce site,
          conservées au plus 25 mois. Les adresses envoyées ne contiennent ni paramètres ni codes de
          connexion. Un navigateur qui demande de ne pas être suivi n’est pas compté.
        </p>
        @if (analytics.browserOptOut) {
          <p class="opt-out">
            Votre navigateur demande de ne pas être suivi : vous n’êtes pas compté.
          </p>
        } @else {
          <label class="opt-out">
            <input
              #refuse
              type="checkbox"
              [checked]="analytics.optedOut()"
              (change)="analytics.setOptOut(refuse.checked)"
            />
            Ne pas être compté dans les statistiques de visite (choix gardé dans ce navigateur)
          </label>
        }
      </section>
    }
    <section class="card prose" aria-labelledby="droits">
      <h2 id="droits">Vos droits</h2>
      <ul>
        <li>
          Effacement : depuis le <a routerLink="/profil">profil</a>, bouton « Supprimer mon compte
          ».
        </li>
        <li>
          Portabilité : depuis le profil, « Télécharger une sauvegarde » de votre progression.
        </li>
        <li>
          Accès, rectification, limitation, opposition : écrivez à l’adresse de contact ci-dessus.
        </li>
      </ul>
      <p>
        Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à
        la CNIL (cnil.fr).
      </p>
    </section>
  `,
  styles: `
    section {
      margin-bottom: var(--space-5);
    }

    .opt-out {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      min-height: var(--target-min);
      font-weight: 600;
    }
  `,
})
export class PrivacyPage {
  protected readonly analytics = inject(Analytics);
  /** Captcha configuré (clé Turnstile au build) : la section qui le décrit s'affiche. */
  protected readonly captcha = inject(TURNSTILE_SITE_KEY) !== '';
}
