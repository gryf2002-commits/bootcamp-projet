-- ============================================================
--  SunMates — MISE À JOUR : profil complet + matchmaking
--  À coller dans Supabase : menu de gauche > SQL Editor > New query > Run
--  Rejouable sans risque (utilise "add column if not exists" / "if not exists").
--  Ne supprime aucune donnée existante.
-- ============================================================

-- 1) Nouveaux champs PUBLICS du profil (affichage + compatibilité)
alter table profiles add column if not exists first_name   text;
alter table profiles add column if not exists last_name    text;
alter table profiles add column if not exists interests    text[] default '{}';
alter table profiles add column if not exists languages    text[] default '{}';
alter table profiles add column if not exists travel_style text;

-- 2) Donnée PRIVÉE : téléphone (visible UNIQUEMENT par son propriétaire)
create table if not exists profiles_private (
  id         uuid primary key references auth.users(id) on delete cascade,
  phone      text,
  updated_at timestamptz default now()
);
alter table profiles_private enable row level security;

drop policy if exists "Je lis mes infos privees" on profiles_private;
create policy "Je lis mes infos privees"
  on profiles_private for select to authenticated using (auth.uid() = id);

drop policy if exists "Je cree mes infos privees" on profiles_private;
create policy "Je cree mes infos privees"
  on profiles_private for insert to authenticated with check (auth.uid() = id);

drop policy if exists "Je modifie mes infos privees" on profiles_private;
create policy "Je modifie mes infos privees"
  on profiles_private for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- ✅ Terminé. Tu peux maintenant remplir prénom, nom, téléphone,
--    centres d'intérêt, langues et style de voyage depuis l'app.
