# Audit A→Z — Accueil MODE VOYAGE

Cible : `preview.html` (+ `styles.css` + `sunmates-lite.css`). Lecture du code réel.
Périmètre : onglet `accueil`, mode **Voyage** (`#homeTravelMap` visible, `#homeHomeMode` masqué).
Rappel archi : la prod = `app.html`, on bosse dans `preview.html` puis `cp preview→app`.

> ⚠️ Découverte structurelle clé : `#homeTravelMap` n'ouvre qu'à la **l.1994**. Donc le
> **header, le geo-trigger, la bascule Voyage/Maison, la recherche + scopes** sont tous
> **HORS** de `#homeTravelMap` → ils s'affichent **dans les deux modes**. Seuls la carte,
> le fil et les tuiles accès-rapides sont propres au mode Voyage.

---

## 1. INVENTAIRE

| Élément | Rôle | Ligne HTML | CSS | JS lié |
|---|---|---|---|---|
| `.topbar` | header collant (logo + wordmark + 🔔/💬/🛟) | 1795-1815 | styles.css 115-141, 2286-2288, 2633-2634, 3826-3840 ; preview 487-502 | — |
| `.brand` / `.mark` | logo soleil (6 variantes saison) + « SunMates » | 1796-1805 | styles.css 129-141, 2887, 3114-3134 | easter-egg saisons |
| `.topbar-actions#userBox` | 🛟 (Lite) + 🔔 + 💬 | 1806-1814 | preview 489-499 ; styles 2633-2634 | listeners goToTab/notif/msg |
| `#homeHello` + `.hello-row` | salut + sous-titre + ☕ Dispo + 🔥 série | 1823-1828 | — | setHomeMode (sous-titre) |
| `#geoNowCard` | geo-trigger « Ici, maintenant » | 1833 (inline styles) | preview 503-516 | `renderGeoNow` 14013, `_geoIdeaGo` 13994, `_ruleSuggest` 13985, `aiSuggest` 13969 |
| `#geoPrompt` | invite douce à activer la position | 1835-1840 | inline | `maybeShowGeoBanner` 14042 |
| `#homeModeSwitch` | bascule Voyage / Maison | 1843-1847 | styles 2403-2408 | `setHomeMode` 6576, listener 6917 |
| `.search` + `#homeSearch` | champ de recherche | 1849-1852 | styles 730-732, 657-665 | `renderSearch` 12904, input debounce 12941 |
| `#searchScopes` | chips Tout/Voyageurs/Lieux/Vérifiés | 1853-1858 | styles 2007-2011 | `_syncSearchScopes` 12943, scope click 12949 |
| `#searchResults` | sortie recherche | 1859 | `.sresult` | rempli par renderSearch |
| `#homeTravelMap` (ouvre) | conteneur mode Voyage | 1994 | — | setHomeMode show/hide |
| `.homemap-card` | carte vivante (ville + filtres + Leaflet/GL + outils) | 2000-2054 | styles 959-1094, 1033-1065, 1766-1770 | toggleHomeFull 13871, focusHomeMapOn |
| `.section-head Le fil` + `#feedComposer` + `#homeFeed` | fil communautaire + composer | 2066-2096 | `.feed-composer` | `renderFeed` 15293, post 15448 |
| `Mes voyages` + globe/wrapped | bloc voyages (Lite masque globe/wrapped/frise) | 2098-2110 | preview 560-567 | renderTrips |
| `Accès rapides` `.grid2 .tile` | 8 raccourcis | 2112-2120+ | styles 1200-1230, 2139-2150 ; preview 569-581 | data-goto → goToTab |

---

## 2. ANALYSE PAR ÉLÉMENT

### 2.1 HEADER — logo flush gauche / boutons flush droite (demande répétée de Maxime)

**État.** `.topbar { display:flex; justify-content:space-between; padding: …1.25rem }` (styles 116-118).
Le logo EST à gauche, les boutons à droite — *en apparence c'est déjà bon*. Le vrai grief
de Maxime (« collé tout à gauche / tout à droite sur la largeur du tel ») = **le padding
latéral de 1.25rem (~20px)**. Le logo n'est pas *flush* au bord, ni les boutons : il y a une
marge des deux côtés. Visuellement le logo « flotte » à 20px du bord, pas « collé ».

