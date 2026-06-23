-- ============================================================================
-- Optimisations PERFORMANCE — réponses au linter Supabase (advisors performance).
-- APPLIQUÉ en prod via MCP. Idempotent.
--
-- CONTEXTE : la base est SAINE (100% cache hit, RPC app à 1–6 ms). Le rapport
-- "slow queries" est dominé par le moteur Realtime (abonnements live = cœur de
-- l'app) et l'introspection du DASHBOARD (pas du trafic utilisateur). Il n'y a
-- que 2 vrais correctifs sûrs ci-dessous.
-- ============================================================================

-- 1) RLS init-plan (lint 0003) : la policy de safety_watches ré-évaluait auth.uid()
--    POUR CHAQUE LIGNE. En l'enveloppant dans (select auth.uid()), Postgres ne
--    l'évalue QU'UNE fois par requête. Mêmes droits, plus rapide à l'échelle.
alter policy watch_owner_all on public.safety_watches
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- 2) Clé étrangère non indexée (lint 0001) : user_quiz_log.quiz_id -> index couvrant
--    (évite un scan séquentiel sur les jointures / cascades quand la table grossit).
create index if not exists idx_user_quiz_log_quiz_id on public.user_quiz_log (quiz_id);

-- ============================================================================
-- NON traités VOLONTAIREMENT :
--   • ~40 "unused_index" (lint 0005) : ce sont surtout des index de CLÉS ÉTRANGÈRES
--     ajoutés pour l'échelle. "Inutilisé" = pas encore de trafic, PAS inutile.
--     Les supprimer ralentirait les jointures/cascades quand l'app grandira. GARDÉS.
--   • "multiple_permissive_policies" (lint 0006) : 2 policies par table (admin voit
--     tout + user voit le sien). Les fusionner change la logique RLS pour un gain
--     marginal -> laissé tel quel (sécurité d'abord).
-- ============================================================================
