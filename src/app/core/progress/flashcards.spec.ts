import { TestBed } from '@angular/core/testing';
import { FlashcardStore, nextReview, parseFlashcards, sessionCards } from './flashcards';

const NOW = new Date('2026-10-25T12:00:00.000Z');
const inDays = (days: number) => new Date(NOW.getTime() + days * 86_400_000).toISOString();

describe('nextReview', () => {
  it('fait monter une carte connue d’une boîte, jusqu’à la cinquième', () => {
    expect(nextReview(undefined, true, NOW)).toEqual({ box: 1, due: inDays(1) });
    expect(nextReview({ box: 1, due: '' }, true, NOW)).toEqual({ box: 2, due: inDays(3) });
    expect(nextReview({ box: 4, due: '' }, true, NOW)).toEqual({ box: 5, due: inDays(30) });
    expect(nextReview({ box: 5, due: '' }, true, NOW)).toEqual({ box: 5, due: inDays(30) });
  });

  it('renvoie une carte oubliée en boîte 1, pour le lendemain', () => {
    expect(nextReview({ box: 4, due: '' }, false, NOW)).toEqual({ box: 1, due: inDays(1) });
    expect(nextReview(undefined, false, NOW)).toEqual({ box: 1, due: inDays(1) });
  });
});

describe('sessionCards', () => {
  const same = (key: string) => key;

  it('propose les cartes en retard d’abord, puis les nouvelles dans la limite', () => {
    const cards = {
      a: { box: 2, due: inDays(-1) },
      b: { box: 1, due: inDays(-3) },
      c: { box: 3, due: inDays(2) }, // pas encore à revoir
    };
    expect(sessionCards(['a', 'b', 'c', 'd', 'e', 'f'], same, cards, NOW, 2)).toEqual([
      'b',
      'a',
      'd',
      'e',
    ]);
  });

  it('ne propose rien quand tout est à jour', () => {
    expect(sessionCards(['a'], same, { a: { box: 1, due: inDays(1) } }, NOW)).toEqual([]);
  });
});

describe('parseFlashcards', () => {
  it.each([
    ['rien de stocké', null],
    ['du JSON invalide', '{oups'],
    ['un tableau', '[]'],
  ])('repart de zéro pour %s', (_, raw) => {
    expect(parseFlashcards(raw)).toEqual({});
  });

  it('garde les entrées valides, normalise les dates et ignore le reste', () => {
    const cards = parseFlashcards(
      JSON.stringify({
        pare_feu: { box: 2, due: '2026-10-26T12:00:00Z' },
        boite: { box: 6, due: inDays(1) },
        decimal: { box: 1.5, due: inDays(1) },
        date: { box: 1, due: 'demain' },
        texte: 'oups',
      }),
    );
    expect(cards).toEqual({ pare_feu: { box: 2, due: '2026-10-26T12:00:00.000Z' } });
  });

  it('traite « __proto__ » comme une clé ordinaire', () => {
    const cards = parseFlashcards(`{"__proto__": {"box": 1, "due": "${inDays(1)}"}}`);
    expect(Object.getPrototypeOf(cards)).toBe(Object.prototype);
    expect(Object.hasOwn(cards, '__proto__')).toBe(true);
  });
});

describe('FlashcardStore', () => {
  beforeEach(() => localStorage.clear());

  it('enregistre chaque réponse dans le navigateur et s’efface', () => {
    const store = TestBed.inject(FlashcardStore);
    store.record('pare-feu', true, NOW);
    store.record('pare-feu', true, NOW);
    expect(store.cards()).toEqual({ 'pare-feu': { box: 2, due: inDays(3) } });
    expect(parseFlashcards(localStorage.getItem('ca-flashcards'))).toEqual(store.cards());

    store.reset();
    expect(store.cards()).toEqual({});
    expect(localStorage.getItem('ca-flashcards')).toBe('{}');
  });
});
