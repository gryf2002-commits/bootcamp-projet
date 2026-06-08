-- ============================================================
-- SunMates — Session 37 : badges PRESTIGE + secret « Légende de SunMates »
-- ============================================================
-- Des paliers bien plus exigeants (endgame) pour récompenser les vrais mordus,
-- + un badge SECRET (condition cachée au public, visible admin).
-- L'attribution reste côté app (checkMilestoneBadges). Rejouable (idempotent).
-- À exécuter dans le SQL Editor de Supabase.
-- ============================================================

insert into badges_catalog (key, name, emoji, description, is_secret, sort_order) values
  -- Paliers prestige (long terme)
  ('badge_quest100','Centurion des quêtes','🏆','Accomplir 100 quêtes. Le panthéon des explorateurs.', false, 50),
  ('badge_explorer100','Pilier de la communauté','🗿','Faire 100 check-ins dans des lieux sûrs.', false, 51),
  ('badge_globe','Globe-trotteur','🌐','Accomplir des quêtes dans toutes les villes desservies.', false, 52),
  -- SECRET : condition cachée au grand public (teaser ❓), révélée seulement quand débloqué.
  ('badge_legend_secret','Légende de SunMates','🌟','Secret : seuls les voyageurs les plus accomplis le débloquent (profil vérifié + 50 quêtes + 10 villes + 50 check-ins).', true, 99)
on conflict (key) do update set
  name = excluded.name, emoji = excluded.emoji, description = excluded.description,
  is_secret = excluded.is_secret, sort_order = excluded.sort_order;

-- ============================================================
-- Fin. Prestige : Centurion (100 quêtes), Pilier (100 check-ins), Globe-trotteur (toutes villes).
-- Secret : Légende de SunMates (vérifié + 50 quêtes + 10 villes + 50 check-ins).
-- ============================================================
