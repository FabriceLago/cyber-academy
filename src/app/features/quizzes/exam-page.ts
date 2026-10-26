import { PercentPipe } from '@angular/common';
import {
  Component,
  DOCUMENT,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { PathEntry } from '../../content/content-loader';
import { CATALOG } from '../../content/outline.generated';
import { summarizeProgress } from '../../core/progress/progress';
import { ProgressStore } from '../../core/progress/progress.store';
import { ExamQuestion, drawExam, skillReport } from '../../core/quiz/exam';
import {
  Answer,
  initialAnswer,
  isAnswerComplete,
  isAnswerCorrect,
} from '../../core/quiz/quiz-engine';
import { SubscriptionService } from '../../core/subscription/subscription.service';
import { Icon } from '../../shared/icon/icon';
import { Paywall } from '../../shared/paywall/paywall';
import { ReportError } from '../../shared/report-error/report-error';
import { AnswerInput } from './answer-input';

/** Deux leçons peuvent avoir une question de même identifiant : la clé inclut la leçon. */
const keyOf = (item: ExamQuestion) => `${item.lesson.id}/${item.presented.question.id}`;

/**
 * Examen blanc d'un parcours : questions mélangées de toutes ses leçons, correction et bilan par
 * compétence. Ouvert quand toutes les leçons sont validées (ses questions sont celles des quiz).
 * Il n'est pas enregistré : ni progression, ni points.
 */
@Component({
  selector: 'ca-exam-page',
  imports: [RouterLink, PercentPipe, Icon, AnswerInput, Paywall, ReportError],
  template: `
    @if (exam(); as exam) {
      <nav class="crumbs" aria-label="Fil d’Ariane">
        <a [routerLink]="['/parcours', exam.path.id]">{{ exam.path.title }}</a> › Examen blanc
      </nav>
      <header class="page-header">
        <h1 #title tabindex="-1">Examen blanc : {{ exam.path.title }}</h1>
        <p>
          {{ drawn().length }} questions mélangées, tirées dans les {{ exam.lessons.length }}
          leçons du parcours. La correction et le bilan par compétence s’affichent après l’envoi.
          Cet examen n’est pas enregistré : il ne change ni votre progression ni vos points.
        </p>
      </header>

      @let s = status();
      @if (s.completed < s.total) {
        <section class="card" aria-labelledby="verrou">
          <h2 id="verrou">Examen blanc pas encore ouvert</h2>
          <p>
            Il s’ouvre quand les {{ s.total }} leçons du parcours sont validées :
            {{ s.completed }} sur {{ s.total }} pour l’instant. Ses questions reprennent celles des
            quiz : le passer avant dévoilerait leurs corrections.
          </p>
          <a class="btn btn-primary" [routerLink]="['/parcours', exam.path.id]">Voir le parcours</a>
        </section>
      } @else if (subscriptions.locked(exam.path)) {
        <ca-paywall [pathTitle]="exam.path.title" />
      } @else {
        @if (submitted()) {
          <section
            class="card result"
            [class.passed]="score() >= threshold()"
            aria-labelledby="resultat"
          >
            <h2 id="resultat" #resultHeading tabindex="-1">Résultat : {{ score() | percent }}</h2>
            <p>
              Bonnes réponses : {{ correctCount() }} sur {{ drawn().length }}. Repère :
              {{ threshold() | percent }}, le seuil de validation des quiz de ce parcours.
            </p>
            <h3>Bilan par compétence</h3>
            <ul class="skills">
              @for (row of report(); track row.skill.id) {
                <li>
                  <strong>{{ row.skill.title }}</strong> : {{ row.correct }} sur {{ row.total }}
                  @if (row.lessonsToReview.length > 0) {
                    · à revoir :
                    @for (lesson of row.lessonsToReview; track lesson.id; let last = $last) {
                      <a [routerLink]="['/lecons', lesson.id]">{{ lesson.title }}</a
                      >{{ last ? '' : ', ' }}
                    }
                  }
                </li>
              }
            </ul>
            <div class="actions">
              <button type="button" class="btn btn-primary" (click)="retry()">
                Repasser avec de nouvelles questions
              </button>
              <a class="btn btn-secondary" [routerLink]="['/parcours', exam.path.id]">
                Retour au parcours
              </a>
            </div>
          </section>
          <h2>Correction détaillée</h2>
        } @else if (missing().length > 0) {
          <div class="card errors" role="alert" tabindex="-1" #errorSummary>
            <p>
              <strong>Il reste {{ missing().length }} question(s) sans réponse :</strong>
              question(s) {{ missing().join(', ') }}.
            </p>
          </div>
        }

        <ol class="questions">
          @for (item of drawn(); track keyOf(item); let i = $index, count = $count) {
            <li class="card">
              <p class="number">
                Question {{ i + 1 }} sur {{ count }} · {{ item.lesson.title }}
                @if (submitted()) {
                  <span class="mark" [class.ok]="isCorrect(item)">
                    <ca-icon [name]="isCorrect(item) ? 'check' : 'close'" />
                    {{ isCorrect(item) ? 'Bonne réponse' : 'Réponse incorrecte' }}
                  </span>
                }
              </p>
              <ca-answer-input
                [presented]="item.presented"
                [answer]="answerOf(item)"
                (answerChange)="setAnswer(item, $event)"
                [corrected]="submitted()"
              />
              @if (submitted()) {
                <ca-report-error
                  [lessonId]="item.lesson.id"
                  [questionId]="item.presented.question.id"
                  [about]="'sur la question ' + (i + 1)"
                />
              }
            </li>
          }
        </ol>

        @if (!submitted()) {
          <button type="button" class="btn btn-primary" (click)="submit()">
            Envoyer mes réponses
          </button>
        }
      }
    } @else {
      <div class="status-page">
        <h1>Examen introuvable</h1>
        <p>Ce parcours n’existe pas, ou son adresse a changé.</p>
        <a class="btn btn-primary" routerLink="/quiz">Voir les quiz et examens</a>
      </div>
    }
  `,
  styleUrl: './quiz-page.css',
})
export class ExamPage {
  /** Parcours et contenu de ses leçons, chargés par la route (null si le parcours est inconnu). */
  readonly exam = input<PathEntry | null>(null);

  private readonly progress = inject(ProgressStore);
  protected readonly subscriptions = inject(SubscriptionService);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private readonly title = viewChild<ElementRef<HTMLElement>>('title');
  private readonly resultHeading = viewChild<ElementRef<HTMLElement>>('resultHeading');
  private readonly errorSummary = viewChild<ElementRef<HTMLElement>>('errorSummary');

  protected readonly keyOf = keyOf;

  /** Leçons du parcours validées, sur le total. */
  protected readonly status = computed(() => {
    const id = this.exam()?.path.id;
    const lessons = summarizeProgress(CATALOG, this.progress.state(), new Date()).lessons.filter(
      (l) => l.path.id === id,
    );
    return {
      completed: lessons.filter((l) => l.status === 'completed').length,
      total: lessons.length,
    };
  });
  /** Repère affiché : le seuil le plus exigeant parmi les modules du parcours. */
  protected readonly threshold = computed(() =>
    Math.max(0, ...(this.exam()?.path.modules ?? []).map((m) => m.passThreshold)),
  );

  /** Incrémenté par « Repasser » : provoque un nouveau tirage. */
  private readonly round = signal(0);
  protected readonly drawn = computed(() => {
    this.round();
    return drawExam(this.exam()?.lessons ?? []);
  });
  protected readonly answers = linkedSignal(
    () => new Map(this.drawn().map((item) => [keyOf(item), initialAnswer(item.presented)])),
  );
  protected readonly submitted = linkedSignal(() => {
    this.drawn();
    return false;
  });
  /** Numéros des questions sans réponse lors d'un envoi refusé. */
  protected readonly missing = linkedSignal<number[]>(() => {
    this.drawn();
    return [];
  });

  private readonly results = computed(() =>
    this.drawn().map((item) => ({ lesson: item.lesson, correct: this.isCorrect(item) })),
  );
  protected readonly correctCount = computed(() => this.results().filter((r) => r.correct).length);
  protected readonly score = computed(() =>
    this.drawn().length === 0 ? 0 : this.correctCount() / this.drawn().length,
  );
  protected readonly report = computed(() => skillReport(this.results(), CATALOG.skills));

  protected answerOf(item: ExamQuestion): Answer | null {
    return this.answers().get(keyOf(item)) ?? null;
  }

  protected isCorrect(item: ExamQuestion): boolean {
    return isAnswerCorrect(item.presented.question, this.answerOf(item));
  }

  protected setAnswer(item: ExamQuestion, answer: Answer | null): void {
    this.answers.update((answers) => new Map(answers).set(keyOf(item), answer));
  }

  protected submit(): void {
    const missing = this.drawn()
      .map((item, i) =>
        isAnswerComplete(item.presented.question, this.answerOf(item)) ? 0 : i + 1,
      )
      .filter((n) => n > 0);
    this.missing.set(missing);
    if (missing.length > 0) {
      this.focusAfterRender(() => this.errorSummary());
      return;
    }
    this.submitted.set(true);
    this.focusAfterRender(() => this.resultHeading());
  }

  protected retry(): void {
    this.round.update((n) => n + 1);
    this.document.defaultView?.scrollTo({ top: 0 });
    this.focusAfterRender(() => this.title());
  }

  private focusAfterRender(target: () => ElementRef<HTMLElement> | undefined): void {
    afterNextRender(() => target()?.nativeElement.focus(), { injector: this.injector });
  }
}
