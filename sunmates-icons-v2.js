/* SunMates - icons v2 : MODE EMOJIS NATIFS (moteur SVG desactive — retour Maxime).
   Plus aucun SVG genere. Les [data-smicon]/[data-icon] conservent leur emoji natif ;
   les rares elements vides sont remplis depuis NM. SMIcon.has() renvoie false pour que
   le JS appelant (emptyState, svRows…) retombe partout sur l'emoji natif. */
(function () {
  var NM = { "aid": "🛟", "alert": "🚨", "bar-chart": "📊", "bell": "🔔", "chat": "💬", "clock": "⏱️", "coffee": "☕", "contact": "📢", "coupon": "🎟️", "crown": "👑", "eco": "🌱", "firstaid": "🩺", "games": "🎮", "mail": "✉️", "medal": "🏅", "near": "📍", "phone": "📞", "popular": "🔥", "quest": "🎯", "rank": "🏆", "rating": "⭐", "report": "🚩", "safetravel": "🧭", "search": "🔍", "shieldsafe": "🛡️", "shop": "🛍️", "signal": "🔦", "trend-up": "📈", "trip": "🧳", "users": "🤝", "usersolo": "👤" };
  function emo(n) { if (n == null) return ""; var k = String(n).toLowerCase().trim(); return NM[k] || ""; }
  function SMIcon(n) { return emo(n); }
  SMIcon.has = function () { return false; };       // -> le JS retombe toujours sur l'emoji natif
  SMIcon.names = function () { return Object.keys(NM); };
  function paint(el, na) {
    if (el.getAttribute("data-smicon-done")) return;
    var txt = (el.textContent || "").replace(/\s/g, "");
    if (!txt) { var e = emo(el.getAttribute(na)); if (e) el.textContent = e; } // ne remplit QUE les vides
    el.setAttribute("data-smicon-done", "1");
  }
  function SMIconRender(root) {
    root = root || document;
    var a = root.querySelectorAll("[data-smicon]:not([data-smicon-done])");
    for (var i = 0; i < a.length; i++) paint(a[i], "data-smicon");
    var b = root.querySelectorAll("[data-icon]:not([data-smicon-done])");
    for (var j = 0; j < b.length; j++) paint(b[j], "data-icon");
  }
  window.SMIcon = SMIcon; window.SMIconRender = SMIconRender;
  function boot() {
    SMIconRender();
    try {
      new MutationObserver(function (m) {
        for (var i = 0; i < m.length; i++) {
          var ns = m[i].addedNodes;
          for (var k = 0; k < ns.length; k++) { var n = ns[k]; if (n.nodeType !== 1) continue; if (n.querySelectorAll) SMIconRender(n); }
        }
      }).observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }
  if (document.readyState !== "loading") boot(); else document.addEventListener("DOMContentLoaded", boot);
})();
