# Audit v2 — 08 · Profil + Réglages + Transversal

Cible : `preview.html` (18 690 l) · `styles.css` (4 178 l) · `sunmates-lite.css` (1 078 l).
Code lu réellement. Duo product-designer + frontend-eng. Date : 2026-06-20.

Garde-fous rappelés : RPC = user connecté ; insert `events`/`app_feedback` connecté-only ;
pas de listing anonyme du bucket avatars. Lite = scopé `body.sm-lite` uniquement.

---

## 1. INVENTAIRE

### A. PROFIL — `data-panel="profil"` (l. 2512)

| Élément | Rôle | Ligne | Liens / handler |
|---|---|---|---|
| `onbDoneBanner` | bannière fin d'onboarding in-page | 2517 | `onbDoneCta`, `onbDoneClose` |
| `prof-head` (carte centrée) | avatar + nom + ville + trust | 2525 | — |
| `profileSettingsBtn` ⚙️ | ouvre les Réglages | 2526 | listener l. 14843 |
| `profileAvatar` 😎 | photo entière non rognée | 2528 | rempli par renderProfile |
| `verifBadge` / `profileHostBadge` | badge vérifié / hôte | 2529 | l. 7178 (vb) |
| `prof-trust` `data-stat="trust"` | score confiance compact + ⓘ | 2533 | → `openTrustModal()` l. 14640/14637 |
| `trustScore` | valeur | 2534 | écrit l. 7128 |
| `stat-row-3` (xp/mates/checkins) | 3 stats cliquables | 2539 | `data-stat` handler l. 14638 |
| `completionBox` / Fill / Txt | barre de complétion | 2544 | écrit l. 7039-7041 ; clic → edit l. 14658 |
| `profSegNav` (premium/pro/admin) | sous-onglets | 2549 | `data-pseg` |
| `profileBadges` | badges (display:none par défaut) | 2555 | rempli l. 10603 |
| `editProfileBtn` | ouvre l'édition | 2556 | l. 14659 |
| `prof-shortcuts` (lite-only) | raccourcis cercle/lieux/mates | 2558 | `data-tab` |
| `parcoursCard` | mon parcours + partage | 2564 | `shareParcoursBtn` |
| `prof-seg edit` | formulaire d'édition (sections dépliables) | 2572 | `pf-section`, `previewProfileBtn` |
| `verifyBtn` | demande de vérif (RPC) | 2731 | l. 7248 → `db.rpc("request_verification")` l. 7255 |
| `prof-seg admin` | bac à essai / migrations / conformité / releases | ~2960 | admin only |

### B. RÉGLAGES — `#settingsCard` (l. 3004)

| Élément | Rôle | Ligne | Handler |
|---|---|---|---|
| `settingsBack` | retour profil | 3005 | l. 14848 |
| `langSeg` (fr/en) | langue | 3011 | — |
| `setThemeToggle` 🌙 | mode sombre + **easter egg saisons (10×)** | 3017 | l. 17392 |
| **`seasonCtl`** (hidden) | **🎨 Ambiance saisonnière** (Normal/Hiver/Tropiques) | 3020 | l. 17324 ; CSS l. 543-556 |
| `soundToggle` | sons UI | 3031 | — |
| `presenceToggle` | présence en ligne | 3035 | — |
| `publicToggle` | profil public | 3039 | — |
| `showQrBtn` / `scanQrBtn` | QR partageable | 3045 | — |
| `cgvBtn` | conditions & confidentialité | 3049 | — |
| aide : visite guidée / écris-nous / avis beta | support | 3054-3056 | `data-secu`, `betaFeedbackBtn` |
| `betaToggle` 🧪 | bascule Lite/complète | 3062 | — |
| **`permNotifBtn`** 🔔 | autorisation notif | 3069 | l. 14854 → `askNotifPermission(true)` l. 18292 |
| **`permGeoBtn`** 📍 | autorisation géo | 3070 | l. 14855 → `askGeoPermission()` l. 18307 |
| `permNotifState` / `permGeoState` | état Actif/Bloqué/À activer | 3069-70 | `updatePermStates()` l. 18327 |
| `installAppBtn` / `replayOnbBtn` | app | 3075-76 | l. 14852/14851 |
| `logoutBtn` | déconnexion | 3078 | — |
| `setEmail`/`saveEmailBtn`, `setPassword`/`savePasswordBtn` | compte | 3081-88 | — |
| RGPD : `exportDataBtn`/`privacyBtn`/`deleteAccountBtn` | données perso | 3094-96 | l. 14880/14899/14858 |

