import { DatePipe, PercentPipe } from '@angular/common';
import {
  Component,
  DOCUMENT,
  ElementRef,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATALOG, findLesson } from '../../content/catalog';
import { Lesson, Level } from '../../core/models/content.model';
import { quizScore, summarizeProgress } from '../../core/progress/progress';
import { ProgressStore } from '../../core/progress/progress.store';
import { presentQuestion } from '../../core/quiz/quiz-engine';
import { Icon } from '../../shared/icon/icon';
import { LESSON_STATUS } from './lesson-list';
import { PracticeQuestion } from './practice-question';

const LEVELS: Record<Level, string> = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
};

const CALLOUTS = { info: 'À savoir', tip: 'Astuce', warning: 'Attention' } as const;

/** « Étape 1 : … Étape 2 : … » → une étape par élément de liste. */
function splitSteps(text: string): string[] {
  return text.split(/\s*Étape \d+ : /).filter((step) => step.trim() !== '');
}

/** Page d'une leçon : les 17 sections du modèle pédagogique, ou l'explication du verrouillage. */
@Component({
  selector: 'ca-lesson-page',
  imports: [RouterLink, DatePipe, PercentPipe, Icon, PracticeQuestion],
  templateUrl: './lesson-page.html',
  styleUrl: './lesson-page.css',
})
export class LessonPage {
  readonly lessonId = input.required<string>();

  private readonly progress = inject(ProgressStore);
  private readonly document = inject(DOCUMENT);
  private readonly title = viewChild<ElementRef<HTMLElement>>('title');
  private readonly summary = computed(() =>
    summarizeProgress(CATALOG, this.progress.state(), new Date()),
  );

  protected readonly entry = computed(() => findLesson(this.lessonId()));
  protected readonly state = computed(() =>
    this.summary().lessons.find((l) => l.lesson.id === this.lessonId()),
  );
  protected readonly next = computed(() => {
    const lessons = this.summary().lessons;
    const index = lessons.findIndex((l) => l.lesson.id === this.lessonId());
    return index < 0 ? null : (lessons[index + 1] ?? null);
  });
  protected readonly prerequisites = computed(() =>
    (this.entry()?.lesson.prerequisiteIds ?? [])
      .map((id) => findLesson(id)?.lesson)
      .filter((lesson): lesson is Lesson => lesson !== undefined),
  );
  protected readonly lab = computed(() => {
    const id = this.entry()?.lesson.labId;
    return id === undefined ? null : (this.summary().labs.find((l) => l.lab.id === id) ?? null);
  });
  protected readonly quizResult = computed(
    () => this.summary().quizResults.find((r) => r.lesson.id === this.lessonId()) ?? null,
  );
  /** Historique des tentatives au quiz, de la plus récente à la plus ancienne. */
  protected readonly attempts = computed(() =>
    this.progress
      .state()
      .quizAttempts.filter((a) => a.lessonId === this.lessonId())
      .map((a) => ({ at: a.submittedAt, score: quizScore(a) }))
      .reverse(),
  );
  protected readonly animationSteps = computed(() =>
    splitSteps(this.entry()?.lesson.animation.textAlternative ?? ''),
  );

  /** Incrémenté par « Recommencer » : recrée les exercices guidés. */
  private readonly run = signal(0);
  protected readonly guidedSteps = computed(() =>
    (this.entry()?.lesson.guidedExercise.steps ?? []).map((step) => ({
      key: `${this.lessonId()}:${this.run()}:${step.question.id}`,
      presented: presentQuestion(step.question),
      hints: step.hints,
    })),
  );

  protected readonly sections = computed(() => [
    { id: 'objectifs', label: 'Objectifs' },
    { id: 'explication', label: 'Explication' },
    { id: 'glossaire', label: 'Glossaire' },
    { id: 'exemple', label: 'Exemple concret' },
    { id: 'animation', label: 'Animation' },
    { id: 'demonstration', label: 'Démonstration' },
    { id: 'exercice', label: 'Exercice guidé' },
    ...(this.lab() ? [{ id: 'laboratoire', label: 'Laboratoire' }] : []),
    { id: 'quiz', label: 'Quiz de validation' },
    { id: 'resume', label: 'Résumé' },
    { id: 'criteres', label: 'Critères de réussite' },
  ]);

  protected readonly levels = LEVELS;
  protected readonly callouts = CALLOUTS;
  protected readonly statuses = LESSON_STATUS;

  /** Lien du sommaire : place le focus sur le titre de la section (lien « # » sans routeur). */
  protected goTo(event: Event, id: string): void {
    event.preventDefault();
    this.document.getElementById(`${id}-titre`)?.focus();
  }

  protected restart(): void {
    this.run.update((n) => n + 1);
    this.document.defaultView?.scrollTo({ top: 0 });
    this.title()?.nativeElement.focus();
  }
}
