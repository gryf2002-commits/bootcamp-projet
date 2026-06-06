-- ============================================================
-- Forcer les comptes EXISTANTS à reconfirmer leur email
-- (à lancer dans le SQL Editor de Supabase)
-- ============================================================
-- Principe : on remet email_confirmed_at à NULL → le compte redevient
-- "non confirmé". À sa prochaine connexion, Supabase refuse avec
-- "Email not confirmed", et l'app propose "Renvoyer le mail de confirmation".
--
-- ⚠️ IMPORTANT :
--   • Ça te concerne AUSSI (toi, l'admin). Soit tu t'exclues (ligne commentée
--     ci-dessous), soit prépare-toi à re-confirmer ton propre email.
--   • Les personnes DÉJÀ connectées (session active) ne sont PAS éjectées tout
--     de suite : elles seront bloquées à leur PROCHAINE connexion (après logout
--     ou expiration de session). C'est exactement ce que tu voulais.
--   • Teste d'abord sur UN seul compte (dé-commente la variante "test").

-- ---- 1) (RECOMMANDÉ) tester sur un seul compte d'abord ----
-- update auth.users
-- set email_confirmed_at = null
-- where email = 'adresse-de-test@example.com';

-- ---- 2) Tous les comptes existants (SAUF toi, l'admin) ----
update auth.users
set email_confirmed_at = null
where email_confirmed_at is not null
  and email <> 'maxime.durao@delta-business.school';   -- ← garde TON accès

-- ---- 2bis) Variante : TOUT LE MONDE, toi compris (si tu préfères) ----
-- update auth.users
-- set email_confirmed_at = null
-- where email_confirmed_at is not null;

-- Vérif : combien de comptes restent "confirmés" ?
-- select count(*) filter (where email_confirmed_at is not null) as confirmes,
--        count(*) filter (where email_confirmed_at is null)     as a_confirmer
-- from auth.users;
