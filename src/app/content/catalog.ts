import { Catalog } from '../core/models/content.model';

/**
 * Catalogue de la plateforme.
 * Étape 4 : plan du parcours « Découverte » (titres, durées estimées, prérequis, laboratoires,
 * compétences). Le contenu des leçons est rédigé à l'étape 5, les laboratoires à l'étape 8.
 */
export const CATALOG: Catalog = {
  paths: [
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
          lessons: [
            {
              id: 'ordinateur-et-fichiers',
              title: 'Comprendre un ordinateur, ses fichiers et ses dossiers',
              durationMinutes: 20,
              prerequisiteIds: [],
              skillIds: ['decrire-un-ordinateur'],
            },
            {
              id: 'decouvrir-le-terminal',
              title: 'Découvrir le terminal',
              durationMinutes: 25,
              prerequisiteIds: ['ordinateur-et-fichiers'],
              labId: 'lab-terminal',
              skillIds: ['utiliser-un-terminal'],
            },
          ],
        },
        {
          id: 'internet-et-menaces',
          title: 'Internet et menaces',
          description:
            'Comment voyage une information, ce qu’il faut protéger, et comment repérer une arnaque.',
          passThreshold: 0.8,
          lessons: [
            {
              id: 'voyage-d-une-information',
              title: 'Comment une information voyage sur Internet',
              durationMinutes: 25,
              prerequisiteIds: ['ordinateur-et-fichiers'],
              skillIds: ['expliquer-le-reseau'],
            },
            {
              id: 'securite-et-risques',
              title: 'Confidentialité, intégrité, disponibilité : évaluer un risque',
              durationMinutes: 20,
              prerequisiteIds: ['voyage-d-une-information'],
              skillIds: ['evaluer-un-risque'],
            },
            {
              id: 'hameconnage',
              title: 'Repérer l’hameçonnage et l’ingénierie sociale',
              durationMinutes: 25,
              prerequisiteIds: ['securite-et-risques'],
              labId: 'lab-phishing',
              skillIds: ['detecter-l-hameconnage'],
            },
          ],
        },
      ],
    },
  ],
  labs: [
    {
      id: 'lab-terminal',
      kind: 'terminal',
      title: 'Explorer un système de fichiers dans un terminal simulé',
      skillIds: ['utiliser-un-terminal'],
    },
    {
      id: 'lab-phishing',
      kind: 'phishing',
      title: 'Démasquer un e-mail d’hameçonnage',
      skillIds: ['detecter-l-hameconnage'],
    },
  ],
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
