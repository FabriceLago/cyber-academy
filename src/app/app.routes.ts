import { ResolveFn, Routes } from '@angular/router';
import type { LessonEntry } from './content/content-loader';
import type { AnyLab } from './core/models/content.model';
import { ErrorPage } from './features/errors/error-page';

/**
 * Contenu complet d'une leçon (avec son quiz) ou d'un laboratoire, téléchargé à l'ouverture de sa
 * page et transmis au composant (withComponentInputBinding). Échec du téléchargement : page d'erreur.
 */
const lessonEntry: ResolveFn<LessonEntry | null> = (route) =>
  import('./content/content-loader').then((m) =>
    m.loadLesson(route.paramMap.get('lessonId') ?? ''),
  );
const labContent: ResolveFn<AnyLab | null> = (route) =>
  import('./content/content-loader').then((m) => m.loadLab(route.paramMap.get('labId') ?? ''));

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
    path: 'parcours/:pathId',
    title: (route) =>
      import('./content/content-loader').then(
        (m) => m.findPath(route.paramMap.get('pathId') ?? '')?.title ?? 'Parcours introuvable',
      ),
    loadComponent: () => import('./features/learning-paths/path-page').then((m) => m.PathPage),
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
      import('./content/content-loader').then(
        (m) =>
          m.findLesson(route.paramMap.get('lessonId') ?? '')?.lesson.title ?? 'Leçon introuvable',
      ),
    resolve: { entry: lessonEntry },
    loadComponent: () => import('./features/lessons/lesson-page').then((m) => m.LessonPage),
  },
  {
    path: 'glossaire',
    title: 'Glossaire',
    loadComponent: () => import('./features/glossary/glossary-page').then((m) => m.GlossaryPage),
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
    path: 'mot-de-passe-oublie',
    title: 'Mot de passe oublié',
    data: { mode: 'demande' },
    loadComponent: () => import('./features/auth/password-page').then((m) => m.PasswordPage),
  },
  {
    // Ouverte par le lien de réinitialisation reçu par e-mail.
    path: 'nouveau-mot-de-passe',
    title: 'Nouveau mot de passe',
    data: { mode: 'nouveau' },
    loadComponent: () => import('./features/auth/password-page').then((m) => m.PasswordPage),
  },
  {
    path: 'abonnement',
    title: 'Abonnement Premium',
    loadComponent: () =>
      import('./features/subscription/subscription-page').then((m) => m.SubscriptionPage),
  },
  {
    path: 'mentions-legales',
    title: 'Mentions légales',
    loadComponent: () => import('./features/legal/legal-pages').then((m) => m.LegalNoticePage),
  },
  {
    path: 'confidentialite',
    title: 'Politique de confidentialité',
    loadComponent: () => import('./features/legal/legal-pages').then((m) => m.PrivacyPage),
  },
  {
    path: 'laboratoires',
    title: 'Laboratoires',
    loadComponent: () => import('./features/labs/labs-page').then((m) => m.LabsPage),
  },
  {
    path: 'laboratoires/:labId',
    title: (route) =>
      import('./content/content-loader').then(
        (m) => m.findLab(route.paramMap.get('labId') ?? '')?.title ?? 'Laboratoire introuvable',
      ),
    resolve: { lab: labContent },
    loadComponent: () => import('./features/labs/lab-page').then((m) => m.LabPage),
  },
  {
    path: 'lecons/:lessonId/quiz',
    title: (route) =>
      import('./content/content-loader').then((m) => {
        const title = m.findLesson(route.paramMap.get('lessonId') ?? '')?.lesson.title;
        return title ? `Quiz : ${title}` : 'Quiz introuvable';
      }),
    resolve: { entry: lessonEntry },
    loadComponent: () => import('./features/quizzes/quiz-page').then((m) => m.QuizPage),
  },
  {
    path: 'quiz',
    title: 'Quiz et examens',
    loadComponent: () => import('./features/quizzes/quizzes-page').then((m) => m.QuizzesPage),
  },
  {
    path: 'projets',
    title: 'Projets pratiques',
    loadComponent: () => import('./features/projects/projects-page').then((m) => m.ProjectsPage),
  },
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