**Problèmes.**
- **TECHNIQUE (P1)** : la demande « flush » n'a jamais été traitée parce qu'elle a été lue
  comme un problème d'alignement (déjà OK via space-between) et non comme **réduire/retirer le
  padding horizontal de la topbar**. Le padding 1.25rem est l'unique coupable.
- **TECHNIQUE (P1) — pavé flou** : `backdrop-filter: blur(7px) saturate(1.08)` (styles 3831,
  `!important`) + `mask-image` dégradé bas. Sur la largeur pleine d'un téléphone, ça crée la
  « dalle floue » qui se voit aux changements jour/nuit et au scroll. `backdrop-filter`
  repeint **à chaque frame** sous une barre `position:sticky` → coût GPU + artefact de bord
  malgré le masque. Le commentaire l.2286-2288 dit explicitement « pas de backdrop-filter sur
  les barres fixes » … puis l.3830 en remet un en `!important`. **Contradiction interne.**
- **VISUEL (P2)** : `.brand` a `overflow:hidden` + `flex:0 1 auto` ; à <360px le wordmark se
  fait ellipser (« SunM… ») avant les boutons. Acceptable mais peu élégant.
- **VISUEL (P2)** : 3 boutons icônes côté droit (🛟 visible en Lite seulement, 🔔, 💬) à 36-38px
  serrés (gap .15rem <380px). Cibles tactiles limites WCAG (min 38px ok, mais gap trop faible).

**Options.**
- **A — Flush minimal (reco).** `padding-inline: env(safe-area-inset-left, 0) + .6rem` au lieu
  de 1.25rem ; logo collé à ~10px du vrai bord, boutons idem à droite. Garder `space-between`.
  Sur encoche, respecter `safe-area-inset`. Simple, répond mot pour mot à Maxime.
- **B — Flush total + halo.** padding latéral = `env(safe-area-inset-*)` pur (0 sinon) → logo
  vraiment au bord ; compenser le wordmark par une marge interne `.brand{padding-left:.4rem}`.
  Plus audacieux, look « app native ».
- **C — Retirer le backdrop-filter, garder le dégradé opaque.** Supprimer l.3830-3837 et
  revenir au fond `linear-gradient(var(--bg) 62%, transparent)` (déjà présent l.124/2288).
  Résout le « pavé flou » sans toucher l'alignement.

**Reco : A + C ensemble.** Padding latéral réduit (flush) ET suppression du backdrop-filter
(fini la dalle floue). Deux lignes, deux griefs réglés. Le dégradé opaque suffit pour la
lisibilité de la status-bar.

---

### 2.2 GEO-TRIGGER « Ici, maintenant » (`#geoNowCard`) — « n'active rien »

