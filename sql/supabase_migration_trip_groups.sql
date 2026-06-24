-- ============================================================================
-- SunMates · #23 CHATS DE GROUPE PAR VOYAGE (façon TripBFF)
-- ----------------------------------------------------------------------------
-- Idée : les voyageur·ses qui partent dans la MÊME ville sur la MÊME période
-- (mois) partagent automatiquement un salon de groupe. Quand tu ajoutes un
-- voyage, l'app te place dans le groupe « <ville> · <mois> » (créé si besoin),
-- et tu peux discuter avec tout le monde qui y va.
--
-- ⚠️ À APPLIQUER par Maxime (Dashboard Supabase > SQL Editor, ou via MCP avec
--    son feu vert explicite « applique le »). Le front (app.html) dégrade
--    proprement si ces tables n'existent pas encore (try/catch).
-- Idempotent : ré-exécutable sans casse.
-- ============================================================================

-- 1) TABLES -----------------------------------------------------------------
create table if not exists public.trip_groups (
  id          bigint generated always as identity primary key,
  group_key   text unique not null,           -- ex : 'lisbonne|2026-07'
  city        text not null,                   -- libellé ville (affichage)
  period      text,                            -- ex : 'Juillet 2026'
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists public.trip_group_members (
  group_id   bigint not null references public.trip_groups(id) on delete cascade,
  user_id    uuid   not null references auth.users(id) on delete cascade,
  joined_at  timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists public.trip_group_messages (
  id          bigint generated always as identity primary key,
  group_id    bigint not null references public.trip_groups(id) on delete cascade,
  user_id     uuid   not null references auth.users(id) on delete cascade,
  content     text   not null check (char_length(content) between 1 and 2000),
  created_at  timestamptz not null default now()
);

create index if not exists idx_tgm_group   on public.trip_group_members(group_id);
create index if not exists idx_tgm_user    on public.trip_group_members(user_id);
create index if not exists idx_tgmsg_group on public.trip_group_messages(group_id, created_at);

-- 2) HELPER (SECURITY DEFINER) : suis-je membre de ce groupe ? --------------
--    Évite la récursion RLS quand on lit trip_group_members/messages.
create or replace function public.sm_in_trip_group(gid bigint)
returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.trip_group_members m
    where m.group_id = gid and m.user_id = auth.uid()
  );
$$;
revoke all on function public.sm_in_trip_group(bigint) from public;
grant execute on function public.sm_in_trip_group(bigint) to authenticated;

-- 3) RLS --------------------------------------------------------------------
alter table public.trip_groups          enable row level security;
alter table public.trip_group_members   enable row level security;
alter table public.trip_group_messages  enable row level security;

-- trip_groups : tout membre connecté peut DÉCOUVRIR les groupes (lecture) et en
-- CRÉER un (la clé unique empêche les doublons). Pas d'update/delete client.
drop policy if exists "tg select" on public.trip_groups;
create policy "tg select" on public.trip_groups
  for select to authenticated using (true);
drop policy if exists "tg insert" on public.trip_groups;
create policy "tg insert" on public.trip_groups
  for insert to authenticated with check (created_by = auth.uid());

-- trip_group_members : je vois les membres des groupes OÙ JE SUIS ; je gère MA
-- propre adhésion (rejoindre / quitter), pas celle des autres.
drop policy if exists "tgm select" on public.trip_group_members;
create policy "tgm select" on public.trip_group_members
  for select to authenticated using (public.sm_in_trip_group(group_id));
drop policy if exists "tgm insert self" on public.trip_group_members;
create policy "tgm insert self" on public.trip_group_members
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "tgm delete self" on public.trip_group_members;
create policy "tgm delete self" on public.trip_group_members
  for delete to authenticated using (user_id = auth.uid());

-- trip_group_messages : lecture/écriture réservées aux MEMBRES du groupe.
drop policy if exists "tgmsg select" on public.trip_group_messages;
create policy "tgmsg select" on public.trip_group_messages
  for select to authenticated using (public.sm_in_trip_group(group_id));
drop policy if exists "tgmsg insert member" on public.trip_group_messages;
create policy "tgmsg insert member" on public.trip_group_messages
  for insert to authenticated
  with check (user_id = auth.uid() and public.sm_in_trip_group(group_id));
drop policy if exists "tgmsg delete own" on public.trip_group_messages;
create policy "tgmsg delete own" on public.trip_group_messages
  for delete to authenticated using (user_id = auth.uid());

-- 4) RPC : rejoindre (ou créer) le groupe d'un voyage, et le renvoyer -------
--    Appelé par l'app quand on ajoute un voyage. Crée le groupe si absent,
--    ajoute l'appelant comme membre, renvoie l'id + métadonnées.
create or replace function public.sm_join_trip_group(p_city text, p_key text, p_period text)
returns public.trip_groups
language plpgsql security definer set search_path = public as $$
declare g public.trip_groups;
begin
  if coalesce(trim(p_key), '') = '' then raise exception 'group_key requis'; end if;
  insert into public.trip_groups (group_key, city, period, created_by)
    values (p_key, coalesce(nullif(trim(p_city), ''), 'Voyage'), p_period, auth.uid())
    on conflict (group_key) do update set city = excluded.city
    returning * into g;
  insert into public.trip_group_members (group_id, user_id)
    values (g.id, auth.uid())
    on conflict (group_id, user_id) do nothing;
  return g;
end;
$$;
revoke all on function public.sm_join_trip_group(text, text, text) from public;
grant execute on function public.sm_join_trip_group(text, text, text) to authenticated;

-- 5) (optionnel) Realtime : décommente si tu veux le live sur les messages.
-- alter publication supabase_realtime add table public.trip_group_messages;
