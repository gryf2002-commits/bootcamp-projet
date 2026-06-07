-- ============================================================
-- SunMates — Session 27 : XP INVIOLABLE (anti-triche) + défis solo serveur
-- ============================================================
-- PROBLÈME : le client pouvait écrire profiles.xp directement (RLS « update own »),
-- et les défis solo créditaient l'XP côté client → triche triviale + pas cross-device.
--
-- SOLUTION :
--   1) Un TRIGGER bloque toute modification de profiles.xp qui ne vient PAS d'une
--      fonction serveur de confiance (SECURITY DEFINER qui pose un flag de transaction).
--   2) Les montants/cap des défis solo vivent en BASE (le client ne peut plus mentir).
--   3) RPC grant_solo_xp : valide (déjà fait ? cap du jour ?), journalise, crédite l'XP.
--   4) complete_quest est ré-émise avec le flag pour rester compatible avec le trigger.
--
-- Rejouable. À exécuter dans le SQL Editor de Supabase.
-- ============================================================

-- 1) GARDE-FOU : l'XP ne peut bouger que via une fonction serveur de confiance
create or replace function _sm_guard_xp()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.xp is distinct from old.xp then
    -- autorisé uniquement si une fonction de confiance a posé le flag dans la transaction
    if coalesce(current_setting('sunmates.xp_ok', true), '') <> '1' then
      new.xp := old.xp;  -- on ignore silencieusement la tentative directe (anti-triche)
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists sm_guard_xp on profiles;
create trigger sm_guard_xp before update on profiles
  for each row execute function _sm_guard_xp();

-- 2) Source de vérité serveur des tâches solo (montants + type) — le client ne fixe rien
create table if not exists solo_tasks (
  key text primary key,
  kind text not null,            -- 'challenge' | 'ritual'
  xp   int  not null default 10
);
alter table solo_tasks enable row level security;
drop policy if exists "Taches solo visibles" on solo_tasks;
create policy "Taches solo visibles" on solo_tasks for select to authenticated using (true);

insert into solo_tasks (key, kind, xp) values
  ('explore_quartier','challenge',60), ('photo_detail','challenge',40), ('cafe_solo','challenge',30),
  ('sunset_spot','challenge',50), ('new_dish','challenge',45), ('green_break','challenge',35),
  ('talk_stranger','challenge',55), ('culture_dose','challenge',50), ('walk_5k','challenge',40),
  ('market_morning','challenge',45),
  ('rit_outside','ritual',10), ('rit_photo','ritual',10), ('rit_wishlist','ritual',10)
on conflict (key) do update set kind = excluded.kind, xp = excluded.xp;

-- 3) Journal des tâches solo (anti-farm + état cross-device). Écriture via RPC uniquement.
create table if not exists user_solo_log (
  id        bigint generated always as identity primary key,
  user_id   uuid references auth.users(id) on delete cascade,
  task_key  text not null,
  kind      text not null,
  xp        int  not null,
  day       date not null default (now()::date),
  created_at timestamptz not null default now(),
  unique (user_id, task_key, day)   -- une fois par jour par tâche
);
alter table user_solo_log enable row level security;
drop policy if exists "Voir mon journal solo" on user_solo_log;
create policy "Voir mon journal solo" on user_solo_log for select to authenticated using (user_id = auth.uid());
-- (pas de policy insert/update/delete → seul le RPC SECURITY DEFINER écrit)

