import { Component, DOCUMENT, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { PercentPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CATALOG, findPath } from '../../content/catalog';
import { AuthService } from '../../core/auth/auth.service';
import {
  EMPTY_DRAFT,
  parseDraft,
  portfolioMarkdown,
  ProjectDraft,
} from '../../core/progress/portfolio';
import { summarizeProgress } from '../../core/progress/progress';
import { ProgressStore } from '../../core/progress/progress.store';
import { Icon } from '../../shared/icon/icon';
import { ProgressBar } from '../../shared/progress-bar/progress-bar';
import { LEVELS, LessonList } from '../lessons/lesson-list';

/**
 * Page d'un parcours : modules et leçons, et pour une spécialisation, la fiche métier, le
 * projet final (brouillon gardé dans ce navigateur, export du portfolio) et l'entraînement
 * aux entretiens.
 */
@Component({
  selector: 'ca-path-page',
  imports: [RouterLink, PercentPipe, Icon, ProgressBar, LessonList],
  templateUrl: './path-page.html',
  styleUrl: './path-page.css',
})
export class PathPage {
  readonly pathId = input.required<string>();

  private readonly progress = inject(ProgressStore);
  private readonly auth = inject(AuthService);
  private readonly document = inject(DOCUMENT);

  protected readonly levels = LEVELS;
  protected readonly path = computed(() => findPath(this.pathId()));
  protected readonly career = computed(() => this.path()?.career ?? null);
  protected readonly interview = computed(() => {
    const career = this.career();
    return career
      ? [
          { title: 'Questions fréquentes', items: career.interviewQuestions },
          { title: 'Mises en situation', items: career.interviewExercises },
        ]
      : [];
  });

  private readonly summary = computed(() =>
    summarizeProgress(CATALOG, this.progress.state(), new Date()),
  );
  protected readonly overview = computed(() =>
    this.summary().paths.find((p) => p.path.id === this.pathId()),
  );
  protected readonly modules = computed(() => {
    const overview = this.overview();
    return (this.path()?.modules ?? []).map((module) => ({
      module,
      lessons: overview?.lessons.filter((l) => l.module.id === module.id) ?? [],
    }));
  });
  /** Parcours prérequis pas encore terminés, avec le nombre de leçons restantes. */
  protected readonly missing = computed(() =>
    (this.path()?.prerequisitePathIds ?? []).flatMap((id) => {
      const required = this.summary().paths.find((p) => p.path.id === id);
      const remaining = required ? required.lessons.length - required.completed : 0;
      return required && remaining > 0 ? [{ path: required.path, remaining }] : [];
    }),
  );

  private readonly storageKey = computed(() => `ca-projet-${this.pathId()}`);
  protected readonly draft = linkedSignal(() => {
    const criteria = this.career()?.finalProject.criteria ?? [];
    try {
      return parseDraft(
        this.document.defaultView?.localStorage.getItem(this.storageKey()) ?? null,
        criteria,
      );
    } catch {
      return EMPTY_DRAFT; // Stockage bloqué : le brouillon vaut pour cette visite.
    }
  });
  protected readonly exported = linkedSignal(() => {
    this.pathId();
    return '';
  });

  /** Questions d'entretien auxquelles l'apprenant a répondu : leurs éléments attendus s'affichent. */
  protected readonly answered = linkedSignal<ReadonlySet<string>>(() => {
    this.pathId();
    return new Set();
  });
  /** Question soumise sans réponse : on demande d'écrire d'abord. */
  protected readonly empty = signal<string | null>(null);

  protected setReport(report: string): void {
    this.saveDraft({ ...this.draft(), report });
  }

  protected toggle(criterion: string, checked: boolean): void {
    const rest = this.draft().checked.filter((c) => c !== criterion);
    this.saveDraft({ ...this.draft(), checked: checked ? [...rest, criterion] : rest });
  }

  protected reveal(id: string, answer: string): void {
    if (answer.trim() === '') {
      this.empty.set(id);
      return;
    }
    this.empty.set(null);
    this.answered.update((ids) => new Set(ids).add(id));
  }

  protected exportPortfolio(): void {
    const path = this.path();
    if (!path) return;
    const text = portfolioMarkdown({
      path,
      summary: this.summary(),
      report: this.draft().report,
      checked: this.draft().checked,
      learner: this.auth.profile()?.displayName ?? null,
      date: new Date(),
    });
    const name = `portfolio-${path.id}.md`;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
    const link = this.document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url));
    this.exported.set(name);
  }

  private saveDraft(draft: ProjectDraft): void {
    this.draft.set(draft);
    this.exported.set('');
    try {
      this.document.defaultView?.localStorage.setItem(this.storageKey(), JSON.stringify(draft));
    } catch {
      // Stockage indisponible : le brouillon vaut pour cette visite.
    }
  }
}
