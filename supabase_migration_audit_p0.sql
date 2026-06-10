-- ============================================================
-- SunMates — Migration AUDIT P0 (10 juin 2026). Idempotent / rejouable.
-- À coller dans Supabase > SQL Editor > Run (tout le fichier d'un coup).
--
-- Contenu :
--   A) Vie privée GPS : expiration réelle des positions (TTL 60 min) + purge
--   B) Index de performance (messages, connexions, quêtes, check-ins)
--   C) Suppression de compte RGPD complète (tables manquantes + erreurs loguées)
-- ============================================================


-- ------------------------------------------------------------
-- A) POSITIONS GPS : expiration réelle
-- Avant : l'UI affichait « expire dans X min » mais RIEN n'expirait côté serveur →
-- tout l'historique de géolocalisation restait lisible par le cercle de confiance,
-- pour toujours. Pour une app de voyageurs solo c'est un risque vie privée majeur
-- (et une violation du principe de minimisation RGPD).
-- Après : (1) la lecture ne renvoie que les positions < 60 min,
--         (2) je peux supprimer mes propres positions,
--         (3) une purge automatique nettoie la table (si pg_cron est activé).
-- ------------------------------------------------------------
drop policy if exists "Mon cercle de confiance voit mes positions" on locations_realtime;
create policy "Mon cercle de confiance voit mes positions"
  on locations_realtime for select to authenticated
  using (
    created_at > now() - interval '60 minutes'   -- ⏱ TTL serveur : rien d'ancien ne fuit
    and (
      auth.uid() = user_id
      or exists (
        select 1 from matches_connections m
        where m.status = 'accepted'
          and (
            (m.user_a = auth.uid() and m.user_b = locations_realtime.user_id)
            or (m.user_b = auth.uid() and m.user_a = locations_realtime.user_id)
          )
      )
    )
  );

drop policy if exists "Je supprime mes positions" on locations_realtime;
create policy "Je supprime mes positions"
  on locations_realtime for delete to authenticated
  using (auth.uid() = user_id);

-- Purge serveur des positions > 24 h (appelable à la main, et planifiée si pg_cron dispo)
create or replace function sm_purge_old_locations()
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from locations_realtime where created_at < now() - interval '24 hours';
end; $$;

-- Planification automatique (nécessite l'extension pg_cron : Dashboard > Database > Extensions).
-- Si pg_cron n'est pas activé, ce bloc est ignoré sans erreur — la policy TTL protège déjà la lecture.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('sm-purge-locations')
      where exists (select 1 from cron.job where jobname = 'sm-purge-locations');
    perform cron.schedule('sm-purge-locations', '17 * * * *', 'select sm_purge_old_locations()');
  end if;
exception when others then null; -- pg_cron absent → on passe
end $$;


-- ------------------------------------------------------------
-- B) INDEX DE PERFORMANCE
-- Les colonnes les plus requêtées n'avaient que les index implicites des PK →
-- seq scans dès que les tables grossissent (chat, connexions, quêtes).
-- ------------------------------------------------------------
create index if not exists idx_messages_recipient_created on messages (recipient_id, created_at desc);
create index if not exists idx_messages_sender_created    on messages (sender_id, created_at desc);
create index if not exists idx_conn_user_a                on matches_connections (user_a);
create index if not exists idx_conn_user_b                on matches_connections (user_b);
create index if not exists idx_user_quests_user           on user_quests (user_id);
create index if not exists idx_checkpoints_user           on checkpoints (user_id);
create index if not exists idx_locations_user_created     on locations_realtime (user_id, created_at desc);
create index if not exists idx_feed_posts_created         on feed_posts (created_at desc);
create index if not exists idx_profiles_last_seen         on profiles (last_seen_at desc nulls last);


-- ------------------------------------------------------------
-- C) SUPPRESSION DE COMPTE RGPD — version complète
-- Avant : (1) chaque delete avalait ses erreurs en silence → l'utilisateur recevait
-- « Compte supprimé » même si des données subsistaient ; (2) des tables manquaient :
-- feed_likes, user_coupons, user_badges, user_solo_log, referrals, quest_suggestions,
-- quest_group_runs, message_reactions sur MES messages, etc.
-- Après : liste complète + les échecs sont LOGUÉS (raise warning) au lieu d'être avalés.
-- ------------------------------------------------------------
create or replace function sm_delete_my_account()
returns void language plpgsql security definer set search_path = public, auth as $$
declare
  uid uuid := auth.uid();
  _failed text := '';
