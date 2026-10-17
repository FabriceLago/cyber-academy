import { LearningPath } from '../../core/models/content.model';
import { SOC_ET_JOURNAUX } from '../lessons/06-soc-et-journaux';
import { TRIER_UNE_ALERTE } from '../lessons/07-trier-une-alerte';

/**
 * Spécialisation « Analyste SOC junior ». Premier module rédigé ; les suivants (SIEM et
 * corrélation, réponse à incident, MITRE ATT&CK…) sont annoncés comme en préparation.
 */
export const ANALYSTE_SOC_JUNIOR: LearningPath = {
  id: 'analyste-soc-junior',
  title: 'Analyste SOC junior',
  description:
    'Spécialisation : surveiller, analyser et trier les événements de sécurité, comme un analyste de niveau 1.',
  level: 'intermediaire',
  prerequisitePathIds: ['decouverte'],
  modules: [
    {
      id: 'metier-analyste-soc',
      title: 'Le métier d’analyste SOC',
      description: 'Ce que fait un SOC, comment lire des journaux et trier une alerte.',
      passThreshold: 0.8,
      lessons: [SOC_ET_JOURNAUX, TRIER_UNE_ALERTE],
    },
  ],
  career: {
    role: 'Analyste SOC junior (niveau 1)',
    summary:
      'L’analyste SOC de niveau 1 surveille les alertes, les trie, mène les premières vérifications et transmet les incidents confirmés aux niveaux supérieurs. Le poste demande de la rigueur, de la curiosité et une écriture claire.',
    requiredSkills: [
      'Lire et filtrer des journaux d’événements',
      'Qualifier une alerte et estimer sa gravité',
      'Connaître les attaques courantes : hameçonnage, force brute, logiciels malveillants',
      'Bases réseau : adresses IP, ports, DNS, HTTP',
      'Rédiger une note d’incident claire et factuelle',
      'Utiliser un SIEM : recherches et tableaux de bord (à pratiquer sur des environnements d’entraînement)',
    ],
    prerequisites: [
      'Le parcours « Découverte de la cybersécurité » validé',
      'Être à l’aise avec le terminal et les fichiers',
      'Aucune expérience professionnelle n’est exigée pour suivre ce parcours',
    ],
    upcoming: [
      'SIEM et corrélation d’événements',
      'Indicateurs de compromission (IOC)',
      'Réponse à incident',
      'Introduction à MITRE ATT&CK',
      'Documentation et rapports',
    ],
    finalProject: {
      title: 'Rapport d’incident : une nuit agitée sur le VPN',
      brief:
        'À partir du laboratoire « Analyser des journaux d’authentification », rédigez le rapport d’incident que vous transmettriez au niveau 2. Quelqu’un qui n’a pas vu les journaux doit comprendre ce qui s’est passé et quoi faire.',
      deliverables: [
        'Un résumé en trois phrases',
        'La chronologie des événements, avec les heures et les sources',
        'Les indicateurs de compromission : adresse IP, compte, actions',
        'La gravité retenue, justifiée par l’impact et l’étendue',
        'Les actions immédiates et les recommandations, par ordre de priorité',
      ],
      criteria: [
        'Les faits sont exacts et vérifiables dans les journaux',
        'La chronologie est complète et dans l’ordre',
        'Les faits sont séparés des hypothèses',
        'La gravité est justifiée par l’impact et l’étendue',
        'Les recommandations sont concrètes et classées par priorité',
        'Le texte se lit sans connaître les journaux',
      ],
    },
    interviewQuestions: [
      {
        id: 'faux-positif',
        title: 'Vrai ou faux positif',
        prompt:
          'Quelle est la différence entre un faux positif et un vrai positif ? Donnez un exemple.',
        expectations: [
          'Un faux positif est une alerte sans activité malveillante réelle ; un vrai positif correspond à une vraie menace.',
          'Un exemple concret : une faute de frappe isolée, face à une série d’échecs suivie d’une connexion réussie.',
          'Les faits qui permettent de trancher : adresse habituelle, nombre d’échecs, réussite, actions ensuite.',
        ],
      },
      {
        id: 'cinquante-alertes',
        title: 'Cinquante alertes',
        prompt: 'Vous trouvez 50 alertes en début de poste. Comment les traitez-vous ?',
        expectations: [
          'Prioriser selon la gravité et l’importance des systèmes touchés.',
          'Regrouper les alertes liées à un même événement.',
          'Documenter chaque décision.',
          'Escalader sans attendre ce qui est grave ou incertain.',
        ],
      },
      {
        id: 'force-brute',
        title: 'La force brute',
        prompt:
          'Qu’est-ce qu’une attaque par force brute, et comment la repère-t-on dans des journaux ?',
        expectations: [
          'De nombreux essais de mots de passe.',
          'Beaucoup d’échecs depuis une même source en peu de temps, parfois sur plusieurs comptes.',
          'Le signal fort : une connexion réussie juste après les échecs.',
          'Les protections : double authentification, verrouillage, limitation du nombre d’essais.',
        ],
      },
      {
        id: 'documentation',
        title: 'Pourquoi documenter',
        prompt: 'Pourquoi la documentation est-elle si importante dans un SOC ?',
        expectations: [
          'Pour que l’équipe suivante ou le niveau 2 reprenne le dossier sans tout refaire.',
          'Pour garder la trace des preuves et des décisions.',
          'Pour améliorer les règles de détection.',
          'Pour répondre aux obligations légales et contractuelles.',
        ],
      },
    ],
    interviewExercises: [
      {
        id: 'triage-voix-haute',
        title: 'Triage à voix haute',
        prompt:
          'Le recruteur vous montre trois lignes : deux échecs de connexion pour le compte j.leroy depuis 198.51.100.40, à 9 h 01 et 9 h 02, puis une connexion réussie depuis la même adresse à 9 h 03, avec le code de double authentification validé. Expliquez votre raisonnement et votre conclusion.',
        expectations: [
          'Raisonner à voix haute, à partir des faits.',
          'Peu d’échecs, même adresse, code validé : faute de frappe probable.',
          'Conclure au faux positif probable, en vérifiant que l’adresse est bien l’adresse habituelle.',
          'Documenter la conclusion.',
        ],
      },
      {
        id: 'note-escalade',
        title: 'Note d’escalade en cinq lignes',
        prompt:
          'En cinq lignes, rédigez la note que vous enverriez au niveau 2 pour l’incident du laboratoire « Analyser des journaux d’authentification ».',
        expectations: [
          'Ce qui s’est passé, quand, et sur quel compte.',
          'Les indicateurs : adresse IP, actions de l’attaquant.',
          'La gravité, et pourquoi.',
          'Ce qui a déjà été fait, et ce qui est demandé.',
        ],
      },
    ],
    certifications: [
      {
        name: 'Certified in Cybersecurity (CC)',
        issuer: 'ISC2',
        note: 'Certification d’entrée sur les notions de base de la sécurité.',
      },
      {
        name: 'CompTIA Security+',
        issuer: 'CompTIA',
        note: 'Référence généraliste, souvent citée dans les offres de premier poste.',
      },
      {
        name: 'Blue Team Level 1 (BTL1)',
        issuer: 'Security Blue Team',
        note: 'Orientée pratique défensive : journaux, trafic réseau, e-mails suspects.',
      },
      {
        name: 'Microsoft Certified : Security Operations Analyst Associate (examen SC-200)',
        issuer: 'Microsoft',
        note: 'Centrée sur les outils de détection et de réponse de Microsoft.',
      },
      {
        name: 'CompTIA CySA+',
        issuer: 'CompTIA',
        note: 'Niveau intermédiaire, pour aller plus loin après une première expérience.',
      },
    ],
  },
};
