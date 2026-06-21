-- =============================================================================
-- SunMates — session 42 : « Veilleur de nuit » (dead-man's switch FIABLE app fermée)
-- -----------------------------------------------------------------------------
-- Le minuteur « Rentrée en sécurité » existant est 100% LOCAL (localStorage) : si
-- l'app est tuée, l'alerte ne part JAMAIS. Ici on persiste la veille en base et un
-- CRON serveur déclenche l'alerte même si l'app de la personne est fermée.
--
-- Au déclenchement (veille active dont l'échéance est passée, sans « je vais bien ») :
--   1) on pose une POSITION D'URGENCE (locations_realtime) → visible sur la carte du
--      cercle via la RLS existante ;
--   2) on insère un MESSAGE à chaque membre du cercle → ce qui déclenche le webhook
--      `messages` DÉJÀ configuré → PUSH immédiat (zéro nouvelle infra à poser).
-- Position utilisée = la plus fraîche partagée (<24h), sinon celle de l'armement.
-- Décision Maxime (21/06) : feature « veilleur de nuit ».
-- =============================================================================

create table if not exists public.safety_watches (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  deadline     timestamptz not null,
  status       text not null default 'active' check (status in ('active','safe','triggered')),
  last_lat     double precision,
  last_lng     double precision,
  note         text check (char_length(coalesce(note,'')) <= 120),
  created_at   timestamptz default now(),
  triggered_at timestamptz
);
alter table public.safety_watches enable row level security;

-- Owner-only : chacun gère SA propre veille (le cercle n'a pas besoin de la lire ;
-- il est alerté via la position d'urgence + le message ci-dessous).
drop policy if exists "watch_owner_all" on public.safety_watches;
create policy "watch_owner_all" on public.safety_watches
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Fonction de déclenchement (SECURITY DEFINER → bypass RLS pour agir au nom de la veille).
create or replace function public.sm_run_safety_watches()
returns integer
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  w record; member uuid; plat double precision; plng double precision; maplink text; fired int := 0;
begin
  for w in select * from safety_watches where status = 'active' and deadline < now() loop
    -- position la PLUS FRAÎCHE partagée (<24h), sinon celle mémorisée à l'armement
    select lr.lat, lr.lng into plat, plng
      from locations_realtime lr
      where lr.user_id = w.user_id and lr.created_at > now() - interval '24 hours'
      order by lr.created_at desc limit 1;
    if plat is null then plat := w.last_lat; plng := w.last_lng; end if;

    update safety_watches set status = 'triggered', triggered_at = now() where user_id = w.user_id;

    -- 1) position d'urgence → carte du cercle (mécanisme existant)
    if plat is not null and plng is not null then
      insert into locations_realtime (user_id, lat, lng, is_emergency) values (w.user_id, plat, plng, true);
    end if;

    -- 2) message + push à chaque membre du cercle (réutilise le webhook messages existant)
    maplink := case when plat is not null
      then ' https://www.google.com/maps?q=' || round(plat::numeric, 5) || ',' || round(plng::numeric, 5)
      else '' end;
    for member in
      select case when mc.user_a = w.user_id then mc.user_b else mc.user_a end
      from matches_connections mc
      where mc.status = 'accepted' and (mc.user_a = w.user_id or mc.user_b = w.user_id)
    loop
      insert into messages (sender_id, recipient_id, content)
      values (w.user_id, member,
        '🛟 Veilleur de nuit : je n''ai pas confirmé mon retour de sécurité à temps. Peux-tu vérifier que je vais bien ?' || maplink);
    end loop;

    fired := fired + 1;
  end loop;
  return fired;
end;
$function$;

-- Planification : toutes les 2 minutes.
create extension if not exists pg_cron;
select cron.schedule('sm-safety-watches', '*/2 * * * *', $$ select public.sm_run_safety_watches(); $$);
