-- ============================================================
-- SunMates — Durcissement sécurité (issu de l'audit multi-agents)
-- ============================================================
-- 1) Empêche un utilisateur de s'auto-attribuer des privilèges via un UPDATE direct
--    sur SON profil (la policy "Je modifie seulement mon profil" autorise auth.uid()=id,
--    mais ne filtre PAS les colonnes → sans ce garde-fou un user pouvait faire
--    `update profiles set is_admin=true / is_gold=true / banned=false`).
--    → On FIGE is_admin / is_gold / banned / ban_permanent côté client.
--    L'admin (policy "Admin gere les profils", is_admin()) reste autorisé à tout changer.
--    NB : is_verified et trust_score NE sont PAS figés (vérification simulée du MVP qui
--    les auto-définit volontairement — règle produit).
-- 2) Supprime le bucket Storage `proofs` (feature retirée) : il autorisait l'upload
--    arbitraire par tout authentifié + lecture publique.
-- À exécuter dans le SQL Editor de Supabase. Idempotent (rejouable).
-- ============================================================

-- 1) Garde-fou privilèges -----------------------------------------------------
create or replace function _sm_guard_privilege()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- L'admin (ou une RPC de confiance qui pose le flag) peut tout modifier.
  if public.is_admin() or coalesce(current_setting('sunmates.trusted', true), '') = '1' then
    return new;
  end if;
  -- Sinon : on remet les colonnes sensibles à leur valeur d'origine (tentative ignorée).
  new.is_admin      := old.is_admin;
  new.is_gold       := old.is_gold;
  new.banned        := old.banned;
  new.ban_permanent := old.ban_permanent;
  return new;
end; $$;

drop trigger if exists sm_guard_privilege on profiles;
create trigger sm_guard_privilege before update on profiles
  for each row execute function _sm_guard_privilege();

-- 2) Suppression du bucket proofs (et de ses objets + policies) ---------------
do $$
begin
  if exists (select 1 from storage.buckets where id = 'proofs') then
    delete from storage.objects where bucket_id = 'proofs';
    delete from storage.buckets where id = 'proofs';
  end if;
end $$;

drop policy if exists "Preuves : upload authentifie" on storage.objects;
drop policy if exists "Preuves : lecture publique" on storage.objects;

-- Vérif : la colonne is_gold doit exister (sinon adapte). On affiche un récap.
select 'garde-fou privileges actif' as info;

-- ============================================================
-- Fin. Un user ne peut plus s'auto-passer admin/gold ni se débannir.
-- L'admin garde tous ses droits. Bucket proofs supprimé.
-- ============================================================
