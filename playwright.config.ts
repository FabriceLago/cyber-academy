import { defineConfig, devices } from '@playwright/test';

/**
 * Tests de parcours utilisateur, sur bureau et sur mobile, exécutés sur le build de production
 * (ce qui sera déployé), servi par vite preview.
 */
export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  // Au-delà de 2 navigateurs simultanés, le poste de développement (≈ 3,6 Go de mémoire libre)
  // sature : des chargements de page restent bloqués 30 s. Mesuré : 6 workers instables, 2 stables.
  workers: 2,
  // Même raison : sous forte charge, un rendu peut dépasser les 5 s d'attente par défaut.
  expect: { timeout: 10_000 },
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4201',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'bureau', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    // vite preview renvoie index.html pour les adresses de l'application (/profil, /lecons…).
    command:
      'npm run build && vite preview --outDir dist/cyber-academy/browser --port 4201 --strictPort',
    url: 'http://localhost:4201',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
