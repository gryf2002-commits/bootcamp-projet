/* ============================================================
   SunMates — banque d'ICÔNES MAISON v2 (UI) — « gemme glossy ».
   Chantier premium (14 juin) : remplace les emojis-icônes des
   tuiles/pastilles/boutons par des SVG sur-mesure « rien qu'à nous »,
   matière cabochon cream-or glossy (cohérente avec les badges SMBadge),
   identiques sur tous les appareils. Une seule source → cohérence + maintenance.
   API :
     window.SMIcon(name)        -> string SVG (gemme) | '' si inconnu
     window.SMIcon.has(name)    -> bool
     window.SMIconRender(root)  -> remplace l'emoji de chaque [data-smicon] connu
   Les éléments [data-smicon] inconnus gardent leur emoji de repli.
   ============================================================ */
(function () {
  var DEFS =
    '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
    '<linearGradient id="smGem" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF7E8"/><stop offset=".5" stop-color="#FFE2AC"/><stop offset="1" stop-color="#E8983A"/></linearGradient>' +
    '<radialGradient id="smGemGloss" cx="38%" cy="20%" r="62%"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
    '</defs></svg>';

  // matière commune : corps gemme + accent corail braise pour le détail
  var G = '"url(#smGem)"', S = 'stroke="#8a5618" stroke-opacity=".3" stroke-width="1"', A = '#C2491A';

  // chaque glyphe : viewBox 0 0 48 48, formes remplies en matière gemme + petit accent
  var GLYPHS = {
    // --- Lieux / découverte ---
    near: '<path d="M24 4c-7.2 0-13 5.6-13 12.6C11 27 24 44 24 44s13-17 13-27.4C37 9.6 31.2 4 24 4z" fill=' + G + ' ' + S + '/><path d="M24 4c-7.2 0-13 5.6-13 12.6C11 27 24 44 24 44s13-17 13-27.4C37 9.6 31.2 4 24 4z" fill="url(#smGemGloss)"/><circle cx="24" cy="16.5" r="4.6" fill="' + A + '"/>',
    coffee: '<path d="M9 13h26v10a13 13 0 0 1-26 0z" fill=' + G + ' ' + S + '/><path d="M9 13h26v10a13 13 0 0 1-26 0z" fill="url(#smGemGloss)"/><path d="M35 16h3.4a4.6 4.6 0 0 1 0 9.2H35" fill="none" stroke=' + G + ' stroke-width="3.4"/><rect x="9" y="37" width="26" height="4.4" rx="2.2" fill=' + G + ' ' + S + '/>',
    eco: '<path d="M11 37C11 20 26 9 39 9c.5 17-10 28-26 28z" fill=' + G + ' ' + S + '/><path d="M11 37C11 20 26 9 39 9c.5 17-10 28-26 28z" fill="url(#smGemGloss)"/><path d="M31 17C24 23 17 30 14 36" fill="none" stroke="' + A + '" stroke-width="2.6" stroke-linecap="round"/>',
    rating: '<path d="M24 5l5.3 11.1 12.2 1.6-9 8.4 2.3 12L24 32.1 13.2 38.7l2.3-12-9-8.4 12.2-1.6z" fill=' + G + ' ' + S + '/><path d="M24 5l5.3 11.1 12.2 1.6-9 8.4 2.3 12L24 32.1 13.2 38.7l2.3-12-9-8.4 12.2-1.6z" fill="url(#smGemGloss)"/>',
    popular: '<path d="M25 4c2.4 6.5-4.5 9.5-4.5 15.5a4 4 0 0 0 8 0c0-1.2-.2-2.2-.7-3.2 3.4 2.4 7.2 6.6 7.2 12.7a11 11 0 0 1-22 0c0-9.6 8.6-13.8 12-25z" fill=' + G + ' ' + S + '/><path d="M25 4c2.4 6.5-4.5 9.5-4.5 15.5a4 4 0 0 0 8 0c0-1.2-.2-2.2-.7-3.2 3.4 2.4 7.2 6.6 7.2 12.7a11 11 0 0 1-22 0c0-9.6 8.6-13.8 12-25z" fill="url(#smGemGloss)"/>',
    // --- Jeux ---
    quest: '<circle cx="24" cy="24" r="18" fill=' + G + ' ' + S + '/><circle cx="24" cy="24" r="18" fill="url(#smGemGloss)"/><circle cx="24" cy="24" r="10" fill="none" stroke="' + A + '" stroke-width="3"/><circle cx="24" cy="24" r="3.4" fill="' + A + '"/>',
    games: '<rect x="5" y="14" width="38" height="22" rx="11" fill=' + G + ' ' + S + '/><rect x="5" y="14" width="38" height="22" rx="11" fill="url(#smGemGloss)"/><g fill="' + A + '"><rect x="11" y="23.5" width="9" height="3" rx="1.5"/><rect x="14" y="20.5" width="3" height="9" rx="1.5"/></g><circle cx="31" cy="22.5" r="2.7" fill="' + A + '"/><circle cx="36.5" cy="27.5" r="2.7" fill="' + A + '"/>',
    medal: '<path d="M16 5l6 13M32 5l-6 13" stroke="' + A + '" stroke-width="3.2" stroke-linecap="round"/><circle cx="24" cy="29" r="13" fill=' + G + ' ' + S + '/><circle cx="24" cy="29" r="13" fill="url(#smGemGloss)"/><circle cx="24" cy="29" r="6" fill="none" stroke="' + A + '" stroke-width="2.6"/>',
    coupon: '<path d="M6 14a3 3 0 0 1 3-3h30a3 3 0 0 1 3 3v4a3 3 0 0 0 0 6v4a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-4a3 3 0 0 0 0-6z" fill=' + G + ' ' + S + '/><path d="M6 14a3 3 0 0 1 3-3h30a3 3 0 0 1 3 3v4a3 3 0 0 0 0 6v4a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-4a3 3 0 0 0 0-6z" fill="url(#smGemGloss)"/><line x1="28" y1="12.5" x2="28" y2="35.5" stroke="' + A + '" stroke-width="2" stroke-dasharray="2 3"/>',
    rank: '<path d="M15 6h18v9a9 9 0 0 1-18 0z" fill=' + G + ' ' + S + '/><path d="M15 6h18v9a9 9 0 0 1-18 0z" fill="url(#smGemGloss)"/><path d="M15 8H9v2.5a6 6 0 0 0 6 6M33 8h6v2.5a6 6 0 0 1-6 6" fill="none" stroke=' + G + ' stroke-width="3" stroke-linecap="round"/><rect x="21.5" y="23" width="5" height="9" fill=' + G + '/><rect x="14" y="32" width="20" height="5" rx="2.2" fill=' + G + ' ' + S + '/>',
    shop: '<path d="M11 16h26l-2 23a2 2 0 0 1-2 2H15a2 2 0 0 1-2-2z" fill=' + G + ' ' + S + '/><path d="M11 16h26l-2 23a2 2 0 0 1-2 2H15a2 2 0 0 1-2-2z" fill="url(#smGemGloss)"/><path d="M17.5 17a6.5 6.5 0 0 1 13 0" fill="none" stroke="' + A + '" stroke-width="2.6"/>',
    calendar: '<rect x="7" y="11" width="34" height="30" rx="5" fill=' + G + ' ' + S + '/><rect x="7" y="11" width="34" height="30" rx="5" fill="url(#smGemGloss)"/><line x1="7" y1="20" x2="41" y2="20" stroke="' + A + '" stroke-width="2"/><line x1="16" y1="6" x2="16" y2="14" stroke=' + G + ' stroke-width="3.2" stroke-linecap="round"/><line x1="32" y1="6" x2="32" y2="14" stroke=' + G + ' stroke-width="3.2" stroke-linecap="round"/>',
    map: '<path d="M8 12l10-4 12 4 10-4v28l-10 4-12-4-10 4z" fill=' + G + ' ' + S + '/><path d="M8 12l10-4 12 4 10-4v28l-10 4-12-4-10 4z" fill="url(#smGemGloss)"/><path d="M18 8v28M30 12v28" stroke="' + A + '" stroke-opacity=".55" stroke-width="1.6"/>',
    cityscape: '<path d="M5 42V23l8-5 8 5v-8l9-6 13 8v25z" fill=' + G + ' ' + S + '/><path d="M5 42V23l8-5 8 5v-8l9-6 13 8v25z" fill="url(#smGemGloss)"/><g fill="' + A + '"><rect x="34" y="20" width="3" height="3"/><rect x="34" y="27" width="3" height="3"/><rect x="11" y="28" width="3" height="3"/></g>',
    // --- Sécurité ---
    phone: '<path d="M15 5c-3.2 0-6.2 3-5.2 7.2 2.3 12.6 12.4 22.7 25 25 4.2 1 7.2-2 7.2-5.2v-4.8l-8.4-3-3.2 4.2A21 21 0 0 1 17.6 16.6l4.2-3.2-3-8.4z" fill=' + G + ' ' + S + '/><path d="M15 5c-3.2 0-6.2 3-5.2 7.2 2.3 12.6 12.4 22.7 25 25 4.2 1 7.2-2 7.2-5.2v-4.8l-8.4-3-3.2 4.2A21 21 0 0 1 17.6 16.6l4.2-3.2-3-8.4z" fill="url(#smGemGloss)"/>',
    signal: '<path d="M18 6h12l-1.6 12H19.6z" fill=' + G + ' ' + S + '/><rect x="20.5" y="18" width="7" height="24" rx="2.5" fill=' + G + ' ' + S + '/><rect x="20.5" y="18" width="7" height="24" rx="2.5" fill="url(#smGemGloss)"/><g stroke="' + A + '" stroke-width="2.4" stroke-linecap="round"><line x1="33" y1="10" x2="38" y2="7"/><line x1="34" y1="16" x2="39" y2="16"/><line x1="15" y1="10" x2="10" y2="7"/><line x1="14" y1="16" x2="9" y2="16"/></g>',
    alert: '<path d="M24 6.5 43 39a2 2 0 0 1-1.8 3H6.8A2 2 0 0 1 5 39z" fill=' + G + ' ' + S + '/><path d="M24 6.5 43 39a2 2 0 0 1-1.8 3H6.8A2 2 0 0 1 5 39z" fill="url(#smGemGloss)"/><rect x="22" y="19" width="4" height="11" rx="2" fill="' + A + '"/><circle cx="24" cy="35" r="2.3" fill="' + A + '"/>',
    clock: '<circle cx="24" cy="25" r="17" fill=' + G + ' ' + S + '/><circle cx="24" cy="25" r="17" fill="url(#smGemGloss)"/><path d="M24 15v11l7.5 4.5" fill="none" stroke="' + A + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
    users: '<circle cx="17.5" cy="16" r="6.5" fill=' + G + ' ' + S + '/><path d="M6 41c0-7.2 5.2-11.5 11.5-11.5S29 34.3 29 41Z" fill=' + G + ' ' + S + '/><circle cx="32" cy="18" r="6" fill=' + G + ' ' + S + '/><path d="M22 41c.6-6.6 5.7-10.5 11.4-10.5S43 34.4 43 41Z" fill=' + G + ' ' + S + '/><ellipse cx="15.5" cy="13.5" rx="3.6" ry="2.6" fill="url(#smGemGloss)"/>',
    usersolo: '<circle cx="24" cy="16" r="8" fill=' + G + ' ' + S + '/><path d="M8 42c0-9 7-14.5 16-14.5S40 33 40 42z" fill=' + G + ' ' + S + '/><ellipse cx="20.5" cy="12.5" rx="4" ry="3" fill="url(#smGemGloss)"/>',
    aid: '<rect x="8" y="8" width="32" height="32" rx="9" fill=' + G + ' ' + S + '/><rect x="8" y="8" width="32" height="32" rx="9" fill="url(#smGemGloss)"/><path d="M20.5 15h7v5.5H33v7h-5.5V33h-7v-5.5H15v-7h5.5z" fill="' + A + '"/>',
    shieldsafe: '<path d="M24 4 40 9.5V23c0 11-7.2 18.3-16 22.2C15.2 41.3 8 34 8 23V9.5Z" fill=' + G + ' ' + S + '/><path d="M24 4 40 9.5V23c0 11-7.2 18.3-16 22.2C15.2 41.3 8 34 8 23V9.5Z" fill="url(#smGemGloss)"/><path d="M24 14l2.6 5.3 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" fill="' + A + '"/>',
    firstaid: '<rect x="6" y="13" width="36" height="27" rx="6" fill=' + G + ' ' + S + '/><rect x="6" y="13" width="36" height="27" rx="6" fill="url(#smGemGloss)"/><path d="M18 13v-3.5a2.5 2.5 0 0 1 2.5-2.5h7a2.5 2.5 0 0 1 2.5 2.5V13" fill="none" stroke=' + G + ' stroke-width="3"/><path d="M21 21h6v4.5h4.5v6H27V36h-6v-4.5h-4.5v-6H21z" fill="' + A + '"/>',
    safetravel: '<circle cx="24" cy="24" r="18" fill=' + G + ' ' + S + '/><circle cx="24" cy="24" r="18" fill="url(#smGemGloss)"/><path d="M31 17 26 26l-9 5 5-9z" fill="' + A + '"/><circle cx="24" cy="24" r="2.4" fill="#fff"/>',
    report: '<path d="M13 5v38" stroke=' + G + ' stroke-width="4" stroke-linecap="round"/><path d="M13 7h21l-5.5 7 5.5 7H13z" fill=' + G + ' ' + S + '/><path d="M13 7h21l-5.5 7 5.5 7H13z" fill="url(#smGemGloss)"/>',
    contact: '<path d="M9 19v10l6 1 7 8 4-1.2V11.2L22 10l-7 8z" fill=' + G + ' ' + S + '/><path d="M9 19v10l6 1 7 8 4-1.2V11.2L22 10l-7 8z" fill="url(#smGemGloss)"/><path d="M31 17a9 9 0 0 1 0 14" fill="none" stroke="' + A + '" stroke-width="2.6" stroke-linecap="round"/>',
    chat: '<path d="M8 13a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v15a4 4 0 0 1-4 4H21l-9 7v-7a4 4 0 0 1-4-4z" fill=' + G + ' ' + S + '/><path d="M8 13a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v15a4 4 0 0 1-4 4H21l-9 7v-7a4 4 0 0 1-4-4z" fill="url(#smGemGloss)"/><g fill="' + A + '"><circle cx="18" cy="20.5" r="2.1"/><circle cx="24" cy="20.5" r="2.1"/><circle cx="30" cy="20.5" r="2.1"/></g>',
    // --- Pro / stats ---
    chart: '<rect x="6" y="6" width="36" height="36" rx="8" fill=' + G + ' ' + S + '/><rect x="6" y="6" width="36" height="36" rx="8" fill="url(#smGemGloss)"/><path d="M13 30l7-7 5 4 10-11" fill="none" stroke="' + A + '" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 16h6v6" fill="none" stroke="' + A + '" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>',
    stats: '<rect x="6" y="6" width="36" height="36" rx="8" fill=' + G + ' ' + S + '/><rect x="6" y="6" width="36" height="36" rx="8" fill="url(#smGemGloss)"/><g fill="' + A + '"><rect x="13" y="26" width="5.5" height="9" rx="1.6"/><rect x="21.2" y="18" width="5.5" height="17" rx="1.6"/><rect x="29.4" y="22" width="5.5" height="13" rx="1.6"/></g>',
    crown: '<path d="M7 36 4 13.5l10.5 7.2L24 7l9.5 13.7L44 13.5 41 36z" fill=' + G + ' ' + S + ' stroke-linejoin="round"/><path d="M7 36 4 13.5l10.5 7.2L24 7l9.5 13.7L44 13.5 41 36z" fill="url(#smGemGloss)"/><rect x="7" y="37.5" width="34" height="5" rx="2.2" fill=' + G + ' ' + S + '/><circle cx="24" cy="20" r="2.6" fill="' + A + '"/>',
    trip: '<rect x="9" y="15" width="30" height="25" rx="5" fill=' + G + ' ' + S + '/><rect x="9" y="15" width="30" height="25" rx="5" fill="url(#smGemGloss)"/><path d="M18 15v-3a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v3" fill="none" stroke=' + G + ' stroke-width="3"/><line x1="24" y1="20" x2="24" y2="40" stroke="' + A + '" stroke-width="2" stroke-opacity=".6"/>',
    // --- Nav / actions ---
    bell: '<path d="M24 6a3 3 0 0 1 3 3.2c5.6 1.2 8.5 5.8 8.5 12.3 0 6 2 8 3.8 10.5H8.7c1.8-2.5 3.8-4.5 3.8-10.5 0-6.5 2.9-11.1 8.5-12.3A3 3 0 0 1 24 6z" fill=' + G + ' ' + S + '/><path d="M24 6a3 3 0 0 1 3 3.2c5.6 1.2 8.5 5.8 8.5 12.3 0 6 2 8 3.8 10.5H8.7c1.8-2.5 3.8-4.5 3.8-10.5 0-6.5 2.9-11.1 8.5-12.3A3 3 0 0 1 24 6z" fill="url(#smGemGloss)"/><path d="M20 36a4 4 0 0 0 8 0" fill="' + A + '"/>',
    search: '<circle cx="21" cy="21" r="12.5" fill=' + G + ' ' + S + '/><circle cx="21" cy="21" r="12.5" fill="url(#smGemGloss)"/><circle cx="21" cy="21" r="6.5" fill="none" stroke="' + A + '" stroke-width="2.4"/><line x1="30.5" y1="30.5" x2="41" y2="41" stroke=' + G + ' stroke-width="5.5" stroke-linecap="round"/>',
    mail: '<rect x="6" y="11" width="36" height="26" rx="5" fill=' + G + ' ' + S + '/><rect x="6" y="11" width="36" height="26" rx="5" fill="url(#smGemGloss)"/><path d="M8 15l16 12 16-12" fill="none" stroke="' + A + '" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
    settings: '<path d="M24 4l3 5.2a16 16 0 0 1 4 1.6l6-1.2 3 5.2-4 4.6a16 16 0 0 1 0 4.4l4 4.6-3 5.2-6-1.2a16 16 0 0 1-4 1.6L24 44l-3-5.2a16 16 0 0 1-4-1.6l-6 1.2-3-5.2 4-4.6a16 16 0 0 1 0-4.4l-4-4.6 3-5.2 6 1.2a16 16 0 0 1 4-1.6z" fill=' + G + ' ' + S + '/><path d="M24 4l3 5.2a16 16 0 0 1 4 1.6l6-1.2 3 5.2-4 4.6a16 16 0 0 1 0 4.4l4 4.6-3 5.2-6-1.2a16 16 0 0 1-4 1.6L24 44l-3-5.2a16 16 0 0 1-4-1.6l-6 1.2-3-5.2 4-4.6a16 16 0 0 1 0-4.4l-4-4.6 3-5.2 6 1.2a16 16 0 0 1 4-1.6z" fill="url(#smGemGloss)"/><circle cx="24" cy="24" r="6" fill="' + A + '"/>',
    flame: '<path d="M25 4c2.4 6.5-4.5 9.5-4.5 15.5a4 4 0 0 0 8 0c0-1.2-.2-2.2-.7-3.2 3.4 2.4 7.2 6.6 7.2 12.7a11 11 0 0 1-22 0c0-9.6 8.6-13.8 12-25z" fill=' + G + ' ' + S + '/><path d="M25 4c2.4 6.5-4.5 9.5-4.5 15.5a4 4 0 0 0 8 0c0-1.2-.2-2.2-.7-3.2 3.4 2.4 7.2 6.6 7.2 12.7a11 11 0 0 1-22 0c0-9.6 8.6-13.8 12-25z" fill="url(#smGemGloss)"/>',
    mic: '<rect x="18" y="5" width="12" height="22" rx="6" fill=' + G + ' ' + S + '/><rect x="18" y="5" width="12" height="22" rx="6" fill="url(#smGemGloss)"/><path d="M12 22a12 12 0 0 0 24 0" fill="none" stroke="' + A + '" stroke-width="2.6" stroke-linecap="round"/><line x1="24" y1="34" x2="24" y2="42" stroke=' + G + ' stroke-width="3.4" stroke-linecap="round"/>',
    star: '<path d="M24 5l5.3 11.1 12.2 1.6-9 8.4 2.3 12L24 32.1 13.2 38.7l2.3-12-9-8.4 12.2-1.6z" fill=' + G + ' ' + S + '/><path d="M24 5l5.3 11.1 12.2 1.6-9 8.4 2.3 12L24 32.1 13.2 38.7l2.3-12-9-8.4 12.2-1.6z" fill="url(#smGemGloss)"/>',
    handshake: '<path d="M4 18l8-3 9 6 6-2 4 3 9-4v12l-7 3-8-6-3 1-5 6-7-4z" fill=' + G + ' ' + S + '/><path d="M4 18l8-3 9 6 6-2 4 3 9-4v12l-7 3-8-6-3 1-5 6-7-4z" fill="url(#smGemGloss)"/>',
    message: '<path d="M8 13a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v15a4 4 0 0 1-4 4H21l-9 7v-7a4 4 0 0 1-4-4z" fill=' + G + ' ' + S + '/><path d="M8 13a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v15a4 4 0 0 1-4 4H21l-9 7v-7a4 4 0 0 1-4-4z" fill="url(#smGemGloss)"/><g fill="' + A + '"><circle cx="18" cy="20.5" r="2.1"/><circle cx="24" cy="20.5" r="2.1"/><circle cx="30" cy="20.5" r="2.1"/></g>'
  };
  // alias (mêmes concepts)
  GLYPHS.challenge = GLYPHS.quest;
  GLYPHS.mood = GLYPHS.popular;
  GLYPHS.availability = GLYPHS.coffee;

  function wrap(inner) { return '<svg viewBox="0 0 48 48" class="smi">' + inner + '</svg>'; }

  function injectDefs() {
    if (document.getElementById('sm-icon-defs')) return;
    var d = document.createElement('div');
    d.id = 'sm-icon-defs'; d.setAttribute('aria-hidden', 'true');
    d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    d.innerHTML = DEFS;
    (document.body || document.documentElement).appendChild(d);
  }

  window.SMIcon = function (name) { return GLYPHS[name] ? wrap(GLYPHS[name]) : ''; };
  window.SMIcon.has = function (name) { return !!GLYPHS[name]; };
  window.SMIconRender = function (root) {
    try {
      injectDefs();
      (root || document).querySelectorAll('[data-smicon]').forEach(function (el) {
        var k = el.getAttribute('data-smicon');
        if (!GLYPHS[k]) return;                 // inconnu → garde l'emoji de repli
        if (el.getAttribute('data-smicon-done') === k) return; // déjà rendu
        el.innerHTML = wrap(GLYPHS[k]);
        el.setAttribute('data-smicon-done', k);
      });
    } catch (e) {}
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { window.SMIconRender(); });
  } else {
    window.SMIconRender();
  }
})();
