-- Généré par scripts/generate-catalog-sql.mjs à partir de src/app/content : ne pas modifier
-- à la main. Relancer « npm run db:catalog » après chaque changement du contenu.

insert into public.learning_paths (id, title, level, position) values
  ('decouverte', 'Découverte de la cybersécurité', 'debutant', 0)
on conflict (id) do update set title = excluded.title, level = excluded.level, position = excluded.position;

insert into public.modules (id, path_id, title, pass_threshold, position) values
  ('premiers-pas', 'decouverte', 'Premiers pas avec l’ordinateur', 0.8, 0),
  ('internet-et-menaces', 'decouverte', 'Internet et menaces', 0.8, 1)
on conflict (id) do update set path_id = excluded.path_id, title = excluded.title, pass_threshold = excluded.pass_threshold, position = excluded.position;

insert into public.lessons (id, module_id, title, duration_minutes, position) values
  ('ordinateur-et-fichiers', 'premiers-pas', 'Comprendre un ordinateur, ses fichiers et ses dossiers', 20, 0),
  ('decouvrir-le-terminal', 'premiers-pas', 'Découvrir le terminal', 25, 1),
  ('voyage-d-une-information', 'internet-et-menaces', 'Comment une information voyage sur Internet', 25, 0),
  ('securite-et-risques', 'internet-et-menaces', 'Confidentialité, intégrité, disponibilité : évaluer un risque', 20, 1),
  ('hameconnage', 'internet-et-menaces', 'Repérer l’hameçonnage et l’ingénierie sociale', 25, 2)
on conflict (id) do update set module_id = excluded.module_id, title = excluded.title, duration_minutes = excluded.duration_minutes, position = excluded.position;

insert into public.labs (id, lesson_id, kind, title) values
  ('lab-terminal', 'decouvrir-le-terminal', 'terminal', 'Explorer un système de fichiers dans un terminal simulé'),
  ('lab-phishing', 'hameconnage', 'phishing', 'Démasquer un e-mail d’hameçonnage')
on conflict (id) do update set lesson_id = excluded.lesson_id, kind = excluded.kind, title = excluded.title;
