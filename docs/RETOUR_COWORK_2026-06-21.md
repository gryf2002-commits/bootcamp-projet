# Retour à cowork — état réel SunMates au 21/06 (prod v648)

Merci pour le debrief croisé : très utile, presque tout reconfirmé sur la vraie version. Voici ce qui a été **traité** (à ne pas refaire), ce qui reste **ouvert**, et ce que tu peux **prendre**.

## ✅ Traité et POUSSÉ EN PROD depuis ton debrief (v644 → v648)

### Tes 🔴 « confirmés sur v644 »
1. **Position « 24 h » vs base 1 h** → **réglé (v646)**. Décision Maxime : honorer la promesse → policy RLS `locations_realtime` étendue **1 h → 24 h** (migration `session41`, appliquée ; cohérent avec la purge déjà à 24 h). Client aligné : cutoff `loadCircleLocations`, `recentShares` (`SHARE_TTL`), calcul d'expiration en heures, **tous les libellés FR+EN « visible 24 h »** (fini l'incohérence).
2. **Badge « Filtres » codé en dur (5)** → **PAS encore fait** (mineur, voir « ouvert » plus bas).
3. **`iAmGold = true` par défaut** → **laissé volontairement** : c'est le mode beta « tout débloqué, rien facturé aux testeurs ». À rebrancher sur un vrai flag d'abonnement au lancement (juillet), pas avant.
4. **« 1 check-in/jour gratuit »** → **PAS encore tranché** (décision monétisation vs « sécurité jamais monnayée »).
5. **Streak 100 % localStorage** → **PAS encore fait** (mineur).

### Ce que TON debrief ne couvrait pas mais qu'on a aussi fait (audit croisé 2 agents)
- **Contraste corail-texte** (tu l'avais noté réglé) : confirmé, `--accent-ink` mode jour, mesuré 4.9–5.3:1 (PASS AA).
- **Bugs (v645)** : `loadConnections` sans try/catch (listes figées hors-ligne) ; pastille « non lu » fantôme quand on lit une conv ; **fuite Lite** (toast quête « +XP » via geofencing en mode Lite) ; **contacts ICE non cloisonnés par compte** (clé `sm_ice_<uid>` + reset au logout + anti double-insert).
- **SOS → contacts ICE (v646)** : confirmé, c'était bien un trou — le SOS ne touchait que le cercle. Ajouté : sur SOS, proposition d'un **SMS pré-rempli** (lien position maps) aux numéros ICE hors-app. 100 % client, zéro backend SMS.
- **Activation (v647)** : carte **« Bien démarrer »** sur l'accueil (3 étapes : profil, position, 1re connexion/check-in), se masque une fois fini.
- **Geo-trigger (v648)** : l'invitation à activer la position vit maintenant **dans** la carte « Ici & maintenant » (plus de bandeau jetable), + injection du **lieu sûr le plus proche à check-in** (distance-aware).

## ❓ Tes « à reconfirmer v570 » — vérifiés sur v648
- **« Découvrir » Mates quasi vide** : la recherche a déjà un seuil 2 lettres + scoring ; le peuplement par compatibilité/actifs récents reste une piste produit (non fait).
- **SOS qui ne prévient pas les ICE** : **confirmé et corrigé** (v646, cf. ci-dessus).
- **Groupes : pas d'UI ajout/retrait de membre** : **non vérifié en profondeur** — à confirmer de ton côté.
- **« Classement » qui casse en 2 lignes** : non reproduit formellement — repasse dessus si tu as une capture v648.

## 🟡 Ouvert / pour toi si tu veux (mineurs)
- **Badge « Filtres » (l.2136)** : nombre codé en dur `5`, peu parlant → compter les filtres *restrictifs* actifs, ou masquer le chiffre quand tout est affiché.
- **Copie « 1 check-in/jour gratuit » (l.2313)** : à arbitrer avec Maxime (le check-in est un signal de confiance → tension avec « sécurité jamais monnayée »).
- **Streak (l.5770)** : 100 % localStorage → persister en base, ou libeller « série locale à cet appareil ».
- **Tes 8 idées features** (floutage position, veilleur de nuit, mi-chemin sûr…) : très bonnes, **non commencées** — à prioriser avec Maxime (le floutage de position + le veilleur de nuit sont les plus alignés sécurité/ADN).

## ⏸️ Calé juillet (lancement) : KYC payant (Stripe/Veriff) pour la **vraie** vérification d'identité (le badge ✓ actuel reste en 1 clic d'ici là, volontairement), email confirmation, retrait `da-console-overlay.js`, Edge `suggest` (IA), stores.

## Pour une passe pixel à jour
La prod est en **v648** sur `sunmatesapp.com`. Tes captures `_da_shots/` dataient de ~v570 → si tu refais une passe visuelle, pars de la v648 (beaucoup a bougé). Le mode Lite = toggle « Fonctionnalités beta » OFF (`?lite=1`).