### C. TRANSVERSAL

- Thème : `applyTheme()` l. 17233 ; auto coucher de soleil l. 17246 ; `:root` jour `styles.css` l. 6 (`--ink:#1d2230`, `--card:#fff`, `--accent:#FF5A4D`) ; `:root` nuit forcée auth l. 1064 ; `html:has(body.theme-*)` fonds l. 74-78.
- Saisons : `applySeason()` l. 17293, `setSeason()` l. 17310, `refreshSeasonCtl()` l. 17316, auto-météo l. 17329.
- Recherche globale accueil : `homeSearch` l. 1851 → `renderSearch()` l. 12904 (debounce 250 ms l. 12940), scopes l. 1853.
- Antispam : `once(key,fn)` l. 4835 (in-flight) ; `notifyOnce()` l. 4862 (dédup notifs, persisté localStorage).
- Permissions : `askNotifPermission` l. 18292, `askGeoPermission` l. 18307, `updatePermStates` l. 18327.

---

## 2. LES DEUX BUGS PRIORITAIRES (Maxime)

### 🔴 P0 — « Ambiances toujours illisibles dans les paramètres »

**Cause racine confirmée (CSS l. 549-556).** Le sélecteur `#seasonCtl .seg button` :
- état **inactif** : `color: var(--ink)` sur `background: color-mix(in oklab, var(--ink) 7%, transparent)`. C'est du **texte-couleur-X sur fond-couleur-X-à-7 %** : le contraste tient seulement parce que le 7 % se pose sur la carte. Fragile, et le label fait `.8rem` (petit).
- état **actif** : `color: var(--accent)` sur `background: color-mix(in oklab, var(--accent) 16%, transparent)`. En jour `--accent = #FF5A4D` (corail) : **corail sur tint corail pâle ≈ 2,5-3:1 → échec WCAG AA**. C'est l'onglet sélectionné qui devient le plus illisible — exactement le ressenti « illisible ».
- De plus la règle générique `.seg button.active { background: var(--accent-grad); color:#fff }` (l. 1300) est **surclassée** par `#seasonCtl` : on perd le contraste blanc-sur-dégradé qui marchait ailleurs, sans le remplacer par un équivalent lisible.

Aggravant : ce contrôle est **caché par défaut** (`hidden`, easter egg 10× ou admin) → quand il apparaît enfin, il n'a jamais été regardé en QA dans les deux thèmes, d'où « toujours » illisible.

