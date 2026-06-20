# Audit A→Z — Onglet SÉCURITÉ (SunMates)

Source lue : `preview.html`, `styles.css`, `sunmates-lite.css`.
Périmètre : `data-panel="securite"` (mode complet + Lite via `#topSecuBtn`).
Principe directeur retenu : **la sécurité doit rassurer, pas angoisser** — calme par défaut, urgence à 1 geste, jamais de double-déclenchement involontaire.

---

## 1. INVENTAIRE

### Structure
Le panneau `securite` (preview.html **l.2393**) contient 2 sous-vues :
- `#secuHome` (**l.2396**) — accueil rassurant : SOS + 8 tuiles « Accès rapides ».
- `#secuHelp` (**l.2442**) — « Besoin d'aide » : actions critiques + ICE + cercle + aide proximité + conseils + signalement + préférences.

En **mode complet**, on bascule entre les 2 via `showSecuView()` (**l.12563**).
En **Lite**, `showSecuView()` retourne tôt (**l.12564**) et le CSS empile `#secuHelp` (order 1) au-dessus de `#secuHome` (order 2) sur **une seule page** (`sunmates-lite.css` l.810-814).

### Éléments

| # | Élément | Rôle | Ligne (HTML) | Handler / liens |
|---|---------|------|--------------|-----------------|
| 1 | `#topSecuBtn` | Accès Sécurité (header) — **Lite uniquement** (masqué en complet, l.948 css) | 1808 | `data-tab="securite"` ; badge `#navSecuLite` |
| 2 | `#sosLogo` 🆘 | Ouvre `secuHelp` (complet) ; **inerte en Lite** (`pointer-events:none`, css l.760) | 2401 | listener l.9436 → `showSecuView("secuHelp")` |
| 3 | `#needHelpBtn` | « J'ai besoin d'aide » → `secuHelp` (masqué en Lite, css l.744) | 2404 | l.12571 |
| 4 | `#safetyCheckCard` / `#allGoodBtn` | « Je vais bien » (apparaît APRÈS une alerte) | 2410 | `setAlertActive` l.9286 |
| 5 | `#safetyTip` | Conseil du jour (rotatif, géo-pays) — masqué en Lite (css l.658/996) | 2419 | `renderSafetyTip`, `showSafetyTipBrowser` l.12561 |
| 6 | Grille `.grid2` (8 tuiles `data-secuquick`) | Faux appel, Signal, Position, Alerte, Rentrée, Cercle, Aide proximité, Numéros | 2425-2435 | listener l.17170 |
| 7 | `#emergencyBtn` 🚨 + `tel:112` | Alerte d'urgence / appel 112 | 2449-2450 | l.9265 (alerte), `<a href="tel:112">` |
| 8 | `#shareLocBtn` | Partager position (sans urgence) | 2453 | l.9254 → `sendLocation(false…)` |
| 9 | `#iceCard` / `#iceList` / `#iceAddBtn` | Contacts ICE (local, privé) | 2461-2465 | `renderIce` l.9442 |
| 10 | `#circleCard` / `#circleLocList` / `#refreshCircleBtn` | Cercle de confiance (positions partagées) | 2468-2474 | `loadCircleLocations`, repliable `data-coll` |
| 11 | Grille « aide autour » (police/hôpital/lieux/mate/numéros/support) | 6 tuiles `data-help` | 2478-2487 | `handleSecu` via `data-help` |
| 12 | Conseils & secours (`data-coll="conseils"`) | Collapsibles premiers secours / voyage solo | 2489-2493 | `handleSecu("secours"/"voyage")` l.12786+ |
| 13 | Sécurité & confidentialité | « Signaler un voyageur » | 2495-2499 | `handleSecu("reportmenu")` l.12703 |
| 14 | Préférences | « Qui peut me contacter » | 2501-2504 | `handleSecu("contact")` |
| 15 | Faux appel | Écran d'appel simulé (100 % local) | 1371 / 9539 | `#fakeCallBtn` l.9590, `startFakeCall` l.9539 |
| 16 | Numéros par pays | Liste géo + recherche | 12841+ | `openNumbers` |
| 17 | Rentrée en sécurité | Minuteur « bien arrivé·e » | 9302 | `openSafeArrival` |

