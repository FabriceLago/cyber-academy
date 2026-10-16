import { DatePipe, PercentPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATALOG } from '../../content/catalog';
import { LessonStatus, summarizeProgress } from '../../core/progress/progress';
import { ProgressStore } from '../../core/progress/progress.store';
import { Icon, IconName } from '../../shared/icon/icon';
import { ProgressBar } from '../../shared/progress-bar/progress-bar';

const STATUS: Record<LessonStatus, { readonly label: string; readonly icon: IconName }> = {
  completed: { label: 'Validée', icon: 'check' },
  'in-progress': { label: 'Commencée', icon: 'clock' },
  available: { label: 'Disponible', icon: 'circle' },
  locked: { label: 'Verrouillée', icon: 'lock' },
};

/** 80 → « 1 h 20 min », 45 → « 45 min ». */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

@Component({
  selector: 'ca-dashboard-page',
  imports: [RouterLink, DatePipe, PercentPipe, Icon, ProgressBar],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {
  private readonly progress = inject(ProgressStore);

  protected readonly summary = computed(() =>
    summarizeProgress(CATALOG, this.progress.state(), new Date()),
  );
  protected readonly globalRatio = computed(() => {
    const { completedLessons, lessons } = this.summary();
    return lessons.length === 0 ? 0 : completedLessons / lessons.length;
  });
  protected readonly passedQuizzes = computed(
    () => this.summary().quizResults.filter((result) => result.passed).length,
  );
  protected readonly completedLabs = computed(
    () => this.summary().labs.filter((lab) => lab.completed).length,
  );
  protected readonly acquiredSkills = computed(
    () => this.summary().skills.filter((skill) => skill.acquired).length,
  );

  protected readonly status = STATUS;
  protected readonly duration = formatDuration;
}
