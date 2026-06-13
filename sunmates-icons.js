/* ============================================================
   SunMates — banque d'icônes SVG « maison » (UI).
   BASE SAINE (12 juin 2026, demande Maxime) : l'ancienne banque v1
   (~30 icônes) était DÉSACTIVÉE depuis la décision « DA v2.2 :
   emojis natifs partout » et ne servait plus à rien → supprimée
   pour repartir de zéro, sans être biaisé par l'existant.
   Les visuels ACTUELS de l'app (emojis natifs sur pastilles,
   médaillons de badges SMBadge, logos du header, icônes de la
   barre du bas) ne passent PAS par ce fichier et sont conservés.

   L'API reste en place (inerte) pour la future banque v2 :
     window.SMIcon(name, {size}) -> '' (string SVG quand v2 arrivera)
     window.SMIcon.has(name)     -> false (les emojis de repli restent)
     window.SMIconRender(root)   -> no-op
   ============================================================ */
(function () {
  window.SMIcon = function () { return ''; };
  window.SMIcon.has = function () { return false; };
  window.SMIconRender = function () {};
})();
