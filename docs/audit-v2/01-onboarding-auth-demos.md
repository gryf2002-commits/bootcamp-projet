# Audit v2 — Zone ONBOARDING + AUTH/LANDING + DÉMOS/VISITE GUIDÉE

> Cible : `preview.html` (~18 690 l.) + `styles.css` (~4 178 l.) + `sunmates-lite.css`.
> Périmètre : `#authView`, `#onboarding`, `TOUR_STEPS` / `GUIDED_TOURS`, `AUTO_DEMO` (85 chapitres).
> Posture : duo product-designer + frontend-eng, audacieux, dérive DA sunset autorisée.
> Date : 2026-06-20.

---

## 0. CARTE DES FLUX (qui appelle quoi)

```
boot → maybeShowOnboarding() [l.14347]
        ├─ #onb/#tour dans l'URL → openOnboarding() [l.14327]
        └─ jamais vu (localStorage sm_onboarded_<uid> OU profiles.onboarded) → openOnboarding()

openOnboarding → 5-6 slides (showOnbStep) → onbNext final [l.14366]
        → closeOnbSlides() + goToTab("accueil") + startTour() (320 ms)

startTour [l.14385] → TOUR_STEPS (6 spotlights) → _onboardingTourEnd() [l.14472]
        → finishOnboarding() + goToTab("profil") + segment "edit" + #onbDoneBanner

#authView [l.1587] : MOBILE = #authCore seul (sombre) ; DESKTOP = .lp-chrome (landing) autour
        setAuthMode(login|signup|pro) [l.5080]

AUTO_DEMO [l.8493] : 85 chapitres narrés, barre #autoDemo [l.1529]
        startAutoDemo(i) [l.8713] ; catalogue onglet 🎤 renderDemoScript [l.8228]
        startGuidedTour(key) [l.14418] → TAB_DEMO_IDX → startAutoDemo(idx)
        GUIDED_TOURS.full [l.14400] = DÉFINI MAIS PLUS UTILISÉ (mort, cf. P1-D)
```

Trois systèmes de tuto coexistent : **slides** (onboarding), **spotlights** (TOUR_STEPS) et **barre narrée** (AUTO_DEMO). Le code dit « fusion en un seul moteur » (l.14415) mais en réalité TOUR_STEPS et AUTO_DEMO sont deux moteurs distincts ; GUIDED_TOURS est un troisième jeu de données orphelin.

---

## 1. ONBOARDING — `#onboarding` [l.1469-1506]

### 1.1 Structure & contenu
| Slide | data-step | Emoji | Titre | Ligne |
|---|---|---|---|---|
| 0 | 0 | 🌍 | « Salut[, prénom] ! » | 1474 |
| 1 | 1 | 🗺️ | Ta carte vivante | 1479 |
| 2 | 2 | 🎉 | Crée des moments | 1484 |
| 3 | 3 (`data-onbbeta`) | 🎮 | Joue & gagne | 1489 — **retiré en Lite** (l.14330) |
| 4 | 4 | 😎 | L'esprit léger | 1494 |

Dots `#onbDots` générés (buildOnbDots l.14311). Actions : Retour / Suivant. « Passer » en haut-droite. Compteur d'étapes recalculé au runtime (`ONB_STEPS = querySelectorAll('.onb-step').length`).

### 1.2 Logique (JS) [l.14308-14370]
- `showOnbStep` : pose `.active` sur l'étape courante, `.left` sur les précédentes.
- Détecteur d'« utilisateur pressé » (2 taps < 900 ms → `.fast` = transitions coupées).
- Fin : `localStorage.setItem("sm_onboarded_"+uid)` + `profiles.onboarded=true`.

