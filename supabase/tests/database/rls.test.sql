-- Politiques de sécurité : données isolées par utilisateur, catalogue en lecture seule,
-- tentatives protégées, rôle impossible à modifier depuis le navigateur.
-- Lancer avec « npm run db:test » (Supabase local démarré). Tout est annulé à la fin.
begin;
create extension if not exists pgtap with schema extensions;
select plan(21);

-- Comptes fictifs (domaine réservé .test). Alice demande le rôle admin à l'inscription.
insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'alice@exemple.test', '{"display_name": "Alice", "role": "admin"}'),
  ('22222222-2222-2222-2222-222222222222', 'bob@exemple.test', '{}'),
  ('33333333-3333-3333-3333-333333333333', 'admin@exemple.test', '{"display_name": "Admin"}');
-- Seul le serveur nomme un administrateur.
update public.profiles set role = 'admin' where id = '33333333-3333-3333-3333-333333333333';

insert into public.quiz_attempts (user_id, lesson_id, question_ids, correct_question_ids) values
  ('11111111-1111-1111-1111-111111111111', 'ordinateur-et-fichiers', '{q1,q2}', '{q1}'),
  ('22222222-2222-2222-2222-222222222222', 'ordinateur-et-fichiers', '{q3}', '{}');
insert into public.lab_attempts (user_id, lab_id, succeeded, hints_used) values
  ('22222222-2222-2222-2222-222222222222', 'lab-terminal', true, 1);

-- Inscription et intégrité des données
select is(
  (select role from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  'apprenant'::public.app_role,
  'le rôle demandé à l’inscription est ignoré'
);
select is(
  (select display_name from public.profiles where id = '22222222-2222-2222-2222-222222222222'),
  'Apprenant',
  'un nom par défaut est donné'
);
select throws_ok(
  $$ insert into public.quiz_attempts (user_id, lesson_id, question_ids, correct_question_ids)
     values ('22222222-2222-2222-2222-222222222222', 'ordinateur-et-fichiers', '{q1}', '{q2}') $$,
  '23514', null,
  'une bonne réponse doit faire partie des questions posées'
);
select throws_ok(
  $$ insert into public.lab_attempts (user_id, lab_id, succeeded, hints_used)
     values ('22222222-2222-2222-2222-222222222222', 'lab-inconnu', true, 0) $$,
  '23503', null,
  'une tentative vise un laboratoire existant'
);

-- Visiteur sans compte
set local role anon;
select is((select count(*) from public.lessons), 7::bigint, 'sans compte, le catalogue est lisible');
select is(
  (select kind from public.labs where id = 'lab-journaux'), 'logs',
  'le laboratoire d’analyse de journaux est publié'
);
select throws_ok($$ select * from public.profiles $$, '42501', null, 'sans compte, aucun profil');
select throws_ok($$ select * from public.quiz_attempts $$, '42501', null, 'sans compte, aucune tentative');
select throws_ok(
  $$ insert into public.lessons (id, module_id, title, duration_minutes, position)
     values ('x', 'premiers-pas', 'X', 5, 9) $$,
  '42501', null,
  'sans compte, le catalogue ne se modifie pas'
);

-- Alice, apprenante
reset role;
select set_config('request.jwt.claims', '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}', true);
set local role authenticated;
select results_eq(
  $$ select id::text from public.profiles $$,
  $$ values ('11111111-1111-1111-1111-111111111111') $$,
  'Alice ne voit que son profil'
);
select is((select count(*) from public.quiz_attempts), 1::bigint, 'Alice ne voit que ses tentatives de quiz');
select is((select count(*) from public.lab_attempts), 0::bigint, 'Alice ne voit pas les laboratoires de Bob');
select throws_ok(
  $$ update public.profiles set role = 'admin' where id = '11111111-1111-1111-1111-111111111111' $$,
  '42501', null,
  'Alice ne peut pas se nommer administratrice'
);
select lives_ok(
  $$ update public.profiles set display_name = 'Alice B.', weekly_goal = 3
     where id = '11111111-1111-1111-1111-111111111111' $$,
  'Alice modifie son nom et son objectif'
);
select is_empty(
  $$ update public.profiles set display_name = 'Pirate'
     where id = '22222222-2222-2222-2222-222222222222' returning id $$,
  'Alice ne peut pas modifier le profil de Bob'
);
select throws_ok(
  $$ insert into public.quiz_attempts (user_id, lesson_id, question_ids, correct_question_ids)
     values ('11111111-1111-1111-1111-111111111111', 'ordinateur-et-fichiers', '{q1}', '{q1}') $$,
  '42501', null,
  'Alice ne peut pas écrire de tentative elle-même'
);
select throws_ok(
  $$ update public.quiz_attempts set correct_question_ids = question_ids $$,
  '42501', null,
  'Alice ne peut pas modifier une tentative'
);
select throws_ok($$ delete from public.quiz_attempts $$, '42501', null, 'Alice ne peut pas supprimer une tentative');
select is_empty(
  $$ update public.lessons set title = 'Piraté' where id = 'ordinateur-et-fichiers' returning id $$,
  'une apprenante ne modifie pas le catalogue'
);

-- Administrateur
reset role;
select set_config('request.jwt.claims', '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}', true);
set local role authenticated;
select isnt_empty(
  $$ update public.lessons set title = title where id = 'ordinateur-et-fichiers' returning id $$,
  'un administrateur peut corriger le catalogue'
);
select is(
  (select count(*) from public.quiz_attempts), 0::bigint,
  'un administrateur ne lit pas les tentatives des autres'
);

select * from finish();
rollback;
