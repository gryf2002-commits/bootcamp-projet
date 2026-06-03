-- ============================================================
--  SunMates — 10 PROFILS DE DÉMO (pour explorer le matchmaking)
--  À coller dans Supabase : menu de gauche > SQL Editor > New query > Run
--  ⚠️ Lance D'ABORD supabase_migration_session2.sql (il crée les colonnes).
--  Rejouable sans risque (met à jour les profils s'ils existent déjà).
--
--  Chaque profil de démo = un vrai compte (auth.users) + son profil,
--  car profiles.id est lié à auth.users. Ces comptes n'ont pas de mot
--  de passe : ils servent uniquement à remplir l'app (découverte,
--  recommandations, compatibilité, filtres). is_demo = true => ils
--  restent visibles dans la découverte (contrairement aux vrais
--  utilisateurs, trouvables seulement par pseudo).
--
--  Pour TOUT SUPPRIMER plus tard :
--    delete from auth.users where email like '%@demo.sunmates';
-- ============================================================

-- Sécurité : on s'assure que les colonnes existent.
alter table profiles add column if not exists first_name   text;
alter table profiles add column if not exists last_name    text;
alter table profiles add column if not exists interests    text[] default '{}';
alter table profiles add column if not exists languages    text[] default '{}';
alter table profiles add column if not exists travel_style text;
alter table profiles add column if not exists avatar_url   text;
alter table profiles add column if not exists is_demo      boolean default false;
alter table profiles add column if not exists gender       text;
alter table profiles add column if not exists pronouns     text;
alter table profiles add column if not exists birthdate    date;
alter table profiles add column if not exists height_cm    int;
alter table profiles add column if not exists job_title    text;
alter table profiles add column if not exists orientation  text;
alter table profiles add column if not exists intent       text[] default '{}';
alter table profiles add column if not exists prompt1_q    text;
alter table profiles add column if not exists prompt1_a    text;

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
        'Photographe nomade, fan de pastéis et de couchers de soleil sur le Tage. ☀️',
        'Femme','elle','1996-04-12'::date, 168, 'Photographe', 'Hétéro',
        ARRAY['Amitié','Compagnons de voyage']::text[], 'Mon spot voyage préféré', 'Les ruelles de l''Alfama au lever du soleil'),
      ('marco@demo.sunmates','Marco','Rossi','Rome, Italie',
        ARRAY['Gastronomie','Culture','Fête']::text[], ARRAY['Italiano','English']::text[],
        'Confort', 45, false, 'https://i.pravatar.cc/300?img=12',
        'Amateur de cuisine locale et de balades nocturnes. Andiamo !',
        'Homme','il','1994-09-02'::date, 182, 'Chef cuisinier', 'Hétéro',
        ARRAY['Rencontre','Amitié']::text[], 'On se reconnaît si', 'tu commandes un ristretto, jamais un cappuccino l''après-midi'),
      ('sofia@demo.sunmates','Sofia','García','Barcelone, Espagne',
        ARRAY['Fête','Plage','Sport']::text[], ARRAY['Español','English','Français']::text[],
        'Routard', 60, true, 'https://i.pravatar.cc/300?img=16',
        'Surf le matin, tapas le soir. Toujours partante pour une aventure.',
        'Femme','elle','1998-01-22'::date, 172, 'Monitrice de surf', 'Bi',
        ARRAY['Amitié','Compagnons de voyage','Rencontre']::text[], 'Ma façon de décompresser', 'une session de surf au lever du jour'),
      ('tom@demo.sunmates','Tom','Becker','Berlin, Allemagne',
        ARRAY['Culture','Photo','Nature']::text[], ARRAY['Deutsch','English']::text[],
        'Aventure', 30, false, 'https://i.pravatar.cc/300?img=13',
        'Street-art, musées et randos urbaines. Berlin est mon terrain de jeu.',
        'Homme','il','1995-06-18'::date, 178, 'Designer graphique', 'Hétéro',
        ARRAY['Amitié','Réseau']::text[], 'Le truc dont je ne me lasse pas', 'photographier des fresques au petit matin'),
      ('amelie@demo.sunmates','Amélie','Dubois','Lisbonne, Portugal',
        ARRAY['Photo','Gastronomie','Nomade']::text[], ARRAY['Français','English']::text[],
        'Nomade', 90, true, 'https://i.pravatar.cc/300?img=9',
        'Travailleuse nomade depuis 3 ans. Cafés calmes et bon wifi = bonheur.',
        'Femme','elle','1992-11-30'::date, 165, 'Développeuse web', 'Hétéro',
        ARRAY['Réseau','Amitié','Compagnons de voyage']::text[], 'Mon indispensable en voyage', 'un carnet et un bon casque à réduction de bruit'),
      ('yuki@demo.sunmates','Yuki','Tanaka','Paris, France',
        ARRAY['Culture','Photo','Gastronomie']::text[], ARRAY['English','Français']::text[],
        'Slow travel', 55, true, 'https://i.pravatar.cc/300?img=32',
        'À la découverte des petites adresses parisiennes, appareil photo en main.',
        'Femme','elle','1997-03-08'::date, 160, 'Illustratrice', 'Pansexuelle',
        ARRAY['Amitié','Rencontre']::text[], 'Ma définition d''un dimanche parfait', 'un marché, une expo, et un carnet de croquis'),
      ('liam@demo.sunmates','Liam','O''Brien','Dublin, Irlande',
        ARRAY['Fête','Sport','Nature']::text[], ARRAY['English']::text[],
        'Routard', 25, false, 'https://i.pravatar.cc/300?img=33',
        'Pubs, falaises et matchs de rugby. Sláinte !',
        'Homme','il','1993-07-14'::date, 185, 'Barman', 'Hétéro',
        ARRAY['Amitié','Fête']::text[], 'On s''entendra si', 'tu n''as pas peur d''une rando sous la pluie'),
      ('nadia@demo.sunmates','Nadia','Haddad','Marrakech, Maroc',
        ARRAY['Culture','Gastronomie','Nature']::text[], ARRAY['Français','English']::text[],
        'Aventure', 70, true, 'https://i.pravatar.cc/300?img=45',
        'Guide dans l''âme, je connais les meilleurs spots du souk au désert.',
        'Femme','elle','1991-12-05'::date, 170, 'Guide touristique', 'Hétéro',
        ARRAY['Réseau','Compagnons de voyage']::text[], 'Le lieu qui m''a marquée', 'une nuit sous les étoiles dans le désert d''Agafay'),
      ('chloe@demo.sunmates','Chloé','Martin','Barcelone, Espagne',
        ARRAY['Plage','Fête','Photo']::text[], ARRAY['Français','Español']::text[],
        'Confort', 50, false, 'https://i.pravatar.cc/300?img=20',
        'Exploratrice solo qui aime les rencontres simples et les beaux endroits.',
        'Femme','elle','1999-05-19'::date, 167, 'Étudiante en architecture', 'Hétéro',
        ARRAY['Amitié','Rencontre','Compagnons de voyage']::text[], 'Ce qui me fait vibrer en voyage', 'me perdre dans une ville sans plan'),
      ('diego@demo.sunmates','Diego','Álvarez','Mexico, Mexique',
        ARRAY['Aventure','Nature','Sport']::text[], ARRAY['Español','English']::text[],
        'Aventure', 65, true, 'https://i.pravatar.cc/300?img=51',
        'Volcans, cenotes et tacos. La vie est une grande expédition.',
        'Homme','il','1990-08-27'::date, 176, 'Moniteur de plongée', 'Hétéro',
        ARRAY['Amitié','Compagnons de voyage']::text[], 'Mon prochain défi', 'plonger dans tous les cenotes du Yucatán')
    ) as v(email,first_name,last_name,city,interests,languages,travel_style,trust_score,is_verified,avatar_url,bio,
           gender,pronouns,birthdate,height_cm,job_title,orientation,intent,prompt1_q,prompt1_a)
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

    -- Crée / met à jour le profil (is_demo = true)
    insert into profiles (id, username, first_name, last_name, city, bio,
                          interests, languages, travel_style, trust_score, is_verified, avatar_url, is_demo,
                          gender, pronouns, birthdate, height_cm, job_title, orientation, intent, prompt1_q, prompt1_a)
    values (uid, rec.first_name, rec.first_name, rec.last_name, rec.city, rec.bio,
            rec.interests, rec.languages, rec.travel_style, rec.trust_score, rec.is_verified, rec.avatar_url, true,
            rec.gender, rec.pronouns, rec.birthdate, rec.height_cm, rec.job_title, rec.orientation, rec.intent, rec.prompt1_q, rec.prompt1_a)
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
      avatar_url   = excluded.avatar_url,
      is_demo      = true,
      gender       = excluded.gender,
      pronouns     = excluded.pronouns,
      birthdate    = excluded.birthdate,
      height_cm    = excluded.height_cm,
      job_title    = excluded.job_title,
      orientation  = excluded.orientation,
      intent       = excluded.intent,
      prompt1_q    = excluded.prompt1_q,
      prompt1_a    = excluded.prompt1_a;
  end loop;
end $$;

-- ✅ Terminé : 10 voyageurs de démo enrichis apparaissent dans la
--    découverte, les recommandations, les filtres et le tri.
