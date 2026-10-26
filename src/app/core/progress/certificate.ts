/**
 * Attestation de fin de parcours, en PDF, générée dans le navigateur sans bibliothèque : une
 * page A4 de texte en Helvetica (police standard des lecteurs PDF, encodage WinAnsi).
 */

export interface CertificateInput {
  readonly learner: string;
  readonly pathTitle: string;
  /** Validation de la dernière leçon du parcours. */
  readonly completedAt: Date;
  readonly minutes: number;
  readonly skills: readonly string[];
  readonly issuedAt: Date;
}

/** Avertissement repris tel quel sur l'attestation et sur la page du parcours. */
export const CERTIFICATE_NOTICE =
  'Parcours pédagogique simulé : les exercices se déroulent sur des systèmes et des données ' +
  'fictifs. Cette attestation n’est pas une certification professionnelle : elle n’est délivrée ' +
  'ni reconnue par aucun organisme officiel et ne garantit pas un emploi.';

const WIDTH = 595; // A4, en points
const HEIGHT = 842;
const MARGIN = 60;

interface Line {
  readonly text: string;
  readonly size: number;
  readonly bold?: boolean;
  /** Espace supplémentaire avant la ligne, en points. */
  readonly before?: number;
}

/** Caractères hors Latin-1 de l'encodage WinAnsi (Windows-1252). */
const WIN_ANSI: Readonly<Record<string, number>> = {
  '€': 0x80,
  '…': 0x85,
  '‘': 0x91,
  '’': 0x92,
  '“': 0x93,
  '”': 0x94,
  '•': 0x95,
  '–': 0x96,
  '—': 0x97,
  Œ: 0x8c,
  œ: 0x9c,
  ' ': 0xa0, // espace fine insécable
};

/** Texte en octets WinAnsi ; un caractère impossible à afficher devient « ? ». */
export function toWinAnsi(text: string): string {
  return [...text]
    .map((char) => {
      const code = char.codePointAt(0) ?? 0x3f;
      if (code < 0x20) return ' ';
      if (code < 0x7f || (code >= 0xa0 && code <= 0xff)) return char;
      return String.fromCharCode(WIN_ANSI[char] ?? 0x3f);
    })
    .join('');
}

/** Coupe une phrase en lignes ; Helvetica fait en moyenne un demi-em par caractère. */
function wrap(text: string, size: number): string[] {
  // ponytail: largeur estimée, pas mesurée ; mesurer avec les métriques Helvetica si un texte déborde.
  const max = Math.floor((WIDTH - 2 * MARGIN) / (size * 0.52));
  const lines: string[] = [];
  let current = '';
  for (const word of text.split(' ')) {
    if (current && current.length + 1 + word.length > max) {
      lines.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  return current ? [...lines, current] : lines;
}

const longDate = (date: Date) =>
  new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(date);

function duration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

function certificateLines(input: CertificateInput): Line[] {
  const paragraph = (text: string, size: number, before = 0, bold = false): Line[] =>
    wrap(text, size).map((line, i) => ({ text: line, size, bold, before: i === 0 ? before : 0 }));
  return [
    { text: 'CYBER ACADEMY', size: 11, bold: true },
    { text: 'Attestation de fin de parcours', size: 26, bold: true, before: 30 },
    ...paragraph('Cyber Academy atteste que', 13, 40),
    ...paragraph(input.learner, 22, 14, true),
    ...paragraph(`a terminé le parcours « ${input.pathTitle} »`, 13, 14),
    ...paragraph(`le ${longDate(input.completedAt)}.`, 13),
    ...paragraph(`Durée indicative du parcours : ${duration(input.minutes)}.`, 11, 24),
    { text: 'Compétences travaillées :', size: 11, bold: true, before: 18 },
    ...input.skills.flatMap((skill) => paragraph(`• ${skill}`, 11, 4)),
    { text: 'Important', size: 11, bold: true, before: 30 },
    ...paragraph(CERTIFICATE_NOTICE, 10, 4),
    ...paragraph(
      `Attestation générée le ${longDate(input.issuedAt)} à partir de la progression ` +
        'enregistrée sur Cyber Academy. Elle n’est pas vérifiable par un tiers.',
      9,
      18,
    ),
  ];
}

/** Échappe une chaîne littérale PDF. */
const pdfString = (text: string) => `(${toWinAnsi(text).replace(/[\\()]/g, '\\$&')})`;

/** Le fichier PDF, en octets. */
export function certificatePdf(input: CertificateInput): Uint8Array<ArrayBuffer> {
  let y = HEIGHT - MARGIN - 20;
  const text = certificateLines(input).map((line) => {
    y -= (line.before ?? 0) + line.size * 1.35;
    return `BT /${line.bold ? 'F2' : 'F1'} ${line.size} Tf ${MARGIN} ${y.toFixed(1)} Td ${pdfString(line.text)} Tj ET`;
  });
  const content = [
    '0.08 0.36 0.45 RG 2 w 30 30 535 782 re S', // cadre
    '0.06 0.12 0.2 rg',
    ...text,
  ].join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${WIDTH} ${HEIGHT}] ` +
      '/Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    `<< /Title ${pdfString(`Attestation de fin de parcours : ${input.pathTitle}`)} /Producer (Cyber Academy) >>`,
  ];

  // Chaque caractère vaut un octet : les positions dans la chaîne sont les positions en octets.
  let pdf = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n';
  const offsets = objects.map((object, i) => {
    const offset = pdf.length;
    pdf += `${i + 1} 0 obj\n${object}\nendobj\n`;
    return offset;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 7 0 R >>\n`;
  pdf += `startxref\n${xref}\n%%EOF\n`;
  return Uint8Array.from(pdf, (char) => char.charCodeAt(0));
}
