-- ============================================================
--  SunMates — SESSION TECHNIQUE 2
--  Quêtes/jeux fonctionnels, badges & coupons réels, défis entre
--  Mates, check-ins par CODE (anti-triche), profil ultra-complet,
--  filtrage des profils démo.
--
--  À coller dans Supabase : menu de gauche > SQL Editor > New query > Run
--  Rejouable sans risque (idempotent). Ne supprime aucune donnée.
-- ============================================================

-- ============================================================
-- 1) PROFIL ULTRA-COMPLET (style Hinge / Bumble / Tinder)
--    Tous les champs sont publics (affichage + matching), sauf le
--    téléphone qui reste dans profiles_private.
-- ============================================================
alter table profiles add column if not exists is_demo        boolean default false;
alter table profiles add column if not exists allow_contact  text default 'everyone'; -- everyone | connections
-- Identité
alter table profiles add column if not exists birthdate      date;
alter table profiles add column if not exists gender         text;
alter table profiles add column if not exists pronouns       text;
alter table profiles add column if not exists orientation    text;
alter table profiles add column if not exists intent         text[] default '{}';  -- Amitié, Réseau, Rencontre, Compagnons de voyage
alter table profiles add column if not exists relationship_status text;
alter table profiles add column if not exists height_cm      int;
-- Travail & études
alter table profiles add column if not exists job_title      text;
alter table profiles add column if not exists company        text;
alter table profiles add column if not exists school         text;
alter table profiles add column if not exists education_level text;
alter table profiles add column if not exists hometown       text;
-- Style de vie
alter table profiles add column if not exists zodiac         text;
alter table profiles add column if not exists drinking       text;
alter table profiles add column if not exists smoking        text;
alter table profiles add column if not exists cannabis       text;
alter table profiles add column if not exists diet           text;
alter table profiles add column if not exists religion       text;
alter table profiles add column if not exists politics       text;
alter table profiles add column if not exists children       text;
alter table profiles add column if not exists pets           text[] default '{}';
alter table profiles add column if not exists fitness        text;
alter table profiles add column if not exists sleep_schedule text;
alter table profiles add column if not exists personality    text;
alter table profiles add column if not exists music          text[] default '{}';
alter table profiles add column if not exists favorite_places text[] default '{}';
alter table profiles add column if not exists bucket_list    text;
alter table profiles add column if not exists instagram      text;
-- 3 "prompts" (question choisie + réponse), comme sur Hinge
alter table profiles add column if not exists prompt1_q text;
alter table profiles add column if not exists prompt1_a text;
alter table profiles add column if not exists prompt2_q text;
alter table profiles add column if not exists prompt2_a text;
alter table profiles add column if not exists prompt3_q text;
alter table profiles add column if not exists prompt3_a text;

-- Marque les comptes de démonstration (ils restent visibles dans la
-- découverte ; les vrais utilisateurs ne seront trouvables que par pseudo).
update profiles p set is_demo = true
from auth.users u
where p.id = u.id and u.email like '%@demo.sunmates' and coalesce(p.is_demo,false) = false;

-- ============================================================
-- 2) CODES DES LIEUX (cachés) + plus de lieux sûrs
--    La table cafe_codes n'a AUCUNE police de lecture : le navigateur
--    ne peut donc PAS lire les codes. Seules les fonctions RPC
--    (security definer) ci-dessous y accèdent.
-- ============================================================
create table if not exists cafe_codes (
  cafe_id bigint primary key references partner_cafes(id) on delete cascade,
  code    text not null
);
alter table cafe_codes enable row level security;
-- (volontairement : aucune policy select/insert/update pour le public)

