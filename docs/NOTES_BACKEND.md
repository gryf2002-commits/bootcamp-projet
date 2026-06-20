# NOTES BACKEND — durcissement base (20/06/2026)

> À lire avant de coder une feature qui touche Supabase.
> Durcissement appliqué en LIVE le 20/06 (voir `sql/supabase_migration_session38_perf_secu_audit.sql`,
> **déjà appliqué — ne pas relancer**). Aucun changement d'accès pour les utilisateurs connectés.

## 3 contraintes à respecter côté front

1. **Les RPC ne sont plus exécutables par un anonyme.**
   Tout appel `db.rpc(...)` / `supabase.rpc(...)` doit se faire **après connexion** (un `user` authentifié).
   → Ne pas concevoir de flux qui appelle une fonction Supabase avant le login. (L'app est déjà connectée partout, donc rien à changer en pratique.)

2. **`events` et `app_feedback` : INSERT réservé aux connectés.**
   → Ne pas insérer dans ces tables depuis un contexte déconnecté. (`events` n'est de toute façon écrit nulle part aujourd'hui.)

3. **Bucket `avatars` : énumération anonyme retirée.**
   → L'affichage par **URL directe** (`avatar_url`) marche toujours. Ne pas s'appuyer sur `storage.from('avatars').list()` sans être connecté.

## Bon à savoir
- **`quote_requests`** (devis B2B) reste **public** en insertion, mais les champs sont **bornés** :
  `need` ≤ 5000, `company` ≤ 200, `contact_name` ≤ 200, `email` ≤ 320. Au-delà → rejet.
- **`discover_nearby`** (une RPC d'affinité ajoutée par erreur) a été **retirée** : `compatibility()` côté client fait déjà le job, en mieux.

## Hors-SQL (non bloquant)
- « Leaked password protection » : **réservé au plan Pro** → non activé (plan gratuit). Pas une faille.
- Extension `unaccent` dans `public` : alerte cosmétique, **laissée telle quelle** (sans impact).

## Si tu ajoutes une feature qui a besoin d'une nouvelle table/RPC
Crée un fichier `sql/...` comme d'habitude → demande une relecture avant de lancer en base.
