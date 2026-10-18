-- Étape 12 : durcissement.
-- 1. Limite de débit : un verrou par compte sérialise les enregistrements, pour que des envois
--    simultanés ne puissent pas dépasser 30 tentatives par heure (mesuré avant : 37 sur 40).
-- 2. Réponses d'un quiz bornées à 8 Ko : une réponse ne peut pas transporter un tableau démesuré.
-- 3. Nom affiché : ni espaces en bord, ni caractères de contrôle ou invisibles (usurpation).
-- 4. Droits d'exécution au plus juste : rien sans compte ; avec un compte, les deux fonctions
--    d'enregistrement et is_admin (utilisée par les politiques RLS). Fermé par défaut ensuite.

-- Caractères refusés dans un nom affiché : contrôle, largeur nulle, sens d'écriture forcé.
-- Motif écrit en toutes lettres : une contrainte appelle ses fonctions avec les droits de
-- l'utilisateur, et aucune fonction auxiliaire ne doit être appelable depuis le navigateur.
alter table public.profiles
  add constraint profiles_display_name_clean
  check (
    display_name = btrim(display_name)
    and display_name !~ '[[:cntrl:]​-‏‪-‮⁠-⁩﻿]'
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(
        btrim(left(regexp_replace(
          coalesce(new.raw_user_meta_data ->> 'display_name', ''),
          '[[:cntrl:]​-‏‪-‮⁠-⁩﻿]', '', 'g'
        ), 50)),
        ''
      ),
      'Apprenant'
    )
  );
  return new;
end;
$$;

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
  v_row public.lab_attempts;
begin
  if v_user is null then
    raise exception 'Connexion requise.' using errcode = '28000';
  end if;
  if not exists (select 1 from public.labs where id = p_lab_id) then
    raise exception 'Laboratoire inconnu.' using errcode = '22023';
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

-- Droits d'exécution. Une fonction de déclencheur n'a pas besoin de ce droit pour s'exécuter ;
-- has_distinct_elements n'est appelée que par des contraintes vérifiées dans les fonctions
-- d'enregistrement, qui s'exécutent avec les droits de leur propriétaire.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
revoke execute on function public.has_distinct_elements(text[]) from public, anon, authenticated;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Les fonctions créées plus tard dans « public » ne seront appelables qu'après un GRANT explicite.
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
