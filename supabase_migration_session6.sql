-- ============================================================
--  SunMates — SESSION 6 : compteur de "Mates" (abonnés) + démo
--  À coller dans Supabase : SQL Editor > New query > Run. Idempotent.
-- ============================================================

-- 1) Nombre de Mates (connexions acceptées) d'un utilisateur.
--    security definer : permet de compter les Mates de N'IMPORTE QUI
--    (la RLS de matches_connections ne montre normalement que les siennes).
create or replace function mates_count(p_uid uuid)
returns int
language sql
security definer
set search_path = public
as $$
  select count(*)::int from matches_connections
  where status = 'accepted' and (user_a = p_uid or user_b = p_uid);
$$;
grant execute on function mates_count(uuid) to authenticated;

-- 2) Connexions de démonstration entre profils démo (pour des compteurs réalistes)
do $$
declare r record; ida uuid; idb uuid;
begin
  for r in select * from (values
    ('lina@demo.sunmates','amelie@demo.sunmates'),
    ('lina@demo.sunmates','sofia@demo.sunmates'),
    ('lina@demo.sunmates','yuki@demo.sunmates'),
    ('marco@demo.sunmates','sofia@demo.sunmates'),
    ('marco@demo.sunmates','diego@demo.sunmates'),
    ('sofia@demo.sunmates','chloe@demo.sunmates'),
    ('tom@demo.sunmates','amelie@demo.sunmates'),
    ('nadia@demo.sunmates','diego@demo.sunmates'),
    ('chloe@demo.sunmates','yuki@demo.sunmates'),
    ('amelie@demo.sunmates','sofia@demo.sunmates'),
    ('diego@demo.sunmates','liam@demo.sunmates'),
    ('nadia@demo.sunmates','lina@demo.sunmates'),
    ('yuki@demo.sunmates','marco@demo.sunmates'),
    ('chloe@demo.sunmates','lina@demo.sunmates')
  ) as v(ea, eb) loop
    select id into ida from auth.users where email = r.ea;
    select id into idb from auth.users where email = r.eb;
    if ida is not null and idb is not null and not exists (
      select 1 from matches_connections m
      where (m.user_a = ida and m.user_b = idb) or (m.user_a = idb and m.user_b = ida)
    ) then
      insert into matches_connections (user_a, user_b, status) values (ida, idb, 'accepted');
    end if;
  end loop;
end $$;

-- ✅ Terminé.
