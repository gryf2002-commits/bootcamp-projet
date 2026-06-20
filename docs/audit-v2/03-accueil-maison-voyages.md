# Audit A→Z · Accueil MODE MAISON + MES VOYAGES

Duo product-designer + frontend-eng. Source lue : `preview.html`, `styles.css`, `sunmates-lite.css` (20/06).
Rappel transverse : **tout appel `db.rpc()` / `db.from()` exige un user connecté** (RLS). Les fallbacks localStorage masquent souvent l'échec → l'utilisateur croit que c'est sauvé alors que rien ne part en base.

---

## 1. INVENTAIRE

| Élément | Rôle | Ligne(s) HTML | JS / liens |
|---|---|---|---|
| `#homeModeSwitch` | Bascule Voyage/Maison (2 boutons) | 1843-1847 | `setHomeMode` 6576, listeners 6917, easter eggs 16721/16760 |
| `#homeHomeMode` | Conteneur mode Maison | 1869 | `show()` dans `setHomeMode` 6580 |
| `.hm-hero` / `#hmHomeCity` | Bandeau « De retour chez toi » + ville cliquable | 1870-1874 | clic→change ville (RPC `profiles.update`) 16351 |
| `#soloProgress` | Stats solo (défis/rituels/XP/streak/jauge) | 1877-1891 | `renderSoloProgress` 15990 ; stats cliquables 16294 ; sp-next 16364 |
| `#homeMates` (`.hm-souv`) | Souvenirs + Mates + galerie + album | 1920-1927 (`display:none`) | `renderHomeMates` 16127 ; `openSouvGallery` 16163 ; album local `_souvGet` |
| `#soloChallenges` | Défis solo de la ville + reroll | 1929-1933 `data-beta` | `renderSoloChallenges` 16005 ; `completeSolo` 16018 ; reroll 16257 |
| `#proofModal` | Modale preuve (note) défi/quête | 1941-1949 | submit 16306 → `grantSoloXp` (RPC) |
| `#soloRituals` | Rituels du jour + custom + tout-cocher | 1935-1938 `data-beta` | `renderRituals` 16069 ; `editCustomRitual` 16033 ; `completeAllRituals` 16091 |
| `#hmInspo` | Inspiration du jour (carrousel) | 1952 | `renderInspo` 6659 ; `_inspoFiche` 6639 ; `HM_INSPO` 6611 |
| `.hm-plan` (préparer voyage) | `<details>` repliable | 1955-1967 | `renderNextTrip` 6711, `renderTripPrep` 6863, `renderWishlist` 6680, `renderTripsDone` 6900 |
| `#tripPrepCard` | Checklist préparatifs + fiche pays | 1959 | `renderTripPrep` 6863 ; `COUNTRY_TIPS` 6746 ; `COUNTRY_LORE` 6806 |
| wishlist `#wishlistCard` | Envies d'ailleurs (local 30 max) | 1962 | `renderWishlist` 6680 |
| `#visitorsList` | Voyageurs de passage | 1972 | `renderVisitors` 6694 |
| Devenir hôte `#hostBtn` | `<details>` recrutement hôte | 1975-1990 | `renderHost` 6953, `hostState` 6920, `syncHostRequest` 6930 (RPC `profiles.update host_status`) |
| `#spotCard` | Spot du jour (24h) — **onglet LIEUX, pas Accueil** | 2130-2154 | rendu ailleurs ; ouvert via `data-goto` 18095 |
| MES VOYAGES (section) | titre + Ajouter | 2099 | `renderTrips` 5670 ; `openAddTrip` 5851 |
| `#globeOpenBtn` / `#globeOverlay` | Globe 3D (globe.gl lazy) | 2100 ; overlay 1272-1288 | `openGlobe` 6216 ; beta-only ; Lite masqué 563 |
| `#wrappedOpenBtn` / `#wrappedOverlay` | « Mon année » (stories) | 2101 ; overlay 1291-1297 | `open()` 6497 ; beta-only ; Lite masqué 564 |
| `#tripPassport` | Stats passeport (cosmétique) | 2104 | `_renderTripPassport` 5754 ; Lite masqué 566 |
| `#tripViewToggle` / `#tripTimeline` | Bascule Cartes/Frise | 2105-2109 | `_setTripView` 5839, `_renderTripTimeline` 5773 ; Lite masqué 565/567 |
| `#myTrips` / `#tripAddLink` | Liste voyages + matching | 2110 ; 2099 | `renderTrips` 5670 ; RPC `overlapping_travelers` 5669 |

