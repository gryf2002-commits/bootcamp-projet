-- ============================================================================
-- SunMates — RGPD : suppression de compte (droit à l'effacement, P2.50).
-- Une RPC sécurisée que l'utilisateur appelle pour SUPPRIMER son propre compte :
-- efface ses données dans toutes les tables connues PUIS son compte Auth.
-- Best-effort par table (ignore une table/colonne absente → robuste sur ce schéma).
-- À exécuter dans le SQL Editor de Supabase.
-- ============================================================================

create or replace function sm_delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then return; end if;
  -- Données liées (best-effort : un bloc par table pour ne pas échouer si une table n'existe pas).
  begin delete from messages where sender_id = uid or recipient_id = uid; exception when others then null; end;
  begin delete from matches_connections where user_a = uid or user_b = uid; exception when others then null; end;
  begin delete from checkpoints where user_id = uid; exception when others then null; end;
  begin delete from user_quests where user_id = uid; exception when others then null; end;
  begin delete from blocks where blocker = uid or blocked = uid; exception when others then null; end;
  begin delete from feed_posts where user_id = uid; exception when others then null; end;
  begin delete from feed_comments where user_id = uid; exception when others then null; end;
  begin delete from feed_poll_votes where user_id = uid; exception when others then null; end;
  begin delete from message_reactions where user_id = uid; exception when others then null; end;
  begin delete from push_subscriptions where user_id = uid; exception when others then null; end;
  begin delete from app_feedback where user_id = uid; exception when others then null; end;
  begin delete from locations_realtime where user_id = uid; exception when others then null; end;
  begin delete from trips where user_id = uid; exception when others then null; end;
  begin delete from quest_suggestions where from_user = uid or to_user = uid; exception when others then null; end;
  begin delete from reports where reporter = uid or reported = uid; exception when others then null; end;
  begin delete from vouches where voucher = uid or vouched = uid; exception when others then null; end;
  begin delete from place_reviews where user_id = uid; exception when others then null; end;
  begin delete from profiles_private where id = uid; exception when others then null; end;
  begin delete from profiles where id = uid; exception when others then null; end;
  -- Le compte Auth lui-même (efface définitivement l'identité de connexion).
  begin delete from auth.users where id = uid; exception when others then null; end;
end;
$$;

grant execute on function sm_delete_my_account() to authenticated;
