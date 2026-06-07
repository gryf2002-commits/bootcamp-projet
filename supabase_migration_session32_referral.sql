-- ============================================================
-- SunMates — Session 32 : PARRAINAGE récompensé (referral)
-- ============================================================
-- Quand un nouveau membre arrive via un lien d'invitation (?ref=<id du parrain>),
-- l'app appelle claim_referral() : on enregistre le parrainage et on offre un
-- coupon « 1er verre offert » AU FILLEUL **et** AU PARRAIN (viralité + valeur réelle).
-- 1 seul parrainage par filleul (contrainte unique). Rejouable.
-- À exécuter dans le SQL Editor de Supabase.
-- ============================================================

create table if not exists referrals (
  id          bigint generated always as identity primary key,
  referrer_id uuid references auth.users(id) on delete cascade,
  referred_id uuid references auth.users(id) on delete cascade unique,  -- un filleul = un seul parrain
  created_at  timestamptz default now(),
  rewarded    boolean default false
);
alter table referrals enable row level security;
-- Pas d'accès direct : tout passe par claim_referral (SECURITY DEFINER).
drop policy if exists "referrals owner read" on referrals;
create policy "referrals owner read" on referrals for select to authenticated
  using (auth.uid() = referrer_id or auth.uid() = referred_id);

create or replace function claim_referral(p_referrer uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'message', 'Non connecté'); end if;
  if p_referrer is null or p_referrer = v_uid then return jsonb_build_object('ok', false); end if;
  if not exists (select 1 from profiles where id = p_referrer) then return jsonb_build_object('ok', false, 'message', 'Parrain inconnu'); end if;
  if exists (select 1 from referrals where referred_id = v_uid) then return jsonb_build_object('ok', false, 'message', 'Déjà parrainé'); end if;
  insert into referrals (referrer_id, referred_id, rewarded) values (p_referrer, v_uid, true);
  -- Coupon pour le FILLEUL (le nouveau)
  insert into user_coupons (user_id, quest_key, title, descr)
    values (v_uid, 'referral_welcome', '🍹 Premier verre offert',
            'Bienvenue sur SunMates ! Ton 1er verre est offert chez un lieu partenaire — à déguster avec un Mate 🌍');
  -- Coupon pour le PARRAIN (celui qui a fait venir)
  insert into user_coupons (user_id, quest_key, title, descr)
    values (p_referrer, 'referral_reward', '🍹 Verre offert (parrainage)',
            'Un Mate t''a rejoint sur SunMates grâce à toi. Merci ! Un verre offert pour fêter ça ✨');
  return jsonb_build_object('ok', true, 'message', 'Bienvenue ! Ton premier verre est offert 🍹');
end; $$;
grant execute on function claim_referral(uuid) to authenticated;

-- (Optionnel) petite stat parrainage pour le tableau de bord admin, si tu veux l'afficher plus tard :
-- select count(*) from referrals;
-- ============================================================
-- Fin. Côté app : le lien d'invitation porte déjà ?ref=<id>. À l'arrivée d'un
-- nouveau membre, claim_referral() crédite les deux comptes d'un coupon « 1er verre ».
-- ============================================================