---

## 2. ANALYSE PAR ÉLÉMENT

### 2.1 — Bascule Voyage/Maison (`#homeModeSwitch`, `setHomeMode`)
**État** : 2 boutons segmentés, persistance `localStorage sm_home_mode` (défaut `travel`). Au boot on force toujours `travel` (l.7169) — donc la préférence n'est jamais respectée au démarrage.
**Problèmes**
- TECH (P1) : `setHomeMode('travel', false)` au boot écrase le choix de l'utilisateur ; quelqu'un qui vit en mode Maison repasse en Voyage à chaque ouverture. La persistance est donc factice.
- TECH (P2) : `renderTrips`/Mes voyages vivent **dans le bloc `#homeTravelMap`** (mode Voyage). En mode Maison, « Mes voyages », le globe et le Wrapped **disparaissent** ; or préparer/voir ses voyages est exactement le besoin du mode Maison. Incohérence d'IA.
- VISUEL (P2) : la bascule ressemble à un filtre de recherche (placée juste au-dessus de `.search`), pas à un changement de contexte majeur. Rien n'annonce que c'est LE switch structurant de l'app.
- UX : `#homeSubtitle` change de texte mais le `<h1>` reste « Bonjour » — la transition d'univers est peu lisible.

**Options**
- A) Respecter la persistance : au boot `setHomeMode(getHomeMode())` au lieu de forcer `travel` ; garder un override geo (si en voyage détecté → proposer Voyage).
- B) Rendre la bascule un vrai sélecteur d'univers : gros toggle pleine largeur sous le hello, fond qui change de teinte (sunset = voyage, crème = maison), micro-transition.
- C) Fusionner : un seul accueil adaptatif piloté par le geo-trigger (cf. direction produit 19/06), la bascule devient un override manuel discret.

**Reco : A (bug) + B (clarté).** A est non négociable (la préférence est cassée). B aligne avec « l'app s'adapte au lieu ».

### 2.2 — Progression solo (`#soloProgress`, `renderSoloProgress`)
**État** : 3 stats (Défis/Rituels/XP) cliquables (popInfo, sans redirect), streak, mini-jauge niveau. Données : `myProfile.xp`, total local `sm_solo_total_*`, rituels via `_soloState`.
**Problèmes**
- TECH (P1) : « Défis relevés » lit `localStorage sm_solo_total_*` — **purement local**, jamais resynchronisé du serveur (`user_solo_log` ne réécrit que `s.ch`, pas le compteur total). Changement d'appareil → compteur à 0 alors que des défis sont faits.
- TECH (P2) : streak lu de `sm_streak_*` ; aucune incrémentation visible ici (dépend d'un autre module). Risque d'affichage figé à `1`.
- VISUEL (P2) : `.sp-track` background `rgba(120,40,10,.14)` (brun) en clair → hors DA sunset, vire au « boueux » ; le dusk a son override mais le clair non.
- UX : la jauge solo duplique le niveau de l'onglet Jeux (le commentaire l'admet) ; risque de chiffres divergents entre les deux écrans.

