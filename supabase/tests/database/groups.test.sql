-- Groupes : rien sans compte, aucune écriture directe, un accord pour entrer, la progression des
-- membres réservée au responsable, le Premium du groupe accordé par l'administrateur, des
-- limites. Tout est annulé à la fin.
begin;
create extension if not exists pgtap with schema extensions;
select plan(20);

update public.learning_paths set premium = true where id = 'analyste-soc-junior';
insert into auth.users (id, email) values
  ('d4444444-4444-4444-4444-444444444444', 'prof@exemple.test'),
  ('e5555555-5555-5555-5555-555555555555', 'bastien@exemple.test'),
  ('f6666666-6666-6666-6666-666666666666', 'alice@exemple.test');
update public.profiles set display_name = 'Bastien' where id = 'e5555555-5555-5555-5555-555555555555';
update public.profiles set display_name = 'Alice' where id = 'f6666666-6666-6666-6666-666666666666';

-- Sans compte
set local role anon;
select throws_ok($$ select * from public.groups $$, '42501', null, 'sans compte, aucun groupe n’est lisible');
reset role;

-- La responsable crée son groupe
select set_config('request.jwt.claims', '{"sub": "d4444444-4444-4444-4444-444444444444", "role": "authenticated"}', true);
set local role authenticated;
select throws_ok(
  $$ select public.create_group(E'Club‮cyber') $$, '23514', null,
  'un nom avec un caractère invisible est refusé'
);
select results_eq(
  $$ select name, join_code ~ '^[A-HJ-NP-Z2-9]{10}$' from public.create_group('  Club cyber ') $$,
  $$ values ('Club cyber'::text, true) $$,
  'un groupe se crée, avec un code de 10 signes sans ambiguïté'
);
select throws_ok(
  $$ insert into public.groups (owner_id, name, join_code)
     values ('d4444444-4444-4444-4444-444444444444', 'Pirate', 'AAAAAAAAAA') $$,
  '42501', null,
  'aucun groupe ne se crée sans passer par le serveur'
);
reset role;
create temp table club as select id, join_code from public.groups where name = 'Club cyber';
grant select on club to authenticated;

-- Bastien rejoint le groupe
select set_config('request.jwt.claims', '{"sub": "e5555555-5555-5555-5555-555555555555", "role": "authenticated"}', true);
set local role authenticated;
select is_empty($$ select * from public.groups $$, 'avant d’y entrer, Bastien ne voit pas le groupe');
select throws_ok(
  $$ select public.join_group((select join_code from club), false) $$, '22023', null,
  'sans accord (15 ans et plus, progression visible), on ne rejoint pas un groupe'
);
select throws_ok(
  $$ select public.join_group('AAAAAAAAAA', true) $$, 'CA404', 'Code inconnu.',
  'un code inconnu est refusé'
);
select lives_ok(
  $$ select public.join_group(
       lower(substr((select join_code from club), 1, 5)) || '-' || substr((select join_code from club), 6),
       true) $$,
  'le code se saisit aussi en minuscules, avec un tiret'
);
select results_eq($$ select name from public.groups $$, $$ values ('Club cyber'::text) $$, 'membre, Bastien voit le groupe');
select throws_ok(
  $$ select * from public.group_progress((select id from club)) $$, '42501', null,
  'la progression des membres est réservée au responsable'
);

-- Alice entre aussi ; Bastien réussit deux quiz, dont un dont le laboratoire reste à faire.
reset role;
insert into public.group_members (group_id, user_id)
select id, 'f6666666-6666-6666-6666-666666666666' from club;
insert into public.quiz_attempts (user_id, lesson_id, question_ids, correct_question_ids) values
  ('e5555555-5555-5555-5555-555555555555', 'ordinateur-et-fichiers', '{a,b,c,d,e}', '{a,b,c,d,e}'),
  ('e5555555-5555-5555-5555-555555555555', 'decouvrir-le-terminal', '{a,b,c,d,e}', '{a,b,c,d,e}');
set local role authenticated;
select results_eq(
  $$ select user_id::text from public.group_members $$,
  $$ values ('e5555555-5555-5555-5555-555555555555') $$,
  'Bastien ne voit que sa propre adhésion'
);
delete from public.group_members where user_id = 'f6666666-6666-6666-6666-666666666666';
reset role;
select results_eq(
  $$ select count(*) from public.group_members where group_id = (select id from club) $$,
  $$ values (2::bigint) $$,
  'un membre ne retire personne d’autre'
);

-- La responsable suit son groupe
select set_config('request.jwt.claims', '{"sub": "d4444444-4444-4444-4444-444444444444", "role": "authenticated"}', true);
set local role authenticated;
select results_eq(
  $$ select display_name, lessons_completed, labs_succeeded, last_activity is not null
     from public.group_progress((select id from club)) $$,
  $$ values ('Alice'::text, 0::bigint, 0::bigint, false), ('Bastien', 1, 0, true) $$,
  'la responsable voit pseudonyme, leçons validées (quiz et laboratoire), laboratoires, activité'
);
select ok(
  public.regenerate_join_code((select id from club)) <> (select join_code from club),
  'un nouveau code remplace l’ancien'
);
delete from public.group_members where user_id = 'f6666666-6666-6666-6666-666666666666';
select results_eq(
  $$ select count(*) from public.group_progress((select id from club)) $$,
  $$ values (1::bigint) $$,
  'la responsable retire un membre'
);

-- Premium accordé au groupe par l'administrateur (offre sur devis)
reset role;
select set_config('request.jwt.claims', '{"sub": "e5555555-5555-5555-5555-555555555555", "role": "authenticated"}', true);
set local role authenticated;
select throws_ok(
  $$ select public.record_lab_attempt('lab-journaux', true, 0::smallint) $$,
  'CA402', 'Abonnement requis.',
  'sans Premium accordé au groupe, le parcours premium reste fermé'
);
reset role;
update public.groups set premium_until = now() + interval '1 year' where id = (select id from club);
set local role authenticated;
select lives_ok(
  $$ select public.record_lab_attempt('lab-journaux', true, 0::smallint) $$,
  'Premium accordé au groupe : ses membres ont accès au parcours premium'
);
delete from public.group_members where user_id = 'e5555555-5555-5555-5555-555555555555';
select is_empty($$ select * from public.groups $$, 'Bastien quitte le groupe et ne le voit plus');

-- Limites, puis suppression du groupe
reset role;
select set_config('request.jwt.claims', '{"sub": "d4444444-4444-4444-4444-444444444444", "role": "authenticated"}', true);
set local role authenticated;
select throws_ok(
  $$ select public.create_group('Groupe ' || n) from generate_series(1, 10) as n $$,
  'CA429', 'Dix groupes au plus par compte.',
  'dix groupes au plus par compte'
);
delete from public.groups where id = (select id from club);
reset role;
select is_empty(
  $$ select * from public.groups where id = (select id from club) $$,
  'la responsable supprime son groupe'
);

select * from finish();
rollback;
