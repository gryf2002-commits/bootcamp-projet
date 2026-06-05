-- ============================================================
-- SunMates — Session 20 : QUÊTES DE GROUPE (confirmées par un Mate) + BONUS XP
-- Une quête de groupe se valide à deux : l'un la lance avec un Mate, le Mate
-- confirme, et les DEUX reçoivent l'XP + un bonus. La confirmation par un humain
-- = anti-triche social (pas de farm en solo).
-- À lancer dans le SQL Editor de Supabase. Rejouable (idempotent).
-- ============================================================

-- 1) Marqueur de quête de groupe
alter table quests add column if not exists is_group boolean default false;
-- Les "jeux" + quelques quêtes explicitement collectives passent en groupe.
update quests set is_group = true
where kind = 'game'
   or key in ('quest_pano','quest_thrill','quest_firstride','quest_coffee');

-- 2) Table des sessions de groupe (demande -> confirmation)
create table if not exists quest_group_runs (
  id           bigint generated always as identity primary key,
  quest_key    text references quests(key) on delete cascade,
  initiator    uuid references auth.users(id) on delete cascade,
  partner      uuid references auth.users(id) on delete cascade,
  status       text default 'pending',   -- pending | confirmed
  created_at   timestamptz default now(),
  confirmed_at timestamptz
);
alter table quest_group_runs enable row level security;
drop policy if exists "Je vois mes sessions de groupe" on quest_group_runs;
create policy "Je vois mes sessions de groupe" on quest_group_runs for select to authenticated
  using (auth.uid() = initiator or auth.uid() = partner);

-- 3) Lancer une quête de groupe avec un Mate (crée une demande à confirmer)
create or replace function request_group_quest(p_quest_key text, p_partner uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  q quests%rowtype;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'message', 'Non connecté.'); end if;
  if p_partner is null or p_partner = v_uid then return jsonb_build_object('ok', false, 'message', 'Choisis un Mate valide.'); end if;
  select * into q from quests where key = p_quest_key;
  if not found then return jsonb_build_object('ok', false, 'message', 'Quête inconnue.'); end if;
  if not coalesce(q.is_group, false) then return jsonb_build_object('ok', false, 'message', 'Cette quête se valide en solo.'); end if;
  -- Doivent être connectés (connexion acceptée)
  if not exists (
    select 1 from matches_connections c
    where c.status = 'accepted'
      and ((c.user_a = v_uid and c.user_b = p_partner) or (c.user_a = p_partner and c.user_b = v_uid))
  ) then
    return jsonb_build_object('ok', false, 'message', 'Tu dois être connecté à ce Mate.');
  end if;
  -- Pas déjà accomplie par l'initiateur
  if exists (select 1 from user_quests where user_id = v_uid and quest_key = p_quest_key and status = 'completed') then
    return jsonb_build_object('ok', false, 'message', 'Tu as déjà accompli cette quête.');
  end if;
  -- Pas de demande déjà en attente pour ce duo + cette quête
  if exists (select 1 from quest_group_runs where quest_key = p_quest_key and status = 'pending'
             and ((initiator = v_uid and partner = p_partner) or (initiator = p_partner and partner = v_uid))) then
    return jsonb_build_object('ok', true, 'message', 'Demande déjà envoyée — en attente de confirmation.');
  end if;
  insert into quest_group_runs (quest_key, initiator, partner) values (p_quest_key, v_uid, p_partner);
  return jsonb_build_object('ok', true, 'message', 'Demande envoyée ! Ton Mate doit confirmer pour valider la quête à deux.');
end; $$;
grant execute on function request_group_quest(text, uuid) to authenticated;

-- 4) Confirmer une quête de groupe : valide la quête pour les DEUX + XP + bonus.
create or replace function confirm_group_quest(p_run_id bigint)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  r quest_group_runs%rowtype;
  q quests%rowtype;
  v_bonus int;
  v_total int;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'message', 'Non connecté.'); end if;
  select * into r from quest_group_runs where id = p_run_id;
  if not found then return jsonb_build_object('ok', false, 'message', 'Demande introuvable.'); end if;
  if r.partner <> v_uid then return jsonb_build_object('ok', false, 'message', 'Seul le Mate invité peut confirmer.'); end if;
  if r.status = 'confirmed' then return jsonb_build_object('ok', false, 'message', 'Déjà confirmée.'); end if;
  select * into q from quests where key = r.quest_key;
  if not found then return jsonb_build_object('ok', false, 'message', 'Quête inconnue.'); end if;

  v_bonus := ceil(coalesce(q.points,0) * 0.5);   -- +50% de bonus de groupe
  v_total := coalesce(q.points,0) + v_bonus;

  update quest_group_runs set status = 'confirmed', confirmed_at = now() where id = r.id;

  -- Valide pour les deux participants
  perform _grant_quest(r.initiator, q, v_total);
  perform _grant_quest(r.partner,   q, v_total);

  return jsonb_build_object('ok', true, 'xp', v_total, 'bonus', v_bonus,
    'message', 'Quête de groupe validée 🎉 +' || v_total || ' XP (dont +' || v_bonus || ' bonus) pour vous deux !');
end; $$;
grant execute on function confirm_group_quest(bigint) to authenticated;

-- Helper interne : attribue quête + badge + coupon + XP à un utilisateur donné.
create or replace function _grant_quest(p_uid uuid, q quests, p_xp int)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into user_quests (user_id, quest_key, status, completed_at)
  values (p_uid, q.key, 'completed', now())
  on conflict (user_id, quest_key) do update set status = 'completed', completed_at = now();
  if q.badge_key is not null then
    insert into user_badges (user_id, badge_key, name, emoji)
    values (p_uid, q.badge_key, q.badge_name, q.badge_emoji) on conflict (user_id, badge_key) do nothing;
  end if;
  if q.coupon_title is not null then
    insert into user_coupons (user_id, quest_key, title, descr) values (p_uid, q.key, q.coupon_title, q.coupon_desc);
  end if;
  update profiles set xp = coalesce(xp,0) + coalesce(p_xp,0) where id = p_uid;
end; $$;

-- Fin session 20.
