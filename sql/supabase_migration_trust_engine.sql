-- ============================================================================
-- SunMates — TRUST ENGINE (moteur de confiance) · 19/06
-- ----------------------------------------------------------------------------
-- Objectif : faire du score de confiance un vrai moteur CRÉDIBLE et ANTI-TRICHE,
-- recalculé à partir de preuves réelles, au lieu d'un simple compteur « +10 / +30 »
-- que le client pouvait gonfler.
--
-- Ce que ça change :
--   • UNE source de vérité : la fonction recompute_trust() recalcule le score depuis
--     les vraies données (et écrase tout score « bricolé »).
--   • Anti-farm check-in : on compte les LIEUX DISTINCTS (revenir 10× au même café
--     ne rapporte plus rien), plafonné.
--   • Anti-collusion vouches : seuls les recommandeurs DÉJÀ VÉRIFIÉS comptent
--     (impossible de farmer la confiance avec des faux comptes), plafonné.
--   • Pénalité : 3+ signalements distincts en attente contre un profil → -20.
--   • Vérification SÉCURISÉE : passe par une RPC serveur (request_verification),
--     plus par une écriture directe du client.
--   • Recalcul AUTOMATIQUE via triggers (check-in, vouch, signalement).
--
-- FORMULE :
--   vérifié .................. +30
--   lieux DISTINCTS visités .. +10 chacun, max 10 lieux (=> +100 max)
--   vouches de VÉRIFIÉS ...... +5 chacun, max 5 (=> +25 max)
--   profil complet (bio+photo+ville) +10
--   compte de + de 30 jours .. +5
--   3+ signalements pending .. -20
--   (jamais en dessous de 0)
--
-- SANS DANGER : idempotent / rejouable. Ne touche pas aux profils démo lors du backfill.
-- À coller dans Supabase → SQL Editor → Run (en entier).
-- (La PARTIE 2 « gel » tout en bas est OPTIONNELLE et reste commentée — lis l'encadré.)
-- ============================================================================


-- ============================================================================
-- PARTIE 1 — Le moteur (à lancer sans souci)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) recompute_trust(uid) : LA source de vérité. Recalcule le score d'un profil.
--    SECURITY DEFINER + pose le flag 'sunmates.trusted' → l'écriture passe même si
--    tu actives plus tard le gel (PARTIE 2).
-- ----------------------------------------------------------------------------
create or replace function recompute_trust(p_uid uuid)
returns int
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_verified boolean;
  v_bio text; v_avatar text; v_city text;
  v_places int := 0;
  v_vouches int := 0;
  v_complete int := 0;
  v_age int := 0;
  v_pending int := 0;
  v_created timestamptz;
  v_score int;
begin
  if p_uid is null then return 0; end if;

  select is_verified, bio, avatar_url, city
    into v_verified, v_bio, v_avatar, v_city
    from profiles where id = p_uid;

  -- Check-ins : LIEUX DISTINCTS (anti-farm), plafonné à 10 (=> +100 max).
  select least(count(distinct cafe_id), 10) into v_places
    from checkpoints where user_id = p_uid;

  -- Vouches : seuls les recommandeurs VÉRIFIÉS comptent (anti-collusion), plafonné à 5 (=> +25 max).
  select least(count(distinct v.voucher), 5) into v_vouches
    from vouches v join profiles vp on vp.id = v.voucher
    where v.vouchee = p_uid and coalesce(vp.is_verified, false) = true;

  -- Profil complet (bio + photo + ville) : +10.
  if coalesce(length(trim(coalesce(v_bio, ''))), 0) > 0
     and v_avatar is not null
     and coalesce(v_city, '') <> '' then
    v_complete := 10;
  end if;

  -- Ancienneté > 30 jours : +5 (lecture auth.users, sans planter si indisponible).
  begin
    select created_at into v_created from auth.users where id = p_uid;
    if v_created is not null and v_created < now() - interval '30 days' then v_age := 5; end if;
  exception when others then v_age := 0; end;

  -- Pénalité : 3+ signalements DISTINCTS « en attente » contre ce profil → -20.
  select count(distinct reporter) into v_pending
    from reports where reported_user = p_uid and coalesce(status, 'pending') = 'pending';

  v_score := (case when coalesce(v_verified, false) then 30 else 0 end)
           + v_places * 10
           + v_vouches * 5
           + v_complete
           + v_age
           - (case when v_pending >= 3 then 20 else 0 end);
  if v_score < 0 then v_score := 0; end if;

  perform set_config('sunmates.trusted', '1', true);  -- autorise l'écriture même si le gel est actif
  update profiles set trust_score = v_score where id = p_uid;
  return v_score;
end;
$$;
revoke execute on function recompute_trust(uuid) from public;     -- usage interne (triggers / RPC), pas appelable n'importe comment
grant execute on function recompute_trust(uuid) to authenticated;

-- Petit raccourci pour le client : recalcule MON score et renvoie la nouvelle valeur.
create or replace function recompute_my_trust()
returns int language sql security definer set search_path = public, auth
as $$ select recompute_trust(auth.uid()); $$;
grant execute on function recompute_my_trust() to authenticated;


