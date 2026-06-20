# Audit A→Z — Onglet JEUX

Cible : `preview.html` (+ `styles.css` + `sunmates-lite.css`). Lecture du code réel.
Périmètre : `data-panel="jeux"` (l.3101-3340) + son JS (l.9166-11270, 15542-16400, 18505-18550).
Rappel archi : prod = `app.html`, on bosse dans `preview.html` puis `cp preview→app`.

> ⚠️ **Le hub Jeux est un palimpseste.** Trois générations de widgets coexistent dans le même
> DOM : (1) la `player-hero` complète **masquée** (`display:none`, l.3123) dont les valeurs sont
> recopiées dans (2) le `playerBadge`/HUD visible (l.3110) ; (3) les widgets de progression
> d'origine **masqués** dans `#progSources` (l.3193) dont les `.prog-row` (l.3186-3189) ne sont que
> des **miroirs cliquables** qui re-lisent leur `textContent`. `renderGameHub` (l.15667) rappelle
> 6 renderers qui peignent dans le vide pour que `renderProgRows` (l.15614) recopie le résultat.
> **C'est fragile par conception** : un renderer qui change un libellé casse le miroir en silence
> (cf. le commentaire l.3158 « le DOM avait sauté → le renderer tournait dans le vide »).

---

## 1. INVENTAIRE

| Élément | Rôle | Ligne HTML | JS lié |
|---|---|---|---|
| `#jeuxHome` `.jeux-view` | vue principale du hub | 3104 | `renderJeux` 10571, `renderGameHub` 15667 |
| `.jh-head` + `#playerBadge` (HUD) | titre + plaque niveau (avatar/NIV/barre XP) | 3106-3118 | `renderPlayerHero` 15577, clic 15625 |
| `#jhNext` | « encore X XP pour niv N » (anticipation) | 3121 | renderPlayerHero 15610 ; clic 16349 |
| `#playerHero` (MASQUÉ) | vraie vignette niveau, source des valeurs | 3123-3135 (`display:none`) | renderPlayerHero 15577 ; clic 15690 |
| `#jeuxNav` JOUER/PROGRESSER | 6 tuiles de navigation (2+4) | 3141-3155 | listeners 18542 |
| `#questSpotlight` ⚡ Quête du jour | spotlight + toggle solo/À deux + Jouer | 3160-3176 | `renderQuestSpotlight` 15637, mode 16331, play 16338 |
| `.prog-card` `.prog-row`×4 | objectifs sem. / quête proche / collection / ville | 3185-3190 | clic 15669 ; sous-titres `renderProgRows` 15614 |
| `#goldNote` | bandeau Gratuit vs Gold | 3192 | clic 16347 |
| `#progSources` (MASQUÉ) | widgets sources (weeklyGoals/nearQuest/collection/capitale) | 3193-3215 | renderers 10096/15693/15741/15784 |
| `#suggestionsSection` | défis reçus d'un Mate (beta) | 3218-3221 | renderJeux 10741 |
| `#groupConfirmSection` | quêtes de groupe à confirmer (beta) | 3223-3227 | renderJeux 10760, `confirmGroupQuest` 10781 |
| `#questCounter` | compteur « x/3 aujourd'hui · n accomplies » | 3232 | renderJeux 10667 |
| `#jeuxSheet` | feuille overlay liste Quêtes / Jeux | 3236-3249 | `openJeuxSheet` 18505, `filterQuestSheet` 18517 |
| `#jeuxDetail` (`#questDetail` équiv.) | détail quête/jeu + validation | 3252-3288 | `openDetail` 10992, complete 11124 |
| `#detailCodeBox` / proof | code lieu OU note d'honneur (anti-triche) | 3272-3276 | `_completeQuestNow` 11100, `openQuestProof` 11136, submit 16306 |
| `#jeuxBadges` | grille badges + secrets + prestige | 3291-3299 | renderJeux 10685-10729, `showBadgeInfo` |
| `#jeuxCoupons` | liste coupons gagnés | 3302-3307 | renderJeux 10731, `useCoupon` |
| `#jeuxRank` | classement multi-segments + par ville | 3310-3322 | `renderLeaderboard` 9166 |
| `#jeuxShop` (beta) | boutique SunCoins (titres + cadres) | 3325-3338 | `renderShop` 10957, `selectShopItem` 10846 |
| mini-jeux | `CLIENT_GAMES` (6) + jeux BDD | 10418-10477 | `playGame` 10479 |

