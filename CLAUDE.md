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

## Stack imposée (NE PAS CHANGER)
- **Front-end** : un **seul fichier `index.html`** en HTML / CSS / JavaScript
  « vanilla ». **Aucun framework** (pas de React/Vue), **aucun outil de build**,
  **aucun serveur Node.js**.
- **Backend = Supabase directement** : la base PostgreSQL + Supabase Auth + les
  règles RLS jouent le rôle du backend. `index.html` appelle Supabase via le client
  JavaScript chargé par **CDN**.
- **Hébergement** : **GitHub Pages** (site statique), branche `main`, dossier racine.
  ⚠️ GitHub Pages ne peut PAS exécuter de serveur Node/Express : tout passe par
  Supabase côté client.

> Note d'historique : un prompt initial proposait un backend Node.js/Express en
> couches (controllers/services/repositories). Abandonné car **incompatible avec
> GitHub Pages et la stack imposée**. La vision produit et le schéma Supabase (avec
> RLS) ont été conservés ; l'architecture est devenue « front vanilla → Supabase ».

## Structure du projet
- `index.html` — toute l'application (HTML + CSS + JS dans ce seul fichier).
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
URL : `https://gryf2002-commits.github.io/bootcamp-projet/`
