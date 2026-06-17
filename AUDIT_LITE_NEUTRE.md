# AUDIT LITE — « rendre neutre / aplatir / retirer » (17/06/2026)

> Audit multi-agents (5 agents, read-only) du mode **Lite** (`body.sm-lite`, `?lite=1`) vs l'objectif
> Maxime : **léger, neutre, basique, quasi-monochrome** — UN SEUL accent = corail `#FF5A4D`, tout le
> reste neutre, **zéro** dégradé / glass / halo / glow / tuile-joyau / texte-dégradé / sheen ;
> icônes monochromes ; **danger/SOS rouge JAMAIS neutralisé**. Mode complet (`?beta=1`) jamais touché.
> Hors périmètre (tranché par Maxime) : prénom Accueil `.hello-name` (reste corail) + la carte (marqueurs/boutons).
> Réfs `file:line` = `preview.html` (CSS source, ≈ index.html) ; calque = `sunmates-lite.css`.

---

## 🔴 P0 — CAUSE RACINE (1 ligne = ~80 % du problème visuel)

**`--accent-grad` n'est jamais aplati en Lite.** Le calque actuel aplatit `--grad-sunset`/`--grad-hero`
(tokens internes au calque), mais les **composants natifs** consomment `--accent-grad`
(`preview.html:275`, redéfini par thème — devient **vert** en tropic, **bleu** en glacier). Donc tout
bouton/chip/avatar/héros/logo « accent » rend un **dégradé** en Lite.

➡️ **Correctif n°1 :** `body.sm-lite { --accent-grad: var(--accent) !important; }`
Aplatit d'un coup : `.btn-primary` (437), `.chip.active` (990), `.seg/.mseg/.mode-switch/.sscope.on/.lang-seg` actifs,
`.avatar` (1497), `.detail-hero` (2185), `.invite-banner` (1988), `.completion-bar span` (2294),
`.pb-badge` (2309), `.popinfo-ic` (1109), `.pwa-ic/.pwa-cta` (697/701), `.brand .mark` logo (393),
`.bottom-nav button.active svg` (3267), `.fs-btn` (1266), `.mod-card` (616), `.auth-hero` (1522, le hero « SUNMATES »).
⚠️ À l'implémentation : exclure `.btn-danger` (441) → garder rouge danger plein.

---

## 🟠 P1 — FONDS & ATMOSPHÈRE (pas couverts par `--accent-grad`)

| Élément | `file:line` | Cloche | Action |
|---|---|---|---|
| Fond de page | `body{background:var(--bg-grad)}` 2509 / token 270 | dégradé radial pêche/corail sur TOUS les écrans | **APLATIR** → `body.sm-lite{background:var(--bg)!important}` |
| Halo soleil coquille | `.app-shell` radial 2752 (dusk 3012) | glow orange en haut d'écran | **RETIRER** → fond `var(--bg)` plat |
| Texture grain | `body::after` feTurbulence 2745 | grain `mix-blend-mode` global | **RETIRER** → `body.sm-lite::after{content:none}` |

---

## 🟠 P1 — DÉGRADÉS CODÉS EN DUR (hors token `--accent-grad`)

| Élément (écran) | `file:line` | Action |
|---|---|---|
| `.cic` tuiles catégorie **Lieux** (multicolore « joyau ») | 495-504 / sheen `::after` 1899 | **APLATIR** comme `.thumb` (crème + icône encre, glow off) |
| `.pcard-eco` (turquoise) / `.pcard-top` (ambre) / `.pcard-grad` overlay (Lieux) | 674 / 677 / 670 | **APLATIR** badges plats + overlay uni |
| `.avail-chip.on` « Dispo ? » (ambre + glow) Accueil | 596 | **APLATIR** → corail plein, glow off |
| `.spot-quick button` (ambre) Lieux | 862 | **APLATIR** → surface neutre |
| `.streak-chip` série (ambre nuit) Accueil | 2599/2603 | **APLATIR** |
| `.tip-card` Conseil sécurité (dégradé ambre nuit) | 1791/1793 | **NEUTRALISER** → `var(--card)` plat |
| `.chat-flame` / `.chat-poc` (orange) Chat | 2229 / 2249 | **RETIRER** (flammes = gaming) ou aplatir |
| `.presence-pill` « en ligne » (ambre/doré) Mates/Chat | 783-786 | **NEUTRALISER** → point corail `.sml-dot-on` |
| `.tph-online` badge en-tête chat (jaune) | 2211 | **NEUTRALISER** |
| `.tcard-vedette` « mate du jour » (ambre) | 1846 | **NEUTRALISER** |
| `.bubble.them` (rose chair `#ffe7e1` en dur) Chat | 2268 | **NEUTRALISER** → `var(--cream)` + filet |
| `.tpa-chal/.tpa-bff/.tpa-danger` actions profil mate | 2222-2225 | **APLATIR** ; `tpa-danger` = garder rouge **plat** |
| `.match-card h3` **texte en dégradé** | 816 | **NEUTRALISER** → encre |
| `.stat` chiffres profil **texte en dégradé** | 2675 | **NEUTRALISER** → encre/corail plein |
| Logo SVG `#sunG` soleil tricolore (Connexion) | 5069 | **NEUTRALISER** → monochrome corail/encre |
| Onboarding `.orb` (3 halos radiaux animés `orbFloat`) | 1355-1362 | **RETIRER** (`display:none` en Lite) |
| Onboarding `.onb-emoji` (drop-shadow + `floaty`) | 1379 | **RETIRER** ombre + anim |
| Landing desktop `.lp-grad`/`.lp-ico`/`.lp-num` (≥900px) | 4541/4563/4579 | **APLATIR/NEUTRALISER** si Lite desktop visé |

