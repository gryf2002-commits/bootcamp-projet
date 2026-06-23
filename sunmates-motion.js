// sunmates-motion.js — couche MOTION (GSAP) façon "Emil" : motion utile, rapide, GPU, respectueuse de
// prefers-reduced-motion. Chargée APRÈS GSAP (qui est best-effort : si GSAP n'a pas chargé, tout
// retombe proprement sur le CSS existant). AUCUNE dépendance dure : window.SMMotion.* renvoie false/no-op
// si GSAP absent → l'app marche identiquement sans réseau.
(function () {
  "use strict";
  var reduce = false;
  try { reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  function G() { return window.gsap || null; }
  var SM = (window.SMMotion = window.SMMotion || {});
  SM.ok = function () { return !!G() && !reduce; };

  // Easing « Emil » (strong ease-out, ~ cubic-bezier(.23,1,.32,1)) — punchy, jamais mou.
  var EASE = "power3.out";

  // Entrée en CASCADE des blocs d'un panneau, jouée au CHANGEMENT D'ONGLET (pas au scroll → pas de jank
  // ni de « depop/repop »). clearProps:"all" à la fin → AUCUN transform résiduel sur les sections
  // (évite de re-créer un containing block qui casserait le scroll tactile).
  SM.revealPanel = function (panel) {
    var g = G();
    if (!g || reduce || !panel) return false;
    var all = panel.querySelectorAll(
      ':scope > section, :scope > .section-head, :scope > .card, :scope > .grid2, :scope > details, :scope > #homeTravelMap, :scope > .secu-view > section, :scope > .secu-view > .section-head'
    );
    if (!all.length) return false;
    // On n'anime QUE les blocs JAMAIS révélés (marqueur .sm-reveal) → AUCUNE ré-animation au re-clic
    // d'onglet (sinon « depop/repop »). Les blocs reçoivent .sm-reveal+.in = état final CSS conservé
    // après le clearProps de GSAP.
    var fresh = [];
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (!el.classList.contains("sm-reveal") && el.offsetParent !== null) { el.classList.add("sm-reveal", "in"); fresh.push(el); }
    }
    if (!fresh.length) return true; // déjà révélé → on dit "géré" mais on ne rejoue rien
    try {
      g.killTweensOf(fresh);
      g.fromTo(fresh,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.5, ease: EASE, stagger: 0.05, clearProps: "all", overwrite: true });
    } catch (e) {}
    return true;
  };

  // Compteur animé (XP, confiance, stats) — le nombre « monte » jusqu'à sa valeur.
  SM.countUp = function (el, to, dur) {
    if (!el) return;
    to = +to || 0;
    var g = G();
    if (!g || reduce) { el.textContent = String(to); return; }
    var from = parseInt(String(el.textContent).replace(/[^0-9-]/g, ""), 10) || 0;
    if (from === to) { el.textContent = String(to); return; }
    var o = { v: from };
    try {
      g.to(o, { v: to, duration: dur || 0.9, ease: "power2.out", onUpdate: function () { el.textContent = String(Math.round(o.v)); }, onComplete: function () { el.textContent = String(to); } });
    } catch (e) { el.textContent = String(to); }
  };

  // « Pop » de récompense (level-up, badge débloqué, succès) — petit ressort, à usage RARE (Emil :
  // les moments délicieux, pas les actions fréquentes).
  SM.pop = function (el) {
    var g = G();
    if (!g || reduce || !el) return;
    try { g.fromTo(el, { scale: 0.82 }, { scale: 1, duration: 0.5, ease: "back.out(2)", clearProps: "transform" }); } catch (e) {}
  };

  // Remplissage animé d'une barre (largeur 0 → cible) — pour les jauges d'XP/progression.
  SM.fillBar = function (el, pct) {
    if (!el) return;
    var g = G();
    if (!g || reduce) { el.style.width = pct + "%"; return; }
    try { g.fromTo(el, { width: "0%" }, { width: pct + "%", duration: 0.9, ease: EASE }); } catch (e) { el.style.width = pct + "%"; }
  };
})();