**Options**
- A) Source de vérité serveur : compter `user_solo_log` (déjà chargé dans `renderSoloHome`) au lieu du total local.
- B) Garder local mais l'afficher honnêtement (« sur cet appareil ») — moindre effort, moins satisfaisant.
- C) Supprimer la jauge de niveau ici (anti-doublon Jeux) et ne garder que les 3 métriques solo du jour.

**Reco : A + C.** Fiabilité + suppression du doublon.

### 2.3 — Défis solo (`#soloChallenges` + reroll)
**État** : grille de défis piochés (`_soloPick(seed)`), validation via modale preuve → `grantSoloXp` (RPC `user_solo_log` / repli `profiles.update xp`). Reroll = `seed++`. `data-beta` → masqué en Lite (`betaOn()` garde aussi `renderSoloChallenges`).
**Problèmes**
- TECH (P1) : `grantSoloXp` repli écrit `profiles.update({xp})` **côté client** — farmable (l'anti-triche serveur est contourné si la RPC manque). Cohérence avec la règle « XP via RPC anti-farm » à vérifier.
- TECH (P2) : reroll incrémente le seed à l'infini sans borne d'historique → l'utilisateur peut « mélanger » jusqu'à retomber sur des défis faciles ; pas de limite/jour.
- VISUEL : `.sc-card is-done` — vérifier que l'état fait n'est pas en vert criard (DA). (non confirmé dans le CSS lu)
- UX (P2) : « confirme sur l'honneur » sans photo (le commentaire dit anti-triche photo mais le code ne demande qu'une note optionnelle l.1945) → écart code/intention, anti-triche faible.

**Options**
- A) Tout passer par RPC stricte, retirer le repli `profiles.update xp` (ou le borner sévèrement).
- B) Borner le reroll (1-2/jour) + animation de tirage pour que ça reste un plaisir.
- C) Assumer le low-friction : pas de preuve, mais XP cosmétique uniquement (déjà le cas) → clarifier dans la copy.

**Reco : A + B.**

### 2.4 — Rituels (`#soloRituals` + custom)
**État** : 3 rituels par défaut + 1 custom (local `sm_custom_rit_*`), « tout cocher », suggestions 1-tap, popInfo d'édition. Solide UX (états vides chaleureux, anti-page-blanche).
**Problèmes**
- TECH (P2) : custom 100% local → perdu au changement d'appareil ; le compteur `spRit` mélange défaut serveur + custom local.
- A11Y (P2) : édition via `popInfo` avec `setTimeout(50)` pour câbler les boutons → fragile (si le DOM tarde, listeners perdus) ; pas de focus trap annoncé.
- VISUEL : OK globalement, cohérent avec la DA.

**Options**
- A) Persister le rituel custom en base (colonne profil ou table) pour le cross-device.
- B) Garder local mais migrer le câblage de `setTimeout` vers un rendu synchrone (innerHTML puis querySelector immédiat dans la même frame).
- C) Laisser tel quel (rituel = engagement quotidien, l'appareil principal suffit).

**Reco : B (robustesse) ; A si budget.**

### 2.5 — Inspiration du jour (`#hmInspo`, `renderInspo`)
**État** : carrousel ‹ ›, destination du jour calculée par jour de l'année, fiche détaillée (`_inspoFiche`), ajout wishlist. `HM_INSPO` riche (26 destinations).
**Problèmes**
- VISUEL (P2) : c'est une **carte plate** au milieu du flux Maison ; le potentiel « porte d'entrée rêve » n'est pas exploité (pas d'image, juste emoji drapeau). Gros candidat à un visuel fort.
- TECH (P3) : `_inspoOff` non persistant (volontaire) ; OK.
- UX : bon (1-tap wishlist, feedback « déjà dans tes envies »).

**Options**
- A) Carte hero immersive : photo de destination (lazy), drapeau en overlay, CTA « Ajouter à mes envies » — la pièce maîtresse émotionnelle du mode Maison.
- B) Garder texte mais ajouter dégradé sunset par destination + grande typo ville.
- C) Statu quo (sobre).