> ⚠️ Bug d'animation : le calque coupe `.float/.pulse/.shine/[class*="anim-"]`, mais `floaty` (onb-emoji)
> et `orbFloat` (orbes) tournent sur des classes non couvertes → **encore animés en Lite**.

---

## 🟡 P2 — GLASS / BLUR & GLOW / OMBRES COLORÉES

| Élément | `file:line` | Action |
|---|---|---|
| `.popinfo-ov` blur(3px) / `.sm-selsheet-ov` blur(2px) (desktop) | 1089 / 3443 | **NEUTRALISER** voile sans blur |
| Topbar header blur(14px) / landing `.lp-nav` blur(14px) | 4025 / 4515 | **NEUTRALISER** |
| Halos corail boutons (`rgba(255,90,77,.28-.45)`) `.btn-primary`/`.auth-play`/`.lp-cta` | 437/1541/4504 | **NEUTRALISER** → ombre neutre ou none |
| `.spot-emoji-pick button.active` (glow + translate) | 856-858 | **APLATIR** |
| `.search input` (ombre portée + bordure corail) | 982/2670 | **APLATIR** → box-shadow off, bordure neutre |
| `.completion-bar span` glow (6px) | 2564 | **RETIRER** glow |
| `.smgem` / sheen (Lite ne met que `opacity:.5`) | 1911 / 48-50 calque | **NEUTRALISER** (à plat, pas juste atténué) |
| Filtre relief emojis `.tip-ic/.su-ic/.onb-emoji` | 2340 | **RETIRER** `filter` en Lite (hors danger) |
| `.logo-text` text-shadow | 2583/2761 | **RETIRER** |

> Focus-ring `0 0 0 4px var(--accent-soft)` (427) : corail/a11y → **garder** (ou resserrer à 2px), au choix.

---

## ⚪ HORS-MVP À RETIRER (MVP = Sécurité + Rencontres + Lieux) — arbitrage Maxime

> **Constat structurel :** le calque masque le **bouton** de nav Jeux (l.366) mais **pas le panneau**
> `data-panel="jeux"` (6429) — encore atteignable par `goToTab('jeux')`, deep-link, visite guidée.

| # | Feature (Lite) | `file:line` | Reco |
|---|---|---|---|
| 1 | **Panneau Jeux entier** (plaque niveau, nav 6 tuiles, quête du jour) | 6429 | **RETIRER le panneau** (pas que le bouton) |
| 2 | Classement / leaderboard | 6480 / 1691 | **RETIRER** |
| 3 | Badges / collection / médailles | 6478 / 1860 | **RETIRER** — ✅ **garder badge Vérification** `#verifBadge` 5876 |
| 4 | Quêtes / missions / rituels | 6472 / 6488 / 2162 | **RETIRER** |
| 5 | Mini-jeux | 6473 / 1568 | **RETIRER** |
| 6 | Coupons | 6479 / 2176 | **ARBITRER** : liés à des lieux partenaires → garder ; pure récompense XP → retirer |
| 7 | Boutique XP / Gold | déjà `data-beta` ✓ / `.gold-hero` 3650 | garder masqué ; vérifier `.gold-hero` non atteignable |
| 8 | Espace Pro / B2B | 5899 / 6713 / 402 | **RETIRER** en Lite |
| 9 | Stats gaming profil (XP/parcours/souvenir) | 5887 / 5906 / 2423 | **RETIRER XP** — ✅ garder Mates + Check-ins |
| 10 | **Vouch / cercles de confiance** | 789 / 802 | ✅ **GARDER** (signal de confiance = MVP) |
| 11 | **Faux appel** | 1732 | ✅ **GARDER** (outil de sécurité) |
| — | Wording intro Lieux « classement 🏆 / Gold » | 5479 / 5532 | **CHANGER** le texte (retirer mentions jeu/Gold) ; check-ins gardés |

> Déjà masqués en Lite ✓ : easter eggs / retro-fx / badges secrets, boutique (data-beta),
> `#homeModeSwitch`/`#homeHomeMode`/feed/`#myTrips`/`#goldTile`, `#advFilters`.

---

## ✅ GARDE-FOUS RESPECTÉS (ne jamais neutraliser)
`.su-sos` halo rouge (1192 + calque 208), `.su-call` (1191), `.secu-urgent` (1181), `#navSecu` point SOS
ambre pulsant (1196, protégé section C du calque), pins `sosPulse`/`pinPulse`, `.bubble.me`/chips actifs
Mates **déjà** corail plat, `.thumb` **déjà** neutralisé, scrollbar/topbar/`.navbadge` conformes.

---

## 🎯 PLAN D'EXÉCUTION PROPOSÉ (preview-first, par vagues, scopé `body.sm-lite`)

- **Vague A (gros levier, faible risque)** : `--accent-grad: var(--accent)` + fonds/atmosphère (bg-grad, app-shell halo, grain) + halos/glow génériques. → ~80 % du rendu neutre.
- **Vague B (ciblée)** : dégradés en dur (`.cic` Lieux, `.pcard-*`, `.avail-chip`, `.tip-card`, `.presence-pill`, textes-dégradés, logo SVG, orbes/anim onboarding, blur modales).
- **Vague C (scope MVP, après arbitrage Maxime)** : masquer panneau Jeux + leaderboard/badges/quêtes/mini-jeux/Pro/XP ; garder vouch/check-ins/faux-appel/vérif ; reword intro Lieux.
- À chaque vague : vérif **dual-mode** (`?lite=1` plat vs `?beta=1` intact), 0 régression, rien poussé sans feu vert.
