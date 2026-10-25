import {
  AnyLab,
  LabOutline,
  Lesson,
  LessonOutline,
  ModuleOutline,
  PathOutline,
} from '../core/models/content.model';
import { CATALOG } from './outline.generated';

/**
 * Accès au catalogue depuis l'application : le plan (outline.generated.ts) est lu tout de suite,
 * le contenu d'une leçon ou d'un laboratoire n'est téléchargé qu'à l'ouverture de sa page, chacun
 * dans son propre fichier. Une leçon ajoutée au catalogue doit aussi l'être ici (vérifié par test).
 */
const LESSONS: Readonly<Record<string, () => Promise<Lesson>>> = {
  'ordinateur-et-fichiers': () =>
    import('./lessons/01-ordinateur-et-fichiers').then((m) => m.ORDINATEUR_ET_FICHIERS),
  'decouvrir-le-terminal': () =>
    import('./lessons/02-decouvrir-le-terminal').then((m) => m.DECOUVRIR_LE_TERMINAL),
  'voyage-d-une-information': () =>
    import('./lessons/03-voyage-d-une-information').then((m) => m.VOYAGE_D_UNE_INFORMATION),
  'securite-et-risques': () =>
    import('./lessons/04-securite-et-risques').then((m) => m.SECURITE_ET_RISQUES),
  hameconnage: () => import('./lessons/05-hameconnage').then((m) => m.HAMECONNAGE),
  'soc-et-journaux': () => import('./lessons/06-soc-et-journaux').then((m) => m.SOC_ET_JOURNAUX),
  'trier-une-alerte': () => import('./lessons/07-trier-une-alerte').then((m) => m.TRIER_UNE_ALERTE),
  'mises-a-jour-et-sauvegardes': () =>
    import('./lessons/08-mises-a-jour-et-sauvegardes').then((m) => m.MISES_A_JOUR_ET_SAUVEGARDES),
};

const LABS: Readonly<Record<string, () => Promise<AnyLab>>> = {
  'lab-terminal': () => import('./labs/lab-terminal').then((m) => m.TERMINAL_LAB),
  'lab-phishing': () => import('./labs/lab-phishing').then((m) => m.PHISHING_LAB),
  'lab-journaux': () => import('./labs/lab-journaux').then((m) => m.LOGS_LAB),
  'lab-sauvegarde': () => import('./labs/lab-sauvegarde').then((m) => m.SAUVEGARDE_LAB),
};

/** Leçon complète, avec le plan de son module et de son parcours. */
export interface LessonEntry {
  readonly lesson: Lesson;
  readonly module: ModuleOutline;
  readonly path: PathOutline;
}

export function findPath(id: string): PathOutline | undefined {
  return CATALOG.paths.find((path) => path.id === id);
}

export function findLab(id: string): LabOutline | undefined {
  return CATALOG.labs.find((lab) => lab.id === id);
}

export function findLesson(
  id: string,
): { lesson: LessonOutline; module: ModuleOutline; path: PathOutline } | undefined {
  for (const path of CATALOG.paths) {
    for (const module of path.modules) {
      const lesson = module.lessons.find((l) => l.id === id);
      if (lesson) return { lesson, module, path };
    }
  }
  return undefined;
}

/** null si la leçon n'existe pas ; rejette si le fichier ne se télécharge pas (réseau coupé). */
export async function loadLesson(id: string): Promise<LessonEntry | null> {
  const found = findLesson(id);
  // Object.hasOwn : un identifiant comme « constructor » ne trouve rien.
  if (!found || !Object.hasOwn(LESSONS, id)) return null;
  return { ...found, lesson: await LESSONS[id]() };
}

export async function loadLab(id: string): Promise<AnyLab | null> {
  if (!findLab(id) || !Object.hasOwn(LABS, id)) return null;
  return LABS[id]();
}
