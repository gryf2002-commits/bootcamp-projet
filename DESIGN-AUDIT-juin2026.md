# SunMates — Audit de cohérence visuelle (juin 2026)

Inventaire réel sur `styles.css` (615 Ko) + `sunmates-lite.css` + `app.html` + `preview.html`.
Source de vérité cible : `design-tokens.css` · grammaire : `UI-GUIDE.md`.

## 1. État des lieux (avant)

| Catégorie | Valeurs distinctes trouvées | Cible (échelle) | Réduction visée |
|---|---:|---:|---|
| Couleurs hex | **648** | ~16 rôles + thèmes | ÷ ~40 |
| Couleurs rgba/rgb | **521** | ombres/voiles tokenisés | ÷ ~50 |
| Tailles de police | **271** | 8 (`--text-xs..4xl`) | ÷ ~34 |
| Rayons (border-radius) | **63** | 4 (`sm/md/lg/pill`) | ÷ ~16 |
| Ombres (box-shadow) | **274** | 3–4 (`--shadow-*`) | ÷ ~70 |
| Motion (transition+animation) | **265** | 3 durées + 1–2 courbes | ÷ ~40 |

## 2. Couleurs — clusters à fusionner (les pires)

- **Corail de marque éclaté en ~5 valeurs** : `#FF5A4D` (accent jour, 53×), `#ff6a5d` (accent nuit, 17×), `#ff7e72`, `#ff8a7d`, `#ff9a8d` (accent-2, 32×). → un seul `--accent` par thème + `--brand`.
- **Or éclaté en ~3** : `#FFD15C` (115×!), `#FFC93C` (41×), `#FFB52E`. → un seul `--gold`/`--coin`.
- **Surfaces sombres ~10** : `#2a2140` (45×), `#241b35` (27×), `#2a1640` (18×), `#190e2e`… → `--bg`/`--card`/`--surface-2`.
- **Amber gameplay** : `#b5740e` (24× restants = overrides DUSK `[style*]` + inline, by design) + `#8a5800` (33×, fix contraste jour v840). OK, ne pas re-toucher sans relire le mécanisme self-heal.
- **#fff / #ffffff** : 354 + 27 = casse à normaliser (hygiène).
- Légitimes (NE PAS fusionner) : palettes saisonnières winter `#7a5cff`/`#9b7bff`, tropic `#0fa37c` ; rouges sémantiques `--danger`.

## 3. Tailles de police — zoo fractionnaire
Top : `.82rem` (94×), `.8` (91), `.78` (61), `.72` (55), `.85` (50), `.76` (49), `.9` (45), `.74` (41), `.68` (40)… 271 au total. Voisins indiscernables (`.82`/`.84`/`.85`/`.86`/`.88`). **Mapping** → arrondir au plus proche de l'échelle (`.68/.72/.74/.76→--text-xs/sm`, `.78/.8/.82/.84/.85/.86/.88→--text-sm`, `.9/.92/.95/.98/1→--text-base`, `1.05/1.1/1.15→--text-lg`, `1.2/1.25/1.3→--text-xl`, `1.4/1.5→--text-2xl`, `1.7/2+→--text-3xl/4xl`). ⚠️ Beaucoup vivent en `style=""` inline dans des templates JS → migration par famille, pas un sed global.

## 4. Rayons — snap simple et sûr
Dominants déjà bons : `999px` (184), `50%` (83), `14px` (71), `12px` (71), `16px` (39). **Hors-échelle à snapper** : `10px`(26)→12, `13px`(11)→12, `11px`(9)→12, `9px`(8)→8, `22px`(5)→16/20, `7px`(4)→8, `6px`(4)→8. Note : `14px` est très utilisé — décider `14→12` (échelle stricte) OU ajouter `14` comme rayon de carte officiel (pragmatique, moins de diff). **Reco : garder 12 comme `--radius-md`, migrer 14→12 par famille en validant.**

## 5. Ombres & motion
- 274 ombres ad-hoc (continuum y/blur/alpha sur `rgba(45,38,52,*)` neutre + `rgba(255,90,77,*)` accent). → absorber ~80 % dans `--shadow-sm/md/lg` + `--shadow-accent`.
- 265 déclarations motion. → `--motion-fast/base/slow` + `--ease-standard`. Unifier par TYPE d'interaction (like, ouverture tuile, modale, envoi message, célébration) — cf. UI-GUIDE §4.

## 6. Plan de migration (par famille, chaque étape validée jour+nuit + déployée)
1. **Fondation** ✅ (cette étape) : `design-tokens.css` + `UI-GUIDE.md` + ce rapport + (à venir) page `/styleguide`.
2. **Rayons** : snap hors-échelle → tokens (mécanique, faible risque, gros gain visuel d'homogénéité).
3. **Ombres** : remplacer par `--shadow-*`.
4. **Familles** dans l'ordre d'impact : Listes de personnes (réutilisée par feed) → Gamification → Feed → Messagerie → Lieux → Statuts/demandes → Profil.
5. **Motion** : unifier like / ouverture / modale / célébration.
6. **Showcase** `/styleguide` tenu à jour + screenshots avant/après par famille.

## 7. Méthode de validation (déjà outillée)
Harnais puppeteer `scratchpad/shoot.js` (login compte QA, `applyTheme('day'/'dusk')`, captures `_shots_batch/`) + sonde `getComputedStyle` pour prouver qu'une règle gagne la cascade. Chaque famille : avant → migration → après (jour+nuit) → 0 erreur JS → bump+deploy.