**Renderers orphelins / doublons** : `player-hero` (l.3123) + `xpBanner` (l.3216) + `nearQuestCard`
(l.3195) + `questCollection` (l.3204) + `capitaleDuJour` (l.3210) sont tous `display:none` et ne
servent que de **buffers**. `renderBadgeRail` (15655) peint `#badgeRail` qui n'existe pas dans ce
panneau (vestige du « HOME v2 »). XP banner (l.3216) : `renderJeux` le force à `display:none` (10591).

---

## 2. ANALYSE PAR ÉLÉMENT

### 2.1 Navigation JOUER / PROGRESSER (`#jeuxNav`, l.3141)
**État.** 2 tuiles primaires (Quêtes/Jeux) sous « 🎮 Jouer », 4 secondaires (Badges/Coupons/
Classement/Boutique) sous « 🏆 Progresser ». Couleurs alternées pour éviter 2 identiques côte à côte.
**Problèmes.**
- **VISUEL (P2)** : 6 tuiles + spotlight + carte-progression + goldNote + counter = le hub scrolle
  long alors que le commentaire l.3136 prétend l'avoir raccourci. On a déplacé les widgets, pas réduit
  leur nombre. Beaucoup de redites (« Quêtes » en tuile, en spotlight, en prog-row, en sheet).
- **TECHNIQUE (P2)** : la tuile **Boutique** porte `data-beta` (l.3153) → masquée en Lite, mais
  **Classement** ne l'a pas : en Lite on garde un onglet classement qui peut être hors-scope MVP.
- **VISUEL (P2)** : `data-smicon` sur chaque `cic` → si la banque d'icônes n'est pas injectée, on
  retombe sur l'emoji inline (ok), mais le `c-green` (Coupons) introduit un **vert** dans une grille
  censée rester sunset (cf. DA « pas de vert criard »).
