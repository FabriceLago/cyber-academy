import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AnimationPlayer, AnimationStep, STEP_DURATION_MS } from './animation-player';

const STEPS: AnimationStep[] = ['A', 'B', 'C'].map((caption) => ({
  caption,
  explanation: `Pourquoi ${caption}`,
}));

@Component({
  imports: [AnimationPlayer],
  template: `
    <ca-animation-player [steps]="steps()" [(current)]="current" (shown)="shown.push($event)">
      <p>Scène</p>
    </ca-animation-player>
  `,
})
class Host {
  readonly steps = signal(STEPS);
  readonly current = signal(0);
  readonly shown: number[] = [];
}

describe('AnimationPlayer', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  /** Laisse Angular afficher les changements (planifiés par minuterie, ici simulée). */
  const settle = () => vi.advanceTimersByTimeAsync(20);

  async function render() {
    const fixture = TestBed.createComponent(Host);
    await settle();
    const root = fixture.nativeElement as HTMLElement;
    const button = (name: string) =>
      [...root.querySelectorAll('button')].find((b) => b.textContent?.trim() === name);
    const click = async (name: string) => {
      button(name)?.click();
      await settle();
    };
    const caption = () => root.querySelector('.caption')?.textContent?.trim();
    const playLabel = () => root.querySelector('.btn-primary')?.textContent?.trim();
    return { host: fixture.componentInstance, root, button, click, caption, playLabel };
  }

  it('affiche la scène, la légende annoncée et l’explication de l’étape', async () => {
    const { root, caption } = await render();
    expect(root.textContent).toContain('Scène');
    expect(caption()).toBe('Étape 1 sur 3 : A');
    expect(root.querySelector('.caption')?.getAttribute('aria-live')).toBe('polite');
    expect(root.querySelector('.explanation')?.textContent?.trim()).toBe('Pourquoi A');
  });

  it('passe d’une étape à l’autre sans dépasser les extrémités', async () => {
    const { host, button, click, caption } = await render();
    expect(button('Étape précédente')?.getAttribute('aria-disabled')).toBe('true');
    await click('Étape précédente');
    expect(caption()).toBe('Étape 1 sur 3 : A');

    await click('Étape suivante');
    await click('Étape suivante');
    expect(caption()).toBe('Étape 3 sur 3 : C');
    expect(button('Étape suivante')?.getAttribute('aria-disabled')).toBe('true');
    await click('Étape suivante');
    expect(caption()).toBe('Étape 3 sur 3 : C');

    await click('Revenir au début');
    expect(caption()).toBe('Étape 1 sur 3 : A');
    expect(host.current()).toBe(0);
    expect(host.shown).toEqual([1, 2, 0]);
  });

  it('lit les étapes à intervalle régulier et s’arrête sur la dernière', async () => {
    const { host, click, caption, playLabel } = await render();
    await click('Lecture');
    expect(playLabel()).toBe('Pause');
    expect(host.shown).toEqual([0]); // l'étape en cours est rejouée

    await vi.advanceTimersByTimeAsync(STEP_DURATION_MS);
    expect(caption()).toBe('Étape 2 sur 3 : B');
    await vi.advanceTimersByTimeAsync(STEP_DURATION_MS);
    expect(caption()).toBe('Étape 3 sur 3 : C');
    expect(playLabel()).toBe('Rejouer');
    await vi.advanceTimersByTimeAsync(STEP_DURATION_MS * 2);
    expect(host.shown).toEqual([0, 1, 2]);

    await click('Rejouer');
    expect(caption()).toBe('Étape 1 sur 3 : A');
    expect(playLabel()).toBe('Pause');
  });

  it('met la lecture en pause', async () => {
    const { click, caption, playLabel } = await render();
    await click('Lecture');
    await click('Pause');
    expect(playLabel()).toBe('Lecture');
    await vi.advanceTimersByTimeAsync(STEP_DURATION_MS * 2);
    expect(caption()).toBe('Étape 1 sur 3 : A');
  });

  it('arrête la lecture quand les étapes changent', async () => {
    const { host, click, caption, playLabel } = await render();
    await click('Lecture');
    host.steps.set(STEPS.slice(0, 2));
    await settle();
    expect(playLabel()).toBe('Lecture');
    await vi.advanceTimersByTimeAsync(STEP_DURATION_MS * 2);
    expect(caption()).toBe('Étape 1 sur 2 : A');
  });
});
