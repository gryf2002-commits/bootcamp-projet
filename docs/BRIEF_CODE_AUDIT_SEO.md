# Brief pour Claude Code — session Audit DB + SEO (20/06/2026)

Pendant que tu codais le front (v602 → v606), un agent a fait en parallèle : un **audit + durcissement Supabase** (déjà appliqué en live) et **7 pages SEO**. Voici ce que tu dois savoir et faire. Rien n'est cassé, tout est additif.

---

## ✅ 3 actions pour toi

### 1) Commiter (fichiers non commités au moment du brief)
**Nouveaux :**
- `voyager-seul-a-paris.html`, `voyager-seul-a-lyon.html`, `voyager-seul-a-lisbonne.html`, `voyager-seul-a-barcelone.html`, `voyager-seul-a-berlin.html`, `voyager-seul-a-rome.html`
- `voyager-seule-en-securite.html`
- `sql/supabase_migration_session38_perf_secu_audit.sql`
- `docs/NOTES_BACKEND.md`, `docs/BRIEF_CODE_AUDIT_SEO.md`

**Modifiés :**
- `index.html` → ajout d'un bloc « Destinations » (encadré `<!-- SEO DESTINATIONS — START … END -->`, retirable, utilise les classes existantes `band/wrap contact/seclabel/h2/sub/contact-row/btn-ghost` + `.reveal`).
- `sitemap.xml` → 7 pages ajoutées.

### 2) Sitemap : ajoute les 7 pages à TA source de génération
Tu régénères `sitemap.xml` et le remets à 2 URLs (mes ajouts sautent à chaque fois). Ajoute ces `<loc>` à ton générateur :
```
/voyager-seul-a-paris.html
/voyager-seul-a-lyon.html
/voyager-seul-a-lisbonne.html
/voyager-seul-a-barcelone.html
/voyager-seul-a-berlin.html
/voyager-seul-a-rome.html
/voyager-seule-en-securite.html   (priority 0.9)
```
*Pas critique :* la page d'accueil les linke déjà (bloc Destinations) → elles sont crawlables même sans sitemap.

### 3) Respecter le durcissement DB (détaillé dans `docs/NOTES_BACKEND.md`)
- **RPC** : plus exécutables par `anon` → tout `db.rpc(...)` doit se faire **connecté** (l'app l'est déjà partout).
- **`events` + `app_feedback`** : INSERT réservé `authenticated`.
- **bucket `avatars`** : listing anonyme retiré (affichage par `avatar_url` inchangé).
- **`quote_requests`** : reste public mais borné (need ≤ 5000, company/contact ≤ 200, email ≤ 320).

---

## 🗄️ Base de données — déjà appliqué en LIVE
`sql/supabase_migration_session38_perf_secu_audit.sql` est **déjà appliqué** sur la base (index FK, RLS `(select auth.uid())`, search_path, revoke anon, locks inserts, dédoublonnage da_tokens, bucket avatars). **Ne le relance pas** (idempotent si jamais). **Aucune migration en attente.**

---

## 🧭 Pages SEO — règles à GARDER si tu les édites
Cible : « voyager seul à [ville] » + « voyager seule en sécurité ». **Honnêteté impérative (décidée avec Max) :**
- ❌ **Ne nomme JAMAIS un lieu comme « partenaire »** : on n'a **aucun partenaire B2B**. Décrire les lieux **par type** + « repérés par la communauté ».
- ❌ **Ne sur-promets pas la vérification d'identité** : elle est **simulée**. Rester au niveau de la landing : « profils vérifiés, check-ins, recommandations ». Jamais « contrôle d'identité ».
- Voix = celle de la landing (Fraunces + Manrope, DA nuit prune + sunset corail, zéro tiret cadratin, « · » inclusif). CSS inline léger par page (≈3 Ko).
- Chaque page a déjà : title/meta/canonical/OG, JSON-LD (FAQPage + BreadcrumbList), 1 `<h1>`, liens internes croisés, CTA `app.html`.

---

## ⚠️ Pistes connues (optionnel, non bloquant)
- **hreflang** : le sitemap déclare `en` ET `fr` sur la **même URL** `/` (langue = toggle JS). L'EN n'est pas indexable séparément → soit créer `/en/`, soit retirer le `hreflang="en"`.
- **Analytics** : la table `events` n'est **écrite nulle part** → zéro mesure produit. C'est le seul vrai trou. Amplitude est connecté mais pas câblé.
- **`discover_nearby`** : une RPC d'affinité a été ajoutée puis **retirée** (doublon avec `compatibility()` côté client, plus complet). Ne la cherche pas.
- **Leaked password protection** : réservé au plan Pro → non activé (gratuit). Pas une faille.
