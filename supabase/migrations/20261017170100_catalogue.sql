-- Catalogue publié : la structure des parcours, reprise du contenu TypeScript de l'application
-- (src/app/content) par supabase/seed.sql, généré par scripts/generate-catalog-sql.mjs.
-- Le texte des leçons reste dans l'application, versionné avec elle : ces tables servent de
-- référence aux tentatives (clés étrangères) et, à l'étape 10, à la correction côté serveur.

create table public.learning_paths (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  title text not null check (char_length(title) between 1 and 200),
  level text not null check (level in ('debutant', 'intermediaire', 'avance')),
  position smallint not null check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.modules (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  path_id text not null references public.learning_paths (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  -- Part minimale de bonnes réponses pour valider un quiz du module (0,8 = 80 %).
  pass_threshold numeric(3, 2) not null check (pass_threshold > 0 and pass_threshold <= 1),
  position smallint not null check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index modules_path_id_idx on public.modules (path_id);

create table public.lessons (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  module_id text not null references public.modules (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  duration_minutes smallint not null check (duration_minutes > 0),
  position smallint not null check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index lessons_module_id_idx on public.lessons (module_id);

create table public.labs (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  -- Un laboratoire accompagne une seule leçon, qui en a au plus un.
  lesson_id text not null unique references public.lessons (id) on delete cascade,
  kind text not null check (kind in ('terminal', 'phishing')),
  title text not null check (char_length(title) between 1 and 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Contenu publié : lecture pour tous (avec ou sans compte), écriture réservée aux administrateurs.
do $$
declare
  t text;
begin
  foreach t in array array['learning_paths', 'modules', 'lessons', 'labs'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "Lire le catalogue" on public.%I for select to anon, authenticated using (true)',
      t
    );
    execute format(
      'create policy "Modifier le catalogue (administrateurs)" on public.%I for all to authenticated '
        'using ((select public.is_admin())) with check ((select public.is_admin()))',
      t
    );
    execute format('revoke insert, update, delete on public.%I from anon', t);
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.touch_updated_at()',
      t || '_touch_updated_at',
      t
    );
  end loop;
end;
$$;
