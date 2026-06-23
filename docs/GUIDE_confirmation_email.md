# Activer la confirmation d'email + déconnexion forcée — SunMates

Suis les étapes **dans l'ordre**. Tout se passe dans le dashboard Supabase
(https://supabase.com/dashboard → ton projet SunMates), sauf l'étape 6 (SQL).

> ⚠️ Ordre important : on configure et on TESTE l'envoi de mail **avant** de
> déconnecter tout le monde. Sinon, si les mails ne partent pas, tes utilisateurs
> seraient bloqués dehors.

---

## 1. Brancher ton nom de domaine (URLs)
**Authentication → URL Configuration**
- **Site URL** : mets l'adresse publique de l'appli (ton nouveau domaine, ex.
  `https://sunmates.app`). C'est la base des liens dans les mails.
- **Redirect URLs** : ajoute les adresses autorisées après confirmation, par ex. :
  - `https://sunmates.app/*`
  - `https://gryf2002-commits.github.io/sunmates/*` (l'ancienne, tant qu'elle sert)

---

## 2. Brancher un SMTP custom (INDISPENSABLE)
**Project Settings → Authentication → SMTP Settings → Enable Custom SMTP**

> Pourquoi : le serveur mail intégré de Supabase est **limité (≈ quelques mails/heure)
> et réservé aux tests**. Pour de vrais utilisateurs, il FAUT ton propre SMTP, sinon
> les mails ne partent pas / tombent en spam.

Options simples avec ton domaine (choisis-en une, palier gratuit suffisant pour démarrer) :
- **Resend** (resend.com) — le plus simple, gratuit jusqu'à ~3000 mails/mois
- **Brevo** (ex-Sendinblue), **Mailgun**, **SendGrid** — équivalents

À faire chez le fournisseur : vérifier ton domaine (ajouter les enregistrements
**SPF / DKIM** dans ta zone DNS — le fournisseur te les donne en copier-coller).
Puis dans Supabase, renseigne : host, port, user, mot de passe, et :
- **Sender email** : `bonjour@tondomaine` (ex. `bonjour@sunmates.app`)
- **Sender name** : `SunMates`

---

## 3. Coller le joli template d'email
**Authentication → Email Templates → onglet "Confirm signup"**
- **Subject** : `Confirme ton adresse · SunMates 🌞`
- **Message body** : ouvre `email_confirm_signup_fr.html`, copie **tout**, colle-le ici.
  (Version anglaise = `email_confirm_signup_en.html`, à échanger quand tu veux.)

> Le template salue l'utilisateur par son **pseudo** (`{{ .Data.username }}`) et reprend
> la DA coucher de soleil. Le même template sert au bouton « Renvoyer le mail ».

---

## 4. Activer la confirmation d'email
**Authentication → Sign In / Providers → Email**
- Active **"Confirm email"** (ON).
- Vérifie aussi **"Minimum password length" = 8** (l'appli l'exige déjà côté code).

---

## 5. TESTER avant de déconnecter tout le monde
1. Ouvre l'appli, **crée un compte test** avec une vraie adresse à toi.
2. Tu dois voir : « 📧 Compte créé ! Ouvre ta boîte mail… ».
3. Vérifie le mail reçu : **beau, en français, bouton qui marche**, lien qui te
   ramène sur l'appli connectée.
4. Teste le **renvoi** : essaie de te connecter sans avoir cliqué → message +
   bouton « Renvoyer le mail de confirmation » → tu dois recevoir un 2ᵉ mail.

➡️ Si tout est bon, passe à l'étape 6. Sinon, ne déconnecte PAS encore.

---

## 6. Déconnexion forcée + reconfirmation des comptes existants
**SQL Editor** → ouvre `supabase_force_logout_and_confirm.sql`, lis les commentaires,
choisis l'option (toi inclus ou exclu) et lance les blocs **un par un**.

Effet : tout le monde est déconnecté, et chacun devra cliquer le lien reçu par mail
pour se reconnecter.

---

## En cas de pépin
- **Annuler / re-confirmer tout le monde** : lance `supabase_reconfirm_users.sql`.
- **Couper la confirmation** : étape 4, repasse "Confirm email" sur OFF.

---

## Traductions
- Les utilisateurs actuels sont francophones → garde le template **FR**.
- Pour l'anglais : remplace le body par `email_confirm_signup_en.html`.
- Astuce : Supabase n'envoie qu'**un** template à la fois (pas de choix automatique
  par langue de l'utilisateur). Si un jour tu veux du bilingue dans le même mail,
  on peut empiler FR puis EN dans un seul template — dis-le moi.
