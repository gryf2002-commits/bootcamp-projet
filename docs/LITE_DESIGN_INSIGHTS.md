<!-- Généré le 16/06/2026 via workflow lite-design-insights (4 agents). Analyse de sunmates-app.html + da-galerie + BRIEF_CODE_LITE_APP → guide pour notre Lite body.sm-lite (DA sunset). -->

# LITE_DESIGN_INSIGHTS

Guide de construction de NOTRE Lite — mode `body.sm-lite` dans `index.html` / `preview.html`, vanilla, **DA sunset préservée**.

> **Cadre non négociable** (rappel CLAUDE.md + MEMORY) : Lite = le toggle `body.sm-lite` uniquement. Aucun framework, aucun build. DA SUNSET joaillerie conservée (corail `#FF5A4D`, or `#FFD15C`, prune-nuit `#190E2E`, Fraunces + Manrope). Tout est scopé `body.sm-lite` ; le mode complet/beta n'est JAMAIS touché. On **retire** le chemin vers `sunmates-app.html`.
> Ce qu'on extrait des 3 sources : **structure, hiérarchie éditoriale, patterns UX, ton, clarté** — PAS la DA claire « Guide des ambiances », PAS Tailwind, PAS Material/FontAwesome, PAS les images externes.

---

## 1. Les ENJEUX de la Lite

**Le job-to-be-done.** La Lite est la **version grand public (beta OFF)**, branchée sur le toggle déjà en place. Public → Lite ; beta-testeurs → app complète. Elle doit donner une expérience **sécurité-d'abord, lisible et rassurante**, sans la charge cognitive du mode jeu (joyaux, easter eggs, panneau DA, boutique).

**Pour qui.** Le persona porteur des sources = **« Chloé / Max, l'exploratrice·eur solo »** : quelqu'un qui veut sortir, découvrir des lieux sûrs et rencontrer, sans avoir à apprendre un système de jeu. La Lite doit être prenable par un non-initié en 10 secondes.

**Pourquoi.** Le mode complet est riche mais dense ; il s'adresse aux beta-testeurs. Le mode Lite répond à un besoin différent : **calme, clarté, confiance**. C'est un filtre de surface (`body.sm-lite`) qui :
- masque les surfaces « jeu vidéo » (déjà gelées : `data-beta`, `.badge.secret`, `.easter`, `.retro-fx` — `sunmates-lite.css:18-24`) ;
- garde la **sécurité gratuite pour tous** ;
- impose la règle sémantique **rouge = danger/SOS uniquement** (`sunmates-lite.css:61-69`).

**Principe directeur.** La Lite n'est pas une 2e app : c'est **la même app, vue à travers une lentille éditoriale plus sobre**. On ne réinvente pas le contenu (on réutilise nos contenus réels + parité EN via `I18N_DICT`) ; on réorganise et on calme.

---

## 2. Le STYLE à viser — TRANSPOSÉ à la DA SUNSET

Les 3 protos partagent une intention forte : **clarté éditoriale, hiérarchie nette, calme, premium**. On la garde — mais exprimée dans **notre nuit prune sunset**, pas dans la DA claire `#faf8ff/#b5241f`.

### 2.1 Clarté éditoriale (le cœur de ce qu'on emprunte)
- **Échelle typo NOMMÉE** en CSS vars scopées `body.sm-lite` : `--fs-display / --fs-h1 / --fs-h2 / --fs-title / --fs-body / --fs-label`, avec poids + tracking définis. Fraunces (titres) + Manrope (corps). C'est ce qui donne au proto sa lisibilité sans Tailwind.
- **Kickers / sous-libellés en PETITES CAPITALES** (`text-transform:uppercase; letter-spacing:.12em`) pour introduire chaque section (« TON AMBIANCE », « LE TOP DU COIN », « CERCLE DE CONFIANCE »). Améliore nettement la scannabilité.
- **Micro-copie chaleureuse non-gamifiée** : « De retour chez toi », « Prends le temps de te ressourcer ». À adapter à nos contenus réels FR + EN.