---

## 2. ÉTAT & PROBLÈMES PAR ÉLÉMENT (avec options)

### A. Rendu Lite « buggé » (priorité Maxime) — `#secuHome`/`#secuHelp`

**État.** En Lite tout est sur une page : `secuHelp` (urgences) en haut, `secuHome` en bas, navigation supprimée. Le hero SOS est masqué (css l.781), un titre `#liteSecuTitle` est ré-injecté en JS (l.18209), plusieurs tuiles `secuHome` masquées (l.782-786, 942-944, 996-997), les 3 outils (Faux appel/Signal/Rentrée) fusionnés en une bande « Outils de sécurité » injectée dans la carte Conseils (l.18166).

**Pourquoi c'est cassé (causes réelles) :**
1. **Empilage de couches contradictoires.** Le rendu Lite Sécurité a été ré-écrit **9 fois** (v541→v557) en CSS, chaque passe annulant la précédente sans nettoyer. Ex. : `#secuHome .grid2 .tile` reçoit un layout « ligne horizontale » détaillé (css l.908-915, v554) **puis** toute la grille `#secuHome > .grid2` est mise `display:none` (l.996-997, v557). → **des dizaines de règles mortes** sur des éléments invisibles ; impossible à raisonner, source de régressions à chaque retouche. **(P1, css l.660-1027)**
2. **Double titrage.** Le vrai `#secuHome > h1` est masqué (css l.813) ET un `#liteSecuTitle` est injecté (l.18212). Si `betaOn()` n'est pas encore résolu au 1er passage, ou si le panneau était déjà titré, on risque un titre vide/doublon. **(P2, l.18207-18215)**
3. **`#sosLogo` inerte mais toujours présent visuellement** dans `secuHome` (css l.760) — l'emoji 🆘 reste affiché alors qu'il ne fait rien ; sur certaines passes le hero entier est masqué (l.781), sur d'autres non → **incohérence selon l'ordre de cascade**. **(P2)**
4. **Bande « Outils de sécurité » dépendante de `popInfo`/`closePicker`** (l.18173-18186) : ouvre un sous-menu puis re-clique la tuile d'origine après 140  ms. Tuile d'origine = `[data-secuquick]` qui est `display:none` en Lite → le clic synthétique fonctionne (display n'empêche pas `.click()`), mais c'est **fragile** (dépend de 2 timers + 2 fermetures de modale). **(P2, l.18177-18187)**

**Options.**
- **A — Refonte propre (recommandé).** Supprimer tout le bloc Lite Sécurité v541→v557 et le réécrire en UN bloc unique : (1) un seul layout de tuile partagé accueil/sécu, (2) masquages regroupés en haut, (3) zéro `display:none` sur un élément déjà stylé en ligne. Gain : fin du yo-yo de régressions.
- **B — Patch ciblé.** Garder l'existant mais retirer les règles mortes (tout `#secuHome .grid2 .tile {…}` puisque la grille est `display:none`), corriger le double-titre, masquer franchement `#sosLogo`. Rapide mais la dette reste.
- **C — Statu quo + commentaire.** Ne rien toucher, documenter. À éviter : Maxime signale déjà le bug.

**Reco : A**, sur preview, vérif Playwright dual-mode (`?lite=1` et complet) avant push.

---

### B. Tuiles « centrées bizarrement » (`#secuHelp`/`#secuHome` `.grid2`)

**État.** Conflit d'alignement entre 2 systèmes :
- Mode **complet** : tuiles centrées (`.tile` = colonne, texte centré ; styles.css l.4067-4074).
- Mode **Lite** : on force `flex-direction:row; text-align:left` (css l.908-909) MAIS seulement sur certaines passes ; `#secuHome .grid2` finit masqué (l.997) donc seul `#secuHelp .grid2` reste, avec un mélange règles row (l.908) / centrage hérité.

**Problème VISUEL.** En Lite, `#secuHelp` montre les tuiles d'aide (police/hôpital/numéros/support) ; selon la cascade gagnante elles oscillent entre « petits carrés centrés » (jugé moche par Maxime, cf. commentaire css l.904-905) et « lignes à gauche ». Le `.thumb` ayant `width:34px;flex:0 0 auto` mais le `.t-name`/`.t-meta` en `width:auto` (l.912-915) → alignement instable selon largeur de label.

**Problème TECHNIQUE.** L'alignement dépend de l'ORDRE des règles `!important` de même spécificité (0,4,2 vs 0,4,1) entre v554 et v555 → non déterministe à la lecture.

**Options.**
- **A — Un seul gabarit de tuile** `.lite-tile-row` (icône 40px + corps flex:1 + chevron), appliqué à TOUTES les grilles Lite (accueil + sécu), défini une fois. Recommandé.
- **B — Garder grille 2 colonnes centrée** (comme le complet) mais homogénéiser : même `min-height`, `place-items:center`, supprimer les overrides row. Plus simple si Maxime préfère le format carré.
- **C — Liste pleine largeur** (1 colonne `.qrow`) pour l'aide proximité, cohérent avec « Conseils & secours » juste en dessous.

**Reco : A** (cohérence accueil/sécu) ou **C** si on veut le format « bande » que Maxime réutilise déjà ailleurs.

---

### C. Antispam sur actions sensibles (SOS / Alerte / Position / Signalement)

**État actuel.**
- `sendLocation()` (partage + alerte) est enveloppé dans `once("loc:sos"/"loc:share")` (**l.9273**).
- `report_user` est enveloppé dans `once("report:"+id)` (**l.12721**).
- `#emergencyBtn` passe par `smConfirm` (**l.9266**) ; `#shareLocBtn` par `popInfo` confirm (l.9255).

**Problème TECHNIQUE — `once()` n'est PAS un antispam.** `once(key, fn)` (**l.4835**) est un **simple verrou de ré-entrance** : il ajoute la clé pendant l'exécution puis la **supprime en `finally`** (l.4839). Donc :
- Dès que l'alerte précédente a résolu (~1-2 s après le `insert`), **un nouveau clic re-déclenche immédiatement** une alerte. Aucune fenêtre de cooldown.
- En cas d'urgence répétée (panique, double-tap nerveux), on peut **spammer `locations_realtime` d'alertes** → bruit pour le cercle, et potentiellement coût/quota Supabase. C'est précisément le « pas d'antispam partout » signalé.
- Le **112** (`<a href="tel:112">`) et le **faux appel** n'ont aucun garde-fou (acceptable pour 112 ; pour le faux appel, ré-armement multiple possible).
- Le **signalement** est protégé côté serveur (RPC `report_user`, « 1 par personne »), donc OK côté logique ; mais le bouton lui-même n'a pas de cooldown UI (re-clics → re-RPC qui échoue proprement).

**Problème VISUEL/UX.** L'alerte se confirme par un toast puis redevient immédiatement cliquable, sans état « alerte active depuis Xs » sur le bouton lui-même (la carte `#safetyCheckCard` apparaît, mais le `#emergencyBtn` ne se grise pas).

**Options (pour SOS/Alerte/Position).**
- **A — Vrai cooldown temporisé (recommandé).** Helper `cooldown(key, ms)` distinct de `once()` : après un envoi réussi, bloquer le même type d'action ~30-60 s, avec le bouton **désactivé + libellé « Alerte envoyée ✓ (réactivable dans 45 s) »**. Rassurant (on voit que c'est parti) ET anti-spam.
- **B — Anti-doublon par contenu.** Réutiliser le motif `once("msg:"+recipient+":"+text)` (l.12020) : ne pas ré-insérer une alerte si une non encore expirée existe déjà (`locations_realtime` `is_emergency` < 1 h). Évite les doublons sans bloquer une vraie 2e alerte légitime.
- **C — Confirmation seule (statu quo+).** Garder `smConfirm` mais ne rien ajouter. À éviter : ne résout pas le spam post-confirmation.

