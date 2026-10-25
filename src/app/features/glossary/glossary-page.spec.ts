import { PATHS } from '../../content/catalog';
import { GLOSSARY } from '../../content/glossary.generated';
import { GlossarySource, buildGlossary, normalize, searchGlossary } from './glossary-page';

/** Les termes d'une leçon fictive, tels que les écrit le plan généré. */
const lesson = (id: string, terms: string[]): GlossarySource[] =>
  terms.map((term) => ({
    term,
    definition: `Définition de ${term}`,
    example: 'Ex.',
    lessonId: id,
    lessonTitle: `Leçon ${id}`,
  }));

describe('glossaire', () => {
  it('ignore accents et majuscules', () => {
    expect(normalize(' Hameçonnage ')).toBe('hameconnage');
    expect(normalize('Élévation')).toBe('elevation');
  });

  it('fusionne un terme défini dans plusieurs leçons et trie dans l’ordre français', () => {
    const terms = buildGlossary([
      ...lesson('a', ['Zéro-day', 'Écran', 'Adresse IP']),
      ...lesson('b', ['adresse ip', 'Ecusson']),
    ]);
    expect(terms.map((t) => t.term)).toEqual(['Adresse IP', 'Écran', 'Ecusson', 'Zéro-day']);
    expect(terms[0].lessons.map((l) => l.id)).toEqual(['a', 'b']);
  });

  it('cherche dans le terme et la définition, sans accents', () => {
    const terms = buildGlossary(lesson('a', ['Hameçonnage', 'Pare-feu']));
    expect(searchGlossary(terms, 'HAMECON').map((t) => t.term)).toEqual(['Hameçonnage']);
    expect(searchGlossary(terms, 'définition de pare').map((t) => t.term)).toEqual(['Pare-feu']);
    expect(searchGlossary(terms, '   ')).toHaveLength(2);
    expect(searchGlossary(terms, 'inexistant')).toEqual([]);
  });

  it('reprend chaque terme du catalogue, avec au moins une leçon', () => {
    const lessons = PATHS.flatMap((p) => p.modules.flatMap((m) => m.lessons));
    const terms = buildGlossary(GLOSSARY);
    const distinct = new Set(lessons.flatMap((l) => l.glossary.map((g) => normalize(g.term))));
    expect(terms).toHaveLength(distinct.size);
    expect(terms.every((t) => t.lessons.length > 0)).toBe(true);
  });
});
