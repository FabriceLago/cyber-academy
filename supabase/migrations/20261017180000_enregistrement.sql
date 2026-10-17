-- Enregistrement des tentatives par le serveur (étape 10).
-- Le navigateur n'écrit jamais directement dans quiz_attempts ni lab_attempts : il appelle ces
-- fonctions, qui vérifient la demande, datent la tentative avec l'heure du serveur et, pour un
-- quiz, corrigent elles-mêmes les réponses à partir de clés que le navigateur ne peut pas lire.

-- Nombre de questions tirées à chaque tentative (questionsPerAttempt du contenu).
alter table public.lessons
  add column quiz_size smallint not null default 5 check (quiz_size between 1 and 20);

-- Clés de correction, générées à partir du contenu (supabase/seed.sql). Format :
--   {"type": "choice",   "correct": ["a", "c"]}   choix unique, multiple, vrai ou faux
--   {"type": "matching", "pairs": ["p1", "p2"]}   chaque élément de gauche va avec la paire de même id
--   {"type": "ordering", "items": ["i1", "i2"]}   ordre attendu
create table public.quiz_answer_keys (
  lesson_id text not null references public.lessons (id) on delete cascade,
  question_id text not null check (question_id ~ '^[a-z0-9-]+$'),
  answer jsonb not null check (answer ->> 'type' in ('choice', 'matching', 'ordering')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (lesson_id, question_id)
);

alter table public.quiz_answer_keys enable row level security;
-- Aucune politique : illisible et non modifiable depuis le navigateur, même par un administrateur.
revoke all on public.quiz_answer_keys from anon, authenticated;

create trigger quiz_answer_keys_touch_updated_at
  before update on public.quiz_answer_keys
  for each row execute function public.touch_updated_at();

-- Une réponse est-elle juste ? Mêmes règles que la correction affichée dans l'application.
create function public.is_answer_correct(answer_key jsonb, answer jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
begin
  case answer_key ->> 'type'
    when 'choice' then
      return answer ->> 'kind' = 'choice'
        and jsonb_typeof(answer -> 'selected') = 'array'
        and (select coalesce(array_agg(v order by v), '{}') from jsonb_array_elements_text(answer -> 'selected') v)
          = (select coalesce(array_agg(v order by v), '{}') from jsonb_array_elements_text(answer_key -> 'correct') v);
    when 'matching' then
      return answer ->> 'kind' = 'matching'
        and jsonb_typeof(answer -> 'matches') = 'object'
        and (select count(*) from jsonb_object_keys(answer -> 'matches')) = jsonb_array_length(answer_key -> 'pairs')
        and not exists (
          select 1 from jsonb_array_elements_text(answer_key -> 'pairs') p
          where (answer -> 'matches') ->> p is distinct from p
        );
    when 'ordering' then
      return answer ->> 'kind' = 'ordering' and answer -> 'order' = answer_key -> 'items';
    else
      return false;
  end case;
end;
$$;

-- Limitation de débit : au plus 30 tentatives de chaque sorte par heure et par compte.
create function public.check_attempt_rate(recent bigint)
returns void
language plpgsql
immutable
set search_path = ''
as $$
begin
  if recent >= 30 then
    raise exception 'Trop de tentatives en une heure : réessayez plus tard.' using errcode = 'CA429';
  end if;
end;
$$;

-- Enregistre une tentative de quiz corrigée par le serveur ; renvoie la tentative enregistrée.
-- p_answers : [{"question_id": "q1", "kind": "choice", "selected": ["a"]}, …], une par question tirée.
create function public.record_quiz_attempt(p_lesson_id text, p_answers jsonb)
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
  select quiz_size into v_size from public.lessons where id = p_lesson_id;
  if v_size is null then
    raise exception 'Leçon inconnue.' using errcode = '22023';
  end if;
  if jsonb_typeof(p_answers) is distinct from 'array' or jsonb_array_length(p_answers) <> v_size then
    raise exception 'Il faut exactement % réponses.', v_size using errcode = '22023';
  end if;
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

-- Enregistre la fin d'un laboratoire. La réussite est déclarée par le navigateur : les
-- laboratoires sont simulés côté client (limite connue, documentée).
create function public.record_lab_attempt(p_lab_id text, p_succeeded boolean, p_hints_used smallint)
returns public.lab_attempts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_row public.lab_attempts;
begin
  if v_user is null then
    raise exception 'Connexion requise.' using errcode = '28000';
  end if;
  if not exists (select 1 from public.labs where id = p_lab_id) then
    raise exception 'Laboratoire inconnu.' using errcode = '22023';
  end if;
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

-- Seules les deux fonctions d'enregistrement sont appelables, et seulement avec un compte.
revoke execute on function public.is_answer_correct(jsonb, jsonb) from public, anon, authenticated;
revoke execute on function public.check_attempt_rate(bigint) from public, anon, authenticated;
revoke execute on function public.record_quiz_attempt(text, jsonb) from public, anon;
revoke execute on function public.record_lab_attempt(text, boolean, smallint) from public, anon;
grant execute on function public.record_quiz_attempt(text, jsonb) to authenticated;
grant execute on function public.record_lab_attempt(text, boolean, smallint) to authenticated;
