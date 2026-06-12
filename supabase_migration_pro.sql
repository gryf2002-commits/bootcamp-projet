-- ============================================================
-- SunMates — ESPACE PRO (partenaires : bar, auberge, café…)
-- À exécuter dans le SQL Editor de Supabase. IDEMPOTENT.
--
-- CE QUE ÇA CÂBLE :
--  1. profiles.partner_place_id → l'établissement géré par ce compte
--     (l'onglet « Espace Pro 💼 » apparaît dans son profil).
--  2. partner_cafes.offer → « l'offre du moment » affichée sur la fiche.
--  3. RLS : un partenaire peut METTRE À JOUR offre/horaires/prix de
--     SON lieu uniquement (jamais le nom, la ville, le code, la note
--     de sécurité — réservés à l'équipe).
--
-- POUR ASSOCIER UN PARTENAIRE (exemple) :
--   update profiles set partner_place_id = <id_du_lieu>
--   where id = '<uuid_du_compte_partenaire>';
-- ============================================================

-- 1) Lien compte → établissement
alter table profiles add column if not exists partner_place_id bigint references partner_cafes(id) on delete set null;

-- 2) Offre du moment sur la fiche lieu
alter table partner_cafes add column if not exists offer text;

-- 3) RLS : mise à jour par LE partenaire du lieu (colonnes sensibles protégées par trigger)
drop policy if exists "Partenaire met a jour son lieu" on partner_cafes;
create policy "Partenaire met a jour son lieu" on partner_cafes for update to authenticated
  using (id = (select partner_place_id from profiles where id = auth.uid()))
  with check (id = (select partner_place_id from profiles where id = auth.uid()));

-- 3b) Garde-fou : un partenaire (non-admin) ne peut changer QUE offer / hours / price_range
create or replace function sm_pro_guard() returns trigger language plpgsql security definer as $$
declare is_adm boolean;
begin
  select coalesce(is_admin, false) into is_adm from profiles where id = auth.uid();
  if is_adm then return new; end if;
  if new.name is distinct from old.name or new.city is distinct from old.city
     or new.lat is distinct from old.lat or new.lng is distinct from old.lng
     or new.safety_note is distinct from old.safety_note or new.is_eco is distinct from old.is_eco then
    raise exception 'Seuls l''offre, les horaires et le prix sont modifiables par le partenaire.';
  end if;
  return new;
end $$;
drop trigger if exists trg_sm_pro_guard on partner_cafes;
create trigger trg_sm_pro_guard before update on partner_cafes
  for each row execute function sm_pro_guard();

-- 4) Lecture des check-ins de SON lieu (stats du tableau de bord pro)
drop policy if exists "Partenaire voit les checkins de son lieu" on checkpoints;
create policy "Partenaire voit les checkins de son lieu" on checkpoints for select to authenticated
  using (cafe_id = (select partner_place_id from profiles where id = auth.uid()));

-- Vérification : la colonne offer doit exister
select column_name from information_schema.columns where table_name = 'partner_cafes' and column_name = 'offer';
