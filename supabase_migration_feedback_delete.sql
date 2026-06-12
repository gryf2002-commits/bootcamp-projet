-- ============================================================
-- SunMates — l'ADMIN peut SUPPRIMER des retours bêta (#32, passe 9)
-- À exécuter dans Supabase : SQL Editor → New query → coller → Run.
-- Idempotent : tu peux le relancer sans risque.
-- ============================================================

drop policy if exists "admin supprime les retours" on public.app_feedback;
create policy "admin supprime les retours" on public.app_feedback
  for delete using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );
