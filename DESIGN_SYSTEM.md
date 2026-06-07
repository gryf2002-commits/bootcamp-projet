# ☀️ SunMates — Design System « Coucher de soleil »

> Le dossier de référence visuel complet de SunMates.
> Tout ce qui rend l'app reconnaissable au premier coup d'œil — couleurs, formes,
> mouvement, et le moteur d'icônes/badges 100 % sur-mesure — est consigné ici.
>
> **Règle d'or :** *« Aucun pixel générique. »* Chaque emoji, icône et badge est une
> création maison qui n'existe nulle part ailleurs. Si ça pourrait venir d'une banque
> d'icônes gratuite, ça n'a pas sa place dans SunMates.

---

## Sommaire
1. [Âme & principes](#1-âme--principes)
2. [Palette — la lumière du couchant](#2-palette--la-lumière-du-couchant)
3. [Thèmes jour / nuit](#3-thèmes-jour--nuit)
4. [Typographie](#4-typographie)
5. [Formes, profondeur & ombres](#5-formes-profondeur--ombres)
6. [Le moteur d'icônes (`sunmates-icons.js`)](#6-le-moteur-dicônes-sunmates-iconsjs)
7. [Le moteur de badges (`sunmates-badges.js`)](#7-le-moteur-de-badges-sunmates-badgesjs)
8. [Loi de contraste — pourquoi rien ne se noie](#8-loi-de-contraste--pourquoi-rien-ne-se-noie)
9. [Mouvement & micro-délice](#9-mouvement--micro-délice)
10. [Composants signature](#10-composants-signature)
11. [Accessibilité & robustesse](#11-accessibilité--robustesse)
12. [Gouvernance — comment étendre sans casser la DA](#12-gouvernance--comment-étendre-sans-casser-la-da)

---

## 1. Âme & principes

SunMates est une app **« sécurité d'abord »** pour les voyageurs solo. Sa direction
artistique traduit ce mélange unique : **la chaleur d'une rencontre au coucher du soleil
+ la confiance d'un lieu sûr.** D'où une DA **chaude, vibrante, généreuse**, jamais
froide ni clinique.

**Les 5 principes durables :**

1. **DA coucher de soleil.** Corail → orange → ambre → or, ponctué d'accents teal et
   violet. Pas de vert criard, pas de bleu corporate, **pas d'ivoire / crème** (banni :
   « hors DA »). Les statuts « validé / en ligne » restent dans la gamme sunset.
2. **Tout est sur-mesure.** Chaque pictogramme est dessiné en SVG dans nos moteurs.
   On peut repenser une forme du tout au tout tant qu'elle reste reconnaissable et
   colle à l'ambiance.
3. **Niveau « œuvre / badge d'arène ».** Émaillé, biseauté, brillant, pensé au pixel.
   Matières (or, émail, verre, galaxie), lumière haut-gauche cohérente, sertissage,
   rim-light. C'est le **strict minimum** exigé, pas un bonus.
4. **Intelligent / LOD (Level Of Detail).** Deux niveaux : joaillerie en grand,
   version `lite` simplifiée en petit (pas de craft gaspillé, pas de bouillie).
5. **Des clins d'œil partout.** Le logo qui change jour/nuit, les confettis-soleils,
   le toggle soleil↔lune… L'app doit donner le sourire.

---

## 2. Palette — la lumière du couchant

### Couleurs de marque (tokens `:root`)

| Token | Hex | Rôle |
|---|---|---|
| `--accent` | `#FF5A4D` | **Corail** — couleur principale, CTA |
| `--accent-2` | `#FF8A3D` | Orange chaud |
| `--accent-3` | `#FFC93C` | Ambre / doré |
| `--accent-grad` | `135deg #FFC93C → #FF8A3D → #FF5A4D` | Dégradé sunset signature |
| `--accent-soft` | `#fdeceb` | Corail très pâle (chips, fonds d'icône) |
| Teal | `#19b36b` / `#1f9e8c` / `#34c98f` | Accent sécurité / éco / « validé » |
| Violet | `#7a5cff` / `#9b7bff` | Accent social / nuit / mystère |
| Or | `#FFD15C` / `#E8961F` | Accomplissement, métal des badges |

### Couleurs fonctionnelles
`--ok #22c55e` · `--danger #ef4444` (réservées aux états système ; **jamais** comme
couleur décorative — le « validé » visible utilise le teal/ambre de la DA).

### Matières (les dégradés qui font le « waouh »)

Le secret du rendu « œuvre » : on ne peint pas des aplats, on peint des **matières**
avec un dégradé radial décentré (lumière haut-gauche à ~`36% 28%`) allant du highlight
clair au bord sombre. Bibliothèque partagée `SM2_DEFS` (présente dans les deux moteurs) :

| Gradient | Matière | Usage |
|---|---|---|
| `sm2-sunset` | Coucher de soleil radial | grandes surfaces chaudes |
| `sm2-coral` | Corail émaillé | cœurs, épingles, accents |
| `sm2-gold` / `sm2-gold-cab` | Or brossé / or cabochon | métal, étoiles, couronnes |
| `sm2-teal` | Émail teal | sécurité, globe |
| `sm2-violet` | Améthyste | social, nuit |
| `sm2-amber` | Ambre miel | assiettes, bois, lumière |
| `sm2-galaxy` | Galaxie iridescente | badges **secrets** |
| `sm2-spec` | Spéculaire blanc | reflet vif (petit highlight) |
| `sm2-gloss` | Glaçage | bombé brillant du dessus |
| `sm2-halo-warm` / `-cool` | Halo lumineux | aura derrière l'emblème |
| `sm2-shadow` | Ombre de contact | ancrage au sol |
| `sm2-drop` | `feDropShadow` chaud | ombre portée des objets |

> ⚠️ Le blanc pur (`#fff`) est autorisé **uniquement** comme reflet/rim/highlight,
> jamais comme masse de remplissage (sinon ça vire « ivoire » = hors DA).

---

## 3. Thèmes jour / nuit

Tout est pensé pour **deux mondes**. Chaque écran, icône et badge doit être lisible
dans les deux. Plusieurs thèmes existent (sable, ivoire-espresso, pastel…) mais les deux
piliers sont :

| | Jour (défaut) | Nuit |
|---|---|---|
| `--bg-grad` | `radial #ffe6d2 → #fdeee7 → #fbe9e4` | `#171026` (prune profond) |
| `--card` | `#ffffff` | `#221a33` |
| `--ink` | `#1d2230` | `#f3ecf6` |
| `--text` | `#454b59` | `#ded3e6` |

**Pourquoi les icônes/badges traversent les deux :** ce sont des médaillons/joyaux
**auto-portés** (fond + matière + ombre intégrés au SVG). Ils ne dépendent pas du fond
de la page → ils brillent autant sur sable clair que sur prune sombre. La nuit, les
halos chauds (`sm2-halo-warm`) les font littéralement rayonner.

Clin d'œil signature : le **logo et le toggle de thème** dessinent un **soleil** le jour
et une **lune** la nuit (SVG bespoke injecté par `applyTheme`).

---

## 4. Typographie

| Police | Graisses | Usage |
|---|---|---|
| **Fraunces** (serif optique) | 700 / 800 / 900 | Titres, chiffres héros — apporte l'âme « chaleureuse éditoriale » |
| **Manrope** (sans géométrique) | 600 / 700 / 800 | Corps, UI, labels — lisible et moderne |

Règle : Fraunces pour l'émotion (titres, gros nombres), Manrope pour l'information.

---

## 5. Formes, profondeur & ombres

### Rayons
`--radius 22px` (cartes) · `--radius-sm 14px` · `--radius-lg 28px` · `999px` (pilules).

### Ombres (chaudes, jamais grises neutres)
```
--shadow      : 0 14px 40px rgba(255,90,77,.12), 0 4px 12px rgba(20,20,40,.05)
--shadow-sm   : 0 6px 18px rgba(20,20,40,.06)
--shadow-pop  : 0 18px 50px rgba(255,90,77,.22)
--ring        : 0 0 0 4px rgba(255,90,77,.16)   /* focus / sélection */
```
Toutes les ombres sont **teintées corail** → elles « réchauffent » au lieu de salir.

### Échelle de z-index nommée
Centralisée dans `:root` (`--z-header` 50 → `--z-confetti` 6000) pour éviter les
conflits d'empilement. Toujours réutiliser ces tokens, ne jamais écrire un z-index brut.

---

## 6. Le moteur d'icônes (`sunmates-icons.js`)

API : `window.SMIcon(name, {size})` renvoie un `<svg>` ; `SMIconRender()` parcourt le DOM
et remplit automatiquement tout `[data-smicon="name"]` + les loupes `.search > .ico`.
Les défs (`sm-ico-*` + `SM2_DEFS`) sont injectées **une seule fois**.

**Pattern d'intégration** (dans `index.html`) :
```html
<div class="cic" data-smicon="quest"></div>   <!-- l'emoji reste en fallback -->
```
Si le module ne charge pas → l'emoji d'origine reste affiché (dégradation propre).

### Deux styles d'icônes
- **Tuile-joyau** (`.cic` / `.jo-ic`) — icône **or métallique** (`sm-ico-iv`, gradient
  `#FFF2C2 → #FFD15C → #E8961F`) posée sur une **tuile bombée** au dégradé sunset
  (`--c1`/`--c2` par tuile) + gloss `::after` + rim-light + ombre chaude. L'icône porte
  une ombre portée (`sm-ico-drop`).
- **Chaude sur carte** (recherche, cloche, sécurité) — icône **colorée** (corail / teal /
  or / violet) sur fond clair de carte.

### Couleur par tuile (contraste garanti)
| Tuile | `--c1 → --c2` | Logique |
|---|---|---|
| quest, near, usolo | corail `#FF8A3D→#FF5A4D` | énergie |
| games, users, chat | violet `#FF7A59→#7a5cff` / `#7a5cff→#9b7bff` | social |
| eco, phone, shieldsafe | teal `#34c98f→#1f9e8c` | sécurité / éco |
| **medal, rank, rating, coupon** | **bronze `#E8A33A→#B25A12`** | achievement — l'or clair de l'icône **éclate** sur le bronze profond |
| shop, popular, alert, aid | rouge/corail | commerce / alerte |

> 💡 **Pourquoi le bronze ?** Une icône or sur une tuile or se noie. On garde la
> sémantique « médaille dorée » mais on assombrit la tuile → contraste de valeur
> (clair sur foncé) au lieu de or-sur-or.

### Catalogue (≈ 28 icônes)
`coffee, eco, near, rating, popular, quest, games, medal, coupon, rank, shop, trip,
users, shieldsafe, usersolo, crown, phone, signal, alert, aid, chat` (tuile) ·
`search, bell, firstaid, safetravel, report, history, contact` (chaude).

---

## 7. Le moteur de badges (`sunmates-badges.js`)

API : `window.SMBadge(badgeKey, {secret, size, lite})`. Auto-détection des secrets via
`SMBadge.setSecrets(catalogue)`. 22 emblèmes, 5 familles, repli emoji si absent.

### Anatomie d'un badge
`cadre par famille` + `disque/cabochon interne` + `emblème central` + `rim-light`
(`sm-light`) + `ombre portée` (`sm-drop`) + (non-lite) **balayage de brillance** animé.

### 5 mondes, 5 directions artistiques distinctes
Chaque famille a **son** cadre et **son** fond — c'est ce qui rend la collection riche :

| Famille | Cadre | Disque interne | Pop |
|---|---|---|---|
| **Exploration** | étoile-boussole laiton (`ex-brass`) | **ciel de crépuscule indigo étoilé** (`ex-leather`) | emblèmes chauds qui éclatent sur le bleu nuit |
| **Social** | rosace 12 pétales émaillés | émail corail→violet (`so-enamel`) | chaleureux |
| **Sécurité** | blason acier + rivets (`se-steel`) | cœur teal (`se-core`) | confiance |
| **Accomplissement** | soleil rayonnant + laurier (`ac-gold`) | cœur prune profond (`ac-core`) | l'or rayonne |
| **Secret** | **galaxie iridescente animée** (`lg-galaxy` + `lg-irid`) | étoiles scintillantes | mystère, condition cachée |

> Le passage du disque Exploration **cuir brun → ciel crépusculaire indigo** est
> l'application directe de la *loi de contraste* (§8) : emblème chaud sur fond froid.

### Les 22 emblèmes (objet `EM`, viewBox `0 0 64`)
Exploration : `explorer` (skyline), `explorer5` (routard), `questmaster` (carte au
trésor), `welcome` (empreintes), `firstcheckin`, `adventure` (fusée), `coffee`,
`photographer`, `culture` (colonnes). Social : `local`, `polyglot`. Sécurité :
`guardian_helper` (veilleur), `verified`. Accomplissement : `profile100`, `reviewer`
(bulle + étoile), `night`, `foodie`. Secrets : `globetrotter` (planète + orbite),
`butterfly`, `legend`, `guardian` (ange), `nightowl`.

### États
- **Verrouillé** → filtre CSS `grayscale(.9) opacity(.5)`.
- **Secret verrouillé** → médaillon galaxie sombre avec « **?** » iridescent (la
  condition reste cachée au public ; seul l'admin voit le détail).
- **`lite`** (petit) → supprime grain, animations et fioritures pour rester net.

---

## 8. Loi de contraste — pourquoi rien ne se noie

Trois règles, appliquées partout, pour qu'un objet **détache toujours** de son fond :

1. **Température opposée.** Objet chaud → fond froid, et inversement.
   *Ex. :* emblèmes ambre Exploration sur disque indigo ; icône or sur tuile bronze.
2. **Contraste de valeur.** Highlight clair de l'objet (`#FFF2C2`, `sm2-spec`) vs bord
   sombre du fond. Un objet clair lit sur n'importe quoi de mi-foncé.
3. **Couture (rim + ombre).** Chaque objet posé porte une **ombre de contact**
   (`sm2-shadow` / `sm-ico-drop`) et souvent un **rim-light** clair → une « couture »
   qui le décolle du fond, même à couleur proche.

C'est cette loi (pas le hasard des couleurs) qui garantit la lisibilité en **jour comme
en nuit**.

---

## 9. Mouvement & micro-délice

| Effet | Où | Détail |
|---|---|---|
| **Balayage de brillance** | badges (non-lite) | bande blanche oblique qui traverse, `dur 3.6s` infini |
| **Galaxie animée** | badges secrets | rotation `22s` + halo qui respire `3.2s` |
| **Confettis maison** | déblocages, matchs | soleils / cœurs / étoiles SVG (pas de carrés génériques) |
| **Retour tactile** | toutes tuiles/boutons | `:active { transform: scale(.97) }` |
| **Soleil ↔ lune** | toggle thème | morphing SVG jour/nuit |

> **`prefers-reduced-motion` respecté** : toutes les animations se coupent pour les
> utilisateurs sensibles au mouvement. Le délice ne se paie jamais en accessibilité.

---

## 10. Composants signature

- **Tuile-joyau** — la brique visuelle phare (cf. §6). Dégradé bombé + gloss + rim + ombre.
- **Pastille `.smgem`** — mini tuile-joyau réutilisable pour harmoniser les emojis hors
  tuiles (listes coupons, stats parcours…).
- **États vides brandés** — médaillon dégradé + icône maison + CTA (jamais un texte triste).
- **Hero de détail** — bandeau `--accent-grad` plein écran.
- **Toasts en haut** — retours visibles près de l'action (jamais collés en bas, invisibles).
- **Barre de défilement thémée** — corail, jamais blanche système.

---

## 11. Accessibilité & robustesse

- **Repli emoji systématique** : si un moteur SVG ne charge pas, l'emoji d'origine reste
  → l'app n'est jamais « cassée », jamais de carré vide.
- **Défs injectées une seule fois** (id-gardés) → pas de doublons SVG, perf maîtrisée.
- **`prefers-reduced-motion`** coupe les animations.
- **Cibles tactiles** généreuses (tuiles ≥ 60 px), `-webkit-tap-highlight-color: transparent`.
- **Contraste** garanti par la loi du §8, vérifié jour + nuit via audit Puppeteer
  (`_audit_full.html`).

---

## 12. Gouvernance — comment étendre sans casser la DA

**Avant d'ajouter un visuel, se poser ces questions :**

1. Est-ce **chaud** et dans la gamme sunset (corail/orange/ambre/or + accents teal/violet) ?
   Pas d'ivoire, pas de vert/bleu criard.
2. Est-ce une **matière** (dégradé radial + highlight + ombre), pas un aplat ?
3. Respecte-t-il la **loi de contraste** (§8) sur fond clair **et** sombre ?
4. A-t-il une version **`lite`** lisible en petit ?
5. Y a-t-il un **repli emoji** ?
6. Si animé : **`prefers-reduced-motion`** géré ?

**Workflow de création (éprouvé) :**
agent design pour l'art-direction → assemblage SVG dans le moteur → rendu via Puppeteer
(profil Chrome **isolé**, jamais le Chrome de l'utilisateur) → itération sur le visuel
réel → bump du Service Worker + `?v=` → déploiement.

**Ne jamais :**
- coder un visuel générique « propre / Lucide » (rejeté en bloc : « on perd l'âme »).
- utiliser ivoire/crème comme masse, ou blanc pur en remplissage.
- écrire un z-index brut (utiliser les tokens `--z-*`).
- toucher au Chrome de l'utilisateur pendant les tests.

---

*Document maintenu à la main. Versions des moteurs : voir `?v=` dans `index.html` et
`CACHE` dans `sw.js`. Dernière refonte majeure : élimination totale de l'ivoire +
disques de famille contrastés + audit jour/nuit (SW v187).*
