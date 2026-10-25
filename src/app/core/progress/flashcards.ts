import { DOCUMENT, Injectable, inject, signal } from '@angular/core';

/** Jours avant le retour d'une carte, selon sa boîte (1 à 5) : système de Leitner. */
export const INTERVAL_DAYS = [1, 3, 7, 14, 30] as const;
/** Nouvelles cartes proposées au plus par séance. */
export const NEW_PER_SESSION = 10;

export interface CardProgress {
  /** Boîte de Leitner : 1 (revient le lendemain) à 5 (revient dans 30 jours). */
  readonly box: number;
  /** Date ISO 8601 à partir de laquelle la carte revient en séance. */
  readonly due: string;
}

/** Avancement de chaque carte, par terme normalisé (voir normalize dans glossary-page.ts). */
export type Flashcards = Readonly<Record<string, CardProgress>>;

const STORAGE_KEY = 'ca-flashcards';
const DAY_MS = 24 * 60 * 60 * 1000;

/** Carte connue : boîte suivante ; carte oubliée : retour en boîte 1. */
export function nextReview(
  card: CardProgress | undefined,
  known: boolean,
  now: Date,
): CardProgress {
  const box = known ? Math.min((card?.box ?? 0) + 1, INTERVAL_DAYS.length) : 1;
  return { box, due: new Date(now.getTime() + INTERVAL_DAYS[box - 1] * DAY_MS).toISOString() };
}

/**
 * Cartes d'une séance : celles arrivées à échéance, la plus en retard d'abord, puis au plus
 * `newLimit` cartes jamais vues, dans l'ordre reçu.
 */
export function sessionCards<T>(
  items: readonly T[],
  keyOf: (item: T) => string,
  cards: Flashcards,
  now: Date,
  newLimit = NEW_PER_SESSION,
): T[] {
  const seen = (item: T) => Object.hasOwn(cards, keyOf(item));
  const due = items
    .filter((item) => seen(item) && Date.parse(cards[keyOf(item)].due) <= now.getTime())
    .sort((a, b) => cards[keyOf(a)].due.localeCompare(cards[keyOf(b)].due));
  return [...due, ...items.filter((item) => !seen(item)).slice(0, newLimit)];
}

/** Relit l'avancement stocké ; l'utilisateur peut le modifier, les entrées invalides sont ignorées. */
export function parseFlashcards(raw: string | null): Flashcards {
  let data: unknown;
  try {
    data = JSON.parse(raw ?? '{}');
  } catch {
    return {};
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return {};
  // Object.fromEntries crée des propriétés propres : une clé « __proto__ » reste une simple clé.
  return Object.fromEntries(
    Object.entries(data).flatMap(([key, value]): [string, CardProgress][] => {
      if (typeof value !== 'object' || value === null) return [];
      const { box, due } = value as Record<string, unknown>;
      const time = typeof due === 'string' ? Date.parse(due) : NaN;
      const validBox =
        typeof box === 'number' && Number.isInteger(box) && box >= 1 && box <= INTERVAL_DAYS.length;
      return validBox && !Number.isNaN(time)
        ? [[key, { box, due: new Date(time).toISOString() }]]
        : [];
    }),
  );
}

/**
 * Avancement dans les cartes mémoire. Il reste dans ce navigateur (localStorage), même avec un
 * compte : il n'est ni enregistré sur le serveur ni inclus dans le fichier de sauvegarde.
 */
@Injectable({ providedIn: 'root' })
export class FlashcardStore {
  private readonly window = inject(DOCUMENT).defaultView;
  private readonly current = signal(this.read());

  readonly cards = this.current.asReadonly();

  record(key: string, known: boolean, now: Date): void {
    const cards = this.current();
    const card = Object.hasOwn(cards, key) ? cards[key] : undefined;
    this.save({ ...cards, [key]: nextReview(card, known, now) });
  }

  reset(): void {
    this.save({});
  }

  private read(): Flashcards {
    try {
      return parseFlashcards(this.window?.localStorage.getItem(STORAGE_KEY) ?? null);
    } catch {
      return {}; // Stockage bloqué (navigation privée, réglages de confidentialité).
    }
  }

  private save(cards: Flashcards): void {
    this.current.set(cards);
    try {
      this.window?.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch {
      // Stockage indisponible : l'avancement vaut seulement pour la session en cours.
    }
  }
}