### 2.2 Hiérarchie
- Patron d'écran répété : **hero → progression/récap → listes courtes → CTA pleine largeur**.
- Chaque page = **pile de `<section>` espacées régulièrement** (échelle d'espacement nommée : `--stack-sm/md/lg` ≈ 8/16/32px), peu d'éléments par section.
- Chiffres en `tabular-nums` (stats, numéros d'urgence).

### 2.3 Calme
- Masquer le « jeu » (déjà gelé). Pas de confettis intrusifs (notre confetti reste **gaté `prefers-reduced-motion`**).
- Micro-interactions calibrées : transition boutons ~120ms + `:active scale(.97)`, fade-in d'écran ~300ms, **toast en HAUT/centre** (jamais collé en bas — règle CLAUDE.md).
- Statuts/validations en **OR `#FFD15C`** (« en ligne / vérifié / dispo »), **jamais point vert criard**.

### 2.4 Premium — version SUNSET (transposition des composants signature)
| Composant proto | Transposition sunset scopée `body.sm-lite` |
|---|---|
| `.glass-panel` (clair) | `background:rgba(25,14,46,.4); backdrop-filter:blur(20px); border:1px solid rgba(255,255,255,.1)`, radius 24-32px. 4 lignes, aucun framework. |
| Fond atmosphérique | `::before` `position:fixed` : `radial-gradient(circle at 80% 20%, rgba(255,138,69,.4), transparent 40%)` + `radial(rgba(255,85,112,.3))` + dégradé vertical vers `#190E2E`. Profondeur coucher de soleil sans image. |
| Dégradé sunset du proto (`#ff5a4d→#b5241f`) | **Remplacer `#b5241f` par notre prune `#190E2E`** (ou `#FFD15C→#FF8A45→#FF5570` pour les CTA). |
| `.hero` corail + overglow doré | Fond dégradé corail→prune, `::before` radial or `#FFD15C`, eyebrow uppercase, mini-stats `.hstat` translucides. |
| `.tactile-relief` / highlight `::before` | `filter:drop-shadow(0 4px 6px rgba(0,0,0,.5)) drop-shadow(0 1px 2px rgba(255,255,255,.1))` + liseré blanc haut 40%. |
| Bouton primaire | UN seul `.sm-lite .btn-primary` : dégradé `#FFD15C→#FF8A45→#FF5570`, halo flou en pseudo-élément, `inset 0 2px rgba(255,255,255,.2)`, radius full, `active:scale(.95)`. |
| Titre serif clippé | `background:linear-gradient(...);-webkit-background-clip:text;color:transparent` pour les grands titres de section. |

> **Cohérence cartes** : 2 niveaux seulement — une **carte premium** (`.glass-panel`/jewel) + une **carte liste compacte** `.minicard` (avatar/photo 72px + titre + meta + chevron, `:active scale(.985)`) pour réduire la fatigue de scroll.

---

## 3. Écran par écran — ce qu'on reprend, en changements scopables `body.sm-lite`

> Format : pour chaque écran, la **structure/UX à reprendre** + la **note de scope**. Aucune modif hors `body.sm-lite`.

### Onboarding (3 slides)
- Reprendre : 3 slides, dégradé sunset, CTA pleine largeur, **revoyable** depuis le menu.
- Scope : variantes `body.sm-lite` du conteneur slides ; contenu/illustrations = nos assets locaux.

### Connexion / Inscription
- Reprendre : fond photo sunset + double overlay prune, carte **glass** (`backdrop-blur`), **onglets Connexion/Inscription** qui changent le libellé du CTA et révèlent le champ prénom, **œil mot de passe fonctionnel**.
- Exigence fonctionnelle : **vrais `<input>`** (le proto avait des `<div>` factices). Boutons Google/Apple selon ce qui existe déjà.
- Scope : restyle glass `body.sm-lite` ; logique d'auth = celle d'index.html.

### Accueil = Hub Maison + onglet « En voyage »
- Reprendre la **hiérarchie** : (1) **segmented control** pill Maison/Voyage ; (2) **hero centré** (icône cerclée + titre serif + sous-titre rassurant) ; (3) **carte récap 3 colonnes** (Défis / Rituels / XP) avec dividers verticaux et `tabular-nums` ; (4) **checklist « Rituels du jour »** (cases cochables, item fait atténué) ; (5) **carrousel horizontal snap** « Défis de ta ville » (CSS `scroll-snap`, pas de JS framework) ; (6) **carte sociale** « De passage chez toi » (avatars empilés + `+N` + CTA outline).
- Onglet Voyage = carte (déjà gérée par Leaflet côté index.html — **ne pas redéclarer**).
- Scope : recolorer en sunset (corail/or au lieu de Material) ; couleurs des 3 stats en teintes joyaux existantes. **Décision Maxime** : garder « XP » visible en Lite (calme grand public) ou le remplacer par un libellé neutre (« Progression ») ? (cf. anti-triche / job non-gamifié).

### Lieux
- Reprendre : **hero**, **rangée de filtres** horizontale scrollable (tuiles emoji 64px, contour dégradé pour l'actif) « TON AMBIANCE », **recherche + filtres FONCTIONNELS** (TOUS / ÉCO / PRÈS DE MOI via `data-eco`/`data-nearby`), **carte lieu** (image `object-cover` + overlay dégradé bas + badges glass top + titre/ville posés sur l'image + zone d'actions Check-in/Avis/Carte), **empty-state éditorial** (icône + titre + phrase d'action) quand 0 résultat.
- Scope : `body.sm-lite` restyle des cartes/filtres ; **badge « Éco » reteint en or/ambre** (pas d'émeraude brut). Images = nos assets, pas picsum.

### Jeux & Quêtes (version sobre)
- Reprendre : **6 tuiles « joyaux »** carrées (icobox dégradé + label) cliquables ; chaque tuile ouvre le **bottom-sheet de détail générique** (voir pattern transverse).
- Scope : version « plus sobre/classique » en Lite ; réutiliser nos teintes joyaux ; **ne pas** réintroduire boutique/easter eggs (gelés).

### Mates — Découverte + Messages
- Reprendre : **segmented control** Découverte/Messages ; **feed hétérogène rythmé** = alterner 3 densités dans la même liste (carte profil pleine avec overlay + badges « 92% ♥ » / « Active now », carte ÉVÉNEMENT intercalée, carte profil compacte) ; **reels d'avatars** ronds avec anneau dégradé `pulse-ring` (`@keyframes box-shadow`, sans JS) ; **recherche live** par `data-name` ; action-bar carte (close / Connect / like).
- Scope : restyle sunset ; statut « Active » en **or**, pas vert.

### Chat
- Reprendre : header avatar + pastille online + compteur 🔥, **séparateur de date en pill** (« AUJOURD'HUI »), **bulles à coin coupé** (`me` en dégradé sunset, `them` blanc bordé), **envoi réel** + réponse simulée, composer mic + send ronds.
- Scope : `body.sm-lite .bub` ; envoi = logique existante.

### Sécurité / SOS — **priorité V1**
- Reprendre (le pattern à rendre impeccable en premier) : **gros SOS rond central** (~128-176px) avec **halo box-shadow concentrique / anneaux de pulsation** ; **modale de confirmation rassurante** (« Alerte envoyée… Reste en ligne ») ; **Cercle de confiance** (avatars + « + Ajouter » en cercle dashed) ; **grille 2×2 d'accès rapides** (Faux appel / Signal d'aide / Partager position) en jewel-tiles ; **numéros 112 · SAMU · Police** en gros chiffres `tabular-nums`.
- Scope : la pulsation SOS reste vivante en Lite (`sunmates-lite.css:64-69`) ; **rouge réservé au danger** ; ne toucher en RIEN le SOS du mode complet.

### Profil
- Reprendre : **hero**, carte glass, sections courtes titrées par kickers uppercase.
- Scope : restyle sunset ; **ne pas** importer FontAwesome (profil_nuit_tropicale_hd) — emojis natifs.

### Guide des ambiances — PAGE-SHOWCASE (pas un switch de DA)
- Reprendre l'**idée** : une vitrine éditoriale de NOS 6 modes (JOUR / NUIT / HIVER / HIVER-NUIT / TROPIQUES / TROP-NUIT) — cartes par monde + swatches + description.
- Scope : reconstruire avec **nos vraies couleurs (KIT_DA)** ; c'est une vitrine d'identité, **ça n'impose pas la DA claire** et ça ne change pas la DA de l'app. **Décision Maxime** : garder cet écran en Lite grand public, ou le réserver/retirer (risque de re-vendre une logique « thèmes » jugée trop « jeu ») ?

### Nav basse
- Reprendre : barre flottante **backdrop-blur**, item actif en pastille dégradée sunset (ou souligné or), **libellés TOUJOURS visibles** (déjà `.lbl{display:block}` en sm-lite), icône FILL sur l'actif.
- **Décision Maxime** : 5 onglets (proto Stitch, sans Profil dans la barre) **ou** 6 onglets (Accueil · Lieux · Jeux · Mates · Sécurité · Profil) + menu ☰ (Guide / Livre blanc / onboarding / déconnexion) comme proposé dans le brief ?
- Scope : aligner le style actif (FILL/couleur) en `body.sm-lite`. Sidebar `md:flex` desktop = optionnel (V2).

### Patterns transverses à standardiser
- **Bottom-sheet de détail UNIQUE et générique** alimenté par `data-*` (poignée + icobox + titre + rating + tags + desc + CTA). Réutilisé pour Lieux / Quêtes / Profils. Évite de dupliquer des écrans.
- **Segmented control unique** sunset (actif = dégradé corail, inactif = secondary) réutilisé Accueil + Mates.
- **Empty-state éditorial** systématique pour toute liste filtrable.
- **Chip uniforme** + **icobox dégradé+sheen** comme briques de base.
- Emprunter les **patterns de routing** (data-attributs re-scannés après génération, reset scroll, sheet générique) — **sans** remplacer le routeur existant d'index.html.

---

## 4. Ce qu'on ABANDONNE (et pourquoi)

1. **La 2e app `sunmates-app.html` comme base/page séparée.** On retire son chemin (bouton « Quitter le mode lite » + redirection `index.html`). **Pourquoi** : une seule Lite = le toggle `body.sm-lite`. Deux artefacts = divergence garantie et double maintenance (cf. nos garde-fous preview/index).
2. **La DA claire « Guide des ambiances »** (`#faf8ff`, primary `#b5241f`, surfaces lilas `#eaedff/#f2f3ff`, tokens Material par ambiance). **Pourquoi** : elle casse notre identité joaillerie nuit et le kit « Radiant Horizon » (MEMORY). On garde prune-nuit `#190E2E` + corail/or. Le dégradé sunset du proto utilise `#b5241f` → à remplacer par notre prune.
3. **Tailwind CDN + config inline.** **Pourquoi** : stack imposée = vanilla, aucun framework, aucun build (CLAUDE.md). On transpose les utilitaires utiles en **CSS scopé `body.sm-lite`**, jamais en chaînes de classes Tailwind (sinon on alourdit index.html sans le moteur qui les résout).
4. **Material Symbols + FontAwesome.** **Pourquoi** : nos icônes = **emojis natifs** (shim `sunmates-icons v2`, MEMORY v498). Reproduire les patterns avec nos composants existants.
5. **Dépendances/visuels de démo externes** (picsum, `lh3.googleusercontent.com`, Leaflet redéclaré). **Pourquoi** : URLs éphémères/fragiles ; la carte est déjà gérée côté index.html. Utiliser nos assets locaux / Supabase.
6. **L'écran « Guide des ambiances » / Design System multi-mondes en tant que switch de DA**, et toutes les **surfaces « jeu vidéo »** (panneau DA in-app, boutique, easter eggs avion en papier, effets saisonniers, badges secrets, célébrations confettis non gatées). **Pourquoi** : c'est exactement ce que la Lite grand public doit **masquer** (déjà gelé `sunmates-lite.css:18-24`). Les réintroduire trahirait le job « calme ».
7. **Les libellés/contenus de démo bruts** (XP gratuit, 🔥, chapitres Livre blanc factices). **Pourquoi** : réutiliser nos contenus réels + parité EN ; respecter l'anti-triche XP (quêtes ≠ trust).
8. **Le routing global `go()/$$('.screen')` du proto.** **Pourquoi** : notre Lite vit DANS index.html avec son propre routeur ; on emprunte les patterns, pas le moteur.

---

## 5. Checklist actionnable priorisée — V1 / V2

### Fondations CSS (à faire AVANT les écrans — bloquantes, toutes scopées `body.sm-lite`)
- [ ] **F1.** Définir l'**échelle typo nommée** (`--fs-display…--fs-label`, poids+tracking, Fraunces/Manrope) dans `sunmates-lite.css`.
- [ ] **F2.** Définir l'**échelle d'espacement** (`--stack-sm/md/lg`, `--container-margin`, `--gutter`).
- [ ] **F3.** Créer les **composants de base** : `.glass-panel` (sunset), `.btn-primary` (dégradé `#FFD15C→#FF8A45→#FF5570`), `.minicard`, `.chip`, `.icobox`, `.tactile-relief`, kicker uppercase, titre serif clippé.
- [ ] **F4.** **Fond atmosphérique** `::before fixed` sunset.
- [ ] **F5.** **Micro-interactions** : transition 120ms + `:active scale`, fade-in 300ms, **toast HAUT/centre** (vérifier que la classe toast matche bien sa règle CSS — bug documenté : toast invisible alors que le JS tournait), tout sous `@media prefers-reduced-motion`.

### V1 — l'essentiel grand public
- [ ] **V1.1 — Sécurité / SOS** (priorité absolue) : SOS rond + halo/pulse, modale rassurante, Cercle de confiance, grille 2×2, numéros 112·SAMU·Police `tabular-nums`. Rouge = danger only. Tester en navigateur.
- [ ] **V1.2 — Accueil/Hub** : hero → carte récap 3 colonnes → checklist rituels → carrousel snap → carte sociale. Segmented Maison/Voyage. *(dépend de la décision « XP vs Progression »)*
- [ ] **V1.3 — Lieux** : hero + filtres emoji scrollables + **recherche/filtres réels** (TOUS/ÉCO/PRÈS) + cartes lieu + **empty-state**. Badge Éco reteint or/ambre.
- [ ] **V1.4 — Connexion** : **vrais inputs**, onglets Connexion/Inscription, œil mot de passe, carte glass sunset.
- [ ] **V1.5 — Retrait du chemin `sunmates-app.html`** : supprimer le lien/bouton ; confirmer que la seule Lite = le toggle. Vérifier qu'aucune régression du mode complet.
- [ ] **V1.6 — Bottom-sheet détail générique** + **segmented control unique** + **empty-state** comme composants partagés.
- [ ] **V1.7 — Nav basse** Lite stylée (actif FILL/couleur) *(dépend de la décision 5 vs 6 onglets)*.

### V2 — densité, social, finitions
- [ ] **V2.1 — Mates** : segmented Découverte/Messages, feed hétérogène 3 densités, reels avatars pulse-ring, recherche live, action-bar.
- [ ] **V2.2 — Chat** : séparateur date pill, bulles coin coupé, envoi réel + réponse simulée.
- [ ] **V2.3 — Jeux** : 6 tuiles joyaux sobres → bottom-sheet détail.
- [ ] **V2.4 — Profil** : hero + carte glass + sections kickers.
- [ ] **V2.5 — Guide des ambiances** en page-showcase de NOS 6 modes *(dépend décision Maxime : garder/retirer)*.
- [ ] **V2.6 — Onboarding** revoyable + Livre blanc public (contenus réels).
- [ ] **V2.7 — A11y** : focus-visible corail, shim clavier (réutiliser `KBD_SEL`/`_smSyncLabels`), aria-label sur boutons icône-only.
- [ ] **V2.8 — i18n** : parité EN (`I18N_DICT`) de toute la micro-copie Lite.
- [ ] **V2.9 (optionnel)** : sidebar nav desktop (`md:flex`).

### Garde-fous de validation (à chaque écran)
- [ ] Chaque interaction **testée en navigateur** (vrais inputs, filtres câblés, **toasts visibles**).
- [ ] `git diff` sur le mode complet **vide** — aucune règle hors `body.sm-lite`.
- [ ] Aucune dépendance externe ajoutée (pas de Tailwind/Material/FontAwesome/picsum).
- [ ] Workflow preview-first : bosser dans `preview.html`, snapshot/jalons, **pas de push sans feu vert de Maxime**, bumper `sunmates-badges.js?v=` + SW au moment du push prod.

---

### Décisions à trancher par Maxime (récapitulatif)
1. **Accueil** : afficher « XP » en Lite ou le neutraliser en « Progression » (job non-gamifié) ?
2. **Nav** : 5 onglets (sans Profil dans la barre) ou 6 onglets + menu ☰ ?
3. **Guide des ambiances** : garder l'écran-showcase (nos 6 modes, nos couleurs) en Lite grand public, ou le retirer ?

**Fichiers cibles** : `C:\Users\gryf2\sunmates\preview.html` (travail), `C:\Users\gryf2\sunmates\sunmates-lite.css` (CSS scopé `body.sm-lite`), report vers `index.html` au feu vert. Source à NE PLUS lier : `sunmates-app.html`.