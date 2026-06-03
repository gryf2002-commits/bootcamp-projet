-- ============================================================
--  SunMates — SESSION 9 : compte ADMINISTRATEUR + modération
--  À coller dans Supabase : SQL Editor > New query > Run. Idempotent.
-- ============================================================

-- 1) Drapeau administrateur sur le profil
alter table profiles add column if not exists is_admin boolean default false;

-- 2) Suivi de traitement des signalements
alter table reports add column if not exists handled boolean default false;

-- 3) Un admin peut LIRE tous les signalements (en plus des siens)
drop policy if exists "Admin lit les signalements" on reports;
create policy "Admin lit les signalements" on reports for select to authenticated
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true));

-- 4) Un admin peut marquer un signalement comme traité
drop policy if exists "Admin gere les signalements" on reports;
create policy "Admin gere les signalements" on reports for update to authenticated
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.is_admin = true))
  with check (true);

-- ============================================================
-- 5) DEVENIR ADMIN (compte gryf2002@gmail.com)
-- ============================================================
update profiles set is_admin = true
  where id = (select id from auth.users where email = 'gryf2002@gmail.com');

-- ✅ Terminé. Recharge l'app : l'onglet « Admin 🛡️ » apparaît dans ton profil.
