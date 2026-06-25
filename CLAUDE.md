# SunMates — contexte & configuration du projet

## Vision produit
SunMates est une application sociale **« sécurité d'abord »** pour les voyageurs solo
(Gen Z / Millennials ; persona principal : « Chloé, l'exploratrice solo »). Elle
transforme les rencontres de voyage éphémères en connexions sûres et validées.

L'auteur est **débutant** : expliquer simplement, sans jargon, une seule
action/question à la fois.

### Fonctionnalités MVP
- **Score de confiance / vérification** : badge de vérification (simulé dans ce MVP)
  pour limiter les faux profils.
- **Partage de position** : envoi de la position au cercle de confiance + bouton
  d'alerte d'urgence.
- **Check-ins gamifiés** : check-in dans des lieux partenaires éco-responsables
  (cafés, co-livings) qui rapportent des points de confiance.
- **Carte / liste des lieux sûrs** : lieux validés pour des rencontres en sécurité.
- **Connexions sûres** : mise en relation non ambiguë entre voyageurs.

## Stack — vanilla NON imposée (décision Maxime, 25/06/2026)
> ⚠️ CHANGEMENT : la contrainte « un seul `index.html` vanilla, aucun framework, aucun
> build » est **levée** par Maxime. Les frameworks (React/Vue/Svelte…) et les outils de
> build sont désormais **autorisés**. But : pouvoir upgrader la vitrine, toutes les pages
> et l'app au-delà de ce que le vanilla permettait, **en restant dans la DA sunset doux
> raffiné**.

**Garde-fous (pour ne PAS casser la prod en route) :**
- La **prod actuelle est encore vanilla** : `index.html` (vitrine) + `app.html` (app, ~1,7 Mo
  monofichier) + `sw.js`/`manifest.json`, servis en **statique par GitHub Pages** sur
  `sunmatesapp.com`. Tant qu'on n'a pas migré explicitement, on **ne casse pas** ce qui tourne.
- Toute migration off-vanilla doit soit **produire un build statique** déployable sur GitHub
  Pages (Vite/Astro/Next export…), soit s'accompagner d'un **changement d'hébergement décidé
  avec Maxime**. Pas de serveur Node permanent côté Pages.
- **Backend = Supabase directement** (PostgreSQL + Auth + RLS), appelé côté client. La sécurité
  repose sur les **règles RLS**, jamais sur un secret.
- Migrer = par étapes vérifiées (build qui marche, app qui marche, SEO préservé), jamais un
  big-bang qui met la prod par terre.

## Structure du projet
- `index.html` — **vitrine** (page d'accueil sunmatesapp.com, SEO).
- `app.html` — **l'application** (monofichier HTML+CSS+JS, ~1,7 Mo) + `sw.js` (PWA) + `manifest.json`.
- `supabase_schema.sql` — schéma des tables + règles RLS + données de démo (à
  exécuter dans le SQL Editor de Supabase).
- `.gitignore` — fichiers à ne jamais publier.
- `CLAUDE.md` — ce fichier.

## Sécurité
- **Ne jamais** committer de mot de passe, token GitHub, ni clé `service_role`.
- La clé Supabase **`anon` / publishable** est publique par conception : elle figure
  dans `index.html`. La sécurité repose sur les **règles RLS**, jamais sur le secret
  de cette clé.
- **Chaque table a RLS activé.** Un utilisateur ne peut lire/écrire que ses propres
  données (positions, check-ins, profil), sauf lecture des lieux sûrs et des profils
  des membres (pour le matching).

## Conventions de nommage
- `camelCase` pour les variables/fonctions JS, `snake_case` pour les colonnes/tables.

## Modèle de données (Supabase)
- `profiles` — lié à `auth.users` : `username`, `bio`, `city`, `trust_score`,
  `is_verified`.
- `partner_cafes` — lieux sûrs partenaires (cafés, co-livings, `is_eco`).
- `checkpoints` — check-ins d'un utilisateur dans un lieu.
- `locations_realtime` — positions partagées (`lat`, `lng`, `is_emergency`).
- `matches_connections` — connexions entre deux utilisateurs (`status`).

## Déploiement
Publié automatiquement par GitHub Pages à chaque `git push` sur `main`.
URL de PROD (domaine officiel) : `https://sunmatesapp.com`
(source Pages : `https://gryf2002-commits.github.io/sunmates/`, redirigée vers le domaine custom).
⚠️ Toujours utiliser `sunmatesapp.com` dans les nouveaux liens/redirects/CORS — pas `github.io`.

## Règles produit (durables — décidées avec l'auteur)
- **Sécurité jamais monnayée** : toutes les features de sécurité sont gratuites pour tous.
- **Anti-triche quêtes** : les quêtes **ne donnent PAS de score de confiance** (trop facile
  à farmer). Le trust ne monte que via des signaux non triviaux (vérification, check-ins
  validés par code/RPC, vouches). Les quêtes rapportent de l'**XP** (monnaie de jeu séparée).
  Validation : **auto-déclaration limitée à 3/jour + cooldown** ; les **quêtes de groupe**
  demandent une **confirmation d'un mate** et donnent un **bonus XP partagé** (plus social).
- **Classement** : onglet dans Lieux, **multi-segments** (par badges, par XP, par confiance,
  par check-ins…).
- **DA = coucher de soleil** : indicateurs de statut/validation en tons **sunset (ambre/doré)**,
  jamais de vert criard ; cohérent sur toute l'app.
- **Badges façon jeu vidéo** : badges non débloqués affichés **grisés/noirs** ; **badges
  secrets** = fonction définie mais condition **cachée** au grand public. Un **compte admin**
  voit les éléments cachés (badges secrets + conditions d'obtention).
- **Rappel par fonctionnalité** : chaque fonctionnalité indique discrètement ce qu'elle débloque.
- **Signalements** : un seul signalement par compte (antispam) ; la personne signalée est
  **auto-bloquée pour l'auteur** jusqu'au traitement par la modération ; statut visible.
- **DA (coucher de soleil corail)** : pas de vert vif « hors DA ». Indicateurs « en ligne » /
  « validé » / notes info → tons raccord DA. Barre de défilement **thémée** (pas blanche).
- **Indications** : éviter les messages collés en bas de page (invisibles) → préférer un
  retour visible (toast en haut / inline près de l'action).

## Design — source de vérité
Toute modification visuelle doit respecter `DESIGN.md`, `DESIGN_SYSTEM.md` et
`sunmates-kit-da-v445.json`. Aucune nouvelle couleur, typo ou composant hors de
ces fichiers. En cas de doute : demander, ne pas improviser.

## Roadmap en cours
Voir `ROADMAP_PEAUFINAGE.md` (punch-list peaufinage).
