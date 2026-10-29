-- Groupes (associations, écoles, formations) : un responsable suit la progression des membres qui
-- ont rejoint son groupe avec son code, en l'acceptant (15 ans et plus). Le navigateur lit ses
-- groupes et ses adhésions ; il crée, rejoint et suit par des fonctions serveur, et supprime par
-- la RLS (quitter, retirer un membre, supprimer son groupe).
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (
    char_length(name) between 1 and 60
    and name = btrim(name)
    and name !~ '[[:cntrl:]​-‏‪-‮⁠-⁩﻿]'
  ),
  -- Code à partager : 10 caractères sans ambiguïté (ni 0/O ni 1/I), environ 10^15 possibilités.
  join_code text not null unique,
  -- Premium accordé par l'administrateur (offre sur devis) jusqu'à cette date ; vide : aucun.
  premium_until timestamptz,
  created_at timestamptz not null default now()
);
create index groups_owner_idx on public.groups (owner_id);

create table public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Date de l'accord : 15 ans ou plus, progression visible par le responsable.
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);
create index group_members_user_idx on public.group_members (user_id);

alter table public.groups enable row level security;
alter table public.group_members enable row level security;
create policy "Lire les groupes qu'on anime ou qu'on a rejoints" on public.groups
  for select to authenticated
  using (
    owner_id = (select auth.uid())
    or id in (select group_id from public.group_members where user_id = (select auth.uid()))
  );
-- Le compte connecté anime-t-il ce groupe ? Pour la politique de group_members : une sous-requête
-- sur groups y repasserait par la politique de groups, qui lit group_members (récursion).
create function public.owns_group(p_group uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.groups where id = p_group and owner_id = (select auth.uid()));
$$;
-- Ses adhésions, et celles des groupes qu'on anime : une ligne ne se supprime que si on peut la
-- lire. La progression des membres, elle, passe par group_progress.
create policy "Lire ses adhésions et celles de ses groupes" on public.group_members
  for select to authenticated
  using (user_id = (select auth.uid()) or public.owns_group(group_id));
-- Quitter un groupe, ou en retirer un membre quand on en est le responsable.
create policy "Quitter ou retirer" on public.group_members
  for delete to authenticated
  using (user_id = (select auth.uid()) or public.owns_group(group_id));
create policy "Supprimer son groupe" on public.groups
  for delete to authenticated
  using (owner_id = (select auth.uid()));
revoke all on public.groups, public.group_members from anon;
revoke insert, update, truncate, trigger, references
  on public.groups, public.group_members from authenticated;

-- Code d'invitation tiré au hasard (pgcrypto) : 10 octets, chacun ramené à l'un des 32 signes.
create function public.new_join_code()
returns text
language sql
volatile
set search_path = ''
as $$
  select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', get_byte(r.b, i) % 32 + 1, 1), '' order by i)
  from (select extensions.gen_random_bytes(10) as b) r, generate_series(0, 9) as i;
$$;

-- Nouveau groupe du compte connecté, qui en devient le responsable (dix au plus par compte).
create function public.create_group(p_name text)
returns public.groups
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_row public.groups;
begin
  if v_user is null then
    raise exception 'Connexion requise.' using errcode = '28000';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('groupes:' || v_user::text, 0));
  if (select count(*) from public.groups where owner_id = v_user) >= 10 then
    raise exception 'Dix groupes au plus par compte.' using errcode = 'CA429';
  end if;
  -- ponytail: une collision de code (1 chance sur 10^15) ferait échouer la création ; réessayer.
  insert into public.groups (owner_id, name, join_code)
  values (v_user, btrim(p_name), public.new_join_code())
  returning * into v_row;
  return v_row;
end;
$$;

