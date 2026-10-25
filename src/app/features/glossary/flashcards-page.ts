import { DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  Injector,
  Signal,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FlashcardStore, INTERVAL_DAYS, sessionCards } from '../../core/progress/flashcards';
import { ProgressStore } from '../../core/progress/progress.store';
import { GlossaryTerm, TERMS, normalize } from './glossary-page';

const keyOf = (term: GlossaryTerm) => normalize(term.term);

@Component({
  selector: 'ca-flashcards-page',
  imports: [RouterLink, DatePipe],
  template: `
    <header class="page-header">
      <p class="eyebrow">Révision</p>
      <h1>Cartes mémoire</h1>
      <p>
        Les termes du glossaire des leçons dont vous avez tenté le quiz. Formulez la définition de
        tête, retournez la carte, puis indiquez si vous la saviez : une carte connue revient de plus
        en plus tard ({{ intervals }} jours), une carte oubliée revient le lendemain.
      </p>
    </header>

    @let q = queue();
    @let term = current();
    @if (q === null) {
      <section class="card stack" aria-label="Séance de révision">
        @if (deck().length === 0) {
          <p>
            Aucune carte pour l’instant : tentez le quiz d’une leçon, ses termes deviendront des
            cartes.
          </p>
          <p><a routerLink="/lecons">Voir les leçons</a></p>
        } @else if (ready().length === 0) {
          <p>
            Rien à revoir aujourd’hui sur vos {{ deck().length }} cartes. Prochaine révision le
            {{ nextDue() | date: 'd MMMM' }}.
          </p>
        } @else {
          <p>{{ dueCount() }} à revoir · {{ ready().length - dueCount() }} nouvelles</p>
          <p>
            <button type="button" class="btn btn-primary" (click)="start()">
              Commencer la révision ({{ ready().length }} cartes)
            </button>
          </p>
        }
        <p class="muted">Votre avancement dans les cartes est gardé dans ce navigateur.</p>
      </section>
    } @else if (term) {
      <section class="card stack" aria-labelledby="card-term">
        <p class="muted">Carte {{ index() + 1 }} sur {{ q.length }}</p>
        <h2 id="card-term" #cardTitle tabindex="-1">{{ term.term }}</h2>
        @if (revealed()) {
          <div #answer class="stack" tabindex="-1">
            <p>{{ term.definition }}</p>
            <p class="muted">Exemple : {{ term.example }}</p>
            <p class="muted">
              Vu dans :
              @for (lesson of term.lessons; track lesson.id; let last = $last) {
                <a [routerLink]="['/lecons', lesson.id]">{{ lesson.title }}</a
                >{{ last ? '' : ', ' }}
              }
            </p>
          </div>
          <p class="actions" role="group" aria-label="Saviez-vous cette définition ?">
            <button type="button" class="btn btn-primary" (click)="grade(true)">Je savais</button>
            <button type="button" class="btn btn-secondary" (click)="grade(false)">À revoir</button>
          </p>
        } @else {
          <p>Formulez la définition de tête, puis retournez la carte.</p>
          <p>
            <button type="button" class="btn btn-primary" (click)="reveal()">
              Afficher la définition
            </button>
          </p>
        }
      </section>
    } @else {
      <section class="card stack" aria-labelledby="done-title">
        <h2 id="done-title" #doneTitle tabindex="-1">Séance terminée</h2>
        <p>
          {{ known() }} {{ known() > 1 ? 'cartes connues' : 'carte connue' }} sur {{ q.length }}.
          Les cartes à revoir reviendront demain.
        </p>
        <p><a routerLink="/glossaire">Retour au glossaire</a></p>
      </section>
    }
  `,
  styles: `
    .stack {
      display: grid;
      gap: var(--space-3);
    }

    .stack p {
      margin: 0;
    }

    h2 {
      font-size: var(--text-2xl);
    }

    .muted {
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
    }
  `,
})
export class FlashcardsPage {
  private readonly progress = inject(ProgressStore);
  private readonly store = inject(FlashcardStore);
  private readonly injector = inject(Injector);
  private readonly cardTitle = viewChild<ElementRef<HTMLElement>>('cardTitle');
  private readonly answer = viewChild<ElementRef<HTMLElement>>('answer');
  private readonly doneTitle = viewChild<ElementRef<HTMLElement>>('doneTitle');

  protected readonly intervals = INTERVAL_DAYS.join(', ');

  /** Termes des leçons dont l'apprenant a tenté le quiz (lire une page ne suffit pas). */
  protected readonly deck = computed(() => {
    const tried = new Set(this.progress.state().quizAttempts.map((a) => a.lessonId));
    return TERMS.filter((term) => term.lessons.some((lesson) => tried.has(lesson.id)));
  });
  protected readonly ready = computed(() =>
    sessionCards(this.deck(), keyOf, this.store.cards(), new Date()),
  );
  protected readonly dueCount = computed(
    () => this.ready().filter((term) => Object.hasOwn(this.store.cards(), keyOf(term))).length,
  );
  protected readonly nextDue = computed(() => {
    const cards = this.store.cards();
    const dates = this.deck().flatMap((term) =>
      Object.hasOwn(cards, keyOf(term)) ? [cards[keyOf(term)].due] : [],
    );
    return dates.sort()[0] ?? null;
  });

  /** Cartes de la séance en cours, figées au départ ; null avant le départ. */
  protected readonly queue = signal<readonly GlossaryTerm[] | null>(null);
  protected readonly index = signal(0);
  protected readonly revealed = signal(false);
  protected readonly known = signal(0);
  protected readonly current = computed(() => this.queue()?.[this.index()] ?? null);

  protected start(): void {
    this.queue.set(this.ready());
    this.focus(this.cardTitle);
  }

  /** La définition n'apparaît qu'à la demande de l'apprenant, après qu'il l'a cherchée de tête. */
  protected reveal(): void {
    this.revealed.set(true);
    this.focus(this.answer);
  }

  protected grade(known: boolean): void {
    const term = this.current();
    if (!term) return;
    this.store.record(keyOf(term), known, new Date());
    if (known) this.known.update((n) => n + 1);
    this.revealed.set(false);
    this.index.update((i) => i + 1);
    this.focus(this.current() ? this.cardTitle : this.doneTitle);
  }

  private focus(target: Signal<ElementRef<HTMLElement> | undefined>): void {
    afterNextRender(() => target()?.nativeElement.focus(), { injector: this.injector });
  }
}