**Reco : A.** Audacieux : c'est le seul moment « évasion » du mode Maison, il mérite une image.

### 2.6 — Préparer voyage (`.hm-plan`, `#tripPrepCard`, wishlist)
**État** : `<details>` replié ; prochain voyage (compte à rebours local `sm_next_trip`), checklist `TRIP_PREP` + fiche pays détectée, wishlist, voyages archivés. Très complet.
**Problèmes**
- TECH (P1) : **double système de voyages incohérent.** Ici tout est local (`sm_next_trip`, `sm_trips_done`) ; la section « Mes voyages » plus bas est en **base Supabase** (`trips`). Un voyage planifié en Maison **n'apparaît pas** dans Mes voyages / globe / passeport, et inversement. Confusion majeure.
- VISUEL (P2) : empilement de `<details>`/sous-titres dans un `<details>` → cartes-dans-cartes, hiérarchie confuse.
- UX : « Mon voyage commence → mode Voyage » est malin, mais l'archivage local ne nourrit pas le passeport serveur.

**Options**
- A) Unifier sur la table `trips` : « prochain voyage » = le 1er `trip` à venir ; supprimer le silo local. Un seul modèle de voyage dans toute l'app.
- B) Garder le local comme « brouillon » mais proposer « Enregistrer dans mes voyages » qui pousse vers `trips`.
- C) Statu quo (mais le bug d'incohérence reste).

**Reco : A.** C'est la dette structurelle la plus coûteuse de cette zone.

### 2.7 — Devenir hôte (`#hostBtn`, `renderHost`)
**État** : `<details>` replié, machine d'états `none/pending/rejected/approved` via `profiles.host_status` + repli local, auto-réparation (`syncHostRequest`), annulation/retrait possibles. Bien pensé.
**Problèmes**
- TECH (P2) : double écriture redondante de `host_status:'pending'` (l.7010 ET 7016/7020) + set local optimiste avant confirmation serveur → si l'UPDATE échoue mais que le local reste, l'auto-réparation re-tente (best effort, mais bruyant).
- TECH (P2) : `hostState()` priorise `myProfile.host_status` puis local — si la migration `host_status` n'existe pas, `myProfile.host_status` est `undefined` et tout repose sur le local (admin ne voit rien). Dépend d'une migration non garantie.
- VISUEL : sobre, cohérent (replié par défaut = bon choix anti-surcharge).

**Options**
- A) Une seule écriture serveur, set local uniquement après succès ; toast d'échec explicite (déjà partiellement fait).
- B) Détecter l'absence de colonne `host_status` et désactiver proprement la demande (au lieu de faire croire que c'est parti).
- C) Statu quo (machine d'états fonctionnelle).

**Reco : A + B.**

### 2.8 — HomeMates / souvenirs (`#homeMates`, album)
**État** : récap chips (Mates/villes/quêtes/check-ins), « Mate du jour » (chat 1-tap), galerie repliable lazy-load, album souvenir par ville (note locale `sm_souv_*`). Masqué si rien à montrer (bon).
**Problèmes**
- TECH (P2) : dépend de variables globales (`connectedIds`, `travelerMap`, `myQuestRows`, `allQuests`) via `typeof` — si l'ordre de chargement varie, récap vide silencieusement.
- TECH (P3) : `_dayIdx` utilisé sans garde claire pour « Mate du jour ».
- VISUEL : dense mais correct ; la galerie en feuille est un bon pattern anti-surcharge.

**Options** : A) garde-fous explicites + re-render quand les données arrivent. B) statu quo. C) fusionner avec passeport voyages (un seul « bilan »).
**Reco : A.**

