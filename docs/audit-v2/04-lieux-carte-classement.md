# Audit v2 — 04 · Lieux + Carte + Check-ins + Classement

**Fichiers audités :** `preview.html` (18 690 l.), `styles.css`, `sunmates-lite.css`, RPC `sql/supabase_migration_session2.sql` (redeem_checkin).
**Périmètre :** onglet Lieux (#cafesList, recherche/tri, détail, avis), check-ins (RPC anti-triche), classement multi-segments, carte d'accueil (Leaflet + MapLibre GL, clusters, calques, geofencing, plein écran), mode Lite (raster).
**Rappel produit :** le check-in et le classement reposent sur des RPC `security definer` qui n'agissent que pour `auth.uid()` → **toujours réservé à l'utilisateur connecté**. Aucune action ici ne marche en visiteur.

---

## 1. INVENTAIRE

### A. Onglet Lieux sûrs (`data-panel="lieux"`, l. 2125-2184)
| Élément | Rôle | Ligne | Liens JS |
|---|---|---|---|
| `<h1>` + intro `places.intro` | titre + accroche « fais un check-in pour grimper 🏆 » | 2127-2128 | i18n |
| `#spotCard` (details) | « Mon spot du jour » (story 24 h) | 2130-2154 | spotSave/spotClear |
| `#favCard` | adresses favorites locales | 2157 | `renderFavCard()` l.7519 |
| `#cafeSearch` | recherche nom/ville | 2158 | debounce → `renderCafesList` l.7697 |
| `#lieuxCats` (cat-tiles) | filtres (Tous/Éco/Près de moi) + tris (Top notés/Populaires) | 2161-2173 | handler l.18486 |
| `#cafeFilters` (chips cachés) | moteur réel des filtres | 2175-2179 | l.7698 |
| `#cafesCount` | compteur « N lieux, M villes » | 2180 | l.7583-7587 |
| `.gold-only-note` | « Gratuit : 1 check-in/jour » | 2181 | statique |
| `#cafesList` | liste cartes-lieu (`.pcard`) | 2182 | `renderCafesList` l.7549 |
| `#cafesMsg` | feedback inline check-in | 2183 | l.7717 |
| `#reviewsModal` / `#starInput` | modale avis (note + commentaire) | 1451-1458 | `openReviews` l.7643 |

### B. Détail lieu (`showCafeDetail`, l. 7466-7501)
Pop `popInfo` : photo, catégorie/ville/distance, offre, éco/horaires/prix, check-ins+note, boutons Check-in / Favori / Avis / Carte / Recommander.

### C. Check-ins
| Élément | Rôle | Ligne |
|---|---|---|
| `checkIn(cafeId,name)` | prompt code → RPC `redeem_checkin` | 7716-7745 |
| `redeem_checkin` (SQL) | valide code, insère checkpoint, +10 trust | session2.sql 263-288 |
| `loadCheckins()` | « Mes check-ins » regroupés par lieu ×N | 7748-7791 |
| `#checkinCount` / `#checkinList` | stat + liste profil | 2542 / 2741 |

### D. Classement (`data-panel`… déplacé dans onglet Jeux, l. 3309-3326)
| Élément | Rôle | Ligne |
|---|---|---|
| Segments `[data-lb]` | XP / Check-ins / Confiance / Badges | 3316, handler 9236 |
| `#lbCitySelect` | filtre par ville | 3320, 9242 |
| `#leaderboardList` | rendu | 9166-9235 |
| RPC `leaderboard(p_metric,p_city,p_limit)` | données + repli sans ville | 9172-9173 |

### E. Carte d'accueil (`#homeMap`, l. 2016-2027)
| Élément | Rôle | Ligne |
|---|---|---|
| Base GL/raster `smBaseLayer` | MapLibre vectoriel recoloré DA, repli CARTO raster | 13062-13122 |
| 4 palettes `SM_MAP_PALETTES` | jour/nuit/hiver/tropiques | 12962-12999 |
| `renderHomeMap` | construit 6 calques de marqueurs | 13371-13800+ |
| `homeCluster` (markercluster) | regroupe, rosace/liste co-localisés | 13483-13517 |
| Calques `#homeMapFilters` + feuille `openLayersSheet` | 6 toggles (lieux/mates/activités/check-ins/quêtes/mes adresses) | 2007-2015 / 14182-14208 |
| `checkGeofences` | notif quête à ≤250 m | 15826-15847 |
| Plein écran `.homemap-card.fs` | toggle CSS fixed | 14269-14272 |
| Carte « Lieux » dédiée `renderMap`/`#map` | seconde carte Leaflet simple | 13124-13165 |

---

## 2. ANALYSE PAR ÉLÉMENT (état · problèmes · options · reco)

### 2.1 Liste des lieux `#cafesList` (l. 7549-7629)
**État :** cartes photo soignées (`.pcard` : photo, chips éco/top, note, CTA check-in/avis/carte). États vides corrects (l.7552, 7614). Lazy-bg via `observeLazy`.
**Problèmes VISUELS :** (a) trois sources d'image possibles (`cafeImage`, `flickrImg`, `image_url`) → cartes hétérogènes ; le lieu Gold utilise `flickrImg` (Flickr déprécié, souvent 404 → carte cassée). (b) Le bandeau Gold (`.gold-only-note`) + carte Gold démo s'insèrent au-dessus de vrais lieux : pollue une liste « lieux sûrs » avec du marketing.
**Problèmes TECHNIQUES :** (c) `loadCafes` charge TOUS les `checkpoints` (`select("cafe_id")` l.7449, **sans `.limit`**) côté client juste pour compter → ne passe pas à l'échelle et fuite le volume. (d) Le tri `name` existe (l.7569) mais **aucune tuile ne le déclenche** (code mort). (e) Filtres et tris partagent une seule sélection active → choisir un tri efface visuellement le filtre éco (voulu mais déroutant).
**Options :** A) Compter les check-ins via une vue/RPC agrégée `place_checkin_counts` (comme `place_ratings`) → 1 requête légère. B) Garder le client mais `.limit` + agrégat serveur. C) Statu quo.
**Reco : A** + retirer l'image Flickr du Gold (image locale `sm-cafe.jpg`), sortir le bloc Gold dans un encart distinct sous la liste.

