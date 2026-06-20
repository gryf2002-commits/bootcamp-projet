-- ============================================================
--  SunMates — session 38 : AUDIT PERF + SÉCURITÉ (durcissement base)
--  À coller dans Supabase : SQL Editor > New query > Run
--  Rejouable sans risque (idempotent). Ne supprime AUCUNE donnée.
--
--  NOTE : déjà appliqué en LIVE le 20/06/2026 (via l'outil d'audit).
--  Ce fichier garde le repo synchronisé avec la base, et rejoue à
--  l'identique sur une base neuve.
--
--  Vérifié : aucun changement d'accès pour les utilisateurs. Les RPC
--  restent appelables par les connectés ; seules les exécutions ANONYMES
--  sont coupées (l'app exige une session de toute façon).
-- ============================================================

-- 1) PERF — index couvrant chaque clé étrangère (33) ----------------------
create index if not exists idx_app_feedback_user_id      on public.app_feedback(user_id);
create index if not exists idx_blocks_blocked            on public.blocks(blocked);
create index if not exists idx_checkpoints_cafe_id       on public.checkpoints(cafe_id);
create index if not exists idx_da_history_updated_by     on public.da_history(updated_by);
create index if not exists idx_da_strings_updated_by     on public.da_strings(updated_by);
create index if not exists idx_da_tokens_updated_by      on public.da_tokens(updated_by);
create index if not exists idx_feed_comments_user_id     on public.feed_comments(user_id);
create index if not exists idx_feed_likes_user_id        on public.feed_likes(user_id);
create index if not exists idx_feed_poll_votes_user_id   on public.feed_poll_votes(user_id);
create index if not exists idx_feed_posts_user_id        on public.feed_posts(user_id);
create index if not exists idx_group_chats_creator       on public.group_chats(creator);
create index if not exists idx_group_members_added_by    on public.group_members(added_by);
create index if not exists idx_group_members_user_id     on public.group_members(user_id);
create index if not exists idx_group_messages_group_id   on public.group_messages(group_id);
create index if not exists idx_group_messages_sender_id  on public.group_messages(sender_id);
create index if not exists idx_map_activities_creator    on public.map_activities(creator);
create index if not exists idx_message_reactions_user_id on public.message_reactions(user_id);
create index if not exists idx_place_reviews_user_id     on public.place_reviews(user_id);
create index if not exists idx_profiles_bff_id           on public.profiles(bff_id);
create index if not exists idx_profiles_partner_place_id on public.profiles(partner_place_id);
create index if not exists idx_push_subscriptions_user_id on public.push_subscriptions(user_id);
create index if not exists idx_quest_group_runs_partner  on public.quest_group_runs(partner);
create index if not exists idx_quest_group_runs_initiator on public.quest_group_runs(initiator);
create index if not exists idx_quest_group_runs_quest_key on public.quest_group_runs(quest_key);
create index if not exists idx_quest_suggestions_to_user on public.quest_suggestions(to_user);
create index if not exists idx_quest_suggestions_quest_key on public.quest_suggestions(quest_key);
create index if not exists idx_quests_cafe_id            on public.quests(cafe_id);
create index if not exists idx_quote_requests_user_id    on public.quote_requests(user_id);
create index if not exists idx_referrals_referrer_id     on public.referrals(referrer_id);
create index if not exists idx_reports_reported_user     on public.reports(reported_user);
create index if not exists idx_user_coupons_user_id      on public.user_coupons(user_id);
create index if not exists idx_user_quests_quest_key     on public.user_quests(quest_key);
create index if not exists idx_vouches_vouchee           on public.vouches(vouchee);

