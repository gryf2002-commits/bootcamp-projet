-- ============================================================
-- SunMates — tables de pilotage DA (à exécuter dans le SQL Editor Supabase)
-- 1 ligne de config (id=1) lue par tous au démarrage, écrite par l'admin.
-- ⚠️ Adapte la condition "admin" à TON schéma (ici : profiles.is_admin booléen).
--    Si tu n'as pas profiles.is_admin, remplace par ton mécanisme
--    (ex. auth.uid() = '<ton-uuid-admin>').
-- ============================================================

-- (optionnel) flag admin sur profiles si absent
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- ---- Tokens DA (couleurs, modes, icônes, effets, logos…) ----
create table if not exists public.da_tokens (
  id          smallint primary key default 1,
  tokens      jsonb       not null,
  updated_at  timestamptz not null default now(),
  updated_by  uuid        references auth.users(id)
);
alter table public.da_tokens enable row level security;

drop policy if exists "da_tokens read" on public.da_tokens;
create policy "da_tokens read" on public.da_tokens
  for select using (true);

drop policy if exists "da_tokens admin write" on public.da_tokens;
create policy "da_tokens admin write" on public.da_tokens
  for all
  using  (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- ---- Strings (overrides de textes FR/EN) ----
create table if not exists public.da_strings (
  id          smallint primary key default 1,
  strings     jsonb       not null,
  updated_at  timestamptz not null default now(),
  updated_by  uuid        references auth.users(id)
);
alter table public.da_strings enable row level security;

drop policy if exists "da_strings read" on public.da_strings;
create policy "da_strings read" on public.da_strings
  for select using (true);

drop policy if exists "da_strings admin write" on public.da_strings;
create policy "da_strings admin write" on public.da_strings
  for all
  using  (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- lignes initiales (vides) pour éviter un select null
insert into public.da_tokens (id, tokens)  values (1, '{}'::jsonb) on conflict (id) do nothing;
insert into public.da_strings (id, strings) values (1, '{}'::jsonb) on conflict (id) do nothing;
