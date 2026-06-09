-- ============================================================
-- SunMates — Sondages dans le fil (poll posts)
-- ============================================================
-- Un post du fil peut être un SONDAGE : question (body) + options (poll_options).
-- Les votes sont stockés à part (1 par personne et par sondage). RLS systématique.
-- Idempotent. À exécuter dans le SQL Editor de Supabase.
-- ============================================================

-- Options du sondage portées par le post (null = post normal).
alter table feed_posts add column if not exists poll_options text[];

create table if not exists feed_poll_votes (
  post_id    bigint not null references feed_posts(id) on delete cascade,
  user_id    uuid   not null references auth.users(id) on delete cascade,
  choice     int    not null,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
create index if not exists feed_poll_votes_post_idx on feed_poll_votes (post_id);

alter table feed_poll_votes enable row level security;

drop policy if exists feed_poll_votes_select on feed_poll_votes;
create policy feed_poll_votes_select on feed_poll_votes for select to authenticated using (true);

drop policy if exists feed_poll_votes_insert on feed_poll_votes;
create policy feed_poll_votes_insert on feed_poll_votes for insert to authenticated with check (user_id = auth.uid());

drop policy if exists feed_poll_votes_update on feed_poll_votes;
create policy feed_poll_votes_update on feed_poll_votes for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists feed_poll_votes_delete on feed_poll_votes;
create policy feed_poll_votes_delete on feed_poll_votes for delete to authenticated using (user_id = auth.uid());

-- Décompte des votes par option (1 appel pour plusieurs sondages).
create or replace function feed_poll_counts(p_ids bigint[])
returns table(post_id bigint, choice int, n bigint)
language sql stable security definer set search_path = public as $$
  select v.post_id, v.choice, count(*)::bigint
  from feed_poll_votes v
  where v.post_id = any(p_ids)
  group by v.post_id, v.choice;
$$;
grant execute on function feed_poll_counts(bigint[]) to authenticated;

-- ============================================================
-- Fin. Sondage = feed_posts.kind='poll' + body=question + poll_options=text[].
-- ============================================================
