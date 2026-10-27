// Glossaire, sans dépendance à Angular : lu par les pages et par scripts/prerender-glossary.mjs,
// qui en tire une page statique par terme pour les moteurs de recherche.
import { GLOSSARY } from '../../content/glossary.generated';
import { GlossaryEntry, Lesson } from '../../core/models/content.model';

/** Un terme tel que défini dans une leçon (fichier généré glossary.generated.ts). */
export type GlossarySource = GlossaryEntry & {
  readonly lessonId: string;
  readonly lessonTitle: string;
};

export interface GlossaryTerm extends GlossaryEntry {
  /** Adresse de sa page : /glossaire/<slug>. */
  readonly slug: string;
  /** Leçons où le terme est défini, dans l'ordre du catalogue. */
  readonly lessons: readonly Pick<Lesson, 'id' | 'title'>[];
}

/** Minuscules sans accents : « Hameçonnage » et « hameconnage » se retrouvent. */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

/** « Usurpation d’identité » → « usurpation-d-identite ». */
export function slugify(text: string): string {
  return normalize(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Termes de toutes les leçons, fusionnés s'ils reviennent, dans l'ordre alphabétique français. */
export function buildGlossary(entries: readonly GlossarySource[]): GlossaryTerm[] {
  const byTerm = new Map<string, GlossaryTerm>();
  for (const { lessonId, lessonTitle, ...entry } of entries) {
    const key = normalize(entry.term);
    const seen = { id: lessonId, title: lessonTitle };
    const known = byTerm.get(key);
    byTerm.set(
      key,
      known
        ? { ...known, lessons: [...known.lessons, seen] }
        : { ...entry, slug: slugify(entry.term), lessons: [seen] },
    );
  }
  const collator = new Intl.Collator('fr', { sensitivity: 'base' });
  return [...byTerm.values()].sort((a, b) => collator.compare(a.term, b.term));
}

/** Recherche dans le terme et la définition, sans tenir compte des accents ni de la casse. */
export function searchGlossary(terms: readonly GlossaryTerm[], query: string): GlossaryTerm[] {
  const q = normalize(query);
  return q === ''
    ? [...terms]
    : terms.filter((t) => normalize(t.term).includes(q) || normalize(t.definition).includes(q));
}

/** Glossaire complet : page Glossaire, pages des termes et cartes mémoire. */
export const TERMS = buildGlossary(GLOSSARY);

export function findTerm(slug: string): GlossaryTerm | undefined {
  return TERMS.find((term) => term.slug === slug);
}