**Options**
- **A (sûr, recommandé)** — Réutiliser le composant segment qui marche déjà partout : pour l'**actif**, `background: var(--accent-grad); color:#fff; font-weight:800` (≥ 4.5:1 garanti) ; pour l'**inactif**, `background: var(--card); color: var(--ink); border:1.5px solid var(--line)`. Zéro `color-mix` fragile. Ajouter `min-height:44px`.
- **B (DA audacieuse)** — Transformer en **3 vraies tuiles-vignettes** (mini-aperçu dégradé du thème : sable / cristal bleuté / lagon vert + label dessous, coche sur l'actif). Beaucoup plus parlant qu'un segment texte, raccord DA « coucher de soleil ».
- **C (minimal)** — Garder la structure, mais forcer le texte à `var(--ink)` dans les **deux** états et ne marquer l'actif que par `border-color:var(--accent)` + `box-shadow` (pas de fond teinté coloré). Lisible mais moins « premium ».

**Reco : B** (aligne l'« ambiance » sur un choix visuel, pas un toggle de texte) avec le filet de sécurité contraste de A.

### 🔴 P0 — « L'onglet notif autorisation ne déclenche rien »

**Le code est branché et fonctionnel** (listener l. 14854 → `askNotifPermission(true)` l. 18292). La fonction est une déclaration (hoistée), pas de doublon de listener, `smConfirmP` existe. Donc ce n'est **pas** un bug de câblage. Les vraies causes du ressenti « rien ne se passe » :

1. **Permission déjà `denied`** (cas le plus probable). l. 18296 : si `Notification.permission === "denied"`, on affiche seulement un `toast("🔕", "…bloquées dans les réglages du navigateur.")` **et on s'arrête** — aucun dialogue natif (le navigateur **interdit** de re-prompter après refus). Pour l'utilisateur = « rien ». Le toast (en haut, fugace) passe inaperçu, surtout si la pile de toasts est masquée derrière la modale ou le clavier.
2. **Permission déjà `granted`** : l. 18295 → `subscribePush()` silencieux + toast « déjà activées ✅ ». Encore « rien de visible » côté natif.
3. **L'état n'est pas assez visible** : `permNotifState` affiche « Bloqué » en `var(--danger)` (l. 524) mais en `.72rem` à droite — peu lisible, et **non cliquable** alors que le seul recours (réglages navigateur/OS) demande une action hors app.
4. **Confirmation préalable** : un clic ouvre d'abord `smConfirmP` (l. 18299) ; si l'utilisateur ferme/annule la modale, le dialogue natif ne s'ouvre jamais → « rien » côté système.

**Donc : pas un bug JS, un bug d'UX/feedback.** À vérifier en live : ouvrir Réglages avec notif refusées → on doit voir un toast et l'état « Bloqué ».

**Options**
- **A (recommandé)** — Quand `denied` : remplacer le toast par une **modale d'aide pas-à-pas** (« Tes notifications sont bloquées → voici comment les réactiver dans Chrome/iOS », avec icône cadenas du site). Rendre la pastille d'état **cliquable** (ouvre cette aide). Idem géo.
- **B** — Ne plus intercaler `smConfirmP` quand l'état est `default` : déclencher **directement** `Notification.requestPermission()` au clic (le bouton EST déjà l'opt-in explicite, contexte clair). Garde l'explication seulement en sous-titre du bouton. Réduit le nombre d'étapes avant « ça se passe ».
- **C** — Ajouter un retour **inline sous le bouton** (zone `perm-block`) plutôt qu'un toast : « ✅ Activées » / « 🔕 Bloquées — réactive dans les réglages » toujours visible.

**Reco : A + C.** Le manque, c'est le feedback et le chemin de sortie quand `denied` ; pas le déclenchement.

---

## 3. AUTRES PROBLÈMES (visuel + technique)

### Profil
- **`profileBadges` `display:none` par défaut** (l. 2555) : si le remplisseur (l. 10603) ne le ré-affiche pas, les badges restent invisibles → la « collection » disparaît du profil. À vérifier que `pb.style.display` est remis à `flex`. **P1.**
- **`prof-trust` clic** ouvre `openTrustModal` (OK) mais c'est un `div[role=button][tabindex=0]` : vérifier l'activation **clavier** (Enter/Espace) — le shim `KBD_SEL` (l. 91) inclut `.stat-click` ✅, donc OK.
- **Carte d'édition très longue** (sections 1-N dépliables) : bon pattern, mais l'`onbDoneBanner` + 3 cartes + parcours = beaucoup de scroll avant l'édition. Options : (A) garder, (B) replier le parcours par défaut, (C) ancre directe vers l'édition. **P2.**
- **`premiumBtn`** (l. 14663) : se contente d'un message « on te préviendra » — honnête (cf. mémoire « Premium honnête »). OK.

### Réglages
- **Densité** : ~20 contrôles empilés sans regroupement visuel fort autre que `set-grouptitle`. Les `set-grouptitle` sont alignés à gauche (l. 558) — OK mais peu hiérarchisés. Option : cartes/accordéons par groupe (Préférences / Autorisations / Compte / RGPD). **P2.**
- **`langSeg`** : pas de `data-i18n` sur les libellés des boutons (Français/English) — acceptable (auto-descriptifs). 
- **Changer email/mot de passe** : champs nus sous « Compte », sans `<form>` ni validation visible avant submit ; le commentaire l. 3085 note un fix autocomplete. OK fonctionnel. **P2** : ajouter feedback de force du mot de passe (min 8 annoncé).
- **`seasonCtl` visibilité conditionnelle** (l. 17319) : `show = (unlocked || seasonMode() || admin) && betaOn()`. En **Lite, jamais affiché** (correct, cf. mémoire « Lite = 2 DA »). Mais l'easter egg 10× est aussi gardé hors Lite (l. 17400) → cohérent.

### Transversal
- **Antispam global incomplet.** `once()` (l. 4835) protège du **double-clic concurrent** uniquement (in-flight), pas du **spam séquentiel** (cliquer 1×/s). Pas de **cooldown temporel** réutilisable. Les inserts connecté-only (`quote_requests` l. 14832, `app_feedback`, vouch, signalements) s'appuient sur `once()` au mieux. **P1** (voir plan §4).
- **Recherche : bonne couverture.** `homeSearch` est une **vraie** recherche serveur (`db.rpc("search_profiles")` + repli ilike, l. 12920-22), scopes Tout/Voyageurs/Lieux/Vérifiés, debounce 250 ms, `_deburr` accents. Les autres champs (convSearch, travSearch, cafeSearch, adminUserSearch, kbSearch, numbersSearch, questSheetSearch, pickerSearch) sont des **filtres locaux** — cohérents avec leur portée. Pas de recherche fantôme détectée. ✅
- **Motion** : transitions définies via `--mate-ease-out` (l. 591) et locales ; pas de `prefers-reduced-motion` global repéré dans cette zone. **P2 a11y.**
- **Cibles tactiles < 44px** : `perm-state`, `.sscope`, libellés `.seg button` (.55rem padding, .8rem texte) risquent < 44px de haut. **P1 a11y** (ajouter `min-height:44px` aux segments saison et scopes).
- **Contraste AA** : hors le bug saisons, `--muted:#a99fbe` (nuit) sur cartes sombres et `perm-sub`/`st-sub` à `.76rem` muted = à revérifier ≥ 4.5:1. **P2.**
- **Responsive < 360px** : `profSegNav` `flex-wrap` (OK) ; `seg` saison `flex:1` 3 boutons + emoji + texte `white-space:nowrap` (l. 552) → **débordement/troncature probable** sous 340px. **P1** (autoriser le wrap ou raccourcir les libellés).
- **Perf** : fichier monolithique 1,5 Mo ; pas de souci local à cette zone, mais `renderSearch` lance une RPC par frappe (debouncée) → OK.

---

## 4. PLAN ANTISPAM GLOBAL

Objectif : un seul utilitaire réutilisable couvrant double-clic **et** rafale.

1. **Étendre `once()` en `guard(key, {cooldownMs}, fn)`** : conserve le verrou in-flight (l. 4836) + mémorise `localStorage["sm_cd_"+key]=Date.now()` ; refuse si `now - last < cooldownMs` avec un toast « Doucement, réessaie dans Xs ». Rétro-compatible (`once` = `guard(key,{cooldownMs:0})`).
2. **Appliquer les cooldowns** aux écritures connecté-only sensibles :
   - `quote_requests` insert (l. 14832) → 60 s.
   - `request_verification` RPC (l. 7255) → déjà `once("verify")`, ajouter 24 h côté front (la RPC reste source de vérité).
   - vouch / signalement / `app_feedback` / `events` → 1 action / fenêtre, **toujours user connecté** (jamais d'insert anonyme).
   - export RGPD (l. 4880) / suppression compte (l. 14858) → 30 s anti-rafale.
3. **Boutons** : passer en `disabled` + libellé « … » pendant l'await (déjà fait sur certains via `m.textContent="Envoi…"`). Généraliser via un helper `withBusy(btn, fn)`.
4. **Garde-fou serveur** : rappeler que le front n'est qu'un confort ; les vraies limites (RLS + contraintes uniques + rate-limit RPC) restent la défense réelle.

---

## 5. SYNTHÈSE BUGS

| Sév. | Bug | Ligne | Fix |
|---|---|---|---|
| **P0** | Sélecteur saisons illisible (actif corail/sur-corail < AA ; inactif fragile) | 549-556 | actif = `accent-grad`+#fff ; ou tuiles-aperçu (option B) |
| **P0** | Notif « ne déclenche rien » = feedback absent quand `denied`/`granted` (pas un bug JS) | 18296, 18295 | modale d'aide réactivation + état cliquable + feedback inline |
| **P1** | `once()` sans cooldown temporel (spam séquentiel) | 4835 | `guard(key,{cooldownMs})` |
| **P1** | `profileBadges` `display:none` par défaut — vérifier ré-affichage | 2555 / 10603 | confirmer `style.display=flex` au render |
| **P1** | Cibles < 44px (seg saison, .sscope, perm-state) | 549, scopes | `min-height:44px` |
| **P1** | Saisons : 3 boutons `nowrap` débordent < 340px | 552 | wrap ou libellés courts |
| **P2** | Réglages denses, peu hiérarchisés | 3004+ | grouper en cartes/accordéons |
| **P2** | Pas de `prefers-reduced-motion` dans la zone | — | media query globale |
| **P2** | Profil : scroll long avant l'édition | 2515+ | replier parcours / ancre directe |
| **P2** | Contraste `--muted` petits sous-titres à revérifier | 523, st-sub | viser ≥ 4.5:1 |

**Cohérence Lite** : `seasonCtl` et l'easter egg correctement gardés `betaOn()` (l. 17319, 17400) ; `prof-shortcuts` est `lite-only` (l. 2558). Conforme à la règle `body.sm-lite`.
