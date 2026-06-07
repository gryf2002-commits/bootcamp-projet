-- ============================================================
-- SunMates — Session 29 : anti-triche LÉGER (sans spam de photos / stockage)
-- ============================================================
-- Maxime : « anti-triche qui n'impacte pas trop Supabase, pas de spam de photos,
-- attention aux dérives ». On RETIRE l'exigence de photo (drift stockage) de la s28.
-- L'anti-triche repose désormais sur du LÉGER, 100% côté base :
--   • XP inviolable (trigger s27)  • cap 3/jour par type  • 1 fois/jour par tâche
--   • cooldown 45s entre deux validations  • note libre courte facultative (≤200 car.)
-- Le bucket "proofs" de la s28 n'est PLUS utilisé (aucun upload) → tu peux l'ignorer/supprimer.
--
-- Rejouable. À exécuter dans le SQL Editor de Supabase. (Remplace grant_solo_xp.)
-- ============================================================

create or replace function grant_solo_xp(p_key text, p_proof_url text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  t solo_tasks%rowtype;
  v_today int;
  v_last timestamptz;
  v_cap int := 3;
  v_note text := nullif(left(trim(coalesce(p_proof_url, '')), 200), '');  -- note courte, jamais une photo
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'message', 'Non connecté.'); end if;
  select * into t from solo_tasks where key = p_key;
  if not found then return jsonb_build_object('ok', false, 'message', 'Tâche inconnue.'); end if;
  if exists (select 1 from user_solo_log where user_id = v_uid and task_key = p_key and day = now()::date) then
    return jsonb_build_object('ok', false, 'message', 'Déjà accompli aujourd''hui ✅');
  end if;
  -- Cooldown anti-farm : 45 s entre deux validations solo
  select max(created_at) into v_last from user_solo_log where user_id = v_uid;
  if v_last is not null and v_last > now() - interval '45 seconds' then
    return jsonb_build_object('ok', false, 'message', 'Doucement 😊 attends un peu entre deux défis.');
  end if;
  -- Cap quotidien par type (3 défis + 3 rituels)
  select count(*) into v_today from user_solo_log where user_id = v_uid and kind = t.kind and day = now()::date;
  if v_today >= v_cap then
    return jsonb_build_object('ok', false, 'message',
      (case when t.kind = 'ritual' then 'Tes 3 rituels du jour sont faits 🌙' else 'Limite : 3 défis solo par jour 🌙' end));
  end if;
  insert into user_solo_log (user_id, task_key, kind, xp, proof_url) values (v_uid, p_key, t.kind, t.xp, v_note);
  perform set_config('sunmates.xp_ok', '1', true);
  update profiles set xp = coalesce(xp, 0) + t.xp where id = v_uid;
  return jsonb_build_object('ok', true, 'xp', t.xp, 'kind', t.kind, 'message', '+' || t.xp || ' XP');
end; $$;
grant execute on function grant_solo_xp(text, text) to authenticated;

-- (Optionnel) supprimer le bucket de preuves devenu inutile pour éviter toute dérive de stockage :
-- delete from storage.objects where bucket_id = 'proofs';
-- delete from storage.buckets where id = 'proofs';
-- ============================================================
