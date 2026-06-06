-- ============================================================
-- SunMates — Session 25 : style de voyage MULTI-CHOIX
-- Ajoute travel_styles (tableau). travel_style (texte) reste rempli avec le 1er
-- choix pour la compatibilité du matchmaking existant.
-- À lancer dans le SQL Editor de Supabase. Rejouable (idempotent).
-- ============================================================

alter table profiles add column if not exists travel_styles text[];

-- Reprise : initialise travel_styles à partir de l'ancien travel_style (si pas déjà fait).
update profiles
  set travel_styles = array[travel_style]
  where travel_style is not null and (travel_styles is null or array_length(travel_styles, 1) is null);

-- Fin session 25.
