import { DatePipe, PercentPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATALOG, PATHS } from '../../content/catalog';
import { AccountProgress } from '../../core/progress/account-progress';
import { badges, experience } from '../../core/progress/achievements';
import { weeklyChallenge } from '../../core/progress/challenges';
import { summarizeProgress } from '../../core/progress/progress';
import { ProgressStore } from '../../core/progress/progress.store';
import { reviewItems } from '../../core/progress/review';
import { Icon } from '../../shared/icon/icon';
import { ProgressBar } from '../../shared/progress-bar/progress-bar';
import { LessonList } from '../lessons/lesson-list';

const LESSONS = PATHS.flatMap((path) => path.modules.flatMap((module) => module.lessons));

/** 80 → « 1 h 20 min », 45 → « 45 min ». */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

@Component({
  selector: 'ca-dashboard-page',
  imports: [RouterLink, DatePipe, PercentPipe, Icon, ProgressBar, LessonList],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {
  private readonly progress = inject(ProgressStore);
  protected readonly account = inject(AccountProgress);
  protected readonly fromAccount = this.progress.fromAccount;

  protected readonly summary = computed(() =>
    summarizeProgress(CATALOG, this.progress.state(), new Date()),
  );
  /** Trois leçons à réviser au plus : notions ratées d'abord, puis rappels espacés. */
  protected readonly reviews = computed(() => {
    const completed = new Set(
      this.summary()
        .lessons.filter((l) => l.status === 'completed')
        .map((l) => l.lesson.id),
    );
    return reviewItems(LESSONS, this.progress.state(), completed, new Date()).slice(0, 3);
  });
  protected readonly challenge = computed(() =>
    weeklyChallenge(this.summary(), this.progress.state(), new Date()),
  );
  protected readonly xp = computed(() => experience(this.summary(), this.progress.state()).total);
  protected readonly earnedBadges = computed(
    () => badges(this.summary(), this.progress.state()).filter((b) => b.earned).length,
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

  protected readonly duration = formatDuration;
}
