-- Erreurs du site : envoyées par un compte connecté seulement, nettoyées (adresse sans paramètres
-- ni fragment), débit limité sans erreur, table illisible depuis le navigateur, conservation de
-- 90 jours. Tout est annulé à la fin.
begin;
create extension if not exists pgtap with schema extensions;
select plan(7);

insert into auth.users (id, email) values
  ('a7777777-7777-7777-7777-777777777777', 'hugo@exemple.test');
insert into public.client_errors (user_id, message, path, created_at) values
  ('a7777777-7777-7777-7777-777777777777', 'ancienne', '/', now() - interval '100 days');

-- Sans compte
set local role anon;
select throws_ok(
  $$ select public.report_client_error('x', null, '/', null) $$, '42501', null,
  'sans compte, aucune erreur ne s’envoie'
);
reset role;

-- Hugo, connecté
select set_config('request.jwt.claims', '{"sub": "a7777777-7777-7777-7777-777777777777", "role": "authenticated"}', true);
set local role authenticated;
select lives_ok(
  $$ select public.report_client_error('  TypeError: x is undefined  ', 'at f (main.js:1:2)',
       '/profil?code=secret#jeton', 'Mozilla/5.0') $$,
  'un compte envoie une erreur'
);
select throws_ok(
  $$ select * from public.client_errors $$, '42501', null,
  'la table n’est lisible ni par l’apprenant ni par le navigateur'
);
select lives_ok($$ select public.report_client_error('', null, '', null) $$, 'une erreur sans message s’envoie aussi');
reset role;
select results_eq(
  $$ select message, path from public.client_errors
     where user_id = 'a7777777-7777-7777-7777-777777777777' order by id $$,
  $$ values ('TypeError: x is undefined'::text, '/profil'::text), ('Erreur sans message', '/') $$,
  'message nettoyé, adresse sans paramètres ni fragment, erreur de plus de 90 jours effacée'
);

-- Boucle d'erreurs : au-delà de 20 par heure, ignorées sans erreur.
set local role authenticated;
select lives_ok(
  $$ select count(*) from (
       select public.report_client_error('boucle', null, '/', null) from generate_series(1, 25)
     ) envois $$,
  'une boucle d’erreurs ne provoque aucune erreur'
);
reset role;
select results_eq(
  $$ select count(*) from public.client_errors
     where user_id = 'a7777777-7777-7777-7777-777777777777' $$,
  $$ values (20::bigint) $$,
  'au plus 20 erreurs par heure et par compte'
);

select * from finish();
rollback;
