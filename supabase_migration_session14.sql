-- ============================================================================
-- SunMates — Migration session 14
-- 3 nouveautés sociales, dans la continuité du modèle existant :
--   1) Présence « actif récemment »  -> profiles.last_seen_at + RPC touch_presence()
--   2) Statut éphémère 24h (« mon spot du jour ») -> colonnes status_* sur profiles
--   3) Recommandations entre Mates (« vouch ») -> table vouches + RPC vouch_count()
-- À lancer dans le SQL Editor de Supabase (sans danger, idempotent).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1) PRÉSENCE + 2) STATUT ÉPHÉMÈRE : de simples colonnes sur profiles.
--    profiles est déjà lisible par les membres connectés (matching) et
--    modifiable uniquement par son propriétaire -> rien d'autre à sécuriser.
-- ---------------------------------------------------------------------------
alter table profiles add column if not exists last_seen_at  timestamptz;
alter table profiles add column if not exists status_text   text;       -- « mon spot du jour »
alter table profiles add column if not exists status_emoji  text;       -- emoji d'ambiance
alter table profiles add column if not exists status_at     timestamptz; -- date de publication (expire après 24 h, filtré côté client)

-- Heartbeat de présence : met à jour MON last_seen_at.
-- security definer = robuste même si une policy d'update évolue ; on ne touche
-- de toute façon QUE sa propre ligne (where id = auth.uid()).
create or replace function touch_presence()
returns void
language sql
security definer
set search_path = public
as $$
  update profiles set last_seen_at = now() where id = auth.uid();
$$;
grant execute on function touch_presence() to authenticated;

-- ---------------------------------------------------------------------------
-- 3) VOUCHES — « Recommandé par X Mates »
--    Un membre peut recommander un autre membre (1 fois). Renforce la preuve
--    de confiance, dans l'esprit du score de confiance déjà en place.
-- ---------------------------------------------------------------------------
create table if not exists vouches (
  id          bigint generated always as identity primary key,
  voucher     uuid references auth.users(id) on delete cascade,  -- celui qui recommande
  vouchee     uuid references auth.users(id) on delete cascade,  -- celui qui est recommandé
  created_at  timestamptz default now(),
  unique (voucher, vouchee),
  check (voucher <> vouchee)   -- on ne se recommande pas soi-même
);
alter table vouches enable row level security;

-- Lecture : visible par tous les membres (pour compter + afficher les avatars).
drop policy if exists "Vouches visibles" on vouches;
create policy "Vouches visibles" on vouches for select to authenticated
  using (true);

-- Création : je ne crée qu'en tant que recommandeur (et jamais pour moi-même).
drop policy if exists "Je recommande" on vouches;
create policy "Je recommande" on vouches for insert to authenticated
  with check (auth.uid() = voucher and voucher <> vouchee);

-- Suppression : je ne retire que MES recommandations.
drop policy if exists "Je retire ma recommandation" on vouches;
create policy "Je retire ma recommandation" on vouches for delete to authenticated
  using (auth.uid() = voucher);

-- Nombre de recommandations reçues par un membre (security definer pour un
-- compteur fiable, même esprit que mates_count).
create or replace function vouch_count(p_uid uuid)
returns int
language sql
security definer
set search_path = public
as $$
  select count(*)::int from vouches where vouchee = p_uid;
$$;
grant execute on function vouch_count(uuid) to authenticated;
