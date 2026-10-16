import { Component, computed, inject } from '@angular/core';
import { CATALOG } from '../../content/catalog';
import { summarizeProgress } from '../../core/progress/progress';
import { ProgressStore } from '../../core/progress/progress.store';
import { Icon } from '../../shared/icon/icon';
import { ProgressBar } from '../../shared/progress-bar/progress-bar';

@Component({
  selector: 'ca-skills-page',
  imports: [Icon, ProgressBar],
  template: `
    <header class="page-header">
      <h1>Compétences</h1>
      <p>
        Une compétence est acquise quand toutes les leçons et tous les laboratoires qui l’entraînent
        sont validés.
      </p>
    </header>

    <p class="summary">Compétences acquises : {{ acquired() }} sur {{ skills().length }}</p>
    <p class="muted">
      Ces compétences sont démontrées dans des exercices pédagogiques simulés : elles ne remplacent
      pas une expérience professionnelle.
    </p>

    <ul class="skills">
      @for (item of skills(); track item.skill.id) {
        <li class="card">
          <div class="head">
            <h2>{{ item.skill.title }}</h2>
            <span class="state" [class.acquired]="item.acquired">
              <ca-icon [name]="item.acquired ? 'check' : item.done > 0 ? 'clock' : 'circle'" />
              {{ item.acquired ? 'Acquise' : item.done > 0 ? 'En cours' : 'À découvrir' }}
            </span>
          </div>
          <p class="muted">{{ item.skill.description }}</p>
          <ca-progress-bar
            [label]="'Progression : ' + item.skill.title"
            [value]="item.done / item.activities.length"
            [valueText]="'Activités validées : ' + item.done + ' sur ' + item.activities.length"
          />
          <ul class="activities">
            @for (activity of item.activities; track activity.title) {
              <li>
                <ca-icon [name]="activity.completed ? 'check' : 'circle'" />
                <span>
                  {{ activity.kind === 'lab' ? 'Laboratoire' : 'Leçon' }} : {{ activity.title }}
                  <span class="visually-hidden">{{
                    activity.completed ? '(validé)' : '(à faire)'
                  }}</span>
                </span>
              </li>
            }
          </ul>
        </li>
      }
    </ul>
  `,
  styles: `
    .summary {
      margin-bottom: var(--space-1);
      font-size: var(--text-lg);
      font-weight: 600;
    }

    .muted {
      color: var(--color-text-muted);
    }

    .skills {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
      gap: var(--space-4);
      margin: var(--space-5) 0 0;
      padding: 0;
      list-style: none;
    }

    .skills > li {
      display: grid;
      align-content: start;
      gap: var(--space-3);
    }

    .head {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      justify-content: space-between;
      gap: var(--space-2);
    }

    h2,
    .skills p {
      margin: 0;
    }

    .state {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      color: var(--color-text-muted);
      font-size: var(--text-sm);
      font-weight: 600;
    }

    .state.acquired {
      color: var(--color-success);
    }

    .activities {
      display: grid;
      gap: var(--space-2);
      margin: 0;
      padding: 0;
      list-style: none;
      font-size: var(--text-sm);
    }

    .activities li {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: var(--space-2);
    }
  `,
})
export class SkillsPage {
  private readonly progress = inject(ProgressStore);

  protected readonly skills = computed(() =>
    summarizeProgress(CATALOG, this.progress.state(), new Date()).skills.map((item) => ({
      ...item,
      done: item.activities.filter((activity) => activity.completed).length,
    })),
  );
  protected readonly acquired = computed(() => this.skills().filter((s) => s.acquired).length);
}
