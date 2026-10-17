-- Enregistrement des tentatives par le serveur : correction côté serveur, clés illisibles,
-- demandes invalides refusées, limite de débit. Tout est annulé à la fin.
begin;
create extension if not exists pgtap with schema extensions;
select plan(14);

insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'alice@exemple.test'),
  ('22222222-2222-2222-2222-222222222222', 'bob@exemple.test');

-- Réponses justes à 5 questions de la leçon 1, construites à partir des clés (lisibles ici
-- seulement parce que cette préparation s'exécute en administrateur de la base).
create temp table bonnes_reponses as
select jsonb_agg(
  case k.answer ->> 'type'
    when 'choice' then
      jsonb_build_object('question_id', k.question_id, 'kind', 'choice', 'selected', k.answer -> 'correct')
    when 'matching' then
      jsonb_build_object('question_id', k.question_id, 'kind', 'matching', 'matches',
        (select jsonb_object_agg(p, p) from jsonb_array_elements_text(k.answer -> 'pairs') p))
    else
      jsonb_build_object('question_id', k.question_id, 'kind', 'ordering', 'order', k.answer -> 'items')
  end order by k.question_id) as answers
from (
  select * from public.quiz_answer_keys
  where lesson_id = 'ordinateur-et-fichiers' order by question_id limit 5
) k;
grant select on bonnes_reponses to anon, authenticated;

-- Sans compte
set local role anon;
select throws_ok(
  $$ select public.record_quiz_attempt('ordinateur-et-fichiers', (select answers from bonnes_reponses)) $$,
  '42501', null,
  'sans compte, rien ne peut être enregistré'
);

-- Alice
reset role;
select set_config('request.jwt.claims', '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);
set local role authenticated;
select throws_ok($$ select * from public.quiz_answer_keys $$, '42501', null, 'les clés de correction sont illisibles');
select throws_ok(
  $$ select public.is_answer_correct('{}'::jsonb, '{}'::jsonb) $$,
  '42501', null,
  'la fonction de correction n’est pas appelable depuis le navigateur'
);
select results_eq(
  $$ select cardinality(correct_question_ids)
     from public.record_quiz_attempt('ordinateur-et-fichiers', (select answers from bonnes_reponses)) $$,
  $$ values (5) $$,
  'cinq réponses justes : le serveur compte cinq réussites'
);
select results_eq(
  $$ select cardinality(correct_question_ids)
     from public.record_quiz_attempt('ordinateur-et-fichiers', jsonb_set(
       (select answers from bonnes_reponses), '{0}',
       '{"question_id": "q1", "kind": "choice", "selected": ["zzz"]}')) $$,
  $$ values (4) $$,
  'une réponse fausse est comptée fausse, quoi qu’en dise le navigateur'
);
select is((select count(*) from public.quiz_attempts), 2::bigint, 'les deux tentatives sont enregistrées');
select ok(
  (select bool_and(user_id = '11111111-1111-1111-1111-111111111111' and submitted_at = now())
   from public.quiz_attempts),
  'l’auteur et la date sont fixés par le serveur'
);
select throws_ok(
  $$ select public.record_quiz_attempt('ordinateur-et-fichiers',
       (select jsonb_path_query_array(answers, '$[0 to 3]') from bonnes_reponses)) $$,
  '22023', 'Il faut exactement 5 réponses.',
  'il faut répondre à toutes les questions tirées'
);
select throws_ok(
  $$ select public.record_quiz_attempt('ordinateur-et-fichiers',
       (select jsonb_set(answers, '{0,question_id}', '"q99"') from bonnes_reponses)) $$,
  '22023', 'Questions invalides pour cette leçon.',
  'une question étrangère au quiz est refusée'
);
select throws_ok(
  $$ select public.record_quiz_attempt('ordinateur-et-fichiers',
       (select jsonb_set(answers, '{1}', answers -> 0) from bonnes_reponses)) $$,
  '22023', 'Questions invalides pour cette leçon.',
  'une question répétée est refusée'
);
select throws_ok(
  $$ select public.record_quiz_attempt('inexistante', (select answers from bonnes_reponses)) $$,
  '22023', 'Leçon inconnue.',
  'une leçon inconnue est refusée'
);
select results_eq(
  $$ select succeeded, hints_used from public.record_lab_attempt('lab-terminal', true, 2::smallint) $$,
  $$ values (true, 2::smallint) $$,
  'la fin d’un laboratoire est enregistrée'
);
select throws_ok(
  $$ select public.record_lab_attempt('lab-inconnu', true, 0::smallint) $$,
  '22023', 'Laboratoire inconnu.',
  'un laboratoire inconnu est refusé'
);

-- Bob a déjà 30 tentatives dans l'heure
reset role;
insert into public.quiz_attempts (user_id, lesson_id, question_ids, correct_question_ids)
select '22222222-2222-2222-2222-222222222222', 'ordinateur-et-fichiers', '{q1}', '{}'
from generate_series(1, 30);
select set_config('request.jwt.claims', '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}', true);
set local role authenticated;
select throws_ok(
  $$ select public.record_quiz_attempt('ordinateur-et-fichiers', (select answers from bonnes_reponses)) $$,
  'CA429', null,
  'au-delà de 30 tentatives par heure, le serveur refuse'
);

select * from finish();
rollback;
