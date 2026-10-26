import { TestBed } from '@angular/core/testing';
import { DIAGRAM_IDS, LessonDiagram, placeTree } from './lesson-diagram';

function render(id: string): HTMLElement {
  const fixture = TestBed.createComponent(LessonDiagram);
  fixture.componentRef.setInput('id', id);
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('LessonDiagram', () => {
  it('relie chaque entrée de l’arborescence à son dossier parent', () => {
    const tree = placeTree(
      [
        { label: '/', depth: 0, kind: 'dossier' },
        { label: 'home', depth: 1, kind: 'dossier' },
        { label: 'lea', depth: 2, kind: 'dossier' },
        { label: 'tmp', depth: 1, kind: 'dossier' },
      ],
      10,
      20,
      30,
      20,
    );
    expect(tree.map((n) => [n.x, n.y])).toEqual([
      [10, 20],
      [30, 50],
      [50, 80],
      [30, 110],
    ]);
    expect(tree[0].link).toBeNull();
    // « tmp » part de « / », pas de « lea » ni de « home ».
    expect(tree[3].link).toBe('M19 28 V110 H27');
  });

  it.each(DIAGRAM_IDS)('« %s » : un schéma masqué aux lecteurs d’écran', (id) => {
    const svg = render(id).querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.querySelectorAll('text').length).toBeGreaterThan(3);
  });

  it('ne dessine rien pour une démonstration inconnue', () => {
    expect(render('inconnue').querySelector('svg')).toBeNull();
  });
});
