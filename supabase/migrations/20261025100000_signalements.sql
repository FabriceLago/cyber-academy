-- Signalements d'erreurs dans le contenu (leçon, question de quiz, laboratoire), envoyés par les
-- apprenants connectés. Le navigateur ne lit ni n'écrit la table : il appelle report_content, qui
-- date le signalement et limite le débit. L'équipe les lit depuis le tableau de bord Supabase.
create table public.content_reports (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text references public.lessons (id) on delete cascade,
  question_id text,
  lab_id text references public.labs (id) on delete cascade,
  message text not null
    check (char_length(message) between 10 and 1000 and message = btrim(message)),
  created_at timestamptz not null default now(),
  -- Une seule cible : une leçon (éventuellement une de ses questions) ou un laboratoire.
  check (num_nonnulls(lesson_id, lab_id) = 1),
  check (question_id is null or lesson_id is not null),
  foreign key (lesson_id, question_id)
    references public.quiz_answer_keys (lesson_id, question_id) on delete cascade
);

create index content_reports_user_created_idx on public.content_reports (user_id, created_at);

alter table public.content_reports enable row level security;
-- Aucune politique : ni lecture ni écriture depuis le navigateur, même pour un administrateur.
revoke all on public.content_reports from anon, authenticated;

-- Enregistre un signalement du compte connecté. La cible et le message sont vérifiés par les
-- contraintes de la table (contenu existant, 10 à 1000 caractères après retrait des espaces).
create function public.report_content(
  p_message text,
  p_lesson_id text default null,
  p_question_id text default null,
  p_lab_id text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
begin
  if v_user is null then
    raise exception 'Connexion requise.' using errcode = '28000';
  end if;
  -- Un signalement à la fois par compte : le décompte voit ceux des envois précédents.
  perform pg_advisory_xact_lock(hashtextextended('signalements:' || v_user::text, 0));
  if (select count(*) from public.content_reports
      where user_id = v_user and created_at > now() - interval '1 hour') >= 10 then
    raise exception 'Trop de signalements en une heure : réessayez plus tard.' using errcode = 'CA429';
  end if;
  insert into public.content_reports (user_id, lesson_id, question_id, lab_id, message)
  values (v_user, p_lesson_id, p_question_id, p_lab_id, btrim(p_message));
end;
$$;

revoke execute on function public.report_content(text, text, text, text) from public, anon;
grant execute on function public.report_content(text, text, text, text) to authenticated;
