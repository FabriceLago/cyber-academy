import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

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
        Rien ne quitte votre navigateur : votre progression et le thème choisi y sont gardés
        (stockage local), uniquement pour faire fonctionner la plateforme. Aucun cookie
        publicitaire, aucune mesure d’audience, aucun service tiers de suivi. L’avancement dans les
        cartes mémoire reste lui aussi dans le navigateur, même avec un compte.
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
          votre progression sur vos appareils.
        </li>
        <li>
          Signalements d’erreurs (message, contenu concerné, date) : pour corriger les leçons, les
          questions et les laboratoires. Ils ne sont lus que par l’équipe.
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
  `,
})
export class PrivacyPage {}