### 1.3 🔴 PROBLÈME PHARE — la transition n'est PAS un fondu pur (demande explicite Maxime)
**styles.css l.1126-1129** :
```css
.onb-step      { opacity:0; transform: translateY(12px) scale(.985); transition: opacity .3s, transform .3s; }
.onb-step.active { opacity:1; transform:none; }
.onb-step.left   { transform: translateY(-12px) scale(.985); }
```
Le commentaire l.1125 dit « FONDU vertical doux » : c'est exactement le mouvement vertical (±12 px) **+ un scale** que Maxime veut supprimer. Aujourd'hui ça monte/descend ET ça respire (scale). → **Ce n'est pas un fondu pur.**

- **Option A (reco) — FONDU PUR strict.** Supprimer tout `transform` des 3 règles, ne garder que `opacity`. `.left` devient identique à l'état repos (opacity:0, sans transform). Crossfade propre, zéro déplacement, zéro scale. ~3 lignes CSS.
  ```css
  .onb-step      { opacity:0; transition: opacity .32s ease; }
  .onb-step.active { opacity:1; }
  .onb-step.left   { opacity:0; }
  ```
  ⚠️ Comme les steps sont `position:absolute; inset:0` empilées, le crossfade pur fonctionne déjà sans translate. Le `min-height:280px` du `.onb-stage` (l.1123) évite le saut de hauteur.
- **Option B — crossfade + halo.** Fondu pur sur le texte MAIS l'emoji fait un léger pop d'échelle isolé (scale 0.9→1 sur `.onb-emoji` uniquement) pour garder de la vie sans déplacer le bloc. Compromis si le fondu pur semble « plat ».
- **Option C — fondu + dégradé de fond qui glisse.** Garder fondu pur sur le contenu, mais animer la position du gradient `.onb` (background-position) au changement de slide → sensation de progression sans bouger le texte.
- **Reco : A.** C'est littéralement ce qui est demandé. B en repli si jugé trop sobre.

### 1.4 Problèmes secondaires
- **VISUEL** : `min-height:280px` fixe sur `.onb-stage` (l.1123) → sur petit écran (iPhone SE) le bloc + dots + boutons peut dépasser ; sur grand écran, vide. → passer en `min-height: clamp(240px, 38vh, 320px)`.
- **VISUEL** : l'easter-egg « toggle Mode sombre 10x » bascule `.onb` en violet nuit (l.1101) mais le gradient jour (l.1100, `#FFB24D→#FF6B6B→#B25CC9`) finit déjà en violet → transition jour/nuit peu lisible. Acceptable.
- **TECHNIQUE** : `ONB_STEPS` est une `let` globale recalculée à chaque `openOnboarding` ; si l'onboarding est ré-ouvert après que la slide beta a été `.remove()` (l.14330) en Lite, elle est définitivement supprimée du DOM → ré-ouverture en mode beta n'a plus la slide gaming. **P2** (cf. bugs).
- **COPY** : 5 slides est correct, mais slide 4 « L'esprit léger / Profils vérifiés et SOS » met la **sécurité en avant** — or la direction produit 19/06 (mémoire) dit explicitement de NE PAS mettre la sécurité en avant (fait flipper sans vérif d'identité). → **réécrire la slide 4 autour du geo-trigger** (« l'app s'adapte au lieu où tu es »), reléguer le SOS en mention discrète.

### 1.5 Refonte ambitieuse proposée (onboarding)
1. **Fondu pur** (A) + dots qui « remplissent » progressivement (barre de progression segmentée plutôt que pastilles).
2. **Recadrer la narration sur le geo-trigger** (axe central produit) : slide 1 « La ville s'allume autour de toi », slide 2 « Croise ta bande », slide 3 « Vis le moment », slide 4 « Toujours un filet » (sécurité en sourdine). Couper le jargon « Mates » au profit d'un langage concret au 1er contact.
3. **Onboarding actionnable** : sur la dernière slide, au lieu d'enchaîner sur un tour de 6 spotlights (longueur, cf. §3), proposer 1 seul CTA « Activer ma position » (le cœur geo-trigger) — l'utilisateur fait UNE action au lieu de regarder 6 bulles.

---

