import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../auth/auth.service';
import { AppSupabaseClient, SUPABASE } from '../supabase/supabase';
import { GroupsService, groupMessage } from './groups.service';

const ROWS = [
  { id: 'g1', name: 'Club cyber', join_code: 'ABCDEFGHJK', premium_until: null, owner_id: 'u1' },
  {
    id: 'g2',
    name: 'Lycée Pasteur',
    join_code: 'MNPQRSTUVW',
    premium_until: '2999-06-30T00:00:00Z',
    owner_id: 'prof',
  },
];

function setup(rpc = vi.fn().mockResolvedValue({ data: null, error: null })) {
  const order = vi.fn().mockResolvedValue({ data: ROWS });
  const client = { from: () => ({ select: () => ({ order }) }), rpc };
  TestBed.configureTestingModule({
    providers: [
      { provide: AuthService, useValue: { userId: signal('u1') } },
      { provide: SUPABASE, useValue: Promise.resolve(client as unknown as AppSupabaseClient) },
    ],
  });
  return { service: TestBed.inject(GroupsService), rpc, order };
}

describe('groupMessage', () => {
  it('explique chaque refus du serveur', () => {
    expect(groupMessage({ code: 'CA404' })).toContain('Code inconnu');
    expect(groupMessage({ code: 'CA409' })).toContain('complet');
    expect(groupMessage({ code: 'CA429' })).toBe('Dix groupes au plus par compte.');
    expect(groupMessage({ code: '42501' })).toBe('Réservé au responsable du groupe.');
    expect(groupMessage({ code: 'PGRST301' })).toContain('session a expiré');
    expect(groupMessage({})).toContain('vérifiez votre connexion');
  });
});

describe('GroupsService', () => {
  it('distingue les groupes animés et rejoints, et le Premium accordé à un groupe', async () => {
    const { service } = setup();
    await service.load();
    expect(service.groups().map((g) => [g.name, g.owned])).toEqual([
      ['Club cyber', true],
      ['Lycée Pasteur', false],
    ]);
    expect(service.premium()?.name).toBe('Lycée Pasteur');
    expect(service.loaded()).toBe(true);
  });

  it('rejoindre : envoie le code et l’accord, puis recharge les groupes', async () => {
    const { service, rpc, order } = setup();
    await service.load();
    order.mockClear();
    expect(await service.join('abcde-fghjk', true)).toBeNull();
    expect(rpc).toHaveBeenCalledWith('join_group', { p_code: 'abcde-fghjk', p_accepted: true });
    expect(order).toHaveBeenCalled();
  });

  it('un refus du serveur devient un message, sans recharger', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { code: 'CA404' } });
    const { service } = setup(rpc);
    expect(await service.join('XXXXXXXXXX', true)).toContain('Code inconnu');
    expect(await service.progress('g1')).toContain('Code inconnu');
  });
});
