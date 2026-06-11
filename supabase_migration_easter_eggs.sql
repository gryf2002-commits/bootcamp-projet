-- ============================================================
-- SunMates · 🥚 EASTER EGGS — 8 badges SECRETS
-- À exécuter dans le SQL Editor de Supabase. Idempotent (rejouable).
--
-- Règle maison : les easter eggs ne sont JAMAIS documentés côté public.
-- Ces badges sont is_secret = true → invisibles dans le catalogue tant
-- qu'ils ne sont pas débloqués ; l'admin voit la condition exacte.
-- L'attribution se fait côté app (awardSecretBadge → user_badges).
-- ============================================================

insert into badges_catalog (key, name, emoji, description, is_secret, secret_hint, unlock_condition, sort_order) values
  ('badge_goldenhour', 'Chercheur d''or',      '🌅', 'A déclenché la Golden Hour : une heure entière baignée d''or.',         true, 'Le soleil aime qu''on le touche…',              '7 taps sur le logo soleil en moins de 4 s', 90),
  ('badge_whale',      'Capitaine Achab',      '🐋', 'A croisé la baleine au large. Peu peuvent en dire autant.',             true, 'Le grand bleu cache de grandes choses…',        'Zoomer sur l''eau (centre carte sur l''océan, zoom ≥10)', 91),
  ('badge_birthday',   'Année dorée',          '🎂', 'A passé son anniversaire avec SunMates. Bon vent pour cette année !',   true, 'Un jour par an, l''app pense très fort à toi…', 'Ouvrir l''app le jour de sa date de naissance', 92),
  ('badge_sunword',    'Invocateur de soleil', '☀️', 'A appelé le soleil par son nom, et le soleil a répondu.',               true, 'Appelle-le par son nom…',                       'Taper « soleil » dans la recherche de l''accueil', 93),
  ('badge_pilgrim',    'Pèlerin',              '🗼', 'S''est tenu au pied d''un monument légendaire, pour de vrai.',          true, 'Les légendes se visitent en vrai…',             'Être à <150 m d''un des 12 monuments (géoloc)', 94),
  ('badge_shaker',     'Maître cocktail',      '🍸', 'A laissé le hasard décider de son aventure.',                           true, 'Parfois il faut secouer sa journée…',           'Secouer le téléphone (détection accéléromètre)', 95),
  ('badge_midnight',   'Noctambule',           '🌠', 'Était là à minuit pile, quand les étoiles filent.',                     true, 'Les vœux se font à une heure précise…',         'Ouvrir l''app entre 00:00 et 00:05', 96),
  ('badge_streak30',   'Flamme éternelle',     '🔥', '30 jours d''affilée sur SunMates. L''avatar s''en souvient.',           true, 'La régularité finit par se voir…',              'Série de 30 jours consécutifs', 97),
  -- 🎬 Fournée 2 : pop culture
  ('badge_konami',     'Up Up Down Down',      '🎮', 'A entré LE code. L''app est repassée en 1988 pour 10 minutes.',         true, 'Un code plus vieux que toi…',                   '↑↑↓↓←→←→BA au clavier, ou la même séquence en swipes', 98),
  ('badge_h2g2',       'Routard galactique',   '🛸', 'Connaît la réponse à la grande question. Et voyage avec sa serviette.', true, 'La grande question a une réponse courte…',      'Taper « 42 » dans la recherche de l''accueil', 99),
  ('badge_hakuna',     'Sans souci',           '🦁', 'A prononcé la phrase magnifique. Les soucis se sont envolés.',          true, 'Deux mots, zéro souci…',                        'Taper « hakuna matata » dans la recherche', 100),
  ('badge_may4th',     'Padawan du voyage',    '⭐', 'Était là le 4 mai. Que la Force soit avec ce voyageur.',                true, 'Un jour de mai pas comme les autres…',          'Ouvrir l''app le 4 mai', 101),
  ('badge_adventure',  'L''aventure est là-dehors', '🎈', 'A fait s''envoler la maison, comme dans le film.',                 true, 'Parfois, la maison veut voyager aussi…',        '5 taps rapides sur le bouton « À la maison »', 102),
  ('badge_titanic',    'Roi du monde',         '🚢', 'A navigué jusqu''au point exact du naufrage le plus célèbre du monde.', true, 'Au beau milieu de l''Atlantique Nord…',         'Centrer la carte sur 41.73 N, 49.95 W (zoom ≥8)', 103)
on conflict (key) do update set
  name = excluded.name, emoji = excluded.emoji, description = excluded.description,
  is_secret = excluded.is_secret, secret_hint = excluded.secret_hint,
  unlock_condition = excluded.unlock_condition, sort_order = excluded.sort_order;

-- ============================================================
-- Fin. Les 8 eggs sont câblés côté app (v411) ; rien d'autre à faire.
-- ============================================================
