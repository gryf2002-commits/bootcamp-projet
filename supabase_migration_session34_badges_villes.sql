-- ============================================================
-- SunMates — Session 34 : nouveaux badges (faciles au début + rares)
-- ============================================================
-- Ajoute des badges au catalogue. L'attribution reste côté app (user_badges),
-- déclenchée par checkMilestoneBadges() quand les conditions sont remplies.
-- Rejouable (idempotent). À exécuter dans le SQL Editor de Supabase.
-- ============================================================

insert into badges_catalog (key, name, emoji, description, is_secret, sort_order) values
  -- Faciles (pour accrocher dès les premiers jours)
  ('badge_firstquest','Première quête','🎯','Accomplir ta toute première quête.', false, 30),
  ('badge_social','Premier Mate','🤝','Te connecter avec ton premier Mate.', false, 31),
  -- Rares / objectifs long terme
  ('badge_tour_de_france','Tour de France','🇫🇷','Accomplir une quête dans 10 villes différentes.', false, 40),
  ('badge_quest25','Légende des quêtes','👑','Accomplir 25 quêtes.', false, 41),
  ('badge_explorer20','Grand routard','🌍','Faire 20 check-ins dans des lieux sûrs.', false, 42)
on conflict (key) do update set
  name = excluded.name, emoji = excluded.emoji, description = excluded.description,
  is_secret = excluded.is_secret, sort_order = excluded.sort_order;

-- ============================================================
-- Fin. Faciles : Première quête, Premier Mate. Rares : Tour de France (10 villes),
-- Légende des quêtes (25), Grand routard (20 check-ins).
-- ============================================================