-- Lieux supplémentaires (ne crée que s'ils n'existent pas déjà, par nom)
insert into partner_cafes (name, category, city, is_eco, safety_note)
select v.name, v.category, v.city, v.is_eco, v.safety_note from (values
  ('Casa do Sol',        'Café partenaire',  'Lisbonne',  true,  'Terrasse ensoleillée, personnel formé à l''accueil'),
  ('Maritimo Co-Living', 'Co-living',        'Porto',     true,  'Communauté vérifiée, accès sécurisé 24/7'),
  ('Atelier Lumière',    'Café éco-responsable','Paris',  true,  'Quartier vivant, ouvert tard, très passant'),
  ('Surf & Co',          'Café partenaire',  'Biarritz',  true,  'Spot prisé des voyageurs, ambiance conviviale'),
  ('Mirador Verde',      'Co-living',        'Barcelone', true,  'Rooftop sécurisé, vue mer, staff multilingue')
) as v(name, category, city, is_eco, safety_note)
where not exists (select 1 from partner_cafes pc where pc.name = v.name);

-- Attribue un code à CHAQUE lieu (codes de démo simples). Idempotent.
insert into cafe_codes (cafe_id, code)
select pc.id, c.code from partner_cafes pc
join (values
  ('Le Comptoir Solaire','SOLEIL'),
  ('Sunrise Co-Living','SUNRISE'),
  ('Green Bean Hub','GREEN'),
  ('Casa do Sol','CASA'),
  ('Maritimo Co-Living','MARITIMO'),
  ('Atelier Lumière','LUMIERE'),
  ('Surf & Co','SURF'),
  ('Mirador Verde','MIRADOR')
) as c(name, code) on c.name = pc.name
on conflict (cafe_id) do update set code = excluded.code;

-- ============================================================
-- 3) QUÊTES & JEUX (définitions) — table unique "quests"
--    kind = 'game' (jeux populaires) ou 'quest' (quêtes du jour).
--    requires_code = true => validation par code du lieu (cafe_id).
-- ============================================================
create table if not exists quests (
  key          text primary key,
  kind         text not null default 'quest',  -- 'game' | 'quest'
  title        text not null,
  emoji        text,
  city         text,
  description  text,
  participants text,
  rating       text,
  requires_code boolean default false,
  cafe_id      bigint references partner_cafes(id) on delete set null,
  badge_key    text,
  badge_name   text,
  badge_emoji  text,
  coupon_title text,
  coupon_desc  text,
  points       int default 15,
  sort_order   int default 0
);
alter table quests enable row level security;
drop policy if exists "Quetes visibles par les membres" on quests;
create policy "Quetes visibles par les membres"
  on quests for select to authenticated using (true);

