-- Signalements d'erreurs : réservés aux comptes, table illisible depuis le navigateur, cible et
-- message vérifiés, limite de débit, effacés avec le compte. Tout est annulé à la fin.
begin;
create extension if not exists pgtap with schema extensions;
select plan(17);

insert into auth.users (id, email) values
  ('55555555-5555-5555-5555-555555555555', 'eve@exemple.test');

-- Une question de la leçon 1 (clés lisibles ici seulement : préparation en administrateur).
create temp table cible as
select lesson_id, question_id from public.quiz_answer_keys
where lesson_id = 'ordinateur-et-fichiers' order by question_id limit 1;
grant select on cible to anon, authenticated;

-- Sans compte
set local role anon;
select throws_ok(
  $$ select public.report_content('Une coquille dans l’explication.', 'ordinateur-et-fichiers') $$,
  '42501', null,
  'sans compte, impossible de signaler'
);
select throws_ok(
  $$ select * from public.content_reports $$,
  '42501', null,
  'sans compte, la table est illisible'
);
reset role;

-- Avec un compte
select set_config('request.jwt.claims', '{"sub": "55555555-5555-5555-5555-555555555555", "role": "authenticated"}', true);
set local role authenticated;
select lives_ok(
  $$ select public.report_content('  Une coquille dans l’explication.  ', 'ordinateur-et-fichiers') $$,
  'une leçon se signale'
);
select lives_ok(
  $$ select public.report_content('La réponse B me semble aussi juste.', c.lesson_id, c.question_id)
     from cible c $$,
  'une question se signale'
);
select lives_ok(
  $$ select public.report_content('La consigne de la tâche 3 est ambiguë.', p_lab_id => 'lab-sauvegarde') $$,
  'un laboratoire se signale'
);
select throws_ok(
  $$ select * from public.content_reports $$,
  '42501', null,
  'avec un compte, la table reste illisible'
);
select throws_ok(
  $$ insert into public.content_reports (user_id, lesson_id, message)
     values ('55555555-5555-5555-5555-555555555555', 'ordinateur-et-fichiers', 'Écriture directe.') $$,
  '42501', null,
  'ni écriture directe dans la table'
);
select throws_ok(
  $$ select public.report_content('   court   ', 'ordinateur-et-fichiers') $$,
  '23514', null,
  'un message de moins de 10 caractères (espaces retirés) est refusé'
);
select throws_ok(
  $$ select public.report_content(repeat('x', 1001), 'ordinateur-et-fichiers') $$,
  '23514', null,
  'un message de plus de 1000 caractères est refusé'
);
select throws_ok(
  $$ select public.report_content('Un signalement sans cible.') $$,
  '23514', null,
  'il faut une cible'
);
select throws_ok(
  $$ select public.report_content('Deux cibles à la fois.', 'ordinateur-et-fichiers', null, 'lab-sauvegarde') $$,
  '23514', null,
  'une seule cible à la fois'
);
select throws_ok(
  $$ select public.report_content('Une leçon qui n’existe pas.', 'inexistante') $$,
  '23503', null,
  'une leçon inconnue est refusée'
);
select throws_ok(
  $$ select public.report_content('Une question qui n’existe pas.', 'ordinateur-et-fichiers', 'question-inconnue') $$,
  '23503', null,
  'une question inconnue de la leçon est refusée'
);
select lives_ok(
  $$ select public.report_content('Signalement numéro ' || n || ' ici.', 'ordinateur-et-fichiers')
     from generate_series(4, 10) n $$,
  'jusqu’à 10 signalements par heure'
);
select throws_ok(
  $$ select public.report_content('Un signalement de trop.', 'ordinateur-et-fichiers') $$,
  'CA429', null,
  'le onzième signalement de l’heure est refusé'
);
reset role;

select results_eq(
  $$ select message from public.content_reports
     where user_id = '55555555-5555-5555-5555-555555555555' order by id limit 1 $$,
  $$ values ('Une coquille dans l’explication.') $$,
  'le message est enregistré sans les espaces en bord'
);

delete from auth.users where id = '55555555-5555-5555-5555-555555555555';
select is_empty(
  $$ select 1 from public.content_reports where user_id = '55555555-5555-5555-5555-555555555555' $$,
  'les signalements partent avec le compte'
);

select * from finish();
rollback;
