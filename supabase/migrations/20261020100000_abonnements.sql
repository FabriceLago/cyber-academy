-- Abonnement des particuliers (Stripe). Les parcours marqués « premium » ne s'ouvrent qu'avec un
-- abonnement actif. L'état de l'abonnement n'est écrit que par le serveur (fonction stripe-webhook,
-- clé service_role) : le navigateur le lit, sans pouvoir le modifier.

alter table public.learning_paths add column premium boolean not null default false;

create table public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id text not null unique,
  stripe_subscription_id text unique,
  status text not null default 'incomplete' check (status in (
    'incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused'
  )),
  price_id text,
  current_period_end timestamptz,
  -- Résilié : reste actif jusqu'à current_period_end, puis n'est plus facturé.
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;
create policy "Lire son abonnement" on public.subscriptions
  for select to authenticated
  using (user_id = (select auth.uid()));
revoke all on public.subscriptions from anon;
revoke insert, update, delete, truncate, trigger, references on public.subscriptions from authenticated;

create trigger subscriptions_touch_updated_at
  before update on public.subscriptions
  for each row execute function public.touch_updated_at();

-- Abonnement donnant accès aux parcours premium.
create function public.has_active_subscription(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.subscriptions
    where user_id = p_user
      and status in ('active', 'trialing')
      and (current_period_end is null or current_period_end > now())
  );
$$;

-- La leçon appartient-elle à un parcours premium ?
create function public.is_premium_lesson(p_lesson_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((
    select p.premium from public.lessons l
    join public.modules m on m.id = l.module_id
    join public.learning_paths p on p.id = m.path_id
    where l.id = p_lesson_id
  ), false);
$$;

-- Enregistrements : mêmes règles qu'à l'étape 12, plus l'abonnement pour un parcours premium.
create or replace function public.record_quiz_attempt(p_lesson_id text, p_answers jsonb)
returns public.quiz_attempts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_size smallint;
  v_question_ids text[];
  v_correct text[];
  v_known int;
  v_row public.quiz_attempts;
begin
  if v_user is null then
    raise exception 'Connexion requise.' using errcode = '28000';
  end if;
  if octet_length(p_answers::text) > 8192 then
    raise exception 'Réponses trop volumineuses.' using errcode = '22023';
  end if;
  select quiz_size into v_size from public.lessons where id = p_lesson_id;
  if v_size is null then
    raise exception 'Leçon inconnue.' using errcode = '22023';
  end if;
  if public.is_premium_lesson(p_lesson_id) and not public.has_active_subscription(v_user) then
    raise exception 'Abonnement requis.' using errcode = 'CA402';
  end if;
  if jsonb_typeof(p_answers) is distinct from 'array' or jsonb_array_length(p_answers) <> v_size then
    raise exception 'Il faut exactement % réponses.', v_size using errcode = '22023';
  end if;
  -- Un enregistrement à la fois par compte : le décompte voit les tentatives des envois précédents.
  perform pg_advisory_xact_lock(hashtextextended('tentatives:' || v_user::text, 0));
  perform public.check_attempt_rate(
    (select count(*) from public.quiz_attempts
     where user_id = v_user and submitted_at > now() - interval '1 hour')
  );

  select
    array_agg(a ->> 'question_id' order by ord),
    coalesce(array_agg(a ->> 'question_id' order by ord)
      filter (where k.answer is not null and public.is_answer_correct(k.answer, a)), '{}'),
    count(k.question_id)
  into v_question_ids, v_correct, v_known
  from jsonb_array_elements(p_answers) with ordinality as t(a, ord)
  left join public.quiz_answer_keys k
    on k.lesson_id = p_lesson_id and k.question_id = a ->> 'question_id';

  -- Chaque question doit appartenir au quiz de la leçon, une seule fois.
  if v_known <> v_size or not public.has_distinct_elements(v_question_ids) then
    raise exception 'Questions invalides pour cette leçon.' using errcode = '22023';
  end if;

  insert into public.quiz_attempts (user_id, lesson_id, question_ids, correct_question_ids)
  values (v_user, p_lesson_id, v_question_ids, v_correct)
  returning * into v_row;
  return v_row;
end;
$$;

create or replace function public.record_lab_attempt(p_lab_id text, p_succeeded boolean, p_hints_used smallint)
returns public.lab_attempts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_lesson text;
  v_row public.lab_attempts;
begin
  if v_user is null then
    raise exception 'Connexion requise.' using errcode = '28000';
  end if;
  select lesson_id into v_lesson from public.labs where id = p_lab_id;
  if v_lesson is null then
    raise exception 'Laboratoire inconnu.' using errcode = '22023';
  end if;
  if public.is_premium_lesson(v_lesson) and not public.has_active_subscription(v_user) then
    raise exception 'Abonnement requis.' using errcode = 'CA402';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('tentatives:' || v_user::text, 0));
  perform public.check_attempt_rate(
    (select count(*) from public.lab_attempts
     where user_id = v_user and completed_at > now() - interval '1 hour')
  );
  insert into public.lab_attempts (user_id, lab_id, succeeded, hints_used)
  values (v_user, p_lab_id, p_succeeded, p_hints_used)
  returning * into v_row;
  return v_row;
end;
$$;

-- Un compte dont l'abonnement est encore facturé ne se supprime pas : Stripe continuerait de
-- prélever. Résilié (fin de période), il peut l'être.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Connexion requise.' using errcode = '42501';
  end if;
  if exists (
    select 1 from public.subscriptions
    where user_id = auth.uid()
      and status in ('active', 'trialing', 'past_due', 'unpaid')
      and not cancel_at_period_end
  ) then
    raise exception 'Résiliez d’abord votre abonnement.' using errcode = 'CA409';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

-- Droits : les fonctions auxiliaires ne sont appelables que par les fonctions du serveur.
revoke execute on function public.has_active_subscription(uuid) from public, anon, authenticated;
revoke execute on function public.is_premium_lesson(text) from public, anon, authenticated;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
