-- ============================================================================
-- SunMates — Anti-spam + rate-limiting sur toutes les "demandes" (Maxime 26/06)
-- Projet : ihiwuharxkmkzaxixhae
--
-- ✅ APPLIQUÉ EN PROD le 26/06/2026 via MCP (qa_audit_juin2026_antispam_ratelimit).
--    Validé en tx+rollback : vouches stoppé pile au 13e (cap 12/120s, message
--    « Tu vas un peu vite »), demande de connexion dupliquée bloquée (23505),
--    0 résidu (vouches 1, connections 40 inchangés).
--
-- Constat : toutes les "demandes" étaient auth-scopées mais SANS rate-limit, et
--   plusieurs SANS dédup (connexions : demandes illimitées + doublons ; vouches ;
--   avis lieu). Les RPC avaient déjà des garde-fous par action (report_user 1/paire,
--   complete_quest 3/j+20min, grant_solo_xp 3/j+45s, claim_referral 1x) — conservés.
-- ============================================================================

-- ---- A) DÉDUP (empêche les demandes en double) ----
-- Le client est DÉJÀ codé pour : sendConnection gère 23505 = « déjà existante » ;
-- place_reviews fait .upsert(onConflict:"cafe_id,user_id") ; vouches pré-vérifie.
create unique index if not exists ux_conn_pair_active
  on public.matches_connections (least(user_a, user_b), greatest(user_a, user_b))
  where status in ('pending', 'accepted');
create unique index if not exists ux_vouches_pair
  on public.vouches (voucher, vouchee);
create unique index if not exists ux_place_reviews_user
  on public.place_reviews (cafe_id, user_id);

-- ---- B) RATE-LIMIT générique par utilisateur (anti-burst) ----
create or replace function public._sm_rate_guard()
 returns trigger language plpgsql security definer set search_path to 'public'
as $function$
declare
  v_col text := tg_argv[0]; v_max int := tg_argv[1]::int; v_secs int := tg_argv[2]::int;
  v_uid uuid := auth.uid(); v_actor uuid; v_n int;
begin
  v_actor := (to_jsonb(new) ->> v_col)::uuid;
  if v_uid is null or v_actor is distinct from v_uid then return new; end if;
  execute format(
    'select count(*) from public.%I where %I = $1 and created_at > now() - make_interval(secs => $2)',
    tg_table_name, v_col
  ) into v_n using v_uid, v_secs;
  if v_n >= v_max then
    raise exception 'Tu vas un peu vite 🙂 réessaie dans un instant.' using errcode = 'check_violation';
  end if;
  return new;
end;
$function$;
revoke execute on function public._sm_rate_guard() from public, anon, authenticated;

-- caps généreux (ne gênent jamais l'usage normal, ne bloquent que le spam)
drop trigger if exists trg_rate on public.matches_connections;
create trigger trg_rate before insert on public.matches_connections
  for each row execute function public._sm_rate_guard('user_a', '10', '60');
drop trigger if exists trg_rate on public.messages;
create trigger trg_rate before insert on public.messages
  for each row execute function public._sm_rate_guard('sender_id', '30', '60');
drop trigger if exists trg_rate on public.feed_posts;
create trigger trg_rate before insert on public.feed_posts
  for each row execute function public._sm_rate_guard('user_id', '6', '300');
drop trigger if exists trg_rate on public.feed_comments;
create trigger trg_rate before insert on public.feed_comments
  for each row execute function public._sm_rate_guard('user_id', '20', '60');
drop trigger if exists trg_rate on public.app_feedback;
create trigger trg_rate before insert on public.app_feedback
  for each row execute function public._sm_rate_guard('user_id', '4', '600');
drop trigger if exists trg_rate on public.quest_suggestions;
create trigger trg_rate before insert on public.quest_suggestions
  for each row execute function public._sm_rate_guard('from_user', '12', '120');
drop trigger if exists trg_rate on public.vouches;
create trigger trg_rate before insert on public.vouches
  for each row execute function public._sm_rate_guard('voucher', '12', '120');
drop trigger if exists trg_rate on public.place_reviews;
create trigger trg_rate before insert on public.place_reviews
  for each row execute function public._sm_rate_guard('user_id', '8', '120');

-- NON couvert volontairement : quote_requests (formulaire B2B PUBLIC, rôle anon
--   sans auth.uid() → un rate-limit par utilisateur n'a pas de prise ; il faudrait
--   un throttle par IP côté edge/proxy). request_group_quest a déjà sa dédup
--   "1 demande pending par duo" ; request_verification/ban_recovery sont idempotents.
