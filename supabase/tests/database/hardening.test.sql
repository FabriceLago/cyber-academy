-- Durcissement (étape 12) : droits d'exécution au plus juste, réponses bornées, noms affichés
-- sans caractères piégés. La concurrence (limite de débit) est testée de bout en bout dans
-- e2e/security.spec.ts : une seule session SQL ne peut pas simuler des envois simultanés.
begin;
create extension if not exists pgtap with schema extensions;
select plan(14);

select is_empty(
  $$ select table_name || ' : ' || grantee || ' : ' || privilege_type
     from information_schema.role_table_grants
     where table_schema = 'public' and grantee in ('anon', 'authenticated')
       and privilege_type in ('TRUNCATE', 'TRIGGER', 'REFERENCES') $$,
  'les rôles de l’API n’ont ni TRUNCATE (qui ignore la RLS), ni TRIGGER, ni REFERENCES'
);

-- Fonctions du schéma public qu'un rôle peut appeler.
create function pg_temp.callable(r text) returns setof text language sql as $$
  select p.proname::text from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and has_function_privilege(r, p.oid, 'execute') order by 1
$$;

select is_empty($$ select * from pg_temp.callable('anon') $$, 'sans compte, aucune fonction n’est appelable');
select results_eq(
  $$ select * from pg_temp.callable('authenticated') $$,
  $$ values ('delete_my_account'), ('is_admin'), ('record_lab_attempt'), ('record_quiz_attempt') $$,
  'avec un compte : seulement les deux enregistrements, la suppression du compte et is_admin'
);

insert into auth.users (id, email, raw_user_meta_data) values
  ('33333333-3333-3333-3333-333333333333', 'chloe@exemple.test', '{"display_name": "  Chlo‮é\u0007  "}'),
  ('44444444-4444-4444-4444-444444444444', 'dan@exemple.test', '{"display_name": "​​"}');
select results_eq(
  $$ select display_name from public.profiles where id in
       ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444') order by id $$,
  $$ values ('Chloé'), ('Apprenant') $$,
  'à l’inscription, le nom affiché est nettoyé (ou remplacé s’il ne reste rien)'
);

select set_config('request.jwt.claims', '{"sub": "33333333-3333-3333-3333-333333333333", "role": "authenticated"}', true);
set local role authenticated;
select lives_ok(
  $$ update public.profiles set display_name = 'Chloé M.', weekly_goal = 3 $$,
  'un nom normal et un objectif se modifient'
);
select throws_ok(
  $$ update public.profiles set display_name = ' Chloé' $$,
  '23514', null,
  'un nom avec des espaces en bord est refusé'
);
select throws_ok(
  $$ update public.profiles set display_name = E'Chlo‮é' $$,
  '23514', null,
  'un caractère qui inverse le sens d’écriture est refusé'
);
select throws_ok(
  $$ update public.profiles set display_name = E'Chloé\n' $$,
  '23514', null,
  'un caractère de contrôle est refusé'
);
select throws_ok(
  $$ select public.record_quiz_attempt('ordinateur-et-fichiers', (
       select jsonb_agg(jsonb_build_object(
         'question_id', 'q' || i, 'kind', 'choice',
         'selected', (select jsonb_agg(repeat('x', 50)) from generate_series(1, 40))))
       from generate_series(1, 5) i)) $$,
  '22023', 'Réponses trop volumineuses.',
  'des réponses de plus de 8 Ko sont refusées avant tout traitement'
);
select throws_ok(
  $$ select public.handle_new_user() $$,
  '42501', null,
  'la fonction de création de profil n’est pas appelable depuis le navigateur'
);

-- Suppression du compte : celui de Chloé seulement, avec son profil et ses tentatives.
reset role;
insert into public.lab_attempts (user_id, lab_id, succeeded, hints_used)
values ('33333333-3333-3333-3333-333333333333', 'lab-terminal', true, 0);
set local role authenticated;
select lives_ok($$ select public.delete_my_account() $$, 'un apprenant supprime son compte');
reset role;
select is_empty(
  $$ select 'compte' from auth.users where id = '33333333-3333-3333-3333-333333333333'
     union all select 'profil' from public.profiles where id = '33333333-3333-3333-3333-333333333333'
     union all select 'tentative' from public.lab_attempts
       where user_id = '33333333-3333-3333-3333-333333333333' $$,
  'le compte supprimé emporte son profil et ses tentatives'
);
select isnt_empty(
  $$ select 1 from auth.users where id = '44444444-4444-4444-4444-444444444444' $$,
  'les autres comptes restent'
);
select set_config('request.jwt.claims', '{"role": "authenticated"}', true);
set local role authenticated;
select throws_ok(
  $$ select public.delete_my_account() $$,
  '42501', 'Connexion requise.',
  'sans utilisateur identifié, rien n’est supprimé'
);

select * from finish();
rollback;
