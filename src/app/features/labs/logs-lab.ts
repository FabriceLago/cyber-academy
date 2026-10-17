import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  LogFilter,
  NO_FILTER,
  distinctValues,
  filterLogs,
  gradeLogQuestions,
} from '../../core/labs/logs';
import { LogsLab } from '../../core/models/content.model';
import { Icon } from '../../shared/icon/icon';
import type { LabOutcome } from './lab-page';

let nextId = 0;

/**
 * Analyseur de journaux simulé : l'apprenant filtre des journaux fictifs, puis répond aux
 * questions de l'enquête. La correction n'apparaît qu'après l'envoi de ses conclusions.
 */
@Component({
  selector: 'ca-logs-lab',
  imports: [Icon],
  templateUrl: './logs-lab.html',
  styleUrl: './logs-lab.css',
})
export class LogsLabView {
  readonly lab = input.required<LogsLab>();
  readonly completed = output<LabOutcome>();

  private readonly injector = inject(Injector);
  private readonly missingAlert = viewChild<ElementRef<HTMLElement>>('missingAlert');
  private readonly resultHeading = viewChild<ElementRef<HTMLElement>>('resultHeading');

  protected readonly uid = `journaux-${++nextId}`;
  protected readonly filter = signal<LogFilter>(NO_FILTER);
  protected readonly rows = computed(() => filterLogs(this.lab().entries, this.filter()));
  protected readonly events = computed(() => distinctValues(this.lab().entries, 'event'));
  protected readonly ips = computed(() => distinctValues(this.lab().entries, 'ip'));

  protected readonly answers = signal<ReadonlyMap<string, string>>(new Map());
  protected readonly missing = signal(0);
  protected readonly grade = signal<ReturnType<typeof gradeLogQuestions> | null>(null);

  protected setFilter(patch: Partial<LogFilter>): void {
    this.filter.update((filter) => ({ ...filter, ...patch }));
  }

  protected answer(questionId: string, value: string): void {
    this.answers.update((answers) => new Map(answers).set(questionId, value));
  }

  protected submit(event: Event): void {
    event.preventDefault();
    const unanswered = this.lab().questions.filter((q) => !this.answers().has(q.id)).length;
    this.missing.set(unanswered);
    if (unanswered > 0) {
      this.focusAfterRender(() => this.missingAlert());
      return;
    }
    const grade = gradeLogQuestions(this.lab(), this.answers());
    this.grade.set(grade);
    const right = grade.results.filter((r) => r.correct).length;
    this.completed.emit({
      succeeded: grade.passed,
      summary: [`Conclusions justes : ${right} sur ${grade.results.length}.`],
    });
    this.focusAfterRender(() => this.resultHeading());
  }

  private focusAfterRender(target: () => ElementRef<HTMLElement> | undefined): void {
    afterNextRender(() => target()?.nativeElement.focus(), { injector: this.injector });
  }
}
