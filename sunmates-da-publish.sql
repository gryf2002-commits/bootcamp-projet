-- ============================================================
-- SunMates — DA « Publier pour TOUS » (table da_tokens)
-- À lancer dans Supabase → SQL Editor.
-- La DA publiée (1 seule ligne id='live') est lue par sunmates-da-loader.js
-- au chargement pour TOUS les utilisateurs. Seuls les admins peuvent publier.
-- ============================================================

-- NB : la table existait déjà (ancienne session DA) avec id ENTIER + 1 ligne (id=1).
-- Le code (loader + console) utilise id=1. Ce script garantit surtout la RLS ci-dessous.
create table if not exists public.da_tokens (
  id          smallint primary key default 1,
  tokens      jsonb not null,
  updated_at  timestamptz not null default now()
);

alter table public.da_tokens enable row level security;

-- Lecture PUBLIQUE : tout le monde (même non connecté) lit la DA publiée.
drop policy if exists da_tokens_read on public.da_tokens;
create policy da_tokens_read
  on public.da_tokens for select
  using (true);

-- Écriture réservée aux ADMINS (profiles.is_admin = true).
drop policy if exists da_tokens_write on public.da_tokens;
create policy da_tokens_write
  on public.da_tokens for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- (optionnel) Realtime pour un live-push sans rechargement :
-- alter publication supabase_realtime add table public.da_tokens;
