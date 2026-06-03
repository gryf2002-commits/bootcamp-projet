-- ============================================================
--  SunMates — SESSION 3 : temps réel pour les demandes de connexion
--  (notifications instantanées quand on reçoit une demande de Mate)
--  À coller dans Supabase : SQL Editor > New query > Run. Idempotent.
-- ============================================================

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'matches_connections'
  ) then
    alter publication supabase_realtime add table matches_connections;
  end if;
end $$;

-- ✅ Terminé. Les messages et les défis étaient déjà en temps réel ;
--    désormais les demandes de connexion le sont aussi.
