/** Les 8 sections de la navigation principale, telles que l'apprenant les voit. */
export const PAGES = [
  { label: 'Tableau de bord', path: '/tableau-de-bord' },
  { label: 'Parcours d’apprentissage', path: '/parcours' },
  { label: 'Leçons', path: '/lecons' },
  { label: 'Laboratoires', path: '/laboratoires' },
  { label: 'Quiz et examens', path: '/quiz' },
  { label: 'Projets pratiques', path: '/projets' },
  { label: 'Compétences', path: '/competences' },
  { label: 'Profil et paramètres', path: '/profil' },
] as const;
