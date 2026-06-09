# Brief — Feature « Mon voyage » (matching temps + lieu)

> À coller dans Claude Code. Agents : `sunmates-backend` (SQL/matching), `sunmates-design` (UI), `sunmates-qa`.
> Contraintes : 1 `index.html`, Supabase, DA sunset, RLS systématique, SQL idempotent,
> snake_case (SQL) / camelCase (JS), ne pas casser l'existant, compte rendu final.

## But
Permettre à chacun de déclarer ses **voyages à venir** (ville + dates), et découvrir
**qui sera au même endroit en même temps** — la dimension temporelle qui manque au
matching actuel. C'est la feature signature.

## 1) Migration SQL (à livrer dans `supabase_migration_trips.sql`, idempotent)
```sql
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

-- Lecture : tous les voyages des membres connectés (nécessaire au matching ;
-- aucune donnée sensible — juste ville + dates publiques).
drop policy if exists "Voyages visibles par les membres" on trips;
create policy "Voyages visibles par les membres"
  on trips for select to authenticated using (true);
drop policy if exists "Je gere mes voyages (insert)" on trips;
create policy "Je gere mes voyages (insert)"
  on trips for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Je gere mes voyages (update)" on trips;
create policy "Je gere mes voyages (update)"
  on trips for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Je gere mes voyages (delete)" on trips;
create policy "Je gere mes voyages (delete)"
  on trips for delete to authenticated using (auth.uid() = user_id);

-- RPC : voyageurs dont un voyage CHEVAUCHE l'un des miens (même ville, dates qui se croisent)
create or replace function overlapping_travelers()
returns table (
  trip_id bigint, user_id uuid, city text, country text,
  start_date date, end_date date
) language sql security definer set search_path = public as $$
  select t.id, t.user_id, t.city, t.country, t.start_date, t.end_date
  from trips t
  join trips me on me.user_id = auth.uid()
  where t.user_id <> auth.uid()
    and lower(trim(t.city)) = lower(trim(me.city))   -- même ville (v1 : exact ; v2 : rayon géo)
    and t.start_date <= me.end_date
    and t.end_date   >= me.start_date                -- chevauchement de dates
    and t.end_date   >= current_date                 -- pas de voyages passés
  order by t.start_date;
$$;
grant execute on function overlapping_travelers() to authenticated;
```
> v2 possible (plus tard) : matcher par **rayon géographique** (lat/lng + earthdistance)
> plutôt que par nom de ville exact, pour gérer « Lisbonne » vs « Lisbon ».

## 2) Front — accès données (à regrouper proprement)
```js
async function loadMyTrips() {                       // mes voyages
  return (await db.from("trips").select("*").eq("user_id", myUserId)
    .order("start_date")).data || [];
}
async function addTrip(t) {                          // créer
  return db.from("trips").insert({ user_id: myUserId, ...t });
}
async function deleteTrip(id) { return db.from("trips").delete().eq("id", id); }
async function loadTripMatches() {                   // qui sera là quand moi
  const { data } = await db.rpc("overlapping_travelers");
  // enrichir avec profils (avatar, username) déjà chargés dans travelerMap,
  // calculer la compatibilité existante compatibility(myMatchProfile, profil)
  return data || [];
}
```

## 3) UI (réutiliser les composants existants — DA sunset)
- **Point d'entrée** : un onglet/section **« Voyages ✈️ »** (soit nouvelle entrée nav,
  soit section en haut de l'Accueil sous la carte). Suivre l'ergonomie actuelle (cartes + chips).
- **Mes voyages** : liste de cartes (style `.card`) avec ville + **pilule de dates**
  (« 12–18 juin ») + bouton supprimer. Bouton « ➕ Ajouter un voyage » → petite feuille
  (bottom sheet existant) : champ ville (autocomplete via la recherche lieux/Leaflet),
  date début/fin, note. À l'enregistrement : toast succès + confettis légers.
- **« Qui sera là quand toi »** : sous chaque voyage (ou section dédiée), liste de
  voyageurs avec **avatar + nom + compat ❤️ + pastille dates communes** (réutiliser
  `.person` + `.compat` + `.afn`). Tap → fiche profil existante. Bouton « Connexion ».
- **Accroche Accueil** : si des matches existent, bandeau « ✨ 3 voyageurs seront à
  Lisbonne en même temps que toi » → ouvre la section.
- **État vide** chaleureux : « Ajoute ton prochain voyage et trouve ta bande sur place ☀️ ».

## 4) Bonus cohérents (si le temps)
- **Notification** quand un nouveau Mate planifie un voyage qui croise le tien (relié au
  futur module push).
- **Confidentialité** : option « voyage privé » (visible seulement de mon cercle) →
  colonne `is_private boolean default false` + condition dans la policy/RPC.

## 5) QA attendue (2 comptes)
- A crée « Lisbonne 12–18 juin », B crée « Lisbonne 15–20 juin » → chacun voit l'autre dans
  « qui sera là ». Dates qui ne se croisent pas → pas de match. Ville différente → pas de match.
  Voyage passé → masqué. Impossible de modifier/supprimer le voyage d'un autre (RLS).
