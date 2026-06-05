-- ============================================================
-- SunMates — Session 17 : ANTI-TRICHE QUÊTES (XP au lieu du trust)
--                         + LIMITES (3/jour + cooldown) + CLASSEMENT
-- À lancer dans le SQL Editor de Supabase. Rejouable (idempotent).
-- ============================================================

-- 1) Monnaie de jeu séparée : XP (les quêtes ne touchent PLUS le score de confiance)
alter table profiles add column if not exists xp int default 0;

-- 2) complete_quest : attribue de l'XP (pas du trust), avec garde-fous anti-farm :
--    - 3 quêtes accomplies maximum par jour
--    - cooldown de 20 min entre deux quêtes
--    (Le badge + le coupon restent attribués comme avant.)
create or replace function complete_quest(p_quest_key text, p_code text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  q quests%rowtype;
  v_code text;
  v_today_count int;
  v_last timestamptz;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'message', 'Non connecté.');
  end if;
  select * into q from quests where key = p_quest_key;
  if not found then
    return jsonb_build_object('ok', false, 'message', 'Quête inconnue.');
  end if;
  -- Déjà accomplie ?
  if exists (select 1 from user_quests where user_id = v_uid and quest_key = p_quest_key and status = 'completed') then
    return jsonb_build_object('ok', false, 'message', 'Quête déjà accomplie.');
  end if;
  -- Anti-farm : 3 quêtes / jour maximum
  select count(*) into v_today_count from user_quests
    where user_id = v_uid and status = 'completed' and completed_at::date = now()::date;
  if v_today_count >= 3 then
    return jsonb_build_object('ok', false, 'message', 'Limite atteinte : 3 quêtes par jour. Reviens demain ! 🌙');
  end if;
  -- Anti-farm : cooldown de 20 min entre deux quêtes
  select max(completed_at) into v_last from user_quests
    where user_id = v_uid and status = 'completed';
  if v_last is not null and v_last > now() - interval '20 minutes' then
    return jsonb_build_object('ok', false, 'message', 'Doucement ! Attends un peu entre deux quêtes ⏳');
  end if;
  -- Validation par code si la quête est liée à un lieu (anti-triche à distance)
  if q.requires_code then
    if q.cafe_id is null then
      return jsonb_build_object('ok', false, 'message', 'Quête mal configurée (pas de lieu).');
    end if;
    select code into v_code from cafe_codes where cafe_id = q.cafe_id;
    if v_code is null or upper(trim(coalesce(p_code,''))) <> upper(trim(v_code)) then
      return jsonb_build_object('ok', false, 'message', 'Code incorrect. Demande-le sur place.');
    end if;
  end if;
  -- Marque la quête accomplie
  insert into user_quests (user_id, quest_key, status, completed_at)
  values (v_uid, p_quest_key, 'completed', now())
  on conflict (user_id, quest_key) do update set status = 'completed', completed_at = now();
  -- Badge
  if q.badge_key is not null then
    insert into user_badges (user_id, badge_key, name, emoji)
    values (v_uid, q.badge_key, q.badge_name, q.badge_emoji)
    on conflict (user_id, badge_key) do nothing;
  end if;
  -- Coupon
  if q.coupon_title is not null then
    insert into user_coupons (user_id, quest_key, title, descr)
    values (v_uid, p_quest_key, q.coupon_title, q.coupon_desc);
  end if;
  -- ⭐ XP (et PLUS de trust_score : les quêtes ne montent plus la confiance)
  update profiles set xp = coalesce(xp,0) + coalesce(q.points,0) where id = v_uid;
  return jsonb_build_object('ok', true, 'points', q.points, 'xp', q.points,
    'badge', q.badge_name, 'coupon', q.coupon_title,
    'message', 'Quête accomplie ✅ +' || coalesce(q.points,0) || ' XP');
end;
$$;
grant execute on function complete_quest(text, text) to authenticated;

-- 3) CLASSEMENT : une seule fonction, plusieurs métriques.
--    security definer = peut compter check-ins/badges de tous (la RLS limiterait sinon).
--    Métriques : 'xp' (défaut) | 'trust' | 'checkins' | 'badges'. Exclut les comptes bannis.
create or replace function leaderboard(p_metric text default 'xp', p_limit int default 30)
returns table (id uuid, username text, avatar_url text, city text, is_verified boolean, value bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_metric = 'trust' then
    return query
      select p.id, p.username, p.avatar_url, p.city, p.is_verified, coalesce(p.trust_score,0)::bigint
      from profiles p
      where coalesce(p.banned,false) = false and coalesce(p.username,'') <> ''
      order by 6 desc, p.username asc limit p_limit;
  elsif p_metric = 'checkins' then
    return query
      select p.id, p.username, p.avatar_url, p.city, p.is_verified, count(c.*)::bigint
      from profiles p left join checkpoints c on c.user_id = p.id
      where coalesce(p.banned,false) = false and coalesce(p.username,'') <> ''
      group by p.id order by 6 desc, p.username asc limit p_limit;
  elsif p_metric = 'badges' then
    return query
      select p.id, p.username, p.avatar_url, p.city, p.is_verified, count(b.*)::bigint
      from profiles p left join user_badges b on b.user_id = p.id
      where coalesce(p.banned,false) = false and coalesce(p.username,'') <> ''
      group by p.id order by 6 desc, p.username asc limit p_limit;
  else -- 'xp' (défaut)
    return query
      select p.id, p.username, p.avatar_url, p.city, p.is_verified, coalesce(p.xp,0)::bigint
      from profiles p
      where coalesce(p.banned,false) = false and coalesce(p.username,'') <> ''
      order by 6 desc, p.username asc limit p_limit;
  end if;
end;
$$;
grant execute on function leaderboard(text, int) to authenticated;

-- Fin session 17.
