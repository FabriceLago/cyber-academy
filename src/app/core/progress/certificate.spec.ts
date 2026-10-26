import { CERTIFICATE_NOTICE, certificatePdf, toWinAnsi } from './certificate';

const INPUT = {
  learner: 'Léa (L\\) Martin',
  pathTitle: 'Découverte de la cybersécurité',
  completedAt: new Date('2026-10-26T10:00:00Z'),
  minutes: 200,
  skills: ['Détecter l’hameçonnage', 'Utiliser un terminal'],
  issuedAt: new Date('2026-10-27T12:00:00Z'),
};
/** Un octet par caractère, sans réinterprétation (TextDecoder lirait du Windows-1252). */
const pdf = String.fromCharCode(...certificatePdf(INPUT));
/** Lignes affichées, avec leur taille de police, chaînes PDF déséchappées. */
const lines = [...pdf.matchAll(/\/F\d (\d+) Tf .*? Td \(((?:\\.|[^\\)])*)\) Tj/g)].map((m) => ({
  size: Number(m[1]),
  text: m[2].replace(/\\(.)/g, '$1'),
}));
const shown = lines.map((l) => l.text).join(' ');

describe('toWinAnsi', () => {
  it('garde les lettres accentuées et convertit la typographie française', () => {
    expect(toWinAnsi('é à ç « » Œ’…')).toBe('é à ç « » \x8c\x92\x85');
  });

  it('remplace ce que la police ne peut pas afficher', () => {
    expect(toWinAnsi('clé 🔒\tok')).toBe('clé ? ok');
  });
});

describe('certificatePdf', () => {
  it('produit un PDF dont la table des positions pointe sur chaque objet', () => {
    expect(pdf.startsWith('%PDF-1.4\n')).toBe(true);
    expect(pdf.endsWith('%%EOF\n')).toBe(true);
    const xref = Number(/startxref\n(\d+)\n/.exec(pdf)?.[1]);
    expect(pdf.slice(xref, xref + 5)).toBe('xref\n');
    const offsets = [...pdf.slice(xref).matchAll(/^(\d{10}) 00000 n $/gm)].map((m) => Number(m[1]));
    expect(offsets).toHaveLength(7);
    offsets.forEach((offset, i) => expect(pdf.startsWith(`${i + 1} 0 obj\n`, offset)).toBe(true));
    const length = Number(/\/Length (\d+) >>\nstream\n/.exec(pdf)?.[1]);
    const stream = pdf.indexOf('stream\n') + 'stream\n'.length;
    expect(pdf.startsWith('\nendstream', stream + length)).toBe(true);
  });

  it('nomme l’apprenant, le parcours, la date, la durée et les compétences', () => {
    expect(shown).toContain(toWinAnsi(INPUT.learner)); // parenthèses et barre oblique échappées
    expect(shown).toContain(toWinAnsi('a terminé le parcours « Découverte de la cybersécurité »'));
    expect(shown).toContain('le 26 octobre 2026.');
    expect(shown).toContain('3 h 20 min');
    expect(shown).toContain(toWinAnsi('• Détecter l’hameçonnage'));
    expect(shown).toContain('générée le 27 octobre 2026');
  });

  it('dit clairement qu’il ne s’agit pas d’une certification professionnelle', () => {
    expect(shown).toContain(toWinAnsi(CERTIFICATE_NOTICE));
    expect(shown).toContain(toWinAnsi('n’est pas vérifiable par un tiers'));
  });

  it('coupe les lignes pour qu’elles tiennent dans la page', () => {
    for (const line of lines) {
      expect(line.text.length * line.size * 0.52).toBeLessThanOrEqual(475);
    }
  });
});
