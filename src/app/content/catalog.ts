import { AnyLab, Catalog, LearningPath, Lesson, Module } from '../core/models/content.model';
import { PHISHING_LAB } from './labs/lab-phishing';
import { TERMINAL_LAB } from './labs/lab-terminal';
import { ORDINATEUR_ET_FICHIERS } from './lessons/01-ordinateur-et-fichiers';
import { DECOUVRIR_LE_TERMINAL } from './lessons/02-decouvrir-le-terminal';
import { VOYAGE_D_UNE_INFORMATION } from './lessons/03-voyage-d-une-information';
import { SECURITE_ET_RISQUES } from './lessons/04-securite-et-risques';
import { HAMECONNAGE } from './lessons/05-hameconnage';

/** Parcours complets, leçons rédigées. */
export const PATHS: readonly LearningPath[] = [
  {
    id: 'decouverte',
    title: 'Découverte de la cybersécurité',
    description:
      'Les bases pour comprendre un ordinateur, Internet et les principales menaces, sans aucun prérequis.',
    level: 'debutant',
    modules: [
      {
        id: 'premiers-pas',
        title: 'Premiers pas avec l’ordinateur',
        description: 'Ce que contient un ordinateur, et comment lui parler avec un terminal.',
        passThreshold: 0.8,
        lessons: [ORDINATEUR_ET_FICHIERS, DECOUVRIR_LE_TERMINAL],
      },
      {
        id: 'internet-et-menaces',
        title: 'Internet et menaces',
        description:
          'Comment voyage une information, ce qu’il faut protéger, et comment repérer une arnaque.',
        passThreshold: 0.8,
        lessons: [VOYAGE_D_UNE_INFORMATION, SECURITE_ET_RISQUES, HAMECONNAGE],
      },
    ],
  },
];

/** Leçon complète, avec son module et son parcours. */
export function findLesson(
  id: string,
): { lesson: Lesson; module: Module; path: LearningPath } | undefined {
  for (const path of PATHS) {
    for (const module of path.modules) {
      const lesson = module.lessons.find((l) => l.id === id);
      if (lesson) return { lesson, module, path };
    }
  }
  return undefined;
}

/** Laboratoires du Cyber Lab, complets (scénario, environnement simulé, validation). */
export const LABS: readonly AnyLab[] = [TERMINAL_LAB, PHISHING_LAB];

export function findLab(id: string): AnyLab | undefined {
  return LABS.find((lab) => lab.id === id);
}

export const CATALOG: Catalog = {
  paths: PATHS,
  labs: LABS,
  skills: [
    {
      id: 'decrire-un-ordinateur',
      title: 'Décrire un ordinateur',
      description:
        'Nommer les pièces d’un ordinateur, leur rôle, et l’organisation des fichiers en dossiers.',
    },
    {
      id: 'utiliser-un-terminal',
      title: 'Utiliser un terminal',
      description:
        'Se déplacer dans les dossiers, lire et créer des fichiers avec des commandes de base.',
    },
    {
      id: 'expliquer-le-reseau',
      title: 'Expliquer le trajet d’une information',
      description:
        'Décrire le rôle d’une adresse IP, du DNS et des équipements traversés par un paquet.',
    },
    {
      id: 'evaluer-un-risque',
      title: 'Évaluer un risque',
      description:
        'Distinguer menace, vulnérabilité et risque, et relier un incident à la confidentialité, l’intégrité ou la disponibilité.',
    },
    {
      id: 'detecter-l-hameconnage',
      title: 'Détecter l’hameçonnage',
      description: 'Repérer les indices d’un faux message et savoir comment réagir.',
    },
  ],
};
