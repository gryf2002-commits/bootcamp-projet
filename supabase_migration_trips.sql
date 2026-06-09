-- ============================================================
-- SunMates — « Mon voyage » : matching dans le TEMPS + l'espace
-- ============================================================
-- Chacun déclare ses voyages à venir (ville + dates). L'app montre qui sera au même
-- endroit en même temps. RLS : lecture par les membres (ville+dates = non sensible),
-- écriture seulement par soi. RPC = chevauchements avec MES voyages. Idempotent.
-- À exécuter dans le SQL Editor de Supabase.
-- ============================================================

create table if not exists trips (
  id         bigint generated always as identity primary key,
  user_id    uuid references auth.users(id) on delete cascade,
  city       text not null,
  country    text,
  lat        double precision,
  lng        double precision,
  start_date date not null,
  end_date   date not null,
  note       text,
  created_at timestamptz default now()
);
create index if not exists idx_trips_user  on trips (user_id);
create index if not exists idx_trips_dates on trips (start_date, end_date);

alter table trips enable row level security;

-- Lecture : voyages des membres (nécessaire au matching ; juste ville + dates).
-- On masque ceux des comptes bannis.
drop policy if exists "Voyages visibles par les membres" on trips;
create policy "Voyages visibles par les membres" on trips
  for select to authenticated using (
    not exists (select 1 from profiles p where p.id = trips.user_id and coalesce(p.banned, false) = true)
  );

drop policy if exists "Je gere mes voyages (insert)" on trips;
create policy "Je gere mes voyages (insert)" on trips
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Je gere mes voyages (update)" on trips;
create policy "Je gere mes voyages (update)" on trips
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Je gere mes voyages (delete)" on trips;
create policy "Je gere mes voyages (delete)" on trips
  for delete to authenticated using (auth.uid() = user_id);

-- RPC : voyageurs dont un voyage CHEVAUCHE l'un des miens (même ville, dates qui se croisent).
create or replace function overlapping_travelers()
returns table (trip_id bigint, user_id uuid, city text, country text, start_date date, end_date date)
language sql security definer set search_path = public as $$
  select t.id, t.user_id, t.city, t.country, t.start_date, t.end_date
  from trips t
  join trips me on me.user_id = auth.uid()
  where t.user_id <> auth.uid()
    and lower(trim(t.city)) = lower(trim(me.city))   -- même ville (v1 : exact ; v2 : rayon géo)
    and t.start_date <= me.end_date
    and t.end_date   >= me.start_date                -- chevauchement de dates
    and t.end_date   >= current_date                 -- pas de voyages passés
    and not exists (select 1 from profiles p where p.id = t.user_id and coalesce(p.banned,false) = true)
  order by t.start_date;
$$;
grant execute on function overlapping_travelers() to authenticated;

-- ============================================================
-- Fin. v2 possible : matcher par rayon géo (lat/lng) plutôt que nom de ville exact.
-- ============================================================
