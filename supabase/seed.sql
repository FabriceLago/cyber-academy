-- Généré par scripts/generate-catalog-sql.mjs à partir de src/app/content : ne pas modifier
-- à la main. Relancer « npm run db:catalog » après chaque changement du contenu.

insert into public.learning_paths (id, title, level, position) values
  ('decouverte', 'Découverte de la cybersécurité', 'debutant', 0)
on conflict (id) do update set title = excluded.title, level = excluded.level, position = excluded.position;

insert into public.modules (id, path_id, title, pass_threshold, position) values
  ('premiers-pas', 'decouverte', 'Premiers pas avec l’ordinateur', 0.8, 0),
  ('internet-et-menaces', 'decouverte', 'Internet et menaces', 0.8, 1)
on conflict (id) do update set path_id = excluded.path_id, title = excluded.title, pass_threshold = excluded.pass_threshold, position = excluded.position;

insert into public.lessons (id, module_id, title, duration_minutes, position, quiz_size) values
  ('ordinateur-et-fichiers', 'premiers-pas', 'Comprendre un ordinateur, ses fichiers et ses dossiers', 20, 0, 5),
  ('decouvrir-le-terminal', 'premiers-pas', 'Découvrir le terminal', 25, 1, 5),
  ('voyage-d-une-information', 'internet-et-menaces', 'Comment une information voyage sur Internet', 25, 0, 5),
  ('securite-et-risques', 'internet-et-menaces', 'Confidentialité, intégrité, disponibilité : évaluer un risque', 20, 1, 5),
  ('hameconnage', 'internet-et-menaces', 'Repérer l’hameçonnage et l’ingénierie sociale', 25, 2, 5)
on conflict (id) do update set module_id = excluded.module_id, title = excluded.title, duration_minutes = excluded.duration_minutes, position = excluded.position, quiz_size = excluded.quiz_size;

insert into public.labs (id, lesson_id, kind, title) values
  ('lab-terminal', 'decouvrir-le-terminal', 'terminal', 'Explorer un système de fichiers dans un terminal simulé'),
  ('lab-phishing', 'hameconnage', 'phishing', 'Démasquer un e-mail d’hameçonnage')
on conflict (id) do update set lesson_id = excluded.lesson_id, kind = excluded.kind, title = excluded.title;

