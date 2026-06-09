# SunMates — Grandes idées, plugins & conseils

> Idées NOUVELLES (non encore proposées). Effort : 🟢 rapide · 🟠 moyen · 🔴 gros.
> Tout reste compatible : 1 `index.html` + Supabase + GitHub Pages, DA coucher de soleil.

## 1. Grosses features (signature / différenciantes)

### 🌍 « Mon voyage » — matching dans le temps ET l'espace 🟠🔴  ⭐ la killer feature
Tu déclares ton itinéraire (villes + dates : « Lisbonne 12-18 juin »). L'app te montre
**qui sera là en même temps que toi**, et te prévient (« 3 Mates compatibles à Lisbonne
cette semaine »). C'est ce qui manque à toutes les apps de rencontre voyage : la
dimension temporelle. Réutilise carte, cartes voyageur, compat existante.
→ table `trips(user_id, city, lat, lng, start_date, end_date)` + matching par chevauchement.

### 📔 Carnet de voyage / Recap partageable 🟠  (rétention + viralité)
Compile auto check-ins + badges + Mates rencontrés → une belle page « Ton été SunMates »
(façon Spotify Wrapped, en DA sunset) exportable en image à partager en story.
→ moteur de rendu canvas + données déjà en base. Boucle de croissance gratuite.

### 🆘 SOS discret / « faux appel » 🟢  (sécurité, très demandé par les voyageuses solo)
Un faux appel entrant programmable pour quitter une situation gênante, + un bouton
« je suis bien arrivé·e » avec minuteur (si pas confirmé à l'heure → alerte au cercle).
Renforce le cœur « sécurité d'abord » — et c'est gratuit, donc raccord avec la promesse.

### 🤝 Parrainage 🟢  (acquisition)
« Invite un·e ami·e » → lien unique → les deux gagnent un badge « Duo » + de l'XP.
Boucle virale simple, table `referrals`.

### ✅ Vérification RÉELLE (selfie + doc) 🔴  (la confiance comme moat)
Aujourd'hui la vérif est simulée. Pour une vraie app, passer par un service
(ex. Stripe Identity / Veriff) déclenché côté Edge Function. Argument n°1 de
différenciation et exigence de fait pour une app sociale sur les stores.

## 2. Plugins / librairies (gratuits, CDN, compatibles)

| Besoin | Lib | Pourquoi |
|---|---|---|
| **Compresser les photos** avant upload | `browser-image-compression` | économise ton stockage Supabase + perfs ; indispensable à l'échelle |
| **Sécuriser le contenu user** (avis, bios) | `DOMPurify` | anti-XSS — obligatoire dès qu'il y a de l'UGC |
| **Recherche tolérante aux fautes** | `Fuse.js` | recherche lieux/Mates même mal orthographiés |
| **Galerie photo plein écran** | `PhotoSwipe` | vraies galeries profil, pincer-zoomer |
| **QR code** (profil/parrainage) | `qrcode` + `qr-scanner` | se connecter IRL d'un scan |
| **Gestes swipe** | Pointer Events natifs ou `Hammer.js` | si tu ajoutes un mode découverte « cartes » |
| **Dates « il y a 2 h » + i18n** | `Day.js` (2 ko) | léger, remplace du code date maison |
| **Multilingue FR/EN…** | `i18next` | une app de voyage DOIT être au moins bilingue — à câbler tôt |
| **Carte de chaleur** | `leaflet.heat` | « où ça bouge ce soir » sur ta carte Leaflet actuelle |
| **Offline solide** | `Workbox` | service worker robuste (tu en as déjà un artisanal) |
| **Notifications push** | `OneSignal` (free) ou Web Push + Edge Function | LE levier de rétention n°1 |

> Garde-fous : chaque lib en CDN avec **fallback** si elle ne charge pas (comme ton
> moteur d'icônes), et on n'en ajoute une que si elle gagne sa place (poids/perf).

## 3. Autres conseils (produit, tech, légal)

**Produit / rétention**
- **Notifications push** = le plus gros levier (nouveau message, demande, « un Mate arrive
  dans ta ville »). À prioriser.
- **Boucle quotidienne** : 1 quête du jour + streak doux (sans punir) → on revient chaque jour.
- **Valeur dès J0 en solo** (déjà noté) : contenu démo, lieux, quêtes solo.

**Tech / dette**
- ⚠️ **Unifier le modèle gamification** : le front et la base ont divergé (tables `quests`
  à clé texte vs mon schéma). À réconcilier avant d'empiler — sinon ça cassera (cf. erreurs SQL).
- **Découper `index.html`** (5800+ lignes) en `app.js` + `styles.css` : lisibilité, moins de régressions.
- **Compression d'images + lazy-load** : critique pour tenir la charge et le quota Supabase.

**Légal / stores (pour plus tard mais à anticiper)**
- **Âge 18+** (app de mise en relation) : porte d'entrée + CGU.
- **RGPD** : suppression de compte dans l'app, export des données, consentement analytics.
- **Modération** : signalement + blocage + file de modération (tu as déjà les bases) —
  exigé par Apple/Google pour une app sociale.

## 4. Mon top 3 si je devais choisir
1. **« Mon voyage » (matching temps + lieu)** — c'est ta signature produit.
2. **Notifications push** — sans elle, pas de rétention.
3. **Carnet de voyage partageable** — croissance gratuite + émotion.
