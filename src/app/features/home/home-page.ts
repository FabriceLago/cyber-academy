import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATALOG } from '../../content/outline.generated';
import { Analytics } from '../../core/analytics/analytics';
import { ProgressStore } from '../../core/progress/progress.store';
import { LEVELS } from '../lessons/lesson-list';

const LESSONS = CATALOG.paths.flatMap((path) => path.modules.flatMap((module) => module.lessons));
const MINUTES = LESSONS.map((lesson) => lesson.durationMinutes);

/** 200 → « 3 h 20 ». */
function hours(minutes: number): string {
  const rest = minutes % 60;
  return `${Math.floor(minutes / 60)} h${rest === 0 ? '' : ` ${rest}`}`;
}

/** Page d'accueil publique : ce que propose la plateforme, pour qui, et comment commencer. */
@Component({
  selector: 'ca-home-page',
  imports: [RouterLink],
  template: `
    <section class="hero" aria-labelledby="accueil-titre">
      <p class="eyebrow">Gratuit pour commencer · en français · à votre rythme</p>
      <h1 id="accueil-titre">Apprendre la cybersécurité en partant de zéro</h1>
      <p class="lead">
        Des leçons courtes, des laboratoires simulés et des quiz corrigés pour comprendre comment on
        protège un ordinateur, un réseau et des données, puis s’entraîner aux premiers gestes d’un
        analyste.
      </p>
      <p class="actions">
        @if (started()) {
          <a class="btn btn-primary" routerLink="/tableau-de-bord">Reprendre mon apprentissage</a>
        } @else {
          <a class="btn btn-primary" [routerLink]="['/lecons', firstLesson.id]">
            Commencer la première leçon
          </a>
        }
        <a class="btn btn-secondary" routerLink="/parcours">Voir les parcours</a>
      </p>
      <p class="muted">
        Sans compte, votre progression reste dans ce navigateur ; un compte gratuit la retrouve sur
        tous vos appareils.
      </p>
    </section>

    <ul class="stats" aria-label="La plateforme en chiffres">
      <li>
        <strong>{{ paths.length }}</strong> parcours
      </li>
      <li>
        <strong>{{ lessonCount }}</strong> leçons
      </li>
      <li>
        <strong>{{ labCount }}</strong> laboratoires simulés
      </li>
      <li>
        <strong>{{ totalTime }}</strong> de contenu
      </li>
    </ul>

    <section aria-labelledby="methode-titre">
      <h2 id="methode-titre">Comment on apprend</h2>
      <ul class="grid">
        <li class="card">
          <h3>Des leçons courtes</h3>
          <p>
            Explication, exemple concret, schéma et exercice guidé : de {{ shortest }} à
            {{ longest }} minutes par leçon.
          </p>
        </li>
        <li class="card">
          <h3>Des laboratoires simulés</h3>
          <p>
            Un terminal, une boîte de réception, des journaux : on pratique sur des systèmes et des
            données fictifs, sans rien risquer.
          </p>
        </li>
        <li class="card">
          <h3>Des quiz corrigés</h3>
          <p>
            Chaque réponse est expliquée. Les notions manquées reviennent en révision, avec des
            cartes mémoire et un examen blanc par parcours.
          </p>
        </li>
        <li class="card">
          <h3>Une progression visible</h3>
          <p>
            Compétences, badges et attestation de fin de parcours, qui n’est pas une certification
            professionnelle.
          </p>
        </li>
      </ul>
    </section>

    <section aria-labelledby="parcours-titre">
      <h2 id="parcours-titre">Les parcours</h2>
      <ul class="grid">
        @for (path of paths; track path.id) {
          <li class="card">
            <p class="eyebrow">
              {{ levels[path.level] }} · {{ path.premium ? 'Réservé aux abonnés' : 'Gratuit' }}
            </p>
            <h3>
              <a [routerLink]="['/parcours', path.id]">{{ path.title }}</a>
            </h3>
            <p>{{ path.description }}</p>
          </li>
        }
      </ul>
    </section>

    <section aria-labelledby="engagements-titre">
      <h2 id="engagements-titre">Nos engagements</h2>
      <ul class="commitments">
        <li>
          <strong>Honnêteté :</strong> une formation pour comprendre et pratiquer ; elle ne garantit
          pas un emploi.
        </li>
        <li>
          <strong>Sécurité :</strong> les exercices se font uniquement sur des cibles fictives et
          isolées.
        </li>
        <li>
          <strong>Vie privée :</strong>
          {{
            analytics.configured
              ? 'ni publicité, ni traqueur ; une mesure d’audience anonyme, sans cookies.'
              : 'ni publicité, ni mesure d’audience, ni traqueur.'
          }}
        </li>
        <li>
          <strong>Accessibilité :</strong> navigation au clavier, lecteurs d’écran, thème clair ou
          sombre, utilisable hors ligne une fois installée.
        </li>
      </ul>
    </section>

    <section class="card" aria-labelledby="glossaire-titre">
      <h2 id="glossaire-titre">Le glossaire</h2>
      <p>Chaque terme technique des leçons, défini simplement, avec un exemple.</p>
      <a routerLink="/glossaire">Parcourir le glossaire</a>
    </section>
  `,
  styles: `
    :host {
      display: grid;
      gap: var(--space-6);
    }

    .hero h1 {
      font-size: clamp(2rem, 5vw, 3rem);
      line-height: 1.1;
    }

    .lead {
      max-width: 42rem;
      font-size: var(--text-lg);
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
    }

    .muted {
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }

    .stats,
    .grid,
    .commitments {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 9rem), 1fr));
      gap: var(--space-3);
    }

    .stats li {
      padding: var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
    }

    .stats strong {
      display: block;
      font-family: var(--font-display);
      font-size: var(--text-2xl);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
      gap: var(--space-4);
    }

    .grid h3 {
      margin-top: 0;
    }

    .commitments {
      display: grid;
      gap: var(--space-2);
    }
  `,
})
export class HomePage {
  private readonly progress = inject(ProgressStore);
  protected readonly analytics = inject(Analytics);

  protected readonly paths = CATALOG.paths;
  protected readonly levels = LEVELS;
  protected readonly firstLesson = LESSONS[0];
  protected readonly lessonCount = LESSONS.length;
  protected readonly labCount = CATALOG.labs.length;
  protected readonly shortest = Math.min(...MINUTES);
  protected readonly longest = Math.max(...MINUTES);
  protected readonly totalTime = hours(MINUTES.reduce((sum, m) => sum + m, 0));

  /** Une tentative déjà faite (navigateur ou compte) : on propose de reprendre. */
  protected readonly started = computed(() => {
    const { quizAttempts, labAttempts } = this.progress.state();
    return quizAttempts.length + labAttempts.length > 0;
  });
}