-- Seed des définitions (rejouable : met à jour si la clé existe).
-- NB : cafe_id est résolu par nom de lieu au moment de l'insertion.
insert into quests (key, kind, title, emoji, city, description, participants, rating, requires_code, cafe_id, badge_key, badge_name, badge_emoji, coupon_title, coupon_desc, points, sort_order) values
  ('game_treasure','game','Chasse au Trésor Urbaine','🗺️','Lisbonne, Portugal','Réalise cette chasse au trésor avec tes Mates ! Trouvez ensemble les quatre checkpoints cachés dans la ville. Chaque étape validée débloque un badge et des avantages chez nos partenaires.','428','9.5', false, null, 'badge_explorer','Explorateur Urbain','🏙️','Cocktail Bar','-20% sur ton premier verre', 25, 1),
  ('game_quiz','game','Quiz de Culture Locale','🧠','Barcelone, Espagne','Teste tes connaissances sur l''histoire et les traditions locales. Réponds en équipe avec tes Mates pour le meilleur score.','1 240','9.2', false, null, 'badge_culture','As de la Culture','🧠','Musée Picasso','Entrée à -50%', 20, 2),
  ('game_photo','game','Safari Photo Urbain','📸','Berlin, Allemagne','Capture les plus beaux spots street-art. Poste tes clichés, fais voter la communauté et débloque le badge Photographe Urbain.','980','9.4', false, null, 'badge_photographer','Photographe Urbain','📷','Green Bean Hub','1 café offert', 20, 3),
  ('game_food','game','Défi Culinaire','🍝','Rome, Italie','Pars à la découverte des meilleures adresses locales avec tes Mates et relève des défis gourmands à chaque table.','756','9.6', false, null, 'badge_foodie','Foodie Tour','🍔','Trattoria Roma','Dessert offert', 20, 4),
  ('quest_pano','quest','Photo Panoramique','📷','Stockholm, Suède','Atteins les trois belvédères, prends une photo avec tes Mates et poste tes clichés. Débloque le badge Photographe.','2 428','9.5', false, null, 'badge_photographer','Photographe Urbain','📷','Fotografiska Museum','Entrée gratuite', 20, 5),
  ('quest_coffee','quest','Pause Café Secrète','☕','Lisbonne, Portugal','Trouve le café partenaire caché, fais-y un check-in avec un Mate et savoure une pause. Validation par le CODE du lieu.','1 102','9.3', true, null, 'badge_coffee','Connaisseur Café','☕','Le Comptoir Solaire','Boisson offerte', 15, 6),
  ('quest_artisan','quest','Rencontre d''Artisan','🧑‍🎨','Barcelone, Espagne','Va à la rencontre d''un artisan local recommandé par la communauté et soutiens l''économie locale.','640','9.1', false, null, 'badge_local','Ami des Locaux','🤝','Boutique Locale','-15% de réduction', 15, 7),
  ('quest_cocktail','quest','Cocktail Bar (signature)','🍸','Berlin, Allemagne','Goûte le cocktail signature d''un bar partenaire en bonne compagnie. Une sortie conviviale et sécurisée.','880','9.0', false, null, 'badge_night','Night Rider','🌙','Cocktail Bar','-20% sur ton premier verre', 15, 8),
  ('quest_thrill','quest','Sensations Fortes','🪂','Interlaken, Suisse','Relève un défi à sensations avec tes Mates : tyrolienne, parapente ou via ferrata. Mieux à plusieurs !','412','9.7', false, null, 'badge_adventure','Tête Brûlée','🪂','Adventure Park','Activité à -10%', 25, 9),
  ('quest_firstride','quest','Valider ton premier trajet','🧭','Partout','Effectue ton tout premier trajet vérifié avec un Mate de confiance et débloque ton badge de bienvenue.','5 600','9.8', false, null, 'badge_welcome','Premier Pas','🧭','Bolt','-10% sur ton prochain trajet', 10, 10)
on conflict (key) do update set
  kind=excluded.kind, title=excluded.title, emoji=excluded.emoji, city=excluded.city,
  description=excluded.description, participants=excluded.participants, rating=excluded.rating,
  requires_code=excluded.requires_code, badge_key=excluded.badge_key, badge_name=excluded.badge_name,
  badge_emoji=excluded.badge_emoji, coupon_title=excluded.coupon_title, coupon_desc=excluded.coupon_desc,
  points=excluded.points, sort_order=excluded.sort_order;

-- Lie la quête "Pause Café Secrète" au lieu "Le Comptoir Solaire" (pour le code)
update quests q set cafe_id = pc.id
from partner_cafes pc
where q.key = 'quest_coffee' and pc.name = 'Le Comptoir Solaire';

