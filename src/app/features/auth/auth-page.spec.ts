import { validateAuthForm } from './auth-page';

const valid = { name: 'Léa', email: 'lea@exemple.test', password: 'une phrase longue' };

describe('validateAuthForm', () => {
  it('accepte un formulaire complet', () => {
    expect(validateAuthForm(valid, true)).toEqual({});
    expect(validateAuthForm({ ...valid, name: '' }, false)).toEqual({});
  });

  it('signale chaque champ à corriger à l’inscription', () => {
    expect(validateAuthForm({ name: ' ', email: 'lea@', password: 'court' }, true)).toEqual({
      nom: 'Indiquez un prénom ou un pseudonyme (50 caractères au plus).',
      email: 'Indiquez une adresse e-mail valide, par exemple nom@exemple.fr.',
      'mot-de-passe': 'Choisissez un mot de passe d’au moins 10 caractères.',
    });
  });

  it('n’impose pas la longueur minimale à la connexion, mais exige un mot de passe', () => {
    expect(validateAuthForm({ ...valid, password: 'court' }, false)).toEqual({});
    expect(validateAuthForm({ ...valid, password: '' }, false)).toEqual({
      'mot-de-passe': 'Indiquez votre mot de passe.',
    });
  });

  it('refuse un mot de passe de plus de 72 caractères à l’inscription', () => {
    expect(validateAuthForm({ ...valid, password: 'a'.repeat(73) }, true)['mot-de-passe']).toBe(
      'Le mot de passe ne doit pas dépasser 72 caractères.',
    );
  });
});
