# 📧 SMTP custom pour SunMates (contourner les limites Supabase)

Le service mail intégré de Supabase est **bridé** (quelques mails/heure, pas pour la prod).
La solution : brancher un **SMTP custom** dans Supabase Auth → tous les mails d'auth
(confirmation d'inscription, reset de mot de passe, changement d'email) partent par un
fournisseur avec un **vrai quota gratuit**. **C'est de la config, aucun code à toucher.**

---

## ⭐ Ma reco : Brevo en principal + Mailjet en backup

| Fournisseur | Quota gratuit | Domaine requis ? | Rôle |
|---|---|---|---|
| **Brevo** (ex-Sendinblue) | **300 mails/jour** (~9 000/mois) | ❌ **non** (vérif d'1 email suffit) | **Principal** |
| **Mailjet** | **6 000/mois** (200/jour) | ❌ non (vérif d'1 email) | **Backup** |
| Resend | 3 000/mois (100/jour) | ✅ **oui** (DNS d'un domaine) | Plus tard, si tu prends un domaine |

👉 **Sans domaine, Brevo est le meilleur** : tu vérifies juste **une adresse email** (ta `maxime.durao@delta-business.school` ou une Gmail dédiée) et tu envoies depuis elle.
La « belle capacité de backup » = avoir **Brevo configuré** + un **compte Mailjet prêt** : si un quota est atteint, tu changes juste les identifiants SMTP dans Supabase (5 min).

---

## 🚀 Étape 1 — Créer le compte Brevo + clé SMTP

1. Va sur **https://www.brevo.com** → crée un compte gratuit.
2. **Vérifie ton adresse d'expéditeur** : menu **Senders, Domains & Dedicated IPs** → **Senders** → **Add a sender** → mets ton nom (`SunMates`) + ton email. Tu reçois un mail de validation → clique le lien. ✅ (pas besoin de domaine)
3. Récupère les identifiants SMTP : menu **SMTP & API** → onglet **SMTP**. Tu obtiens :
   - **Server (host)** : `smtp-relay.brevo.com`
   - **Port** : `587`
   - **Login** : ton email de connexion Brevo
   - **Password (SMTP key)** : clique **Generate a new SMTP key** → copie la clé (commence souvent par `xsmtpsib-…`).

---

## 🔧 Étape 2 — Brancher Brevo dans Supabase

Dans ton projet Supabase → **Project Settings** (ou **Authentication**) → **Emails / SMTP Settings** → active **Enable Custom SMTP**, puis :

| Champ | Valeur |
|---|---|
| **Sender email** | l'adresse que tu as vérifiée à l'étape 1 (ex : `maxime.durao@delta-business.school`) |
| **Sender name** | `SunMates` |
| **Host** | `smtp-relay.brevo.com` |
| **Port** | `587` |
| **Username** | ton email de connexion Brevo |
| **Password** | la clé SMTP `xsmtpsib-…` |
| **Minimum interval** | 60 (secondes, défaut) |

➡️ **Save**. À partir de là, **tous les mails d'auth Supabase passent par Brevo**.

---

## ✅ Étape 3 — Activer la confirmation d'email (1ʳᵉ vérif d'identité)

Maintenant que l'envoi est fiable, on peut **forcer la vérification d'email** :

1. Supabase → **Authentication** → **Providers** → **Email** → active **« Confirm email »**.
2. **Authentication → Rate Limits** : avec un SMTP custom, **augmente** « Rate limit for sending emails » (ex : 30/heure → bien plus). Tu n'es plus bridé par le service Supabase.

> Le front est déjà prêt : à l'inscription, l'app affiche désormais
> « 📧 Compte créé ! Ouvre ta boîte mail pour confirmer ton adresse ».

---

## 🎨 Étape 4 (option) — Personnaliser les emails aux couleurs SunMates

Supabase → **Authentication → Email Templates** → modifie « Confirm signup » :
sujet `Confirme ton inscription SunMates ☀️`, et un corps HTML simple
(ton dégradé corail, logo soleil, bouton « Confirmer mon email »).

---

## 🛟 Étape 5 — Le backup (Mailjet, sans domaine)

1. Crée un compte sur **https://www.mailjet.com** (gratuit).
2. **Account → Sender addresses** → ajoute et **valide ton email**.
3. **Account → REST API / SMTP** : host `in-v3.mailjet.com`, port `587`,
   **Username = API Key**, **Password = Secret Key**.
4. Garde ces identifiants de côté. Le jour où Brevo est à court (ou en panne),
   tu **remplaces simplement** Host/Username/Password dans l'étape 2 → bascule immédiate.

---

## 🧪 Test rapide
1. Déconnecte-toi, fais une **inscription** avec une vraie adresse.
2. Tu dois recevoir le mail de confirmation **via Brevo** (vérifie aussi les spams au début).
3. Tableau de bord Brevo → **Statistics / Logs** : tu vois l'email partir.

---

## Récap
- **Pas de domaine** → **Brevo** (300/j) en principal, **Mailjet** (200/j) en backup.
- **Tu prends un domaine un jour** → tu peux passer à **Resend** (déjà préparé dans `RESEND_SETUP.md`) pour de l'envoi 100 % à ton nom de domaine + l'Edge Function pour des mails sur mesure.
- **Zéro code** côté app : tout se joue dans les réglages Supabase. ✅
