import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PREMIUM_SALES } from '../../core/subscription/subscription.service';
import { PrivacyPage } from './legal-pages';

describe('PrivacyPage', () => {
  it('ne parle de Stripe que si la vente est ouverte', () => {
    for (const salesOpen of [true, false]) {
      TestBed.configureTestingModule({
        providers: [provideRouter([]), { provide: PREMIUM_SALES, useValue: salesOpen }],
      });
      const fixture = TestBed.createComponent(PrivacyPage);
      fixture.detectChanges();
      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text.includes('Stripe')).toBe(salesOpen);
      TestBed.resetTestingModule();
    }
  });
});
