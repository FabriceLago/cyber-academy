import { Route, Routes } from '@angular/router';
import { ErrorPage } from './features/errors/error-page';
import { IconName } from './shared/icon/icon';

/** Section pas encore développée : page provisoire qui annonce l'étape prévue. */
function comingSoon(
  path: string,
  title: string,
  icon: IconName,
  intro: string,
  availability: string,
): Route {
  return {
    path,
    pathMatch: 'full',
    title,
    data: { heading: title, intro, icon, availability },
    loadComponent: () =>
      import('./features/coming-soon/coming-soon-page').then((m) => m.ComingSoonPage),
  };
}

export const routes: Routes = [
  comingSoon(
    '',
    'Tableau de bord',
    'dashboard',
    'Votre progression, la prochaine leçon recommandée et vos résultats, en un coup d’œil.',
    'à l’étape 4',
  ),
  comingSoon(
    'parcours',
    'Parcours d’apprentissage',
    'route',
    'La carte des parcours, des premiers pas jusqu’aux spécialisations professionnelles.',
    'à l’étape 5',
  ),
  comingSoon(
    'lecons',
    'Leçons',
    'book',
    'Des leçons progressives et illustrées, chacune suivie d’un quiz corrigé.',
    'à l’étape 5',
  ),
  comingSoon(
    'laboratoires',
    'Laboratoires',
    'flask',
    'Le Cyber Lab : des exercices pratiques dans des environnements simulés, sans risque.',
    'à l’étape 8',
  ),
  comingSoon(
    'quiz',
    'Quiz et examens',
    'quiz',
    'Vos quiz, vos résultats et les notions à revoir.',
    'à l’étape 6',
  ),
  comingSoon(
    'projets',
    'Projets pratiques',
    'folder',
    'Des projets concrets pour construire votre portfolio.',
    'après la première version (MVP)',
  ),
  comingSoon(
    'competences',
    'Compétences',
    'award',
    'Les compétences que vous avez démontrées en quiz et en laboratoire.',
    'à l’étape 4',
  ),
  {
    path: 'profil',
    title: 'Profil et paramètres',
    loadComponent: () => import('./features/profile/profile-page').then((m) => m.ProfilePage),
  },
  { path: 'erreur', title: 'Erreur', component: ErrorPage },
  {
    path: '**',
    title: 'Page introuvable',
    loadComponent: () => import('./features/errors/not-found-page').then((m) => m.NotFoundPage),
  },
];
