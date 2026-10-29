// Disponibilité : le site et Supabase répondent-ils ? Lancé par le workflow « Disponibilité »
// (.github/workflows/disponibilite.yml), ou à la main :
//   SITE_URL=https://… SUPABASE_URL=https://….supabase.co SUPABASE_PUBLISHABLE_KEY=sb_publishable_…
//   node scripts/check-availability.mjs
// Code de sortie 1 si l'un des deux ne répond pas comme prévu : GitHub envoie alors un e-mail.
const { SITE_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = process.env;
if (!SITE_URL || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('SITE_URL, SUPABASE_URL et SUPABASE_PUBLISHABLE_KEY sont nécessaires.');
  process.exit(1);
}

const checks = [
  // Page d'accueil avec le nom du site : une page d'erreur de l'hébergeur ne passe pas.
  { name: 'site', url: SITE_URL, ok: (body) => body.includes('Cyber Academy') },
  // Authentification de Supabase : comptes et progression en dépendent.
  {
    name: 'Supabase',
    url: `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/health`,
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
    ok: () => true,
  },
];

let failed = false;
for (const check of checks) {
  try {
    const response = await fetch(check.url, {
      headers: check.headers,
      signal: AbortSignal.timeout(20_000),
    });
    const body = await response.text();
    if (!response.ok || !check.ok(body)) throw new Error(`réponse ${response.status}`);
    console.log(`${check.name} : en ligne (${response.status}).`);
  } catch (error) {
    failed = true;
    console.error(`${check.name} : HORS LIGNE (${check.url}) : ${error.message}`);
  }
}
process.exit(failed ? 1 : 0);