### 2.9 — Spot du jour (`#spotCard`)
**État** : `<details>` dans **l'onglet LIEUX** (pas Accueil), 3 étapes (emoji/idée 1-tap/publier), visible 24h. En Lite seul le radius change (l.282).
**Problèmes**
- IA (P2) : conceptuellement « partager où je traîne aujourd'hui » est un acte d'accueil/rencontre → serait plus logique en Accueil mode Voyage qu'enfoui dans Lieux. Découverte faible.
- VISUEL : `<details>` qui se confond avec les autres cartes de Lieux.

**Options** : A) remonter un raccourci Spot dans l'accueil Voyage (la carte). B) garder dans Lieux mais en tête, plus visible. C) statu quo.
**Reco : A** (cohérent avec « l'accueil = rencontre d'abord »).

### 2.10 — MES VOYAGES : globe 3D (`#globeOverlay`, `openGlobe`)
**État** : overlay plein écran, lazy-load globe.gl, 4 modes (points/arcs/heat/pays), état vide chaleureux, destruction WebGL propre, Escape/clic-dehors. Beta-only + Lite masqué. Travail soigné.
**Problèmes**
- TECH (P2) : `loadMyTrips` (RPC `trips`) requiert connexion ; hors-ligne → état « besoin d'une connexion » OK, mais le bouton reste visible et cliquable pour un user non connecté (déconnecté → silence).
- PERF (P3) : globe.gl est lourd ; OK car lazy + cas vide évité.
- VISUEL : fort, premium. Bon point de l'app.

**Options** : A) masquer/désactiver le bouton si non connecté ou 0 voyage. B) garder (état vide gère). C) précharger la lib en idle.
**Reco : A** (cohérence avec passeport/wrapped).

### 2.11 — Wrapped (`#wrappedOverlay`, `open()`)
**État** : stories animées plein écran, prev/next, clavier, partage image/texte, `track('wrapped_open')`. Beta-only, Lite masqué. Garde connexion (toast si non connecté).
**Problèmes**
- TECH (P3) : `keydown` global écoute toujours (early-return si overlay caché) → OK mais un listener perpétuel de plus.
- UX (P2) : bouton visible même sans données → ouvre un Wrapped quasi vide en début de vie. Pas d'invitation « reviens en fin d'année ».
- VISUEL : premium, cohérent.

**Options** : A) masquer si < N voyages/activités. B) slide d'accueil « ton année se construit ». C) statu quo.
**Reco : A ou B.**

### 2.12 — Passeport / frise (`#tripPassport`, `tripViewToggle`, timeline)
**État** : stats cosmétiques (voyages/villes/pays/série années consécutives), bascule Cartes/Frise, frise chronologique avec marqueur « aujourd'hui », IntersectionObserver, prefers-reduced-motion respecté, clic frise→surligne carte. Très bon.
**Problèmes**
- TECH (P2) : `_tripYearStreak` = années consécutives jusqu'à l'année courante ; un user sans voyage cette année voit sa série tomber (peut frustrer). Choix produit à assumer.
- TECH (P3) : `CSS.escape` utilisé (l.5813) → OK navigateurs récents.
- VISUEL : cohérent ; la frise est un beau moment.

**Options** : A) série = max consécutif historique (moins punitif). B) garder (incite à voyager chaque année). C) renommer « Série » → « Années d'aventure ».
**Reco : C** (clarté) ; A optionnel.

### 2.13 — Ajout de voyage (`openAddTrip`, `renderTrips`, matching)
**État** : popInfo formulaire (ville/dates), `addTrip` (insert `trips`), matching via RPC `overlapping_travelers`, séparation à venir/passés, cartes mates compatibles, suppression confirmée. Riche.
**Problèmes**
- TECH (P1) : si table `trips` absente → `loadMyTrips` renvoie `null`, message « arrivent très vite » : OK, mais le globe/passeport/wrapped reposent dessus → toute la zone « voyages » dépend d'une migration (`supabase_migration_trips.sql`) non garantie.
- TECH (P2) : géocodage Nominatim (l.5660) sans clé/contact requis par leur policy d'usage + 1 req/ajout → risque de rate-limit/blocage en volume.
- UX (P2) : doublon avec « prochain voyage » local (cf. 2.6) — l'utilisateur ne sait pas où ajouter.

