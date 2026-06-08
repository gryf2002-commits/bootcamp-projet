-- ============================================================
-- SunMates — Commentaires du fil communautaire (feed_comments)
-- ============================================================
-- Permet de commenter un post du fil. Texte léger (stocké en base, PAS dans le
-- Storage → n'entame pas le quota de 1 Go du bucket). RLS : lecture publique des
-- commentaires sur posts visibles, écriture = soi-même, suppression = son propre
-- commentaire OU l'auteur du post. Idempotent (rejouable).
-- À exécuter dans le SQL Editor de Supabase.
-- ============================================================

create table if not exists feed_comments (
  id         bigint generated always as identity primary key,
  post_id    bigint not null references feed_posts(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists feed_comments_post_idx on feed_comments (post_id, created_at);

alter table feed_comments enable row level security;

-- LECTURE : publique (le fil est public). On masque les commentaires d'auteurs bannis.
drop policy if exists feed_comments_select on feed_comments;
create policy feed_comments_select on feed_comments
  for select using (
    not exists (select 1 from profiles p where p.id = feed_comments.user_id and coalesce(p.banned, false) = true)
  );

-- ÉCRITURE : seulement en son propre nom, et si on n'est pas banni.
drop policy if exists feed_comments_insert on feed_comments;
create policy feed_comments_insert on feed_comments
  for insert with check (
    user_id = auth.uid()
    and not exists (select 1 from profiles p where p.id = auth.uid() and coalesce(p.banned, false) = true)
  );

-- SUPPRESSION : son propre commentaire OU l'auteur du post peut modérer son fil.
drop policy if exists feed_comments_delete on feed_comments;
create policy feed_comments_delete on feed_comments
  for delete using (
    user_id = auth.uid()
    or exists (select 1 from feed_posts fp where fp.id = feed_comments.post_id and fp.user_id = auth.uid())
  );

-- Compte des commentaires par post (1 appel, évite N requêtes côté app).
create or replace function feed_comment_counts(p_ids bigint[])
returns table(post_id bigint, n bigint)
language sql stable security definer set search_path = public as $$
  select c.post_id, count(*)::bigint
  from feed_comments c
  where c.post_id = any(p_ids)
    and not exists (select 1 from profiles p where p.id = c.user_id and coalesce(p.banned,false) = true)
  group by c.post_id;
$$;

-- ============================================================
-- Fin. Commentaires = texte en base (léger). Storage bucket inchangé.
-- ============================================================
