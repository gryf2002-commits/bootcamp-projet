# SunMates — Roadmap « grosse session peaufinage »

## 🌙 BATCH NUIT (retours du 2026-06-06)

### ✅ FAIT cette nuit (lots 45-52, SW v87) :
Pro (retrait raccourci B2B + titre Espace Pro) · « Bonjour » rouge · mot « triche » retiré · nav→écran
principal + Lieux ouvre sur Lieux · support/nous contacter sans mailto (grisés) · **âme de la carte**
(emojis+couleurs chips) · Tout voir 🌍 · **XP en ligne discrète** · intérêts illimités · avis encart
descendu · **classement déplacé dans JEUX** · Lieux tri en tuiles (Top notés/Populaires) · **« Mes
récompenses » retiré** (anti-doublon) · emoji jeux dans le titre · **Mon parcours = bandeau fin** +
segment check-ins retiré + stat XP → fenêtre · **segment KB admin retiré** · signal tap-to-close ·
**numéros : Europe 112 + populaires par défaut** · faux appel/signal en tuiles visibles · 112 moins morose ·
**défi violet vs blocage rouge** · why-match en tuile cliquable + trust cliquable · **fin onboarding = CTA**.

### ✅ FAIT aussi (lots 53-61, SW v96) :
fenêtres scrollables (croix fixe) · « qui peut me contacter » toast · mates-stat vivant · **badges
épinglables 3 max** + **formes/couleurs variées** · barre complétion cliquable · **signalements admin**
(profil cliquable + traité→supprimer, migration 24) · **anonymat : opt-in classement + nouveaux
profils privés** · spot du jour→Lieux · détail quête allégé · accueil remonte au login · tuiles plus
vivantes · **style de voyage multi** (migration 25) · fiche membre admin enrichie.

### ⏳ RESTE (gros morceaux, pour une prochaine session) :
- **Carte plein écran** (à tester sur mobile — ResizeObserver + outils + safe-area déjà en place).
- **Refonte complète de l'onglet Mates** (gros).
- **Quêtes/Jeux en overlay** (anti-scroll, gros).
- **~70 tuiles explicatives** dans la démo guidée (gros contenu).
- **Onboarding bug 4→6 cartes** (à investiguer en live).
- **Aperçu mode gratuit** (admin) à remettre à jour avec les changements.
- **XP boutique** (titres/cosmétiques) — à designer.
- ⚠️ Migrations à lancer : **24** (admin delete reports) et **25** (travel_styles).

