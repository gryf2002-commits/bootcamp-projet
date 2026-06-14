# Console DA — brief pour cowork (handoff)

> Statut au 14/06 (v485 live) : la **console DA est câblée de bout en bout** côté app.
> Ce doc dit ce qui marche, le **contrat technique** pour brancher, et **ce qui reste à faire chez cowork**.

## ✅ Déjà intégré (en prod)
- **Schéma Supabase** `da_tokens` / `da_strings` (1 ligne id=1, RLS `profiles.is_admin`) — lancé.
- **Loader** `sunmates-da-loader.js` (`?v=3`) : au login, `render()` fetch `da_tokens`/`da_strings`
  → `SMDA.apply()` + `SMDA.applyStrings()` + `applyI18n()`. Dans la coquille du Service Worker.
- **Admin** (Profil → Admin → 🎨 DA → « 🎛️ Console DA pilotée ») : Ouvrir la console · coller le JSON ·
  🧪 Tester en live (brouillon localStorage `sm_da_live`) · 🚀 Publier (`upsert da_tokens`) · 🔄 Recharger.
- **Console** (`da-console.html`) : mode d'emploi en tête + bouton « 📋 Copier JSON ».
- **Leviers actifs** : joyaux par mode (`--ic1/--ic2`) · polices (Google Fonts chargées auto) ·
  effets (`sm-no-polish` / `sm-mirror` / `sm-no-shadow`) · textes (override `i18nT`) ·
  **couleur des emblèmes EN MONO opt-in** (classe `sm-icc` + `--icc` par catégorie).

## 🔧 Contrat technique (pour brancher sans rien casser)
- Source de vérité : `da_tokens.tokens` (jsonb), `da_strings.strings` (jsonb), id=1.
- API runtime : `window.SMDA = { apply(tokens), applyStrings(strings), saveDraft(t,s), boot() }`.
- Forme des tokens : `{ modes:{<k>:{class,j1,j2}}, logos:{<k>:color}, iconColors:{<cat>:color},
  sizes:{tile,iconTile}, fonts:{body,heading}, effects:{polish,mirror,shadow}, a11y:{fontScale} }`.
- Classes posées sur `<body>` : `sm-no-polish` · `sm-mirror` · `sm-no-shadow` · `sm-icc`.
- Variables CSS : `--ic1/--ic2` (dégradé tuile-joyau) · `--icc` (couleur emblème) ·
  `--sm-tile/--sm-icon` (tailles) · `--sm-logo`.

## 🚧 À faire chez cowork (le vrai reste)
1. **Banque d'icônes recolorable PROPRE** (priorité). Aujourd'hui les emblèmes sont **multi-couleurs figés**
   (`fill="#1EAE84"`, `#F5A623`, `#FF6A3D`, `#8A5CFF`, `#A86B38`…) → on ne peut les recolorer **qu'en
   monochrome** (silhouette aplatie), c'est ce qui est livré (opt-in `sm-icc`). Pour un vrai pilotage couleur
   qui **garde la finesse joaillerie**, il faut une variante **bi-ton pilotable** (ex. `--icc` + `--icc2`)
   ou un mode `currentColor` **pensé pour le rendu** (pas un aplat baveux des chevauchements). Contrat : les
   glyphes `[data-smicon]` doivent exposer leur couleur via `currentColor`/`--icc`.
2. **Recolor réel des emojis de la carte** (marqueurs Leaflet) piloté par la DA.
3. **Banque d'images** (catégorie → source d'image) pilotable depuis les tokens.
4. **Icône app / favicon / PWA** générés depuis l'icône choisie (fichiers `icon-*.png` séparés + manifest).
5. **Fusion des contrôles de la console dans `#daTokens`** (aujourd'hui : console autonome + copier/coller JSON ;
   cible : édition directe dans l'admin, sans aller-retour).
6. **Versions / rollback** : `updated_at` est déjà sur `da_tokens`/`da_strings` → lister les versions + restaurer.
7. **(Optionnel) Live push** : abonnement realtime sur `da_tokens` → `SMDA.apply` chez tous **sans recharger**.

## ⚠️ Pièges connus (à savoir)
- Les **tailles** (`--sm-tile/--sm-icon`) ne sont **pas consommées globalement** par le CSS de l'app
  (mapping multi-contextes risqué) — à câbler ciblé si besoin.
- La couche `!important` « POLISH v3 » de `index.html` peut **écraser** des overrides du loader
  (les variables passent, certaines polices/couleurs en dur résistent).
- Les overrides de **texte** n'agissent que via `i18nT()` (pas le DOM statique `data-i18n`).
- Les changements s'appliquent **au prochain chargement** (pas en direct sur les sessions ouvertes) — sauf si (7).
