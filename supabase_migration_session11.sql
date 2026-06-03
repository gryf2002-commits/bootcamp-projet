-- ============================================================
--  SunMates — SESSION 11 : admin avancé + Gold + B2B référencement
--  À coller dans Supabase : SQL Editor > New query > Run. Idempotent.
-- ============================================================

-- 1) Abonnement Gold (aperçu / activation)
alter table profiles add column if not exists is_gold boolean default false;

-- 2) Lieux : photo (URL) + adresse texte (géocodée côté app)
alter table partner_cafes add column if not exists image_url text;
alter table partner_cafes add column if not exists address text;

-- 3) Devis B2B accessibles SANS compte (depuis la page d'accueil "Espace Pro")
alter table quote_requests add column if not exists category text; -- auberge, café, musée…
drop policy if exists "Je propose un devis" on quote_requests;
drop policy if exists "Tout le monde peut demander un devis" on quote_requests;
create policy "Tout le monde peut demander un devis" on quote_requests for insert to anon, authenticated with check (true);

-- 4) Statistiques enrichies (les bannis ne comptent pas dans "membres")
create or replace function admin_stats()
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then return jsonb_build_object('ok', false); end if;
  return jsonb_build_object(
    'ok', true,
    'users',           (select count(*) from profiles where coalesce(banned,false) = false),
    'verified',        (select count(*) from profiles where is_verified = true and coalesce(banned,false) = false),
    'gold',            (select count(*) from profiles where is_gold = true),
    'banned',          (select count(*) from profiles where banned = true),
    'connections',     (select count(*) from matches_connections where status = 'accepted'),
    'pending_conn',    (select count(*) from matches_connections where status = 'pending'),
    'checkins',        (select count(*) from checkpoints),
    'quests_done',     (select count(*) from user_quests where status = 'completed'),
    'messages',        (select count(*) from messages),
    'suggestions',     (select count(*) from quest_suggestions),
    'badges',          (select count(*) from user_badges),
    'coupons',         (select count(*) from user_coupons),
    'places',          (select count(*) from partner_cafes),
    'reports_pending', (select count(*) from reports where coalesce(handled,false) = false),
    'quotes',          (select count(*) from quote_requests where status = 'nouveau')
  );
end; $$;
grant execute on function admin_stats() to authenticated;

-- 5) Activité d'un membre précis (pour la fiche admin)
create or replace function admin_user_activity(p_uid uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then return jsonb_build_object('ok', false); end if;
  return jsonb_build_object(
    'ok', true,
    'checkins',    (select count(*) from checkpoints where user_id = p_uid),
    'connections', (select count(*) from matches_connections where status='accepted' and (user_a = p_uid or user_b = p_uid)),
    'quests',      (select count(*) from user_quests where user_id = p_uid and status='completed'),
    'badges',      (select count(*) from user_badges where user_id = p_uid),
    'messages',    (select count(*) from messages where sender_id = p_uid),
    'reported',    (select count(*) from reports where reported_user = p_uid)
  );
end; $$;
grant execute on function admin_user_activity(uuid) to authenticated;

-- ✅ Terminé.