-- 4) RPC : crédite l'XP d'une tâche solo, avec anti-farm serveur (cap 3/jour par type)
create or replace function grant_solo_xp(p_key text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  t solo_tasks%rowtype;
  v_today int;
  v_cap int := 3;          -- 3 défis/jour ET 3 rituels/jour
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'message', 'Non connecté.'); end if;
  select * into t from solo_tasks where key = p_key;
  if not found then return jsonb_build_object('ok', false, 'message', 'Tâche inconnue.'); end if;
  if exists (select 1 from user_solo_log where user_id = v_uid and task_key = p_key and day = now()::date) then
    return jsonb_build_object('ok', false, 'message', 'Déjà accompli aujourd''hui ✅');
  end if;
  select count(*) into v_today from user_solo_log where user_id = v_uid and kind = t.kind and day = now()::date;
  if v_today >= v_cap then
    return jsonb_build_object('ok', false, 'message',
      (case when t.kind = 'ritual' then 'Tes 3 rituels du jour sont faits 🌙' else 'Limite : 3 défis solo par jour 🌙' end));
  end if;
  insert into user_solo_log (user_id, task_key, kind, xp) values (v_uid, p_key, t.kind, t.xp);
  -- flag de confiance pour passer le trigger, puis crédit
  perform set_config('sunmates.xp_ok', '1', true);
  update profiles set xp = coalesce(xp, 0) + t.xp where id = v_uid;
  return jsonb_build_object('ok', true, 'xp', t.xp, 'kind', t.kind, 'message', '+' || t.xp || ' XP');
end; $$;
grant execute on function grant_solo_xp(text) to authenticated;

-- 5) Ré-émission de complete_quest AVEC le flag (sinon le trigger bloquerait son update xp)
create or replace function complete_quest(p_quest_key text, p_code text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  q quests%rowtype;
  v_code text;
  v_today_count int;
  v_last timestamptz;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'message', 'Non connecté.'); end if;
  select * into q from quests where key = p_quest_key;
  if not found then return jsonb_build_object('ok', false, 'message', 'Quête inconnue.'); end if;
  if exists (select 1 from user_quests where user_id = v_uid and quest_key = p_quest_key and status = 'completed') then
    return jsonb_build_object('ok', false, 'message', 'Quête déjà accomplie.');
  end if;
  select count(*) into v_today_count from user_quests
    where user_id = v_uid and status = 'completed' and completed_at::date = now()::date;
  if v_today_count >= 3 then
    return jsonb_build_object('ok', false, 'message', 'Limite atteinte : 3 quêtes par jour. Reviens demain ! 🌙');
  end if;
  select max(completed_at) into v_last from user_quests where user_id = v_uid and status = 'completed';
  if v_last is not null and v_last > now() - interval '20 minutes' then
    return jsonb_build_object('ok', false, 'message', 'Doucement ! Attends un peu entre deux quêtes ⏳');
  end if;
  if q.requires_code then
    if q.cafe_id is null then return jsonb_build_object('ok', false, 'message', 'Quête mal configurée (pas de lieu).'); end if;
    select code into v_code from cafe_codes where cafe_id = q.cafe_id;
    if v_code is null or upper(trim(coalesce(p_code,''))) <> upper(trim(v_code)) then
      return jsonb_build_object('ok', false, 'message', 'Code incorrect. Demande-le sur place.');
    end if;
  end if;
  insert into user_quests (user_id, quest_key, status, completed_at)
  values (v_uid, p_quest_key, 'completed', now())
  on conflict (user_id, quest_key) do update set status = 'completed', completed_at = now();
  if q.badge_key is not null then
    insert into user_badges (user_id, badge_key, name, emoji)
    values (v_uid, q.badge_key, q.badge_name, q.badge_emoji)
    on conflict (user_id, badge_key) do nothing;
  end if;
  if q.coupon_title is not null then
    insert into user_coupons (user_id, quest_key, title, descr)
    values (v_uid, p_quest_key, q.coupon_title, q.coupon_desc);
  end if;
  perform set_config('sunmates.xp_ok', '1', true);   -- flag de confiance pour le trigger
  update profiles set xp = coalesce(xp,0) + coalesce(q.points,0) where id = v_uid;
  return jsonb_build_object('ok', true, 'points', q.points, 'xp', q.points,
    'badge', q.badge_name, 'coupon', q.coupon_title,
    'message', 'Quête accomplie ✅ +' || coalesce(q.points,0) || ' XP');
end; $$;
grant execute on function complete_quest(text, text) to authenticated;

-- ============================================================
-- Après cette migration : l'XP ne peut plus être trafiquée côté client.
-- Les défis/rituels solo passent par grant_solo_xp (cap 3+3 / jour, cross-device).
-- ============================================================
