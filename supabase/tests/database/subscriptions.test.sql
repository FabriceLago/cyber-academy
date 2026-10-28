-- Abonnement : lisible par son seul propriétaire, jamais modifiable depuis le navigateur ; les
-- parcours premium n'enregistrent rien sans abonnement actif ; un compte encore facturé ne se
-- supprime pas. Tout est annulé à la fin.
begin;
create extension if not exists pgtap with schema extensions;
select plan(14);

update public.learning_paths set premium = true where id = 'analyste-soc-junior';
insert into auth.users (id, email) values
  ('55555555-5555-5555-5555-555555555555', 'eve@exemple.test'),
  ('66666666-6666-6666-6666-666666666666', 'fred@exemple.test');
insert into public.subscriptions (user_id, stripe_customer_id, status, current_period_end) values
  ('66666666-6666-6666-6666-666666666666', 'cus_fred', 'active', now() + interval '1 month');

-- Réponses justes aux 5 premières questions d'une leçon (préparées en administrateur).
create temp table reponses as
select k.lesson_id, jsonb_agg(
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
  select *, row_number() over (partition by lesson_id order by question_id) as n
  from public.quiz_answer_keys
  where lesson_id in ('soc-et-journaux', 'ordinateur-et-fichiers')
) k
where k.n <= 5
group by k.lesson_id;
grant select on reponses to authenticated;

-- Sans compte
set local role anon;
select throws_ok($$ select * from public.subscriptions $$, '42501', null, 'sans compte, aucun abonnement n’est lisible');

-- Eve, sans abonnement
reset role;
select set_config('request.jwt.claims', '{"sub": "55555555-5555-5555-5555-555555555555", "role": "authenticated"}', true);
set local role authenticated;
select is_empty($$ select * from public.subscriptions $$, 'Eve ne voit pas l’abonnement de Fred');
select throws_ok(
  $$ insert into public.subscriptions (user_id, stripe_customer_id, status)
     values ('55555555-5555-5555-5555-555555555555', 'cus_eve', 'active') $$,
  '42501', null,
  'personne ne s’accorde un abonnement depuis le navigateur'
);
select throws_ok(
  $$ select public.has_active_subscription('55555555-5555-5555-5555-555555555555') $$,
  '42501', null,
  'les fonctions auxiliaires ne sont pas appelables depuis le navigateur'
);
select throws_ok(
  $$ select public.record_quiz_attempt('soc-et-journaux', (select answers from reponses where lesson_id = 'soc-et-journaux')) $$,
  'CA402', 'Abonnement requis.',
  'sans abonnement, un quiz premium n’est pas enregistré'
);
select throws_ok(
  $$ select public.record_lab_attempt('lab-journaux', true, 0::smallint) $$,
  'CA402', 'Abonnement requis.',
  'sans abonnement, un laboratoire premium n’est pas enregistré'
);
select lives_ok(
  $$ select public.record_quiz_attempt('ordinateur-et-fichiers', (select answers from reponses where lesson_id = 'ordinateur-et-fichiers')) $$,
  'sans abonnement, un parcours gratuit s’enregistre'
);

-- Fred, abonné
reset role;
select set_config('request.jwt.claims', '{"sub": "66666666-6666-6666-6666-666666666666", "role": "authenticated"}', true);
set local role authenticated;
select results_eq(
  $$ select status from public.subscriptions $$, $$ values ('active') $$,
  'Fred lit son abonnement'
);
select lives_ok(
  $$ select public.record_quiz_attempt('soc-et-journaux', (select answers from reponses where lesson_id = 'soc-et-journaux')) $$,
  'abonné, le quiz premium s’enregistre'
);
select throws_ok(
  $$ select public.delete_my_account() $$,
  'CA409', 'Résiliez d’abord votre abonnement.',
  'un compte encore facturé ne se supprime pas'
);

-- Paiement refusé : l'accès reste ouvert pendant les relances de Stripe, puis se ferme quand il
-- abandonne (abonnement résilié).
reset role;
update public.subscriptions set status = 'past_due'
where user_id = '66666666-6666-6666-6666-666666666666';
set local role authenticated;
select lives_ok(
  $$ select public.record_lab_attempt('lab-journaux', true, 0::smallint) $$,
  'paiement refusé, l’accès reste ouvert pendant les relances'
);
reset role;
update public.subscriptions set status = 'canceled'
where user_id = '66666666-6666-6666-6666-666666666666';
set local role authenticated;
select throws_ok(
  $$ select public.record_lab_attempt('lab-journaux', true, 0::smallint) $$,
  'CA402', 'Abonnement requis.',
  'relances abandonnées, l’abonnement résilié ferme l’accès'
);
reset role;
update public.subscriptions set status = 'active'
where user_id = '66666666-6666-6666-6666-666666666666';

-- Abonnement échu, puis résilié en fin de période
reset role;
update public.subscriptions set current_period_end = now() - interval '1 day'
where user_id = '66666666-6666-6666-6666-666666666666';
set local role authenticated;
select throws_ok(
  $$ select public.record_lab_attempt('lab-journaux', true, 0::smallint) $$,
  'CA402', 'Abonnement requis.',
  'un abonnement échu n’ouvre plus le parcours premium'
);
reset role;
update public.subscriptions set current_period_end = now() + interval '1 month', cancel_at_period_end = true
where user_id = '66666666-6666-6666-6666-666666666666';
set local role authenticated;
select lives_ok($$ select public.delete_my_account() $$, 'résilié, le compte peut être supprimé');

select * from finish();
rollback;