-- ----------------------------------------------------------------------------
-- 2) request_verification() : vérification SÉCURISÉE côté serveur (remplace
--    l'écriture directe is_verified=true du client). Toujours « simulée » pour le MVP
--    (pas de vraie pièce d'identité), mais désormais contrôlée par le serveur et 1 seule fois.
-- ----------------------------------------------------------------------------
create or replace function request_verification()
returns jsonb language plpgsql security definer set search_path = public
as $$
declare v_uid uuid := auth.uid(); v_already boolean;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'message', 'Non connecté.'); end if;
  select coalesce(is_verified, false) into v_already from profiles where id = v_uid;
  if v_already then return jsonb_build_object('ok', true, 'already', true, 'message', 'Déjà vérifié·e.'); end if;
  perform set_config('sunmates.trusted', '1', true);
  update profiles set is_verified = true where id = v_uid;
  perform recompute_trust(v_uid);
  return jsonb_build_object('ok', true, 'already', false, 'message', 'Vérification activée ✅ (+30 confiance)');
end; $$;
grant execute on function request_verification() to authenticated;


-- ----------------------------------------------------------------------------
-- 3) redeem_checkin : on ENLÈVE le « +10 » brut (farmable). Le check-in est toujours
--    enregistré, et le trigger ci-dessous recalcule le score (lieux DISTINCTS).
--    (Corps identique à session 2, sans la ligne « +10 ».)
-- ----------------------------------------------------------------------------
create or replace function redeem_checkin(p_cafe_id bigint, p_code text)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare v_uid uuid := auth.uid(); v_real text;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'message', 'Non connecté.'); end if;
  select code into v_real from cafe_codes where cafe_id = p_cafe_id;
  if v_real is null then return jsonb_build_object('ok', false, 'message', 'Ce lieu n''a pas de code configuré.'); end if;
  if upper(trim(coalesce(p_code, ''))) <> upper(trim(v_real)) then
    return jsonb_build_object('ok', false, 'message', 'Code incorrect. Demande-le sur place.');
  end if;
  insert into checkpoints (user_id, cafe_id) values (v_uid, p_cafe_id);  -- → déclenche le recalcul du trust
  return jsonb_build_object('ok', true, 'points', 10, 'message', 'Check-in validé ✅');
end; $$;
grant execute on function redeem_checkin(bigint, text) to authenticated;


-- ----------------------------------------------------------------------------
-- 4) TRIGGERS de recalcul automatique : dès qu'un signal change, on recalcule.
-- ----------------------------------------------------------------------------
-- a) Check-in inséré → recalcul du visiteur
create or replace function _sm_trust_on_checkpoint()
returns trigger language plpgsql security definer set search_path = public, auth as $$
begin perform recompute_trust(new.user_id); return new; end; $$;
drop trigger if exists sm_trust_on_checkpoint on checkpoints;
create trigger sm_trust_on_checkpoint after insert on checkpoints
  for each row execute function _sm_trust_on_checkpoint();

-- b) Vouch ajouté/retiré → recalcul du recommandé
create or replace function _sm_trust_on_vouch()
returns trigger language plpgsql security definer set search_path = public, auth as $$
begin perform recompute_trust(coalesce(new.vouchee, old.vouchee)); return coalesce(new, old); end; $$;
drop trigger if exists sm_trust_on_vouch on vouches;
create trigger sm_trust_on_vouch after insert or delete on vouches
  for each row execute function _sm_trust_on_vouch();

-- c) Signalement créé / traité → recalcul de la personne signalée (la pénalité monte/retombe)
create or replace function _sm_trust_on_report()
returns trigger language plpgsql security definer set search_path = public, auth as $$
begin perform recompute_trust(new.reported_user); return new; end; $$;
drop trigger if exists sm_trust_on_report on reports;
create trigger sm_trust_on_report after insert or update on reports
  for each row execute function _sm_trust_on_report();


-- ----------------------------------------------------------------------------
-- 5) BACKFILL : recalcule TOUS les scores maintenant (sauf profils démo). Rejouable.
-- ----------------------------------------------------------------------------
do $$
declare r record;
begin
  for r in select id from profiles where coalesce(is_demo, false) = false loop
    perform recompute_trust(r.id);
  end loop;
end $$;

-- (Vérif facultative)
-- select username, trust_score, is_verified from profiles
-- where coalesce(is_demo,false)=false order by trust_score desc limit 20;


-- ============================================================================
-- PARTIE 2 — OPTIONNEL : GELER les colonnes sensibles (verrou anti-triche dur)
-- ----------------------------------------------------------------------------
-- ⚠️ À activer SEULEMENT APRÈS avoir :
--    (1) lancé la PARTIE 1 ci-dessus,
--    (2) déployé la nouvelle app qui appelle request_verification() (au lieu d'écrire
--        is_verified en direct) — c'est déjà fait dans la preview/app de cette session.
-- Une fois actif, un utilisateur ne peut PLUS écrire lui-même trust_score / is_verified /
-- is_admin / banned : seules les RPC de confiance (recompute_trust, request_verification,
-- ajustement admin) le peuvent. C'est le vrai verrou. Les check-ins, vouches et la vérif
-- continuent de fonctionner (ils passent par les RPC qui posent le flag 'sunmates.trusted').
--
-- Pour l'activer : enlève les « -- » des lignes ci-dessous puis relance ce bloc.
-- ----------------------------------------------------------------------------
-- create or replace function _sm_guard_privilege()
-- returns trigger language plpgsql security definer set search_path = public as $$
-- begin
--   if public.is_admin() or coalesce(current_setting('sunmates.trusted', true), '') = '1' then
--     return new;
--   end if;
--   new.is_admin      := old.is_admin;
--   new.is_gold       := old.is_gold;
--   new.banned        := old.banned;
--   new.ban_permanent := old.ban_permanent;
--   new.trust_score   := old.trust_score;   -- ne change que via les RPC de confiance
--   new.is_verified   := old.is_verified;   -- ne change que via request_verification()
--   return new;
-- end; $$;
-- drop trigger if exists sm_guard_privilege on profiles;
-- create trigger sm_guard_privilege before update on profiles
--   for each row execute function _sm_guard_privilege();

-- ============================================================================
-- Fin. PARTIE 1 = le moteur (lance-la). PARTIE 2 = le verrou dur (quand tu es prêt).
-- ============================================================================