**Options.** A — Fusionner « Jouer » en **un seul bloc** : Quêtes + Jeux + Spotlight forment une
section, Badges/Coupons/Classement/Boutique deviennent une **barre de 4 chips** discrète en bas.
B — Garder 6 tuiles mais **supprimer** spotlight OU prog-card (l'un des deux est redondant).
C — statu quo + retirer le doublon `questCounter` (déjà dans la sheet).
**Reco : A** — un seul point d'entrée « Jouer », le reste en navigation secondaire compacte.

### 2.2 Plaque de niveau / HUD XP (`#playerBadge`, l.3110 ; `renderPlayerHero` 15577)
**État.** Avatar + « NIV n » + barre + « inLvl/100 XP ». Clic → modale progression (15625). Lit
`myProfile.xp`, niveau = `floor(xp/100)+1`. Level-up fêté via `sm_last_level` (10581) ET via toast
dans `renderJeux` (10584) — **deux endroits** célèbrent le level-up.
**Problèmes.**
- **TECHNIQUE (P1)** : **double source de célébration de niveau** (10581-10588 dans renderJeux +
  l'XP banner). Risque de double toast/confetti au même franchissement. À unifier.
- **TECHNIQUE (P2)** : `playerHero` masqué reste rempli à chaque render « pour que le badge lise ses
  valeurs » — or `renderPlayerHero` remplit DÉJÀ directement `pbLvl/hudFill/hudXp` (15605-15608). Le
  bloc masqué est mort, on paie un render inutile.
- **VISUEL (P2)** : la barre XP du HUD n'a **aucune animation** de remplissage au gain (width posée
  sèchement). Le moment « +XP » est porté par une `popInfo` (11118) mais la barre ne « monte » pas.
**Options.** A — Supprimer `#playerHero` (l.3123) et tout le code qui le remplit ; le HUD devient la
seule source. B — Animer `hudFill` via transition CSS + un compteur d'XP qui s'incrémente. C — Les
deux. **Reco : A puis B** (nettoyage d'abord, délice ensuite).

### 2.3 Quête du jour (spotlight) (`#questSpotlight`, l.3160 ; 15637)
**État.** Tire `PARIS_QUEST_POINTS[_dayIdx() % 10]` (l.15639). Toggle Solo/À deux ajoute +50 % XP
affiché. Bouton « Jouer » : en groupe → onglet Connexions ; en solo → `openDetail(questByKey(key))`.
**Problèmes.**
- **TECHNIQUE (P0)** : le spotlight pioche dans **`PARIS_QUEST_POINTS`** (clés `quest_paris_*`) mais
  `questByKey` (10348) cherche dans **`allQuests`** (table `quests`). Les deux familles de clés
  coexistent en SQL, mais **rien ne garantit que les quêtes `quest_paris_*` sont seedées dans la table
  `quests`**. Si elles n'y sont pas, le bouton « Jouer en solo » (16341-16343) tombe dans le `else` et
  ouvre juste `jeuxHome` → **la quête du jour n'est pas jouable**. C'est exactement la classe de bug
  « renderer dans le vide » déjà vue. À vérifier en base, sinon **le spotlight ment**.
- **TECHNIQUE (P1)** : `_qsMode` est **global** (l.15574, défaut solo) ; il pilote le spotlight ET
  rien d'autre, mais le mode « À deux » du spotlight **n'envoie pas à la quête** : il redirige vers
  Connexions avec un toast, sans ouvrir la quête ni pré-remplir quoi que ce soit (16338-16339). Le
  bonus +50 % affiché n'est donc **pas réellement déclenchable** depuis ce bouton.
- **VISUEL (P2)** : `qs-mode` a un fond `rgba(255,138,61,.1)` **inline** (l.3171) — hors styles.css,
  difficile à thémer jour/nuit.
**Options.** A — Faire piocher le spotlight dans `allQuests` (quêtes du jour réelles, géolocalisées)
au lieu de la liste codée en dur ; « Jouer à deux » ouvre la quête puis `detailGroupBtn`. B — Garder
PARIS_QUEST_POINTS mais **garantir** leur seed + faire pointer « À deux » vers `openDetail`+suggest.
C — Supprimer le toggle du spotlight (le détail gère déjà solo/groupe). **Reco : A.**

### 2.4 Carte progression (`.prog-card`, l.3185) + sources masquées
**État.** 4 rangées miroir. Clic « goals » → modale qui **recopie `#weeklyGoals` innerHTML**
(15671) ; « collection » → `showCollectionSheet` ; « nearquest » → `showNearestQuests` ;
« capitale » → `$("capitaleDuJour").onclick`. Sous-titres remplis par `renderProgRows` (15614) qui
lit le `textContent` des widgets masqués.
**Problèmes.**
- **TECHNIQUE (P1)** : pattern **miroir-de-textContent** ultra-fragile. `renderProgRows` ne met le
  sous-titre que si `nqTitle !== "—"` etc. Avant le 1er `renderNearestQuest`, les rangées affichent
  leur libellé statique (« Active ta position pour la repérer ») même si la donnée existe. Ordre de
  render = source de bugs silencieux.
- **TECHNIQUE (P2)** : « capitale » dépend de `$("capitaleDuJour").onclick` posé par
  `renderCapitaleDuJour` (15717). Si la ville du jour < 2 villes, la tuile est `display:none` et
  `onclick` jamais posé → le clic prog-row tombe dans le `else` (15674) « pas de ville ». OK mais
  couplage caché.
- **VISUEL (P2)** : `c-green` sur la rangée « Ville à l'honneur » (l.3189) = encore du vert.
**Options.** A — Faire calculer les rangées **directement** dans `renderProgRows` (data, pas DOM),
supprimer `#progSources`. B — Garder les sources mais piloter par un **objet d'état** partagé plutôt
que par `textContent`. C — statu quo + corriger les couleurs vertes. **Reco : A** (tue le palimpseste).

### 2.5 Validation anti-triche (`_completeQuestNow` 11100, `openQuestProof` 11136, submit 16306)
**État.** Conforme à CLAUDE.md : quête à code → champ code obligatoire (11127) ; quête sans code →
**note d'honneur ≥3 caractères obligatoire** (16311) avant l'appel `db.rpc("complete_quest")`. Le
quota 3/jour + cooldown est **côté serveur** (RPC) ; l'UI affiche `x/3` + countdown (10674). L'XP est
bien séparé du trust (info l.10595). Quête de groupe → `request_group_quest` puis confirmation Mate
(`confirm_group_quest` 10781) = bonus partagé.
**Problèmes.**
- **PRODUIT (P0 — viole CLAUDE.md)** : la **GOLD_QUEST** (l.10297-10300) et sa carte (l.10651)
  promettent **« +50 points de confiance »** / « +50 pts ». La règle anti-triche dit *les quêtes ne
  donnent PAS de confiance, seulement de l'XP*. Texte EN aussi (l.4585). Même si c'est une quête démo
  admin, le **libellé public** contredit la promesse produit. À reformuler en « +50 XP ».
- **TECHNIQUE (P2)** : la note d'honneur n'est **pas envoyée au serveur** : `_completeQuestNow` est
  appelé avec `code=null` (16314) et la note reste locale (jamais persistée, jamais modérée). L'anti-
  triche « justification » est donc **cosmétique** côté serveur — seul le quota 3/jour protège
  réellement. Soit on persiste la note (modération), soit on assume que c'est un frein UX, pas une
  preuve.
- **TECHNIQUE (P2)** : le seuil « ≥3 caractères » (16311) accepte « aaa » → friction sans valeur.
**Options.** A — Persister la note dans `user_quests.proof_note` + la passer à la RPC (vraie trace).
B — Garder local mais relever le seuil + interdire répétitions triviales. C — Assumer note = nudge UX
et le documenter. **Reco : A pour la note, P0 GOLD_QUEST à corriger immédiatement (XP, pas confiance).**

### 2.6 Détail de quête (`#jeuxDetail`, l.3252 ; `openDetail` 10992)
**État.** Hero photo (questImage), stats (+XP, badge), stepper Rejoindre→En cours→Accompli,
description, récompenses (badge + coupon), code box, boutons d'état (Rejoindre / Marquer accompli /
Valider à deux / Proposer / Carte / Quitter). État « completed » → ligne cliquable avec date.
**Problèmes.**
- **VISUEL (P1)** : empilement de **5-6 boutons pleine largeur** (Rejoindre, Accompli, Groupe, +row
  Proposer/Carte, Quitter). Très chargé. La hiérarchie « une seule action principale » est commentée
  (11045) mais le résultat reste dense.
- **TECHNIQUE (P2)** : `detailCouponBox._wired` (11027) attache le listener **une fois** mais
  `currentQuest` est lu au clic (ok). Le `detailMsg` sert à la fois d'erreur, de statut et de bouton
  « détails » (11055) → état mêlé.
- **TECHNIQUE (P2)** : `+{x} XP · 👥 +{g} à deux` (10660) calcule `points*1.5` côté client ; si la RPC
  serveur applique un autre bonus, l'affiche **diverge** du gain réel.
**Options.** A — Réduire à 1 CTA primaire contextuel + un menu « … » pour secondaire. B — Séparer
zone statut (msg) et zone action. C — statu quo. **Reco : A + B.**

### 2.7 XP, paliers, niveaux
**État.** XP linéaire 100/niveau (`floor(xp/100)+1`). Titres par paliers (`_hubTitle` 15563, jusqu'à
niv 99 « Mythe vivant »). Modale d'info honnête (10592, 15681) : XP ≠ confiance.
**Problèmes.**
- **VISUEL/PRODUIT (P2)** : **courbe plate** (toujours 100 XP/niveau) → pas de sentiment de palier ;
  niveau 50 demande exactement autant qu'un niveau 2. Peu d'enjeu long terme malgré les titres.
- **TECHNIQUE (P2)** : 3 fonctions différentes recalculent `lvl = floor(xp/100)+1` (10579, 10963,
  15581, 15680) — dupliqué partout, pas de helper `levelOf(xp)`.
**Options.** A — Helper unique `levelOf/xpForLevel` + **courbe douce** (ex. `100 + (n-1)*25`).
B — Garder linéaire mais ajouter des **récompenses de palier** réelles (cosmétique offert tous les 5
niv). C — statu quo. **Reco : A (helper) + B (paliers).**

### 2.8 Badges : grille / secrets / prestige (`renderJeux` 10685-10729)
**État.** Catalogue `badges_catalog` (publics + secrets) avec repli sur les badges des quêtes si la
migration n'est pas lancée (10688). Non-débloqués grisés (`.locked`). Secrets **masqués** pour le
public, visibles seulement par l'admin (avec 🔒) — conforme CLAUDE.md. Couleur par **famille DA**
(exploration/social/sécurité/accomplissement, 10703). Confettis sur nouveau badge (10326), toast
résumé si >3 (10330).
**Problèmes.**
- **TECHNIQUE (P2)** : sans la migration `badges_catalog`, **aucun badge secret ni prestige** n'existe
  (repli = uniquement badges de quêtes, tous `is_secret:false`). Le système « prestige » dépend
  entièrement d'une migration que la mémoire dit non systématiquement lancée.
- **VISUEL (P2)** : `badgeCollCount` corrige le « 36/44 codé en dur » (10697) mais 3 autres compteurs
  (`openBadges .t-meta` 10725, `bh[0]` 10728, `badgeCollCount`) affichent des **dénominateurs
  différents** (`shown.length` vs `defs.length`) → l'utilisateur peut voir 12/20 ici et 12/24 là.
- **VISUEL (P2)** : `.bitem.locked` — vérifier le contraste du grisé en mode nuit (souvent illisible).
**Options.** A — Unifier tous les compteurs sur `{earned}/{shown.length}` via une variable. B — Seed
les secrets/prestige côté client en repli (au moins les afficher grisés/cadenassés). C — statu quo.
**Reco : A immédiat, B si la migration tarde.**

### 2.9 Boutique XP / SunCoins (`#jeuxShop`, l.3325 ; `renderShop` 10957)
**État.** **2 monnaies** : XP (progression, jamais dépensée) + **SunCoins** (dépensable). Titres
(12, l.10805) + cadres (7, l.10818). Achat via RPC atomique `sm_spend_coins` (10854), possession
persistée (`cosmetics_owned`), équipement local. Bonus quotidien +10 (`sm_claim_daily_coins` 10881).
Boosts retirés (« pay to win », l.3336, `shopBoosts` display:none).
**Problèmes.**
- **PRODUIT (P1 — incohérence de doc)** : le sous-titre HTML (l.3328) et la bannière (10967) disent
  « +15 SunCoins en quête » alors que **rien dans `_completeQuestNow` (11100) ne crédite de SunCoins**.
  Le gain de coins en quête dépend de la RPC `complete_quest` serveur (non visible ici) — si elle ne
  le fait pas, **la boutique promet une économie qui ne tourne pas** (seul le +10/jour alimente).
- **TECHNIQUE (P2)** : `renderShop` quitte tôt si `!betaOn()` (10958) → en Lite la boutique est morte,
  mais `claimDailyCoins` tourne quand même (7156) et crédite des coins **indépensables** en Lite.
- **VISUEL (P2)** : 12 titres + 7 cadres en `shop-grid` = mur de boutons ; pas de mise en avant du
  « prochain accessible » ni de tri par prix.
**Options.** A — Vérifier/garantir le crédit +15 coins serveur sur `complete_quest`, sinon corriger le
texte. B — Trier par coût + surligner le 1er achetable. C — Ne pas créditer le daily en Lite.
**Reco : A (cohérence économie) + B.**

### 2.10 Collection / Capitale du jour / Radar quête proche
**État.** Collection (15741) : barre quêtes géo + jauge « Villes explorées » (Tour de France).
Capitale (15693) : ville du jour rotative + fun-fact, pop-info puis « Explorer » centre la carte.
Radar (15784) : si `lastKnownGeo` → quête la plus proche en km ; sinon quête du jour + « Me localiser ».
Geofencing (15826) : toast quand on entre <250 m d'une quête (cooldown 2 h, hystérésis 450 m). Bon.
**Problèmes.**
- **TECHNIQUE (P2)** : `_questGeoList` (15773) bascule sur `PARIS_QUEST_POINTS` si `allQuests` n'a pas
  de quête géolocalisée → le radar/geofence peut pointer des **quêtes Paris non présentes en base**
  (même risque P0 que le spotlight : injouables au clic).
- **VISUEL (P2)** : capitale + collection + radar = 3 widgets très proches sémantiquement (tous «
  explore des villes »), redondants avec le spotlight et la carte d'accueil.
- **TECHNIQUE (P2)** : `renderCapitaleDuJour` n'affiche rien si < 2 villes (15696) → en démo mono-ville
  la rangée prog « Ville à l'honneur » reste sur son libellé statique.
**Options.** A — Source unique `allQuests` partout (radar/geofence/collection/capitale/spotlight) avec
PARIS_QUEST_POINTS en **repli explicite seedé**. B — Fusionner capitale+collection en un seul « Tour
de France ». C — statu quo. **Reco : A + B.**

### 2.11 Mini-jeux (`CLIENT_GAMES` 10418, `playGame` 10479)
**État.** 6 mini-jeux 100 % client (roue, brise-glace, quiz, 2 vérités/1 mensonge, décide, bingo),
banques enrichies, sessions finies (deck mélangé sans répétition, l.10460), records locaux (10465),
« Défier un Mate » → chat pré-rempli (10468). Indépendants de la base.
**Problèmes.**
- **PRODUIT (P2)** : les mini-jeux **ne rapportent ni XP ni coins** (l.10621 « rapides, sans XP »). Or
  l'objectif hebdo « Jouer à un mini-jeu » (10118) a `cur:0` codé en dur → **jamais validable**
  automatiquement. Promesse non tenue.
- **TECHNIQUE (P2)** : `_GM_LEN` (10461) ne définit pas `bingo`/`decide` → fallback 8, mais `decide`
  a `_GD.decide=null` (géré à part) ; vérifier que `_gmStart("decide")` n'est jamais appelé (sinon
  `_gmShuffle(null)` crash).