**État.** `renderGeoNow()` (14013) : ne s'exécute **que si la permission géo est déjà
`granted`** (l.14018 `if (st.state !== "granted") return;`). Sinon la carte reste `hidden`.
Quand elle s'affiche : titre `📍 quartier · moment · météo` + 3 chips `.geo-idea` issues de
`aiSuggest()` (Edge Function `suggest`, **en pause budget** → renvoie null) ou de `_ruleSuggest()`
(règles locales selon l'heure). Chaque chip est **bien câblée** à `_geoIdeaGo()` (14035) qui
route vers Jeux / carte Voyage / Lieux selon des mots-clés.

**Le vrai bug du « n'active rien ».**
- **TECHNIQUE (P0)** : la carte est **invisible pour la majorité** des utilisateurs car la géo
  n'est presque jamais en `granted` au premier lancement (état `prompt`). Résultat : Maxime ne
  voit jamais la carte agir → « ça n'active rien » = *ça ne s'affiche même pas*. Le `#geoPrompt`
  (invite) est un élément SÉPARÉ ; rien ne relie « j'active » → « la carte apparaît et propose ».
- **TECHNIQUE (P1)** : si `permissions.query` indisponible (certains navigateurs/WebView), retour
  silencieux → carte jamais montrée même avec géo accordée.
- **TECHNIQUE (P2)** : `_geoIdeaGo` route « café/déjeuner/balade » vers l'onglet **Lieux**
  (changement d'onglet) — ça « agit » mais ça **quitte l'accueil** sans filtrer sur le quartier
  détecté. L'idée « Balade dans le quartier » n'ouvre pas une vraie balade : elle scrolle Lieux
  en haut. C'est ressenti comme « ne fait pas grand-chose ».
- **VISUEL (P2)** : la carte n'a pas de CTA visible « activer » quand la géo manque — elle est
  juste absente. Aucun état de repli (« active ta position pour des idées ici »).

**Options.**
- **A — Toujours afficher, agir vraiment (reco).** Afficher `#geoNowCard` **même sans géo** avec
  un état « approximatif » (ville du profil + heure) et un bouton inline « 📍 Affiner » qui
  déclenche `requestGeo()` puis `renderGeoNow()`. Les 3 idées routent vers du contenu **filtré**
  (ex. « café » → Lieux pré-filtré « café » + tri proximité), pas un simple changement d'onglet.
- **B — Fusionner geoNowCard + geoPrompt.** Une seule carte : si `prompt` → bouton Activer ;
  si `granted` → idées. Supprime la dualité qui fait qu'on voit l'un OU l'autre.
- **C — Garder tel quel mais débloquer l'IA.** Déployer l'Edge Function `suggest` → idées
  pertinentes/variées. Ne règle PAS l'invisibilité (reste gated `granted`).

**Reco : A + B.** Une carte unique, toujours présente, qui dégrade proprement (ville profil →
géo fine) et dont chaque idée ouvre du **contenu réellement filtré**. C'est le cœur de la
direction produit « geo-trigger central » (cf. mémoire 19/06).

---

### 2.3 BASCULE Voyage / Maison (`#homeModeSwitch`)

**État.** Segmented propre (styles 2403-2408), `setHomeMode` persiste en `localStorage`,
défaut `travel`. Fonctionne. Easter-egg ✈️ qui décolle (span `.tm-emo`).

**Problèmes.**
- **VISUEL (P2)** : placée **après** geoNowCard et **avant** la recherche → l'ordre de lecture
  est salut → idées géo → bascule → recherche → carte. La bascule (décision majeure de contexte)
  est noyée au milieu. Logiquement elle devrait être tout en haut (juste sous le salut) puisque
  elle change tout le reste de l'écran.
- **TECHNIQUE (P3)** : OK, rien de cassé.

**Options.** A — remonter la bascule juste sous `.hello-row` (reco). B — la transformer en pill
discret dans la `.hello-row` à droite. C — laisser, mais ajouter un liseré actif plus marqué.
**Reco : A.**

---

### 2.4 RECHERCHE (`#homeSearch` + `#searchScopes`) — « montre tout et n'importe quoi »

**État.** `renderSearch(q)` (12904) avec debounce 250ms (12941). Lieux = filtre local
`_deburr(name|city).includes(qd)` **max 5** (12913). Personnes = RPC serveur `search_profiles`
(ou `ilike %q%`) **max 8** (12920-12922). Scope `verified` filtre `is_verified` après coup.

**Le vrai grief de Maxime (« n'importe quoi quand on tape une lettre »).**
- **TECHNIQUE (P1)** : **aucun seuil de longueur minimale**. Taper **1 lettre** lance la
  recherche. « a » matche `includes("a")` → quasi tous les lieux (capés à 5 mais arbitraires)
  + un `ilike '%a%'` serveur qui ramène 8 pseudos contenant « a » → impression de « bruit
  aléatoire ». C'est EXACTEMENT le ressenti rapporté.
- **TECHNIQUE (P1)** : matching `includes` = **sous-chaîne brute, non classée**. « par » matche
  « **Par**is », « com**par**er », « dé**par**t »… sans scoring (préfixe > milieu, exact > partiel).
  Pertinence faible.
- **TECHNIQUE (P2)** : pas d'annulation de requête réseau en vol → en frappe rapide, des réponses
  RPC tardives peuvent **écraser** une recherche plus récente (race / résultats périmés).
- **TECHNIQUE (P2)** : l'ordre d'affichage met **Voyageurs avant Lieux** (12931-12933) alors que
  le produit « sécurité/lieux sûrs » voudrait souvent l'inverse selon le scope.
- **VISUEL (P2)** : les scopes n'apparaissent que `.live` (focus/saisie) — bien — mais aucun
  compteur de résultats ni indication « tape au moins 2 lettres ».

**Options.**
- **A — Vraie recherche (reco).** (1) **min 2 caractères** avant tout render (`if (q.length<2)`).
  (2) Debounce 200ms + **AbortController** sur le RPC. (3) **Scoring** : préfixe (`startsWith`) =
  poids fort, mot entier = moyen, sous-chaîne = faible ; trier par score puis distance/ville.
  (4) Limiter à 6 résultats max **après tri**. (5) Ordre piloté par le scope actif.
- **B — Recherche serveur unifiée.** Une RPC unique `search_all(q)` qui renvoie lieux+personnes
  déjà classés côté SQL (unaccent + rank). Plus propre, moins de logique front.
- **C — Patch minimal.** Juste le seuil 2 caractères + `startsWith` prioritaire. Règle 80% du
  « n'importe quoi » en quelques lignes.

**Reco : C maintenant, A ensuite.** Le seuil + le scoring préfixe suppriment immédiatement le
bruit ; l'AbortController et le tri par distance arrivent en V2.

---

### 2.5 CARTE D'ACCUEIL (`.homemap-card`)

**État.** Riche : sélecteur de ville, toggle « À faire », panneau Filtres (5 couches),
Leaflet+MapLibre GL recoloré DA, outils ➕/📍/🌍, plein écran 100% CSS (`.fs`), shimmer de
chargement. Solide techniquement.

**Problèmes.**
- **VISUEL (P2)** : barre `.city-pick` dense (select + « À faire » + « 🗂️ Filtres ») sur une
  ligne → serré <360px. Les chips de couches sont `display:none` (l.2007) et déportés dans un
  panneau → légende invisible : un nouvel utilisateur ne sait pas ce que sont les pastilles.
- **TECHNIQUE (P2)** : `background:#ffffff !important` (959) + `#1c1530 !important` en nuit. Les
  `!important` empêchent toute dérivation DA propre (rappel mémoire : éviter les surfaces en dur).
- **TECHNIQUE (P3)** : plein écran via `body:has(.homemap-card.fs)` (1039-1048) — `:has()` non
  supporté sur très vieux WebView → repli à vérifier.

**Options.** A — réintroduire une mini-légende inline (3 pastilles clés) sous la carte (reco).
B — fusionner « À faire » dans le panneau Filtres pour alléger la `.city-pick`. C — laisser.
**Reco : A + B.**

---

### 2.6 LE FIL (`#homeFeed` / `#feedComposer`)

**État.** Composer complet (humeur/spot/sondage, chips, compteur 0/280, avatar dynamique),
skeleton de chargement, masquable (`sm_feed_hidden`). Fonctionnel.

**Problèmes.**
- **VISUEL (P2)** : sur l'accueil Voyage, le fil arrive **après** la carte ET « Mes voyages » →
  très bas dans le scroll. Beaucoup de contenu avant d'y arriver ; le composer (action
  d'engagement) est peu visible.
- **VISUEL (P3)** : `feedChipsHint` « 👇 Touche une humeur, puis personnalise » + double hint
  visibilité (l.2093) → un peu verbeux.
- **TECHNIQUE (P3)** : `#homeFeed` toujours en DOM même masqué (ok).

**Options.** A — remonter le composer juste sous la carte, garder la liste plus bas. B — réduire
le composer à une barre « + Publier » qui s'ouvre au clic (gain de hauteur). C — laisser.
**Reco : B** (densité d'accueil + le composer plein écran est lourd visuellement).

---

### 2.7 TUILES « Accès rapides » (`.grid2 .tile`) — « centrées bizarrement »

**État.** Grille 2 colonnes (styles 1200), `.tile{text-align:center}` (1204), thumb 84px centré,
puis surcharge accueil (preview 572-581) qui force `.t-name{min-height:2.4em;display:flex;
align-items:center}` et `.t-meta{-webkit-line-clamp:2;min-height:2.3em}`.

**Le vrai « centrage bizarre ».**
- **TECHNIQUE (P1)** : `.tile` est un **bloc** (`text-align:center`), PAS un flex-column. Or la
  surcharge l.573 applique `justify-content:flex-start; gap:.12rem` → **CSS mort** (sans
  `display:flex` sur `.tile`, `justify-content`/`gap` n'ont aucun effet). L'intention « regrouper
  en haut » n'est donc jamais appliquée.
- **VISUEL (P1)** : `.t-name{min-height:2.4em; display:flex; align-items:center; justify-content:
  center}` force chaque nom à **2.4em de haut** : un titre 1 ligne (« Sécurité ») est centré
  verticalement dans une boîte de 2 lignes → **espace fantôme** au-dessus/dessous, irrégulier
  selon que le voisin a 1 ou 2 lignes. C'est ça le « centré bizarrement » : des hauteurs de
  texte qui flottent. Idem `.t-meta` min-height 2.3em.
- **VISUEL (P2)** : 8 tuiles → 4 rangées ; la dernière rangée peut être incomplète selon Lite,
  laissant une tuile orpheline non équilibrée.

**Options.**
- **A — Vrai flex-column (reco).** `.tile{display:flex; flex-direction:column; align-items:center;
  text-align:center; gap:.35rem}` → la surcharge `justify-content:flex-start` reprend du sens.
  Retirer les `min-height` sur `.t-name`/`.t-meta` (les remplacer par un `min-height` UNIQUE sur
  `.tile` pour égaliser les cartes) → fini l'espace fantôme.
- **B — Hauteur de tuile fixe + contenu top.** `.tile{min-height:178px}`, contenu aligné en haut,
  meta clampée. Cohérence parfaite quel que soit le nombre de lignes.
- **C — Patch ciblé.** Garder le bloc mais retirer `display:flex` des `.t-name`/`.t-meta` et ne
  laisser que `min-height` + line-height → supprime le flottement vertical sans refonte.

**Reco : A.** Passer `.tile` en flex-column est la correction propre ; ça réactive le CSS déjà
écrit (mort aujourd'hui) et supprime l'espace fantôme.

---

## 3. BUGS — P0 / P1 / P2

**P0**
- `renderGeoNow` gated `state==="granted"` (l.14018) → carge « Ici, maintenant » **invisible**
  pour la plupart des utilisateurs (géo en `prompt`) ⇒ ressenti « n'active rien ». **Fix : état
  de repli + bouton Activer inline.**

**P1**
- Header **padding latéral 1.25rem** (styles.css l.118) = logo/boutons **non flush** → grief
  répété de Maxime jamais traité.
- Header **backdrop-filter blur(7px)** (styles.css l.3831 `!important`) = « pavé flou », en
  contradiction explicite avec le commentaire l.2286-2288.
- Recherche **sans seuil de longueur** (l.12905-12908) : 1 lettre lance `includes`/`ilike %a%`
  → « montre tout et n'importe quoi ».
- Recherche **sans scoring/pertinence** (l.12913, 12922) : sous-chaîne brute non classée.
- Tuiles : `justify-content:flex-start; gap` sur `.tile` non-flex (preview l.573) = **CSS mort**.
- Tuiles : `.t-name`/`.t-meta` `min-height` + flex centré (preview l.574-580) = **espace fantôme
  vertical** = le « centré bizarrement ».

**P2**
- Recherche : pas d'AbortController → **résultats périmés** possibles en frappe rapide (l.12920).
- Recherche : ordre Voyageurs avant Lieux indépendant du scope (l.12931-12933).
- `_geoIdeaGo` route vers Lieux **sans filtrer** sur le quartier détecté (l.14009) → « fait peu ».
- `#geoNowCard` et `#geoPrompt` séparés → on voit l'un OU l'autre, dualité confuse (l.1833/1835).
- Bascule Voyage/Maison placée au milieu du flux, pas en tête (l.1843).
- Carte : `background … !important` jour/nuit (styles 959-960) = surface en dur, anti-DA.
- Carte : légende des pastilles invisible (chips `display:none`, l.2007).
- Header : 3 icônes serrées (gap .15rem <380px), cibles tactiles limites (preview 492-493).

**Note Lite.** geoNowCard / search / mode-switch sont HORS `#homeTravelMap` → présents aussi en
mode Maison ; vérifier tout fix sur les 2 modes ET sur `body.sm-lite` (Jeux masqué → `_geoIdeaGo`
gère déjà le repli betaOn, l.13999).

---

## RÉSUMÉ (3 lignes)
- Header : logo/boutons **déjà** alignés (space-between) mais **non flush** à cause du padding 1.25rem + un **backdrop-filter blur(7px)** = la « dalle floue » ; corriger = réduire le padding latéral + supprimer le backdrop-filter (qui contredit déjà un commentaire interne).
- Recherche : **aucun seuil de longueur** (1 lettre → `includes`/`ilike %a%`) et **zéro scoring** = exactement le « montre tout et n'importe quoi » ; et le geo-trigger « Ici, maintenant » est **invisible tant que la géo n'est pas `granted`** = le « n'active rien » (P0) — il faut un état de repli + un vrai filtrage des idées.
- Tuiles « centrées bizarrement » = CSS mort (`justify-content` sur `.tile` non-flex) + `min-height` qui crée un **espace fantôme vertical** ; fix = passer `.tile` en flex-column et retirer les min-height sur les textes.
