import { DatePipe, PercentPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATALOG, REVIEW_INDEX } from '../../content/outline.generated';
import { summarizeProgress } from '../../core/progress/progress';
import { ProgressStore } from '../../core/progress/progress.store';
import { objectivesToReview } from '../../core/quiz/quiz-engine';

/** Tous les quiz : résultats, notions à revoir et accès à chaque quiz. */
@Component({
  selector: 'ca-quizzes-page',
  imports: [RouterLink, DatePipe, PercentPipe],
  template: `
    <header class="page-header">
      <h1>Quiz et examens</h1>
      <p>
        Chaque leçon se termine par un quiz corrigé. À chaque nouvelle tentative, les questions
        changent.
      </p>
    </header>

    <ul class="quizzes">
      @for (row of rows(); track row.lesson.id) {
        <li class="card">
          <h2>{{ row.lesson.title }}</h2>
          <p class="muted">
            {{ row.statusLabel }}
            @if (row.result; as result) {
              · Meilleur score : {{ result.bestScore | percent }} · Tentatives :
              {{ result.attempts }} · Dernière : {{ result.lastAttemptAt | date: 'd MMMM' }}
            }
          </p>
          @if (row.review.length > 0) {
            <p>
              <strong>Notions à revoir :</strong>
              @for (objective of row.review; track objective.id; let last = $last) {
                {{ objective.text }}{{ last ? '.' : ' ;' }}
              }
            </p>
          }
          @if (row.locked) {
            <p class="muted">Quiz accessible après la leçon « {{ row.blockedBy }} ».</p>
          } @else {
            <a class="btn btn-secondary" [routerLink]="['/lecons', row.lesson.id, 'quiz']">
              {{ row.result ? 'Retenter le quiz' : 'Passer le quiz' }}
            </a>
          }
        </li>
      }
    </ul>

    <section class="card" aria-labelledby="examens">
      <h2 id="examens">Évaluations de fin de module et examens blancs</h2>
      <p class="muted">
        Prévus après la première version (MVP) : ils ne sont pas encore disponibles.
      </p>
    </section>
  `,
  styles: `
    .quizzes {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
      gap: var(--space-4);
      margin: 0 0 var(--space-5);
      padding: 0;
      list-style: none;
    }

    .quizzes h2 {
      font-size: var(--text-lg);
    }

    .muted {
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }
  `,
})
export class QuizzesPage {
  private readonly progress = inject(ProgressStore);

  protected readonly rows = computed(() => {
    const state = this.progress.state();
    const summary = summarizeProgress(CATALOG, state, new Date());
    return CATALOG.paths
      .flatMap((path) => path.modules.flatMap((module) => module.lessons))
      .map((lesson) => {
        const progress = summary.lessons.find((l) => l.lesson.id === lesson.id);
        const result = summary.quizResults.find((r) => r.lesson.id === lesson.id) ?? null;
        const last = state.quizAttempts.filter((a) => a.lessonId === lesson.id).at(-1);
        return {
          lesson,
          result,
          locked: progress?.status === 'locked',
          blockedBy: progress?.blockedBy[0]?.title ?? '',
          statusLabel: result ? (result.passed ? 'Réussi' : 'À retenter') : 'Pas encore tenté',
          review: last ? objectivesToReview(REVIEW_INDEX[lesson.id], last) : [],
        };
      });
  });
}
