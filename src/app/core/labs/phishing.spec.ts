import { PHISHING_LAB } from '../../content/labs/lab-phishing';
import { EmailZone, LabEmail } from '../models/content.model';
import { reviewEmail, zonesOf } from './phishing';

const email = (id: string): LabEmail => {
  const found = PHISHING_LAB.emails.find((e) => e.id === id);
  if (!found) throw new Error(`E-mail inconnu : ${id}`);
  return found;
};
const answer = (verdict: 'legitime' | 'hameconnage', ...flagged: EmailZone[]) => ({
  verdict,
  flagged: new Set(flagged),
});

describe('correction du détecteur d’hameçonnage', () => {
  it('liste les éléments présents dans l’ordre de lecture', () => {
    expect(zonesOf(email('banque-urgent'))).toEqual(['expediteur', 'objet', 'demande', 'lien']);
    expect(zonesOf(email('faux-collegue'))).toEqual([
      'expediteur',
      'objet',
      'demande',
      'piece-jointe',
    ]);
  });

  it('réussit un hameçonnage démasqué avec deux indices', () => {
    const review = reviewEmail(email('banque-urgent'), answer('hameconnage', 'expediteur', 'lien'));
    expect(review).toEqual({
      verdictCorrect: true,
      found: ['expediteur', 'lien'],
      missed: ['objet', 'demande'],
      falseAlarms: [],
      passed: true,
    });
  });

  it('demande au moins deux indices, pas seulement le bon verdict', () => {
    expect(reviewEmail(email('banque-urgent'), answer('hameconnage', 'lien')).passed).toBe(false);
  });

  it('refuse de tout cocher : un élément sain signalé à tort fait échouer', () => {
    const review = reviewEmail(
      email('faux-collegue'),
      answer('hameconnage', 'expediteur', 'objet', 'demande', 'piece-jointe'),
    );
    expect(review.falseAlarms).toEqual(['objet']);
    expect(review.passed).toBe(false);
  });

  it('réussit un message légitime reconnu comme tel, sans rien signaler', () => {
    expect(reviewEmail(email('rh-conges'), answer('legitime')).passed).toBe(true);
    expect(reviewEmail(email('rh-conges'), answer('legitime', 'lien')).passed).toBe(false);
    const wrong = reviewEmail(email('rh-conges'), answer('hameconnage'));
    expect(wrong).toMatchObject({ verdictCorrect: false, passed: false });
  });
});
