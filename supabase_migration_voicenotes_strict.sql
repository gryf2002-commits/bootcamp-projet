-- ============================================================
-- SunMates — Notes vocales : lecture resserrée aux SEULS concernés
-- ============================================================
-- AVANT : la policy SELECT du bucket privé "voicenotes" était
--   for select to authenticated using (bucket_id = 'voicenotes')
-- → n'importe quel membre CONNECTÉ pouvait lire n'importe quel vocal s'il
--   reconstruisait le chemin (uid/timestamp.webm). Pas exposé au public (bucket
--   privé, accès par URL signée), mais plus large que voulu.
--
-- APRÈS : on n'autorise la lecture d'un objet vocal que si l'utilisateur est
--   - le PROPRIÉTAIRE du dossier (l'expéditeur dépose dans uid/…), OU
--   - l'EXPÉDITEUR ou le DESTINATAIRE du message qui référence ce fichier
--     (messages.audio_path = nom de l'objet).
-- Le client lit via db.storage.createSignedUrl(...), qui applique la RLS : seuls
-- les 2 concernés pourront désormais générer le lien. Aucun changement côté app.
--
-- À exécuter dans le SQL Editor de Supabase. Idempotent (rejouable sans risque).
-- ============================================================

drop policy if exists "voice read" on storage.objects;
create policy "voice read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'voicenotes'
    and (
      -- mon propre dossier (l'expéditeur a déposé dans uid/…)
      (storage.foldername(name))[1] = auth.uid()::text
      -- ou je suis l'expéditeur/destinataire du message qui pointe ce fichier
      or exists (
        select 1 from public.messages m
        where m.audio_path = storage.objects.name
          and (m.sender_id = auth.uid() or m.recipient_id = auth.uid())
      )
    )
  );

-- ============================================================
-- Fin. Les policies d'UPLOAD et de SUPPRESSION (chacun dans son dossier uid/…)
-- restent inchangées (supabase_migration_session36_vocaux.sql).
-- ============================================================