**Reco : A pour l'alerte (cooldown 45 s + état visuel) + B pour le partage de position** (anti-doublon 1 h, pas de blocage dur). Le faux appel : `once` re-armement OK, mais ajouter un garde si un faux appel est déjà en cours (`#fakeCall:not(.hidden)`, cf. l.18555).

---

### D. Cercle de confiance / ICE / Numéros / Conseils (état rapide)

- **ICE (`#iceList`)** — local, privé, clair. OK. Reco : confirmer la suppression d'un contact (smConfirm) — actuellement à vérifier dans `renderIce` (l.9442).
- **Cercle (`#circleCard`)** — repliable `data-coll`, fallback Lite au 1er chargement (l.18189-18197) ; ce fallback « clique » le head si `localStorage` null → **risque de repli/dépli involontaire** si `collapsibleCards` a déjà posé l'état. P2.
- **Numéros par pays** — données en dur (l.12841-12864), 112 partout en UE, fallback « essaie le 112 » si pays non listé (l.12890). Solide et rassurant. OK.
- **Conseils & secours** — collapsibles `<details>`, fermés à la nav (l.18219-18221). Bon. Premiers secours pointent toujours vers le 112 d'abord (ton responsable). OK.
- **« Qui peut me contacter »** — `handleSecu("contact")`, libellé d'état dans `#contactPrefVal`. OK.

