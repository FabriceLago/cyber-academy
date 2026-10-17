-- Profils et rôles : chaque compte a un profil, créé à l'inscription, avec le rôle « apprenant ».
-- Le rôle « admin » ne s'attribue qu'en SQL, côté serveur : jamais depuis le navigateur.

create type public.app_role as enum ('apprenant', 'admin');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 50),
  role public.app_role not null default 'apprenant',
  weekly_goal smallint check (weekly_goal between 1 and 7),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Un profil par compte ; le rôle n''est modifiable que côté serveur.';

alter table public.profiles enable row level security;

-- Chacun lit et modifie son seul profil.
create policy "Lire son profil" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

create policy "Modifier son profil" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Défense en profondeur : depuis le navigateur, seuls le nom et l'objectif sont modifiables ;
-- la création passe par le déclencheur ci-dessous, la suppression par celle du compte.
revoke all on public.profiles from anon;
revoke insert, update, delete on public.profiles from authenticated;
grant update (display_name, weekly_goal) on public.profiles to authenticated;

-- L'utilisateur courant est-il administrateur ? (security definer : ne dépend pas des politiques)
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- Met à jour updated_at à chaque modification.
create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- À l'inscription : profil créé avec le nom choisi (tronqué) et toujours le rôle « apprenant »,
-- quel que soit le contenu des métadonnées envoyées par le navigateur.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(left(trim(new.raw_user_meta_data ->> 'display_name'), 50), ''), 'Apprenant')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
