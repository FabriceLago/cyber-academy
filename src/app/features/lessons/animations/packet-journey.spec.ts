import { TestBed } from '@angular/core/testing';
import { VOYAGE_D_UNE_INFORMATION as LESSON } from '../../../content/lessons/03-voyage-d-une-information';
import { DETAILED, JourneyVersion, PacketJourney, SIMPLIFIED } from './packet-journey';

describe('données du trajet d’un paquet', () => {
  it.each<[string, JourneyVersion]>([
    ['détaillée', DETAILED],
    ['simplifiée', SIMPLIFIED],
  ])('version %s : le paquet ne suit que des liaisons existantes', (_, version) => {
    const ids = new Set(version.nodes.map((n) => n.id));
    expect(version.links.flat().every((id) => ids.has(id))).toBe(true);
    const linked = new Set(version.links.flatMap(([a, b]) => [`${a}-${b}`, `${b}-${a}`]));
    for (const { path } of version.steps) {
      expect(path.length).toBeGreaterThanOrEqual(2);
      path.slice(1).forEach((id, i) => expect(linked).toContain(`${path[i]}-${id}`));
    }
  });

  it('les légendes de la version détaillée reprennent l’alternative textuelle de la leçon', () => {
    const steps = LESSON.animation.textAlternative.split(/\s*Étape \d+ : /).filter((s) => s !== '');
    expect(DETAILED.steps.map((s) => s.caption)).toEqual(
      steps.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
    );
  });
});

describe('PacketJourney', () => {
  async function render() {
    const fixture = TestBed.createComponent(PacketJourney);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const click = async (name: string) => {
      [...root.querySelectorAll('button')].find((b) => b.textContent?.trim() === name)?.click();
      await fixture.whenStable();
    };
    return { root, click };
  }

  it('pose le paquet au bout du trajet de l’étape et met ce trajet en évidence', async () => {
    const { root, click } = await render();
    const packet = () => root.querySelector('g.packet');
    expect(packet()?.textContent?.trim()).toBe('Question');
    expect(packet()?.getAttribute('transform')).toBe('translate(300 114)'); // au-dessus du DNS
    expect(root.querySelectorAll('line.link.active')).toHaveLength(3);

    await click('Étape suivante');
    expect(packet()?.textContent?.trim()).toBe('Réponse');
    expect(packet()?.getAttribute('transform')).toBe('translate(60 19)'); // de retour à l'ordinateur
  });

  it('propose une version simplifiée, qui repart de la première étape', async () => {
    const { root, click } = await render();
    await click('Étape suivante');
    await click('Version simplifiée');
    const pressed = root.querySelector('[aria-pressed="true"]');
    expect(pressed?.textContent?.trim()).toBe('Version simplifiée');
    expect(root.querySelector('.caption')?.textContent?.trim()).toBe(
      `Étape 1 sur 4 : ${SIMPLIFIED.steps[0].caption}`,
    );
    expect(root.querySelector('svg title')?.textContent).toBe(SIMPLIFIED.title);
    expect(root.querySelectorAll('g.node')).toHaveLength(4);
  });
});
