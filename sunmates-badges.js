/* ============================================================
   SunMates — moteur de badges sur-mesure (identité "joaillerie")
   Une DA par famille (boussole / rosace / blason / sunburst / galaxie),
   emblèmes dessinés main, sceau soleil signature, 2 niveaux de détail.
   API : window.SMBadge(badgeKey, { secret, size, lite }) -> string SVG
   ============================================================ */
(function () {
  // ---- défs partagées (injectées une seule fois) ----
  var DEFS = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
    '<radialGradient id="sm-light" cx="38%" cy="32%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
    '<filter id="sm-drop" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="3.5" flood-color="#3a1d12" flood-opacity=".35"/></filter>' +
    '<linearGradient id="ex-brass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE7AE"/><stop offset=".45" stop-color="#D69A4E"/><stop offset="1" stop-color="#8a5a2c"/></linearGradient>' +
    '<radialGradient id="ex-leather" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#b0703f"/><stop offset="1" stop-color="#5c3417"/></radialGradient>' +
    '<filter id="ex-grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .07 0"/><feComposite operator="over" in2="SourceGraphic"/></filter>' +
    '<radialGradient id="so-enamel" cx="42%" cy="34%" r="72%"><stop offset="0" stop-color="#ffd0c4"/><stop offset=".5" stop-color="#FF6E6A"/><stop offset="1" stop-color="#7a5cff"/></radialGradient>' +
    '<linearGradient id="so-petal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb0b8"/><stop offset="1" stop-color="#c86bd6"/></linearGradient>' +
    '<linearGradient id="se-steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f8fc"/><stop offset=".4" stop-color="#c2ccd8"/><stop offset="1" stop-color="#7d8a99"/></linearGradient>' +
    '<filter id="se-brush"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.4" numOctaves="2" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .06 0"/><feComposite operator="over" in2="SourceGraphic"/></filter>' +
    '<radialGradient id="se-core" cx="42%" cy="36%" r="70%"><stop offset="0" stop-color="#d9fff2"/><stop offset=".55" stop-color="#3fb98f"/><stop offset="1" stop-color="#0e6b5f"/></radialGradient>' +
    '<linearGradient id="ac-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE9A0"/><stop offset=".5" stop-color="#FFC24B"/><stop offset="1" stop-color="#C9831C"/></linearGradient>' +
    '<radialGradient id="ac-core" cx="44%" cy="36%" r="72%"><stop offset="0" stop-color="#4a2d63"/><stop offset="1" stop-color="#241036"/></radialGradient>' +
    '<radialGradient id="lg-galaxy" cx="42%" cy="38%" r="78%"><stop offset="0" stop-color="#ffd7a0"/><stop offset=".26" stop-color="#FF5A4D"/><stop offset=".6" stop-color="#7a5cff"/><stop offset="1" stop-color="#0c0a2a"/></radialGradient>' +
    '<linearGradient id="lg-irid" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7afcff"/><stop offset=".25" stop-color="#ffd15c"/><stop offset=".5" stop-color="#FF5A4D"/><stop offset=".75" stop-color="#b06bff"/><stop offset="1" stop-color="#7afcff"/></linearGradient>' +
    '<filter id="lg-stars"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 16 -9"/><feComposite operator="in" in2="SourceGraphic"/></filter>' +
    '<symbol id="sm-sunseal" viewBox="-12 -12 24 24"><circle r="6" fill="none" stroke="currentColor" stroke-width="1.1" opacity=".9"/><circle r="2.4" fill="currentColor"/><g stroke="currentColor" stroke-width="1.1" stroke-linecap="round"><line x1="0" y1="-8.5" x2="0" y2="-10.5"/><line x1="0" y1="8.5" x2="0" y2="10.5"/><line x1="-8.5" y1="0" x2="-10.5" y2="0"/><line x1="8.5" y1="0" x2="10.5" y2="0"/><line x1="-6" y1="-6" x2="-7.4" y2="-7.4"/><line x1="6" y1="6" x2="7.4" y2="7.4"/><line x1="6" y1="-6" x2="7.4" y2="-7.4"/><line x1="-6" y1="6" x2="-7.4" y2="7.4"/></g></symbol>' +
    '<radialGradient id="emb-spec" cx="34%" cy="26%" r="40%"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
    '<radialGradient id="emb-cream" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="#FFFDF5"/><stop offset=".55" stop-color="#FFE9C8"/><stop offset="1" stop-color="#E9A86A"/></radialGradient>' +
    '<radialGradient id="emb-gold" cx="36%" cy="28%" r="82%"><stop offset="0" stop-color="#FFF7D8"/><stop offset=".42" stop-color="#FFD56A"/><stop offset=".8" stop-color="#E89A2C"/><stop offset="1" stop-color="#A9670F"/></radialGradient>' +
    '<radialGradient id="emb-coral" cx="36%" cy="28%" r="80%"><stop offset="0" stop-color="#FFD0B0"/><stop offset=".45" stop-color="#FF7E5A"/><stop offset="1" stop-color="#D23A2C"/></radialGradient>' +
    '<radialGradient id="emb-teal" cx="38%" cy="30%" r="82%"><stop offset="0" stop-color="#EAFBF5"/><stop offset=".4" stop-color="#7FE3CC"/><stop offset=".82" stop-color="#1F9E8C"/><stop offset="1" stop-color="#0C544D"/></radialGradient>' +
    '<radialGradient id="emb-violet" cx="38%" cy="30%" r="82%"><stop offset="0" stop-color="#EBE2FF"/><stop offset=".5" stop-color="#9B7BFF"/><stop offset="1" stop-color="#4B2BB0"/></radialGradient>' +
    '<radialGradient id="emb-moon" cx="36%" cy="30%" r="78%"><stop offset="0" stop-color="#FFFDF2"/><stop offset=".6" stop-color="#FBE9B8"/><stop offset="1" stop-color="#E7C06A"/></radialGradient>' +
    '<radialGradient id="emb-atmo" cx="50%" cy="46%" r="52%"><stop offset=".55" stop-color="#FFE6B0" stop-opacity="0"/><stop offset="1" stop-color="#FFE6B0" stop-opacity=".7"/></radialGradient>' +
    '<radialGradient id="emb-glowcool" cx="50%" cy="50%" r="50%"><stop offset=".5" stop-color="#BFF3E4" stop-opacity="0"/><stop offset="1" stop-color="#BFF3E4" stop-opacity=".55"/></radialGradient>' +
    '<linearGradient id="emb-glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFDF7"/><stop offset="1" stop-color="#E7C9A6"/></linearGradient>' +
    '<radialGradient id="emb-shadow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#3a1d12" stop-opacity=".42"/><stop offset="1" stop-color="#3a1d12" stop-opacity="0"/></radialGradient>' +
    '</defs></svg>';

  function injectDefs() {
    if (document.getElementById('sm-badge-defs')) return;
    var d = document.createElement('div');
    d.id = 'sm-badge-defs';
    d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    d.innerHTML = DEFS;
    (document.body || document.documentElement).appendChild(d);
  }

  // ---- emblèmes (viewBox 0 0 64) ----
  var EM = {
    globetrotter:'<circle cx="32" cy="33" r="26" fill="url(#emb-atmo)"/><ellipse cx="33" cy="55" rx="17" ry="4" fill="url(#emb-shadow)"/><circle cx="32" cy="32" r="21" fill="url(#emb-teal)"/><g fill="none" stroke="#0C544D" stroke-opacity=".34" stroke-width="1.2"><path d="M13 27c12 5 26 5 38 0M12 37c11 4 28 4 40 0"/><ellipse cx="32" cy="32" rx="8" ry="21"/></g><path d="M24 22c4-2 9-1 9 2.4 0 3.2-5 3-3.4 6.4 1.4 3-4.4 4.2-7 1.6S20 25 24 22z" fill="#1F9E8C"/><path d="M24 22c4-2 9-1 9 2.4" fill="none" stroke="#BFF3E4" stroke-width="1.3" stroke-linecap="round" opacity=".7"/><path d="M40 38c3.4-.8 6 1 5.4 3.4-.6 2.4-5 2-6.4-.2s-1.6-2.8 1-3.2z" fill="#16887A"/><path d="M32 11a21 21 0 0 1 0 42 15 21 0 0 0 0-42z" fill="#0C544D" opacity=".28"/><g transform="rotate(-22 32 32)"><ellipse cx="32" cy="32" rx="29" ry="10" fill="none" stroke="#FFF3C4" stroke-width="1.5" opacity=".9"/><g transform="translate(61 32) rotate(95)"><path d="M0 -3l1.3 4-.9.4.2 2.2-.6-.7-.6.7.2-2.2-.9-.4z" fill="#fff" stroke="#E79A2A" stroke-width=".4"/></g></g><path d="M44 19c1-1.1 2.9-.5 2.9 1 0 1.2-1.6 2.1-2.9 3.1-1.3-1-2.9-1.9-2.9-3.1 0-1.5 1.9-2.1 2.9-1z" fill="#FF5A4D" stroke="#fff" stroke-width=".7"/><ellipse cx="24" cy="22" rx="9" ry="6" fill="url(#emb-spec)"/>',
    explorer:'<circle cx="32" cy="32" r="24" fill="url(#emb-atmo)"/><ellipse cx="32" cy="52" rx="18" ry="3.4" fill="url(#emb-shadow)"/><circle cx="45" cy="19" r="5.5" fill="url(#emb-gold)"/><g fill="url(#emb-cream)" stroke="#E9A86A" stroke-width=".9"><rect x="13" y="30" width="9" height="20" rx="1"/><rect x="23" y="21" width="10" height="29" rx="1"/><rect x="34" y="33" width="8" height="17" rx="1"/><rect x="42" y="25" width="9" height="25" rx="1"/></g><g fill="#FF8A3D" opacity=".5"><rect x="25.5" y="25" width="2.2" height="2.2"/><rect x="29" y="25" width="2.2" height="2.2"/><rect x="25.5" y="30" width="2.2" height="2.2"/><rect x="29" y="30" width="2.2" height="2.2"/><rect x="44.5" y="29" width="2.2" height="2.2"/><rect x="47.5" y="29" width="2.2" height="2.2"/></g><path d="M11 50h42" stroke="#E9A86A" stroke-width="2" stroke-linecap="round"/><ellipse cx="20" cy="34" rx="4" ry="7" fill="url(#emb-spec)"/>',
    explorer5:'<circle cx="32" cy="34" r="24" fill="url(#emb-atmo)"/><ellipse cx="32" cy="53" rx="18" ry="4" fill="url(#emb-shadow)"/><path d="M14 50L30 16l4 8-9 18z" fill="#1F9E8C"/><path d="M50 50L36 22l-4 8 8 16z" fill="#16887A"/><path d="M32 12l16 38H16z" fill="url(#emb-teal)"/><path d="M32 12l9 21H23z" fill="#FFFDF5" opacity=".92"/><path d="M32 12L48 50H32z" fill="#0C544D" opacity=".22"/><path d="M32 13v12l9-3-9-3z" fill="url(#emb-coral)" stroke="#fff" stroke-width=".7"/><ellipse cx="27" cy="30" rx="5" ry="9" fill="url(#emb-spec)"/>',
    questmaster:'<circle cx="32" cy="32" r="25" fill="url(#emb-atmo)"/><ellipse cx="32" cy="53" rx="17" ry="3.4" fill="url(#emb-shadow)"/><path d="M13 16l8-3 11 3.5 11-3.5v32l-11 3.5-11-3.5-8 3z" fill="url(#emb-cream)" stroke="#E9A86A" stroke-width="1"/><path d="M21 13v32M43 16.5v32" stroke="#E9A86A" stroke-width="1" opacity=".5"/><path d="M20 38c4-8 12-6 15-15" fill="none" stroke="#FF5A4D" stroke-width="2" stroke-linecap="round" stroke-dasharray="1 3.5"/><circle cx="20" cy="38" r="2.4" fill="#1F9E8C"/><path d="M40 18l5 5M45 18l-5 5" stroke="#FF5A4D" stroke-width="2.8" stroke-linecap="round"/><ellipse cx="22" cy="20" rx="6" ry="4" fill="url(#emb-spec)"/>',
    welcome:'<circle cx="32" cy="32" r="24" fill="url(#emb-atmo)"/><ellipse cx="32" cy="53" rx="15" ry="3.4" fill="url(#emb-shadow)"/><g transform="rotate(-14 23 38)"><path d="M21 31c-4 0-6.5 4-6.5 9s2 8 6 8 5-4 5-9-.5-8-4.5-8z" fill="#fff"/><g fill="#fff"><circle cx="15.5" cy="27" r="1.7"/><circle cx="19.5" cy="25.6" r="1.9"/><circle cx="23.5" cy="26" r="1.7"/><circle cx="27" cy="28" r="1.5"/></g></g><g transform="rotate(-14 42 24)" opacity=".82"><path d="M40 19c-3.6 0-6 3.6-6 8s1.8 7 5.4 7 4.5-3.6 4.5-8-.3-7-3.9-7z" fill="#fff"/><g fill="#fff"><circle cx="35" cy="15.6" r="1.5"/><circle cx="38.5" cy="14.4" r="1.7"/><circle cx="42" cy="14.8" r="1.5"/><circle cx="45" cy="16.6" r="1.3"/></g></g><path d="M50 14l1.2 2.5 2.7.2-2.1 1.8.7 2.6L50 19.6l-2.5 1.5.7-2.6-2.1-1.8 2.7-.2z" fill="url(#emb-coral)"/>',
    firstcheckin:'<circle cx="32" cy="28" r="23" fill="url(#emb-atmo)"/><ellipse cx="32" cy="55" rx="9" ry="3" fill="url(#emb-shadow)"/><path d="M32 7c-10 0-17 7.5-17 17 0 12 17 33 17 33s17-21 17-33c0-9.5-7-17-17-17z" fill="url(#emb-coral)"/><path d="M32 7c10 0 17 7.5 17 17 0 12-17 33-17 33z" fill="#9e2418" opacity=".25"/><circle cx="32" cy="24" r="9" fill="url(#emb-cream)"/><circle cx="32" cy="24" r="9" fill="none" stroke="#fff" stroke-width="1.2" opacity=".7"/><circle cx="29" cy="21" r="2.6" fill="#fff" opacity=".85"/><path d="M20 16c2-3 6-5 10-5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".55"/>',
    adventure:'<circle cx="32" cy="30" r="24" fill="url(#emb-atmo)"/><ellipse cx="32" cy="54" rx="9" ry="3" fill="url(#emb-shadow)"/><path d="M32 7c6.2 5 9.5 13.5 9.5 23l-4 4h-11l-4-4c0-9.5 3.3-18 9.5-23z" fill="#fff"/><path d="M32 7c6.2 5 9.5 13.5 9.5 23l-4 4H32z" fill="rgba(255,255,255,.82)"/><circle cx="32" cy="22" r="4.2" fill="#1F9E8C"/><circle cx="32" cy="22" r="4.2" fill="none" stroke="#fff" stroke-width="1.4"/><path d="M22.5 30l-5.5 9 5.5-2.5zM41.5 30l5.5 9-5.5-2.5z" fill="url(#emb-coral)"/><path d="M27 34h10c0 5.5-2 10-5 13.5-3-3.5-5-8-5-13.5z" fill="#FFD56A"/><path d="M29.5 34h5c0 3.5-1.2 6.6-2.5 9-1.3-2.4-2.5-5.5-2.5-9z" fill="#FF5A4D"/><ellipse cx="28" cy="16" rx="4" ry="6" fill="url(#emb-spec)"/>',
    coffee:'<circle cx="30" cy="34" r="23" fill="url(#emb-atmo)"/><g stroke="url(#emb-coral)" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".85"><path d="M24 10c-2 3 2 5 0 8"/><path d="M32 8c-2 3 2 5 0 8"/></g><ellipse cx="29" cy="53" rx="15" ry="3.4" fill="url(#emb-shadow)"/><path d="M14 26h28v12a12 12 0 0 1-12 12h-4a12 12 0 0 1-12-12z" fill="url(#emb-glass)" stroke="#E9A86A" stroke-width="1"/><path d="M14 26h28v4l-14 3-14-3z" fill="url(#emb-coral)" opacity=".9"/><ellipse cx="28" cy="29" rx="13" ry="2.6" fill="#5a2a14" opacity=".5"/><path d="M42 28h4a7 7 0 0 1 0 14h-4z" fill="url(#emb-gold)" stroke="#A9670F" stroke-width="1"/><path d="M42 32h3a3 3 0 0 1 0 6h-3z" fill="url(#emb-glass)"/><ellipse cx="21" cy="34" rx="4" ry="8" fill="url(#emb-spec)"/>',
    photographer:'<circle cx="32" cy="34" r="24" fill="url(#emb-atmo)"/><ellipse cx="32" cy="53" rx="18" ry="3.6" fill="url(#emb-shadow)"/><path d="M9 22h10l3.5-5h19l3.5 5h10a3 3 0 0 1 3 3v22a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V25a3 3 0 0 1 3-3z" fill="url(#emb-teal)"/><path d="M55 22a3 3 0 0 1 3 3v22a3 3 0 0 1-3 3H32V17h7.5l3.5 5z" fill="#0C544D" opacity=".22"/><circle cx="32" cy="35" r="11.5" fill="url(#emb-gold)"/><circle cx="32" cy="35" r="8.5" fill="url(#emb-coral)"/><circle cx="32" cy="35" r="4.5" fill="#3a1430"/><circle cx="29" cy="32" r="2" fill="#fff" opacity=".9"/><rect x="46" y="26" width="6" height="3" rx="1.4" fill="#FFD56A"/><ellipse cx="22" cy="27" rx="6" ry="3" fill="url(#emb-spec)"/>',
    culture:'<circle cx="32" cy="32" r="24" fill="url(#emb-atmo)"/><ellipse cx="32" cy="54" rx="20" ry="3.6" fill="url(#emb-shadow)"/><path d="M32 8L10 21v4h44v-4z" fill="url(#emb-gold)" stroke="#A9670F" stroke-width=".8"/><path d="M32 8l22 13v4H32z" fill="#A9670F" opacity=".3"/><circle cx="32" cy="15.5" r="2.6" fill="#FFF7D8"/><g fill="url(#emb-cream)" stroke="#E9A86A" stroke-width=".7"><rect x="13" y="27" width="6" height="18"/><rect x="22" y="27" width="6" height="18"/><rect x="36" y="27" width="6" height="18"/><rect x="45" y="27" width="6" height="18"/></g><g fill="#A9670F" opacity=".3"><rect x="17" y="27" width="2" height="18"/><rect x="26" y="27" width="2" height="18"/><rect x="40" y="27" width="2" height="18"/><rect x="49" y="27" width="2" height="18"/></g><path d="M10 46h44v6a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2z" fill="url(#emb-cream)" stroke="#E9A86A" stroke-width=".7"/><rect x="12" y="22.5" width="36" height="3" rx="1.5" fill="url(#emb-spec)"/>',
    butterfly:'<circle cx="32" cy="32" r="25" fill="url(#emb-atmo)"/><ellipse cx="32" cy="52" rx="13" ry="3" fill="url(#emb-shadow)"/><path d="M31 32C27 18 13 14 9 21c-4 7 3 17 19 12z" fill="url(#emb-violet)"/><path d="M33 32C37 18 51 14 55 21c4 7-3 17-19 12z" fill="url(#emb-coral)"/><path d="M31 33c-2 11-13 15-17 9s3-14 16-10z" fill="url(#emb-coral)"/><path d="M33 33c2 11 13 15 17 9s-3-14-16-10z" fill="url(#emb-violet)"/><g fill="#FFFDF5"><circle cx="20" cy="24" r="3"/><circle cx="44" cy="24" r="3"/><circle cx="22" cy="40" r="2"/><circle cx="42" cy="40" r="2"/></g><path d="M31 33c-2 11-13 15-17 9M33 33c2 11 13 15 17 9M31 32C27 18 13 14 9 21M33 32C37 18 51 14 55 21" fill="none" stroke="#FFF3C4" stroke-width=".9" opacity=".7"/><path d="M32 20c-2.6-4-6-4-7.5-7M32 20c2.6-4 6-4 7.5-7" stroke="#FFD56A" stroke-width="1.8" fill="none" stroke-linecap="round"/><rect x="30.4" y="20" width="3.2" height="24" rx="1.6" fill="url(#emb-gold)"/><ellipse cx="18" cy="22" rx="5" ry="3.5" fill="url(#emb-spec)"/>',
    local:'<circle cx="32" cy="32" r="24" fill="url(#emb-atmo)"/><ellipse cx="32" cy="53" rx="16" ry="3.6" fill="url(#emb-shadow)"/><path d="M32 10L52 28H44v18a3 3 0 0 1-3 3H23a3 3 0 0 1-3-3V28h-8z" fill="url(#emb-coral)"/><path d="M32 10l20 18H44v18a3 3 0 0 1-3 3h-9z" fill="#9e2418" opacity=".22"/><path d="M24 30h16v17H24z" fill="url(#emb-cream)" stroke="#E9A86A" stroke-width=".7"/><path d="M32 31c-1.6-2.2-4.6-1.2-4.6 1.4 0 2.8 4.6 5.4 4.6 5.4s4.6-2.6 4.6-5.4c0-2.6-3-3.6-4.6-1.4z" fill="url(#emb-gold)" stroke="#fff" stroke-width=".6"/><rect x="29" y="42" width="6" height="5" rx="1" fill="#A9670F" opacity=".5"/><ellipse cx="26" cy="26" rx="5" ry="4" fill="url(#emb-spec)"/>',
    polyglot:'<circle cx="32" cy="32" r="24" fill="url(#emb-atmo)"/><ellipse cx="32" cy="53" rx="16" ry="3.4" fill="url(#emb-shadow)"/><circle cx="30" cy="30" r="16" fill="url(#emb-teal)"/><g fill="none" stroke="#EAFBF5" stroke-opacity=".6" stroke-width="1.1"><ellipse cx="30" cy="30" rx="6.5" ry="16"/><path d="M15 25c10 4 20 4 30 0M15 35c10 4 20 4 30 0"/></g><path d="M30 16a16 16 0 0 1 0 32 11 16 0 0 0 0-32z" fill="#0C544D" opacity=".25"/><path d="M34 20h16a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4h-2v5l-6-5h-8a4 4 0 0 1-4-4v-8a4 4 0 0 1 4-4z" fill="url(#emb-cream)" stroke="#E9A86A" stroke-width=".8"/><g fill="url(#emb-coral)"><circle cx="40" cy="28" r="1.8"/><circle cx="45" cy="28" r="1.8"/><circle cx="50" cy="28" r="1.8"/></g><ellipse cx="24" cy="23" rx="5.5" ry="4" fill="url(#emb-spec)"/>',
    guardian:'<circle cx="32" cy="32" r="24" fill="url(#emb-glowcool)"/><ellipse cx="32" cy="53" rx="14" ry="3.4" fill="url(#emb-shadow)"/><path d="M32 8l20 6c0 22-8 33-20 38C20 47 12 36 12 14z" fill="url(#emb-cream)" stroke="#E9A86A" stroke-width="1"/><path d="M32 8l20 6c0 22-8 33-20 38z" fill="#A9670F" opacity=".18"/><path d="M32 8l20 6c0 22-8 33-20 38C20 47 12 36 12 14z" fill="none" stroke="#FFD56A" stroke-width="1.4" opacity=".7"/><path d="M32 24c-2.4-3.4-7-2.2-7 2 0 4.6 7 9.6 7 9.6s7-5 7-9.6c0-4.2-4.6-5.4-7-2z" fill="url(#emb-gold)" stroke="#fff" stroke-width=".8"/><circle cx="32" cy="14" r="1.6" fill="#A9670F"/><circle cx="24" cy="44" r="1.4" fill="#A9670F"/><circle cx="40" cy="44" r="1.4" fill="#A9670F"/><ellipse cx="25" cy="20" rx="6" ry="5" fill="url(#emb-spec)"/>',
    guardian_helper:'<circle cx="32" cy="32" r="24" fill="url(#emb-glowcool)"/><ellipse cx="32" cy="53" rx="14" ry="3.4" fill="url(#emb-shadow)"/><path d="M32 8l20 6c0 22-8 33-20 38C20 47 12 36 12 14z" fill="url(#emb-cream)" stroke="#E9A86A" stroke-width="1"/><path d="M32 8l20 6c0 22-8 33-20 38z" fill="#A9670F" opacity=".18"/><path d="M32 26c-2-2.8-6-1.8-6 1.6 0 3.8 6 8 6 8s6-4.2 6-8c0-3.4-4-4.4-6-1.6z" fill="url(#emb-coral)" stroke="#fff" stroke-width=".7"/><path d="M20 30c2-1 4-.6 6 1M44 30c-2-1-4-.6-6 1" stroke="url(#emb-gold)" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M32 8l20 6c0 22-8 33-20 38C20 47 12 36 12 14z" fill="none" stroke="#FFD56A" stroke-width="1.4" opacity=".7"/><ellipse cx="25" cy="20" rx="6" ry="5" fill="url(#emb-spec)"/>',
    verified:'<circle cx="32" cy="30" r="23" fill="url(#emb-glowcool)"/><path d="M24 44l-6 12 8-3 4 6 5-12z" fill="url(#emb-gold)"/><path d="M40 44l6 12-8-3-4 6-5-12z" fill="#A9670F"/><g fill="url(#emb-cream)" stroke="#E9A86A" stroke-width=".7"><circle cx="32" cy="28" r="19"/></g><circle cx="32" cy="28" r="19" fill="none" stroke="#FFD56A" stroke-width="1.4" stroke-dasharray="2.2 2.2" opacity=".8"/><circle cx="32" cy="28" r="13.5" fill="url(#emb-gold)"/><circle cx="32" cy="28" r="13.5" fill="none" stroke="#FFF7D8" stroke-width="1"/><path d="M25 28l5 5 9-10" fill="none" stroke="#FFFDF5" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="26" cy="21" rx="6" ry="4" fill="url(#emb-spec)"/>',
    legend:'<circle cx="32" cy="32" r="25" fill="url(#emb-atmo)"/><ellipse cx="32" cy="54" rx="18" ry="3.6" fill="url(#emb-shadow)"/><path d="M12 22l8 10 8-14 4-2 4 2 8 14 8-10-5 26H17z" fill="url(#emb-gold)" stroke="#A9670F" stroke-width="1"/><path d="M32 16l4-2 4 2 8 14 8-10-5 26H32z" fill="#A9670F" opacity=".25"/><path d="M15 48h34l1 5a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2z" fill="url(#emb-gold)" stroke="#A9670F" stroke-width="1"/><circle cx="12" cy="20" r="3.2" fill="#FFF7D8" stroke="#A9670F" stroke-width=".6"/><circle cx="52" cy="20" r="3.2" fill="#FFF7D8" stroke="#A9670F" stroke-width=".6"/><circle cx="32" cy="16" r="3.4" fill="url(#emb-coral)" stroke="#fff" stroke-width=".7"/><circle cx="24" cy="40" r="2.6" fill="url(#emb-teal)"/><circle cx="40" cy="40" r="2.6" fill="url(#emb-coral)"/><circle cx="32" cy="42" r="2.6" fill="url(#emb-teal)"/><path d="M14 24l8 8 6-12" fill="none" stroke="#FFF7D8" stroke-width="1" opacity=".6"/>',
    profile100:'<circle cx="32" cy="30" r="25" fill="url(#emb-atmo)"/><path d="M32 6l7 16 17 1.5-13 11 4.2 17L32 43l-15.2 8.5L21 34.5l-13-11L25 22z" fill="url(#emb-gold)" stroke="#A9670F" stroke-width="1"/><path d="M32 6l7 16 17 1.5-13 11 4.2 17L32 43z" fill="#A9670F" opacity=".25"/><path d="M32 13l4.6 10.6 11 1-8.6 7.2 2.8 11L32 37z" fill="#FFF7D8" opacity=".55"/><rect x="18" y="40" width="28" height="13" rx="3" fill="url(#emb-coral)" stroke="#fff" stroke-width=".8"/><text x="32" y="50" text-anchor="middle" font-family="Fraunces,serif" font-weight="900" font-size="9" fill="#fff">100</text><circle cx="49" cy="16" r="1.8" fill="#FFF7D8"/><circle cx="15" cy="20" r="1.6" fill="#FFF7D8"/>',
    reviewer:'<circle cx="32" cy="31" r="25" fill="url(#emb-atmo)"/><ellipse cx="32" cy="52" rx="16" ry="3.4" fill="url(#emb-shadow)"/><path d="M13 13h38a7 7 0 0 1 7 7v15a7 7 0 0 1-7 7H30l-9 8v-8h-8a7 7 0 0 1-7-7V20a7 7 0 0 1 7-7z" fill="url(#emb-cream)" stroke="#E9A86A" stroke-width="1"/><path d="M32 17.5l3.4 7 7.6.6-5.8 5 1.7 7.4L32 40.6l-6.9 3.9 1.7-7.4-5.8-5 7.6-.6z" fill="url(#emb-gold)" stroke="#A9670F" stroke-width=".6"/><ellipse cx="20" cy="20" rx="6" ry="4" fill="url(#emb-spec)"/>',
    foodie:'<circle cx="32" cy="34" r="25" fill="url(#emb-atmo)"/><ellipse cx="32" cy="52" rx="20" ry="4" fill="url(#emb-shadow)"/><path d="M14 26h36v2H14z" fill="url(#emb-gold)"/><path d="M16 27a16 12 0 0 1 32 0z" fill="url(#emb-gold)" stroke="#A9670F" stroke-width="1"/><path d="M32 15v-3M32 12a2 2 0 1 1 .01 0z" fill="#FFF7D8" stroke="#A9670F" stroke-width=".8"/><path d="M20 22a12 9 0 0 1 18-4" fill="none" stroke="#FFF7D8" stroke-width="1.4" opacity=".6"/><ellipse cx="32" cy="46" rx="22" ry="6" fill="url(#emb-cream)" stroke="#E9A86A" stroke-width="1"/><ellipse cx="32" cy="45" rx="22" ry="5" fill="none" stroke="#A9670F" stroke-width=".7" opacity=".4"/><path d="M8 28v14M12 28v14M8 38h4M52 28c4 0 4 6 0 8v6" stroke="url(#emb-gold)" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="44" cy="20" r="2.2" fill="url(#emb-coral)"/>',
    night:'<circle cx="32" cy="32" r="24" fill="url(#emb-atmo)"/><circle cx="30" cy="30" r="19" fill="url(#emb-glowcool)" opacity=".7"/><path d="M40 10a20 20 0 1 0 13 31A15 15 0 0 1 40 10z" fill="url(#emb-moon)" stroke="#E7C06A" stroke-width=".8"/><path d="M40 10a15 15 0 0 0 13 31 20 20 0 0 1-9 8 20 20 0 0 0 5-39z" fill="#E7C06A" opacity=".4"/><g fill="#E7C06A" opacity=".4"><circle cx="30" cy="24" r="3"/><circle cx="26" cy="34" r="2.2"/><circle cx="34" cy="40" r="2.6"/></g><path d="M48 40l1.6 3.6 3.8.4-2.9 2.5.9 3.7L48 46.7l-3.3 1.9.9-3.7-2.9-2.5 3.8-.4z" fill="url(#emb-coral)" stroke="#fff" stroke-width=".6"/><g fill="#FFD56A"><circle cx="18" cy="20" r="1.4"/><circle cx="20" cy="44" r="1.2"/></g><ellipse cx="34" cy="20" rx="4" ry="6" fill="url(#emb-spec)"/>',
    nightowl:'<circle cx="32" cy="32" r="25" fill="url(#emb-atmo)" opacity=".8"/><ellipse cx="32" cy="53" rx="13" ry="3" fill="url(#emb-shadow)"/><path d="M16 30c0-11 7-18 16-18s16 7 16 18v6c0 11-7 17-16 17s-16-6-16-17z" fill="url(#emb-violet)"/><path d="M32 12c9 0 16 7 16 18v6c0 11-7 17-16 17z" fill="#3a1f78" opacity=".4"/><path d="M16 26c-3-5-3-10-1-12 3 1 5 5 6 9M48 26c3-5 3-10 1-12-3 1-5 5-6 9z" fill="url(#emb-violet)" stroke="#EBE2FF" stroke-width=".7"/><path d="M22 36c0 8 5 13 10 13V30c-5 0-10 2-10 6z" fill="url(#emb-cream)" opacity=".55"/><circle cx="25" cy="29" r="7" fill="#FFFDF2"/><circle cx="39" cy="29" r="7" fill="#FFFDF2"/><circle cx="25" cy="29" r="4.6" fill="url(#emb-gold)"/><circle cx="39" cy="29" r="4.6" fill="url(#emb-gold)"/><circle cx="25" cy="29" r="2" fill="#241036"/><circle cx="39" cy="29" r="2" fill="#241036"/><circle cx="23.5" cy="27.5" r="1" fill="#fff"/><circle cx="37.5" cy="27.5" r="1" fill="#fff"/><path d="M29 33l3 4 3-4z" fill="url(#emb-coral)" stroke="#fff" stroke-width=".5"/><ellipse cx="22" cy="22" rx="5" ry="3.5" fill="url(#emb-spec)"/>'
  };
  // famille par emblème
  var FAM = {
    globetrotter:'exploration', explorer:'exploration', explorer5:'exploration', questmaster:'exploration', welcome:'exploration', firstcheckin:'exploration', adventure:'exploration', coffee:'exploration', photographer:'exploration', culture:'exploration',
    butterfly:'social', local:'social', polyglot:'social',
    guardian:'securite', guardian_helper:'securite', verified:'securite',
    legend:'accomplissement', profile100:'accomplissement', reviewer:'accomplissement', foodie:'accomplissement', night:'accomplissement', nightowl:'accomplissement'
  };

  function emb(key, s) { var e = EM[key] || EM.explorer; return '<g transform="translate(64 64) scale(' + (s || 1) + ') translate(-32 -32)">' + e + '</g>'; }
  function rad(d){ return d*Math.PI/180; }
  function pt(c,r,a){ return [c+r*Math.sin(rad(a)), c-r*Math.cos(rad(a))]; }
  function loop(n, fn){ var o=''; for(var i=0;i<n;i++){ o+=fn(i*360/n, i); } return o; }
  function drop(lite){ return lite ? '' : ' filter="url(#sm-drop)"'; }

  // ---- cadres par famille (inner SVG, viewBox 0 0 128 128) ----
  function frExploration(key, lite){
    var star='M64 4 L76 38 L110 20 L92 54 L126 64 L92 74 L110 108 L76 90 L64 124 L52 90 L18 108 L36 74 L2 64 L36 54 L18 20 L52 38 Z';
    var grain = lite ? '' : '<circle cx="64" cy="64" r="40" fill="#fff" filter="url(#ex-grain)" opacity=".5"/>';
    return '<g'+drop(lite)+'><path d="'+star+'" fill="url(#ex-brass)" stroke="#7a4d24" stroke-width="1.5"/>'+
      '<circle cx="64" cy="64" r="40" fill="url(#ex-leather)"/>'+grain+
      '<circle cx="64" cy="64" r="40" fill="none" stroke="url(#ex-brass)" stroke-width="3.5"/>'+
      '<circle cx="64" cy="64" r="33" fill="none" stroke="#FFE7AE" stroke-width="1.3" stroke-dasharray="2 4" opacity=".8"/>'+
      emb(key,1.12)+'<circle cx="64" cy="64" r="40" fill="url(#sm-light)"/>'+
      '</g>';
  }
  function frSocial(key, lite){
    var petals = loop(12, function(a){ var p=pt(64,40,a); return '<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="11" fill="url(#so-petal)" stroke="#FFE7AE" stroke-width="1.3"/>'; });
    return '<g'+drop(lite)+'>'+petals+
      '<circle cx="64" cy="64" r="40" fill="url(#so-enamel)"/><circle cx="64" cy="64" r="40" fill="none" stroke="#FFE7AE" stroke-width="2.4"/>'+
      emb(key,1.12)+'<circle cx="64" cy="64" r="40" fill="url(#sm-light)"/>'+
      '</g>';
  }
  function frSecurite(key, lite){
    var shield='M64 8 L112 22 Q114 70 100 96 Q84 116 64 122 Q44 116 28 96 Q14 70 16 22 Z';
    var brush = lite ? '' : '<path d="'+shield+'" fill="#fff" filter="url(#se-brush)" opacity=".5"/>';
    return '<g'+drop(lite)+'><path d="'+shield+'" fill="url(#se-steel)"/>'+brush+
      '<path d="'+shield+'" fill="none" stroke="#ffd15c" stroke-width="2.4"/>'+
      '<circle cx="64" cy="60" r="34" fill="url(#se-core)"/><circle cx="64" cy="60" r="34" fill="none" stroke="#eef3f8" stroke-width="2"/>'+
      '<g transform="translate(0 -4)">'+emb(key,.92)+'</g>'+
      '<rect x="30" y="24" width="8" height="8" rx="1.6" fill="#9aa6b4" stroke="#eef3f8" stroke-width="1.2"/><rect x="90" y="24" width="8" height="8" rx="1.6" fill="#9aa6b4" stroke="#eef3f8" stroke-width="1.2"/>'+
      '<path d="'+shield+'" fill="url(#sm-light)"/></g>';
  }
  function frAccomplissement(key, lite){
    var rays = loop(16, function(a,i){ var p1=pt(64,44,a-7),p2=pt(64,62,a),p3=pt(64,44,a+7); return '<path d="M'+p1[0].toFixed(1)+' '+p1[1].toFixed(1)+' L'+p2[0].toFixed(1)+' '+p2[1].toFixed(1)+' L'+p3[0].toFixed(1)+' '+p3[1].toFixed(1)+' Z" fill="url(#ac-gold)" opacity="'+(i%2?0.7:1)+'"/>'; });
    var laurelL = loop(5, function(a,i){ var yy=44-i*15; return '<ellipse cx="26" cy="'+yy+'" rx="6" ry="3.2" fill="#C9831C" transform="rotate(-35 26 '+yy+')"/>'; });
    var laurelR = loop(5, function(a,i){ var yy=44-i*15; return '<ellipse cx="102" cy="'+yy+'" rx="6" ry="3.2" fill="#C9831C" transform="rotate(35 102 '+yy+')"/>'; });
    return '<g'+drop(lite)+'>'+rays+
      '<circle cx="64" cy="64" r="41" fill="url(#ac-gold)"/><circle cx="64" cy="64" r="36" fill="url(#ac-core)"/><circle cx="64" cy="64" r="36" fill="none" stroke="#FFE9A0" stroke-width="2"/>'+
      emb(key,1.05)+'<circle cx="64" cy="64" r="36" fill="url(#sm-light)"/>'+
      '</g>';
  }
  function frSecret(key, lite){
    var arches = loop(12, function(a){ var p=pt(64,42,a); return '<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="2.4" fill="none" stroke="url(#lg-irid)" stroke-width="1.2"/>'; });
    var stars = lite ? '' : '<circle cx="64" cy="64" r="44" fill="#fff" filter="url(#lg-stars)"/>';
    var rays = loop(4, function(a){ var p1=pt(64,70,a-4),p2=pt(64,70,a+4); return '<path d="M64 64 L'+p1[0].toFixed(1)+' '+p1[1].toFixed(1)+' L'+p2[0].toFixed(1)+' '+p2[1].toFixed(1)+' Z" fill="url(#lg-irid)"/>'; });
    var anim = lite ? '' : '<animateTransform attributeName="transform" type="rotate" from="0 64 64" to="360 64 64" dur="22s" repeatCount="indefinite"/>';
    var haloAnim = lite ? '' : '<animate attributeName="r" values="48;53;48" dur="3.2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;.45;.9" dur="3.2s" repeatCount="indefinite"/>';
    return '<g'+drop(lite)+'>'+
      '<circle cx="64" cy="64" r="50" fill="none" stroke="url(#lg-irid)" stroke-width="3">'+haloAnim+'</circle>'+
      '<circle cx="64" cy="64" r="44" fill="url(#lg-galaxy)"/>'+stars+
      '<circle cx="64" cy="64" r="44" fill="none" stroke="url(#lg-irid)" stroke-width="2.4"/><circle cx="64" cy="64" r="40" fill="none" stroke="url(#lg-irid)" stroke-width="1.2" opacity=".7"/>'+arches+
      emb(key,.96)+
      '<circle cx="64" cy="20" r="4.5" fill="#7afcff" stroke="#fff" stroke-width="1"/><circle cx="108" cy="64" r="4.5" fill="#FF5A4D" stroke="#fff" stroke-width="1"/><circle cx="64" cy="108" r="4.5" fill="#ffd15c" stroke="#fff" stroke-width="1"/><circle cx="20" cy="64" r="4.5" fill="#b06bff" stroke="#fff" stroke-width="1"/></g>';
  }
  function frSecretLocked(lite){
    var halo = lite ? '' : '<animate attributeName="r" values="46;51;46" dur="3.2s" repeatCount="indefinite"/>';
    return '<g'+drop(lite)+'><circle cx="64" cy="64" r="48" fill="none" stroke="url(#lg-irid)" stroke-width="2" opacity=".28">'+halo+'</circle>'+
      '<circle cx="64" cy="64" r="44" fill="#15122e"/><circle cx="64" cy="64" r="44" fill="none" stroke="url(#lg-irid)" stroke-width="2" opacity=".35"/>'+
      '<text x="64" y="80" text-anchor="middle" font-size="44" font-weight="800" fill="url(#lg-irid)" opacity=".55">?</text>'+
      '</g>';
  }

  var FRAMES = { exploration:frExploration, social:frSocial, securite:frSecurite, accomplissement:frAccomplissement, secret:frSecret };

  // ---- registre des secrets (auto-détection si opts.secret non fourni) ----
  var DEFAULT_SECRET = { globetrotter:1, butterfly:1, legend:1, guardian:1, nightowl:1 };
  var SECRETS = Object.assign({}, DEFAULT_SECRET);

  // ---- API publique ----
  // badgeKey : ex "badge_globetrotter" ou "globetrotter". opts: {secret, size, lite, locked}
  window.SMBadge = function (badgeKey, opts) {
    injectDefs();
    opts = opts || {};
    var key = String(badgeKey || '').replace(/^badge_/, '');
    var size = opts.size || 64;
    var lite = opts.lite != null ? opts.lite : size < 90;
    var secret = opts.secret != null ? opts.secret : !!SECRETS[key];
    var inner;
    if (opts.locked && secret) {
      inner = frSecretLocked(lite);
    } else {
      var fam = secret ? 'secret' : (FAM[key] || 'exploration');
      inner = (FRAMES[fam] || frExploration)(key, lite);
    }
    return '<svg class="smbadge-svg" viewBox="0 0 128 128" width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + inner + '</svg>';
  };

  window.SMBadge.hasEmblem = function (badgeKey) { return !!EM[String(badgeKey || '').replace(/^badge_/, '')]; };
  window.SMBadge.isSecret = function (badgeKey) { return !!SECRETS[String(badgeKey || '').replace(/^badge_/, '')]; };
  // Synchronise le registre depuis le catalogue Supabase (is_secret)
  window.SMBadge.setSecrets = function (keys) {
    SECRETS = Object.assign({}, DEFAULT_SECRET);
    (keys || []).forEach(function (k) { SECRETS[String(k).replace(/^badge_/, '')] = 1; });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectDefs);
  else injectDefs();
})();