begin
  if uid is null then return; end if;

  -- Réactions et likes (les miens, où qu'ils soient)
  begin delete from message_reactions where user_id = uid; exception when others then _failed := _failed || ' message_reactions'; end;
  begin delete from feed_likes where user_id = uid; exception when others then _failed := _failed || ' feed_likes'; end;
  begin delete from feed_poll_votes where user_id = uid; exception when others then _failed := _failed || ' feed_poll_votes'; end;
  begin delete from feed_comments where user_id = uid; exception when others then _failed := _failed || ' feed_comments'; end;
  begin delete from feed_posts where user_id = uid; exception when others then _failed := _failed || ' feed_posts'; end;

  -- Messagerie
  begin delete from messages where sender_id = uid or recipient_id = uid; exception when others then _failed := _failed || ' messages'; end;

  -- Relations
  begin delete from matches_connections where user_a = uid or user_b = uid; exception when others then _failed := _failed || ' matches_connections'; end;
  begin delete from blocks where blocker = uid or blocked = uid; exception when others then _failed := _failed || ' blocks'; end;
  begin delete from vouches where voucher = uid or vouchee = uid; exception when others then _failed := _failed || ' vouches'; end;
  begin delete from referrals where referrer_id = uid or referred_id = uid; exception when others then _failed := _failed || ' referrals'; end;

  -- Activité / gamification
  begin delete from checkpoints where user_id = uid; exception when others then _failed := _failed || ' checkpoints'; end;
  begin delete from user_quests where user_id = uid; exception when others then _failed := _failed || ' user_quests'; end;
  begin delete from user_badges where user_id = uid; exception when others then _failed := _failed || ' user_badges'; end;
  begin delete from user_coupons where user_id = uid; exception when others then _failed := _failed || ' user_coupons'; end;
  begin delete from user_solo_log where user_id = uid; exception when others then _failed := _failed || ' user_solo_log'; end;
  begin delete from quest_suggestions where from_user = uid or to_user = uid; exception when others then _failed := _failed || ' quest_suggestions'; end;
  begin delete from quest_group_runs where initiator = uid or partner = uid; exception when others then _failed := _failed || ' quest_group_runs'; end;
  begin delete from map_activities where user_id = uid; exception when others then _failed := _failed || ' map_activities'; end;
  begin delete from place_reviews where user_id = uid; exception when others then _failed := _failed || ' place_reviews'; end;

  -- Données sensibles
  begin delete from locations_realtime where user_id = uid; exception when others then _failed := _failed || ' locations_realtime'; end;
  begin delete from trips where user_id = uid; exception when others then _failed := _failed || ' trips'; end;
  begin delete from reports where reporter = uid or reported_user = uid; exception when others then _failed := _failed || ' reports'; end;
  begin delete from push_subscriptions where user_id = uid; exception when others then _failed := _failed || ' push_subscriptions'; end;
  begin delete from app_feedback where user_id = uid; exception when others then _failed := _failed || ' app_feedback'; end;

  -- Profil + compte (en dernier)
  begin delete from profiles_private where id = uid; exception when others then _failed := _failed || ' profiles_private'; end;
  begin delete from profiles where id = uid; exception when others then _failed := _failed || ' profiles'; end;
  begin delete from auth.users where id = uid; exception when others then _failed := _failed || ' auth.users'; end;

  -- Les échecs ne bloquent pas la suppression mais sont visibles dans les logs Postgres
  if _failed <> '' then
    raise warning 'sm_delete_my_account: échecs sur:%', _failed;
  end if;
end; $$;
grant execute on function sm_delete_my_account() to authenticated;

-- ------------------------------------------------------------
-- D) STORAGE : limites de taille + types de fichiers autorisés
-- La RLS storage ne vérifie que le DOSSIER, pas le contenu : sans ces limites,
-- un client qui contourne le JS peut uploader n'importe quoi (gros fichiers, zip…).
-- ------------------------------------------------------------
do $$
begin
  update storage.buckets
    set file_size_limit = 2097152,  -- 2 Mo (les avatars compressés font < 150 Ko)
        allowed_mime_types = array['image/jpeg','image/png','image/webp']
    where id = 'avatars';
  update storage.buckets
    set file_size_limit = 3145728,  -- 3 Mo (notes vocales 30 s ≈ 2 Mo max)
        allowed_mime_types = array['audio/webm','audio/mp4','audio/mpeg','audio/ogg']
    where id = 'voicenotes';
exception when others then
  raise warning 'Limites buckets non appliquées (%) : règle-les dans Dashboard > Storage.', sqlerrm;
end $$;

-- ============================================================
-- Fin. Il ne reste que 2 choses HORS SQL :
--   • Auth > Settings : mot de passe minimum 8 caractères (1 clic dashboard)
--   • Edge Functions : redéployer send-email (version sécurisée) ou la supprimer
-- ============================================================

-- ============================================================
-- 7) VIE PRIVÉE — votes de sondage (contre-audit du 10 juin, soir)
-- ============================================================
-- Avant : SELECT using (true) → n'importe quel utilisateur connecté pouvait voir
-- QUI a voté QUOI sur chaque sondage. L'app n'en a pas besoin : elle ne lit que
-- SES propres votes, et les totaux passent par la RPC feed_poll_counts (SECURITY
-- DEFINER), qui continue de fonctionner. On restreint donc la lecture à ses votes.
drop policy if exists feed_poll_votes_select on feed_poll_votes;
create policy feed_poll_votes_select on feed_poll_votes
  for select to authenticated using (user_id = auth.uid());