## 2. AUTH / LANDING — `#authView` [l.1587-1788]

### 2.1 Inventaire
| Bloc | Rôle | Lignes | Visibilité |
|---|---|---|---|
| `.lp-chrome.lp-before` | nav + hero + piliers + galerie + « 3 temps » | 1598-1683 | **desktop ≥900px** |
| `#authCore` | logo + langue + titres + seg + formulaire + bloc Pro | 1686-1753 | toujours |
| `.lp-chrome.lp-after` | FAQ + carte finale + footer | 1756-1787 | **desktop** |

- Formulaire `#authForm` : email / pseudo (signup only) / mot de passe + œil / bouton `#authPlay`. setAuthMode bascule login↔signup↔pro [l.5080].
- Bloc Pro `#authProBlock` : 4 tuiles cliquables + « Démarrer Espace Pro ». Entrée discrète `#authProLink`.
- Sélecteur de langue présent **2 fois** (nav desktop l.1606 + `.auth-lang` l.1705).

### 2.2 Problèmes
- **VISUEL / cohérence DA** : le `#authView` est **forcé en sombre** (l.1051, commentaire « mode sombre desktop ») même quand l'app est en mode jour → l'utilisateur connecté en thème clair a découvert l'app par un écran sombre. Choix assumé v467 mais crée une rupture. → soit assumer une **landing signature sombre** (option A ci-dessous), soit la rendre cohérente avec le thème.
- **VISUEL** : deux logos différents — landing nav = SVG blanc « trait » (l.1601) ; `#authCore` = SVG dégradé `url(#sunG)` (l.1689). Incohérence de marque sur le même écran (desktop voit les deux). → unifier sur le logo dégradé.
- **VISUEL** : la galerie desktop référence `shot_accueil.jpg` / `shot_jeux.jpg` / `shot_profil.jpg` (l.1628, 1661-1669) = captures qui datent (cf. démo datée §4) → vérifier qu'elles reflètent l'UI actuelle, sinon promesse « de vraies captures, pas des promesses » (l.1657) trompeuse. **P1**.
- **TECHNIQUE** : `onclick="try{setAuthMode('signup')}catch(e){}"` répété 5× en inline (l.1610, 1622, 1771, 1779…) → fragile, non i18n, mélange comportement/markup. → délégation d'événement sur `[data-auth-mode]`.
- **TECHNIQUE** : doublon sélecteur langue (2 jeux de boutons `data-lang`) → risque d'états désynchronisés (un set actif, l'autre non). Vérifier que `setLang` met à jour les deux.
- **COPY** : FAQ « C'est une appli de dating ? » `<details open>` (l.1760) — bien. Mais le hero desktop (« Pars solo, trouve ta bande ») et le titre mobile (`#authTitleH` même phrase) répètent le même slogan à 2 endroits visibles ensemble sur desktop → redondance.
- **A11Y** : `#authPlay` a `aria-label="Se connecter"` figé (l.1733) mais le texte passe à « Créer mon compte » en signup (l.5103) → le label ne suit pas → lecteur d'écran annonce « Se connecter » sur le bouton d'inscription. **P1**.
- **A11Y** : `tabPro` masqué via `display:none` + `aria-hidden` + `tabindex=-1` (l.1716) — OK.

