-- ============================================================
-- SunMates — « Dispo maintenant » : intention de se rencontrer (flag temporaire)
-- ============================================================
-- L'utilisateur signale qu'il est ouvert à une rencontre là tout de suite. Le flag
-- expire tout seul (on stocke une échéance). Lisible par les autres (les profils sont
-- déjà lisibles pour le matching), modifiable seulement par soi (policy existante
-- "Je modifie seulement mon profil"). Le garde-fou privilèges (hardening) ne touche
-- pas cette colonne. Idempotent.
-- À exécuter dans le SQL Editor de Supabase.
-- ============================================================

alter table profiles add column if not exists available_until timestamptz;

-- ============================================================
-- Fin. available_until > now() = « dispo ». null/passé = pas dispo.
-- ============================================================