-- Rejoindre un groupe avec son code (espaces, tirets et minuscules acceptés). p_accepted : la
-- personne certifie avoir 15 ans ou plus et accepte que le responsable voie sa progression.
create function public.join_group(p_code text, p_accepted boolean)
returns public.groups
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_group public.groups;
begin
  if v_user is null then
    raise exception 'Connexion requise.' using errcode = '28000';
  end if;
  if p_accepted is not true then
    raise exception 'Accord requis pour rejoindre un groupe.' using errcode = '22023';
  end if;
  select * into v_group from public.groups
  where join_code = upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  if not found then
    raise exception 'Code inconnu.' using errcode = 'CA404';
  end if;
  -- Une adhésion à la fois par groupe : le décompte voit celles des envois précédents.
  perform pg_advisory_xact_lock(hashtextextended('groupe:' || v_group.id::text, 0));
  if not exists (select 1 from public.group_members where group_id = v_group.id and user_id = v_user)
     and (select count(*) from public.group_members where group_id = v_group.id) >= 200 then
    raise exception 'Ce groupe est complet.' using errcode = 'CA409';
  end if;
  insert into public.group_members (group_id, user_id) values (v_group.id, v_user)
  on conflict do nothing;
  return v_group;
end;
$$;

-- Nouveau code (l'ancien ne permet plus de rejoindre le groupe) : responsable seulement.
create function public.regenerate_join_code(p_group uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code text;
begin
  update public.groups set join_code = public.new_join_code()
  where id = p_group and owner_id = (select auth.uid())
  returning join_code into v_code;
  if v_code is null then
    raise exception 'Réservé au responsable du groupe.' using errcode = '42501';
  end if;
  return v_code;
end;
$$;

-- Progression des membres, pour le responsable seulement : pseudonyme, date d'adhésion, leçons
-- validées (même règle que l'application : quiz réussi et, s'il y en a un, laboratoire réussi),
-- laboratoires réussis et dernière activité. Ni adresse e-mail ni réponses.
create function public.group_progress(p_group uuid)
returns table (
  user_id uuid,
  display_name text,
  joined_at timestamptz,
  lessons_completed bigint,
  labs_succeeded bigint,
  last_activity timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
begin
  if not exists (
    select 1 from public.groups g where g.id = p_group and g.owner_id = (select auth.uid())
  ) then
    raise exception 'Réservé au responsable du groupe.' using errcode = '42501';
  end if;
  return query
  select
    m.user_id,
    p.display_name,
    m.joined_at,
    (select count(*) from public.lessons l
     join public.modules mo on mo.id = l.module_id
     left join public.labs lb on lb.lesson_id = l.id
     where exists (
         select 1 from public.quiz_attempts qa
         where qa.user_id = m.user_id and qa.lesson_id = l.id
           and cardinality(qa.correct_question_ids) >= mo.pass_threshold * cardinality(qa.question_ids))
       and (lb.id is null or exists (
         select 1 from public.lab_attempts la
         where la.user_id = m.user_id and la.lab_id = lb.id and la.succeeded))),
    (select count(distinct la.lab_id) from public.lab_attempts la
     where la.user_id = m.user_id and la.succeeded),
    greatest(
      (select max(qa.submitted_at) from public.quiz_attempts qa where qa.user_id = m.user_id),
      (select max(la.completed_at) from public.lab_attempts la where la.user_id = m.user_id))
  from public.group_members m
  join public.profiles p on p.id = m.user_id
  where m.group_id = p_group
  order by p.display_name, m.joined_at;
end;
$$;

-- Accès Premium : abonnement (payé, en essai ou en relance), ou groupe dont le Premium a été
-- accordé par l'administrateur, pour son responsable comme pour ses membres.
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
  ) or exists (
    select 1 from public.groups g
    where g.premium_until > now()
      and (g.owner_id = p_user or exists (
        select 1 from public.group_members m where m.group_id = g.id and m.user_id = p_user))
  );
$$;

revoke execute on function public.new_join_code() from public, anon, authenticated;
revoke execute on function public.owns_group(uuid) from public, anon;
grant execute on function public.owns_group(uuid) to authenticated;
revoke execute on function public.create_group(text) from public, anon;
revoke execute on function public.join_group(text, boolean) from public, anon;
revoke execute on function public.regenerate_join_code(uuid) from public, anon;
revoke execute on function public.group_progress(uuid) from public, anon;
grant execute on function public.create_group(text) to authenticated;
grant execute on function public.join_group(text, boolean) to authenticated;
grant execute on function public.regenerate_join_code(uuid) to authenticated;
grant execute on function public.group_progress(uuid) to authenticated;