- **VISUEL (P2)** : `gh-teal`/`gh-indigo` headers (10633) introduisent des teintes hors palette sunset.
**Options.** A — Créditer un **petit gain de coins** plafonné (ex. +2, 1×/jour/jeu) + brancher
l'objectif hebdo dessus. B — Garder « pour le fun » mais retirer l'objectif fantôme. C — statu quo.
**Reco : A (boucle de récompense réelle) ou au minimum B (retirer la promesse fausse).**

### 2.12 Coupons / récompenses (`#jeuxCoupons` 3302 ; renderJeux 10731 ; détail 3262)
**État.** Liste `user_coupons`, bouton Utiliser → `useCoupon`, état « Utilisé » grisé. Empty state
correct (10736). Récompense affichée dans le détail (badge + coupon + note Gold).
**Problèmes.**
- **TECHNIQUE (P2)** : `useCoupon` non lu ici mais le coupon « Utiliser » est définitif côté client
  (opacity .55) — vérifier qu'il y a une **confirmation** avant de brûler un coupon (sinon clic
  accidentel = coupon perdu).
- **VISUEL (P2)** : le coupon dans le détail (`detailCouponBox`) répète la note Gold déjà présente
  ailleurs (l.3269) → sur-sollicitation Gold.
**Options.** A — Confirmation avant usage + état « expire le… ». B — Retirer la note Gold du détail.
**Reco : A.**

