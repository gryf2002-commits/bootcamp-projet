-- ============================================================
--  SunMates — SESSION 10 : back-office admin complet + B2B
--  À coller dans Supabase : SQL Editor > New query > Run. Idempotent.
-- ============================================================

-- 0) Fonction utilitaire : suis-je admin ? (security definer = pas de récursion RLS)
create or replace function is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$;
grant execute on function is_admin() to authenticated;

-- 1) Bannissement d'un membre
alter table profiles add column if not exists banned boolean default false;

-- 2) Un admin peut modifier N'IMPORTE QUEL profil (vérifier, score, bannir, promouvoir)
drop policy if exists "Admin gere les profils" on profiles;
create policy "Admin gere les profils" on profiles for update to authenticated
  using (is_admin()) with check (is_admin());

-- 3) Un admin gère les lieux sûrs (ajout / édition / suppression)
drop policy if exists "Admin gere les lieux" on partner_cafes;
create policy "Admin gere les lieux" on partner_cafes for all to authenticated
  using (is_admin()) with check (is_admin());

-- 4) Un admin gère les codes des lieux (lecture + écriture)
drop policy if exists "Admin gere les codes" on cafe_codes;
create policy "Admin gere les codes" on cafe_codes for all to authenticated
  using (is_admin()) with check (is_admin());

-- 5) (Rappel session 9) Admin lit/traite les signalements — on réécrit avec is_admin()
drop policy if exists "Admin lit les signalements" on reports;
create policy "Admin lit les signalements" on reports for select to authenticated using (is_admin());
drop policy if exists "Admin gere les signalements" on reports;
create policy "Admin gere les signalements" on reports for update to authenticated using (is_admin()) with check (is_admin());

-- 6) DEMANDES DE DEVIS B2B (espace professionnel)
create table if not exists quote_requests (
  id           bigint generated always as identity primary key,
  user_id      uuid references auth.users(id) on delete set null,
  company      text,
  contact_name text,
  email        text,
  team_size    text,
  need         text,
  status       text default 'nouveau',   -- nouveau | traité
  created_at   timestamptz default now()
);
alter table quote_requests enable row level security;
drop policy if exists "Je propose un devis" on quote_requests;
create policy "Je propose un devis" on quote_requests for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Admin lit les devis" on quote_requests;
create policy "Admin lit les devis" on quote_requests for select to authenticated using (is_admin());
drop policy if exists "Admin gere les devis" on quote_requests;
create policy "Admin gere les devis" on quote_requests for update to authenticated using (is_admin()) with check (is_admin());

-- 7) STATISTIQUES (tableau de bord admin) — security definer, réservé aux admins
create or replace function admin_stats()
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then return jsonb_build_object('ok', false); end if;
  return jsonb_build_object(
    'ok', true,
    'users',           (select count(*) from profiles),
    'verified',        (select count(*) from profiles where is_verified = true),
    'banned',          (select count(*) from profiles where banned = true),
    'connections',     (select count(*) from matches_connections where status = 'accepted'),
    'checkins',        (select count(*) from checkpoints),
    'quests_done',     (select count(*) from user_quests where status = 'completed'),
    'reports_pending', (select count(*) from reports where coalesce(handled, false) = false),
    'quotes',          (select count(*) from quote_requests where status = 'nouveau')
  );
end; $$;
grant execute on function admin_stats() to authenticated;

-- ✅ Terminé. Recharge l'app : l'onglet Admin affiche le back-office complet.
