-- ============================================================
-- SunMates — Session 23 : PROFIL PUBLIC / PRIVÉ
-- Un profil privé n'apparaît PAS dans les classements. Réglage côté utilisateur.
-- À lancer dans le SQL Editor de Supabase. Rejouable (idempotent).
-- ============================================================

alter table profiles add column if not exists is_public boolean default true;

-- Classement : on exclut les profils privés (null = public par défaut, pour l'existant).
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
      where coalesce(p.banned,false) = false and coalesce(p.is_public,true) = true and coalesce(p.username,'') <> ''
      order by 6 desc, p.username asc limit p_limit;
  elsif p_metric = 'checkins' then
    return query
      select p.id, p.username, p.avatar_url, p.city, p.is_verified, count(c.*)::bigint
      from profiles p left join checkpoints c on c.user_id = p.id
      where coalesce(p.banned,false) = false and coalesce(p.is_public,true) = true and coalesce(p.username,'') <> ''
      group by p.id order by 6 desc, p.username asc limit p_limit;
  elsif p_metric = 'badges' then
    return query
      select p.id, p.username, p.avatar_url, p.city, p.is_verified, count(b.*)::bigint
      from profiles p left join user_badges b on b.user_id = p.id
      where coalesce(p.banned,false) = false and coalesce(p.is_public,true) = true and coalesce(p.username,'') <> ''
      group by p.id order by 6 desc, p.username asc limit p_limit;
  else -- 'xp'
    return query
      select p.id, p.username, p.avatar_url, p.city, p.is_verified, coalesce(p.xp,0)::bigint
      from profiles p
      where coalesce(p.banned,false) = false and coalesce(p.is_public,true) = true and coalesce(p.username,'') <> ''
      order by 6 desc, p.username asc limit p_limit;
  end if;
end;
$$;
grant execute on function leaderboard(text, int) to authenticated;

-- Fin session 23.
