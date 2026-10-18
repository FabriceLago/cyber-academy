-- Audit de sécurité : les rôles de l'API (anon, authenticated) recevaient, par les droits par défaut
-- du schéma public, TRUNCATE (qui ignore la RLS), TRIGGER et REFERENCES. Aucun n'est utile à
-- l'application et aucun n'est atteignable par l'API REST aujourd'hui : retirés par défense en
-- profondeur, sur les tables existantes comme sur celles créées plus tard.
revoke truncate, trigger, references on all tables in schema public from anon, authenticated;

alter default privileges in schema public
  revoke truncate, trigger, references on tables from anon, authenticated;
