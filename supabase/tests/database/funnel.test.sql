-- Statistiques de décrochage : totaux justes par leçon, dans l'ordre du catalogue, et aucun accès
-- depuis le site. Tout est annulé à la fin.
begin;
create extension if not exists pgtap with schema extensions;
select plan(4);

-- Totaux avant les tentatives de ce test : la base locale peut en contenir d'autres.
create temp table avant as select * from public.learning_funnel();

insert into auth.users (id, email) values
  ('66666666-6666-6666-6666-666666666666', 'fanny@exemple.test'),
  ('77777777-7777-7777-7777-777777777777', 'gael@exemple.test');
insert into public.quiz_attempts (user_id, lesson_id, question_ids, correct_question_ids) values
  -- Fanny réussit la leçon 1, échoue, puis la réussit encore : elle ne compte qu'une fois.
  ('66666666-6666-6666-6666-666666666666', 'ordinateur-et-fichiers', '{a,b,c,d,e}', '{a,b,c,d,e}'),
  ('66666666-6666-6666-6666-666666666666', 'ordinateur-et-fichiers', '{a,b,c,d,e}', '{a}'),
  ('66666666-6666-6666-6666-666666666666', 'ordinateur-et-fichiers', '{a,b,c,d,e}', '{a,b,c,d,e}'),
  -- Gaël échoue à la leçon 1 et s'arrête là.
  ('77777777-7777-7777-7777-777777777777', 'ordinateur-et-fichiers', '{a,b,c,d,e}', '{a,b}'),
  -- 4 sur 5 = 80 % : le seuil de la leçon 2 est atteint.
  ('66666666-6666-6666-6666-666666666666', 'decouvrir-le-terminal', '{a,b,c,d,e}', '{a,b,c,d}');
insert into public.lab_attempts (user_id, lab_id, succeeded, hints_used) values
  -- Deux réussites de Fanny au même laboratoire : une seule apprenante.
  ('66666666-6666-6666-6666-666666666666', 'lab-terminal', true, 0),
  ('66666666-6666-6666-6666-666666666666', 'lab-terminal', true, 0),
  ('77777777-7777-7777-7777-777777777777', 'lab-terminal', false, 2);

create temp table apres as select * from public.learning_funnel();

select results_eq(
  $$ select lesson_id from apres where lesson_rank <= 2 order by lesson_rank $$,
  $$ values ('ordinateur-et-fichiers'::text), ('decouvrir-le-terminal') $$,
  'les leçons suivent l’ordre du catalogue'
);
select results_eq(
  $$ select a.lesson_id, a.attempted - b.attempted, a.passed - b.passed,
            a.lab_succeeded - b.lab_succeeded
     from apres a join avant b using (lesson_id)
     where a.lesson_id in ('ordinateur-et-fichiers', 'decouvrir-le-terminal')
     order by a.lesson_rank $$,
  $$ values ('ordinateur-et-fichiers'::text, 2::bigint, 1::bigint, 0::bigint),
            ('decouvrir-le-terminal', 1::bigint, 1::bigint, 1::bigint) $$,
  'chaque apprenant compte une fois : tenté, réussi, laboratoire réussi'
);

-- Depuis le site, ni sans compte ni avec un compte. Le droit est vérifié sur la fonction : un
-- appel sans compte échouerait de toute façon sur la table, ce qui ne prouverait rien.
select ok(
  not has_function_privilege('anon', 'public.learning_funnel()', 'execute'),
  'sans compte, la fonction n’est pas appelable'
);
select set_config('request.jwt.claims', '{"sub": "66666666-6666-6666-6666-666666666666", "role": "authenticated"}', true);
set local role authenticated;
select throws_ok(
  $$ select * from public.learning_funnel() $$,
  '42501', 'permission denied for function learning_funnel',
  'avec un compte, les statistiques restent inaccessibles'
);
reset role;

select * from finish();
rollback;
