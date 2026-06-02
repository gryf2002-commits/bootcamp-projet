-- ============================================================
--  SunMates — 10 PROFILS DE DÉMO (pour explorer le matchmaking)
--  À coller dans Supabase : menu de gauche > SQL Editor > New query > Run
--  Rejouable sans risque (met à jour les profils s'ils existent déjà).
--
--  Chaque profil de démo = un vrai compte (auth.users) + son profil,
--  car profiles.id est lié à auth.users. Ces comptes n'ont pas de mot
--  de passe : ils servent uniquement à remplir l'app (découverte,
--  recommandations, compatibilité, filtres). Tu peux leur envoyer des
--  demandes de connexion sans erreur.
--
--  Pour TOUT SUPPRIMER plus tard :
--    delete from auth.users where email like '%@demo.sunmates';
--  (les profils liés sont supprimés automatiquement en cascade)
-- ============================================================

-- Sécurité : on s'assure que les colonnes existent (au cas où les
-- migrations précédentes n'auraient pas encore été lancées).
alter table profiles add column if not exists first_name   text;
alter table profiles add column if not exists last_name    text;
alter table profiles add column if not exists interests    text[] default '{}';
alter table profiles add column if not exists languages    text[] default '{}';
alter table profiles add column if not exists travel_style text;
alter table profiles add column if not exists avatar_url   text;

do $$
declare
  rec record;
  uid uuid;
begin
  for rec in
    select * from (values
      ('lina@demo.sunmates','Lina','Costa','Lisbonne, Portugal',
        ARRAY['Plage','Photo','Gastronomie']::text[], ARRAY['Français','English','Português']::text[],
        'Slow travel', 80, true, 'https://i.pravatar.cc/300?img=5',
        'Photographe nomade, fan de pastéis et de couchers de soleil sur le Tage. ☀️'),
      ('marco@demo.sunmates','Marco','Rossi','Rome, Italie',
        ARRAY['Gastronomie','Culture','Fête']::text[], ARRAY['Italiano','English']::text[],
        'Confort', 45, false, 'https://i.pravatar.cc/300?img=12',
        'Amateur de cuisine locale et de balades nocturnes. Andiamo !'),
      ('sofia@demo.sunmates','Sofia','García','Barcelone, Espagne',
        ARRAY['Fête','Plage','Sport']::text[], ARRAY['Español','English','Français']::text[],
        'Routard', 60, true, 'https://i.pravatar.cc/300?img=16',
        'Surf le matin, tapas le soir. Toujours partante pour une aventure.'),
      ('tom@demo.sunmates','Tom','Becker','Berlin, Allemagne',
        ARRAY['Culture','Photo','Nature']::text[], ARRAY['Deutsch','English']::text[],
        'Aventure', 30, false, 'https://i.pravatar.cc/300?img=13',
        'Street-art, musées et randos urbaines. Berlin est mon terrain de jeu.'),
      ('amelie@demo.sunmates','Amélie','Dubois','Lisbonne, Portugal',
        ARRAY['Photo','Gastronomie','Nomade']::text[], ARRAY['Français','English']::text[],
        'Nomade', 90, true, 'https://i.pravatar.cc/300?img=9',
        'Travailleuse nomade depuis 3 ans. Cafés calmes et bon wifi = bonheur.'),
      ('yuki@demo.sunmates','Yuki','Tanaka','Paris, France',
        ARRAY['Culture','Photo','Gastronomie']::text[], ARRAY['English','Français']::text[],
        'Slow travel', 55, true, 'https://i.pravatar.cc/300?img=32',
        'À la découverte des petites adresses parisiennes, appareil photo en main.'),
      ('liam@demo.sunmates','Liam','O''Brien','Dublin, Irlande',
        ARRAY['Fête','Sport','Nature']::text[], ARRAY['English']::text[],
        'Routard', 25, false, 'https://i.pravatar.cc/300?img=33',
        'Pubs, falaises et matchs de rugby. Sláinte !'),
      ('nadia@demo.sunmates','Nadia','Haddad','Marrakech, Maroc',
        ARRAY['Culture','Gastronomie','Nature']::text[], ARRAY['Français','English']::text[],
        'Aventure', 70, true, 'https://i.pravatar.cc/300?img=45',
        'Guide dans l''âme, je connais les meilleurs spots du souk au désert.'),
      ('chloe@demo.sunmates','Chloé','Martin','Barcelone, Espagne',
        ARRAY['Plage','Fête','Photo']::text[], ARRAY['Français','Español']::text[],
        'Confort', 50, false, 'https://i.pravatar.cc/300?img=20',
        'Exploratrice solo qui aime les rencontres simples et les beaux endroits.'),
      ('diego@demo.sunmates','Diego','Álvarez','Mexico, Mexique',
        ARRAY['Aventure','Nature','Sport']::text[], ARRAY['Español','English']::text[],
        'Aventure', 65, true, 'https://i.pravatar.cc/300?img=51',
        'Volcans, cenotes et tacos. La vie est une grande expédition.')
    ) as v(email,first_name,last_name,city,interests,languages,travel_style,trust_score,is_verified,avatar_url,bio)
  loop
    -- Crée le compte s'il n'existe pas encore
    select id into uid from auth.users where email = rec.email;
    if uid is null then
      uid := gen_random_uuid();
      insert into auth.users
        (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
         created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
         confirmation_token, recovery_token, email_change_token_new, email_change)
      values
        ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', rec.email, null, now(),
         now(), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('username', rec.first_name),
         '', '', '', '');
    end if;

    -- Crée / met à jour le profil
    insert into profiles (id, username, first_name, last_name, city, bio,
                          interests, languages, travel_style, trust_score, is_verified, avatar_url)
    values (uid, rec.first_name, rec.first_name, rec.last_name, rec.city, rec.bio,
            rec.interests, rec.languages, rec.travel_style, rec.trust_score, rec.is_verified, rec.avatar_url)
    on conflict (id) do update set
      username     = excluded.username,
      first_name   = excluded.first_name,
      last_name    = excluded.last_name,
      city         = excluded.city,
      bio          = excluded.bio,
      interests    = excluded.interests,
      languages    = excluded.languages,
      travel_style = excluded.travel_style,
      trust_score  = excluded.trust_score,
      is_verified  = excluded.is_verified,
      avatar_url   = excluded.avatar_url;
  end loop;
end $$;

-- ✅ Terminé : 10 voyageurs de démo apparaissent maintenant dans
--    « Voyageurs à rencontrer », « Pour toi », les filtres et le tri.
--    Astuce : remplis TON profil (ville + intérêts + langues + style)
--    pour voir les pourcentages de compatibilité grimper.
