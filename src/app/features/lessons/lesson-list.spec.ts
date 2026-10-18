import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CATALOG } from '../../content/catalog';
import { LessonProgress, summarizeProgress } from '../../core/progress/progress';
import { EMPTY_PROGRESS } from '../../core/progress/progress.store';
import { LessonList } from './lesson-list';

@Component({
  imports: [LessonList],
  template: `<ca-lesson-list [lessons]="lessons()" />`,
})
class Host {
  readonly lessons = signal<readonly LessonProgress[]>([]);
}

describe('LessonList', () => {
  it('une leçon accessible est un lien ; une leçon verrouillée dit ce qui manque', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Host);
    const lessons = summarizeProgress(CATALOG, EMPTY_PROGRESS, new Date()).lessons.slice(0, 2);
    fixture.componentInstance.lessons.set(lessons);
    await fixture.whenStable();
    const items = (fixture.nativeElement as HTMLElement).querySelectorAll('li');

    const [open, locked] = lessons;
    expect(items[0].querySelector('a')?.getAttribute('href')).toBe(`/lecons/${open.lesson.id}`);
    expect(items[0].textContent).toContain('Disponible');
    expect(items[1].querySelector('a')).toBeNull();
    expect(items[1].textContent).toContain('Verrouillée');
    expect(items[1].textContent).toContain(`après « ${locked.blockedBy[0].title} »`);
  });
});
