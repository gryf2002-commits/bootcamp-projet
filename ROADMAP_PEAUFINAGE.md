# SunMates — Roadmap « grosse session peaufinage »

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

## ⏳ RESTE (nécessite migration Supabase — `.sql` à écrire & lancer)
- **Classement** multi-onglets (badges/XP/confiance/check-ins).
- **Système XP des quêtes** (3/jour + cooldown ; quêtes de groupe = confirmation mate + bonus XP) + **retrait du trust score** des quêtes.
- **Badges** étoffés : grisés/**secrets** (fonction cachée) + **admin voit le caché**.
- **Signalements** antispam (1/compte, auto-blocage auteur jusqu'à modération, statut visible).

## ⏳ RESTE (front-end, plus petit)
- Messages en bas de page restants (`.msg` sécu/auth…) → toasts.
- Récompenses (onglet Jeux) : polish visuel.
- Lieux : réduire encore le scroll, agencement global.

## ✅ Déjà fait (session 15, commit 3734ec8)
safe-area, pseudo long tronqué, doublon replay, dégradé prénom, visite guidée (Précédent + ordre), bannière PWA persistante + bouton Réglages, arrondi bouton 112, plafonds chips, sécurité « gratuite pour tous » (à restyler DA), téléphone clarifié.
