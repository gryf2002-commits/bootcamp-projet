# SunMates — Vision « app ultra complète » (roadmap maximale)

> Le plan d'attaque pour passer du MVP à une vraie app de référence du voyage solo.
> Légende : ✅ déjà là · �“ à finir/brancher · ➕ à créer. Effort 🟢/🟠/🔴.
> Tout reste sur la stack actuelle (1 `index.html` + Supabase + PWA), DA coucher de soleil.

---

## MODULE 1 — Identité & confiance (le socle « sécurité d'abord »)
- ✅ Profil riche (photo, intérêts, langues, style, prompts, infos)
- �� **Galerie multi-photos** (PhotoSwipe) + réorganisation (Sortable.js)
- ➕ **Vérification réelle** (selfie + pièce, via Stripe Identity/Veriff côté Edge Function) 🔴
- ➕ **Niveaux de confiance visibles** (Nouveau → Confirmé → Référent) dérivés du trust score 🟢
- ➕ **Vouch / recommandations entre Mates** (preuve sociale) 🟢
- ➕ **Badge « pionnier »** pour les 500 premiers (rareté) 🟢

## MODULE 2 — Matching & découverte (le cœur)
- ✅ Compatibilité (intérêts + ville + langues + style + confiance), filtres, tri, « Pour toi »
- ➕ **« Mon voyage » : matching temps + lieu** (cf. `BRIEF_MON_VOYAGE.md`) 🟠 ⭐
- ➕ **Mode découverte « cartes à swiper »** en option (Pointer Events) 🟠
- ➕ **« C'est un match ! »** célébration sur connexion mutuelle (confettis existants) 🟢
- ➕ **Présence temps réel** (« actif maintenant ») + filtre 🟠
- ➕ **Recherche floue** tolérante aux fautes (Fuse.js) 🟢

## MODULE 3 — Plans, sorties & communauté
- ➕ **Plans à rejoindre** (lieu sûr + heure, participants) 🟠
- ➕ **Groupes par destination** (« Lisbonne cette semaine ») 🔴
- ➕ **Avis & notes sur les lieux sûrs** (UGC, DOMPurify) 🟠
- ➕ **Évènements SunMates** (apéros, meetups officiels) 🔴
- ➕ **Carte de chaleur** « où ça bouge ce soir » (leaflet.heat) 🟢

## MODULE 4 — Sécurité avancée (gratuite pour tous)
- ✅ Cercle de confiance, partage position, alerte, lieux sûrs, signalement/blocage
- ➕ **SOS discret / faux appel** programmable 🟢
- ➕ **« Je rentre » / arrivée surveillée** (minuteur → alerte si non confirmé) 🟠
- ➕ **Check-in de sécurité périodique** en mode aventure 🟠
- ➕ **Numéros d'urgence locaux auto** selon le pays (déjà amorcé) 🟢

## MODULE 5 — Gamification (XP, badges, quêtes)
- 🔛 Quêtes/jeux/badges/coupons **réels** (unifier front↔base, cf. dette technique)
- ➕ **Streak quotidien doux** + quête du jour 🟢
- ➕ **Classement multi-segments** (XP / confiance / check-ins / badges) 🟠
- ➕ **Saisons / events temporaires** (badges limités) 🟠
- ➕ **Coupons partenaires** réclamables (codes) 🟢

## MODULE 6 — Messagerie & relation
- ✅ Chat temps réel
- ➕ **Accusés lecture + « écrit… »** 🟢
- ➕ **Brise-glace suggérés** (selon intérêts communs) 🟢
- ➕ **Traduction d'un message** (i18n / API) 🟠
- ➕ **Partage de plan / position dans le chat** 🟠
- ➕ **Signalement depuis le chat** 🟢

## MODULE 7 — Rétention & engagement
- ➕ **Notifications push** (Web Push + Edge Function / OneSignal) 🟠 ⭐ levier n°1
- ➕ **Carnet de voyage / recap partageable** (façon Wrapped) 🟠 ⭐ viralité
- ➕ **Centre de notifications** in-app enrichi 🟢
- ➕ **Parrainage** (lien + récompense duo) 🟢

## MODULE 8 — International & accessibilité
- ➕ **Multilingue FR/EN (puis ES/IT…)** via i18next 🟠 — indispensable pour le voyage
- ➕ **Devises / unités locales** 🟢
- ➕ **Accessibilité AA** (contrastes, focus, aria, tailles) 🟢

## MODULE 9 — Monétisation ÉTHIQUE (sécurité jamais payante)
- ➕ **SunMates Gold** : filtres avancés, boost de profil, cosmétiques, badge Gold,
  coupons exclusifs, mode incognito — **JAMAIS** la sécurité 🟠
- ➕ **Partenariats lieux** (commission sur coupons/réservations) 🔴
- ➕ **Offre « entreprise »** (sécurité collaborateurs en déplacement) 🔴

## MODULE 10 — Technique & scalabilité (les fondations)
- 🔛 **Unifier le modèle gamification** (front↔base divergents → à réconcilier) 🟠 ⚠️ prioritaire
- ➕ **Découper `index.html`** en `app.js` + `styles.css` 🟠
- ➕ **Couche d'accès données** (db.profiles, db.trips…) 🟢
- ➕ **Compression d'images** avant upload (browser-image-compression) 🟢
- ➕ **Index DB + pagination** partout (montée en charge) 🟢
- ➕ **Sentry + PostHog** (cf. `SETUP_MONITORING.md`) 🟢
- ➕ **Tests de fumée** (un script qui ouvre chaque écran sans erreur console) 🟠

---

## Ordre conseillé (3 vagues)
**Vague 1 — fondations & wow** : unifier la gamification · « Mon voyage » · « C'est un match »
· notifications push · compression images.
**Vague 2 — communauté & rétention** : plans · avis lieux · carnet partageable · présence
· brise-glace/accusés lecture · i18n FR/EN.
**Vague 3 — confiance & business** : vérification réelle · Gold éthique · groupes par
destination · évènements · partenariats.

> Garde le cap produit : **la sécurité reste gratuite**, le ton vacances partout, et chaque
> ajout passe par les agents (design → backend → qa) pour ne jamais casser la DA.
