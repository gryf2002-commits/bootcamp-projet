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
    globetrotter:'<circle cx="32" cy="32" r="22" fill="#fff"/><path d="M32 10c-6 6-6 38 0 44M32 10c6 6 6 38 0 44M11 32h42M14 21h36M14 43h36" stroke="rgba(255,255,255,.82)" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M20 24c4-1 7 1 6 4-1 2-5 2-5 5 0 2 3 2 3 5" stroke="#19b36b" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M40 38c-3-1-5 1-4 3 1 3 6 2 6 5" stroke="#19b36b" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="42" cy="22" r="3" fill="#FF5A4D"/>',
    explorer:'<circle cx="32" cy="32" r="21" fill="rgba(255,255,255,.82)"/><path d="M32 14l5.5 11.5L49 31 32 50 15 31l11.5-5.5z" fill="#fff"/><path d="M32 18l4 9 9 4-13 14-13-14 9-4z" fill="#FF5A4D"/><circle cx="32" cy="31" r="4" fill="#fff"/>',
    explorer5:'<path d="M22 50l-3-9 13-29 13 29-3 9z" fill="#fff"/><path d="M32 12l9 20H23z" fill="rgba(255,255,255,.82)"/><circle cx="32" cy="27" r="5.5" fill="#FF5A4D"/><circle cx="32" cy="27" r="2.2" fill="#fff"/><path d="M22 50l4-7h12l4 7z" fill="rgba(255,255,255,.82)"/>',
    questmaster:'<path d="M32 9l6 6h8v8l6 6-6 6v8h-8l-6 6-6-6h-8v-8l-6-6 6-6V15h8z" fill="rgba(255,255,255,.82)"/><circle cx="32" cy="32" r="13" fill="#fff"/><path d="M32 23l2.6 5.6 6 .7-4.4 4.2 1.2 6L32 37l-5.4 2.5 1.2-6-4.4-4.2 6-.7z" fill="#ffd15c"/>',
    welcome:'<path d="M14 40c8-2 10 4 18 2s10-6 18-4l-3 14H17z" fill="rgba(255,255,255,.82)"/><circle cx="32" cy="20" r="9" fill="#fff"/><path d="M32 11a9 9 0 0 1 0 18" fill="rgba(255,255,255,.82)"/><path d="M20 38l8-7 4 4 4-4 8 7" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="44" cy="16" r="3.5" fill="#FF5A4D"/>',
    firstcheckin:'<path d="M32 8c-9 0-16 7-16 16 0 11 16 32 16 32s16-21 16-32c0-9-7-16-16-16z" fill="#fff"/><path d="M32 8c9 0 16 7 16 16 0 11-16 32-16 32z" fill="rgba(255,255,255,.82)"/><circle cx="32" cy="24" r="7.5" fill="#FF5A4D"/><circle cx="32" cy="24" r="3" fill="#fff"/>',
    adventure:'<path d="M8 24c10-9 38-9 48 0-6 1-10 5-14 5-3 0-5-3-10-3s-7 3-10 3c-4 0-8-4-14-5z" fill="#fff"/><path d="M22 29l10 22 10-22c-3 1-6 2-10 2s-7-1-10-2z" fill="rgba(255,255,255,.82)"/><circle cx="32" cy="40" r="4.5" fill="#FF5A4D"/>',
    coffee:'<path d="M16 28h26v12a10 10 0 0 1-10 10h-6a10 10 0 0 1-10-10z" fill="#fff"/><path d="M42 30h4a6 6 0 0 1 0 12h-4z" fill="rgba(255,255,255,.82)"/><path d="M42 34h3a2.5 2.5 0 0 1 0 5h-3z" fill="#fff"/><path d="M23 12c-2 3 2 5 0 8M32 12c-2 3 2 5 0 8" stroke="#FF5A4D" stroke-width="3" fill="none" stroke-linecap="round"/>',
    photographer:'<path d="M10 22h10l4-5h16l4 5h10v26H10z" fill="#fff"/><path d="M54 22v26H32V17h6l4 5z" fill="rgba(255,255,255,.82)"/><circle cx="32" cy="34" r="10" fill="#fff"/><circle cx="32" cy="34" r="6.5" fill="#FF5A4D"/><circle cx="32" cy="34" r="2.5" fill="#fff"/><circle cx="48" cy="27" r="2" fill="#ffd15c"/>',
    culture:'<path d="M32 8L12 20v4h40v-4z" fill="#fff"/><path d="M32 8l20 12v4H32z" fill="rgba(255,255,255,.82)"/><path d="M16 26h4v18h-4zM28 26h4v18h-4zM40 26h4v18h-4z" fill="#fff"/><path d="M10 48h44v6H10z" fill="rgba(255,255,255,.82)"/><circle cx="32" cy="16" r="2.6" fill="#ffd15c"/>',
    butterfly:'<path d="M31 32C28 20 16 16 12 22c-4 6 2 16 16 12M33 32c3-12 15-16 19-10 4 6-2 16-16 12" fill="#fff"/><path d="M31 33c-2 9-12 13-16 8s2-13 14-9M33 33c2 9 12 13 16 8s-2-13-14-9" fill="rgba(255,255,255,.82)"/><rect x="30.5" y="20" width="3" height="26" rx="1.5" fill="#fff"/><path d="M30 20c-2-4-6-4-7-7M34 20c2-4 6-4 7-7" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="22" cy="25" r="3" fill="#7a5cff"/><circle cx="42" cy="25" r="3" fill="#FF5A4D"/>',
    local:'<path d="M10 30l10-6 8 5 4-1 8 3 6 7-6 6-8-4-2 2-8-3-2 3-6-4z" fill="#fff"/><path d="M40 28l8 3 6 7-6 6-8-4z" fill="rgba(255,255,255,.82)"/><path d="M32 16c-2-2-6-1-6 2 0 3 6 7 6 7s6-4 6-7c0-3-4-4-6-2z" fill="#FF5A4D"/>',
    polyglot:'<path d="M10 16h28a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H22l-8 7v-7h-4a4 4 0 0 1-4-4V20a4 4 0 0 1 4-4z" fill="#fff"/><path d="M32 28h18a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4h2v6l-7-6H34a4 4 0 0 1-4-4z" fill="rgba(255,255,255,.82)"/><circle cx="17" cy="26" r="2.4" fill="#7a5cff"/><circle cx="25" cy="26" r="2.4" fill="#7a5cff"/><circle cx="33" cy="26" r="2.4" fill="#7a5cff"/><path d="M40 38l4-6 4 6" stroke="#FF5A4D" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    guardian:'<path d="M32 14C28 10 18 9 12 14c-4 3 0 9 4 11-3-1-5 3-2 6 3 4 14 9 18 11 4-2 15-7 18-11 3-3 1-7-2-6 4-2 8-8 4-11-6-5-16-4-20 0z" fill="#fff"/><path d="M32 24c-2-3-7-2-7 2 0 4 7 9 7 9s7-5 7-9c0-4-5-5-7-2z" fill="#19b36b"/>',
    guardian_helper:'<circle cx="32" cy="32" r="20" fill="#fff"/><path d="M32 12a20 20 0 0 1 0 40z" fill="rgba(255,255,255,.82)"/><circle cx="32" cy="32" r="9" fill="#FF5A4D"/><circle cx="32" cy="32" r="9" fill="none" stroke="#fff" stroke-width="2.4"/><path d="M32 12v8M32 44v8M12 32h8M44 32h8" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round"/>',
    verified:'<path d="M32 8l6 4 7-1 1 7 4 6-4 6 1 7-7-1-6 4-6-4-7 1 1-7-4-6 4-6-1-7 7 1z" fill="#fff"/><path d="M24 32l6 6 12-13" stroke="#19b36b" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    legend:'<path d="M12 22l8 9 12-15 12 15 8-9-4 26H16z" fill="#FFE9A0"/><path d="M14 48h36v5H14z" fill="#FFE9A0"/><circle cx="12" cy="20" r="3" fill="#fff"/><circle cx="52" cy="20" r="3" fill="#fff"/><circle cx="32" cy="14" r="3.4" fill="#FF5A4D"/><circle cx="32" cy="39" r="3" fill="#fff"/>',
    profile100:'<path d="M32 8l6.5 16.5L56 26l-13 11 4 18-15-9-15 9 4-18L8 26l17.5-1.5z" fill="#fff"/><path d="M32 8l6.5 16.5L56 26l-13 11 4 18-15-9z" fill="rgba(255,255,255,.82)"/><circle cx="46" cy="16" r="2.4" fill="#ffd15c"/><circle cx="16" cy="44" r="2" fill="#ffd15c"/>',
    reviewer:'<path d="M14 50c2-12 8-26 24-38 4-3 9-4 12-2-1 4-3 8-7 11 4 0 7 1 9 4-12 10-22 16-30 18z" fill="#fff"/><path d="M38 12c4-3 9-4 12-2-1 4-3 8-7 11 4 0 7 1 9 4-8 7-15 12-21 15z" fill="rgba(255,255,255,.82)"/><path d="M44 38l1.8 4 4.2.4-3.2 2.8 1 4.2-3.8-2.3-3.8 2.3 1-4.2-3.2-2.8 4.2-.4z" fill="#ffd15c"/>',
    foodie:'<path d="M10 32h36a18 18 0 0 1-18 16 18 18 0 0 1-18-16z" fill="#fff"/><path d="M28 32h18a18 18 0 0 1-18 16z" fill="rgba(255,255,255,.82)"/><path d="M8 50h40v4H8z" fill="rgba(255,255,255,.82)"/><path d="M50 14L40 26M54 17L43 28" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M22 14c-2 4 2 6 0 10M30 14c-2 4 2 6 0 10" stroke="#FF5A4D" stroke-width="3" fill="none" stroke-linecap="round"/>',
    night:'<path d="M40 10a18 18 0 1 0 12 28A14 14 0 0 1 40 10z" fill="#fff"/><path d="M40 10a14 14 0 0 0 12 28 18 18 0 0 1-12 6z" fill="rgba(255,255,255,.82)"/><path d="M10 52c4-8 14-12 22-10" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="0.5 7"/><circle cx="26" cy="22" r="2.6" fill="#ffd15c"/>',
    nightowl:'<path d="M16 24c0-9 7-14 16-14s16 5 16 14v8c0 10-7 16-16 16s-16-6-16-16z" fill="#fff"/><path d="M16 22c-3-4-3-9-1-11 3 1 5 4 6 7M48 22c3-4 3-9 1-11-3 1-5 4-6 7" fill="#fff"/><circle cx="25" cy="28" r="6" fill="#fff"/><circle cx="39" cy="28" r="6" fill="#fff"/><circle cx="25" cy="28" r="3" fill="#7a5cff"/><circle cx="39" cy="28" r="3" fill="#7a5cff"/><path d="M29 36l3 4 3-4z" fill="#ffd15c"/>'
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
      emb(key,1.0)+'<circle cx="64" cy="64" r="40" fill="url(#sm-light)"/>'+
      '<use href="#sm-sunseal" transform="translate(64 110) scale(.7)" color="#FFE7AE"/></g>';
  }
  function frSocial(key, lite){
    var petals = loop(12, function(a){ var p=pt(64,40,a); return '<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="11" fill="url(#so-petal)" stroke="#FFE7AE" stroke-width="1.3"/>'; });
    return '<g'+drop(lite)+'>'+petals+
      '<circle cx="64" cy="64" r="40" fill="url(#so-enamel)"/><circle cx="64" cy="64" r="40" fill="none" stroke="#FFE7AE" stroke-width="2.4"/>'+
      emb(key,1.0)+'<circle cx="64" cy="64" r="40" fill="url(#sm-light)"/>'+
      '<use href="#sm-sunseal" transform="translate(64 112) scale(.7)" color="#FFE7AE"/></g>';
  }
  function frSecurite(key, lite){
    var shield='M64 8 L112 22 Q114 70 100 96 Q84 116 64 122 Q44 116 28 96 Q14 70 16 22 Z';
    var brush = lite ? '' : '<path d="'+shield+'" fill="#fff" filter="url(#se-brush)" opacity=".5"/>';
    return '<g'+drop(lite)+'><path d="'+shield+'" fill="url(#se-steel)"/>'+brush+
      '<path d="'+shield+'" fill="none" stroke="#ffd15c" stroke-width="2.4"/>'+
      '<circle cx="64" cy="60" r="34" fill="url(#se-core)"/><circle cx="64" cy="60" r="34" fill="none" stroke="#eef3f8" stroke-width="2"/>'+
      '<g transform="translate(0 -4)">'+emb(key,.92)+'</g>'+
      '<rect x="30" y="24" width="8" height="8" rx="1.6" fill="#9aa6b4" stroke="#eef3f8" stroke-width="1.2"/><rect x="90" y="24" width="8" height="8" rx="1.6" fill="#9aa6b4" stroke="#eef3f8" stroke-width="1.2"/>'+
      '<path d="'+shield+'" fill="url(#sm-light)"/><use href="#sm-sunseal" transform="translate(64 104) scale(.66)" color="#ffd15c"/></g>';
  }
  function frAccomplissement(key, lite){
    var rays = loop(16, function(a,i){ var p1=pt(64,44,a-7),p2=pt(64,62,a),p3=pt(64,44,a+7); return '<path d="M'+p1[0].toFixed(1)+' '+p1[1].toFixed(1)+' L'+p2[0].toFixed(1)+' '+p2[1].toFixed(1)+' L'+p3[0].toFixed(1)+' '+p3[1].toFixed(1)+' Z" fill="url(#ac-gold)" opacity="'+(i%2?0.7:1)+'"/>'; });
    var laurelL = loop(5, function(a,i){ var yy=44-i*15; return '<ellipse cx="26" cy="'+yy+'" rx="6" ry="3.2" fill="#C9831C" transform="rotate(-35 26 '+yy+')"/>'; });
    var laurelR = loop(5, function(a,i){ var yy=44-i*15; return '<ellipse cx="102" cy="'+yy+'" rx="6" ry="3.2" fill="#C9831C" transform="rotate(35 102 '+yy+')"/>'; });
    return '<g'+drop(lite)+'>'+rays+
      '<path d="M26 88 Q14 60 26 26" fill="none" stroke="#C9831C" stroke-width="3"/><path d="M102 88 Q114 60 102 26" fill="none" stroke="#C9831C" stroke-width="3"/>'+laurelL+laurelR+
      '<circle cx="64" cy="64" r="40" fill="url(#ac-gold)"/><circle cx="64" cy="64" r="35" fill="url(#ac-core)"/><circle cx="64" cy="64" r="35" fill="none" stroke="#FFE9A0" stroke-width="2"/>'+
      emb(key,1.0)+'<circle cx="64" cy="64" r="35" fill="url(#sm-light)"/>'+
      '<use href="#sm-sunseal" transform="translate(64 96) scale(.62)" color="#ffd15c"/></g>';
  }
  function frSecret(key, lite){
    var arches = loop(12, function(a){ var p=pt(64,42,a); return '<circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="2.4" fill="none" stroke="url(#lg-irid)" stroke-width="1.2"/>'; });
    var stars = lite ? '' : '<circle cx="64" cy="64" r="44" fill="#fff" filter="url(#lg-stars)"/>';
    var rays = loop(4, function(a){ var p1=pt(64,70,a-4),p2=pt(64,70,a+4); return '<path d="M64 64 L'+p1[0].toFixed(1)+' '+p1[1].toFixed(1)+' L'+p2[0].toFixed(1)+' '+p2[1].toFixed(1)+' Z" fill="url(#lg-irid)"/>'; });
    var anim = lite ? '' : '<animateTransform attributeName="transform" type="rotate" from="0 64 64" to="360 64 64" dur="22s" repeatCount="indefinite"/>';
    var haloAnim = lite ? '' : '<animate attributeName="r" values="48;53;48" dur="3.2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;.45;.9" dur="3.2s" repeatCount="indefinite"/>';
    return '<g'+drop(lite)+'>'+
      '<g opacity=".5"><g>'+rays+anim+'</g></g>'+
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
      '<use href="#sm-sunseal" transform="translate(64 64) scale(.5)" color="#7a5cff" opacity=".6"/></g>';
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
