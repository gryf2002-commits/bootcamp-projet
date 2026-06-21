-- =============================================================================
-- SunMates — session 40 : intégrité des badges (anti auto-octroi)
-- -----------------------------------------------------------------------------
-- Problème : sm_grant_badge accordait N'IMPORTE quel badge du catalogue à
-- l'appelant, sans vérifier la condition (validée seulement côté front). Un
-- utilisateur pouvait donc s'auto-attribuer des badges PRESTIGE via un appel API
-- direct (db.rpc("sm_grant_badge", …)) et fausser le classement « par badges ».
--
-- Approche PRAGMATIQUE (validée avec Maxime, 21/06) : on NE casse PAS les easter
-- eggs (badges secrets purement client : konami, mots magiques, secousse, géo…)
-- qui ne sont PAS vérifiables côté serveur. On vérifie UNIQUEMENT les badges
-- prestige dont la condition est une SOURCE DE VÉRITÉ serveur :
--   • badge_verified     → profiles.is_verified = true  (même colonne que le front)
--   • badge_legend       → profiles.xp >= 500
--   • badge_butterfly    → 10 connexions acceptées
--   • badge_globetrotter → check-in dans >= 5 villes distinctes
-- Les 3 derniers n'ont AUCUN chemin d'octroi côté front aujourd'hui → ajouter le
-- contrôle ne peut casser aucun flux légitime (zéro régression), et ferme
-- l'auto-octroi par API. Tous les autres badges (jalons front-gated + eggs)
-- passent comme avant (comportement par défaut : autoriser).
--
-- La couverture COMPLÈTE (porter la condition de chaque badge côté serveur) =
-- l'option « robuste », volontairement reportée (gros chantier, risque de
-- divergence front/serveur). Ce correctif est un durcissement incrémental sûr.
-- =============================================================================

create or replace function public.sm_grant_badge(p_key text)
returns json
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_name text; v_emoji text; v_secret boolean;
  uid uuid := auth.uid();
  v_ok boolean := true; v_cnt int;
begin
  if uid is null then
    return json_build_object('ok', false, 'message', 'non connecté');
  end if;

  select name, emoji, coalesce(is_secret, false)
    into v_name, v_emoji, v_secret
    from badges_catalog
    where key = p_key;
  if not found then
    return json_build_object('ok', false, 'message', 'badge inconnu');
  end if;

  -- Contrôle serveur des seules conditions vérifiables (cf. en-tête).
  if p_key = 'badge_verified' then
    select coalesce(is_verified, false) into v_ok from profiles where id = uid;
  elsif p_key = 'badge_legend' then
    select (coalesce(xp, 0) >= 500) into v_ok from profiles where id = uid;
  elsif p_key = 'badge_butterfly' then
    select count(*) into v_cnt
      from matches_connections
      where status = 'accepted' and (user_a = uid or user_b = uid);
    v_ok := (v_cnt >= 10);
  elsif p_key = 'badge_globetrotter' then
    select count(distinct c.city) into v_cnt
      from checkpoints ck
      join partner_cafes c on c.id = ck.cafe_id
      where ck.user_id = uid and c.city is not null;
    v_ok := (v_cnt >= 5);
  end if;

  if not coalesce(v_ok, false) then
    return json_build_object('ok', false, 'message', 'condition non remplie');
  end if;

  insert into user_badges (user_id, badge_key, name, emoji)
  values (uid, p_key, v_name, v_emoji)
  on conflict (user_id, badge_key) do nothing;

  return json_build_object('ok', true);
end;
$function$;
