import { EmailZone, LabEmail } from '../models/content.model';

/** Éléments analysables, dans l'ordre de lecture d'un e-mail. */
export const EMAIL_ZONES: readonly { readonly id: EmailZone; readonly label: string }[] = [
  { id: 'expediteur', label: 'L’expéditeur' },
  { id: 'objet', label: 'L’objet' },
  { id: 'demande', label: 'Ce que le message demande' },
  { id: 'lien', label: 'Le lien' },
  { id: 'piece-jointe', label: 'La pièce jointe' },
];

/** Nombre d'indices à relever dans un e-mail d'hameçonnage (ou tous, s'il en a moins). */
export const MIN_CLUES = 2;

export type Verdict = 'legitime' | 'hameconnage';

export interface EmailAnswer {
  readonly verdict: Verdict;
  readonly flagged: ReadonlySet<EmailZone>;
}

export interface EmailReview {
  readonly verdictCorrect: boolean;
  /** Indices relevés, manqués, et éléments sains signalés à tort. */
  readonly found: readonly EmailZone[];
  readonly missed: readonly EmailZone[];
  readonly falseAlarms: readonly EmailZone[];
  readonly passed: boolean;
}

/** Éléments présents dans l'e-mail, dans l'ordre de lecture. */
export function zonesOf(email: LabEmail): EmailZone[] {
  return EMAIL_ZONES.map((z) => z.id).filter((id) => email.zones[id] !== undefined);
}

/**
 * Un e-mail est réussi si le verdict est juste, si aucun élément sain n'est signalé à tort et,
 * pour un hameçonnage, si au moins `MIN_CLUES` indices sont relevés.
 */
export function reviewEmail(email: LabEmail, answer: EmailAnswer): EmailReview {
  const zones = zonesOf(email);
  const suspicious = zones.filter((id) => email.zones[id]?.suspicious);
  const found = suspicious.filter((id) => answer.flagged.has(id));
  const falseAlarms = zones.filter((id) => !email.zones[id]?.suspicious && answer.flagged.has(id));
  const verdictCorrect = (answer.verdict === 'hameconnage') === email.phishing;
  return {
    verdictCorrect,
    found,
    missed: suspicious.filter((id) => !answer.flagged.has(id)),
    falseAlarms,
    passed:
      verdictCorrect &&
      falseAlarms.length === 0 &&
      (!email.phishing || found.length >= Math.min(MIN_CLUES, suspicious.length)),
  };
}
