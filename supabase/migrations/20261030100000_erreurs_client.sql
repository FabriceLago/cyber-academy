-- Erreurs JavaScript rencontrées par les apprenants connectés, pour corriger le site. Le
-- navigateur ne lit ni n'écrit la table : il appelle report_client_error, qui limite le débit et
-- efface ce qui a plus de 90 jours. L'équipe les lit depuis le tableau de bord Supabase.
create table public.client_errors (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  message text not null check (char_length(message) between 1 and 500),
  stack text check (char_length(stack) <= 4000),
  -- Adresse de la page, sans paramètres ni fragment (aucun code de connexion).
  path text not null check (char_length(path) between 1 and 300),
  user_agent text check (char_length(user_agent) <= 300),
  created_at timestamptz not null default now()
);
create index client_errors_user_created_idx on public.client_errors (user_id, created_at);
create index client_errors_created_idx on public.client_errors (created_at);
alter table public.client_errors enable row level security;
-- Aucune politique : ni lecture ni écriture depuis le navigateur, même pour un administrateur.
revoke all on public.client_errors from anon, authenticated;

create function public.report_client_error(
  p_message text,
  p_stack text,
  p_path text,
  p_user_agent text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
begin
  if v_user is null then
    raise exception 'Connexion requise.' using errcode = '28000';
  end if;
  -- Un envoi à la fois par compte : le décompte voit ceux des envois précédents.
  perform pg_advisory_xact_lock(hashtextextended('erreurs:' || v_user::text, 0));
  -- Au-delà de 20 par heure, on ignore sans erreur : une boucle d'erreurs ne doit pas en
  -- provoquer d'autres.
  if (select count(*) from public.client_errors
      where user_id = v_user and created_at > now() - interval '1 hour') >= 20 then
    return;
  end if;
  delete from public.client_errors where created_at < now() - interval '90 days';
  insert into public.client_errors (user_id, message, stack, path, user_agent)
  values (
    v_user,
    coalesce(nullif(left(btrim(p_message), 500), ''), 'Erreur sans message'),
    left(p_stack, 4000),
    coalesce(nullif(left(split_part(split_part(p_path, '?', 1), '#', 1), 300), ''), '/'),
    left(p_user_agent, 300)
  );
end;
$$;
revoke execute on function public.report_client_error(text, text, text, text) from public, anon;
grant execute on function public.report_client_error(text, text, text, text) to authenticated;
