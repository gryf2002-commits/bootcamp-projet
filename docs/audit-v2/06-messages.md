# Audit A→Z — MESSAGES (panneau `data-panel="connexions"`)

> Duo senior product-designer + frontend-engineer. Code lu : `preview.html`, `styles.css`, `sunmates-lite.css`.
> Rappel architecture : tout passe par Supabase côté client, **les RPC/requêtes sont scopées RLS sur l'utilisateur connecté** (je ne vois que MES messages / MES connexions). Le tri/agrégat « par conversation » est donc fait **côté client**.
> Accès : `💬` du header (`#topMsgBtn`, l.1812) → `goToTab("connexions")` + `showMatesSegment("messages")` (l.15286). L'onglet « Messages » de la barre du bas a été retiré (l.3348).

---

## 1. INVENTAIRE

| Élément | Rôle | Ligne(s) | Liens / dépendances |
|---|---|---|---|
| `#topMsgBtn` (💬 header) | Entrée unique vers Messages + badge non-lus `#topMsgCount` | HTML 1812 · JS 15286 · badge 15224 | `goToTab`, `showMatesSegment` |
| `data-panel="connexions"` | Conteneur de l'onglet | 2187 | 3 vues : `#matesHome` / `#matesProfile` / `#matesChat` |
| `#matesHome` > `h1` « Messages » | Titre | 2191 | i18n `mates.title` |
| Sous-titre « Tes conversations… file sur l'accueil » | Aide | 2192 | — |
| `#matesStatBtn` (🤝 Mates de confiance) | Compteur connexions → modale connexions | 2193 · count 9769 | `matesCount`, `myConnectionsList` |
| `#inviteFriendsBtn` | Bannière partage natif (growth) | 2196 | — |
| `.mseg` segmented | Sous-onglets Messages / (Découvrir masqué) / Demandes | 2202-2207 | `showMatesSegment` 14508 |
| `#segMsg` / `#segReq` | Badges non-lus / demandes sur les sous-onglets | 2203/2206 · 15223/15225 | `updateNotifBadges` |
| `#groupCard` / `#groupList` | Conversations de groupe | 2213 | masqué (migration `groupes.sql` non lancée) |
| `.conv-search` + `#convSearch` | Recherche conversations (filtre client) | HTML 2221 · CSS 528 · JS `filterConvs` 11284 | listener 11293 |
| `#convList` | Liste des conversations | HTML 2222 · CSS 617-668 · rendu 9737 | `loadConnections`, `appendDemoConvs` |
| `#requestsList` | Demandes de connexion reçues | HTML 2295 · rendu 9704 | `acceptConnection` 10003 |
| `#matesChat` | Vue chat | 2356 | `openChat` 11669 |
| `.chat-header` (`#chatProfileBtn`, `#chatName`, `#chatStatus`) | En-tête chat + accès profil | 2357-2362 · 11681-11695 | `openTravelerProfile` |
| `#chatFlame` / `#chatFlameN` | Flamme (streak) | 2363 · `renderChatFlame` 11813 | local `sm_flame_*` |
| `#chatMenu` (⋯) | Profil / Flammes / Notifs / Épingler / Bloquer / Supprimer | 2364-2374 · 11780 | `deleteConversation`, `toggleConvPin`, `blockUser` |
| `#chatBody` | Bulles | 2376 · `bubbleHtml` 11424 · `chatHtml` 11461 | réactions 11503+ |
| `.bubble-translate` | Bouton « 🌐 Traduire » par bulle | 11448 · `translateBubble` 17738 | MyMemory API |
| Réactions emoji | double-tap ❤️ / appui-long picker | 11503-11603 | `message_reactions` + repli local |
| `#voiceRec` / `#chatMic` / `#voiceStop` | Note vocale 30 s | 2377-2384 · `startVoiceRec` 11934 | bucket `voicenotes` |
| `#chatPoc` (🔥) | Envoyer une flamme | 2383 · 11824 | — |
| `#chatInput` / `#chatSend` | Saisie + envoi | 2385 · `sendChatMessage` 11984 | table `messages` |
| `demoChats` / `appendDemoConvs` / `renderDemoChat` | Conversations IA (démo) | 11606-11647 | local session |

---

## 2. ANALYSE PAR ÉLÉMENT

### 2.1 `#convList` — la liste de conversations (le cœur du problème Maxime)

**État.** Construite dans `loadConnections` (9727-9756). La règle actuelle est :
```
const convIds = [...connectedIds].filter((id) => !hiddenConvs.has(id));
```
→ **toute connexion acceptée devient une ligne de conversation**, qu'il y ait eu un message ou non. L'aperçu retombe alors sur le placeholder `"Toucher pour discuter 💬"` (9741) et l'heure est vide (9742).

