-- Paiement refusé (past_due) : l'accès reste ouvert pendant que Stripe retente le prélèvement.
-- Quand il abandonne, l'abonnement est résilié (réglage Stripe, voir docs/deploiement.md) et
-- l'accès se ferme. « create or replace » garde les droits : toujours fermée au navigateur.
create or replace function public.has_active_subscription(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.subscriptions
    where user_id = p_user
      and status in ('active', 'trialing', 'past_due')
      and (current_period_end is null or current_period_end > now())
  );
$$;