### ⏳ Anciens (déjà repris) :
**Pro/Accueil** : retirer raccourci B2B dans Premium · retirer titre « Espace Pro » (ressortir 1ʳᵉ carte) ·
accueil connexion remonter (on voit pas Bonjour) · **« Bonjour » en rouge** (revert) · carte plein écran
encore buggée · **rebosser tuiles accès rapides + carte** (trop sobre/pastilles = perte d'âme) · « Tout voir » = 🌍.
**Lieux** : tri « pertinence » fait tache → remplacer par tuiles à côté de « Près de moi » · avis: descendre
l'encart d'écriture (superposé étoiles) · **anonymat** : opt-in classement (tuile « pseudo partagé, recherchable »,
pas tout le monde d'office) · **classement → onglet JEUX** (pas Lieux).
**Jeux** : bandeau XP encore trop gros · retirer « Mes récompenses » (doublon tuiles haut) · emojis mal
incrustés sur photos jeux populaires · retirer mot « antitriche » · tuiles bas de quête trop imposantes ·
remanier récompenses dans une quête · **tuiles Quêtes/Jeux ouvrent en overlay** (moins de scroll) ·
XP boutique ? (badges/titres/cosmétiques).
**Mates** : refonte complète (trop basique, pas DA) · profil: choisir 3 badges affichés · carte « pourquoi
vous matchez » → tuile cliquable · score confiance cliquable · « Proposer défi » vs « Bloquer » couleurs
distinctes · clic tuile nav → revenir écran principal de l'onglet · « X mates de confiance » triste.
**Sécurité** : faux appel + signal d'aide plus visibles · signal: croix trop longue à fermer · page 2 « 112 »
morose + trop de scroll · « trouve un mate sûr » → juste rediriger vers Mates · support grisé (pas de support) ·
numéros: « Europe 112 » une fois + **géoloc → afficher pays courant d'office** (recherche pour le reste) ·
historique rencontres trop balèze · mes signalements bug + pas de croix · « qui peut me contacter » msg bas ·
« nous contacter » n'ouvre plus les mails (pas de support).
**Profil (TROP CHARGÉ)** : badges 3 max via onglet badge → profil · Mon parcours = bandeau fin/tuile (retirer
timeline + 4 tuiles stats, garder Partager) · spot du jour → déplacer dans Lieux (+ vérifier expiration 24 h) ·
retirer segment « check-ins » → clic sur la stat check-ins · stat XP cliquable → ouvre tuile (pas redirect) ·
barre « profil complété » pas fiable/interactive · centres d'intérêt illimités · style de voyage multi.
**Admin** : refonte aperçu mode gratuit (avec nos changements) · **supprimer segment KB/changelog** (déjà dans
démo guidée — l'agrémenter à chaque nouvelle feature, **~70 tuiles explicatives**) · fiches membre + complètes/
moins mornes · interface admin + belle · signalement cliquable (voir si vrai débordement, gérer faux
signalements) · une fois traité → bouton « Supprimer » (pas juste grisé).
**Onboarding** : bug passage 4→6 cartes · « Des spots à découvrir » montre le classement (reset seg Lieux) ·
message de fin = CTA cliquable → redirige vers pseudo.
**Badges** : pas assez beaux → **formes différentes** (solo vs social) pour donner envie.



> Punch-list issue des retours du 2026-06-05 (test mobile). Cocher au fur et à mesure.
> Règles produit durables : voir la section « Règles » de `CLAUDE.md`.

## 🔴 Bugs / structurels
- [ ] **Login** : à la connexion on est loggé direct → flashs intempestifs de la page de connexion. Rendre la transition propre (ne montrer `authView` que si réellement déconnecté ; éviter le flash au boot).
- [ ] **Plein écran carte** : toujours bugué (accueil ET « voir sur la carte » depuis Lieux). Trouver un VRAI correctif (dimension/tuiles/zoom).
- [ ] **Profil enregistré ne « dépop » pas** : après enregistrement le profil/section ne disparaît pas comme attendu.

## 🗺️ Onglet Lieux
- [ ] Ajouter un **onglet « Classement »** + un vrai **classement** (le « grimpe au classement » existe déjà comme accroche).
- [ ] **Cartes de check-in** mal agencées : textes pas centrés, formats hétérogènes, fouillis → uniformiser.
- [ ] **Trop de scroll** dans Lieux → condenser.
- [ ] « Voir sur la carte » depuis Lieux : carte bien dimensionnée (lié au plein écran).

## 🎮 Onglet Jeux
- [ ] **Emojis en plein milieu des images** des quêtes → repositionner (coin/overlay propre).
- [ ] **« Quête accompli »** un peu moche → refaire.
- [ ] **« Voir sur la carte »** depuis une quête : bugué (lié plein écran).
- [ ] **« Défi proposé »** un peu caché → le rendre visible.
- [ ] **Quêtes n'augmentent PLUS le score de confiance** (triche trop facile). → autre mécanisme de validation (solo / avec des mates). [DÉCISION À PRENDRE]
- [ ] **Récompenses** : onglet pas assez joli → optimiser + uniformiser.

## 🏅 Badges (façon jeu vidéo)
- [ ] Onglet badges **pas assez fourni**.
- [ ] Afficher les badges **non débloqués en grisé/noir** ; **badges secrets** = fonction définie mais **non affichée** (mystère).
- [ ] **Rappel à chaque fonctionnalité** (indice de ce qui débloque quoi).
- [ ] **Compte admin** : peut voir les éléments cachés (badges secrets + conditions d'obtention).
- [ ] Ne PAS modifier la démo.

## 🎨 Uniformisation DA (important)
- [ ] **Barre de défilement blanche** hors thème (visible ex. dans Messages) → thémer partout (ou alternative).
- [ ] **Pastille verte « active »** hors DA → partout « **En ligne** » qui respecte la DA. [STYLE À VALIDER]
- [ ] **« validé » vert** devant « mes connexions », et les « validés » dans quêtes/jeux/checkins → DA.
- [ ] Note **« La sécurité est incluse pour tous… »** hors DA (vert vif) → restyler DA (idem page 2 sécurité).
- [ ] **Molette filtres avancés en vert** chelou → DA.
- [ ] **« Mates de confiance »** redondant avec Sécurité (bouclier) → clarifier/dé-dupliquer.
- [ ] **Indications en bas de page** (`.msg`) : chelou, invisibles si pas tout en bas → remplacer par toasts en haut / inline visible.

## 🛡️ Onglet Sécurité
- [ ] Mieux agencer la **première carte de la page 2**.
- [ ] **Ajouter des catégories/features** pertinentes en plus.
- [ ] **Cercle de confiance** : les alertes **disparaissent après 24 h**.
- [ ] Une **alerte d'urgence doit plus dénoter** à cet endroit.
- [ ] **Pastille active au-dessus de l'onglet Sécurité** tant qu'on n'a pas pris contact / cliqué « tout va bien ». Le **logo urgence cliquable** avec des actions à faire.
- [ ] **Assistance = FAQ** (tips massage cardiaque, etc.) au lieu de rediriger vers mail. Le mail → « Nous contacter ».
- [ ] Toujours des trucs qui s'affichent en bas de page (idem .msg).

## 👤 Profil / Réglages
- [ ] **Adresse mail sous le pseudo** : pas de sens → retirer.
- [ ] **Remanier tout l'onglet Réglages** (mieux optimisé).
- [ ] **« Je suis ici pour » = 1 max** (au lieu de 3) + **bloquer les choix contradictoires**.
- [ ] **% à côté de chaque catégorie** : montrer ce qui reste pour compléter le profil à 100 %.
- [ ] **Compléter les filtres avancés** : tous les champs du profil doivent être filtrables.
- [ ] **Changer la langue AVANT les réglages** (page de connexion / onboarding), pas seulement dans Réglages.

## 🚩 Signalements
- [ ] Un signalement = **une seule fois par compte** (antispam).
- [ ] La personne signalée est **auto-bloquée pour l'auteur** du signalement, tant que la modération n'a pas traité.
- [ ] **Étoffer** : que l'utilisateur comprenne bien ce qui s'est passé (statut de la demande).

## 💼 B2B / Page de connexion
- [ ] Onglet **Pro** sur la page de connexion : **ne demande pas d'identifiant**, mais **bascule la page côté B2B** (axe Pro) + **soleil/logo → « SunMates Pro »**.

## 📲 PWA / Onboarding
- [ ] **« Installer l'app » dans Réglages** : ne pas juste re-pop le bandeau → **petite carte explicative** (ce qui va se passer) + barre de chargement selon % d'installation *(si faisable techniquement — le % d'install PWA n'est pas exposé par les navigateurs : prévoir un fallback étapes)*.
- [ ] **Onboarding** : mieux gérer Suivant/Précédent ; mettre **« Passer » en haut** (à la place de « Quitter ») pour uniformiser.
- [ ] **Message pop-up en haut en fin d'onboarding** pas intuitif → autre façon de finir (CTA in-page).

## ✅ FAIT — session peaufinage (lots 1→9, commits 8ddab10 → v44)
- **Bugs** : flicker login corrigé ; **plein écran carte = ResizeObserver** (vrai fix) ; profil enregistré → confirmation **toast** visible.
- **DA sunset** : indicateurs verts → ambre (présence « En ligne », badges validé/vérifié, point avatar, filtre « En ligne », check « validé ») ; barre de défilement thémée ; note sécu corail ; molette filtres corail ; « Mates de confiance » sans bouclier redondant.
- **Sécurité** : alertes cercle expirent 24 h + urgences qui dénotent ; carte urgence page 2 réagencée (alerte pleine largeur pulsante) ; **FAQ premiers secours + voyage** (au lieu du mail) ; mail → « Nous contacter » ; **check-in « Tout va bien »** + pastille onglet + logo SOS cliquable.
- **Réglages** réorganisés (sections + toggle mode sombre) ; **langue choisissable sur la page de connexion**.
- **Profil** : **% par catégorie** (live) ; filtres avancés complétés (intérêts, études, enfants, religion) ; « Je suis ici pour » 1 choix ; email retiré sous le pseudo → ville.
- **B2B** : logo Pro doré distinct. **Onboarding** : « Passer » en haut (uniforme) ; fin via bannière in-page (plus de pop-up).
- **PWA** : carte explicative d'installation (étapes par plateforme).
- **Jeux** : emoji en badge (plus au milieu de la photo) ; état « accompli » ambre ; défis reçus mis en avant.
- **Check-ins** : cartes uniformisées.

## ✅ FAIT — bloc Supabase (lots 10→13). ⚠️ LANCER les 4 `.sql` DANS L'ORDRE :
1. `supabase_migration_session17_xp_classement.sql` — XP (au lieu du trust), 3/jour + cooldown, RPC `leaderboard`.
2. `supabase_migration_session18_badges.sql` — `badges_catalog` (publics + secrets).
3. `supabase_migration_session19_signalements.sql` — antispam + auto-blocage (`report_user`, `my_reports`).
4. `supabase_migration_session20_quetes_groupe.sql` — quêtes de groupe (`request_group_quest`, `confirm_group_quest`).
- **Classement** multi-onglets (XP/check-ins/confiance/badges) dans Lieux ✅
- **XP** des quêtes + retrait du trust + limites ✅ · **quêtes de groupe** confirmées par un mate + bonus ✅
- **Badges** grisés/secrets + admin voit le caché ✅
- **Signalements** antispam + auto-blocage + suivi « Mes signalements » ✅

## ✅ FAIT — finitions (lot 14)
- Messages bas de page → **toasts** : position/alerte, email, mot de passe (profil + signalement déjà faits).
- **Récompenses** (Badges/Coupons) : cartes dégradées sunset uniformes.

## ✅ Migrations Supabase LANCÉES et VÉRIFIÉES en live (2026-06-05)
Smoke test OK : tables (`badges_catalog`, `quest_group_runs`), colonnes (`profiles.xp`, `quests.is_group`,
`reports.status`), RPC (`leaderboard` x4 métriques renvoie des données, `report_user`, `my_reports`,
`request_group_quest`, `confirm_group_quest`, `complete_quest`). **Tout est opérationnel.**

> Roadmap peaufinage : **TERMINÉE** (14 lots, SW v49).

## 🌙 SESSION TARDIVE — features sécurité solo (lots 39-42, SW v77)
Migrations 17→23 **toutes lancées & vérifiées en live** (7 RPC OK, seed avis OK).
- **Carte souvenir** partageable (story sunset) pour Mon parcours.
- **Numéros d'urgence par pays** (~30 destinations, recherche, appel direct).
- **Contacts d'urgence (ICE)** : jusqu'à 3 proches en local, appel 1 tap.
- **Changelog admin** tenu à jour (segment 📒).

## 🔥 GROSSE PASSE 2 (lots 30-38, SW v73) — migrations 21, 22, 23 ✅ lancées
- **Page de connexion / Pro** : l'onglet Pro transforme la page (titre+pitch B2B, PAS d'identifiants,
  juste « Démarrer »). Logo Pro d'avant restauré.
- **Plein écran carte** : outils (Tout voir / Autour de moi / Partager) + Fermer restent visibles
  (z-index + safe-area).
- **Phrases « sécurité gratuite » retirées** (n'apportaient rien).
- **XP** : bandeau compact + bouton ⓘ « comment ça marche ».
- **Badges** : secrets vraiment cachés (teaser « N à découvrir ») + **8 badges jalons** auto-attribués
  (migration 22).
- **Profil public/privé** (migration 23) : privé = hors classement. Toggle dans Réglages.
- **🧭 Mon parcours** (carte profil) : récap journée/quêtes + stats + timeline, **partageable**.
- **Compteur de quêtes** (X/3 aujourd'hui + total).
- **Cartes de lieux remaniées** (note ⭐ en évidence, sous-titre, corps épuré).
- **Agencement urgence (Sécurité p2) remanié** (2 grandes actions 112 / Alerte côte à côte).
- **Knowledge base / changelog dans le bloc admin** (segment 📒).

## 🚀 NOUVELLES FEATURES & BOOSTS (lots 20-28, SW v63)
- **Avis sur les lieux** (lots 20-22) — voir détail ci-dessous (⚠️ migration 21).
- **XP sur le profil** (lot 25) : stat XP cliquable → classement. **🏆 Top noté** sur les lieux ≥4.5/≥3 avis.
- **Tri des lieux** (lot 26) : Mieux notés / Plus de check-ins / A→Z.
- **Badges sur la carte profil** (lot 27) : rangée de mes badges débloqués (cliquable → onglet Badges).
- **📞 Faux appel** (lot 28) : sortie de secours discrète (100 % local). Bouton dans Sécurité →
  choix de l'appelant → après 5 s, écran « appel entrant » réaliste (vibration, Répondre/Refuser,
  chrono). Pour s'extraire poliment d'une situation inconfortable.

## ⭐ Avis sur les lieux (lots 20-22, SW v57)
⚠️ **LANCER une 5ᵉ migration** : `supabase_migration_session21_avis_lieux.sql`
(table `place_reviews` + RPC `place_ratings()` + seed d'avis de démo). Tant qu'elle n'est pas
lancée, le front affiche « Pas d'avis » et le modal indique « indisponible » (pas de crash).
- Note ⭐ moyenne sur chaque carte de lieu + dans la bulle de la carte.
- Modal d'avis : moyenne, liste (avatar+étoiles+commentaire+date), formulaire (étoiles cliquables
  + commentaire) pour publier/modifier le sien. 1 avis/personne/lieu.

## ✅ Passe de peaufinage continue (lots 15-18, SW v53)
- **#11 carte d'accueil allégée** : chips colorés = légende intégrée, légende du bas supprimée.
- **Confirmations en toast** partout (position/alerte, email, mdp, vérif, photo, connexion, quête) — fini les messages invisibles en bas de page.
- **Classement** : encart d'encouragement si hors top 30 (valeur solo).
- **Profil 100 %** : toast + confettis à la complétion (en éditant).
- Vérifs : 0 doublon d'ID, syntaxe OK à chaque lot, migrations confirmées en live.

## ✅ Déjà fait (session 15, commit 3734ec8)
safe-area, pseudo long tronqué, doublon replay, dégradé prénom, visite guidée (Précédent + ordre), bannière PWA persistante + bouton Réglages, arrondi bouton 112, plafonds chips, sécurité « gratuite pour tous » (à restyler DA), téléphone clarifié.
