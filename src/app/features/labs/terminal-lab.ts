import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { isTaskDone, prompt, runCommand, startTerminal } from '../../core/labs/terminal';
import { TerminalLab } from '../../core/models/content.model';
import { Icon } from '../../shared/icon/icon';
import type { LabOutcome } from './lab-page';

interface Entry {
  readonly id: number;
  /** Ligne tapée, précédée de l'invite ; absente pour un message du laboratoire. */
  readonly command?: { readonly prompt: string; readonly text: string };
  readonly lines: readonly string[];
  readonly tone: 'output' | 'error' | 'success' | 'info';
}

let nextId = 0;

/**
 * Terminal simulé : l'apprenant tape des commandes, le moteur fait évoluer un système de fichiers
 * fictif en mémoire, et chaque tâche de la mission se coche dès que l'état simulé la remplit.
 */
@Component({
  selector: 'ca-terminal-lab',
  imports: [Icon],
  template: `
    <section class="mission" aria-labelledby="mission-titre">
      <h3 id="mission-titre">Mission</h3>
      <ul class="tasks">
        @for (item of tasks(); track item.task.id) {
          <li [class.done]="item.done">
            <ca-icon [name]="item.done ? 'check' : 'circle'" />
            <span>
              {{ item.task.text }}
              <span class="visually-hidden">{{ item.done ? '(fait)' : '(à faire)' }}</span>
            </span>
          </li>
        }
      </ul>
    </section>

    <div class="terminal">
      <div class="titlebar" aria-hidden="true">
        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
        <span class="title">eleve&#64;cyberlab — terminal simulé</span>
      </div>
      <!-- tabindex : la zone défile, elle doit donc pouvoir être atteinte au clavier. -->
      <div #screen class="screen" role="log" aria-label="Sortie du terminal" tabindex="0">
        @for (entry of entries(); track entry.id) {
          <div class="entry" [attr.data-tone]="entry.tone">
            @if (entry.command; as command) {
              <p class="line">
                <span class="prompt">{{ command.prompt }}</span> {{ command.text }}
              </p>
            }
            @for (line of entry.lines; track $index) {
              <p class="line out">{{ line }}</p>
            }
          </div>
        }
      </div>
      <form class="input-line" (submit)="run($event, input)">
        <label class="prompt" [for]="inputId">
          {{ promptText() }}<span class="visually-hidden"> Commande à exécuter</span>
        </label>
        <input
          #input
          [id]="inputId"
          (keydown)="recall($event, input)"
          [disabled]="finished()"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          maxlength="200"
        />
      </form>
    </div>
    <p class="help">
      Validez chaque commande avec Entrée. Les flèches haut et bas rappellent les commandes déjà
      tapées.
    </p>
  `,
  styleUrl: './terminal-lab.css',
})
export class TerminalLabView {
  readonly lab = input.required<TerminalLab>();
  readonly completed = output<LabOutcome>();

  private readonly injector = inject(Injector);
  private readonly screen = viewChild.required<ElementRef<HTMLElement>>('screen');

  protected readonly inputId = `terminal-${++nextId}`;
  protected readonly finished = signal(false);
  // linkedSignal : calculés au premier affichage, quand l'entrée `lab` est disponible.
  private readonly state = linkedSignal(() => startTerminal(this.lab()));
  protected readonly entries = linkedSignal<Entry[]>(() => [
    {
      id: 0,
      lines: [
        `Terminal simulé de la machine fictive ${this.lab().host} : aucune commande n’est réellement exécutée.`,
        'Tapez help pour voir les commandes disponibles.',
      ],
      tone: 'info',
    },
  ]);
  protected readonly promptText = computed(() => prompt(this.lab(), this.state()));
  protected readonly tasks = computed(() =>
    this.lab().tasks.map((task) => ({ task, done: isTaskDone(this.state(), task) })),
  );

  private readonly history: string[] = [];
  private historyIndex = 0;
  private errors = 0;

  // Le texte tapé vit seulement dans le champ, jamais dans un signal relié par [value] : si la
  // frappe et Entrée arrivent avant le rendu suivant, ce signal reviendrait à '' sans changement
  // visible pour Angular, et le champ garderait la commande déjà exécutée.
  protected run(event: Event, input: HTMLInputElement): void {
    event.preventDefault();
    const text = input.value;
    const before = this.tasks();
    const result = runCommand(this.lab(), this.state(), text);
    if (text.trim() !== '') {
      this.history.push(text);
      if (result.error) this.errors++;
    }
    this.historyIndex = this.history.length;

    const echo: Entry = {
      id: ++nextId,
      command: { prompt: this.promptText(), text },
      lines: result.output,
      tone: result.error ? 'error' : 'output',
    };
    this.state.set(result.state);
    const reached = this.tasks()
      .filter((item, i) => item.done && !before[i].done)
      .map((item) => `Objectif atteint : ${item.task.text}.`);
    const added: Entry[] =
      reached.length > 0 ? [{ id: ++nextId, lines: reached, tone: 'success' }] : [];
    this.entries.update((entries) => (result.clear ? added : [...entries, echo, ...added]));
    input.value = '';

    if (this.tasks().every((item) => item.done)) this.finish();
    afterNextRender(
      () => {
        const screen = this.screen().nativeElement;
        screen.scrollTop = screen.scrollHeight;
      },
      { injector: this.injector },
    );
  }

  /** Flèches haut et bas : parcourir les commandes déjà tapées, comme dans un vrai terminal. */
  protected recall(event: KeyboardEvent, input: HTMLInputElement): void {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    const step = event.key === 'ArrowUp' ? -1 : 1;
    this.historyIndex = Math.min(Math.max(this.historyIndex + step, 0), this.history.length);
    input.value = this.history[this.historyIndex] ?? '';
  }

  private finish(): void {
    this.finished.set(true);
    const used = [...new Set(this.history.map((line) => line.trim().split(/\s+/)[0]))];
    const typed = this.history.length;
    this.completed.emit({
      succeeded: true,
      summary: [
        `Mission accomplie en ${typed} commande${typed > 1 ? 's' : ''}, dont ${this.errors} refusée${this.errors > 1 ? 's' : ''} ou en erreur : se tromper fait partie de l’apprentissage.`,
        `Commandes utilisées : ${used.join(', ')}.`,
      ],
    });
  }
}
