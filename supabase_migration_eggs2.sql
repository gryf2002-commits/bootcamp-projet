-- ============================================================
-- SunMates — easter eggs fournée 3 : badges « Petit globe » + « Avion en papier »
-- À exécuter dans Supabase : SQL Editor → New query → coller → Run.
-- Idempotent : tu peux le relancer sans risque.
--
-- (Au passage : le badge 'badge_goldenhour' (Chercheur d'or) est devenu
--  INOBTENABLE depuis le retrait de l'egg Golden Hour. La dernière ligne
--  le retire du catalogue — supprime-la si tu préfères le garder.)
-- ============================================================

insert into public.badges_catalog (key, name, emoji, description, is_secret, sort_order)
values
  ('badge_globe',      'Tour du monde',    '🌍', 'Le petit globe t''a soufflé ta prochaine destination.', true, 990),
  ('badge_paperplane', 'Première classe',  '✈️', 'Ton avion en papier s''est posé en douceur sur les Jeux.', true, 991)
on conflict (key) do update
  set name = excluded.name, emoji = excluded.emoji,
      description = excluded.description, is_secret = excluded.is_secret;

-- Retrait du badge orphelin de l'ancien egg Golden Hour (et des exemplaires déjà gagnés)
delete from public.user_badges where badge_key = 'badge_goldenhour';
delete from public.badges_catalog where key = 'badge_goldenhour';
