/* ============================================================
   SunMates — ICÔNES MAISON v3 « DA SunMates » (style validé Maxime).
   Plat + coloré + propre (palette sunset/joaillerie), aplat couleur de
   FAMILLE + fin contour assorti + détail crème. PAS de gemme cabochon,
   PAS de soleil ajouté, PAS de line blanc. Rien qu'à nous, déclinable
   subtilement dans tous les modes (la tuile derrière, elle, suit le thème).
   API : window.SMIcon(name) | .has(name) | window.SMIconRender(root)
   ============================================================ */
(function () {
  // Détail clair (crème DA, jamais blanc pur)
  var K = '#FFF7EC';
  // helper : forme pleine (couleur) + même forme en contour (assorti foncé) + détail
  function ic(shape, fill, stroke, detail) {
    var solid = shape.replace(/@F/g, fill).replace(/STROKE/g, '');
    var line = shape.replace(/@F/g, 'none').replace(/STROKE/g, 'stroke="' + stroke + '" stroke-width="1.7"');
    return solid + line + (detail || '');
  }
  // NB : dans `shape`, mettre fill="@F" STROKE sur le tracé principal.
  var P = {}; // glyphes

  // ---- silhouettes (fill="@F" STROKE = remplacé par couleur puis contour) ----
  var SH = {
    shield: '<path d="M24 4 40 9.5V23c0 11-7.2 18.3-16 22.2C15.2 41.3 8 34 8 23V9.5Z" fill="@F" STROKE/>',
    pin: '<path d="M24 4c-7.7 0-14 6-14 13.4C10 28 24 44 24 44s14-16 14-26.6C38 10 31.7 4 24 4z" fill="@F" STROKE/>',
    gamepad: '<rect x="5" y="14" width="38" height="22" rx="11" fill="@F" STROKE/>',
    cup: '<path d="M9 13h26v10a13 13 0 0 1-26 0z" fill="@F" STROKE/>',
    leaf: '<path d="M11 37C11 20 26 9 39 9c.5 17-10 28-26 28z" fill="@F" STROKE/>',
    star: '<path d="M24 5l5.3 11.1 12.2 1.6-9 8.4 2.3 12L24 32.1 13.2 38.7l2.3-12-9-8.4 12.2-1.6z" fill="@F" STROKE/>',
    flame: '<path d="M25 4c2.4 6.5-4.5 9.5-4.5 15.5a4 4 0 0 0 8 0c0-1.2-.2-2.2-.7-3.2 3.4 2.4 7.2 6.6 7.2 12.7a11 11 0 0 1-22 0c0-9.6 8.6-13.8 12-25z" fill="@F" STROKE/>',
    target: '<circle cx="24" cy="24" r="18" fill="@F" STROKE/>',
    bag: '<path d="M11 16h26l-2 23a2 2 0 0 1-2 2H15a2 2 0 0 1-2-2z" fill="@F" STROKE/>',
    cal: '<rect x="7" y="11" width="34" height="30" rx="5" fill="@F" STROKE/>',
    map: '<path d="M8 12l10-4 12 4 10-4v28l-10 4-12-4-10 4z" fill="@F" STROKE/>',
    city: '<path d="M5 42V23l8-5 8 5v-8l9-6 13 8v25z" fill="@F" STROKE/>',
    phone: '<path d="M15 5c-3.2 0-6.2 3-5.2 7.2 2.3 12.6 12.4 22.7 25 25 4.2 1 7.2-2 7.2-5.2v-4.8l-8.4-3-3.2 4.2A21 21 0 0 1 17.6 16.6l4.2-3.2-3-8.4z" fill="@F" STROKE/>',
    tri: '<path d="M24 6.5 43 39a2 2 0 0 1-1.8 3H6.8A2 2 0 0 1 5 39z" fill="@F" STROKE/>',
    clock: '<circle cx="24" cy="25" r="17" fill="@F" STROKE/>',
    sq: '<rect x="8" y="8" width="32" height="32" rx="9" fill="@F" STROKE/>',
    kit: '<rect x="6" y="13" width="36" height="27" rx="6" fill="@F" STROKE/>',
    bubble: '<path d="M8 13a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v15a4 4 0 0 1-4 4H21l-9 7v-7a4 4 0 0 1-4-4z" fill="@F" STROKE/>',
    env: '<rect x="6" y="11" width="36" height="26" rx="5" fill="@F" STROKE/>',
    crown: '<path d="M7 36 4 13.5l10.5 7.2L24 7l9.5 13.7L44 13.5 41 36z" fill="@F" STROKE stroke-linejoin="round"/>',
    suitcase: '<rect x="9" y="15" width="30" height="25" rx="5" fill="@F" STROKE/>',
    bell: '<path d="M24 6a3 3 0 0 1 3 3.2c5.6 1.2 8.5 5.8 8.5 12.3 0 6 2 8 3.8 10.5H8.7c1.8-2.5 3.8-4.5 3.8-10.5 0-6.5 2.9-11.1 8.5-12.3A3 3 0 0 1 24 6z" fill="@F" STROKE/>',
    flag: '<path d="M13 7h21l-5.5 7 5.5 7H13z" fill="@F" STROKE/>',
    mega: '<path d="M9 19v10l6 1 7 8 4-1.2V11.2L22 10l-7 8z" fill="@F" STROKE/>',
    ticket: '<path d="M6 14a3 3 0 0 1 3-3h30a3 3 0 0 1 3 3v4a3 3 0 0 0 0 6v4a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-4a3 3 0 0 0 0-6z" fill="@F" STROKE/>',
    card: '<rect x="6" y="6" width="36" height="36" rx="8" fill="@F" STROKE/>',
    mic: '<rect x="18" y="5" width="12" height="22" rx="6" fill="@F" STROKE/>',
    gear: '<path d="M24 4l3 5.2a16 16 0 0 1 4 1.6l6-1.2 3 5.2-4 4.6a16 16 0 0 1 0 4.4l4 4.6-3 5.2-6-1.2a16 16 0 0 1-4 1.6L24 44l-3-5.2a16 16 0 0 1-4-1.6l-6 1.2-3-5.2 4-4.6a16 16 0 0 1 0-4.4l-4-4.6 3-5.2 6 1.2a16 16 0 0 1 4-1.6z" fill="@F" STROKE/>',
    cross: '<path d="M19.5 6h9v9.5H38v9h-9.5V34h-9v-9.5H10v-9h9.5z" fill="@F" STROKE/>'
  };

  // couleurs DA (fill / contour assorti)
  var C = {
    coral: ['#FF6E5A', '#D8402F'], red: ['#FF5A4D', '#C9281F'], pink: ['#FF8FA8', '#E84D78'],
    rose: ['#F76FA0', '#D63A78'], violet: ['#9B7BFF', '#6638D6'], teal: ['#16C0A4', '#0E8C7A'],
    green: ['#2BC48A', '#138A63'], gold: ['#FFC24B', '#D9881A'], amber: ['#F0A23A', '#C26A1E'],
    blue: ['#5E74E8', '#3641B8']
  };
  function G(shapeKey, colKey, detail) { var c = C[colKey]; return ic(SH[shapeKey], c[0], c[1], detail || ''); }

  var check = '<path d="M17 24l5 5 9-10" fill="none" stroke="' + K + '" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>';
  var dot = function (cx, cy, r) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + K + '"/>'; };

  var GLYPHS = {
    // Lieux / découverte
    near: G('pin', 'teal', dot(24, 17.5, 5)),
    coffee: G('cup', 'amber', '<path d="M35 16h3.4a4.6 4.6 0 0 1 0 9.2H35" fill="none" stroke="#C26A1E" stroke-width="1.7"/><rect x="9" y="37" width="26" height="4.2" rx="2.1" fill="#F0A23A" stroke="#C26A1E" stroke-width="1.7"/>'),
    eco: G('leaf', 'green', '<path d="M31 17C24 23 17 30 14 36" fill="none" stroke="' + K + '" stroke-width="2.4" stroke-linecap="round"/>'),
    rating: G('star', 'gold'),
    popular: G('flame', 'coral'),
    // Jeux
    quest: G('target', 'coral', '<circle cx="24" cy="24" r="10" fill="none" stroke="' + K + '" stroke-width="3"/>' + dot(24, 24, 3.4)),
    games: G('gamepad', 'violet', '<g stroke="' + K + '" stroke-width="2.8" stroke-linecap="round"><line x1="12" y1="25" x2="19" y2="25"/><line x1="15.5" y1="21.5" x2="15.5" y2="28.5"/></g><circle cx="31" cy="22.5" r="2.7" fill="#FFD15C"/><circle cx="36.5" cy="27.5" r="2.7" fill="#FF8A3D"/>'),
    medal: '<path d="M16 5l6 13M32 5l-6 13" stroke="#D9881A" stroke-width="3.2" stroke-linecap="round"/><circle cx="24" cy="29" r="13" fill="' + C.gold[0] + '" stroke="' + C.gold[1] + '" stroke-width="1.7"/><circle cx="24" cy="29" r="6.5" fill="none" stroke="' + K + '" stroke-width="2.6"/>',
    coupon: G('ticket', 'green', '<line x1="28" y1="12.5" x2="28" y2="35.5" stroke="' + K + '" stroke-width="2" stroke-dasharray="2 3"/>'),
    rank: ic('<path d="M15 6h18v9a9 9 0 0 1-18 0z" fill="@F" STROKE/>', C.gold[0], C.gold[1]) + '<path d="M15 8H9v2.5a6 6 0 0 0 6 6M33 8h6v2.5a6 6 0 0 1-6 6" fill="none" stroke="' + C.gold[0] + '" stroke-width="3" stroke-linecap="round"/><rect x="21.5" y="23" width="5" height="9" fill="' + C.gold[0] + '"/><rect x="14" y="32" width="20" height="5" rx="2.2" fill="' + C.gold[0] + '" stroke="' + C.gold[1] + '" stroke-width="1.7"/>',
    shop: G('bag', 'rose', '<path d="M17.5 17a6.5 6.5 0 0 1 13 0" fill="none" stroke="' + K + '" stroke-width="2.6"/>'),
    calendar: G('cal', 'blue', '<line x1="7" y1="20" x2="41" y2="20" stroke="' + K + '" stroke-width="2"/><line x1="16" y1="6" x2="16" y2="14" stroke="#5E74E8" stroke-width="3.2" stroke-linecap="round"/><line x1="32" y1="6" x2="32" y2="14" stroke="#5E74E8" stroke-width="3.2" stroke-linecap="round"/>'),
    map: G('map', 'teal', '<path d="M18 8v28M30 12v28" stroke="' + K + '" stroke-opacity=".7" stroke-width="1.6"/>'),
    cityscape: G('city', 'violet', '<g fill="' + K + '"><rect x="34" y="20" width="3" height="3"/><rect x="34" y="27" width="3" height="3"/><rect x="11" y="28" width="3" height="3"/></g>'),
    // Sécurité
    phone: G('phone', 'teal'),
    signal: '<path d="M18 6h12l-1.6 12H19.6z" fill="' + C.gold[0] + '" stroke="' + C.gold[1] + '" stroke-width="1.7" stroke-linejoin="round"/><rect x="20.5" y="18" width="7" height="24" rx="2.5" fill="' + C.gold[0] + '" stroke="' + C.gold[1] + '" stroke-width="1.7"/><g stroke="#FF8A3D" stroke-width="2.4" stroke-linecap="round"><line x1="33" y1="10" x2="38" y2="7"/><line x1="34" y1="16" x2="39" y2="16"/><line x1="15" y1="10" x2="10" y2="7"/><line x1="14" y1="16" x2="9" y2="16"/></g>',
    alert: G('tri', 'red', '<rect x="22" y="19" width="4" height="11" rx="2" fill="' + K + '"/><circle cx="24" cy="35" r="2.3" fill="' + K + '"/>'),
    clock: G('clock', 'gold', '<path d="M24 15v11l7.5 4.5" fill="none" stroke="' + K + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'),
    users: '<circle cx="17.5" cy="16" r="6.5" fill="' + C.pink[0] + '" stroke="' + C.pink[1] + '" stroke-width="1.7"/><path d="M6 41c0-7.2 5.2-11.5 11.5-11.5S29 34.3 29 41Z" fill="' + C.pink[0] + '" stroke="' + C.pink[1] + '" stroke-width="1.7"/><circle cx="32" cy="18" r="6" fill="' + C.coral[0] + '" stroke="' + C.coral[1] + '" stroke-width="1.7"/><path d="M22 41c.6-6.6 5.7-10.5 11.4-10.5S43 34.4 43 41Z" fill="' + C.coral[0] + '" stroke="' + C.coral[1] + '" stroke-width="1.7"/>',
    usersolo: '<circle cx="24" cy="16" r="8" fill="' + C.violet[0] + '" stroke="' + C.violet[1] + '" stroke-width="1.7"/><path d="M8 42c0-9 7-14.5 16-14.5S40 33 40 42z" fill="' + C.violet[0] + '" stroke="' + C.violet[1] + '" stroke-width="1.7"/>',
    aid: G('sq', 'coral', '<path d="M20.5 15h7v5.5H33v7h-5.5V33h-7v-5.5H15v-7h5.5z" fill="' + K + '"/>'),
    shieldsafe: G('shield', 'coral', check),
    firstaid: G('kit', 'coral', '<path d="M18 13v-3.5a2.5 2.5 0 0 1 2.5-2.5h7a2.5 2.5 0 0 1 2.5 2.5V13" fill="none" stroke="' + C.coral[0] + '" stroke-width="3"/><path d="M21 21h6v4.5h4.5v6H27V36h-6v-4.5h-4.5v-6H21z" fill="' + K + '"/>'),
    safetravel: G('target', 'teal', '<path d="M31 17 26 26l-9 5 5-9z" fill="' + K + '"/>' + dot(24, 24, 2.4)),
    report: '<path d="M13 5v38" stroke="' + C.coral[0] + '" stroke-width="3.6" stroke-linecap="round"/>' + G('flag', 'coral'),
    contact: G('mega', 'gold', '<path d="M31 17a9 9 0 0 1 0 14" fill="none" stroke="#D9881A" stroke-width="2.6" stroke-linecap="round"/>'),
    chat: G('bubble', 'violet', '<g fill="' + K + '"><circle cx="18" cy="20.5" r="2.1"/><circle cx="24" cy="20.5" r="2.1"/><circle cx="30" cy="20.5" r="2.1"/></g>'),
    message: G('bubble', 'blue', '<g fill="' + K + '"><circle cx="18" cy="20.5" r="2.1"/><circle cx="24" cy="20.5" r="2.1"/><circle cx="30" cy="20.5" r="2.1"/></g>'),
    // Pro / divers
    chart: G('card', 'green', '<path d="M13 30l7-7 5 4 10-11" fill="none" stroke="' + K + '" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 16h6v6" fill="none" stroke="' + K + '" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>'),
    stats: G('card', 'blue', '<g fill="' + K + '"><rect x="13" y="26" width="5.5" height="9" rx="1.6"/><rect x="21.2" y="18" width="5.5" height="17" rx="1.6"/><rect x="29.4" y="22" width="5.5" height="13" rx="1.6"/></g>'),
    crown: G('crown', 'gold', '<rect x="7" y="37.5" width="34" height="5" rx="2.2" fill="' + C.gold[0] + '" stroke="' + C.gold[1] + '" stroke-width="1.7"/><circle cx="24" cy="20" r="2.6" fill="#FF5A4D"/>'),
    trip: G('suitcase', 'amber', '<path d="M18 15v-3a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v3" fill="none" stroke="#C26A1E" stroke-width="3"/><line x1="24" y1="20" x2="24" y2="40" stroke="' + K + '" stroke-width="2" stroke-opacity=".7"/>'),
    bell: G('bell', 'gold', '<path d="M20 36a4 4 0 0 0 8 0" fill="' + K + '"/>'),
    search: '<circle cx="21" cy="21" r="12.5" fill="' + C.blue[0] + '" stroke="' + C.blue[1] + '" stroke-width="1.7"/><circle cx="21" cy="21" r="6.5" fill="none" stroke="' + K + '" stroke-width="2.4"/><line x1="30.5" y1="30.5" x2="41" y2="41" stroke="' + C.blue[0] + '" stroke-width="5.5" stroke-linecap="round"/>',
    mail: G('env', 'blue', '<path d="M8 15l16 12 16-12" fill="none" stroke="' + K + '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>'),
    settings: G('gear', 'blue', dot(24, 24, 6)),
    mic: G('mic', 'coral', '<path d="M12 22a12 12 0 0 0 24 0" fill="none" stroke="' + K + '" stroke-width="2.6" stroke-linecap="round"/><line x1="24" y1="34" x2="24" y2="42" stroke="' + C.coral[0] + '" stroke-width="3.4" stroke-linecap="round"/>'),
    flame: G('flame', 'coral'),
    star: G('star', 'gold'),
    handshake: '<path d="M4 18l8-3 9 6 6-2 4 3 9-4v12l-7 3-8-6-3 1-5 6-7-4z" fill="' + C.gold[0] + '" stroke="' + C.gold[1] + '" stroke-width="1.7" stroke-linejoin="round"/>'
  };
  GLYPHS.challenge = GLYPHS.quest;
  GLYPHS.mood = GLYPHS.popular;
  GLYPHS.availability = GLYPHS.coffee;

  function wrap(inner) { return '<svg viewBox="0 0 48 48" class="smi">' + inner + '</svg>'; }
  window.SMIcon = function (name) { return GLYPHS[name] ? wrap(GLYPHS[name]) : ''; };
  window.SMIcon.has = function (name) { return !!GLYPHS[name]; };
  window.SMIconRender = function (root) {
    try {
      (root || document).querySelectorAll('[data-smicon]').forEach(function (el) {
        var k = el.getAttribute('data-smicon');
        if (!GLYPHS[k]) return;
        if (el.getAttribute('data-smicon-done') === k) return;
        el.innerHTML = wrap(GLYPHS[k]);
        var sz = el.getAttribute('data-smicon-size');
        if (sz) { var s = el.querySelector('svg'); if (s) { s.style.width = sz + 'px'; s.style.height = sz + 'px'; s.style.flexShrink = '0'; } }
        el.setAttribute('data-smicon-done', k);
      });
    } catch (e) {}
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { window.SMIconRender(); });
  else window.SMIconRender();
})();
