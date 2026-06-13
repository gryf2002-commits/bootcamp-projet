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
    rose: ['#F76FA0', '#D63A78'], violet: ['#9B7BFF', '#6638D6'], teal: ['#17B39A', '#0C8270'],
    green: ['#1FA77F', '#0E7456'], gold: ['#FFC24B', '#D9881A'], amber: ['#F0A23A', '#C26A1E'],
    blue: ['#5E74E8', '#3641B8']
  };
  function G(shapeKey, colKey, detail) { var c = C[colKey]; return ic(SH[shapeKey], c[0], c[1], detail || ''); }

  var check = '<path d="M17 24l5 5 9-10" fill="none" stroke="' + K + '" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>';
  var dot = function (cx, cy, r) { return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + K + '"/>'; };

  var GLYPHS = {
    // Lieux / découverte
    near: G('pin', 'teal', dot(24, 17.5, 5)),
    coffee: '<path d="M9 14h23v8.5a11.5 11.5 0 0 1-23 0z" fill="' + C.amber[0] + '" stroke="' + C.amber[1] + '" stroke-width="1.7" stroke-linejoin="round"/><path d="M32 16h3.4a4.6 4.6 0 0 1 0 9.2H32" fill="none" stroke="' + C.amber[1] + '" stroke-width="2.4"/><rect x="8" y="37" width="25" height="4.2" rx="2.1" fill="' + C.amber[0] + '" stroke="' + C.amber[1] + '" stroke-width="1.7"/><g stroke="' + K + '" stroke-width="2.2" stroke-linecap="round" opacity=".85"><path d="M16 5c-1.6 2.2 1.6 3.2 0 5.4"/><path d="M24 4c-1.6 2.2 1.6 3.2 0 5.4"/></g>',
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
    cityscape: '<g fill="' + C.violet[0] + '" stroke="' + C.violet[1] + '" stroke-width="1.6" stroke-linejoin="round"><rect x="6" y="22" width="11" height="20" rx="1.5"/><rect x="18" y="13" width="12" height="29" rx="1.5"/><rect x="31" y="27" width="11" height="15" rx="1.5"/></g><g fill="' + K + '"><rect x="9.5" y="26" width="2.4" height="2.4"/><rect x="9.5" y="32" width="2.4" height="2.4"/><rect x="22" y="18" width="2.4" height="2.4"/><rect x="22" y="24" width="2.4" height="2.4"/><rect x="25.5" y="18" width="2.4" height="2.4"/><rect x="34.5" y="31" width="2.4" height="2.4"/></g>',
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
    crown: '<path d="M5 35 7 15l8.5 6.5L24 8l8.5 13.5L41 15l2 20z" fill="' + C.gold[0] + '" stroke="' + C.gold[1] + '" stroke-width="1.7" stroke-linejoin="round"/><rect x="6" y="35" width="36" height="6" rx="2" fill="' + C.gold[0] + '" stroke="' + C.gold[1] + '" stroke-width="1.7"/><g fill="#FF5A4D"><circle cx="14" cy="25" r="2"/><circle cx="24" cy="21" r="2.3"/><circle cx="34" cy="25" r="2"/></g>',
    trip: G('suitcase', 'amber', '<path d="M18 15v-3a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v3" fill="none" stroke="#C26A1E" stroke-width="3"/><line x1="24" y1="20" x2="24" y2="40" stroke="' + K + '" stroke-width="2" stroke-opacity=".7"/>'),
    bell: G('bell', 'gold', '<path d="M20 36a4 4 0 0 0 8 0" fill="' + K + '"/>'),
    search: '<circle cx="21" cy="21" r="12.5" fill="' + C.blue[0] + '" stroke="' + C.blue[1] + '" stroke-width="1.7"/><circle cx="21" cy="21" r="6.5" fill="none" stroke="' + K + '" stroke-width="2.4"/><line x1="30.5" y1="30.5" x2="41" y2="41" stroke="' + C.blue[0] + '" stroke-width="5.5" stroke-linecap="round"/>',
    mail: G('env', 'blue', '<path d="M8 15l16 12 16-12" fill="none" stroke="' + K + '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>'),
    settings: '<g fill="' + C.blue[0] + '" stroke="' + C.blue[1] + '" stroke-width="1.5" stroke-linejoin="round"><rect x="21.5" y="3" width="5" height="9" rx="1.5"/><rect x="21.5" y="36" width="5" height="9" rx="1.5"/><rect x="3" y="21.5" width="9" height="5" rx="1.5"/><rect x="36" y="21.5" width="9" height="5" rx="1.5"/><rect x="8" y="8" width="5" height="9" rx="1.5" transform="rotate(45 10.5 12.5)"/><rect x="35" y="31" width="5" height="9" rx="1.5" transform="rotate(45 37.5 35.5)"/><rect x="35" y="8" width="5" height="9" rx="1.5" transform="rotate(-45 37.5 12.5)"/><rect x="8" y="31" width="5" height="9" rx="1.5" transform="rotate(-45 10.5 35.5)"/></g><circle cx="24" cy="24" r="12" fill="' + C.blue[0] + '" stroke="' + C.blue[1] + '" stroke-width="1.7"/><circle cx="24" cy="24" r="4.8" fill="' + K + '"/>',
    mic: G('mic', 'coral', '<path d="M12 22a12 12 0 0 0 24 0" fill="none" stroke="' + K + '" stroke-width="2.6" stroke-linecap="round"/><line x1="24" y1="34" x2="24" y2="42" stroke="' + C.coral[0] + '" stroke-width="3.4" stroke-linecap="round"/>'),
    flame: G('flame', 'coral'),
    star: G('star', 'gold'),
    handshake: '<circle cx="18" cy="24" r="8.5" fill="none" stroke="' + C.gold[0] + '" stroke-width="4.6"/><circle cx="30" cy="24" r="8.5" fill="none" stroke="' + C.coral[0] + '" stroke-width="4.6"/>',
    // --- inline (boutons/chips) ---
    door: '<rect x="7" y="6" width="20" height="36" rx="3" fill="' + C.teal[0] + '" stroke="' + C.teal[1] + '" stroke-width="1.7"/><circle cx="22" cy="24" r="2" fill="' + K + '"/><path d="M28 24h13M36 18.5l5.5 5.5-5.5 5.5" fill="none" stroke="' + C.coral[0] + '" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>',
    check: G('target', 'green', '<path d="M16.5 24l5 5 9.5-10.5" fill="none" stroke="' + K + '" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>'),
    layers: '<path d="M24 6 43 16 24 26 5 16z" fill="' + C.gold[0] + '" stroke="' + C.gold[1] + '" stroke-width="1.7" stroke-linejoin="round"/><path d="M6 23l18 9 18-9M6 31l18 9 18-9" fill="none" stroke="' + C.gold[0] + '" stroke-width="2.6" stroke-linejoin="round"/>',
    party: '<path d="M6 42 18 14l16 16z" fill="' + C.coral[0] + '" stroke="' + C.coral[1] + '" stroke-width="1.7" stroke-linejoin="round"/><g fill="#FFD15C"><circle cx="34" cy="9" r="2.4"/><circle cx="41" cy="18" r="2.4"/><circle cx="28" cy="6" r="2"/></g><circle cx="38" cy="11" r="1.6" fill="#16C0A4"/>',
    pin: '<circle cx="24" cy="14" r="9" fill="' + C.coral[0] + '" stroke="' + C.coral[1] + '" stroke-width="1.7"/><path d="M24 23v18" stroke="' + C.coral[1] + '" stroke-width="3" stroke-linecap="round"/>' + dot(24, 14, 3.4),
    plus: G('target', 'teal', '<path d="M24 16v16M16 24h16" stroke="' + K + '" stroke-width="3.6" stroke-linecap="round"/>'),
    globe: G('target', 'blue', '<g fill="none" stroke="' + K + '" stroke-width="2"><ellipse cx="24" cy="24" rx="8" ry="17"/><line x1="7" y1="24" x2="41" y2="24"/><path d="M10 15c8 5 20 5 28 0M10 33c8-5 20-5 28 0"/></g>'),
    heart: '<path d="M24 41C9 31 6 22 6 16.5 6 11 10 7 15 7c3.5 0 6.5 2 9 5 2.5-3 5.5-5 9-5 5 0 9 4 9 9.5C42 22 39 31 24 41z" fill="' + C.coral[0] + '" stroke="' + C.coral[1] + '" stroke-width="1.7" stroke-linejoin="round"/>',
    dots: '<g fill="' + C.violet[0] + '" stroke="' + C.violet[1] + '" stroke-width="1.4"><circle cx="10" cy="24" r="4"/><circle cx="24" cy="24" r="4"/><circle cx="38" cy="24" r="4"/></g>',
    block: '<circle cx="24" cy="24" r="17" fill="' + C.red[0] + '" stroke="' + C.red[1] + '" stroke-width="1.7"/><line x1="13" y1="13" x2="35" y2="35" stroke="' + K + '" stroke-width="3.4" stroke-linecap="round"/>',
    minus: G('target', 'teal', '<path d="M16 24h16" stroke="' + K + '" stroke-width="3.6" stroke-linecap="round"/>'),
    // --- contenu (top emojis fréquents) ---
    plane: '<path d="M22 4c1.6-1.6 4-1.6 4 2v12l16 9v4l-16-5v9l5 4v3l-9-3-9 3v-3l5-4v-9l-16 5v-4l16-9V6c0-1 .8-1.4 1.4-2z" fill="' + C.coral[0] + '" stroke="' + C.coral[1] + '" stroke-width="1.6" stroke-linejoin="round"/>',
    sun: '<circle cx="24" cy="24" r="9" fill="' + C.gold[0] + '" stroke="' + C.gold[1] + '" stroke-width="1.7"/><g stroke="#FF8A3D" stroke-width="3" stroke-linecap="round"><path d="M24 4v5M24 39v5M4 24h5M39 24h5M9.9 9.9l3.5 3.5M34.6 34.6l3.5 3.5M38.1 9.9l-3.5 3.5M13.4 34.6l-3.5 3.5"/></g>',
    sunset: '<g stroke="#FF8A3D" stroke-width="2.6" stroke-linecap="round"><path d="M24 6v5M8 16l3 3M40 16l-3 3M3 27h5M40 27h5"/></g><path d="M14 27a10 10 0 0 1 20 0z" fill="' + C.gold[0] + '" stroke="' + C.gold[1] + '" stroke-width="1.7"/><path d="M4 33h40M9 39h30" stroke="' + C.coral[0] + '" stroke-width="3" stroke-linecap="round"/>',
    moon: '<path d="M30 6a15 15 0 1 0 12 24A12.5 12.5 0 0 1 30 6z" fill="' + C.gold[0] + '" stroke="' + C.gold[1] + '" stroke-width="1.7" stroke-linejoin="round"/>',
    palm: '<path d="M22 42c1-12 0-18-3-24" stroke="' + C.amber[1] + '" stroke-width="3" stroke-linecap="round" fill="none"/><g fill="' + C.green[0] + '" stroke="' + C.green[1] + '" stroke-width="1.4"><path d="M19 16C13 11 6 11 2 15c5-1 10 0 17 3z"/><path d="M19 16c-2-7 1-13 7-16-3 4-4 9-2 15z"/><path d="M19 16c6-5 14-5 19 0-6-2-12-1-19 2z"/></g>',
    snow: '<g stroke="' + C.blue[0] + '" stroke-width="2.6" stroke-linecap="round"><path d="M24 4v40M6.6 14l34.8 20M41.4 14L6.6 34"/><path d="M18 8l6 5 6-5M18 40l6-5 6 5M8 19l2 7-6 3M38 19l-2 7 6 3M8 29l-2-7-6-3M38 29l2-7 6-3"/></g>',
    coin: '<circle cx="24" cy="24" r="17" fill="' + C.gold[0] + '" stroke="' + C.gold[1] + '" stroke-width="1.7"/><circle cx="24" cy="24" r="11.5" fill="none" stroke="' + C.gold[1] + '" stroke-opacity=".5" stroke-width="1.6"/><path d="M24 17v14M20.5 20.5h6a3 3 0 0 1 0 6h-5a3 3 0 0 0 0 6h6" fill="none" stroke="' + K + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    idcard: '<rect x="5" y="11" width="38" height="26" rx="5" fill="' + C.teal[0] + '" stroke="' + C.teal[1] + '" stroke-width="1.7"/><circle cx="16" cy="22" r="4.5" fill="' + K + '"/><path d="M9.5 33c0-4 3-6 6.5-6s6.5 2 6.5 6z" fill="' + K + '"/><g stroke="' + K + '" stroke-width="2.4" stroke-linecap="round"><line x1="28" y1="20" x2="38" y2="20"/><line x1="28" y1="27" x2="35" y2="27"/></g>',
    trash: '<path d="M11 14h26l-2 25a3 3 0 0 1-3 3H16a3 3 0 0 1-3-3z" fill="' + C.coral[0] + '" stroke="' + C.coral[1] + '" stroke-width="1.7" stroke-linejoin="round"/><path d="M8 14h32M19 9h10" stroke="' + C.coral[1] + '" stroke-width="3" stroke-linecap="round"/><g stroke="' + K + '" stroke-width="2.2" stroke-linecap="round"><line x1="19" y1="21" x2="20" y2="35"/><line x1="29" y1="21" x2="28" y2="35"/></g>',
    camera: '<rect x="4" y="14" width="40" height="26" rx="5" fill="' + C.violet[0] + '" stroke="' + C.violet[1] + '" stroke-width="1.7"/><path d="M16 14l3-5h10l3 5" fill="' + C.violet[0] + '" stroke="' + C.violet[1] + '" stroke-width="1.7" stroke-linejoin="round"/><circle cx="24" cy="27" r="7" fill="' + K + '"/>',
    lock: '<rect x="9" y="21" width="30" height="22" rx="5" fill="' + C.gold[0] + '" stroke="' + C.gold[1] + '" stroke-width="1.7"/><path d="M15 21v-5a9 9 0 0 1 18 0v5" fill="none" stroke="' + C.gold[1] + '" stroke-width="3"/><circle cx="24" cy="31" r="3.2" fill="' + K + '"/>',
    write: '<path d="M8 40l3-9L31 11l7 7-20 20z" fill="' + C.gold[0] + '" stroke="' + C.gold[1] + '" stroke-width="1.7" stroke-linejoin="round"/><path d="M28 14l7 7" stroke="' + K + '" stroke-width="2"/>',
    smile: '<circle cx="24" cy="24" r="18" fill="' + C.gold[0] + '" stroke="' + C.gold[1] + '" stroke-width="1.7"/><g fill="' + C.gold[1] + '"><circle cx="17" cy="20" r="2.4"/><circle cx="31" cy="20" r="2.4"/></g><path d="M15 28a10 9 0 0 0 18 0" fill="none" stroke="' + C.gold[1] + '" stroke-width="2.6" stroke-linecap="round"/>',
    rocket: '<path d="M24 4c7 4 11 11 11 20l-4 6H17l-4-6C13 15 17 8 24 4z" fill="' + C.coral[0] + '" stroke="' + C.coral[1] + '" stroke-width="1.7" stroke-linejoin="round"/><circle cx="24" cy="19" r="4" fill="' + K + '"/><path d="M17 30l-5 4 3-9M31 30l5 4-3-9" fill="' + C.gold[0] + '" stroke="' + C.gold[1] + '" stroke-width="1.5" stroke-linejoin="round"/><path d="M21 38l3 6 3-6" fill="#FF8A3D"/>',
    gift: '<rect x="7" y="18" width="34" height="24" rx="3" fill="' + C.coral[0] + '" stroke="' + C.coral[1] + '" stroke-width="1.7"/><rect x="5" y="12" width="38" height="8" rx="2" fill="' + C.red[0] + '" stroke="' + C.red[1] + '" stroke-width="1.7"/><path d="M24 12V42" stroke="' + K + '" stroke-width="3"/><path d="M24 12c-3-9-12-6-9 0M24 12c3-9 12-6 9 0" fill="none" stroke="' + C.gold[0] + '" stroke-width="3"/>',
    bulb: '<path d="M24 5c8 0 13 6 13 13 0 5-3 8-5 11-1 1.5-1 3-1 4H17c0-1 0-2.5-1-4-2-3-5-6-5-11 0-7 5-13 13-13z" fill="' + C.gold[0] + '" stroke="' + C.gold[1] + '" stroke-width="1.7"/><path d="M18 41h12M20 45h8" stroke="' + C.gold[1] + '" stroke-width="2.6" stroke-linecap="round"/>',
    heartfull: '<path d="M24 41C9 31 6 22 6 16.5 6 11 10 7 15 7c3.5 0 6.5 2 9 5 2.5-3 5.5-5 9-5 5 0 9 4 9 9.5C42 22 39 31 24 41z" fill="' + C.gold[0] + '" stroke="' + C.gold[1] + '" stroke-width="1.7" stroke-linejoin="round"/>',
    // --- vague 2 (titres/activités) ---
    home: '<path d="M6 22 24 7l18 15" fill="none" stroke="' + C.coral[1] + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 20v18a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V20" fill="' + C.coral[0] + '" stroke="' + C.coral[1] + '" stroke-width="1.7" stroke-linejoin="round"/><rect x="20" y="28" width="8" height="12" fill="' + K + '"/>',
    film: G('card', 'violet', '<g fill="' + K + '"><rect x="6" y="11" width="4" height="26"/><rect x="38" y="11" width="4" height="26"/><rect x="13" y="6" width="4" height="4" rx="1"/><rect x="13" y="38" width="4" height="4" rx="1"/><rect x="22" y="6" width="4" height="4" rx="1"/><rect x="22" y="38" width="4" height="4" rx="1"/><rect x="31" y="6" width="4" height="4" rx="1"/><rect x="31" y="38" width="4" height="4" rx="1"/></g>'),
    play: G('target', 'teal', '<path d="M20 16l12 8-12 8z" fill="' + K + '"/>'),
    sos: '<path d="M24 5c5 6 11 9 17 9 1 14-5 25-17 30C12 39 6 28 7 14c6 0 12-3 17-9z" fill="' + C.red[0] + '" stroke="' + C.red[1] + '" stroke-width="1.7" stroke-linejoin="round"/><rect x="22" y="16" width="4" height="11" rx="2" fill="' + K + '"/><circle cx="24" cy="32" r="2.3" fill="' + K + '"/>',
    list: G('card', 'gold', '<g stroke="' + K + '" stroke-width="2.6" stroke-linecap="round"><line x1="15" y1="16" x2="33" y2="16"/><line x1="15" y1="24" x2="33" y2="24"/><line x1="15" y1="32" x2="27" y2="32"/></g>'),
    upload: G('target', 'teal', '<path d="M24 32V15M17 22l7-7 7 7" fill="none" stroke="' + K + '" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>'),
    refresh: G('target', 'teal', '<path d="M33 18a12 12 0 1 0 2.5 9" fill="none" stroke="' + K + '" stroke-width="3.2" stroke-linecap="round"/><path d="M33 11v8h-8" fill="none" stroke="' + K + '" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>'),
    image: G('card', 'violet', '<circle cx="17" cy="18" r="3" fill="#FFD15C"/><path d="M9 36l9-10 6 6 7-8 8 12z" fill="' + K + '"/>'),
    tree: '<path d="M24 6c6 0 11 5 11 11 0 4-2 7-5 9 3 1 6 4 6 8 0 5-5 8-12 8-7 0-12-3-12-8 0-4 3-7 6-8-3-2-5-5-5-9C13 11 18 6 24 6z" fill="' + C.green[0] + '" stroke="' + C.green[1] + '" stroke-width="1.7" stroke-linejoin="round"/><rect x="22" y="36" width="4" height="7" fill="' + C.amber[1] + '"/>',
    beach: '<path d="M24 9C14 9 6 17 6 27h36C42 17 34 9 24 9z" fill="' + C.coral[0] + '" stroke="' + C.coral[1] + '" stroke-width="1.7" stroke-linejoin="round"/><path d="M24 9v33" stroke="' + C.amber[1] + '" stroke-width="2.6" stroke-linecap="round"/><circle cx="24" cy="9" r="2.4" fill="#FFD15C"/>',
    hiking: '<path d="M14 6h7v20l13 7-3 6-17-9z" fill="' + C.amber[0] + '" stroke="' + C.amber[1] + '" stroke-width="1.6" stroke-linejoin="round"/><path d="M11 33h26a4 4 0 0 1 4 4v3H7v-3a4 4 0 0 1 4-4z" fill="' + C.coral[0] + '" stroke="' + C.coral[1] + '" stroke-width="1.6" stroke-linejoin="round"/>',
    cocktail: '<path d="M8 11h32L24 27z" fill="' + C.coral[0] + '" stroke="' + C.coral[1] + '" stroke-width="1.7" stroke-linejoin="round"/><path d="M24 27v13M16 41h16" stroke="' + C.coral[1] + '" stroke-width="2.6" stroke-linecap="round"/><circle cx="33" cy="9" r="2.4" fill="#FFD15C"/>',
    backpack: '<rect x="10" y="14" width="28" height="28" rx="8" fill="' + C.green[0] + '" stroke="' + C.green[1] + '" stroke-width="1.7"/><path d="M17 14a7 7 0 0 1 14 0" fill="none" stroke="' + C.green[1] + '" stroke-width="2.6"/><rect x="17" y="22" width="14" height="9" rx="2" fill="' + K + '"/>',
    book: G('card', 'blue', '<path d="M24 13c-3-2-7-2.5-11-2v20c4-.5 8 0 11 2 3-2 7-2.5 11-2V11c-4-.5-8 0-11 2z" fill="' + K + '"/><line x1="24" y1="13" x2="24" y2="33" stroke="' + C.blue[1] + '" stroke-width="1.6"/>'),
    key: '<circle cx="15" cy="15" r="9" fill="none" stroke="' + C.gold[0] + '" stroke-width="4"/><path d="M20 20 38 38M33 33l4 4M30 36l4 4" stroke="' + C.gold[0] + '" stroke-width="4" stroke-linecap="round" fill="none"/>',
    bolt: '<path d="M26 4 10 27h11l-3 17 18-25H24z" fill="' + C.gold[0] + '" stroke="' + C.gold[1] + '" stroke-width="1.7" stroke-linejoin="round"/>',
    wave: '<path d="M14 23V10a2.6 2.6 0 0 1 5.2 0v9M19.2 19V7.5a2.6 2.6 0 0 1 5.2 0V19M24.4 19.5V9a2.6 2.6 0 0 1 5.2 0v13M29.6 22v-7.5a2.6 2.6 0 0 1 5.2 0V27a12 12 0 0 1-12 12 12 12 0 0 1-10.4-6l-3.4-6a2.7 2.7 0 0 1 4.5-2.9l3.1 3.9z" fill="' + C.gold[0] + '" stroke="' + C.gold[1] + '" stroke-width="1.5" stroke-linejoin="round"/>',
    save: G('card', 'blue', '<path d="M14 8h16l6 6v22H12V8z" fill="none"/><rect x="16" y="8" width="14" height="9" fill="' + K + '"/><rect x="16" y="24" width="16" height="11" rx="1" fill="' + K + '"/>')
  };
  GLYPHS.challenge = GLYPHS.quest;
  GLYPHS.mood = GLYPHS.popular;
  GLYPHS.availability = GLYPHS.coffee;

  function wrap(inner) { return '<svg viewBox="0 0 48 48" class="smi">' + inner + '</svg>'; }
  window.SMIcon = function (name) { return GLYPHS[name] ? wrap(GLYPHS[name]) : ''; };

  // ===== Conversion des emojis-icônes DANS LE TEXTE de l'app → SVG maison (descriptions/labels/titres/toasts) =====
  // (Top emojis fréquents. Le contenu UTILISATEUR — feed, chat, saisie — est exclu, voir SKIP.)
  var EMOJI = {
    '✅': 'check', '📍': 'near', '✨': 'mood', '⭐': 'star', '🎯': 'quest', '🎉': 'party', '🛟': 'shieldsafe',
    '🌍': 'globe', '🔥': 'flame', '👑': 'crown', '🛡': 'shieldsafe', '🤝': 'handshake', '☕': 'coffee', '💬': 'chat',
    '🏅': 'medal', '🧭': 'safetravel', '🏆': 'rank', '📌': 'pin', '🎮': 'games', '📞': 'phone', '🎟': 'coupon',
    '🚫': 'block', '📊': 'stats', '📈': 'chart', '📨': 'mail', '🔎': 'search', '🚨': 'alert', '🏙': 'cityscape',
    '🌱': 'eco', '🗺': 'map', '👥': 'users', '🧑': 'usersolo', '❤': 'heart', '💛': 'heartfull', '➕': 'plus',
    '➖': 'minus', '🗓': 'calendar', '✈': 'plane', '🌅': 'sunset', '🌞': 'sun', '🌙': 'moon', '🌴': 'palm',
    '❄': 'snow', '🪙': 'coin', '🪪': 'idcard', '🗑': 'trash', '📷': 'camera', '📸': 'camera', '🔒': 'lock',
    '✍': 'write', '🙂': 'smile', '🚀': 'rocket', '🎁': 'gift', '💡': 'bulb', '⏱': 'clock', '🔔': 'bell',
    '🛍': 'shop', '💼': 'trip', '🗂': 'layers', '🚪': 'door', '⚙': 'settings', '🎤': 'mic',
    '🏡': 'home', '🏠': 'home', '🎬': 'film', '▶': 'play', '🆘': 'sos', '📋': 'list', '📤': 'upload',
    '🔄': 'refresh', '🖼': 'image', '🌳': 'tree', '🌲': 'tree', '🏖': 'beach', '🥾': 'hiking', '🍹': 'cocktail',
    '🎒': 'backpack', '📚': 'book', '📖': 'book', '🗝': 'key', '⚡': 'bolt', '👋': 'wave', '💾': 'save',
    '🌠': 'star', '📣': 'contact', '🏛': 'aid', '✂': 'write', '📩': 'mail',
    '☀': 'sun', '🔍': 'search', '📲': 'phone', '🌇': 'sunset', '🌆': 'cityscape', '🍻': 'cocktail', '🍸': 'cocktail',
    '🌿': 'eco', '😎': 'smile', '😀': 'smile', '🥳': 'party', '🎊': 'party', '⏲': 'clock', '⏰': 'clock', '🔋': 'bolt',
    '💪': 'flame', '🌡': 'clock', '🗝': 'key', '🔑': 'key', '📕': 'book', '📗': 'book', '✏': 'write', '🖊': 'write'
  };
  // ===== Drapeaux pays SVG maison (fiches pays) =====
  var FLAG_ISO = { '🇵🇹':'PT','🇯🇵':'JP','🇲🇦':'MA','🇮🇸':'IS','🇲🇽':'MX','🇬🇷':'GR','🇻🇳':'VN','🇵🇪':'PE','🇮🇹':'IT','🇹🇭':'TH','🇪🇸':'ES','🇳🇴':'NO','🇨🇴':'CO','🇦🇺':'AU','🇹🇷':'TR','🇺🇸':'US','🇬🇧':'GB','🇮🇩':'ID','🇮🇳':'IN','🇪🇬':'EG','🇩🇪':'DE','🇭🇷':'HR','🇧🇷':'BR','🇨🇦':'CA','🇳🇱':'NL','🇧🇪':'BE','🇨🇭':'CH','🇦🇹':'AT','🇮🇪':'IE','🇵🇱':'PL','🇨🇿':'CZ','🇭🇺':'HU','🇸🇪':'SE','🇩🇰':'DK','🇫🇮':'FI','🇰🇷':'KR','🇵🇭':'PH','🇲🇾':'MY','🇨🇷':'CR','🇦🇪':'AE' };
  var FB = '<rect width="24" height="18" rx="2.5" fill="none" stroke="rgba(0,0,0,.12)" stroke-width=".5"/></svg>', FH = '<svg viewBox="0 0 24 18" class="smflagsvg">';
  var FLAGS = {
    PT: FH+'<rect width="24" height="18" rx="2.5" fill="#da291c"/><path d="M0 2.5A2.5 2.5 0 0 1 2.5 0H9.6v18H2.5A2.5 2.5 0 0 1 0 15.5z" fill="#046a38"/><circle cx="9.6" cy="9" r="3" fill="#ffe000"/><circle cx="9.6" cy="9" r="1.5" fill="#046a38"/>'+FB,
    JP: FH+'<rect width="24" height="18" rx="2.5" fill="#fff"/><circle cx="12" cy="9" r="4.5" fill="#bc002d"/>'+FB,
    MA: FH+'<rect width="24" height="18" rx="2.5" fill="#c1272d"/><circle cx="12" cy="9" r="3.3" fill="none" stroke="#006233" stroke-width="1.1"/>'+FB,
    IS: FH+'<rect width="24" height="18" rx="2.5" fill="#02529c"/><rect x="6" width="4" height="18" fill="#fff"/><rect y="7" width="24" height="4" fill="#fff"/><rect x="7" width="2" height="18" fill="#dc1e35"/><rect y="8" width="24" height="2" fill="#dc1e35"/>'+FB,
    MX: FH+'<rect width="24" height="18" rx="2.5" fill="#006847"/><rect x="8" width="8" height="18" fill="#fff"/><rect x="16" width="8" height="18" fill="#ce1126"/><circle cx="12" cy="9" r="1.8" fill="#7a5230"/>'+FB,
    GR: FH+'<rect width="24" height="18" rx="2.5" fill="#0d5eaf"/><g fill="#fff"><rect y="2" width="24" height="2"/><rect y="6" width="24" height="2"/><rect y="10" width="24" height="2"/><rect y="14" width="24" height="2"/></g><rect width="10" height="10" fill="#0d5eaf"/><rect x="4" width="2" height="10" fill="#fff"/><rect y="4" width="10" height="2" fill="#fff"/>'+FB,
    VN: FH+'<rect width="24" height="18" rx="2.5" fill="#da251d"/><circle cx="12" cy="9" r="3.2" fill="#ff0"/>'+FB,
    PE: FH+'<rect width="24" height="18" rx="2.5" fill="#d91023"/><rect x="8" width="8" height="18" fill="#fff"/>'+FB,
    IT: FH+'<rect width="24" height="18" rx="2.5" fill="#009246"/><rect x="8" width="8" height="18" fill="#fff"/><rect x="16" width="8" height="18" fill="#ce2b37"/>'+FB,
    TH: FH+'<rect width="24" height="18" rx="2.5" fill="#a51931"/><rect y="3" width="24" height="12" fill="#f4f5f8"/><rect y="6" width="24" height="6" fill="#2d2a4a"/>'+FB,
    ES: FH+'<rect width="24" height="18" rx="2.5" fill="#aa151b"/><rect y="4.5" width="24" height="9" fill="#f1bf00"/><circle cx="8" cy="9" r="1.6" fill="#aa151b"/>'+FB,
    NO: FH+'<rect width="24" height="18" rx="2.5" fill="#ba0c2f"/><rect x="6" width="4" height="18" fill="#fff"/><rect y="7" width="24" height="4" fill="#fff"/><rect x="7" width="2" height="18" fill="#00205b"/><rect y="8" width="24" height="2" fill="#00205b"/>'+FB,
    CO: FH+'<rect width="24" height="18" rx="2.5" fill="#fcd116"/><rect y="9" width="24" height="9" fill="#003893"/><rect y="13.5" width="24" height="4.5" fill="#ce1126"/>'+FB,
    AU: FH+'<rect width="24" height="18" rx="2.5" fill="#00247d"/><rect width="11" height="8" fill="#012169"/><path d="M0 0L11 8M11 0L0 8" stroke="#fff" stroke-width="1.5"/><path d="M5.5 0V8M0 4H11" stroke="#fff" stroke-width="2"/><path d="M5.5 0V8M0 4H11" stroke="#c8102e" stroke-width=".9"/><circle cx="5.5" cy="13" r="1.1" fill="#fff"/><circle cx="17" cy="5" r=".9" fill="#fff"/><circle cx="20" cy="9" r=".9" fill="#fff"/><circle cx="16" cy="11" r=".9" fill="#fff"/><circle cx="19" cy="13" r=".9" fill="#fff"/>'+FB,
    TR: FH+'<rect width="24" height="18" rx="2.5" fill="#e30a17"/><circle cx="10" cy="9" r="3.2" fill="#fff"/><circle cx="11.2" cy="9" r="2.5" fill="#e30a17"/><circle cx="14.6" cy="9" r="1.4" fill="#fff"/>'+FB,
    US: FH+'<rect width="24" height="18" rx="2.5" fill="#fff"/><g fill="#b22234"><rect width="24" height="1.4"/><rect y="2.8" width="24" height="1.4"/><rect y="5.6" width="24" height="1.4"/><rect y="8.3" width="24" height="1.4"/><rect y="11.1" width="24" height="1.4"/><rect y="13.9" width="24" height="1.4"/><rect y="16.6" width="24" height="1.4"/></g><rect width="10" height="9.7" fill="#3c3b6e"/>'+FB,
    GB: FH+'<rect width="24" height="18" rx="2.5" fill="#012169"/><path d="M0 0L24 18M24 0L0 18" stroke="#fff" stroke-width="3.6"/><path d="M0 0L24 18M24 0L0 18" stroke="#c8102e" stroke-width="2.2"/><path d="M12 0V18M0 9H24" stroke="#fff" stroke-width="6"/><path d="M12 0V18M0 9H24" stroke="#c8102e" stroke-width="3.6"/>'+FB,
    ID: FH+'<rect width="24" height="18" rx="2.5" fill="#fff"/><path d="M0 2.5A2.5 2.5 0 0 1 2.5 0H21.5A2.5 2.5 0 0 1 24 2.5V9H0z" fill="#ce1126"/>'+FB,
    IN: FH+'<rect width="24" height="18" rx="2.5" fill="#ff9933"/><rect y="6" width="24" height="6" fill="#fff"/><rect y="12" width="24" height="6" fill="#138808"/><circle cx="12" cy="9" r="2.2" fill="none" stroke="#000080" stroke-width=".7"/><circle cx="12" cy="9" r=".5" fill="#000080"/>'+FB,
    EG: FH+'<rect width="24" height="18" rx="2.5" fill="#ce1126"/><rect y="6" width="24" height="6" fill="#fff"/><rect y="12" width="24" height="6" fill="#000"/><circle cx="12" cy="9" r="1.6" fill="#c09300"/>'+FB,
    DE: FH+'<rect width="24" height="18" rx="2.5" fill="#000"/><rect y="6" width="24" height="6" fill="#dd0000"/><rect y="12" width="24" height="6" fill="#ffce00"/>'+FB,
    HR: FH+'<rect width="24" height="18" rx="2.5" fill="#ff0000"/><rect y="6" width="24" height="6" fill="#fff"/><rect y="12" width="24" height="6" fill="#171796"/><g fill="#ff0000"><rect x="10.5" y="6.5" width="1.5" height="1.5"/><rect x="12" y="8" width="1.5" height="1.5"/><rect x="10.5" y="9.5" width="1.5" height="1.5"/></g>'+FB,
    BR: FH+'<rect width="24" height="18" rx="2.5" fill="#009b3a"/><path d="M12 2.2 22 9 12 15.8 2 9z" fill="#fedf00"/><circle cx="12" cy="9" r="3" fill="#002776"/>'+FB,
    CA: FH+'<rect width="24" height="18" rx="2.5" fill="#fff"/><path d="M0 2.5A2.5 2.5 0 0 1 2.5 0H6V18H2.5A2.5 2.5 0 0 1 0 15.5z" fill="#d80621"/><path d="M18 0H21.5A2.5 2.5 0 0 1 24 2.5V15.5A2.5 2.5 0 0 1 21.5 18H18z" fill="#d80621"/><circle cx="12" cy="9" r="2.2" fill="#d80621"/>'+FB,
    NL: FH+'<rect width="24" height="18" rx="2.5" fill="#21468b"/><rect width="24" height="12" fill="#fff"/><rect width="24" height="6" fill="#ae1c28"/>'+FB,
    BE: FH+'<rect width="24" height="18" rx="2.5" fill="#000"/><rect x="8" width="8" height="18" fill="#fae042"/><rect x="16" width="8" height="18" fill="#ed2939"/>'+FB,
    CH: FH+'<rect width="24" height="18" rx="2.5" fill="#d52b1e"/><rect x="10.5" y="4" width="3" height="10" fill="#fff"/><rect x="7" y="7.5" width="10" height="3" fill="#fff"/>'+FB,
    AT: FH+'<rect width="24" height="18" rx="2.5" fill="#ed2939"/><rect y="6" width="24" height="6" fill="#fff"/>'+FB,
    IE: FH+'<rect width="24" height="18" rx="2.5" fill="#169b62"/><rect x="8" width="8" height="18" fill="#fff"/><rect x="16" width="8" height="18" fill="#ff883e"/>'+FB,
    PL: FH+'<rect width="24" height="18" rx="2.5" fill="#dc143c"/><path d="M0 2.5A2.5 2.5 0 0 1 2.5 0H21.5A2.5 2.5 0 0 1 24 2.5V9H0z" fill="#fff"/>'+FB,
    CZ: FH+'<rect width="24" height="18" rx="2.5" fill="#fff"/><rect y="9" width="24" height="9" fill="#d7141a"/><path d="M0 0L12 9L0 18z" fill="#11457e"/>'+FB,
    HU: FH+'<rect width="24" height="18" rx="2.5" fill="#cd2a3e"/><rect y="6" width="24" height="6" fill="#fff"/><rect y="12" width="24" height="6" fill="#436f4d"/>'+FB,
    SE: FH+'<rect width="24" height="18" rx="2.5" fill="#006aa7"/><rect x="7" width="3" height="18" fill="#fecc00"/><rect y="7.5" width="24" height="3" fill="#fecc00"/>'+FB,
    DK: FH+'<rect width="24" height="18" rx="2.5" fill="#c8102e"/><rect x="7" width="3" height="18" fill="#fff"/><rect y="7.5" width="24" height="3" fill="#fff"/>'+FB,
    FI: FH+'<rect width="24" height="18" rx="2.5" fill="#fff"/><rect x="7" width="3" height="18" fill="#003580"/><rect y="7.5" width="24" height="3" fill="#003580"/>'+FB,
    KR: FH+'<rect width="24" height="18" rx="2.5" fill="#fff"/><path d="M12 5.5a3.5 3.5 0 0 1 0 7 1.75 1.75 0 0 1 0-3.5 1.75 1.75 0 0 0 0-3.5z" fill="#cd2e3a"/><path d="M12 5.5a3.5 3.5 0 0 0 0 7 1.75 1.75 0 0 0 0-3.5 1.75 1.75 0 0 1 0-3.5z" fill="#0047a0"/>'+FB,
    PH: FH+'<rect width="24" height="18" rx="2.5" fill="#0038a8"/><rect y="9" width="24" height="9" fill="#ce1126"/><path d="M0 0L10.4 9L0 18z" fill="#fff"/><circle cx="3" cy="9" r="1.3" fill="#fcd116"/>'+FB,
    MY: FH+'<rect width="24" height="18" rx="2.5" fill="#fff"/><g fill="#cc0001"><rect y="1.3" width="24" height="1.3"/><rect y="3.9" width="24" height="1.3"/><rect y="6.4" width="24" height="1.3"/><rect y="9" width="24" height="1.3"/><rect y="11.6" width="24" height="1.3"/><rect y="14.1" width="24" height="1.3"/><rect y="16.7" width="24" height="1.3"/></g><rect width="11" height="10.3" fill="#010066"/><circle cx="5" cy="5" r="2.4" fill="#fc0"/><circle cx="6" cy="5" r="2" fill="#010066"/>'+FB,
    CR: FH+'<rect width="24" height="18" rx="2.5" fill="#002b7f"/><rect y="3.6" width="24" height="10.8" fill="#fff"/><rect y="6.3" width="24" height="5.4" fill="#ce1126"/>'+FB,
    AE: FH+'<rect width="24" height="18" rx="2.5" fill="#fff"/><rect x="6" width="18" height="6" fill="#00732f"/><rect x="6" y="12" width="18" height="6" fill="#000"/><path d="M0 2.5A2.5 2.5 0 0 1 2.5 0H6V18H2.5A2.5 2.5 0 0 1 0 15.5z" fill="#ff0000"/>'+FB
  };
  var RX = null;
  function buildRx() {
    var fk = Object.keys(FLAG_ISO).map(function (e) { return e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
    var ek = Object.keys(EMOJI).map(function (e) { return e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
    RX = new RegExp('(?:' + fk.concat(ek).join('|') + ')\\uFE0F?', 'gu'); // drapeaux EN PREMIER (séquences plus longues)
  }
  // Conteneurs à NE PAS toucher (contenu utilisateur, saisie, carte, déjà-converti)
  var SKIP = 'input,textarea,select,script,style,svg,.smji,.smi,[data-smicon],[contenteditable],' +
    '.fpost,.fpost-body,.fpost-text,.bubble,.bubble-text,.gchat-msg,.msg-text,.feed-composer,#homeFeed,' +
    '#feedComments,.fcomment,.leaflet-container,.cm-text';
  function inSkip(node) {
    for (var el = node.parentElement; el; el = el.parentElement) {
      if (el.matches && el.matches(SKIP)) return true;
    }
    return false;
  }
  window.SMIconText = function (root) {
    try {
      if (!RX) buildRx();
      root = root || document.body; if (!root || !root.querySelectorAll) return;
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      var hits = [], n;
      while ((n = walker.nextNode())) {
        if (n.nodeValue && RX.test(n.nodeValue) && !inSkip(n)) hits.push(n);
        RX.lastIndex = 0;
      }
      hits.forEach(function (node) {
        var s = node.nodeValue, frag = document.createDocumentFragment(), last = 0, m, any = false;
        RX.lastIndex = 0;
        while ((m = RX.exec(s))) {
          var raw = m[0], iso = FLAG_ISO[raw.replace('️', '')], span;
          if (iso && FLAGS[iso]) { span = document.createElement('span'); span.className = 'smflag'; span.innerHTML = FLAGS[iso]; }
          else { var key = EMOJI[raw.replace('️', '')]; if (!key || !GLYPHS[key]) continue; span = document.createElement('span'); span.className = 'smji'; span.innerHTML = wrap(GLYPHS[key]); }
          if (m.index > last) frag.appendChild(document.createTextNode(s.slice(last, m.index)));
          frag.appendChild(span); last = m.index + m[0].length; any = true;
        }
        if (any) { if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last))); node.parentNode.replaceChild(frag, node); }
      });
    } catch (e) {}
  };
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
  function runAll() { window.SMIconRender(); window.SMIconText(document.body); }
  // Observateur : convertit le contenu AJOUTÉ dynamiquement (descriptions, toasts, fiches…).
  // Debounce + garde anti-boucle (on n'observe que les ajouts, nos <span class="smji"> sont exclus par SKIP).
  function observe() {
    if (!window.MutationObserver) return;
    var pending = [], timer = null;
    var mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var a = muts[i].addedNodes;
        for (var j = 0; j < a.length; j++) if (a[j].nodeType === 1) pending.push(a[j]);
      }
      if (pending.length && !timer) timer = setTimeout(function () {
        var batch = pending; pending = []; timer = null;
        batch.forEach(function (el) {
          if (!el.isConnected) return;
          if (el.matches && (el.matches('.smji') || el.matches('[data-smicon]'))) return;
          window.SMIconRender(el); window.SMIconText(el);
        });
      }, 120);
    });
    try { mo.observe(document.body, { childList: true, subtree: true }); } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { runAll(); observe(); });
  else { runAll(); observe(); }
})();
