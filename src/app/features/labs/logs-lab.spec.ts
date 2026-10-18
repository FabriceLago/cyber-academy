import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LOGS_LAB } from '../../content/labs/lab-journaux';
import type { LabOutcome } from './lab-page';
import { LogsLabView } from './logs-lab';

@Component({
  imports: [LogsLabView],
  template: `<ca-logs-lab [lab]="lab()" (completed)="outcomes.push($event)" />`,
})
class Host {
  readonly lab = signal(LOGS_LAB);
  readonly outcomes: LabOutcome[] = [];
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  const stable = () => fixture.whenStable();
  const count = () => root.querySelector('.count')?.textContent?.trim();
  const submit = async () => {
    root.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
    await stable();
  };
  return { host: fixture.componentInstance, root, stable, count, submit };
}

describe('LogsLabView', () => {
  const total = LOGS_LAB.entries.length;

  it('filtre les journaux par adresse IP et l’annonce', async () => {
    const { root, stable, count } = await render();
    expect(count()).toBe(`${total} ligne(s) sur ${total}`);
    const ip = root.querySelectorAll('select')[1];
    ip.value = '203.0.113.77';
    ip.dispatchEvent(new Event('change'));
    await stable();
    const shown = LOGS_LAB.entries.filter((e) => e.ip === '203.0.113.77').length;
    expect(count()).toBe(`${shown} ligne(s) sur ${total}`);
    expect(root.querySelectorAll('tbody tr')).toHaveLength(shown);
  });

  it('refuse un envoi incomplet, sans rien corriger', async () => {
    const { host, root, submit } = await render();
    await submit();
    expect(root.querySelector('[role="alert"]')?.textContent).toContain(
      `Il reste ${LOGS_LAB.questions.length} question(s) sans réponse`,
    );
    expect(root.textContent).not.toContain('Correction de l’enquête');
    expect(host.outcomes).toEqual([]);
  });

  it('corrige après l’envoi et signale la réussite', async () => {
    const { host, root, submit } = await render();
    for (const question of LOGS_LAB.questions) {
      const option = [...root.querySelectorAll('fieldset.question')]
        .find((f) => f.textContent?.includes(question.prompt))
        ?.querySelectorAll<HTMLInputElement>('input[type="radio"]')[
        question.options.indexOf(question.answer)
      ];
      option?.click();
    }
    await submit();
    expect(root.textContent).toContain('Correction de l’enquête');
    const n = LOGS_LAB.questions.length;
    expect(host.outcomes).toEqual([
      { succeeded: true, summary: [`Conclusions justes : ${n} sur ${n}.`] },
    ]);
  });
});
