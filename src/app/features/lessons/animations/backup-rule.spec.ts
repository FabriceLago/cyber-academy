import { TestBed } from '@angular/core/testing';
import { MISES_A_JOUR_ET_SAUVEGARDES as LESSON } from '../../../content/lessons/08-mises-a-jour-et-sauvegardes';
import { BackupRule, STEPS } from './backup-rule';

describe('animation de la règle 3-2-1', () => {
  it('les légendes reprennent l’alternative textuelle de la leçon', () => {
    const steps = LESSON.animation.textAlternative.split(/\s*Étape \d+ : /).filter((s) => s !== '');
    expect(STEPS.map((s) => s.caption)).toEqual(
      steps.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
    );
  });

  it('suit les copies d’étape en étape, jusqu’à la restauration', async () => {
    const fixture = TestBed.createComponent(BackupRule);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const next = async (times: number) => {
      for (let i = 0; i < times; i++) {
        [...root.querySelectorAll('button')]
          .find((b) => b.textContent?.trim() === 'Étape suivante')
          ?.click();
        await fixture.whenStable();
      }
    };
    const count = () => root.querySelector('.count')?.textContent?.trim();

    expect(count()).toBe('Copies intactes : 1 sur 3');
    await next(2);
    expect(count()).toBe('Copies intactes : 3 sur 3');
    await next(2);
    expect(count()).toBe('Copies intactes : 1 sur 3');
    expect(root.querySelectorAll('g.place.perdue')).toHaveLength(2);
    expect(root.querySelectorAll('path.cross')).toHaveLength(2);
    await next(1);
    expect(root.querySelector('g.place.restauree .state')?.textContent?.trim()).toBe('Restaurée');
    expect(root.querySelector('svg title')?.textContent).toContain('Copies intactes : 2 sur 3');
  });
});
