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
  {
    path: '',
    pathMatch: 'full',
    title: 'Tableau de bord',
    loadComponent: () => import('./features/dashboard/dashboard-page').then((m) => m.DashboardPage),
  },
  {
    path: 'parcours',
    title: 'Parcours d’apprentissage',
    loadComponent: () => import('./features/learning-paths/paths-page').then((m) => m.PathsPage),
  },
  {
    path: 'lecons',
    title: 'Leçons',
    loadComponent: () => import('./features/lessons/lessons-page').then((m) => m.LessonsPage),
  },
  {
    path: 'lecons/:lessonId',
    // Titre d'onglet = titre de la leçon ; le catalogue est chargé à la demande, pas au démarrage.
    title: (route) =>
      import('./content/catalog').then(
        (m) =>
          m.findLesson(route.paramMap.get('lessonId') ?? '')?.lesson.title ?? 'Leçon introuvable',
      ),
    loadComponent: () => import('./features/lessons/lesson-page').then((m) => m.LessonPage),
  },
  {
    path: 'connexion',
    title: 'Connexion',
    data: { mode: 'connexion' },
    loadComponent: () => import('./features/auth/auth-page').then((m) => m.AuthPage),
  },
  {
    path: 'inscription',
    title: 'Créer un compte',
    data: { mode: 'inscription' },
    loadComponent: () => import('./features/auth/auth-page').then((m) => m.AuthPage),
  },
  {
    path: 'laboratoires',
    title: 'Laboratoires',
    loadComponent: () => import('./features/labs/labs-page').then((m) => m.LabsPage),
  },
  {
    path: 'laboratoires/:labId',
    title: (route) =>
      import('./content/catalog').then(
        (m) => m.findLab(route.paramMap.get('labId') ?? '')?.title ?? 'Laboratoire introuvable',
      ),
    loadComponent: () => import('./features/labs/lab-page').then((m) => m.LabPage),
  },
  {
    path: 'lecons/:lessonId/quiz',
    title: (route) =>
      import('./content/catalog').then((m) => {
        const title = m.findLesson(route.paramMap.get('lessonId') ?? '')?.lesson.title;
        return title ? `Quiz : ${title}` : 'Quiz introuvable';
      }),
    loadComponent: () => import('./features/quizzes/quiz-page').then((m) => m.QuizPage),
  },
  {
    path: 'quiz',
    title: 'Quiz et examens',
    loadComponent: () => import('./features/quizzes/quizzes-page').then((m) => m.QuizzesPage),
  },
  comingSoon(
    'projets',
    'Projets pratiques',
    'folder',
    'Des projets concrets pour construire votre portfolio.',
    'après la première version (MVP)',
  ),
  {
    path: 'competences',
    title: 'Compétences',
    loadComponent: () => import('./features/skills/skills-page').then((m) => m.SkillsPage),
  },
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
