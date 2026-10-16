import { Component, input } from '@angular/core';

export type IconName =
  | 'dashboard'
  | 'route'
  | 'book'
  | 'flask'
  | 'quiz'
  | 'folder'
  | 'award'
  | 'user'
  | 'shield'
  | 'menu'
  | 'close'
  | 'sun'
  | 'moon'
  | 'compass'
  | 'alert';

/**
 * Icône du design system : trait de 2 px sur une grille de 24, couleur héritée du texte.
 * Toujours décorative (aria-hidden) : le sens est porté par un texte visible ou un aria-label.
 */
@Component({
  selector: 'ca-icon',
  host: { 'aria-hidden': 'true' },
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      @switch (name()) {
        @case ('dashboard') {
          <svg:rect x="3" y="3" width="7" height="9" rx="1" />
          <svg:rect x="14" y="3" width="7" height="5" rx="1" />
          <svg:rect x="14" y="12" width="7" height="9" rx="1" />
          <svg:rect x="3" y="16" width="7" height="5" rx="1" />
        }
        @case ('route') {
          <svg:circle cx="6" cy="19" r="2" />
          <svg:circle cx="18" cy="5" r="2" />
          <svg:path d="M8 19h8.5a3.5 3.5 0 0 0 0-7h-9a3.5 3.5 0 0 1 0-7H16" />
        }
        @case ('book') {
          <svg:path d="M4 19V5a2 2 0 0 1 2-2h14v14H6a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h14" />
          <svg:path d="M9 7h7M9 11h5" />
        }
        @case ('flask') {
          <svg:path d="M9 3h6M10 3v6l-5.6 9.3A1.8 1.8 0 0 0 6 21h12a1.8 1.8 0 0 0 1.6-2.7L14 9V3" />
          <svg:path d="M7.5 15h9" />
        }
        @case ('quiz') {
          <svg:rect x="5" y="4" width="14" height="17" rx="2" />
          <svg:rect x="9" y="2" width="6" height="4" rx="1" />
          <svg:path d="m9 13 2 2 4-4" />
        }
        @case ('folder') {
          <svg:path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
        }
        @case ('award') {
          <svg:circle cx="12" cy="9" r="6" />
          <svg:path d="M8.5 14 7 22l5-3 5 3-1.5-8" />
        }
        @case ('user') {
          <svg:circle cx="12" cy="8" r="4" />
          <svg:path d="M4 21a8 8 0 0 1 16 0" />
        }
        @case ('shield') {
          <svg:path d="M12 3 5 6v5c0 4.4 2.9 8.3 7 10 4.1-1.7 7-5.6 7-10V6Z" />
          <svg:path d="m9 12 2 2 4-4" />
        }
        @case ('menu') {
          <svg:path d="M4 6h16M4 12h16M4 18h16" />
        }
        @case ('close') {
          <svg:path d="M6 6l12 12M18 6 6 18" />
        }
        @case ('sun') {
          <svg:circle cx="12" cy="12" r="4" />
          <svg:path
            d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
          />
        }
        @case ('moon') {
          <svg:path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
        }
        @case ('compass') {
          <svg:circle cx="12" cy="12" r="9" />
          <svg:path d="m15.5 8.5-2 5-5 2 2-5Z" />
        }
        @case ('alert') {
          <svg:path
            d="M10.3 3.9 2.4 17.5a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
          />
          <svg:path d="M12 9v4M12 17h.01" />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex-shrink: 0;
      width: 1.25em;
      height: 1.25em;
    }

    svg {
      width: 100%;
      height: 100%;
    }
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
}
