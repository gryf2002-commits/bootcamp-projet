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
  ('badge_streak30',   'Flamme éternelle',     '🔥', '30 jours d''affilée sur SunMates. L''avatar s''en souvient.',           true, 'La régularité finit par se voir…',              'Série de 30 jours consécutifs', 97)
on conflict (key) do update set
  name = excluded.name, emoji = excluded.emoji, description = excluded.description,
  is_secret = excluded.is_secret, secret_hint = excluded.secret_hint,
  unlock_condition = excluded.unlock_condition, sort_order = excluded.sort_order;

-- ============================================================
-- Fin. Les 8 eggs sont câblés côté app (v411) ; rien d'autre à faire.
-- ============================================================
