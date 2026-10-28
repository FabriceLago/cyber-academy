-- Statistiques de décrochage, réservées à l'administrateur du projet : pour chaque leçon, dans
-- l'ordre du catalogue, combien d'apprenants avec un compte ont tenté son quiz, l'ont réussi, puis
-- ont réussi son laboratoire. Seulement des totaux : aucun identifiant ni aucune réponse.
-- À lancer depuis l'éditeur SQL du tableau de bord Supabase :
--   select * from public.learning_funnel();
-- Fonction « invoker » (sans privilège propre) et retirée aux rôles de l'API : le navigateur ne
-- peut pas l'appeler.
create function public.learning_funnel()
returns table (
  path_title text,
  lesson_rank bigint,
  lesson_id text,
  lesson_title text,
  attempted bigint,
  passed bigint,
  lab_id text,
  lab_succeeded bigint
)
language sql
stable
set search_path = ''
as $$
  select
    p.title,
    row_number() over (order by p.position, m.position, l.position),
    l.id,
    l.title,
    (select count(distinct qa.user_id) from public.quiz_attempts qa where qa.lesson_id = l.id),
    (select count(distinct qa.user_id) from public.quiz_attempts qa
     where qa.lesson_id = l.id
       and cardinality(qa.correct_question_ids) >= m.pass_threshold * cardinality(qa.question_ids)),
    lb.id,
    (select count(distinct la.user_id) from public.lab_attempts la
     where la.lab_id = lb.id and la.succeeded)
  from public.lessons l
  join public.modules m on m.id = l.module_id
  join public.learning_paths p on p.id = m.path_id
  left join public.labs lb on lb.lesson_id = l.id
  order by p.position, m.position, l.position;
$$;

revoke execute on function public.learning_funnel() from public, anon, authenticated;
