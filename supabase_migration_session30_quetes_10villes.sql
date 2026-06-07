-- ============================================================
-- SunMates — Session 30 : QUÊTES dans les 10 plus grandes villes de France
-- ============================================================
-- Étend le « plateau de jeu » : Paris (déjà semé en s26) + 9 grandes villes.
-- ~5 quêtes géolocalisées par ville (vrais lieux), kind='quest', purement ludiques
-- (XP + badge, aucun coupon partenaire). Réutilise les badges existants.
--
-- Rejouable : à exécuter dans le SQL Editor de Supabase (on conflict do update).
-- Pré-requis : s26 (colonnes lat/lng sur quests). Si pas encore fait, décommente :
-- alter table quests add column if not exists lat double precision;
-- alter table quests add column if not exists lng double precision;
-- ============================================================

insert into quests
  (key, kind, title, emoji, city, description, requires_code,
   badge_key, badge_name, badge_emoji, points, sort_order, lat, lng)
values
  -- ===== Marseille =====
  ('quest_marseille_vieuxport','quest','Le Vieux-Port','⛵','Marseille, France','Flâne sur le Vieux-Port au lever du soleil et capture les bateaux.',false,'badge_photographer','Photographe','📷',90,201,43.2951,5.3740),
  ('quest_marseille_garde','quest','Notre-Dame de la Garde','⛪','Marseille, France','Monte à la Bonne Mère pour la plus belle vue sur la cité phocéenne.',false,'badge_explorer','Explorateur','🧭',110,202,43.2841,5.3713),
  ('quest_marseille_panier','quest','Le quartier du Panier','🎨','Marseille, France','Perds-toi dans les ruelles colorées et déniche du street-art.',false,'badge_culture','Culture','🎨',80,203,43.2976,5.3660),
  ('quest_marseille_calanques','quest','Cap sur les Calanques','🏞️','Marseille, France','Rejoins le Vallon des Auffes ou une calanque et respire la Méditerranée.',false,'badge_questmaster','Aventurier','🗺️',120,204,43.2790,5.3530),
  ('quest_marseille_mucem','quest','Café près du MuCEM','☕','Marseille, France','Donne rendez-vous à un Mate au MuCEM et longe la passerelle.',false,'badge_local','Ami local','🤝',100,205,43.2966,5.3614),

  -- ===== Lyon =====
  ('quest_lyon_fourviere','quest','Basilique de Fourvière','⛪','Lyon, France','Grimpe à Fourvière pour dominer Lyon et ses deux fleuves.',false,'badge_explorer','Explorateur','🧭',110,211,45.7622,4.8226),
  ('quest_lyon_vieux','quest','Traboules du Vieux Lyon','🚪','Lyon, France','Pousse une traboule secrète dans le Vieux Lyon Renaissance.',false,'badge_questmaster','Aventurier','🗺️',90,212,45.7620,4.8270),
  ('quest_lyon_teteor','quest','Parc de la Tête d''Or','🌳','Lyon, France','Balade-toi au plus grand parc urbain et observe la vie lyonnaise.',false,'badge_explorer','Explorateur','🧭',80,213,45.7772,4.8525),
  ('quest_lyon_bellecour','quest','Place Bellecour','🎡','Lyon, France','Retrouve un Mate sur la plus grande place piétonne d''Europe.',false,'badge_local','Ami local','🤝',90,214,45.7578,4.8320),
  ('quest_lyon_croixrousse','quest','La Croix-Rousse','🧵','Lyon, France','Monte sur la colline des canuts et discute avec un·e habitant·e.',false,'badge_polyglot','Polyglotte','🗣️',100,215,45.7740,4.8320),

  -- ===== Toulouse =====
  ('quest_toulouse_capitole','quest','Place du Capitole','🏛️','Toulouse, France','Pose devant le Capitole et admire la croix occitane au sol.',false,'badge_photographer','Photographe','📷',90,221,43.6045,1.4442),
  ('quest_toulouse_espace','quest','Cité de l''espace','🚀','Toulouse, France','Pars à la conquête de l''espace dans la ville rose.',false,'badge_questmaster','Aventurier','🗺️',120,222,43.5872,1.4951),
  ('quest_toulouse_garonne','quest','Le Pont-Neuf sur la Garonne','🌉','Toulouse, France','Traverse le Pont-Neuf au coucher du soleil sur la Garonne.',false,'badge_explorer','Explorateur','🧭',80,223,43.5985,1.4380),
  ('quest_toulouse_sernin','quest','Basilique Saint-Sernin','⛪','Toulouse, France','Découvre la plus grande église romane d''Europe.',false,'badge_culture','Culture','🎨',90,224,43.6081,1.4419),
  ('quest_toulouse_canal','quest','Le long du Canal du Midi','☕','Toulouse, France','Bois un café au bord du canal classé à l''UNESCO avec un Mate.',false,'badge_local','Ami local','🤝',100,225,43.6155,1.4530),

  -- ===== Nice =====
  ('quest_nice_promenade','quest','Promenade des Anglais','🌴','Nice, France','Marche le long de la Baie des Anges face à la grande bleue.',false,'badge_explorer','Explorateur','🧭',90,231,43.6950,7.2650),
  ('quest_nice_vieux','quest','Le Vieux Nice','🎨','Nice, France','Perds-toi dans les ruelles ocres et goûte une socca.',false,'badge_culture','Culture','🎨',80,232,43.6961,7.2756),
  ('quest_nice_chateau','quest','Colline du Château','📷','Nice, France','Monte au point de vue pour la carte postale de Nice.',false,'badge_photographer','Photographe','📷',100,233,43.6949,7.2810),
  ('quest_nice_saleya','quest','Marché du Cours Saleya','🌸','Nice, France','Flâne au marché aux fleurs et discute avec un·e marchand·e.',false,'badge_polyglot','Polyglotte','🗣️',90,234,43.6952,7.2745),
  ('quest_nice_port','quest','Le Port de Nice','⛵','Nice, France','Retrouve un Mate au port coloré pour un verre face aux yachts.',false,'badge_local','Ami local','🤝',100,235,43.6957,7.2870),

  -- ===== Nantes =====
  ('quest_nantes_elephant','quest','Les Machines de l''île','🐘','Nantes, France','Rencontre le Grand Éléphant mécanique, icône de Nantes.',false,'badge_questmaster','Aventurier','🗺️',120,241,47.2070,-1.5650),
  ('quest_nantes_chateau','quest','Château des ducs de Bretagne','🏰','Nantes, France','Fais le tour des remparts au cœur de la ville.',false,'badge_culture','Culture','🎨',90,242,47.2158,-1.5497),
  ('quest_nantes_versailles','quest','Île de Versailles','🌳','Nantes, France','Détends-toi dans ce jardin japonais en pleine ville.',false,'badge_explorer','Explorateur','🧭',80,243,47.2230,-1.5560),
  ('quest_nantes_pommeraye','quest','Passage Pommeraye','🛍️','Nantes, France','Admire le passage couvert le plus chic du XIXe siècle.',false,'badge_photographer','Photographe','📷',90,244,47.2135,-1.5570),
  ('quest_nantes_plantes','quest','Jardin des plantes','☕','Nantes, France','Café et papote avec un Mate parmi les serres et fleurs.',false,'badge_local','Ami local','🤝',100,245,47.2185,-1.5420),

  -- ===== Montpellier =====
  ('quest_montpellier_comedie','quest','Place de la Comédie','🎭','Montpellier, France','Pose sur l''Œuf, le cœur battant de Montpellier.',false,'badge_photographer','Photographe','📷',90,251,43.6085,3.8800),
  ('quest_montpellier_peyrou','quest','Promenade du Peyrou','🏛️','Montpellier, France','Admire l''arc de triomphe et l''aqueduc au coucher du soleil.',false,'badge_explorer','Explorateur','🧭',90,252,43.6112,3.8717),
  ('quest_montpellier_ecusson','quest','Ruelles de l''Écusson','🎨','Montpellier, France','Explore la vieille ville médiévale et ses hôtels particuliers.',false,'badge_culture','Culture','🎨',80,253,43.6110,3.8760),
  ('quest_montpellier_plantes','quest','Jardin des plantes','🌳','Montpellier, France','Le plus ancien jardin botanique de France, pause nature.',false,'badge_explorer','Explorateur','🧭',80,254,43.6147,3.8720),
  ('quest_montpellier_antigone','quest','Quartier Antigone','☕','Montpellier, France','Café avec un Mate dans ce quartier néoclassique surprenant.',false,'badge_local','Ami local','🤝',100,255,43.6080,3.8880),

  -- ===== Strasbourg =====
  ('quest_strasbourg_cathedrale','quest','Cathédrale de Strasbourg','⛪','Strasbourg, France','Lève les yeux vers la flèche de grès rose et son horloge astronomique.',false,'badge_culture','Culture','🎨',100,261,48.5818,7.7510),
  ('quest_strasbourg_petitefrance','quest','La Petite France','🏘️','Strasbourg, France','Photographie les maisons à colombages au bord de l''Ill.',false,'badge_photographer','Photographe','📷',90,262,48.5800,7.7400),
  ('quest_strasbourg_europe','quest','Le Parlement européen','🇪🇺','Strasbourg, France','Va voir le cœur de l''Europe et son architecture moderne.',false,'badge_explorer','Explorateur','🧭',90,263,48.5970,7.7690),
  ('quest_strasbourg_vauban','quest','Barrage Vauban','📷','Strasbourg, France','Monte sur la terrasse panoramique sur les Ponts Couverts.',false,'badge_explorer','Explorateur','🧭',80,264,48.5790,7.7390),
  ('quest_strasbourg_kleber','quest','Place Kléber','☕','Strasbourg, France','Retrouve un Mate sur la grande place et bois un chocolat chaud.',false,'badge_local','Ami local','🤝',100,265,48.5832,7.7455),

  -- ===== Bordeaux =====
  ('quest_bordeaux_bourse','quest','Miroir d''eau de la Bourse','💧','Bordeaux, France','Capture le reflet de la Place de la Bourse dans le miroir d''eau.',false,'badge_photographer','Photographe','📷',100,271,44.8412,-0.5690),
  ('quest_bordeaux_citevin','quest','La Cité du Vin','🍷','Bordeaux, France','Explore le temple du vin à l''architecture futuriste.',false,'badge_questmaster','Aventurier','🗺️',110,272,44.8625,-0.5503),
  ('quest_bordeaux_grossecloche','quest','La Grosse Cloche','🔔','Bordeaux, France','Passe sous le beffroi médiéval, symbole de la ville.',false,'badge_culture','Culture','🎨',80,273,44.8345,-0.5720),
  ('quest_bordeaux_quais','quest','Les Quais de la Garonne','🚶','Bordeaux, France','Balade sur les quais classés à l''UNESCO au fil de l''eau.',false,'badge_explorer','Explorateur','🧭',80,274,44.8470,-0.5660),
  ('quest_bordeaux_jardin','quest','Jardin public','☕','Bordeaux, France','Café et discussion avec un Mate dans ce jardin à l''anglaise.',false,'badge_local','Ami local','🤝',100,275,44.8480,-0.5760),

  -- ===== Lille =====
  ('quest_lille_grandplace','quest','La Grand-Place','🎄','Lille, France','Admire la Vieille Bourse et l''ambiance de la Grand-Place.',false,'badge_photographer','Photographe','📷',90,281,50.6366,3.0635),
  ('quest_lille_vieuxlille','quest','Le Vieux-Lille','🧱','Lille, France','Flâne dans les ruelles de briques rouges et boutiques de charme.',false,'badge_culture','Culture','🎨',80,282,50.6420,3.0640),
  ('quest_lille_citadelle','quest','La Citadelle','🌳','Lille, France','Cours ou marche autour de la citadelle de Vauban.',false,'badge_explorer','Explorateur','🧭',90,283,50.6420,3.0490),
  ('quest_lille_beauxarts','quest','Palais des Beaux-Arts','🖼️','Lille, France','Découvre l''un des plus grands musées de France.',false,'badge_culture','Culture','🎨',90,284,50.6310,3.0630),
  ('quest_lille_wazemmes','quest','Marché de Wazemmes','🧺','Lille, France','Plonge dans le marché populaire et discute avec un·e Lillois·e.',false,'badge_polyglot','Polyglotte','🗣️',100,285,50.6260,3.0490)
on conflict (key) do update set
  kind=excluded.kind, title=excluded.title, emoji=excluded.emoji, city=excluded.city,
  description=excluded.description, requires_code=excluded.requires_code,
  badge_key=excluded.badge_key, badge_name=excluded.badge_name, badge_emoji=excluded.badge_emoji,
  points=excluded.points, sort_order=excluded.sort_order, lat=excluded.lat, lng=excluded.lng;

-- ============================================================
-- Fin. 45 quêtes réparties sur 9 villes (+ Paris = 10). Elles apparaissent
-- automatiquement sur la carte (couche 🎯 Quêtes), dans le radar « quête la plus
-- proche » et via le sélecteur de ville. XP + badge à la clé.
-- ============================================================