### 2.2 Détail lieu `showCafeDetail` (l. 7466-7501)
**État :** complet et clair. Bonne reliure check-in → avis → carte.
**Problèmes :** compteur de check-ins figé à l'ouverture (after check-in la fiche se ferme volontairement, l.7731 — OK) ; pas de lien « itinéraire » réel (le bouton Carte recentre seulement). Distance affichée seulement si `myGeo` déjà connu (pas de prompt géoloc depuis la fiche).
**Options :** A) Ajouter un bouton « 🧭 Itinéraire » (lien `geo:`/Google Maps). B) Demander la géoloc à l'ouverture si absente pour afficher la distance. C) Statu quo.
**Reco : A+B** (audacieux : la fiche devient un mini-hub d'arrivée sur place).

### 2.3 Check-in `checkIn` + `redeem_checkin` (l. 7716 / SQL 263)
**État :** anti-triche solide côté serveur (code jamais exposé, +10 via `security definer`, comparaison normalisée upper/trim). Feedback excellent : toast cliquable → avis, flash tuile, confettis, son. `once()` anti double-clic.
**Problèmes (P1) :** le RPC **n'applique AUCUNE limite quotidienne** : ni cooldown, ni 1/jour, ni anti-spam même lieu. Or l'UI promet « Gratuit : 1 check-in par jour » (l.2181) → **promesse non tenue + farmable** (trust +10 à volonté tant qu'on a le code). Contredit la règle CLAUDE.md « le trust ne monte que via signaux non triviaux ». Autre : aucun contrôle de proximité GPS (on peut checker un lieu à l'autre bout du monde si on a le code).
**Options :** A) Ajouter dans le RPC un garde `unique (user_id, cafe_id, date)` + cooldown, et `daily_count` pour le palier Gratuit/Gold. B) Garder illimité mais corriger le texte UI (« +10 pts par lieu validé ») pour cesser de mentir. C) Ajouter en plus une vérif distance (lat/lng client vs lieu, tolérance 300 m) côté RPC.
**Reco : A (impératif anti-farm) + C** ; au minimum **B** si A reporté. C'est le bug le plus important du périmètre.

