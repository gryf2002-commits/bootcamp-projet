-- ============================================================
-- SunMates — Session 28 : PREUVE de défi (anti-triche renforcé)
-- ============================================================
-- Le client veut « poster quelque chose qui confirme la quête ».
-- On exige désormais une PHOTO PREUVE pour valider un défi solo : l'XP n'est
-- crédité qu'après upload d'une photo (stockée = responsabilisation / preuve).
--
-- Rejouable. À exécuter dans le SQL Editor de Supabase. (Nécessite session27.)
-- ============================================================

-- 1) Colonne preuve sur le journal solo
alter table user_solo_log add column if not exists proof_url text;

-- 2) Bucket de stockage des preuves (lecture publique, écriture authentifiée)
insert into storage.buckets (id, name, public)
  values ('proofs', 'proofs', true)
  on conflict (id) do nothing;

drop policy if exists "Preuves : upload authentifie" on storage.objects;
create policy "Preuves : upload authentifie" on storage.objects
  for insert to authenticated with check (bucket_id = 'proofs');

drop policy if exists "Preuves : lecture publique" on storage.objects;
create policy "Preuves : lecture publique" on storage.objects
  for select using (bucket_id = 'proofs');

-- 3) grant_solo_xp accepte et enregistre l'URL de preuve
create or replace function grant_solo_xp(p_key text, p_proof_url text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  t solo_tasks%rowtype;
  v_today int;
  v_cap int := 3;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'message', 'Non connecté.'); end if;
  select * into t from solo_tasks where key = p_key;
  if not found then return jsonb_build_object('ok', false, 'message', 'Tâche inconnue.'); end if;
  -- Les DÉFIS exigent une preuve ; les rituels (micro-habitudes) non.
  if t.kind = 'challenge' and (p_proof_url is null or length(trim(p_proof_url)) = 0) then
    return jsonb_build_object('ok', false, 'message', 'Ajoute une photo preuve pour valider ✨');
  end if;
  if exists (select 1 from user_solo_log where user_id = v_uid and task_key = p_key and day = now()::date) then
    return jsonb_build_object('ok', false, 'message', 'Déjà accompli aujourd''hui ✅');
  end if;
  select count(*) into v_today from user_solo_log where user_id = v_uid and kind = t.kind and day = now()::date;
  if v_today >= v_cap then
    return jsonb_build_object('ok', false, 'message',
      (case when t.kind = 'ritual' then 'Tes 3 rituels du jour sont faits 🌙' else 'Limite : 3 défis solo par jour 🌙' end));
  end if;
  insert into user_solo_log (user_id, task_key, kind, xp, proof_url) values (v_uid, p_key, t.kind, t.xp, p_proof_url);
  perform set_config('sunmates.xp_ok', '1', true);
  update profiles set xp = coalesce(xp, 0) + t.xp where id = v_uid;
  return jsonb_build_object('ok', true, 'xp', t.xp, 'kind', t.kind, 'message', '+' || t.xp || ' XP');
end; $$;
grant execute on function grant_solo_xp(text, text) to authenticated;

-- ============================================================
-- Désormais un défi solo ne rapporte de l'XP qu'avec une photo preuve.
-- ============================================================
