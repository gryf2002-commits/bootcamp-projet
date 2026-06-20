# SunMates v2 — Audit maître A→Z (20/06)

Audit complet écran par écran / feature par feature / tuile par tuile, par 8 agents senior (design + frontend) sur le vrai code. **Chaque section a son fichier** avec inventaire + options A/B/C + reco + bugs. Ce README = synthèse + décisions.

| # | Zone | Fichier |
|---|------|---------|
| 01 | Onboarding · Auth/Landing · Démos | `01-onboarding-auth-demos.md` |
| 02 | Accueil Voyage (header, geo, recherche, carte, feed, tuiles) | `02-accueil-voyage.md` |
| 03 | Accueil Maison · Mes Voyages (globe/wrapped/passeport) | `03-accueil-maison-voyages.md` |
| 04 | Lieux · Carte · Check-ins · Classement | `04-lieux-carte-classement.md` |
| 05 | Jeux | `05-jeux.md` |
| 06 | Messages | `06-messages.md` |
| 07 | Sécurité | `07-securite.md` |
| 08 | Profil · Réglages · Transversal (DA, recherche globale, antispam, a11y) | `08-profil-reglages-transversal.md` |

## 🔴 P0 — ce qui explique les griefs de Maxime (causes racines confirmées)
- **« Ici, maintenant n'active rien »** = la carte geo (#geoNowCard) reste **CACHÉE tant que la géoloc n'est pas accordée** → elle ne s'affiche jamais. Pas un problème de chip. (02)
- **« Recherche montre tout et n'importe quoi »** = `renderSearch` n'a **aucun seuil** (1 lettre → `ilike '%a%'`) ni **scoring de pertinence** ; côté messages `filterConvs` matche aussi l'aperçu (« Toi : », emojis). (02, 06)
- **« Conversations vides affichées »** = `convIds` = TOUTES les connexions acceptées, sans filtre « a au moins 1 message ». (06)
- **« Ambiances illisibles dans Réglages »** = bouton de saison ACTIF en corail sur fond corail pâle (~2.5:1, échec AA). (08)
- **« Notif autorisation ne déclenche rien »** = listener OK, mais si permission déjà refusée le navigateur bloque le re-prompt et on ne montre qu'un toast fugace → ressenti « rien ». Besoin feedback + modale d'aide. (08)
- **« Sécurité buggée + tuiles centrées bizarrement en Lite »** = 9 passes CSS Lite contradictoires (v541→v557), règles mortes ciblant une grille `display:none`, alignement non déterministe. À réécrire d'un bloc. (07)
- **« Header/logo pas flush »** = en fait alignés (space-between) ; le grief vient du **padding latéral 1.25rem** + du **backdrop-filter blur** (pavé flou). (02)
- **Onboarding** = transition garde `translateY±12+scale` (pas un fondu pur comme voulu) ; tunnel d'arrivée trop long. (01)
- **Démo datée** = 85 chapitres, texte « 6 étapes » faux, pointe des écrans déplacés, indexée par position (casse à chaque édition). À régénérer. (01)
- **Antispam absent** = `once()` n'est qu'un verrou anti-double-clic concurrent (pas de cooldown). **Alerte d'urgence / partage position re-déclenchables en rafale** → spam au cercle. (07, 08)

## ⚠️ INTÉGRITÉ / ANTI-TRICHE (chevauche le backend de cowork — à coordonner)
- **Check-in farmable** : ni `checkIn()` ni le RPC `redeem_checkin` n'imposent quota/cooldown → +10 trust à volonté. Avis sans check-in → faux « Top notés ». (04)
- **XP / défis solo farmables** via repli client `profiles.update({xp})`. (03, 05)
- **GOLD_QUEST promet « +50 points de confiance »** = viole la règle « quêtes = XP, jamais de confiance ». (05) → P0 produit.
- Plusieurs zones dépendent de migrations Supabase absentes (`trips`, `user_solo_log`, `host_status`) → repli local silencieux, données non cross-device.
> Ces points = surtout backend (cowork) : à lui signaler. Le front doit refléter les règles, pas les contourner.

## 🎨 ÉLÉVATION VISUELLE (opportunités v2, déviation DA autorisée)
- Header épuré (logo flush, retirer le flou), recherche premium (résultats scorés, états clairs).
- Onboarding = fondu pur + tunnel court + 1 vrai moment « waouh ».
- `#hmInspo` (inspiration du jour) → carte hero immersive (le moment d'évasion du mode Maison).
- États vides cohérents (cartes), couleurs hors-DA à rapatrier (verts classement/popups), micro-animations de gain (XP, check-in, level-up), motion soigné (GSAP possible).
- Carte/popups plus lisibles ; tuiles unifiées (un seul gabarit accueil/sécu).

## ✅ DÉCISIONS À PRENDRE AVEC MAXIME (il choisit, j'exécute)
Voir détail des options A/B/C dans chaque fichier. Décisions structurantes :
1. **Ordre v2** : intégrité/bugs d'abord (fondation) vs élévation visuelle d'abord (ce qu'il voit) vs interlacé.
2. **Ambition design** : garder l'ADN sunset en le modernisant, OU explorer une direction plus audacieuse.
3. **Onboarding** : fondu pur + version courte (3 écrans ?) — à confirmer.
4. **Démo** : régénérer en ~9 chapitres récit centrés geo-trigger, adressés par id.
5. **Recherche** : modèle « vraie recherche » (seuil ≥2, scoring, états) à généraliser partout.

## JOURNAL
- 20/06 : audit 8 zones réalisé (agents). Prod = v602. Prochaines actions = selon décisions Maxime.
