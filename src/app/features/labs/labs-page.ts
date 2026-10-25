import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATALOG } from '../../content/outline.generated';
import { summarizeProgress } from '../../core/progress/progress';
import { ProgressStore } from '../../core/progress/progress.store';
import { LAB_KINDS } from './lab-page';

/** Le Cyber Lab : tous les laboratoires, leur état et l'accès à chacun. */
@Component({
  selector: 'ca-labs-page',
  imports: [RouterLink, DatePipe],
  template: `
    <header class="page-header">
      <h1>Laboratoires</h1>
      <p>
        Le Cyber Lab : des exercices pratiques dans des environnements simulés. Rien n’y est exécuté
        pour de vrai et toutes les données sont fictives : vous pouvez essayer sans risque.
      </p>
    </header>

    <ul class="labs">
      @for (row of rows(); track row.lab.id) {
        <li class="card">
          <p class="kind eyebrow">{{ kinds[row.lab.kind].label }}</p>
          <h2>{{ row.lab.title }}</h2>
          <p>{{ row.lab.scenario }}</p>
          <p class="muted">
            {{ row.statusLabel }}
            @if (row.attempts > 0) {
              · Tentatives : {{ row.attempts }} · Dernière : {{ row.lastAt | date: 'd MMMM' }}
            }
          </p>
          @if (row.locked) {
            <p class="muted">Accessible après la leçon « {{ row.blockedBy }} ».</p>
          } @else {
            <a class="btn btn-primary" [routerLink]="['/laboratoires', row.lab.id]">
              {{ row.completed ? 'Refaire le laboratoire' : 'Ouvrir le laboratoire' }}
            </a>
          }
        </li>
      }
    </ul>

    <section class="card" aria-labelledby="a-venir">
      <h2 id="a-venir">Prochains laboratoires</h2>
      <p class="muted">
        Prévus après la première version (MVP), ils ne sont pas encore disponibles : analyseur de
        journaux, réseau virtuel interactif, console SIEM pédagogique. Les exercices qui exigeront
        d’exécuter de vrais outils se feront dans un environnement séparé et isolé.
      </p>
    </section>
  `,
  styles: `
    .labs {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
      gap: var(--space-4);
      margin: 0 0 var(--space-5);
      padding: 0;
      list-style: none;
    }

    .labs h2 {
      font-size: var(--text-lg);
    }

    .kind {
      margin: 0;
      color: var(--color-accent);
      font-size: var(--text-sm);
      font-weight: 700;
    }

    .muted {
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }
  `,
})
export class LabsPage {
  private readonly progress = inject(ProgressStore);

  protected readonly kinds = LAB_KINDS;
  protected readonly rows = computed(() => {
    const state = this.progress.state();
    const summary = summarizeProgress(CATALOG, state, new Date());
    return CATALOG.labs.map((lab) => {
      const lesson = summary.lessons.find((l) => l.lesson.labId === lab.id);
      const completed = summary.labs.find((l) => l.lab.id === lab.id)?.completed ?? false;
      const attempts = state.labAttempts.filter((a) => a.labId === lab.id);
      return {
        lab,
        completed,
        attempts: attempts.length,
        lastAt: attempts.at(-1)?.completedAt ?? null,
        locked: lesson?.status === 'locked',
        blockedBy: lesson?.blockedBy[0]?.title ?? '',
        statusLabel: completed
          ? 'Réussi'
          : attempts.length > 0
            ? 'Pas encore réussi'
            : 'Pas encore tenté',
      };
    });
  });
}