### 2.4 Avis `openReviews`/`loadReviews` (l. 7643-7693)
**État :** upsert propre (`onConflict cafe_id,user_id`), moyenne, badge « Critique avisé » au 1er avis, « toi » mis en avant.
**Problèmes :** (a) **aucun pré-requis de check-in** pour noter → un compte peut noter 100 lieux jamais visités (manipulation de classement « Top notés »). (b) N+1 : `loadReviews` fait un 2ᵉ fetch profils à chaque ouverture (acceptable, petit volume). (c) Pas de signalement d'un avis abusif.
**Options :** A) Exiger ≥1 check-in sur le lieu avant de pouvoir noter (RPC `place_reviews` insert guardé). B) Marquer « ✓ a visité » sur les avis vérifiés sans bloquer les autres. C) Statu quo + bouton signaler.
**Reco : B** (honnête sans frustrer) ; A si on veut durcir le signal qualité.

### 2.5 Classement `renderLeaderboard` (l. 9166-9235)
**État :** 4 segments, par ville, opt-in privé explicite (RGPD-friendly), ma ligne + tendance 📈/📉 persistée, aperçu au clic, encouragement si hors top. Très bon.
**Problèmes VISUELS :** tendance en vert dur `#1E7A5A` (l.9195) — **hors DA sunset** (CLAUDE.md interdit le vert criard pour les indicateurs). États vides OK.
**Problèmes TECHNIQUES :** (a) repli « sans ville » puis re-filtrage client (l.9176) : si la RPC s33 absente, on récupère le top global puis on filtre → la ville peut sembler quasi vide alors qu'elle a des joueurs hors top-30. (b) `populateLbCities` dérive les villes des quêtes, pas des profils → des villes réelles d'utilisateurs peuvent manquer du menu.
**Options :** A) Remonter la tendance en ambre/doré (var DA). B) Lancer la migration s33 (filtre ville serveur) et retirer le repli client. C) Peupler le menu villes depuis les villes des profils publics.
**Reco : A (rapide, conformité DA) + B**.

### 2.6 Carte d'accueil — fond + lisibilité (l. 12956-13122)
**État :** ambitieux et abouti : vectoriel GPU recoloré dans 4 palettes, labels FR, watchdog repli raster (8/14 s), perf drag optimisée. Lite = raster simplifié (choix justifié : marqueurs synchros).
**Problèmes :** (a) recoloration par regex sur `ly.id` (l.13007-13048) : **fragile** — si OpenFreeMap renomme une couche, des zones repassent en couleurs par défaut hors DA. (b) Popups carte (`.mappop-mini`) : note en `#B5740E` codé en dur (l.13641) au lieu d'une var DA → pète en thème nuit. (c) Dépendance CDN tierce (openfreemap/unpkg) sans SRI ; offline réel dépend du SW.
**Options :** A) Snapshot du style recoloré servi en local (fini la dépendance + regex). B) Mapper les couleurs via les `source-layer` (stable) plutôt que `id`. C) Statu quo + remplacer les couleurs en dur des popups par des vars.
**Reco : C immédiat (popups DA) ; B à terme**.

### 2.7 Marqueurs, clusters, popups (l. 13483-13800)
**État :** 6 calques, cluster unique colorisé par type dominant (contraste AA via voile noir 26 %), gestion fine co-localisés (≤6 rosace, >6 liste). Popups riches et actionnables (check-in, avis, profil, chat).
**Problèmes :** (a) `recentCks.slice(0,25)` + activités `.limit(50)` : sur une grande ville, marqueurs tronqués silencieusement (pas de « +N de plus »). (b) Mates démo placés à des lieux déterministes : crédible mais peut induire en erreur (un vrai utilisateur croit voir des gens présents). (c) `setInterval` rebuild 2,5 min (l.14274) : OK, mais combiné au rebuild sur chaque check-in/filtre = beaucoup de teardown.
**Options :** A) Afficher un compteur « +N non montrés » quand tronqué. B) Marquer plus visiblement les démos (l'étiquette « 🤖 démo » est dans le popup, pas sur la pastille). C) Statu quo.
**Reco : B** (transparence : pastille démo distincte).

### 2.8 Calques / feuille de filtres `openLayersSheet` (l. 14182-14208)
**État :** feuille bottom-sheet propre, compteurs par calque, carnet d'adresses en tête. Chips legacy `#homeMapFilters` cachés mais pilotent toujours (double source de vérité → cohérent mais fragile).
**Problèmes :** clic d'une ligne re-`click()` le chip caché (l.14200) — indirection inutile. Pas d'état « tout afficher/masquer ».
**Reco :** ajouter un bouton « Tout/Rien » ; à terme supprimer les chips cachés et piloter `homeLayerOn` directement.

### 2.9 Geofencing `checkGeofences` (l. 15826-15847)
**État :** propre — rayon 250 m, hystérésis sortie 450 m (anti-clignotement), cooldown 2 h persisté, notif `low` cliquable → cadre la quête. `watchPosition` low-accuracy, coupé en arrière-plan.
**Problèmes :** ne déclenche **que** sur les quêtes (`_questGeoList`), pas sur les **lieux sûrs** → on n'est jamais notifié « tu es près d'un lieu où checker ». Démarrage différé 6 s + dépend de permission déjà accordée (pas de prompt proactif).
**Options :** A) Étendre le geofencing aux lieux sûrs (notif « checke ici ✅ »). B) Garder quêtes seules. C) A + réglage on/off dédié.
**Reco : A** (relie geofencing ↔ check-in, cœur produit) avec opt-in clair.

