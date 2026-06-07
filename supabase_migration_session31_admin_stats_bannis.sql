-- ============================================================
-- SunMates — Session 31 : admin_stats — les BANNIS ne comptent pas dans "Membres"
-- ============================================================
-- Garantit (quelle que soit la version déjà en base) que le compteur "Membres"
-- du tableau de bord admin EXCLUT les comptes bannis, et ajoute le nombre d'admins.
-- Rejouable. À exécuter dans le SQL Editor de Supabase.
-- ============================================================

create or replace function admin_stats()
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then return jsonb_build_object('ok', false); end if;
  return jsonb_build_object(
    'ok', true,
    'users',           (select count(*) from profiles where coalesce(banned,false) = false),  -- membres ACTIFS (bannis exclus)
    'verified',        (select count(*) from profiles where is_verified = true and coalesce(banned,false) = false),
    'gold',            (select count(*) from profiles where is_gold = true and coalesce(banned,false) = false),
    'admins',          (select count(*) from profiles where is_admin = true),
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

-- ============================================================
-- Fin. "Membres" = comptes actifs uniquement ; "Bannis" reste affiché à part.
-- ============================================================
