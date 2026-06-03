-- ============================================================
--  SunMates — SESSION 4 : activité de démo pour le fil d'actualité
--  Donne quelques badges aux profils de démo pour que le "feed" de
--  l'accueil affiche des posts dès le départ (quêtes accomplies).
--  À coller dans Supabase : SQL Editor > New query > Run. Idempotent.
--  (Lance d'abord supabase_migration_session2.sql + le seed.)
-- ============================================================

insert into user_badges (user_id, badge_key, name, emoji, earned_at)
select u.id, v.badge_key, v.name, v.emoji, now() - (v.hrs::text || ' hours')::interval
from auth.users u
join (values
  ('lina@demo.sunmates',   'badge_photographer', 'Photographe Urbain', '📷', 2),
  ('amelie@demo.sunmates', 'badge_coffee',       'Connaisseur Café',   '☕', 5),
  ('sofia@demo.sunmates',  'badge_adventure',    'Tête Brûlée',        '🪂', 9),
  ('marco@demo.sunmates',  'badge_foodie',       'Foodie Tour',        '🍔', 26),
  ('diego@demo.sunmates',  'badge_adventure',    'Tête Brûlée',        '🪂', 50),
  ('nadia@demo.sunmates',  'badge_local',        'Ami des Locaux',     '🤝', 73),
  ('tom@demo.sunmates',    'badge_culture',      'As de la Culture',   '🧠', 100),
  ('yuki@demo.sunmates',   'badge_photographer', 'Photographe Urbain', '📷', 8)
) as v(email, badge_key, name, emoji, hrs) on v.email = u.email
on conflict (user_id, badge_key) do nothing;

-- ✅ Terminé : le fil d'actualité de l'accueil affiche désormais des posts.