---

## 3. BUGS — P0 / P1 / P2

| Sév. | Bug | Emplacement | Détail |
|------|-----|-------------|--------|
| **P0** | **Alerte d'urgence re-déclenchable sans cooldown** → spam d'alertes au cercle / inserts `locations_realtime` en rafale. `once()` n'est qu'un verrou de ré-entrance, pas un cooldown. | preview.html **l.9271-9295** (`sendLocation`), helper l.4835 | Filet de sécurité = doit être fiable ET non abusable. Cooldown 45 s + état visuel du bouton (option A/B §C). |
| **P1** | **Rendu Lite Sécurité = empilement de 9 passes CSS contradictoires** (règles mortes sur éléments `display:none`, layout instable). Source des « affichage buggé » + « tuiles centrées bizarrement ». | sunmates-lite.css **l.655-1027** (surtout 908-915 vs 996-997) | Réécrire en un bloc unique (option A §A) ; supprimer les règles ciblant `#secuHome .grid2 .tile` (grille masquée). |
| **P1** | **Tuiles aide `#secuHelp .grid2` : alignement non déterministe** (row vs centré selon ordre de cascade `!important`). | sunmates-lite.css **l.904-915** | Un seul gabarit de tuile (§B option A/C). |
| **P2** | **Double titre Lite** : `#secuHome>h1` masqué + `#liteSecuTitle` injecté ; risque titre vide/doublon selon timing. | preview.html **l.18207-18215** ; css l.813 | Injecter une seule fois, ou démasquer le h1 natif au lieu d'injecter. |
| **P2** | **Bande « Outils de sécurité » fragile** (2 timers + closePicker + re-clic d'une tuile `display:none`). | preview.html **l.18166-18187** | Appeler directement `startFakeCall`/`openSafeArrival`/signal au lieu de re-cliquer la tuile masquée. |
| **P2** | **`#sosLogo` 🆘 affiché mais inerte en Lite** (affordance trompeuse selon la passe gagnante). | sunmates-lite.css l.760 / l.781 | Le masquer franchement OU le rendre cliquable (scroll vers les actions). |
| **P2** | **Fallback repli Cercle** peut basculer l'état si `collapsibleCards` a déjà agi. | preview.html **l.18189-18197** | Gérer l'état initial dans `collapsibleCards` (l.12688) plutôt qu'un clic synthétique après coup. |
| **P2** | **Partage de position sans anti-doublon** : re-clics → positions multiples insérées. | preview.html l.9254-9295 | Anti-doublon 1 h (§C option B). |

---

## 4. SYNTHÈSE / PRIORITÉS

1. **P0 — Cooldown réel sur l'Alerte** (et état visuel rassurant du bouton). C'est LE point « filet rassurant, pas anxiogène » + anti-abus.
2. **P1 — Réécrire le bloc Lite Sécurité** d'un seul tenant (supprime règles mortes + fixe centrage tuiles + double-titre). Résout les 2 retours Maxime d'un coup.
3. **P2 — Nettoyages** : `#sosLogo` Lite, bande outils sans re-clic, anti-doublon position, fallback cercle.

Garde-fous : preview-first, scope strict `body.sm-lite` (ne pas toucher au flux SOS complet), vérif Playwright dual-mode, bump `sunmates-badges.js?v=` + SW au push.