### 2.3 OPTIONS de refonte (auth/landing)
- **Option A (reco) — Landing signature « golden hour », assumée et séparée du thème.** Garder le sombre comme parti-pris de marque MAIS le sortir du « sombre desktop par défaut » involontaire : faire un fond dégradé sunset→nuit cinématique (cohérent avec le site vitrine existant `site/` et `sunmates-showcase.html`), un seul logo dégradé, hero plein écran avec la capture app en device mockup, et le formulaire en carte flottante glassmorphism. Centrer le pitch sur le **geo-trigger** (« SunMates s'allume là où tu es »).
- **Option B — Auth minimaliste « app-first ».** Sur mobile, supprimer le pitch long : logo + 1 phrase + formulaire, point. La pédagogie passe à l'onboarding post-signup. Réduit le time-to-form. Garde la landing riche uniquement desktop.
- **Option C — Split-screen desktop.** Moitié gauche = visuel/narratif animé (carte qui s'allume), moitié droite = formulaire fixe collant. Plus moderne que le flux scroll actuel (landing → formulaire au milieu → FAQ).
- **Reco : A** pour la cohérence avec l'écosystème vitrine déjà construit + l'axe geo-trigger ; **B** appliqué au mobile en complément (le mobile n'a de toute façon pas la chrome marketing).

### 2.4 #onbDoneBanner [l.2517-2520]
Bannière « Dernière étape ! » affichée après le tour, dans l'onglet profil. CTA cliquable → focus pseudo. **OK** mais : elle apparaît APRÈS un onboarding (5 slides) + un tour (6 spotlights) → l'utilisateur a vu 11+ écrans avant de pouvoir agir. Trop long (cf. §3 reco).

---

## 3. VISITE GUIDÉE — `TOUR_STEPS` / spotlights [l.14373-14493]

### 3.1 Inventaire
6 spotlights, un par onglet : accueil 🗺️, lieux 📍, jeux 🎉, connexions 💬 (Messages), securite 🛡️, profil 👤 (l.14374-14379). Moteur : `showTourStep` → `positionTour` (calcul rect + placement bulle top/bottom, glissement animé l.14443-14465). Lite : étape « jeux » filtrée (l.14387).

### 3.2 Problèmes
- **UX structurel** : enchaîné automatiquement après l'onboarding (l.14366). L'utilisateur fraîchement inscrit subit **5 slides + 6 bulles** = 11 écrans avant la moindre action réelle. Taux d'abandon probable élevé.
- **TECHNIQUE** : `positionTour` recalcule via 2× `requestAnimationFrame` + `scrollIntoView` + délais conditionnels (200/60 ms l.14441). Robuste mais fragile aux éléments non rendus → si `st.sel` introuvable, bulle posée à `bottom:42%` sans spotlight (l.14446), aspect cassé.
- **VISUEL** : la bulle `.tour-pop` est en `var(--card)` clair sur l'app, le spotlight perce un fond sombre (`rgba(12,7,32,.72)` l.1156) → OK, contraste bon.
- **COHÉRENCE** : libellé onglet « connexions » = « Messages » dans le tour (l.14377) mais l'onglet réel a fusionné Mates→Messages le 20/06 (l.14509) → vérifier que le sélecteur `[data-tab="connexions"]` et le texte « Pour rencontrer du monde, c'est sur l'accueil » sont toujours exacts. **À revérifier.**

### 3.3 OPTIONS
- **Option A (reco) — Supprimer le tour automatique, le rendre à la demande.** Onboarding (slides) → 1 CTA action (position) → app. Le tour reste accessible depuis profil (« Revoir la visite »). Réduit drastiquement le tunnel.
- **Option B — Fusionner tour dans l'onboarding** : remplacer les spotlights par un onboarding interactif où chaque slide pointe une vraie zone (coach-marks contextuels au 1er passage sur chaque onglet, façon « tip » qui apparaît quand l'utilisateur arrive vraiment sur l'onglet).
- **Option C — Garder mais raccourcir à 3 spotlights** (accueil/carte, connexions, sécurité) — l'essentiel.
- **Reco : A** (puis coach-marks B en v ultérieure).

---

## 4. DÉMO AUTO NARRÉE — `AUTO_DEMO` [l.8493-8666]

### 4.1 Inventaire
**85 chapitres** (Maxime dit ~80) joués en séquence, chacun `{title, text, ms, run}`. Barre `#autoDemo` [l.1529]. Lancée par `startAutoDemo(i)` [l.8713] depuis : onglet 🎤 catalogue (l.8241), `startGuidedTour`/`TAB_DEMO_IDX` (l.14418), et un point l.12804. Filtrage beta via `_stepIsBeta` regex (l.8674). Catalogue cliquable « ▶ Jouer depuis ici » (l.8238).

### 4.2 Pourquoi c'est jugé « pas à jour et daté » (analyse précise)
1. **Volume ingérable** : 85 chapitres = ~9 min de démo. Personne ne regarde. C'est un **inventaire exhaustif** déguisé en démo, pas une démo.
2. **Dérive vs l'app réelle** :
   - Chap. « ✨ L'onboarding » (l.8498) annonce **« six étapes »** alors que l'onboarding réel n'en a que **5** (4 en Lite) → texte faux. Et il pilote `showOnbStep(1..5)` via setTimeout codés en dur (l.8499) : si l'onboarding change, ça casse silencieusement.
   - Chap. « 🤝 Rencontrer / 📨 Demandes / 🛡️ Voir tous tes Mates » utilisent `showMatesSegment("discover")` / `"requests"` — or `discover` a été **redirigé vers l'accueil** le 20/06 (l.8527, l.8569 vs l.8511) → ces chapitres montrent maintenant l'accueil au lieu du segment annoncé. **Démo ment.**
   - Chap. « 💼 L'espace Pro (B2B)… piste de revenus B2B » (l.8500) : très orienté business, daté par rapport au pivot produit (geo-trigger central, B2B pas la priorité affichée).
   - Chap. « 🌙 Mode sombre / ☀️ retour au jour » (l.8570-8573) ciblent `setThemeToggle` — à revérifier vs le déplacement 🌙→Réglages (mémoire 19/06).
3. **Mapping `TAB_DEMO_IDX` figé** (l.14417 : `lieux:12, connexions:16, jeux:25, securite:29, profil:32`) : ces index pointent sur des positions dans un tableau de 85 entrées. Toute insertion/suppression de chapitre **décale tout** → « Jouer le tuto Lieux » peut tomber sur le mauvais chapitre. **P1 — extrêmement fragile.**
4. **Numérotation incohérente** : `adProg` affiche « i+1 / 85 » en beta mais recompte en Lite (l.8693-8699) → en beta on voit « 4 / 85 », ce que Maxime décrit comme « le 2/82 qui saute ».
5. **Ton** : longueur des textes très variable, certains chapitres font 3 lignes de pub (« À 9,99 €/mois… » l.8562) = catalogue marketing, pas narration vivante.

### 4.3 Comment régénérer la démo (plan concret)
- **Principe** : une démo ≠ un inventaire. Cible **8-10 chapitres** racontant UN parcours (le geo-trigger) :
  1. La ville s'allume (accueil/carte geo) → 2. Je croise une voyageuse → 3. Je propose un café → 4. C'est un match → 5. On se parle → 6. Check-in sur place → 7. XP/badge → 8. Toujours un filet (sécurité, bref) → 9. Fin.
- **Découpler du code fragile** :
  - Remplacer `TAB_DEMO_IDX` par des **clés nommées** sur chaque chapitre (`{id:"carte", ...}`) et résoudre par id, pas par index (supprime la dérive d'insertion). **(corrige P1-C)**
  - Faire piloter l'onboarding par la vraie constante (`ONB_STEPS`) au lieu de « six étapes » et de setTimeout en dur (l.8499). **(corrige le texte faux)**
  - Supprimer/réparer les chapitres qui appellent `showMatesSegment("discover")` (n'existe plus comme vue) et tout ce que `_stepIsBeta` régex-match par hasard.
- **Garder l'exhaustivité ailleurs** : l'onglet catalogue 🎤 (renderDemoScript l.8228) peut rester la liste complète des features (recherche), MAIS la démo *jouée* doit être la version courte. Séparer « catalogue » (référence) de « démo » (récit).
- **Régénération assistée** : reconstruire le tableau à partir d'un script narratif court validé par Maxime, en vérifiant CHAQUE `run` contre une fonction qui existe encore (audit `typeof === "function"` déjà présent mais ne garantit pas le bon résultat visuel).

### 4.4 OPTIONS démo
- **Option A (reco)** : démo courte 9 chapitres (récit geo-trigger) + catalogue exhaustif séparé. Chapitres adressés par id. Textes réécrits, ton vivant, 0 prix/0 jargon B2B.
- **Option B** : démo « auto-générée » depuis l'état réel (chaque onglet expose ses points clés, la démo les enchaîne) → toujours à jour par construction, mais lourd à implémenter.
- **Option C** : remplacer la démo narrée par une **vidéo/captures animées** (le site vitrine en a déjà) embarquée → 0 maintenance code, mais perd l'aspect « live dans l'app ».
- **Reco : A** (récit court, robuste, raccord direction produit).

---

## 5. BUGS

### P0
- *(aucun bloquant trouvé dans cette zone)*

### P1
- **P1-A — `aria-label` du bouton auth figé** : `#authPlay aria-label="Se connecter"` (l.1733) ne suit pas le texte « Créer mon compte » en mode signup (l.5103). A11y trompeuse.
- **P1-B — Chapitres démo désynchronisés de l'app** : `showMatesSegment("discover")` (l.8527, 8569) redirige vers l'accueil depuis le 20/06 (l.8511) → les chapitres « Rencontrer / anglais » montrent autre chose que ce qu'ils annoncent.
- **P1-C — `TAB_DEMO_IDX` par index numérique** (l.14417) : toute modif d'`AUTO_DEMO` décale les points d'entrée des tutos par onglet (`startGuidedTour`). Bug silencieux garanti à la prochaine édition.
- **P1-D — Texte démo faux** : « l'onboarding… en **six** étapes » (l.8498) alors qu'il y en a 5 (4 en Lite). Et pilotage par setTimeout codés en dur (l.8499) cassable.
- **P1-E — Captures landing potentiellement datées** : `shot_accueil/jeux/profil.jpg` (l.1628, 1661-1669) sous le claim « de vraies captures, pas des promesses » (l.1657) → à revérifier vs UI actuelle.

### P2
- **P2-A — Slide onboarding beta supprimée du DOM** : en Lite, `.onb-step[data-onbbeta].remove()` (l.14330) est destructif → ré-ouverture ultérieure en mode beta n'a plus la slide « Joue & gagne ». Préférer `hidden`/`display:none` conditionnel.
- **P2-B — `GUIDED_TOURS.full` mort** (l.14400-14413) : 12 étapes définies, plus jamais appelées (remplacées par AUTO_DEMO). Code mort à supprimer (−14 l.).
- **P2-C — Slide 4 met la sécurité en avant** (l.1497) → contraire à la direction produit 19/06 (ne pas mettre la sécurité en avant sans vérif d'identité).
- **P2-D — Double sélecteur de langue** (l.1606 nav desktop + l.1705 auth) → risque d'état actif désynchronisé.
- **P2-E — `min-height:280px` rigide** sur `.onb-stage` (l.1123) → débordement possible sur très petits écrans.

---

## 6. SYNTHÈSE DES RECOS (priorisées)

1. **Onboarding : fondu PUR** (supprimer `translateY`+`scale`, garder opacity) — demande directe Maxime. §1.3 option A. *(2 min)*
2. **Démo : la régénérer courte (9 chap. récit geo-trigger), adressage par id, séparer du catalogue.** §4.3-4.4. *(gros chantier, fort impact)*
3. **Réduire le tunnel d'arrivée** : couper le tour automatique de 6 spotlights → 1 CTA action. §3.3 option A.
4. **Recadrer la copy onboarding + landing sur le geo-trigger**, sécurité en sourdine. §1.5 / §2.3.
5. **Corriger P1** (aria-label, chapitres désync, TAB_DEMO_IDX, texte « six étapes », captures).
6. **Nettoyer** : GUIDED_TOURS mort, double sélecteur langue, slide beta destructive.
