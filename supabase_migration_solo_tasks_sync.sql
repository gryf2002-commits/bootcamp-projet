-- ============================================================
-- SunMates — SYNCHRO solo_tasks (fix « Tâche inconnue. »)
-- À exécuter dans le SQL Editor de Supabase. IDEMPOTENT (rejouable sans risque).
--
-- POURQUOI : le RPC anti-triche grant_solo_xp (migration s27) vérifie chaque
-- clé dans la table solo_tasks. Or la passe 9 a ajouté 8 DÉFIS + 4 RITUELS
-- (+ le rituel personnalisé « rit_custom ») côté app… jamais insérés ici.
-- Résultat : cocher un de ces rituels/défis répondait « Tâche inconnue. ».
-- ============================================================

insert into solo_tasks (key, kind, xp) values
  -- Défis solo fournée 2 (passe 9, #39)
  ('sunrise_walk',  'challenge', 55),
  ('bench_stories', 'challenge', 30),
  ('secret_street', 'challenge', 45),
  ('local_coffee',  'challenge', 35),
  ('no_gps',        'challenge', 60),
  ('book_corner',   'challenge', 35),
  ('kind_act',      'challenge', 40),
  ('street_art',    'challenge', 40),
  -- Rituels supplémentaires (passe 9, #39)
  ('rit_water',     'ritual', 10),
  ('rit_steps',     'ritual', 10),
  ('rit_message',   'ritual', 10),
  ('rit_gratitude', 'ritual', 10),
  -- Le rituel PERSONNALISÉ de chaque utilisateur (clé unique côté app)
  ('rit_custom',    'ritual', 10)
on conflict (key) do update set kind = excluded.kind, xp = excluded.xp;

-- Vérification rapide : doit renvoyer 26 lignes (13 d'origine + 13 nouvelles)
select count(*) as taches_solo from solo_tasks;
