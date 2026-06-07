-- ============================================================
-- SunMates — Session 33 : Classement PAR VILLE + stat parrainages (admin)
-- ============================================================
-- 1) leaderboard() accepte une ville optionnelle (p_city) → « top explorateurs de Lyon ».
-- 2) admin_stats() expose le nombre de parrainages (table referrals de la s32).
-- Rejouable. À exécuter dans le SQL Editor de Supabase.
-- ============================================================

-- 1) Classement filtrable par ville (p_city = null → national, comme avant)
create or replace function leaderboard(p_metric text default 'xp', p_city text default null, p_limit int default 30)
returns table (id uuid, username text, avatar_url text, city text, is_verified boolean, value bigint)
language plpgsql security definer set search_path = public as $$
begin
  if p_metric = 'trust' then
    return query
      select p.id, p.username, p.avatar_url, p.city, p.is_verified, coalesce(p.trust_score,0)::bigint
      from profiles p
      where coalesce(p.banned,false) = false and coalesce(p.is_public,true) = true and coalesce(p.username,'') <> ''
        and (p_city is null or split_part(coalesce(p.city,''), ',', 1) ilike p_city)
      order by 6 desc, p.username asc limit p_limit;
  elsif p_metric = 'checkins' then
    return query
      select p.id, p.username, p.avatar_url, p.city, p.is_verified, count(c.*)::bigint
      from profiles p left join checkpoints c on c.user_id = p.id
      where coalesce(p.banned,false) = false and coalesce(p.is_public,true) = true and coalesce(p.username,'') <> ''
        and (p_city is null or split_part(coalesce(p.city,''), ',', 1) ilike p_city)
      group by p.id order by 6 desc, p.username asc limit p_limit;
  elsif p_metric = 'badges' then
    return query
      select p.id, p.username, p.avatar_url, p.city, p.is_verified, count(b.*)::bigint
      from profiles p left join user_badges b on b.user_id = p.id
      where coalesce(p.banned,false) = false and coalesce(p.is_public,true) = true and coalesce(p.username,'') <> ''
        and (p_city is null or split_part(coalesce(p.city,''), ',', 1) ilike p_city)
      group by p.id order by 6 desc, p.username asc limit p_limit;
  else -- 'xp'
    return query
      select p.id, p.username, p.avatar_url, p.city, p.is_verified, coalesce(p.xp,0)::bigint
      from profiles p
      where coalesce(p.banned,false) = false and coalesce(p.is_public,true) = true and coalesce(p.username,'') <> ''
        and (p_city is null or split_part(coalesce(p.city,''), ',', 1) ilike p_city)
      order by 6 desc, p.username asc limit p_limit;
  end if;
end; $$;
grant execute on function leaderboard(text, text, int) to authenticated;

-- 2) admin_stats() + parrainages (et on garde tout le reste de la s31)
create or replace function admin_stats()
returns jsonb language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then return jsonb_build_object('ok', false); end if;
  return jsonb_build_object(
    'ok', true,
    'users',           (select count(*) from profiles where coalesce(banned,false) = false),
    'verified',        (select count(*) from profiles where is_verified = true and coalesce(banned,false) = false),
    'gold',            (select count(*) from profiles where is_gold = true and coalesce(banned,false) = false),
    'admins',          (select count(*) from profiles where is_admin = true),
    'banned',          (select count(*) from profiles where banned = true),
    'referrals',       (select count(*) from referrals),
    'connections',     (select count(*) from matches_connections where status = 'accepted'),
    'pending_conn',    (select count(*) from matches_connections where status = 'pending'),
    'checkins',        (select count(*) from checkpoints),
    'quests_done',     (select count(*) from user_quests where status = 'completed'),
    'messages',        (select count(*) from messages),
    'suggestions',     (select count(*) from quest_suggestions),
    'badges',          (select count(*) from user_badges),
    'coupons',         (select count(*) from user_coupons),
    'places',          (select count(*) from partner_cafes),
    'reports_pending', (select count(*) from reports where coalesce(handled,false) = false),
    'quotes',          (select count(*) from quote_requests where status = 'nouveau')
  );
end; $$;
grant execute on function admin_stats() to authenticated;

-- ============================================================
-- Fin. Classement filtrable par ville + KPI « Parrainages » dans le tableau de bord admin.
-- ============================================================
