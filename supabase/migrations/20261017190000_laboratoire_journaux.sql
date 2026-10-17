-- Étape 11 : nouveau type de laboratoire, l'analyse de journaux (spécialisation Analyste SOC junior).
alter table public.labs drop constraint labs_kind_check;
alter table public.labs
  add constraint labs_kind_check check (kind in ('terminal', 'phishing', 'logs'));
