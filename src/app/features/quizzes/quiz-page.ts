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
  untracked,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATALOG, findLesson } from '../../content/catalog';
import { QuizAttempt } from '../../core/models/progress.model';
import { quizScore, summarizeProgress } from '../../core/progress/progress';
import { ProgressStore } from '../../core/progress/progress.store';
import {
  Answer,
  PresentedQuestion,
  drawQuiz,
  initialAnswer,
  isAnswerComplete,
  isAnswerCorrect,
  objectivesToReview,
} from '../../core/quiz/quiz-engine';
import { Icon } from '../../shared/icon/icon';
import { AnswerInput } from './answer-input';

/**
 * Quiz d'une leçon : questions tirées au sort (différentes de la tentative précédente), envoi,
 * score immédiat, notions à revoir et correction détaillée. La tentative est enregistrée.
 */
@Component({
  selector: 'ca-quiz-page',
  imports: [RouterLink, PercentPipe, Icon, AnswerInput],
  templateUrl: './quiz-page.html',
  styleUrl: './quiz-page.css',
})
export class QuizPage {
  readonly lessonId = input.required<string>();

  private readonly progress = inject(ProgressStore);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private readonly title = viewChild<ElementRef<HTMLElement>>('title');
  private readonly resultHeading = viewChild<ElementRef<HTMLElement>>('resultHeading');
  private readonly errorSummary = viewChild<ElementRef<HTMLElement>>('errorSummary');

  protected readonly entry = computed(() => findLesson(this.lessonId()));
  private readonly summary = computed(() =>
    summarizeProgress(CATALOG, this.progress.state(), new Date()),
  );
  protected readonly lessonState = computed(() =>
    this.summary().lessons.find((l) => l.lesson.id === this.lessonId()),
  );
  protected readonly next = computed(() => {
    const lessons = this.summary().lessons;
    const index = lessons.findIndex((l) => l.lesson.id === this.lessonId());
    return index < 0 ? null : (lessons[index + 1] ?? null);
  });

  /** Incrémenté par « Recommencer » : provoque un nouveau tirage. */
  private readonly round = signal(0);
  protected readonly drawn = computed(() => {
    this.round();
    const entry = this.entry();
    if (!entry) return [];
    // Lu sans dépendance : enregistrer une tentative ne doit pas relancer le tirage en cours.
    const previous = untracked(
      () =>
        this.progress
          .state()
          .quizAttempts.filter((a) => a.lessonId === entry.lesson.id)
          .at(-1)?.questionIds ?? [],
    );
    return drawQuiz(entry.lesson.quiz, previous);
  });
  protected readonly answers = linkedSignal(
    () => new Map(this.drawn().map((p) => [p.question.id, initialAnswer(p)])),
  );
  protected readonly submitted = linkedSignal<QuizAttempt | null>(() => {
    this.drawn();
    return null;
  });
  /** Numéros des questions sans réponse lors d'un envoi refusé. */
  protected readonly missing = linkedSignal<number[]>(() => {
    this.drawn();
    return [];
  });

  protected readonly score = computed(() => {
    const attempt = this.submitted();
    return attempt ? quizScore(attempt) : 0;
  });
  protected readonly passed = computed(
    () => this.score() >= (this.entry()?.module.passThreshold ?? 1),
  );
  protected readonly review = computed(() => {
    const entry = this.entry();
    const attempt = this.submitted();
    return entry && attempt ? objectivesToReview(entry.lesson, attempt) : [];
  });

  protected answerOf(presented: PresentedQuestion): Answer | null {
    return this.answers().get(presented.question.id) ?? null;
  }

  protected isCorrect(presented: PresentedQuestion): boolean {
    return isAnswerCorrect(presented.question, this.answerOf(presented));
  }

  protected setAnswer(questionId: string, answer: Answer | null): void {
    this.answers.update((answers) => new Map(answers).set(questionId, answer));
  }

  protected submit(): void {
    const drawn = this.drawn();
    const missing = drawn
      .map((p, i) => (isAnswerComplete(p.question, this.answerOf(p)) ? 0 : i + 1))
      .filter((n) => n > 0);
    if (missing.length > 0) {
      this.missing.set(missing);
      this.focusAfterRender(() => this.errorSummary());
      return;
    }
    const attempt: QuizAttempt = {
      lessonId: this.lessonId(),
      submittedAt: new Date().toISOString(),
      questionIds: drawn.map((p) => p.question.id),
      correctQuestionIds: drawn.filter((p) => this.isCorrect(p)).map((p) => p.question.id),
    };
    this.progress.recordQuizAttempt(attempt);
    this.missing.set([]);
    this.submitted.set(attempt);
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