### 2.13 Classement (`#jeuxRank` 3310 ; renderLeaderboard 9166)
**État.** 4 segments (XP / check-ins / confiance / badges) + select ville. Opt-in explicite de
confidentialité (9181), ma position + tendance 📈/📉, repli si RPC `leaderboard` sans `p_city`.
**Problèmes.**
- **VISUEL (P1 — DA)** : la tendance « monte » est en **vert codé en dur `#1E7A5A`** (9195) et la
  ligne « tu es #n » en dégradé ambre. La DA interdit le vert ; la hausse devrait être en **ambre/or**,
  la baisse en `--danger`. Idem `#1E7A5A` repéré ailleurs (recoupe les autres audits).
- **TECHNIQUE (P2)** : filtre ville côté client en repli (9176) → si la RPC renvoie 30 lignes toutes
  villes confondues, le top-ville peut être **incomplet** (on filtre un échantillon, pas la base).
**Options.** A — Remplacer `#1E7A5A` par `var(--accent)` ou un or, garder ↑ vs ↓ par l'icône.
B — Toujours filtrer côté serveur (`p_city`). **Reco : A (rapide) + B.**

### 2.14 États vides & feedback de gain
**État.** Coupons (10736) et check-ins ont de vrais `emptyState`. Quêtes vides → texte technique
« Lance le script SQL pour voir les quêtes 🙂 » (10666) **exposé à l'utilisateur final**. Gains :
confetti (`celebrate`) + popInfo de victoire (11118) + toast.
**Problèmes.**
- **VISUEL/PRODUIT (P1)** : « Lance le script SQL… » (10666) est un message **développeur** visible en
  prod si la table `quests` est vide → fuite technique (le PENSE-BÊTE « pas de fuite backend » le
  proscrit). À remplacer par un vrai empty state.
