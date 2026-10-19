-- Droit à l'effacement (RGPD, article 17) : l'apprenant supprime lui-même son compte, depuis son
-- profil. Le profil et les tentatives partent avec lui (clés étrangères « on delete cascade »),
-- ainsi que ses sessions (schéma auth). Seul le compte connecté peut se supprimer.
create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Connexion requise.' using errcode = '42501';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

-- Les droits par défaut de Supabase donnent l'exécution à anon : on la retire, comme pour les
-- autres fonctions, et on l'ouvre aux seuls comptes.
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
