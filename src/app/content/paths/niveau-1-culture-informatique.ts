import { LearningPath } from '../../core/models/content.model';
import { MISES_A_JOUR_ET_SAUVEGARDES } from '../lessons/08-mises-a-jour-et-sauvegardes';

/**
 * Niveau 1 du programme (docs/plan-contenu.md), gratuit. En cours de rédaction : la leçon pilote
 * est publiée seule, ce que la description annonce explicitement.
 */
export const CULTURE_INFORMATIQUE: LearningPath = {
  id: 'culture-informatique',
  title: 'Niveau 1 : Culture informatique',
  description:
    'Utiliser un ordinateur et ses comptes en sécurité : mises à jour, sauvegardes, fichiers et mots de passe. Niveau en cours de rédaction : une première leçon est disponible, les cinq autres suivront.',
  level: 'debutant',
  prerequisitePathIds: ['decouverte'],
  modules: [
    {
      id: 'materiel-et-systemes',
      title: 'Matériel et systèmes',
      description: 'Garder son ordinateur à jour et mettre ses données à l’abri.',
      passThreshold: 0.8,
      lessons: [MISES_A_JOUR_ET_SAUVEGARDES],
    },
  ],
};
