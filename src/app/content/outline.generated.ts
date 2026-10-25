// Généré par scripts/generate-outline.mjs à partir de src/app/content : ne pas modifier à la
// main. Relancer « npm run content:outline » après chaque changement du contenu.
import { Catalog, LessonReview } from '../core/models/content.model';

/** Plan du catalogue : parcours, leçons, laboratoires et compétences, sans le contenu. */
export const CATALOG: Catalog = {
  "paths": [
    {
      "id": "decouverte",
      "title": "Découverte de la cybersécurité",
      "description": "Les bases pour comprendre un ordinateur, Internet et les principales menaces, sans aucun prérequis.",
      "level": "debutant",
      "modules": [
        {
          "id": "premiers-pas",
          "title": "Premiers pas avec l’ordinateur",
          "description": "Ce que contient un ordinateur, et comment lui parler avec un terminal.",
          "passThreshold": 0.8,
          "lessons": [
            {
              "id": "ordinateur-et-fichiers",
              "title": "Comprendre un ordinateur, ses fichiers et ses dossiers",
              "durationMinutes": 20,
              "prerequisiteIds": [],
              "skillIds": [
                "decrire-un-ordinateur"
              ]
            },
            {
              "id": "decouvrir-le-terminal",
              "title": "Découvrir le terminal",
              "durationMinutes": 25,
              "prerequisiteIds": [
                "ordinateur-et-fichiers"
              ],
              "labId": "lab-terminal",
              "skillIds": [
                "utiliser-un-terminal"
              ]
            }
          ]
        },
        {
          "id": "internet-et-menaces",
          "title": "Internet et menaces",
          "description": "Comment voyage une information, ce qu’il faut protéger, et comment repérer une arnaque.",
          "passThreshold": 0.8,
          "lessons": [
            {
              "id": "voyage-d-une-information",
              "title": "Comment une information voyage sur Internet",
              "durationMinutes": 25,
              "prerequisiteIds": [
                "ordinateur-et-fichiers"
              ],
              "skillIds": [
                "expliquer-le-reseau"
              ]
            },
            {
              "id": "securite-et-risques",
              "title": "Confidentialité, intégrité, disponibilité : évaluer un risque",
              "durationMinutes": 20,
              "prerequisiteIds": [
                "voyage-d-une-information"
              ],
              "skillIds": [
                "evaluer-un-risque"
              ]
            },
            {
              "id": "hameconnage",
              "title": "Repérer l’hameçonnage et l’ingénierie sociale",
              "durationMinutes": 25,
              "prerequisiteIds": [
                "securite-et-risques"
              ],
              "labId": "lab-phishing",
              "skillIds": [
                "detecter-l-hameconnage"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "culture-informatique",
      "title": "Niveau 1 : Culture informatique",
      "description": "Utiliser un ordinateur et ses comptes en sécurité : mises à jour, sauvegardes, fichiers et mots de passe. Niveau en cours de rédaction : une première leçon est disponible, les cinq autres suivront.",
      "level": "debutant",
      "prerequisitePathIds": [
        "decouverte"
      ],
      "modules": [
        {
          "id": "materiel-et-systemes",
          "title": "Matériel et systèmes",
          "description": "Garder son ordinateur à jour et mettre ses données à l’abri.",
          "passThreshold": 0.8,
          "lessons": [
            {
              "id": "mises-a-jour-et-sauvegardes",
              "title": "Mises à jour et sauvegardes",
              "durationMinutes": 25,
              "prerequisiteIds": [],
              "labId": "lab-sauvegarde",
              "skillIds": [
                "sauvegarder-ses-donnees"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "analyste-soc-junior",
      "title": "Analyste SOC junior",
      "description": "Spécialisation : surveiller, analyser et trier les événements de sécurité, comme un analyste de niveau 1.",
      "level": "intermediaire",
      "prerequisitePathIds": [
        "decouverte"
      ],
      "premium": true,
      "career": {
        "role": "Analyste SOC junior (niveau 1)",
        "summary": "L’analyste SOC de niveau 1 surveille les alertes, les trie, mène les premières vérifications et transmet les incidents confirmés aux niveaux supérieurs. Le poste demande de la rigueur, de la curiosité et une écriture claire.",
        "requiredSkills": [
          "Lire et filtrer des journaux d’événements",
          "Qualifier une alerte et estimer sa gravité",
          "Connaître les attaques courantes : hameçonnage, force brute, logiciels malveillants",
          "Bases réseau : adresses IP, ports, DNS, HTTP",
          "Rédiger une note d’incident claire et factuelle",
          "Utiliser un SIEM : recherches et tableaux de bord (à pratiquer sur des environnements d’entraînement)"
        ],
        "prerequisites": [
          "Le parcours « Découverte de la cybersécurité » validé",
          "Être à l’aise avec le terminal et les fichiers",
          "Aucune expérience professionnelle n’est exigée pour suivre ce parcours"
        ],
        "upcoming": [
          "SIEM et corrélation d’événements",
          "Indicateurs de compromission (IOC)",
          "Réponse à incident",
          "Introduction à MITRE ATT&CK",
          "Documentation et rapports"
        ],
        "finalProject": {
          "title": "Rapport d’incident : une nuit agitée sur le VPN",
          "brief": "À partir du laboratoire « Analyser des journaux d’authentification », rédigez le rapport d’incident que vous transmettriez au niveau 2. Quelqu’un qui n’a pas vu les journaux doit comprendre ce qui s’est passé et quoi faire.",
          "deliverables": [
            "Un résumé en trois phrases",
            "La chronologie des événements, avec les heures et les sources",
            "Les indicateurs de compromission : adresse IP, compte, actions",
            "La gravité retenue, justifiée par l’impact et l’étendue",
            "Les actions immédiates et les recommandations, par ordre de priorité"
          ],
          "criteria": [
            "Les faits sont exacts et vérifiables dans les journaux",
            "La chronologie est complète et dans l’ordre",
            "Les faits sont séparés des hypothèses",
            "La gravité est justifiée par l’impact et l’étendue",
            "Les recommandations sont concrètes et classées par priorité",
            "Le texte se lit sans connaître les journaux"
          ]
        },
        "interviewQuestions": [
          {
            "id": "faux-positif",
            "title": "Vrai ou faux positif",
            "prompt": "Quelle est la différence entre un faux positif et un vrai positif ? Donnez un exemple.",
            "expectations": [
              "Un faux positif est une alerte sans activité malveillante réelle ; un vrai positif correspond à une vraie menace.",
              "Un exemple concret : une faute de frappe isolée, face à une série d’échecs suivie d’une connexion réussie.",
              "Les faits qui permettent de trancher : adresse habituelle, nombre d’échecs, réussite, actions ensuite."
            ]
          },
          {
            "id": "cinquante-alertes",
            "title": "Cinquante alertes",
            "prompt": "Vous trouvez 50 alertes en début de poste. Comment les traitez-vous ?",
            "expectations": [
              "Prioriser selon la gravité et l’importance des systèmes touchés.",
              "Regrouper les alertes liées à un même événement.",
              "Documenter chaque décision.",
              "Escalader sans attendre ce qui est grave ou incertain."
            ]
          },
          {
            "id": "force-brute",
            "title": "La force brute",
            "prompt": "Qu’est-ce qu’une attaque par force brute, et comment la repère-t-on dans des journaux ?",
            "expectations": [
              "De nombreux essais de mots de passe.",
              "Beaucoup d’échecs depuis une même source en peu de temps, parfois sur plusieurs comptes.",
              "Le signal fort : une connexion réussie juste après les échecs.",
              "Les protections : double authentification, verrouillage, limitation du nombre d’essais."
            ]
          },
          {
            "id": "documentation",
            "title": "Pourquoi documenter",
            "prompt": "Pourquoi la documentation est-elle si importante dans un SOC ?",
            "expectations": [
              "Pour que l’équipe suivante ou le niveau 2 reprenne le dossier sans tout refaire.",
              "Pour garder la trace des preuves et des décisions.",
              "Pour améliorer les règles de détection.",
              "Pour répondre aux obligations légales et contractuelles."
            ]
          }
        ],
        "interviewExercises": [
          {
            "id": "triage-voix-haute",
            "title": "Triage à voix haute",
            "prompt": "Le recruteur vous montre trois lignes : deux échecs de connexion pour le compte j.leroy depuis 198.51.100.40, à 9 h 01 et 9 h 02, puis une connexion réussie depuis la même adresse à 9 h 03, avec le code de double authentification validé. Expliquez votre raisonnement et votre conclusion.",
            "expectations": [
              "Raisonner à voix haute, à partir des faits.",
              "Peu d’échecs, même adresse, code validé : faute de frappe probable.",
              "Conclure au faux positif probable, en vérifiant que l’adresse est bien l’adresse habituelle.",
              "Documenter la conclusion."
            ]
          },
          {
            "id": "note-escalade",
            "title": "Note d’escalade en cinq lignes",
            "prompt": "En cinq lignes, rédigez la note que vous enverriez au niveau 2 pour l’incident du laboratoire « Analyser des journaux d’authentification ».",
            "expectations": [
              "Ce qui s’est passé, quand, et sur quel compte.",
              "Les indicateurs : adresse IP, actions de l’attaquant.",
              "La gravité, et pourquoi.",
              "Ce qui a déjà été fait, et ce qui est demandé."
            ]
          }
        ],
        "certifications": [
          {
            "name": "Certified in Cybersecurity (CC)",
            "issuer": "ISC2",
            "note": "Certification d’entrée sur les notions de base de la sécurité."
          },
          {
            "name": "CompTIA Security+",
            "issuer": "CompTIA",
            "note": "Référence généraliste, souvent citée dans les offres de premier poste."
          },
          {
            "name": "Blue Team Level 1 (BTL1)",
            "issuer": "Security Blue Team",
            "note": "Orientée pratique défensive : journaux, trafic réseau, e-mails suspects."
          },
          {
            "name": "Microsoft Certified : Security Operations Analyst Associate (examen SC-200)",
            "issuer": "Microsoft",
            "note": "Centrée sur les outils de détection et de réponse de Microsoft."
          },
          {
            "name": "CompTIA CySA+",
            "issuer": "CompTIA",
            "note": "Niveau intermédiaire, pour aller plus loin après une première expérience."
          }
        ]
      },
      "modules": [
        {
          "id": "metier-analyste-soc",
          "title": "Le métier d’analyste SOC",
          "description": "Ce que fait un SOC, comment lire des journaux et trier une alerte.",
          "passThreshold": 0.8,
          "lessons": [
            {
              "id": "soc-et-journaux",
              "title": "Le SOC et les journaux de sécurité",
              "durationMinutes": 30,
              "prerequisiteIds": [],
              "skillIds": [
                "analyser-des-journaux"
              ]
            },
            {
              "id": "trier-une-alerte",
              "title": "Trier une alerte de sécurité",
              "durationMinutes": 30,
              "prerequisiteIds": [
                "soc-et-journaux"
              ],
              "labId": "lab-journaux",
              "skillIds": [
                "trier-des-alertes"
              ]
            }
          ]
        }
      ]
    }
  ],
  "labs": [
    {
      "id": "lab-terminal",
      "kind": "terminal",
      "title": "Explorer un système de fichiers dans un terminal simulé",
      "skillIds": [
        "utiliser-un-terminal"
      ],
      "scenario": "Vous rejoignez l’équipe de sécurité de Société Exemple. Votre responsable a déposé un rapport d’incident dans vos documents, sur le serveur cyberlab. Retrouvez-le, lisez-le, puis préparez un dossier de travail pour l’enquête."
    },
    {
      "id": "lab-phishing",
      "kind": "phishing",
      "title": "Démasquer un e-mail d’hameçonnage",
      "skillIds": [
        "detecter-l-hameconnage"
      ],
      "scenario": "Lundi matin, votre boîte de réception contient cinq messages. Certains sont des pièges, d’autres sont parfaitement normaux. Analysez-les un par un : signalez les éléments suspects, puis donnez votre verdict."
    },
    {
      "id": "lab-journaux",
      "kind": "logs",
      "title": "Analyser des journaux d’authentification",
      "skillIds": [
        "analyser-des-journaux",
        "trier-des-alertes"
      ],
      "scenario": "Lundi 14 octobre, 8 h 30. L’outil de surveillance de Société Exemple a levé une alerte : « Nombreux échecs de connexion sur le VPN cette nuit ». Vous êtes analyste SOC de niveau 1 : examinez les journaux du VPN et du serveur de fichiers, puis qualifiez l’alerte."
    },
    {
      "id": "lab-sauvegarde",
      "kind": "terminal",
      "title": "Ranger, copier et sauvegarder des fichiers",
      "skillIds": [
        "sauvegarder-ses-donnees"
      ],
      "scenario": "Léa vous confie son ordinateur portable : son mémoire de fin d’études n’existe qu’en un seul exemplaire. Elle a branché une clé USB, visible dans /media/cle-usb, et laissé ses consignes dans un fichier caché de son dossier personnel. Rangez ses fichiers, puis faites la sauvegarde."
    }
  ],
  "skills": [
    {
      "id": "decrire-un-ordinateur",
      "title": "Décrire un ordinateur",
      "description": "Nommer les pièces d’un ordinateur, leur rôle, et l’organisation des fichiers en dossiers."
    },
    {
      "id": "utiliser-un-terminal",
      "title": "Utiliser un terminal",
      "description": "Se déplacer dans les dossiers, lire et créer des fichiers avec des commandes de base."
    },
    {
      "id": "expliquer-le-reseau",
      "title": "Expliquer le trajet d’une information",
      "description": "Décrire le rôle d’une adresse IP, du DNS et des équipements traversés par un paquet."
    },
    {
      "id": "evaluer-un-risque",
      "title": "Évaluer un risque",
      "description": "Distinguer menace, vulnérabilité et risque, et relier un incident à la confidentialité, l’intégrité ou la disponibilité."
    },
    {
      "id": "detecter-l-hameconnage",
      "title": "Détecter l’hameçonnage",
      "description": "Repérer les indices d’un faux message et savoir comment réagir."
    },
    {
      "id": "analyser-des-journaux",
      "title": "Analyser des journaux",
      "description": "Lire des journaux d’événements, les filtrer et relier les événements pour reconstituer ce qui s’est passé."
    },
    {
      "id": "trier-des-alertes",
      "title": "Trier une alerte",
      "description": "Qualifier une alerte, estimer sa gravité et décider d’une escalade, en documentant ses conclusions."
    },
    {
      "id": "sauvegarder-ses-donnees",
      "title": "Sauvegarder ses données",
      "description": "Installer les mises à jour sans tarder, ranger ses fichiers et les sauvegarder selon la règle 3-2-1."
    }
  ]
};

/** Objectifs de chaque leçon et objectif évalué par chaque question, pour les révisions. */
export const REVIEW_INDEX: Readonly<Record<string, LessonReview>> = {
  "ordinateur-et-fichiers": {
    "objectives": [
      {
        "id": "o1",
        "text": "Associer chaque pièce principale d’un ordinateur à son rôle"
      },
      {
        "id": "o2",
        "text": "Distinguer la mémoire vive du stockage"
      },
      {
        "id": "o3",
        "text": "Lire le chemin et l’extension d’un fichier pour savoir où il est et ce qu’il contient"
      }
    ],
    "questionObjectives": {
      "q1": "o1",
      "q2": "o1",
      "q3": "o1",
      "q4": "o2",
      "q5": "o2",
      "q6": "o2",
      "q7": "o3",
      "q8": "o3",
      "q9": "o3",
      "q10": "o3"
    }
  },
  "decouvrir-le-terminal": {
    "objectives": [
      {
        "id": "o1",
        "text": "Expliquer ce qu’est un terminal et lire son invite de commande"
      },
      {
        "id": "o2",
        "text": "Utiliser pwd, ls et cd pour se repérer et se déplacer dans les dossiers"
      },
      {
        "id": "o3",
        "text": "Lire et créer des fichiers avec cat, mkdir et touch"
      }
    ],
    "questionObjectives": {
      "q1": "o1",
      "q2": "o1",
      "q3": "o1",
      "q4": "o1",
      "q5": "o2",
      "q6": "o2",
      "q7": "o2",
      "q8": "o2",
      "q9": "o3",
      "q10": "o3"
    }
  },
  "voyage-d-une-information": {
    "objectives": [
      {
        "id": "o1",
        "text": "Décrire le rôle d’une adresse IP et reconnaître une adresse IPv4 valable"
      },
      {
        "id": "o2",
        "text": "Expliquer comment le DNS traduit un nom de domaine en adresse IP"
      },
      {
        "id": "o3",
        "text": "Ordonner les étapes du trajet d’une page web, de l’ordinateur au serveur"
      }
    ],
    "questionObjectives": {
      "q1": "o1",
      "q2": "o1",
      "q3": "o1",
      "q4": "o2",
      "q5": "o2",
      "q6": "o2",
      "q7": "o3",
      "q8": "o3",
      "q9": "o3",
      "q10": "o3"
    }
  },
  "securite-et-risques": {
    "objectives": [
      {
        "id": "o1",
        "text": "Relier un incident à la confidentialité, à l’intégrité ou à la disponibilité"
      },
      {
        "id": "o2",
        "text": "Distinguer une menace, une vulnérabilité et un risque"
      },
      {
        "id": "o3",
        "text": "Proposer une mesure de protection adaptée à un risque"
      }
    ],
    "questionObjectives": {
      "q1": "o1",
      "q2": "o1",
      "q3": "o1",
      "q4": "o2",
      "q5": "o2",
      "q6": "o2",
      "q7": "o3",
      "q8": "o3",
      "q9": "o3",
      "q10": "o3"
    }
  },
  "hameconnage": {
    "objectives": [
      {
        "id": "o1",
        "text": "Identifier les indices d’un message d’hameçonnage"
      },
      {
        "id": "o2",
        "text": "Vérifier la véritable adresse d’un lien avant de cliquer"
      },
      {
        "id": "o3",
        "text": "Appliquer les bons réflexes face à un message suspect"
      }
    ],
    "questionObjectives": {
      "q1": "o1",
      "q2": "o1",
      "q3": "o1",
      "q4": "o1",
      "q5": "o2",
      "q6": "o2",
      "q7": "o2",
      "q8": "o3",
      "q9": "o3",
      "q10": "o3"
    }
  },
  "mises-a-jour-et-sauvegardes": {
    "objectives": [
      {
        "id": "o1",
        "text": "Expliquer pourquoi une mise à jour de sécurité doit être installée sans tarder"
      },
      {
        "id": "o2",
        "text": "Appliquer la règle 3-2-1 pour organiser ses sauvegardes"
      },
      {
        "id": "o3",
        "text": "Utiliser ls -a, mv et cp -r pour ranger et copier des fichiers"
      }
    ],
    "questionObjectives": {
      "q1": "o1",
      "q2": "o1",
      "q3": "o1",
      "q4": "o2",
      "q5": "o2",
      "q6": "o2",
      "q7": "o2",
      "q8": "o3",
      "q9": "o3",
      "q10": "o3"
    }
  },
  "soc-et-journaux": {
    "objectives": [
      {
        "id": "o1",
        "text": "Décrire le rôle d’un SOC et des analystes de niveau 1, 2 et 3"
      },
      {
        "id": "o2",
        "text": "Identifier les champs d’une ligne de journal : date, source, événement, compte, adresse"
      },
      {
        "id": "o3",
        "text": "Repérer dans un journal un enchaînement d’événements suspect"
      }
    ],
    "questionObjectives": {
      "q1": "o1",
      "q2": "o1",
      "q3": "o1",
      "q4": "o2",
      "q5": "o2",
      "q6": "o2",
      "q7": "o3",
      "q8": "o3",
      "q9": "o3",
      "q10": "o3"
    }
  },
  "trier-une-alerte": {
    "objectives": [
      {
        "id": "o1",
        "text": "Distinguer un vrai positif d’un faux positif à partir des faits"
      },
      {
        "id": "o2",
        "text": "Évaluer la gravité d’une alerte selon l’impact et l’étendue"
      },
      {
        "id": "o3",
        "text": "Rédiger une note de triage et décider d’une escalade"
      }
    ],
    "questionObjectives": {
      "q1": "o1",
      "q2": "o1",
      "q3": "o1",
      "q4": "o1",
      "q5": "o2",
      "q6": "o2",
      "q7": "o2",
      "q8": "o3",
      "q9": "o3",
      "q10": "o3"
    }
  }
};