-- ============================================================
-- 4) PROGRESSION UTILISATEUR : quêtes rejointes, badges, coupons
-- ============================================================
create table if not exists user_quests (
  id          bigint generated always as identity primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  quest_key   text references quests(key) on delete cascade,
  status      text default 'joined',   -- joined | completed
  created_at  timestamptz default now(),
  completed_at timestamptz,
  unique (user_id, quest_key)
);
alter table user_quests enable row level security;
drop policy if exists "Je vois mes quetes" on user_quests;
create policy "Je vois mes quetes" on user_quests for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Je rejoins une quete" on user_quests;
create policy "Je rejoins une quete" on user_quests for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Je mets a jour mes quetes" on user_quests;
create policy "Je mets a jour mes quetes" on user_quests for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists user_badges (
  id        bigint generated always as identity primary key,
  user_id   uuid references auth.users(id) on delete cascade,
  badge_key text not null,
  name      text,
  emoji     text,
  earned_at timestamptz default now(),
  unique (user_id, badge_key)
);
alter table user_badges enable row level security;
-- Les badges sont des accomplissements publics (visibles sur les profils).
drop policy if exists "Badges visibles par les membres" on user_badges;
create policy "Badges visibles par les membres" on user_badges for select to authenticated using (true);
drop policy if exists "Je gagne mes badges" on user_badges;
create policy "Je gagne mes badges" on user_badges for insert to authenticated with check (auth.uid() = user_id);

create table if not exists user_coupons (
  id         bigint generated always as identity primary key,
  user_id    uuid references auth.users(id) on delete cascade,
  quest_key  text,
  title      text,
  descr      text,
  used       boolean default false,
  earned_at  timestamptz default now()
);
alter table user_coupons enable row level security;
drop policy if exists "Je vois mes coupons" on user_coupons;
create policy "Je vois mes coupons" on user_coupons for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Je gere mes coupons" on user_coupons;
create policy "Je gere mes coupons" on user_coupons for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- (l'insertion des coupons se fait uniquement via la fonction complete_quest)

-- ============================================================
-- 5) DÉFIS PROPOSÉS ENTRE MATES
-- ============================================================
create table if not exists quest_suggestions (
  id          bigint generated always as identity primary key,
  from_user   uuid references auth.users(id) on delete cascade,
  to_user     uuid references auth.users(id) on delete cascade,
  quest_key   text references quests(key) on delete cascade,
  quest_title text,
  status      text default 'pending',  -- pending | accepted | dismissed
  created_at  timestamptz default now()
);
alter table quest_suggestions enable row level security;
drop policy if exists "Je vois mes defis" on quest_suggestions;
create policy "Je vois mes defis" on quest_suggestions for select to authenticated
  using (auth.uid() = to_user or auth.uid() = from_user);
-- Je ne propose un défi qu'à une connexion ACCEPTÉE (mon cercle)
drop policy if exists "Je propose un defi a mon cercle" on quest_suggestions;
create policy "Je propose un defi a mon cercle" on quest_suggestions for insert to authenticated
  with check (
    auth.uid() = from_user and exists (
      select 1 from matches_connections m
      where m.status = 'accepted'
        and ((m.user_a = auth.uid() and m.user_b = to_user) or (m.user_b = auth.uid() and m.user_a = to_user))
    )
  );
drop policy if exists "Je reponds aux defis recus" on quest_suggestions;
create policy "Je reponds aux defis recus" on quest_suggestions for update to authenticated
  using (auth.uid() = to_user) with check (auth.uid() = to_user);

-- ============================================================
-- 6) SIGNALEMENTS (sécurité)
-- ============================================================
create table if not exists reports (
  id            bigint generated always as identity primary key,
  reporter      uuid references auth.users(id) on delete cascade,
  reported_user uuid references auth.users(id) on delete cascade,
  reason        text,
  created_at    timestamptz default now()
);
alter table reports enable row level security;
drop policy if exists "Je vois mes signalements" on reports;
create policy "Je vois mes signalements" on reports for select to authenticated using (auth.uid() = reporter);
drop policy if exists "Je signale" on reports;
create policy "Je signale" on reports for insert to authenticated with check (auth.uid() = reporter);

-- ============================================================
-- 7) FONCTIONS SÉCURISÉES (anti-triche)
--    "security definer" : la fonction s'exécute avec des droits
--    élevés et ignore la RLS — mais elle n'agit QUE pour auth.uid().
--    => le client ne peut pas falsifier son score ni lire les codes.
-- ============================================================

