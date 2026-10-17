-- Tentatives de quiz et de laboratoire : les seuls faits enregistrés. La progression (leçons
-- validées, compétences) se calcule à partir d'eux, d'où l'absence de table user_lesson_progress.
--
-- Protection contre la triche : aucun droit d'écriture depuis le navigateur. À l'étape 10, les
-- tentatives seront ajoutées par des fonctions serveur qui corrigent elles-mêmes les réponses.
-- Une tentative ne se modifie ni ne se supprime (sauf avec le compte, par cascade).

-- Vrai si le tableau ne contient aucun doublon.
create function public.has_distinct_elements(items text[])
returns boolean
language sql
immutable
set search_path = ''
as $$
  select count(*) = count(distinct item) from unnest(items) as item;
$$;

create table public.quiz_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null references public.lessons (id),
  submitted_at timestamptz not null default now(),
  question_ids text[] not null
    check (cardinality(question_ids) between 1 and 20 and public.has_distinct_elements(question_ids)),
  correct_question_ids text[] not null
    check (correct_question_ids <@ question_ids and public.has_distinct_elements(correct_question_ids)),
  created_at timestamptz not null default now()
);

create index quiz_attempts_user_lesson_idx on public.quiz_attempts (user_id, lesson_id, submitted_at);

create table public.lab_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  lab_id text not null references public.labs (id),
  completed_at timestamptz not null default now(),
  succeeded boolean not null,
  hints_used smallint not null check (hints_used between 0 and 20),
  created_at timestamptz not null default now()
);

create index lab_attempts_user_lab_idx on public.lab_attempts (user_id, lab_id, completed_at);

alter table public.quiz_attempts enable row level security;
alter table public.lab_attempts enable row level security;

-- Chacun ne lit que ses tentatives ; même un administrateur ne lit pas celles des autres.
create policy "Lire ses tentatives de quiz" on public.quiz_attempts
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Lire ses tentatives de laboratoire" on public.lab_attempts
  for select to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.quiz_attempts, public.lab_attempts from anon;
revoke insert, update, delete, truncate on public.quiz_attempts, public.lab_attempts from authenticated;