- **VISUEL (P2)** : badges/leaderboard ont des `skel`/« Chargement… », mais **pas d'empty state** pour
  « aucun badge encore » (la grille montre tout grisé, ce qui est ok) ni « classement vide ».
- **VISUEL (P2)** : le gain d'XP n'anime pas la barre (cf. 2.2) ; le coin gagné n'a pas de « +N 🪙 »
  volant. Feedback présent mais peu « juteux ».
**Options.** A — empty states partout (quêtes vides, classement vide) + retirer le message SQL.
B — Micro-animations de gain (barre qui monte, chiffre qui s'incrémente, jeton volant). **Reco : A
(P1) puis B.**

---

## 3. BUGS PRIORISÉS

| # | Sévérité | Élément | Description | Ligne |
|---|---|---|---|---|
| 1 | **P0** | GOLD_QUEST | Quête promet « +50 points de **confiance** » → viole l'anti-triche (quêtes = XP only) | 10300, 10651, 4585 |
| 2 | **P0** | Spotlight / radar | Pioche `PARIS_QUEST_POINTS` (`quest_paris_*`) mais `questByKey` lit `allQuests` → si non seedées, « Jouer » n'ouvre rien | 15639, 16341, 15777 |
| 3 | **P1** | Boutique | UI promet « +15 SunCoins en quête » sans crédit visible côté client → économie potentiellement morte | 3328, 10967, 11100 |
| 4 | **P1** | Classement | Tendance en **vert `#1E7A5A` codé en dur** → hors DA sunset | 9195 |
| 5 | **P1** | États vides | « Lance le script SQL… » exposé au user final (fuite dev) | 10666 |
| 6 | **P1** | Spotlight « À deux » | Bouton groupe redirige vers Connexions sans ouvrir la quête → bonus +50 % non déclenchable | 16338 |
| 7 | **P1** | Niveau | Double célébration de level-up (renderJeux + xpBanner) → risque double toast/confetti | 10581 |
| 8 | **P1** | Détail quête | 5-6 CTA pleine largeur empilés → hiérarchie noyée | 3278-3286 |
| 9 | **P2** | Anti-triche | Note d'honneur jamais envoyée au serveur (code=null) → justification cosmétique | 16314 |
| 10 | **P2** | Mini-jeux | Aucun gain XP/coins + objectif hebdo « jouer un mini-jeu » à `cur:0` → invalidable | 10118, 10621 |
| 11 | **P2** | Badges | 3 compteurs avec dénominateurs divergents (`shown` vs `defs`) | 10697, 10725, 10728 |
| 12 | **P2** | Niveau | `lvl=floor(xp/100)+1` dupliqué dans 4 fonctions (pas de helper) | 10579, 10963, 15581, 15680 |
| 13 | **P2** | prog-card | Sous-titres = miroir de `textContent` → cassés si l'ordre de render change | 15614 |
| 14 | **P2** | DA couleurs | `c-green` (coupons, ville) + `gh-teal`/`gh-indigo` (jeux) hors palette sunset | 3151, 3189, 10633 |
| 15 | **P2** | Coupons | Vérifier confirmation avant « Utiliser » (sinon coupon brûlé par accident) | 10737 |
| 16 | **P2** | Lite | Daily coins crédités même en Lite où la boutique est désactivée (coins indépensables) | 7156, 10958 |

---

## 4. SYNTHÈSE & CAP

**Le hub Jeux fonctionne mais souffre de trois maux structurels :** (1) un **palimpseste DOM** (widgets
masqués servant de buffers, miroirs de `textContent`) qui rend chaque évolution risquée ; (2) une
**double source de vérité des quêtes** (`PARIS_QUEST_POINTS` codé en dur ↔ table `quests`) qui peut
rendre spotlight/radar/geofence **injouables** (P0 #2) ; (3) des **promesses non tenues** (confiance
sur GOLD_QUEST P0 #1, +15 coins P1 #3, mini-jeux sans gain P2 #10) qui fragilisent la confiance
produit et **frôlent la violation de CLAUDE.md** (anti-triche, pas de vert, pas de fuite backend).

**Audacieux (déviation DA OK) :** fusionner Quêtes+Spotlight+Jeux en **un seul « Terrain de jeu »**,
reléguer Badges/Coupons/Classement/Boutique en barre de chips, **animer réellement le gain** (barre
XP qui monte, jeton 🪙 volant, level-up unifié). Source unique `allQuests` partout. Économie SunCoins
cohérente de bout en bout. Anti-triche : persister la note (vraie trace de modération) ou l'assumer
comme nudge.

**Ordre conseillé :** P0 #1+#2 (corriger texte confiance + unifier la source des quêtes) → P1 #3-#8
(économie, DA vert, fuite SQL, CTA détail, level-up) → P2 (helper niveau, compteurs badges, animations).
