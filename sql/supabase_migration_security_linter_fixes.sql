-- ============================================================================
-- Durcissement sécurité — réponses au LINTER Supabase (warnings 0028/0029/0025).
-- Idempotent, sûr : on ne touche QUE des fonctions internes (triggers / helpers /
-- cron) qui ne sont JAMAIS appelées en RPC par l'app, et on restreint la LISTE du
-- bucket avatars aux admins (l'accès aux photos par URL reste public, inchangé).
--
-- VÉRIFIÉ AVANT (ne PAS révoquer) :
--   • is_admin() / is_group_member()  -> utilisées DANS des policies RLS (revoke = casse la RLS).
--   • toutes les RPC réellement appelées par le front (complete_quest, toggle_feed_like,
--     leaderboard, redeem_checkin, admin_stats…) -> restent EXECUTE authenticated.
--   • admin_stats / admin_live_stats / admin_user_activity -> gardent is_admin() EN INTERNE
--     (un non-admin reçoit {ok:false}) -> warning acceptable, on les laisse.
-- ============================================================================

-- 1) Fonctions TRIGGER (returns trigger) + helper interne : s'exécutent comme le
--    propriétaire via les triggers / via les fonctions SECURITY DEFINER qui les
--    appellent. Aucune raison d'être appelables directement en RPC -> on révoque.
revoke execute on function public._sm_guard_coupon()        from anon, authenticated;
revoke execute on function public._sm_guard_privilege()     from anon, authenticated;
revoke execute on function public._sm_guard_xp()            from anon, authenticated;
revoke execute on function public._sm_trust_on_checkpoint() from anon, authenticated;
revoke execute on function public._sm_trust_on_report()     from anon, authenticated;
revoke execute on function public._sm_trust_on_vouch()      from anon, authenticated;
revoke execute on function public._grant_quest(uuid, public.quests, integer) from anon, authenticated;

-- 2) Fonctions de MAINTENANCE planifiées par pg_cron (cron tourne en rôle privilégié,
--    non affecté par ces grants) : ni anon ni authenticated ne doivent pouvoir les
--    déclencher. ⚠️ IMPORTANT : ces fonctions n'avaient QUE le grant implicite à PUBLIC
--    (pas de grant explicite anon/authenticated) → il faut révoquer PUBLIC, sinon anon/
--    authenticated héritent toujours. (sm_run_safety_watches était exécutable par ANON.)
revoke execute on function public.sm_run_safety_watches()  from public, anon, authenticated;
revoke execute on function public.sm_purge_old_locations() from public, anon, authenticated;

-- 3) Bucket "avatars" : la policy SELECT large permettait à tout utilisateur connecté
--    de LISTER tous les fichiers. Seul l'admin liste (stats stockage). On restreint la
--    LISTE aux admins. L'affichage des photos par URL publique reste inchangé (bucket public).
drop policy if exists "Avatars - lecture (connectes)" on storage.objects;
create policy "Avatars - liste admin"
  on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and public.is_admin());

-- ============================================================================
-- NON traités ici (à faire AILLEURS, pas en SQL d'app) :
--   • Leaked Password Protection -> Dashboard Supabase > Authentication > Policies
--     (ou Management API) : activer "Check against HaveIBeenPwned".
--   • Extension `unaccent` dans public : déplacement risqué (search_profiles en dépend).
--     Laissé tel quel (impact sécurité négligeable pour une extension de normalisation).
-- ============================================================================