-- Check-in par code : valide le code du lieu, enregistre le check-in,
-- ajoute +10 points. Renvoie un JSON {ok, points, message}.
create or replace function redeem_checkin(p_cafe_id bigint, p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_real text;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'message', 'Non connecté.');
  end if;
  select code into v_real from cafe_codes where cafe_id = p_cafe_id;
  if v_real is null then
    return jsonb_build_object('ok', false, 'message', 'Ce lieu n''a pas de code configuré.');
  end if;
  if upper(trim(coalesce(p_code,''))) <> upper(trim(v_real)) then
    return jsonb_build_object('ok', false, 'message', 'Code incorrect. Demande-le sur place.');
  end if;
  insert into checkpoints (user_id, cafe_id) values (v_uid, p_cafe_id);
  update profiles set trust_score = coalesce(trust_score,0) + 10 where id = v_uid;
  return jsonb_build_object('ok', true, 'points', 10, 'message', 'Check-in validé ✅ (+10 points)');
end;
$$;
grant execute on function redeem_checkin(bigint, text) to authenticated;

-- Complète une quête : valide le code si requis, marque la quête comme
-- accomplie, attribue le badge + le coupon (si la quête en a un) + les points.
create or replace function complete_quest(p_quest_key text, p_code text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  q quests%rowtype;
  v_code text;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'message', 'Non connecté.');
  end if;
  select * into q from quests where key = p_quest_key;
  if not found then
    return jsonb_build_object('ok', false, 'message', 'Quête inconnue.');
  end if;
  -- Déjà accomplie ?
  if exists (select 1 from user_quests where user_id = v_uid and quest_key = p_quest_key and status = 'completed') then
    return jsonb_build_object('ok', false, 'message', 'Quête déjà accomplie.');
  end if;
  -- Validation par code si la quête est liée à un lieu
  if q.requires_code then
    if q.cafe_id is null then
      return jsonb_build_object('ok', false, 'message', 'Quête mal configurée (pas de lieu).');
    end if;
    select code into v_code from cafe_codes where cafe_id = q.cafe_id;
    if v_code is null or upper(trim(coalesce(p_code,''))) <> upper(trim(v_code)) then
      return jsonb_build_object('ok', false, 'message', 'Code incorrect. Demande-le sur place.');
    end if;
  end if;
  -- Marque la quête accomplie
  insert into user_quests (user_id, quest_key, status, completed_at)
  values (v_uid, p_quest_key, 'completed', now())
  on conflict (user_id, quest_key) do update set status = 'completed', completed_at = now();
  -- Badge
  if q.badge_key is not null then
    insert into user_badges (user_id, badge_key, name, emoji)
    values (v_uid, q.badge_key, q.badge_name, q.badge_emoji)
    on conflict (user_id, badge_key) do nothing;
  end if;
  -- Coupon (si la quête en accorde un)
  if q.coupon_title is not null then
    insert into user_coupons (user_id, quest_key, title, descr)
    values (v_uid, p_quest_key, q.coupon_title, q.coupon_desc);
  end if;
  -- Points
  update profiles set trust_score = coalesce(trust_score,0) + coalesce(q.points,0) where id = v_uid;
  return jsonb_build_object('ok', true, 'points', q.points,
    'badge', q.badge_name, 'coupon', q.coupon_title,
    'message', 'Quête accomplie ✅ +' || coalesce(q.points,0) || ' points');
end;
$$;
grant execute on function complete_quest(text, text) to authenticated;

-- ============================================================
-- 8) TEMPS RÉEL pour les défis reçus
-- ============================================================
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'quest_suggestions'
  ) then
    alter publication supabase_realtime add table quest_suggestions;
  end if;
end $$;

-- ✅ Terminé. Lance ensuite (ou relance) supabase_seed_demo_profiles.sql
--    pour enrichir les 10 profils de démo avec les nouveaux champs.
