# SunMates — UI-GUIDE (grammaire visuelle unique)

> Règle d'or : **deux éléments qui font la même chose se ressemblent au pixel et se comportent pareil ; deux éléments différents sont visiblement différents.**
> Source de vérité : `design-tokens.css`. Aucune valeur visuelle en dur hors de ce fichier. Migration **par famille** (§7 du brief), validée écran par écran (jour ET nuit).

## 1. Tokens (voir `design-tokens.css`)
- **Espace** : grille de 4 → `--space-1..12`. Bannir 7/13/15/22px.
- **Typo** : 1 échelle (`--text-xs..4xl`), 2 familles (Fraunces titres, Manrope corps), 3 graisses (400/600/700). Utiliser les **rôles** (`--font-h1/h2/body/label/caption`), pas les tailles brutes. Plancher 12px.
- **Rayons** : `--radius-sm/md/lg/pill`. Toutes les tuiles = `--radius-md`.
- **Ombres** : `--shadow-sm/md/lg` (+`--shadow-accent`). Une tuile = `--shadow-sm`.
- **Motion** : `--motion-fast/base/slow` + `--ease-standard`. Même interaction = même durée+courbe partout.
- **Couleurs par RÔLE** : `--brand`, `--success(-ink)`, `--danger`, `--warning`, `--coin`, `--xp`. La couleur encode une fonction, pas une déco. Jamais d'info portée par la couleur seule (doubler d'icône/texte).

## 2. Composants (un seul par type)
- **Card** : padding `--space-4`, rayon `--radius-md`, fond `--surface`/`--card`, **ombre `--shadow-sm` OU bordure, pas les deux**, gap interne `--space-2`. Variantes nommées only : `.card--list`, `.card--media`, `.card--stat`, `.card--action`. Pas de variante improvisée dans un écran.
- **Boutons** : 3 niveaux (primaire/secondaire/texte), même hauteur, même rayon, mêmes états hover/active/disabled/loading.
- **Champs** : même hauteur, bordure, focus, style d'erreur/label partout.
- **Avatars** : `--avatar-sm/md/lg/xl`, toujours `--radius-pill`, fallback initiales identique.
- **Chips/tags** : un composant, mêmes couleurs.
- **Modales/feuilles** : même header, même ✕, `--motion-slow` + même backdrop.
- **Toasts** : un système, couleurs sémantiques, même position+durée.
- **États vides** : icône + titre + sous-texte + CTA, même structure.
- **Nav** : ordre/libellés/icônes/état actif identiques partout.

## 3. Couleurs « même format = même couleur »
| Contenu | Token |
|---|---|
| Succès / accepté / validé | `--success` (texte : `--success-ink`) |
| Erreur / refusé | `--danger` |
| En attente | `--warning` |
| Pièces / XP (gamif) | `--coin` / `--xp` |
| Vérifié / Gold | un seul bleu / un seul doré, partout |

Un statut accepté/attente/refusé a **le même triplet** dans messagerie, connexions, quêtes de groupe, devis.

## 4. Motion « mêmes features = mêmes motions »
- Like/toggle/favori → même anim, `--motion-fast`.
- Ouverture tuile→détail → même transition, `--motion-base`.
- Modale/feuille → slide-up `--motion-slow`, même backdrop.
- Envoi de message → identique dans les 3 messageries.
- Récompense/succès → **une seule** anim de célébration réutilisée.
- Chargement → un seul style de skeleton.

## 5. Emojis & icônes
- Emojis : OK contenu user + gamification ; navigation/labels système → icônes vectorielles.
- **Mapping fixe** concept→symbole (une quête = toujours le même, pièces = toujours le même, sécurité = toujours le même). Pas de 🔥 ici et ⭐ là pour la même idée.
- Taille d'emoji alignée sur le texte adjacent.

## 6. Familles (traitées à l'identique — cf. brief §7)
Messagerie (1:1 / groupe / voyage) · Listes de personnes (recherche/mates/leaderboard/membres) · Cartes de gamification (quêtes/quiz/QdJ/badges) · Feed (posts/sondages/commentaires) · Lieux & partenaires · Statuts & demandes · Profil & paramètres.

## 7. Definition of Done
- Nb de couleurs/tailles/rayons/durées **drastiquement baissé**, dans les échelles du §1.
- Deux features d'une même famille = **indistinguables** (tuile, typo, statut, motion).
- Aucune valeur en dur hors `design-tokens.css`.
- Un nouvel écran se construit avec les composants existants, sans réinventer de style.
