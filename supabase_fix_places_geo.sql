-- ============================================================
-- CORRECTION DES LIEUX : vraies adresses + coordonnées EXACTES
-- ------------------------------------------------------------
-- Problème : les lieux de démo avaient des coordonnées de CENTRE-VILLE
-- génériques (ex. tous les lieux parisiens au centre de Paris), d'où des
-- points de carte mal placés. On remet pour chaque lieu son adresse postale
-- réelle et ses coordonnées exactes (géocodées via OpenStreetMap/Nominatim).
-- À exécuter dans Supabase → SQL Editor → Run. Idempotent (relançable).
-- ============================================================

update partner_cafes as p
   set address = v.address, lat = v.lat, lng = v.lng
  from (values
    ('Le Comptoir Solaire', 'Rua Nova do Carvalho 8, 1200-019 Lisboa',        38.707231, -9.143802),
    ('Casa do Sol',         'Rua da Boavista 84, 1200-068 Lisboa',            38.708917, -9.150710),
    ('Sunrise Co-Living',   'Carrer de Girona 20, 08010 Barcelona',           41.391657,  2.175478),
    ('Mirador Verde',       'Carrer Gran de Gràcia 15, 08012 Barcelona',      41.398247,  2.157078),
    ('Green Bean Hub',      'Oranienstraße 40, 10999 Berlin',                 52.502055, 13.416897),
    ('Maritimo Co-Living',  'Rua de Miguel Bombarda 100, 4050-377 Porto',     41.149852, -8.619323),
    ('Atelier Lumière',     '38 Rue Saint-Maur, 75011 Paris',                 48.861889,  2.381161),
    ('Surf & Co',           '5 Rue du Centre, 64200 Biarritz',                43.480578, -1.562299)
  ) as v(name, address, lat, lng)
 where p.name = v.name;

-- Vérifier le résultat :
-- select name, city, address, lat, lng from partner_cafes order by name;
