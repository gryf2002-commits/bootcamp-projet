# Backlog UPGRADE — vitrine + pages + app (mandat Maxime, 25/06/2026)

> Mandat : **stack vanilla levée** (frameworks/build OK désormais), améliorer **la vitrine, toutes
> les pages et l'app** en restant **DA sunset doux raffiné**, sans casser la prod.
> Source : 4 sondes en lecture seule sur le code réel (app.html ~1,7 Mo + styles.css 575 Ko +
> sunmates-lite.css + index.html + 14 pages SEO). Ce fichier = la liste pour que **rien ne se reperde**.
>
> Légende statut : ⬜ à faire · 🟦 en cours · ✅ fait (avec version) · 🟨 décision produit requise

## JOURNAL
- **25/06 (non poussé)** : ✅ Lot A contrastes nuit (override dusk élargi, vérifié jour intact/nuit lisible) · ✅ Lot B barres (`.set-grouptitle`, `.trip-matches` +override !important, `.reviews-form`, `.review-item` → filets retirés, espacement gardé ; `.pwa-banner` avait déjà un z-index ; `.homemap-fsopen` safe-area = laissé, spéculatif) · ✅ Lot C photos (app.html : câblé le filet `data-localbg` mort via nouveau `_safeLocalUrl` + secours local sur erreur distante SANS pop ; rootMargin lazy 400→1200px → cartes chargent avant d'arriver dessus. Vérifié harnais : Lieux 3/3 cartes avec photo vs 1/3 avant. **app.html ET preview.html resynchronisés.**)
- **Décisions produit Maxime** : « chats sur la carte » → **CONSTRUIRE** (markers salons + aperçu dernier message) · `iAmGold=true` → **garder tout débloqué** (ne pas toucher, Lot G allégé).
- À déployer : bump `styles.css?v=` + sw VER + whatsnew quand Maxime dit « déploie ».

---

## LOT A — CONTRASTES « mondes » (nuit/dusk) — *priorité haute, risque faible*
Or/vert codés en dur INLINE, illisibles en mode sombre (`body.theme-dusk`). Le mode jour les garde
(lisibles sur fond clair). Override v729 existait mais limité à `.popinfo-card/.act-card`.
- ⬜ `app.html:7330` récap hebdo `#B5740E` (XP/série/Mates)
- ⬜ `app.html:15005` note resto `#B5740E`
- ⬜ `app.html:16387` XP profil `#B5740E`
- ⬜ `app.html:17394` niveau profil `#B5740E`
- ⬜ `app.html:16449,16506-16507` modale Gold `#C98A1E` (prix, colonne Gold)
- ⬜ `app.html:10029` tendance classement montée `#1E7A5A` (vert hors-DA + illisible)
- **Fix** : élargir l'override dusk dans `styles.css` (≈l.1860), cibler `[style*="#hex"]` globalement en `theme-dusk` → `#FFD79A` (or) / `--accent-ink` (vert). N'affecte QUE la nuit.

## LOT B — BARRES DE SÉPARATION résiduelles (`styles.css`) — *risque faible*
La DA plate v757/v760 a quasi tout retiré (serti premium). Restent quelques filets visibles :
- ⬜ `styles.css:680` `.set-grouptitle border-top` (visible dans Paramètres, chaque groupe) → `margin-top`
- ⬜ `styles.css:411` `.trip-matches border-top dashed` (fiche voyage) → 🟨 confirmer si voulu
- ⬜ `styles.css:2159,2161` `.reviews-form` / `.review-item` border (détail lieu, avis)
- ⬜ `styles.css:474` `.pwa-banner` sans `z-index` → peut passer SOUS la nav basse → ajouter `z-index:70`
- ⬜ `styles.css:1101` `.homemap-fsopen` peut chevaucher topbar sur ≤420px → `top: calc(.5rem + env(safe-area-inset-top))`
- **NE PAS toucher** : sertis `inset 0 1px 0` (v760, décor volontaire), spinners `.ptr-ring`.

## LOT C — PHOTOS qui ne s'affichent pas partout — *priorité haute (UX visible)*
- ⬜ `app.html:1872,1905,1909,1913` `<img src="shot_*.jpg">` chemins relatifs → absolus `/shot_*.jpg`
- ⬜ `app.html:11507-11512` `cafeImage()` + `app.html:11497-11501` `questImage()` : photos via picsum/loremflickr externe **sans fallback local** → restaurer `bgStack(remote, local)`
- ⬜ `app.html:13369-13371` rendu avatar (BFF) sans try-catch si id invalide → garde-fou
- ✅ déjà OK : fallback initiale si `avatar_url` null, couleur de fond placeholder, dégradation Twemoji.

## LOT D — « tripbff » + « chats sur la carte » — *à cadrer (🟨 produit)*
- ⬜ **BFF du moment** : logique JS complète (`renderBff` l.16726) mais appelle `$("bffCard")` **qui n'existe pas dans le DOM** → ajouter `<div class="card" id="bffCard">` (Accueil ou Connexions). C'est probablement le « tripbff pas bien incorporé ».
- 🟨 `app.html:13431` bouton BFF verrouillé Gold sans UI d'upsell.
- 🟨 **Chats sur la carte** : n'existe PAS comme feature. Aujourd'hui chats = popups Leaflet (1:1) + modale groupe. Pour « chats sur la carte » → ajouter markers trip-groups + preview du dernier message dans le popup (nouvelle feature, à cadrer avec Maxime).

## LOT E — TUILES « pas de la même couleur » + Jeux Lite + Destinations
> ✅ **25/06** Jeux Lite : rangée secondaire 4→3 colonnes (Boutique masquée laissait un trou) + rythme resserré (vérifié before/after). · ℹ️ **Destinations = FAUX problème** : vérifié → recherche déjà debouncée 250ms + filtrée en mémoire (pas de re-query), chips masqués (pas de redondance), défer carte volontaire (v733). Rien à corriger. · ⬜ reste : tuiles `.thumb.*` Accueil par thème (à vérifier, bas impact).
- ⬜ **Jeux sur Lite** (`app.html:3425-3570`, `body.sm-lite`) : nav 6 tuiles = 260px, peu de place aux quêtes ; pas de hiérarchie primaires/secondaires. Refonte : 2 primaires (Quêtes/Jeux) en avant, secondaires en scroll ; `act-overlay max-height:92vh` ; typo titre +.
- ⬜ **Destinations = onglet « Lieux sûrs »** (`app.html:2435`) non optimisé : carte différée 900ms (blanc 1-2s), filtres redondants (chips + tuiles), recherche sans debounce, vide au démarrage, « spot du jour » fermé. Réordonner + debounce 300ms + placeholder onboarding.
- ⬜ tuiles couleurs : nav Jeux OK (pas de casse) ; vérifier `.thumb.*` Accueil dans styles.css par thème.

## LOT F — PAGES SEO « à bosser à la mort » (`index.html` + 14 villes + sécurité/lieu)
> ✅ **25/06 gains rapides** : FAQ JSON-LD `devenir-lieu-sur` alignée sur le visible (Rich Results) + JSON validé · `sunmates-plaquette` → `noindex` · `hreflang=en` trompeur retiré du sitemap.
> ✅ **25/06 GROS MORCEAU FAIT (14 villes)** : chaque page a une section UNIQUE « Le solo à [ville], concrètement » (2 paragraphes + 3 cartes, ~300-400 mots de vrai contenu local : quartiers nommés, transports le soir, saisons, spots pour engager la conversation, angle sécurité+amitié) · témoignage statique recyclé (Inès/Strasbourg) remplacé par un témoignage UNIQUE city-spécifique + 14 attributions distinctes (prénom/âge/ville d'origine variés) · maillage interne porté à 6-7 villes + page sécurité partout. Vérifié : section présente ×14, **0 tiret cadratin**, HTML valide ×14, rendu Lyon nickel.
> ⬜ **reste mineur** : carousel témoignages de `destinations-enhance.js` encore identique sur les 14 (JS-injecté, faible poids SEO) · typo insécables FR globales · bug CSS `devenir-lieu-sur:65` (`select` outline permanent) · témoignages de l'accueil `index.html` (6 identiques aux pages).
- ⬜ **Doublons massifs** : témoignages recyclés 3-4× entre villes + injectés EN DOUBLE (HTML statique + `destinations-enhance.js`) + identiques à l'accueil ; bento + bloc sécurité + FAQ identiques sur les 14 villes. → différencier par ville, supprimer le doublon statique vs JS.
- ⬜ **Contenu unique trop mince** (~4-6 phrases/ville) → viser 600-900 mots rédigés/ville (quartiers solo, sécurité locale, spots nommés).
- ⬜ `devenir-lieu-sur.html` FAQ **JSON-LD ≠ FAQ visible** (Rich Results) → aligner.
- ⬜ `sunmates-plaquette.html` : pas de canonical/robots, absente du sitemap → `noindex` (ou publier proprement, ton « tu »).
- ⬜ Maillage interne villes faible/asymétrique (Paris/Lisbonne/Barcelone sous-maillées, sans lien page sécurité) → 5-6 liens cohérents partout.
- ⬜ `hreflang` EN trompeur (pointe vers la même URL FR, pas de page EN réelle) → retirer.
- ⬜ Typo FR : insécables avant `: ; ! ?` ; harmoniser « tu/vous » (cartes « Trouvez » → « Trouve »).
- ⬜ Bug CSS `devenir-lieu-sur.html:65` : `select` toujours en outline (manque `:focus`).

## LOT G — BACKLOG APP encore ouvert (du BACKLOG_CODE_MASTER, vérifié v806)
- 🟨 `app.html:6031` `iAmGold = true` forcé (peut être voulu = tout débloqué) → décision produit.
- ⬜ P2.7 gestion membres de groupe (ajouter/retirer/voir) — **0 trace**, à coder.
- ⬜ P2.5 badge « Filtres » compteur en dur `5` (`app.html:2289`) → compter les filtres restrictifs.
- ⬜ P3.8 code mort (`data-beta`/`sm-lite` inertes, panneau `discover`) → ménage.
- ✅ déjà fait depuis v648 : Push (P1.1), streak en base (P2.4), cap check-in retiré (P2.3), floutage position.

---

### Ordre d'exécution proposé
A (contraste, sûr) → C (photos, impact) → B (barres) → E (Jeux Lite + Destinations) → F (SEO) → D/G (features + décisions produit).
Chaque lot : éditer → vérifier (rendu/headless) → puis, au moment du déploiement, **bump version** (`styles.css?v=` + `sw` VER + whatsnew) car « fini » = version bumpée + poussé.