-- Clés de correction : illisibles depuis le navigateur (aucune politique RLS).
insert into public.quiz_answer_keys (lesson_id, question_id, answer) values
  ('ordinateur-et-fichiers', 'q1', '{"type":"matching","pairs":["a","b","c","d"]}'::jsonb),
  ('ordinateur-et-fichiers', 'q2', '{"type":"choice","correct":["a"]}'::jsonb),
  ('ordinateur-et-fichiers', 'q3', '{"type":"choice","correct":["a","b"]}'::jsonb),
  ('ordinateur-et-fichiers', 'q4', '{"type":"choice","correct":["false"]}'::jsonb),
  ('ordinateur-et-fichiers', 'q5', '{"type":"choice","correct":["a"]}'::jsonb),
  ('ordinateur-et-fichiers', 'q6', '{"type":"choice","correct":["a"]}'::jsonb),
  ('ordinateur-et-fichiers', 'q7', '{"type":"choice","correct":["a"]}'::jsonb),
  ('ordinateur-et-fichiers', 'q8', '{"type":"choice","correct":["a"]}'::jsonb),
  ('ordinateur-et-fichiers', 'q9', '{"type":"choice","correct":["false"]}'::jsonb),
  ('ordinateur-et-fichiers', 'q10', '{"type":"ordering","items":["a","b","c","d"]}'::jsonb),
  ('decouvrir-le-terminal', 'q1', '{"type":"choice","correct":["a"]}'::jsonb),
  ('decouvrir-le-terminal', 'q2', '{"type":"choice","correct":["true"]}'::jsonb),
  ('decouvrir-le-terminal', 'q3', '{"type":"choice","correct":["a"]}'::jsonb),
  ('decouvrir-le-terminal', 'q4', '{"type":"choice","correct":["false"]}'::jsonb),
  ('decouvrir-le-terminal', 'q5', '{"type":"choice","correct":["a"]}'::jsonb),
  ('decouvrir-le-terminal', 'q6', '{"type":"ordering","items":["a","b","c"]}'::jsonb),
  ('decouvrir-le-terminal', 'q7', '{"type":"choice","correct":["a"]}'::jsonb),
  ('decouvrir-le-terminal', 'q8', '{"type":"matching","pairs":["a","b","c"]}'::jsonb),
  ('decouvrir-le-terminal', 'q9', '{"type":"choice","correct":["a"]}'::jsonb),
  ('decouvrir-le-terminal', 'q10', '{"type":"choice","correct":["a","b"]}'::jsonb),
  ('voyage-d-une-information', 'q1', '{"type":"choice","correct":["a"]}'::jsonb),
  ('voyage-d-une-information', 'q2', '{"type":"choice","correct":["a"]}'::jsonb),
  ('voyage-d-une-information', 'q3', '{"type":"choice","correct":["true"]}'::jsonb),
  ('voyage-d-une-information', 'q4', '{"type":"choice","correct":["a"]}'::jsonb),
  ('voyage-d-une-information', 'q5', '{"type":"choice","correct":["a"]}'::jsonb),
  ('voyage-d-une-information', 'q6', '{"type":"choice","correct":["true"]}'::jsonb),
  ('voyage-d-une-information', 'q7', '{"type":"ordering","items":["a","b","c","d","e"]}'::jsonb),
  ('voyage-d-une-information', 'q8', '{"type":"matching","pairs":["a","b","c","d"]}'::jsonb),
  ('voyage-d-une-information', 'q9', '{"type":"choice","correct":["a"]}'::jsonb),
  ('voyage-d-une-information', 'q10', '{"type":"choice","correct":["true"]}'::jsonb),
  ('securite-et-risques', 'q1', '{"type":"matching","pairs":["a","b","c"]}'::jsonb),
  ('securite-et-risques', 'q2', '{"type":"choice","correct":["a"]}'::jsonb),
  ('securite-et-risques', 'q3', '{"type":"choice","correct":["true"]}'::jsonb),
  ('securite-et-risques', 'q4', '{"type":"matching","pairs":["a","b","c"]}'::jsonb),
  ('securite-et-risques', 'q5', '{"type":"choice","correct":["a"]}'::jsonb),
  ('securite-et-risques', 'q6', '{"type":"choice","correct":["a"]}'::jsonb),
  ('securite-et-risques', 'q7', '{"type":"choice","correct":["a"]}'::jsonb),
  ('securite-et-risques', 'q8', '{"type":"choice","correct":["a","b"]}'::jsonb),
  ('securite-et-risques', 'q9', '{"type":"choice","correct":["a"]}'::jsonb),
  ('securite-et-risques', 'q10', '{"type":"choice","correct":["true"]}'::jsonb),
  ('hameconnage', 'q1', '{"type":"choice","correct":["a","b"]}'::jsonb),
  ('hameconnage', 'q2', '{"type":"choice","correct":["false"]}'::jsonb),
  ('hameconnage', 'q3', '{"type":"choice","correct":["a"]}'::jsonb),
  ('hameconnage', 'q4', '{"type":"matching","pairs":["a","b","c"]}'::jsonb),
  ('hameconnage', 'q5', '{"type":"choice","correct":["a"]}'::jsonb),
  ('hameconnage', 'q6', '{"type":"choice","correct":["a"]}'::jsonb),
  ('hameconnage', 'q7', '{"type":"choice","correct":["false"]}'::jsonb),
  ('hameconnage', 'q8', '{"type":"ordering","items":["a","b","c"]}'::jsonb),
  ('hameconnage', 'q9', '{"type":"choice","correct":["a"]}'::jsonb),
  ('hameconnage', 'q10', '{"type":"choice","correct":["a","b"]}'::jsonb)
on conflict (lesson_id, question_id) do update set answer = excluded.answer;
