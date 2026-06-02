-- ============================================================
--  SunMates — schéma de base de données + sécurité (RLS)
--  À coller dans Supabase : menu de gauche > SQL Editor > New query > Run
--  (Tu peux relancer ce script sans risque : il utilise "if not exists".)
-- ============================================================

-- 1) PROFILS (liés aux comptes Supabase Auth) -----------------
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text,
  bio         text,
  city        text,
  trust_score int default 0,
  is_verified boolean default false,
  created_at  timestamptz default now()
);
alter table profiles enable row level security;

drop policy if exists "Profils visibles par les membres connectes" on profiles;
create policy "Profils visibles par les membres connectes"
  on profiles for select to authenticated using (true);

drop policy if exists "Je cree mon propre profil" on profiles;
create policy "Je cree mon propre profil"
  on profiles for insert to authenticated with check (auth.uid() = id);

drop policy if exists "Je modifie seulement mon profil" on profiles;
create policy "Je modifie seulement mon profil"
  on profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- 2) LIEUX SÛRS PARTENAIRES (cafés, co-livings) ---------------
create table if not exists partner_cafes (
  id          bigint generated always as identity primary key,
  name        text not null,
  category    text,
  city        text,
  is_eco      boolean default false,
  safety_note text,
  created_at  timestamptz default now()
);
alter table partner_cafes enable row level security;

drop policy if exists "Lieux surs visibles par les membres" on partner_cafes;
create policy "Lieux surs visibles par les membres"
  on partner_cafes for select to authenticated using (true);

-- 3) CHECK-INS GAMIFIÉS ---------------------------------------
create table if not exists checkpoints (
  id         bigint generated always as identity primary key,
  user_id    uuid references auth.users(id) on delete cascade,
  cafe_id    bigint references partner_cafes(id),
  created_at timestamptz default now()
);
alter table checkpoints enable row level security;

drop policy if exists "Je vois mes check-ins" on checkpoints;
create policy "Je vois mes check-ins"
  on checkpoints for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Je cree mes check-ins" on checkpoints;
create policy "Je cree mes check-ins"
  on checkpoints for insert to authenticated with check (auth.uid() = user_id);

-- 4) PARTAGE DE POSITION (cercle de confiance / urgence) ------
create table if not exists locations_realtime (
  id           bigint generated always as identity primary key,
  user_id      uuid references auth.users(id) on delete cascade,
  lat          double precision,
  lng          double precision,
  is_emergency boolean default false,
  created_at   timestamptz default now()
);
alter table locations_realtime enable row level security;

-- Cercle de confiance : je vois mes positions ET celles de mes connexions acceptées
drop policy if exists "Je vois mes positions" on locations_realtime;
drop policy if exists "Mon cercle de confiance voit mes positions" on locations_realtime;
create policy "Mon cercle de confiance voit mes positions"
  on locations_realtime for select to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from matches_connections m
      where m.status = 'accepted'
        and (
          (m.user_a = auth.uid() and m.user_b = locations_realtime.user_id)
          or (m.user_b = auth.uid() and m.user_a = locations_realtime.user_id)
        )
    )
  );

drop policy if exists "J envoie mes positions" on locations_realtime;
create policy "J envoie mes positions"
  on locations_realtime for insert to authenticated with check (auth.uid() = user_id);

-- 4b) TEMPS RÉEL : diffuser les nouvelles positions aux abonnés
--     (la RLS ci-dessus garantit que chacun ne reçoit que ce qu'il peut voir)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'locations_realtime'
  ) then
    alter publication supabase_realtime add table locations_realtime;
  end if;
end $$;

-- 5) CONNEXIONS SÛRES ENTRE VOYAGEURS -------------------------
create table if not exists matches_connections (
  id         bigint generated always as identity primary key,
  user_a     uuid references auth.users(id) on delete cascade,
  user_b     uuid references auth.users(id) on delete cascade,
  status     text default 'pending',
  created_at timestamptz default now()
);
alter table matches_connections enable row level security;

drop policy if exists "Je vois mes connexions" on matches_connections;
create policy "Je vois mes connexions"
  on matches_connections for select to authenticated
  using (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "Je cree une demande de connexion" on matches_connections;
create policy "Je cree une demande de connexion"
  on matches_connections for insert to authenticated
  with check (auth.uid() = user_a);

-- Le destinataire (user_b) peut accepter/refuser une demande reçue
drop policy if exists "Je reponds aux demandes recues" on matches_connections;
create policy "Je reponds aux demandes recues"
  on matches_connections for update to authenticated
  using (auth.uid() = user_b) with check (auth.uid() = user_b);

-- 5b) MESSAGES (chat entre Mates connectés) -------------------
create table if not exists messages (
  id           bigint generated always as identity primary key,
  sender_id    uuid references auth.users(id) on delete cascade,
  recipient_id uuid references auth.users(id) on delete cascade,
  content      text not null,
  created_at   timestamptz default now()
);
alter table messages enable row level security;

-- Je vois les messages que j'ai envoyés OU reçus
drop policy if exists "Je vois mes messages" on messages;
create policy "Je vois mes messages"
  on messages for select to authenticated
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

-- Je n'envoie qu'en mon nom ET seulement à une connexion ACCEPTÉE (mon cercle)
drop policy if exists "J envoie a mes connexions" on messages;
create policy "J envoie a mes connexions"
  on messages for insert to authenticated
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from matches_connections m
      where m.status = 'accepted'
        and (
          (m.user_a = auth.uid() and m.user_b = recipient_id)
          or (m.user_b = auth.uid() and m.user_a = recipient_id)
        )
    )
  );

-- Temps réel pour le chat
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table messages;
  end if;
end $$;

-- 6) DONNÉES DE DÉMO : quelques lieux sûrs --------------------
insert into partner_cafes (name, category, city, is_eco, safety_note)
select * from (values
  ('Le Comptoir Solaire', 'Café éco-responsable', 'Lisbonne', true,  'Personnel formé, espace lumineux et fréquenté'),
  ('Sunrise Co-Living',   'Co-living',            'Barcelone', true, 'Accès sécurisé, communauté vérifiée'),
  ('Green Bean Hub',      'Café partenaire',      'Berlin',    true, 'Zone centrale, ouverte tard, très passante')
) as v(name, category, city, is_eco, safety_note)
where not exists (select 1 from partner_cafes);