**Problèmes.**
- 🐞 **TECHNIQUE (cause racine « conversations vides »)** : `convIds` = `connectedIds`, jamais filtré sur l'existence d'un message. Une simple connexion acceptée (zéro échange) s'affiche comme une « conversation ». C'est exactement le retour Maxime « conversations vides affichées ».
- 🐞 **TECHNIQUE (scalabilité aperçu)** : `lastByPeer` est calculé sur les **300 derniers messages globaux** (l.9663). Au-delà, l'aperçu/tri d'une vieille conversation est faux (heure vide alors qu'il y a des messages) → renforce l'impression « vide ».
- 🟡 **TECHNIQUE (tri)** : conversations sans message → clé de tri `""` (9729) → elles flottent en bas dans un ordre indéterministe.
- 🎨 **VISUEL** : une ligne « vide » est visuellement identique à une vraie conversation (avatar + nom + texte gris). Rien ne dit « pas encore de message ». Au mieux ce devrait être une invitation, au pire ça ne devrait pas être là.

**Options.**
- **A — Filtre strict (le plus proche du souhait Maxime).** `convIds` = connexions **avec au moins 1 message** (`lastByPeer[id]` présent) **OU** mate connecté **actif/en ligne** (`isActive(travelerMap[id])`). Les autres connexions vivent déjà dans « Mes connexions » (`#myConnectionsList`) et dans Demandes. Liste = vraies conversations.
- **B — Section « Démarrer une conversation ».** Garder la liste = uniquement messages réels ; sous un séparateur discret, lister les connexions sans message comme suggestions (CTA « Dis bonjour 👋 »). Plus riche, plus de code.
- **C — Statu quo + état visuel.** Garder toutes les connexions mais marquer les vides (badge « Nouveau · dis bonjour », style atténué). Ne règle PAS le retour « montre tout et n'importe quoi » : la liste reste polluée.

**Reco : A** (exactement la définition demandée : *conversation = ≥1 message OU mate connecté actif*), avec une touche de **B** plus tard si on veut un coin « démarrer ». Implémentation :
```js
const convIds = [...connectedIds].filter((id) =>
  !hiddenConvs.has(id) && ( lastByPeer[id] || isActive(travelerMap[id]) || isConvPinned(id) || id === myBffId )
);
```
(garder épinglés + BFF même sans message, sinon on les ferait disparaître).

---

### 2.2 `#convSearch` / `filterConvs` — la recherche (2e retour Maxime)

**État.** `filterConvs` (11284) masque/affiche les `.conv-open` par `indexOf` sur `nom + aperçu` du **dernier message uniquement**.

**Problèmes.**
- 🐞 **TECHNIQUE (« montre tout et n'importe quoi »)** : pas de seuil. À 1 caractère, le filtre tourne déjà ; un `q` court (« a ») laisse passer presque tout → sensation « ça ne filtre pas ». De plus le terme matche **l'aperçu** (`conv-preview`), donc taper « toi » matche toutes les convs où j'ai parlé en dernier (« Toi : … »), « 🤖 » matche toutes les démos, etc. → résultats sans rapport avec une recherche **par personne**.
- 🐞 **TECHNIQUE** : la recherche ne porte que sur le **dernier** message visible, pas sur l'historique ni sur la ville/le pseudo complet → « vraie recherche » impossible.
- 🟡 **TECHNIQUE** : aucune indication « 0 résultat » (toutes les lignes en `display:none`, liste qui paraît cassée).
- 🟡 **UX** : pas de bouton « effacer » (✕), pas de debounce (ok ici car filtre DOM local, mais à garder en tête si on requête le serveur).

**Options.**
- **A — Recherche par personne, seuillée.** Ne filtrer que sur le **nom du Mate** (pas l'aperçu), à partir de **≥ 2 caractères** (en dessous : tout afficher). Ajouter un état « Aucune conversation pour “q” » + bouton ✕. Simple, règle les 2 plaintes.
- **B — Recherche pertinente pondérée.** Nom (poids fort) + ville (`travelerMap[id].city`) + contenu du dernier message (poids faible) ; tri des résultats par score plutôt que masquage. Mieux, plus de code.
- **C — Recherche serveur full-text.** Requête `messages` ilike sur le contenu (scopée RLS). Vraie recherche dans l'historique, mais coût réseau + complexité (dédup par peer) — surdimensionné pour le MVP Lite.

**Reco : A maintenant** (matcher le **nom** seulement, seuil ≥ 2, état vide explicite, bouton ✕), **B** ensuite si on veut chercher par ville. Garder C pour plus tard.

---

### 2.3 Sous-onglets `.mseg` (Messages / Demandes)

**État.** `showMatesSegment` (14508) bascule les panneaux. « Découvrir » est `display:none` et redirige vers l'accueil (14511). Badges `#segMsg` (non-lus) / `#segReq` (demandes) posés par `updateNotifBadges` (15223/15225).

**Problèmes.**
- 🟡 **VISUEL** : segmented à 2 boutons seulement maintenant (le 3e masqué) → vérifier que le `.mseg` ne garde pas une largeur/anim calibrée pour 3 (l.610 dans `styles.css`). Risque de bouton « Messages » trop large vs « Demandes ».
- 🟢 RAS fonctionnel : la bascule marche, le badge `segReq` reflète `pendingRequestsList`.

**Options.** A — 2 boutons centrés à largeur égale. B — supprimer carrément le segmented et mettre « Demandes » en pilule à côté du titre avec son compteur. C — garder tel quel.
**Reco : A** (recalibrer le segmented pour 2 items) ; envisager **B** si Demandes reste vide la plupart du temps (économie d'espace mobile).

---

### 2.4 Épingle (`toggleConvPin`) + BFF

**État.** Pins en localStorage (`sm_pinned_convs_*`, 11280-11282), remontés en tête (9731-9732, sort stable). BFF (`myBffId`) épinglé tout en haut, classe `.conv-bff` (9733-9734). Toggle via menu ⋯ (11791) → re-`loadConnections`.

**Problèmes.**
- 🟡 **TECHNIQUE** : épingler relance `loadConnections()` **entier** (recharge profiles 1000 + conns + 300 messages) juste pour réordonner 2 lignes → lourd. Un simple re-tri DOM suffirait.
- 🟡 **UX** : aucune affordance d'épingle dans la **liste** (pas de swipe ni d'icône) — on doit ouvrir le chat → menu ⋯. Le `📌` n'apparaît qu'une fois épinglé (9751).
- 🐞 **MINEUR** : si un Mate est à la fois BFF et épinglé, double logique de tri (9732 puis 9734) — ok visuellement (BFF gagne) mais le badge affiché est `⭐ BFF` et masque le `📌` (9751), comportement correct mais non documenté.

**Options.** A — re-tri DOM local au toggle (perf). B — geste swipe-pour-épingler sur la ligne. C — bouton 📌 au survol/long-press de la ligne.
**Reco : A + C** (perf + affordance directe dans la liste).

---

### 2.5 `#matesChat` — bulles, vocal, flammes, typing, traduire, suppression

**État (globalement solide).**
- **Bulles** `bubbleHtml` (11424) : côté me/them, heure, suppression (mes messages, RLS), boutons quête/lieu, vocal, traduire. Séparateurs de jour (`chatHtml` 11461). Optimiste à l'envoi (12012-12017), repli hors-ligne file locale (12028-12034), retry au tap (12044-12049). Bon.
- **Typing + accusés lecture** : broadcast realtime sans table (11361-11400). Bon, éphémère.
- **Vocal** : 30 s, opus 24 kbps, upload bucket `voicenotes`, URL signée à la lecture (11934-11978). Bloqué pour démos (11936). Solide.
- **Flammes** : streak calendaire honnête, 1 poc/jour, countdown minuit (11800-11829). Bon.
- **Traduire** (17738) : consentement RGPD tiers une fois, MyMemory, 2e clic masque. Bouton affiché seulement si langues connues ≠ la mienne (11677-11680). Bon.
- **Suppression conv** (11765) : supprime MES messages (RLS), masque via `hiddenConvs`. Cohérent.

**Problèmes.**
- 🐞 **TECHNIQUE (réactions)** : `loadReactions`/`setReaction` (11517-11545) écrivent dans `message_reactions` en best-effort, repli localStorage. Si la table/migration `message_reactions` n'est pas en prod, les réactions sont **purement locales** (non partagées) sans le dire. À confirmer côté Supabase.
- 🟡 **TECHNIQUE (vocal)** : après envoi, `openChat(recipient)` **recharge tout le chat** (11967) au lieu d'append optimiste → flash + requête. Incohérent avec l'envoi texte (optimiste).
- 🟡 **TECHNIQUE (traduire)** : `confirm()` natif (17746) — hors DA (toute l'app utilise `smConfirmP`). Et `guessLang` ne gère que fr/en → traduire un message ES donnera fr→en faux.
- 🟡 **UX** : `markMyMessagesSeen` ajoute « ✓ Vu » uniquement à la **dernière** bulle me et seulement si l'autre est en ligne (broadcast) → pas de persistance « Vu » au rechargement. Acceptable pour MVP mais à noter.
- 🎨 **VISUEL** : `#chatStatus` écrit la même chose en ligne / hors ligne (11692, branche ternaire identique) — le `verifMark` + point ambré portent l'info, mais le code est trompeur (dead branch).

**Options (transverses).** A — corriger les points 🟡 un par un (append optimiste vocal, `smConfirmP` pour traduire, nettoyer la dead branch status). B — refonte chat « premium » (audio waveform, accusés persistés en table, langues auto i18n). C — laisser le chat tel quel (déjà bon) et ne traiter que le bloc liste/recherche (focus du retour).
**Reco : C en priorité** (le retour Maxime porte sur liste+recherche), puis **A** en passe de polish.

---

### 2.6 `#requestsList` — demandes de connexion

**État.** Rendu 9704-9711 : avatar + « souhaite se connecter » + bouton Accepter (`acceptConnection`). Exclut déjà connectés / bannis (9702). Empty-state correct (9709). Badge `#segReq` (15225).
**Problèmes.** 🟡 pas de bouton **Refuser/Ignorer** (uniquement Accepter) → on ne peut pas décliner proprement. 🟡 demandes **envoyées** (en attente côté moi) non listées.
**Options.** A — ajouter « Ignorer ». B — ajouter onglet « Envoyées ». C — statu quo.
**Reco : A** (Ignorer = hygiène de base), B plus tard.

---

### 2.7 Conversations démo IA (`appendDemoConvs`) — facteur aggravant du bug « vide »

**État.** `appendDemoConvs` (11630) insère en tête les chats IA ayant ≥1 message. Lui filtre **déjà** sur `(demoChats[id]||[]).length` → correct. Mais il `box.querySelector("p.muted")?.remove()` (11635) pour virer un éventuel placeholder.
**Problème.** 🐞 Si `#convList` est en **état vide** (`emptyState` rend `.empty`, pas un `p.muted`), le placeholder n'est PAS retiré et coexisterait avec une conv démo. Vérifier : `appendDemoConvs` cible `p.muted` (9754 produit `.empty`) → le retrait échoue. À corriger (cibler `.empty`).

---

## 3. BUGS PRIORISÉS

| Prio | Bug | Ligne | Détail |
|---|---|---|---|
| **P0** | Conversations vides affichées | 9728 | `convIds = [...connectedIds]` : toute connexion acceptée = ligne de conv, même sans message. → reco 2.1.A |
| **P0** | Recherche « montre tout et n'importe quoi » | 11284-11291 | pas de seuil + matche l'aperçu (« Toi : », « 🤖 ») → filtrer le **nom**, seuil ≥ 2. → reco 2.2.A |
| **P1** | Aperçu/tri faux sur vieilles convs | 9663 | `lastByPeer` borné aux 300 derniers messages **globaux** → conv réelle affichée vide/non triée |
| **P1** | Placeholder vide non retiré quand conv démo s'ajoute | 11635 vs 9754 | cible `p.muted`, l'empty-state est `.empty` → coexistence possible |
| **P1** | Réactions emoji potentiellement locales-only | 11522-11543 | si `message_reactions` absent en prod, non partagées, silencieux |
| **P2** | Épingler relance `loadConnections()` complet | 11791 | re-tri DOM suffirait (perf) |
| **P2** | Vocal : `openChat()` recharge tout après envoi | 11967 | incohérent avec l'envoi texte optimiste |
| **P2** | `confirm()` natif pour Traduire (hors DA) | 17746 | utiliser `smConfirmP` |
| **P2** | Pas de « Refuser » sur une demande | 9704 | seul « Accepter » dispo |
| **P2** | Segmented calibré pour 3 items (1 masqué) | 2202 / styles.css 610 | recalibrer pour 2 |
| **P2** | `#chatStatus` dead branch en-ligne/hors-ligne identique | 11692 | nettoyer |

---

## 4. SYNTHÈSE / CAP

1. **Définir « conversation »** = `≥1 message` **OU** `mate connecté actif` (+ garder épinglés/BFF) → règle le P0 « vides ». (2.1.A)
2. **Recherche réelle** = filtre sur le **nom du Mate**, seuil ≥ 2 caractères, état « aucun résultat », bouton ✕. (2.2.A)
3. Corriger le retrait du placeholder pour les convs démo (cibler `.empty`).
4. Polish chat (vocal optimiste, `smConfirmP`, status) en 2e temps — le chat est déjà solide.