**Options** : A) unifier avec le prochain voyage local (cf. 2.6-A). B) cacher la géoloc derrière un bouton optionnel. C) statu quo.
**Reco : A.**

---

## 3. BUGS — P0 / P1 / P2

### P0
- Aucun crash bloquant isolé dans cette zone (bonne défense `typeof`/try-catch partout). Le risque P0 réel = **dépendance à des migrations Supabase** (`trips`, `user_solo_log`, `host_status`) : si non lancées, voyages/défis/hôte tombent en repli local silencieux. → vérifier l'état réel de la base avant lancement.

### P1
1. **Persistance bascule cassée** — `setHomeMode('travel', false)` au boot (l.7169) ignore `getHomeMode()`. Préférence Maison jamais respectée.
2. **Double modèle de voyages incohérent** — « prochain voyage »/archivés en local (`sm_next_trip`/`sm_trips_done`, l.6711/6899) vs « Mes voyages » en base `trips` (l.5666). Globe/passeport/wrapped ignorent le local. (l.6711, 5666)
3. **« Défis relevés » non cross-device** — compteur lu de `sm_solo_total_*` local, jamais resync de `user_solo_log` (l.15993). 0 sur un nouvel appareil.
4. **XP solo farmable en repli** — `grantSoloXp` fallback `profiles.update({xp})` côté client (l.15987) contourne l'anti-triche RPC.
5. **Anti-triche défi sans preuve** — modale annoncée « photo preuve » mais ne demande qu'une note optionnelle (l.1945/16016).

### P2
6. « Mes voyages »/globe/wrapped invisibles en mode Maison alors que c'est le contexte naturel (bloc dans `#homeTravelMap`, l.1994/2098).
7. `.sp-track` fond brun `rgba(120,40,10,.14)` hors DA en thème clair (l.1896).
8. Reroll défis non borné (seed infini, pas de limite/jour) (l.16257).
9. Hôte : double écriture `host_status:'pending'` + set local optimiste avant confirmation (l.7010-7020) ; dépend de la migration `host_status`.
10. Rituel custom + album souvenir + checklist préparatifs = tout local, perdu au changement d'appareil (l.16031, 16247, 6861).
11. Boutons globe/wrapped cliquables sans connexion / sans données → expérience vide (l.6216/6497).
12. Spot du jour enfoui dans Lieux alors qu'il relève de l'accueil/rencontre (l.2130).
13. Édition rituel/souvenir/hôte câblée via `setTimeout(40-50ms)` après `popInfo` → listeners fragiles (l.16045, 16241, 6977).
14. Nominatim appelé à chaque ajout de voyage sans garde anti rate-limit (l.5660).

### P3
15. `_tripYearStreak` punitif (série retombe si pas de voyage l'année en cours) (l.5743).
16. `keydown` globaux permanents (globe + wrapped) (l.6521).
17. Dépendances globales `typeof` dans HomeMates → récap vide si ordre de chargement change (l.16129).

---

## RECOS PRIORITAIRES (synthèse)
1. **Unifier le modèle de voyages** sur la table `trips` (supprimer le silo local) — résout P1#2, P2#6, P2#10(partiel), P2#14. Plus gros gain de cohérence.
2. **Réparer la persistance de la bascule** + en faire un vrai switch d'univers visuel (P1#1).
3. **Fiabiliser l'XP/défis solo** : compteur serveur + RPC stricte (P1#3/#4/#5).
4. **Transformer `#hmInspo` en carte hero immersive** (seul moment d'évasion du mode Maison) — pari design audacieux à fort ROI émotionnel.
5. Masquer globe/wrapped/passeport quand vides ou non connecté (cohérence déjà appliquée en Lite).
