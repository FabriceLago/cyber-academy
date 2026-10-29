import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { AppSupabaseClient, SUPABASE } from '../supabase/supabase';

export interface Group {
  readonly id: string;
  readonly name: string;
  /** Code à partager pour rejoindre le groupe. */
  readonly joinCode: string;
  /** Date ISO jusqu'à laquelle l'administrateur a accordé le Premium au groupe (offre sur devis). */
  readonly premiumUntil: string | null;
  /** Le compte connecté en est le responsable ; sinon, il en est membre. */
  readonly owned: boolean;
}

/** Ce que le responsable voit d'un membre : jamais son adresse e-mail ni ses réponses. */
export interface MemberProgress {
  readonly userId: string;
  readonly displayName: string;
  readonly joinedAt: string;
  readonly lessonsCompleted: number;
  readonly labsSucceeded: number;
  readonly lastActivity: string | null;
}

/** Message pour une erreur des fonctions de groupe (code PostgreSQL ou PostgREST). */
export function groupMessage(error: { readonly code?: string }): string {
  switch (error.code) {
    case 'CA404':
      return 'Code inconnu : vérifiez-le auprès du responsable du groupe.';
    case 'CA409':
      return 'Ce groupe est complet (200 membres au plus).';
    case 'CA429':
      return 'Dix groupes au plus par compte.';
    case '23514':
      return 'Le nom du groupe doit compter de 1 à 60 caractères visibles.';
    case '42501':
      return 'Réservé au responsable du groupe.';
    case '28000':
    case 'PGRST301':
      return 'Votre session a expiré : reconnectez-vous, puis réessayez.';
    default:
      return 'L’opération a échoué : vérifiez votre connexion, puis réessayez.';
  }
}

/**
 * Groupes du compte connecté (associations, écoles) : ceux qu'il anime et ceux qu'il a rejoints.
 * Création, adhésion et suivi passent par des fonctions serveur ; quitter, retirer un membre et
 * supprimer un groupe, par la RLS.
 */
@Injectable({ providedIn: 'root' })
export class GroupsService {
  private readonly auth = inject(AuthService);
  private readonly client = inject(SUPABASE);

  readonly groups = signal<readonly Group[]>([]);
  /** Premier chargement terminé (sans compte : aussitôt). */
  readonly loaded = signal(false);
  /** Groupe qui donne accès au Premium (accordé par l'administrateur), s'il y en a un. */
  readonly premium = computed(
    () =>
      this.groups().find((g) => g.premiumUntil !== null && new Date(g.premiumUntil) > new Date()) ??
      null,
  );

  constructor() {
    effect(() => {
      const userId = this.auth.userId();
      untracked(() => void this.load(userId));
    });
  }

  async load(userId = this.auth.userId()): Promise<void> {
    if (!userId) {
      this.groups.set([]);
      this.loaded.set(true);
      return;
    }
    try {
      const supabase = await this.client;
      const { data } = await supabase
        .from('groups')
        .select('id, name, join_code, premium_until, owner_id')
        .order('created_at');
      if (this.auth.userId() !== userId) return; // Réponse arrivée après un changement de compte.
      this.groups.set(
        (data ?? []).map((row) => ({
          id: row.id,
          name: row.name,
          joinCode: row.join_code,
          premiumUntil: row.premium_until,
          owned: row.owner_id === userId,
        })),
      );
    } catch {
      // Hors ligne : la liste reste celle du dernier chargement.
    }
    this.loaded.set(true);
  }

  create(name: string): Promise<string | null> {
    return this.run((s) => s.rpc('create_group', { p_name: name.trim() }));
  }

  /** `accepted` : 15 ans ou plus, et accord pour que le responsable voie la progression. */
  join(code: string, accepted: boolean): Promise<string | null> {
    return this.run((s) => s.rpc('join_group', { p_code: code, p_accepted: accepted }));
  }

  renewCode(groupId: string): Promise<string | null> {
    return this.run((s) => s.rpc('regenerate_join_code', { p_group: groupId }));
  }

  leave(groupId: string): Promise<string | null> {
    return this.removeMember(groupId, this.auth.userId() ?? '');
  }

  removeMember(groupId: string, userId: string): Promise<string | null> {
    return this.run((s) =>
      s.from('group_members').delete().eq('group_id', groupId).eq('user_id', userId),
    );
  }

  remove(groupId: string): Promise<string | null> {
    return this.run((s) => s.from('groups').delete().eq('id', groupId));
  }

  /** Progression des membres (responsable seulement), ou un message d'erreur. */
  async progress(groupId: string): Promise<readonly MemberProgress[] | string> {
    try {
      const supabase = await this.client;
      const { data, error } = await supabase.rpc('group_progress', { p_group: groupId });
      if (error) return groupMessage(error);
      return (data ?? []).map((row) => ({
        userId: row.user_id,
        displayName: row.display_name,
        joinedAt: row.joined_at,
        lessonsCompleted: row.lessons_completed,
        labsSucceeded: row.labs_succeeded,
        lastActivity: row.last_activity,
      }));
    } catch {
      return groupMessage({});
    }
  }

  /** Lance l'opération, puis recharge les groupes. Renvoie un message d'erreur, ou null. */
  private async run(
    action: (supabase: AppSupabaseClient) => PromiseLike<{ error: { code?: string } | null }>,
  ): Promise<string | null> {
    try {
      const { error } = await action(await this.client);
      if (error) return groupMessage(error);
      await this.load();
      return null;
    } catch {
      return groupMessage({});
    }
  }
}
