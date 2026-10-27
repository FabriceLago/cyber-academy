// Pages statiques du glossaire, pour les moteurs de recherche : /glossaire/ (la liste) et une page
// par terme (/glossaire/<terme>/), copies d'index.html avec leur titre, leur description et leur
// contenu, lisibles sans JavaScript. Au démarrage, l'application les remplace par les mêmes pages,
// interactives. SITE_URL (facultatif, exemple : https://cyber-academy.fr) ajoute l'adresse
// canonique de chaque page, sitemap.xml et robots.txt.
// Usage : node scripts/prerender-glossary.mjs [dossier du build]
import { build } from 'esbuild';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = process.argv[2] ?? 'dist/cyber-academy/browser';
const site = process.env.SITE_URL ? new URL(process.env.SITE_URL).origin : '';

const { outputFiles } = await build({
  entryPoints: ['src/app/features/glossary/glossary.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
  logLevel: 'error',
});
const { TERMS } = await import(
  `data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`
);

const shell = readFileSync(join(OUT, 'index.html'), 'utf8');
const TITLE = /<title>[^<]*<\/title>/;
const DESCRIPTION = /<meta name="description" content="[^"]*"\s*\/?>/;
const ROOT = '<ca-root></ca-root>';
if (!TITLE.test(shell) || !DESCRIPTION.test(shell) || !shell.includes(ROOT)) {
  console.error(
    'prerender-glossary : titre, description ou <ca-root> introuvable dans index.html.',
  );
  process.exit(1);
}

const escape = (text) =>
  text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Écrit <path>/index.html : la page de l'application, avec ce contenu déjà affiché. */
function writePage(path, title, description, body) {
  const canonical = site ? `<link rel="canonical" href="${site}${path}">` : '';
  const html = shell
    .replace(TITLE, `<title>${escape(title)} · Cyber Academy</title>`)
    .replace(DESCRIPTION, `<meta name="description" content="${escape(description)}">${canonical}`)
    .replace(ROOT, `<ca-root><main id="contenu">${body}</main></ca-root>`);
  mkdirSync(join(OUT, path), { recursive: true });
  writeFileSync(join(OUT, path, 'index.html'), html);
}

for (const term of TERMS) {
  const lessons = term.lessons
    .map((lesson) => `<li><a href="/lecons/${lesson.id}">${escape(lesson.title)}</a></li>`)
    .join('');
  writePage(
    `/glossaire/${term.slug}/`,
    `${term.term} : définition`,
    `${term.term} : ${term.definition}`,
    `<p><a href="/glossaire/">Glossaire</a></p><h1>${escape(term.term)}</h1>` +
      `<p>${escape(term.definition)}</p><h2>Exemple</h2><p>${escape(term.example)}</p>` +
      `<h2>Pour aller plus loin</h2><ul>${lessons}</ul>`,
  );
}

writePage(
  '/glossaire/',
  'Glossaire',
  `Les ${TERMS.length} termes de la cybersécurité expliqués simplement, avec un exemple.`,
  `<h1>Glossaire</h1><p>Tous les termes définis dans les leçons, avec un exemple.</p><dl>` +
    TERMS.map(
      (term) =>
        `<dt><a href="/glossaire/${term.slug}/">${escape(term.term)}</a></dt>` +
        `<dd>${escape(term.definition)}</dd>`,
    ).join('') +
    '</dl>',
);

if (site) {
  const urls = [
    '/',
    '/parcours',
    '/lecons',
    '/glossaire/',
    ...TERMS.map((t) => `/glossaire/${t.slug}/`),
  ];
  writeFileSync(
    join(OUT, 'sitemap.xml'),
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      urls.map((url) => `  <url><loc>${site}${url}</loc></url>`).join('\n') +
      '\n</urlset>\n',
  );
  writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site}/sitemap.xml\n`);
}

console.log(
  `Glossaire statique : ${TERMS.length + 1} pages` +
    (site
      ? `, sitemap.xml et robots.txt pour ${site}.`
      : ' (sans SITE_URL : ni adresse canonique ni sitemap).'),
);
