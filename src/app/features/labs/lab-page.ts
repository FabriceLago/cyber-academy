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
import { CATALOG, findLab } from '../../content/catalog';
import { LabKind } from '../../core/models/content.model';
import { summarizeProgress } from '../../core/progress/progress';
import { ProgressStore } from '../../core/progress/progress.store';
import { Icon } from '../../shared/icon/icon';
import { PhishingLabView } from './phishing-lab';
import { TerminalLabView } from './terminal-lab';

/** Ce que l'environnement simulé renvoie à la fin de l'exercice. */
export interface LabOutcome {
  readonly succeeded: boolean;
  /** Lignes du bilan propres au type de laboratoire. */
  readonly summary: readonly string[];
}

export const LAB_KINDS: Record<
  LabKind,
  {
    readonly label: string;
    readonly simulated: string;
    readonly actions: string;
    readonly environment: string;
  }
> = {
  terminal: {
    label: 'Terminal simulé',
    simulated:
      'Aucune commande n’est réellement exécutée : la page imite un terminal, sur un système de fichiers fictif gardé en mémoire.',
    actions:
      'Commandes autorisées : pwd, ls, cd, cat, mkdir, touch, clear et help. Toute autre commande est refusée.',
    environment: 'Terminal',
  },
  phishing: {
    label: 'Détecteur d’hameçonnage',
    simulated:
      'Messages, personnes et adresses fictifs : aucun lien ne peut être ouvert, aucune pièce jointe téléchargée.',
    actions:
      'Actions possibles : afficher l’adresse réelle de l’expéditeur, vérifier la destination d’un lien, signaler des éléments suspects, donner un verdict.',
    environment: 'Boîte de réception',
  },
};

/**
 * Page d'un laboratoire du Cyber Lab : scénario, objectifs, environnement simulé, indices
 * progressifs, puis bilan et explications. Chaque fin d'exercice est enregistrée.
 */
@Component({
  selector: 'ca-lab-page',
  imports: [RouterLink, Icon, TerminalLabView, PhishingLabView],
  templateUrl: './lab-page.html',
  styleUrl: './lab-page.css',
})
export class LabPage {
  readonly labId = input.required<string>();

  private readonly progress = inject(ProgressStore);
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private readonly title = viewChild<ElementRef<HTMLElement>>('title');
  private readonly resultHeading = viewChild<ElementRef<HTMLElement>>('resultHeading');

  protected readonly kinds = LAB_KINDS;
  protected readonly lab = computed(() => findLab(this.labId()));
  protected readonly terminal = computed(() => {
    const lab = this.lab();
    return lab?.kind === 'terminal' ? lab : null;
  });
  protected readonly phishing = computed(() => {
    const lab = this.lab();
    return lab?.kind === 'phishing' ? lab : null;
  });

  private readonly summary = computed(() =>
    summarizeProgress(CATALOG, this.progress.state(), new Date()),
  );
  /** La leçon dont ce laboratoire fait partie : il s'ouvre avec elle. */
  protected readonly lesson = computed(() =>
    this.summary().lessons.find((l) => l.lesson.labId === this.labId()),
  );
  protected readonly completed = computed(
    () => this.summary().labs.find((l) => l.lab.id === this.labId())?.completed ?? false,
  );

  /** Incrémenté par « Recommencer » : recrée l'environnement simulé. */
  protected readonly run = signal(0);
  protected readonly runKey = computed(() => `${this.labId()}:${this.run()}`);
  protected readonly shownHints = linkedSignal(() => {
    this.runKey();
    return 0;
  });
  protected readonly outcome = linkedSignal<LabOutcome | null>(() => {
    this.runKey();
    return null;
  });

  protected finish(outcome: LabOutcome): void {
    this.progress.recordLabAttempt({
      labId: this.labId(),
      completedAt: new Date().toISOString(),
      succeeded: outcome.succeeded,
      hintsUsed: this.shownHints(),
    });
    this.outcome.set(outcome);
    this.focusAfterRender(() => this.resultHeading());
  }

  protected restart(): void {
    this.run.update((n) => n + 1);
    this.document.defaultView?.scrollTo({ top: 0 });
    this.focusAfterRender(() => this.title());
  }

  private focusAfterRender(target: () => ElementRef<HTMLElement> | undefined): void {
    afterNextRender(() => target()?.nativeElement.focus(), { injector: this.injector });
  }
}
