-- ============================================================
-- SunMates · RPC sm_grant_badge — attribution de badges CATALOGUE
-- À exécuter dans le SQL Editor de Supabase. Idempotent (rejouable).
--
-- POURQUOI : supabase_migration_security_fixes.sql a SUPPRIMÉ la policy
-- INSERT client sur user_badges (anti-triche). Conséquence (voulue pour les
-- quêtes, mais collatérale) : les badges attribués PAR L'APP (jalons,
-- prestige, easter eggs) échouaient en silence → « les badges ne se
-- débloquent pas ».
--
-- SOLUTION : une fonction de confiance (SECURITY DEFINER) qui n'accorde
-- QUE des badges présents dans badges_catalog (jalons/prestige/eggs),
-- jamais les badges de quêtes (eux passent toujours par complete_quest,
-- qui vérifie la quête côté serveur). Le nom/emoji sont copiés depuis le
-- catalogue : le client ne peut rien falsifier d'autre que « je l'ai eu ».
-- ============================================================

create or replace function sm_grant_badge(p_key text)
returns json language plpgsql security definer set search_path = public as $$
declare
  v_name text; v_emoji text;
begin
  if auth.uid() is null then
    return json_build_object('ok', false, 'message', 'non connecté');
  end if;
  select name, emoji into v_name, v_emoji from badges_catalog where key = p_key;
  if not found then
    return json_build_object('ok', false, 'message', 'badge inconnu');
  end if;
  insert into user_badges (user_id, badge_key, name, emoji)
  values (auth.uid(), p_key, v_name, v_emoji)
  on conflict (user_id, badge_key) do nothing;
  return json_build_object('ok', true);
end; $$;

revoke execute on function sm_grant_badge(text) from anon;
grant execute on function sm_grant_badge(text) to authenticated;

-- ============================================================
-- Fin. L'app (v413) passe par cette RPC pour TOUS les badges hors-quêtes.
-- ============================================================
