-- ============================================================
-- SunMates — Support SunMates : autorise le type « question » dans app_feedback
-- ============================================================
-- Le canal « Support SunMates » (Réglages) réutilise la table app_feedback déjà
-- en place (collecte + réponse admin + notif « répondu » à l'auteur). Il envoie
-- des messages de type 'question'. La contrainte CHECK d'origine n'autorisait que
-- ('bug','idea','pixel') → on l'élargit pour accepter 'question'.
-- À exécuter dans le SQL Editor de Supabase. Idempotent (rejouable sans risque).
-- ============================================================

alter table app_feedback drop constraint if exists app_feedback_type_check;

alter table app_feedback
  add constraint app_feedback_type_check
  check (type in ('bug','idea','pixel','question'));

-- ============================================================
-- Fin. Rien d'autre à faire : les policies INSERT/SELECT existantes s'appliquent
-- déjà aux messages de support (même table). L'auteur reçoit la réponse admin via
-- le mécanisme sm_reply_feedback déjà déployé (supabase_migration_feedback_reply.sql).
-- ============================================================