### 2.10 Plein écran (l. 14269-14272)
**État :** toggle CSS `.fs` + Échap + ResizeObserver resync ; bien pensé.
**Problème :** pas de piège de focus / `aria` sur l'overlay plein écran (a11y).
**Reco :** rôle dialog + focus trap léger.

### 2.11 Mode Lite (sunmates-lite.css l. 277-620)
**État :** raster non-rétina, `updateWhenIdle`, hauteur carte 400 px, chips/badges neutralisés, ouverture directe des clusters (l.13834). Choix cohérents et scopés `body.sm-lite`.
**Problème :** la carte Lite perd la DA sunset (raster CARTO neutre) → rupture d'identité visuelle entre Lite et complet.
**Reco :** acceptable pour le MVP ; documenter que Lite = carte neutre assumée.

---

## 3. BUGS PRIORISÉS

| Prio | Bug | Ligne | Détail |
|---|---|---|---|
| **P1** | Check-in **non limité** alors que l'UI promet « 1/jour gratuit » | RPC session2.sql 263-288 ; UI 2181 | Aucun cooldown/quota/anti-doublon → farmable, +10 trust à volonté, contredit l'anti-triche CLAUDE.md. Corriger RPC **ou** texte. |
| **P1** | Avis sans check-in préalable | 7680-7682 | N'importe qui note n'importe quel lieu → fausse le tri « Top notés » et le segment classement. |
| **P2** | Vert hors-DA dans le classement (tendance) | 9195 (`#1E7A5A`) | Indicateur vert criard interdit par la DA sunset → passer en ambre/doré. |
| **P2** | Couleur de note codée en dur dans les popups carte | 13641 (`#B5740E`) | Illisible/incohérent en thème nuit → var DA. |
| **P2** | Comptage check-ins client sans `.limit` | 7449 | `select("cafe_id")` sur toute la table → scalabilité + fuite volume ; passer en RPC agrégée. |
| **P2** | Image Gold via Flickr (déprécié) | 7574 (`flickrImg`) | Carte Gold souvent cassée ; utiliser image locale. |
| **P2** | Marqueurs carte tronqués silencieusement | 13664 (`slice(0,25)`), 13566 (`.limit(50)`) | Pas d'indicateur « +N » → l'utilisateur croit tout voir. |
| **P3** | Geofencing ignore les lieux sûrs | 15829 | Manque la notif « checke ici » alors que c'est le cœur produit. |
| **P3** | Tri `name` mort (aucune tuile) | 7569 | Code inatteignable. |
| **P3** | Menu villes classement basé sur quêtes, pas profils | 9244 | Villes d'utilisateurs réels absentes du filtre. |
| **P3** | Plein écran sans focus-trap/aria | 14269 | a11y. |

---

## 4. SYNTHÈSE
Périmètre globalement **mûr et soigné** (carte ambitieuse, feedback check-in exemplaire, classement RGPD-friendly). Deux **failles d'intégrité du jeu** dominent : check-in farmable (P1) et avis non vérifiés (P1), toutes deux côté règles métier/RPC, pas UI. Reste un nettoyage DA (verts/couleurs en dur), de la scalabilité (comptages client) et une opportunité produit forte : **brancher le geofencing sur les lieux sûrs** pour boucler geo-trigger ↔ check-in. Tous les chemins confirment : actions = utilisateur connecté uniquement (RPC `auth.uid()`).