-- 2) PERF — RLS : envelopper auth.uid() dans (select auth.uid()) ----------
--    Évite la ré-évaluation par ligne (advisor "auth_rls_initplan").
--    Le guard "déjà optimisée" rend ce bloc rejouable sans double-wrap.
do $$
declare r record; v_using text; v_check text; stmt text;
begin
  for r in
    select tablename, policyname, qual, with_check
    from pg_policies
    where schemaname='public'
      and ( coalesce(qual,'')       ~ 'auth\.(uid|role|jwt|email)\(\)'
         or coalesce(with_check,'') ~ 'auth\.(uid|role|jwt|email)\(\)' )
      and (coalesce(qual,'')||coalesce(with_check,'')) !~ '(?i)select\s+auth\.'
  loop
    v_using := r.qual; v_check := r.with_check;
    if v_using is not null then
      v_using := regexp_replace(v_using,'auth\.uid\(\)','(select auth.uid())','g');
      v_using := regexp_replace(v_using,'auth\.role\(\)','(select auth.role())','g');
      v_using := regexp_replace(v_using,'auth\.jwt\(\)','(select auth.jwt())','g');
      v_using := regexp_replace(v_using,'auth\.email\(\)','(select auth.email())','g');
    end if;
    if v_check is not null then
      v_check := regexp_replace(v_check,'auth\.uid\(\)','(select auth.uid())','g');
      v_check := regexp_replace(v_check,'auth\.role\(\)','(select auth.role())','g');
      v_check := regexp_replace(v_check,'auth\.jwt\(\)','(select auth.jwt())','g');
      v_check := regexp_replace(v_check,'auth\.email\(\)','(select auth.email())','g');
    end if;
    stmt := format('alter policy %I on public.%I', r.policyname, r.tablename);
    if v_using is not null then stmt := stmt || format(' using (%s)', v_using); end if;
    if v_check is not null then stmt := stmt || format(' with check (%s)', v_check); end if;
    execute stmt;
  end loop;
end $$;

-- 3) SÉCURITÉ — search_path figé sur la fonction qui en manquait ----------
alter function public.sm_pro_guard() set search_path = public;

-- 4) SÉCURITÉ — couper l'exécution ANONYME des fonctions (garde connectés) -
do $$
declare f record;
begin
  for f in
    select format('%I.%I(%s)', n.nspname, p.proname, pg_get_function_identity_arguments(p.oid)) as sig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname='public' and p.prosecdef
  loop
    execute format('revoke execute on function %s from public, anon;', f.sig);
    execute format('grant  execute on function %s to authenticated;', f.sig);
  end loop;
end $$;

-- 5) SÉCURITÉ — fermer les insertions publiques (SAUF devis B2B) ----------
-- events : analytics → session connectée requise (le front n'y écrit pas)
drop policy if exists "Insertion publique des events" on public.events;
drop policy if exists "Insertion events connectes"    on public.events;
create policy "Insertion events connectes" on public.events
  for insert to authenticated with check ((select auth.uid()) is not null);

-- app_feedback : connecté + pas d'usurpation de user_id
drop policy if exists "app_feedback_insert" on public.app_feedback;
create policy "app_feedback_insert" on public.app_feedback
  for insert to authenticated
  with check ((select auth.uid()) is not null
              and (user_id is null or user_id = (select auth.uid())));

-- quote_requests : reste PUBLIC (lead B2B sans compte) mais borné (anti-spam)
drop policy if exists "Tout le monde peut demander un devis" on public.quote_requests;
create policy "Tout le monde peut demander un devis" on public.quote_requests
  for insert to anon, authenticated
  with check ( char_length(coalesce(need,''))         <= 5000
           and char_length(coalesce(company,''))      <= 200
           and char_length(coalesce(contact_name,'')) <= 200
           and char_length(coalesce(email,''))        <= 320 );

-- 6) PERF — dédoublonnage des policies da_tokens (doublons exacts) --------
drop policy if exists "da_tokens_write" on public.da_tokens;
drop policy if exists "da_tokens_read"  on public.da_tokens;

-- 7) SÉCURITÉ — bucket avatars : pas d'énumération anonyme ----------------
-- (lecture par URL publique inchangée : bucket public => bypass RLS)
drop policy if exists "Avatars - lecture publique"   on storage.objects;
drop policy if exists "Avatars - lecture (connectes)" on storage.objects;
create policy "Avatars - lecture (connectes)" on storage.objects
  for select to authenticated using (bucket_id = 'avatars');

-- ✅ Terminé.
-- Reste 2 actions hors-SQL, à faire dans le Dashboard Supabase :
--   • Authentication > Settings : activer "Leaked password protection".
--   • (optionnel) déplacer l'extension `unaccent` hors du schéma public.
