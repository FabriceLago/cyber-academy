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
import {
  EMAIL_ZONES,
  EmailReview,
  MIN_CLUES,
  Verdict,
  reviewEmail,
  zonesOf,
} from '../../core/labs/phishing';
import { EmailZone, PhishingLab } from '../../core/models/content.model';
import { Icon } from '../../shared/icon/icon';
import type { LabOutcome } from './lab-page';

let nextId = 0;

/**
 * Boîte de réception simulée : pour chaque e-mail, l'apprenant inspecte l'expéditeur et le lien,
 * signale les éléments suspects et donne son verdict. La correction n'apparaît qu'ensuite.
 */
@Component({
  selector: 'ca-phishing-lab',
  imports: [Icon],
  templateUrl: './phishing-lab.html',
  styleUrl: './phishing-lab.css',
})
export class PhishingLabView {
  readonly lab = input.required<PhishingLab>();
  readonly completed = output<LabOutcome>();

  private readonly injector = inject(Injector);
  private readonly subject = viewChild<ElementRef<HTMLElement>>('subject');
  private readonly feedback = viewChild<ElementRef<HTMLElement>>('feedback');

  protected readonly uid = `hameconnage-${++nextId}`;
  protected readonly minClues = MIN_CLUES;
  protected readonly index = signal(0);
  protected readonly email = computed(() => this.lab().emails[this.index()]);
  protected readonly zones = computed(() =>
    EMAIL_ZONES.filter((zone) => zonesOf(this.email()).includes(zone.id)),
  );

  // Remis à zéro à chaque nouvel e-mail.
  protected readonly flagged = linkedSignal<ReadonlySet<EmailZone>>(() => {
    this.index();
    return new Set();
  });
  protected readonly verdict = linkedSignal<Verdict | null>(() => {
    this.index();
    return null;
  });
  protected readonly addressShown = linkedSignal(() => {
    this.index();
    return false;
  });
  protected readonly linkShown = linkedSignal(() => {
    this.index();
    return false;
  });

  protected readonly reviews = signal<EmailReview[]>([]);
  protected readonly review = computed(() => this.reviews()[this.index()] ?? null);
  protected readonly last = computed(() => this.index() === this.lab().emails.length - 1);
  protected readonly done = signal(false);

  /** Correction élément par élément, une fois l'analyse validée. */
  protected readonly zoneResults = computed(() => {
    if (!this.review()) return [];
    const email = this.email();
    return this.zones().flatMap(({ id, label }) => {
      const zone = email.zones[id];
      if (!zone) return [];
      const flagged = this.flagged().has(id);
      const status = zone.suspicious
        ? flagged
          ? 'indice relevé'
          : 'indice manqué'
        : flagged
          ? 'signalé à tort'
          : 'rien d’anormal';
      return [
        { id, label, status, ok: zone.suspicious === flagged, explanation: zone.explanation },
      ];
    });
  });

  protected toggle(id: EmailZone): void {
    this.flagged.update((flagged) => {
      const next = new Set(flagged);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  protected submit(event: Event): void {
    event.preventDefault();
    const verdict = this.verdict();
    if (!verdict) return;
    this.reviews.update((reviews) => [
      ...reviews,
      reviewEmail(this.email(), { verdict, flagged: this.flagged() }),
    ]);
    // La correction cite l'adresse et le lien : on les montre.
    this.addressShown.set(true);
    this.linkShown.set(true);
    this.focusAfterRender(() => this.feedback());
  }

  protected next(): void {
    if (!this.last()) {
      this.index.update((i) => i + 1);
      this.focusAfterRender(() => this.subject());
      return;
    }
    const emails = this.lab().emails;
    const reviews = this.reviews();
    this.done.set(true);
    this.completed.emit({
      succeeded: reviews.every((r) => r.passed),
      summary: [
        `E-mails correctement analysés : ${reviews.filter((r) => r.passed).length} sur ${emails.length}.`,
        ...emails.map(
          (email, i) =>
            `« ${email.subject} » (${email.phishing ? 'hameçonnage' : 'légitime'}) : ${reviews[i]?.passed ? 'analyse juste' : 'analyse à revoir'}.`,
        ),
      ],
    });
  }

  private focusAfterRender(target: () => ElementRef<HTMLElement> | undefined): void {
    afterNextRender(() => target()?.nativeElement.focus(), { injector: this.injector });
  }
}
