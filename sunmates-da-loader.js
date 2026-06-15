/* ============================================================
   SunMates — DA Loader (runtime)
   Lit les tokens DA (Supabase da_tokens, sinon brouillon localStorage)
   et les applique : VARIABLES-CŒUR par mode (fonds/textes/accents/cartes),
   joyaux, emblèmes, tailles, effets, polices, couleurs de police, logos, textes.
   Inclure APRÈS sunmates-icons-v2.js et le gros script de l'app :
     <script src="sunmates-da-loader.js?v=4"></script>
   ============================================================ */
(function () {
  function getTokens() {
    try { if (window.SM_DA_TOKENS) return window.SM_DA_TOKENS; } catch (e) {}
    try { var d = localStorage.getItem('sm_da_live'); if (d) return JSON.parse(d); } catch (e) {}
    return null;
  }
  function getStrings() {
    try { if (window.SM_DA_STRINGS) return window.SM_DA_STRINGS; } catch (e) {}
    try { var d = localStorage.getItem('sm_strings_live'); if (d) return JSON.parse(d); } catch (e) {}
    return null;
  }
  function inject(id, css) {
    var s = document.getElementById(id);
    if (!s) { s = document.createElement('style'); s.id = id; document.head.appendChild(s); }
    s.textContent = css;
  }
  function modeSelector(m) {
    // .sm-da-on = posé par le loader dès qu'un preset est actif → +1 de spécificité
    // pour que TOUTES les règles du loader battent la couche figée "DA v2" de l'app.
    if (!m.class) return 'body.sm-da-on:not(.theme-dusk):not(.theme-winter):not(.theme-tropic)';
    return 'body.sm-da-on.' + m.class.trim().split(/\s+/).join('.');
  }
  // ---- Helpers couleur (dérivation des variables-cœur) ----
  function _hx(h){
    h=String(h||'').trim(); if(h[0]==='#')h=h.slice(1);
    if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var n=parseInt(h,16);
    return (h.length===6&&!isNaN(n))?[(n>>16)&255,(n>>8)&255,n&255]:null;
  }
  function _hex(a){
    return '#'+a.map(function(v){v=Math.max(0,Math.min(255,Math.round(v)));return (v<16?'0':'')+v.toString(16);}).join('');
  }
  function _mix(a,b,t){
    var A=_hx(a),B=_hx(b); if(!A||!B)return a;
    return _hex([A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t]);
  }
  function _rgba(a,al){var A=_hx(a);return A?('rgba('+A[0]+','+A[1]+','+A[2]+','+al+')'):a;}
  function _lum(a){
    var A=_hx(a); if(!A)return 1;
    var c=A.map(function(v){v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});
    return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2];
  }
  function _ratio(a,b){var L1=_lum(a),L2=_lum(b),hi=Math.max(L1,L2),lo=Math.min(L1,L2);return (hi+0.05)/(lo+0.05);}
  function _toC(c,bg,target){ // pousse c vers noir/blanc jusqu'a atteindre le ratio WCAG vs bg
    var dest=_lum(bg)>0.4?'#000000':'#ffffff', out=c, t=0;
    while(_ratio(out,bg)<target && t<16){ out=_mix(out,dest,0.08); t++; }
    return out;
  }
  function _bestAccent(j1,j2,page){var c=_ratio(j1,page)>=_ratio(j2,page)?j1:j2;return _toC(c,page,4.5);}
  function _card(page){return _lum(page)>0.4?_mix(page,'#ffffff',0.6):_mix(page,'#ffffff',0.08);}
  // ---- HSL (pour DÉRIVER une palette d'emblèmes harmonisée avec les joyaux du preset) ----
  function _rgb2hsl(hex){var a=_hx(hex);if(!a)return[0,0,0.5];var r=a[0]/255,g=a[1]/255,b=a[2]/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,h=0,s=0;if(mx!==mn){var d=mx-mn;s=l>0.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h/=6;}return[h*360,s,l];}
  function _hsl2hex(h,s,l){h=(((h%360)+360)%360)/360;s=Math.max(0,Math.min(1,s));l=Math.max(0,Math.min(1,l));function f(p,q,t){if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;}var r,g,b;if(s===0){r=g=b=l;}else{var q=l<0.5?l*(1+s):l+s-l*s,p=2*l-q;r=f(p,q,h+1/3);g=f(p,q,h);b=f(p,q,h-1/3);}return _hex([r*255,g*255,b*255]);}
  // rôle sémantique d'une catégorie d'emblème (pour faire varier L/S sans partir en arc-en-ciel)
  function _iccRole(c){c=String(c||'').toLowerCase();
    if(/alert|report|sos|danger|warn|aid|secu|urgent|shield|block|risk/.test(c))return 'alert';
    if(/medal|crown|rank|trophy|coupon|badge|star|gift|premium|coin|reward|xp|level|prize/.test(c))return 'reward';
    if(/quest|game|play|popular|trip|map|target|rocket|bolt|fire|explore|compass|pin|nav/.test(c))return 'action';
    if(/eco|leaf|coffee|clock|moon|sleep|home|heart|calm|tea|plant|nature|water/.test(c))return 'calm';
    return 'neutral';}
  // palette d'emblèmes dérivée des joyaux du mode : 1 seule teinte-pilier + variation L/S par rôle
  // (alerte gardée chaude/reconnaissable). Contraste assuré sur la tuile (fond ≈ mix j1/j2).
  function _deriveIcc(j1,j2,page){
    var base=_rgb2hsl(j1),dark=_lum(page)<0.4,tile=_mix(j1,j2,0.5);
    function tone(dh,s,lL,lD){return _toC(_hsl2hex(base[0]+dh,s,dark?lD:lL),tile,2.6);}
    return {
      neutral:tone(0,0.26,0.40,0.82),
      action:tone(0,0.70,0.46,0.76),
      reward:tone(20,0.76,0.50,0.74),
      calm:tone(-26,0.44,0.44,0.78),
      alert:_toC(_hsl2hex(13,0.80,dark?0.66:0.50),tile,2.6)
    };
  }
  var _ICC_CATS=['quest','games','popular','trip','map','explore','eco','coffee','clock','home','heart','chat','users','near','search','medal','crown','rank','coupon','badge','star','premium','coin','alert','report','aid','secu','shield','photo','music','gift','calendar','settings'];

  function applyTokens(T) {
    if (!T || !T.modes) return;
    try { document.body.classList.add('sm-da-on'); } catch (e) {} // priorité loader > couche figée
    var css = '';
    Object.keys(T.modes).forEach(function (k) {
      var m = T.modes[k], sel = modeSelector(m);
      // TOUTES les tuiles (cic/jo-ic/qm-ic/sc-ic/smgem/thumb, avec ou sans data-smicon) suivent
      // les joyaux du preset, dans TOUS les modes. !important pour battre les blocs nuit/saison en dur.
      // Tuiles/emblèmes : on GARDE l'identité par FAMILLE (corail solo, violet jeux…) mais on
      // décale chaque famille vers la teinte du preset → distinctes ET suivent la DA (pas aplaties).
      // (n'écrit que --ic1/--ic2 = le dégradé ; aucun filtre → les emojis dans les tuiles intacts.)
      var _sh = _rgb2hsl(m.j1)[0] - 24; // 24 ≈ teinte sunset de base des familles de tuiles
      function _shift(hex){var h=_rgb2hsl(hex);return _hsl2hex(h[0]+_sh,h[1],h[2]);}
      var _FAM={green:['#2BC4A8','#128F7C'],blue:['#5E74E8','#3641B8'],purp:['#9B7BFF','#6638D6'],coral:['#FF9A5C','#E8631F'],lime:['#FFC93C','#D98414'],indigo:['#8A5CFF','#5028B0'],rose:['#FF6FA5','#D63A78'],gold:['#FFC93C','#E8961F'],teal:['#4ED8B8','#149E8C'],red:['#FF5A4D','#C9281F']};
      Object.keys(_FAM).forEach(function(f){css += sel+' .thumb.'+f+'{--ic1:'+_shift(_FAM[f][0])+' !important;--ic2:'+_shift(_FAM[f][1])+' !important;}\n';});
      var _CIC={'c-green':['#4ED8B8','#149E8C'],'c-blue':['#9D86FF','#5E3FE0'],'c-purp':['#b9a6ff','#7c5cff'],'c-gold':['#FFD15C','#F4A11E'],'c-pink':['#ffa7d1','#ff5e9f']};
      Object.keys(_CIC).forEach(function(c){css += sel+' .cic.'+c+'{--ic1:'+_shift(_CIC[c][0])+' !important;--ic2:'+_shift(_CIC[c][1])+' !important;}\n';});
      // emblèmes/gems « mono » (jeux/scènes/gemme de mode) : suivent directement le preset
      ['.jo-ic', '.qm-ic', '.sc-ic', '.smgem'].forEach(function (cl) {
        css += sel + ' ' + cl + '{--ic1:' + m.j1 + ' !important;--ic2:' + m.j2 + ' !important;}\n';
      });
      if (T.logos && T.logos[k]) css += sel + '{--sm-logo:' + T.logos[k] + ';}\n';
      // Variables-coeur : font bouger fonds/textes/accents/CTA/cartes dans TOUTE l'app.
      if (m.page || m.ink) {
        var pg = m.page || '#ffffff', ink = m.ink || '#222222';
        var ang = (m.angle != null ? m.angle : 160);
        var grad = m.j3 ? ('linear-gradient(' + ang + 'deg,' + m.j1 + ',' + m.j3 + ',' + m.j2 + ')')
                        : ('linear-gradient(' + ang + 'deg,' + m.j1 + ',' + m.j2 + ')');
        var acc = _bestAccent(m.j1, m.j2, pg);          // accent garanti >=4.5:1 sur la page
        var text = _mix(ink, pg, 0.16);
        var card = _card(pg);
        var lite = _lum(card) >= _lum(pg) ? card : pg;  // surface la plus claire (page OU carte)
        var accInk = _toC(acc, lite, 4.6);              // accent-texte lisible sur page ET carte
        var muted = _toC(_mix(ink, pg, 0.42), lite, 4.6); // texte secondaire idem
        var sc = (T.scenes && T.scenes.accent) || acc;
        // texte CTA : on prend la MEILLEURE encre (blanc vs sombre) vs le milieu du dégradé, et on
        // l'assombrit jusqu'à WCAG → fini le blanc illisible sur les presets clairs/pastel (audit).
        var _tmid = _mix(m.j1, m.j2, 0.5);
        var btnTxt = _ratio('#ffffff', _tmid) >= _ratio('#2a1c10', _tmid) ? '#ffffff' : _toC('#2a1c10', _tmid, 4.5);
        // hsel = sel + 2 :not() factices (+0,2,0 de spécificité) → bat les blocs nuit/saison
        // de l'app qui utilisent body.theme-dusk:not(.theme-winter):not(.theme-tropic) (0,3,1).
        var hsel = sel + ':not(._smx):not(._smy)';
        css += hsel + '{';
        css += '--bg:' + pg + ';';
        css += '--bg-grad:radial-gradient(135% 90% at 50% -10%,' + _mix(pg, acc, 0.10) + ' 0%,' + pg + ' 60%);';
        css += '--ink:' + ink + ';--ink-warm:' + ink + ';';
        css += '--text:' + text + ';';
        css += '--muted:' + muted + ';';
        css += '--line:' + _mix(ink, pg, 0.86) + ';';
        css += '--card:' + card + ';--paper:' + _mix(pg, ink, 0.03) + ';';
        // surfaces "sombres" (cartes/nav/feed en nuit & saison) derivees du preset -> la nuit suit la DA
        css += '--dcard:' + _mix(pg, ink, 0.06) + ';--dcard2:' + _mix(pg, ink, 0.04) + ';--dcard3:' + _mix(pg, ink, 0.10) + ';--dcard4:' + _mix(pg, ink, 0.02) + ';--dcard5:' + pg + ';';
        css += '--cream:' + _mix(pg, acc, 0.06) + ';';
        css += '--accent:' + acc + ';--accent-ink:' + accInk + ';';
        css += '--retro-teal:' + accInk + ';'; // liens d'action (.section-head a/.fcta) : suivent l'accent au lieu du vert figé
        css += '--accent-2:' + m.j1 + ';--accent-3:' + m.j2 + ';';
        css += '--accent-grad:' + grad + ';';
        css += '--accent-soft:' + _rgba(acc, 0.14) + ';';
        css += '--ring:0 0 0 4px ' + _rgba(acc, 0.18) + ';';
        css += '--sm-scene-accent:' + sc + ';--sm-btn-text:' + btnTxt + ';';
        // ecran de connexion / landing (namespace --lp-*) : suit le preset au lieu de rester sunset
        css += '--lp-bg:' + pg + ';--lp-paper:' + card + ';--lp-ink:' + ink + ';--lp-text:' + text + ';--lp-muted:' + muted + ';--lp-accent:' + acc + ';--lp-grad:' + grad + ';';
        css += '}\n';
        // Badges joaillerie (SMBadge) : on PRÉSERVE l'art ciselé (dégradés/relief) mais on
        // tourne la teinte vers la DA du mode -> les médaillons suivent le preset (Sunset ≈ inchangé).
        var _bh = Math.round(_rgb2hsl(m.j1)[0] - 38); // 38 = teinte "sunset" native de l'art des badges
        css += sel + ' .smbadge-svg,' + sel + ' .sm-badge svg{filter:hue-rotate(' + _bh + 'deg);}\n';
        // PINS CARTE : les marqueurs génériques suivent l'accent du preset (toi/.me + quête/.quest gardent leur sémantique)
        css += sel + ' .epin:not(.me):not(.quest){--epin:' + acc + ';}\n';
        // CARTE (fond vectoriel) : si la carte expose ces variables, l'eau/la terre suivent la DA
        css += sel + ' .homemap-card,' + sel + ' .leaflet-container{--sm-map-bg:' + _mix(pg, acc, 0.06) + ';}\n';
      }
    });
    // Formes + tailles des tuiles + couleur des logos (consommation globale par le CSS)
    var _shp = (T.effects && T.effects.shape) || 'squircle';
    var _rad = _shp === 'circle' ? '50%' : (_shp === 'rounded' ? '16px' : '28%');
    css += '.thumb,.cic,.smgem,.jo-ic{border-radius:' + _rad + ' !important;}\n';
    // Arrondi GLOBAL (cartes/boutons/inputs) : --radius/-sm/-lg pilotés (≈32 consommateurs dans l'app)
    var _er = (T.effects && T.effects.radius) || 22;
    css += ':root{--radius:' + _er + 'px;--radius-sm:' + Math.round(_er * 0.64) + 'px;--radius-lg:' + Math.round(_er * 1.27) + 'px;}\n';
    // Reflet des tuiles (sheen %) : consommé par .cic::before via var(--sm-sheen)
    if (T.effects && T.effects.sheen != null) css += ':root{--sm-sheen:' + (Math.max(0, Math.min(100, +T.effects.sheen)) / 100) + ';}\n';
    if (T.sizes) {
      var _t = T.sizes.tile || 74, _i = T.sizes.iconTile || 38;
      // l'emoji NATIF est du texte → on le dimensionne via font-size (et on centre) pour qu'il
      // SUIVE la taille de la tuile (sinon le fond grossit mais l'emoji par-dessus reste petit).
      css += '.tile .thumb{width:' + _t + 'px;height:' + _t + 'px;font-size:' + _i + 'px;line-height:1;display:grid;place-items:center;}\n';
      css += '.tile .thumb svg,.tile .thumb .smicon svg{width:' + _i + 'px !important;height:' + _i + 'px !important;}\n';
    }
    css += '.brand .mark svg line,.brand .mark svg path,.brand .mark svg polyline{stroke:var(--sm-logo,#fff);}\n';
    css += '.brand .mark svg circle,.brand .mark svg polygon{fill:var(--sm-logo,#fff);}\n';
    // texte des CTA : suit --sm-btn-text (auto par mode, lisible sur le degrade), surchargeable par comp.btnText
    css += '.btn-primary,.fc-send,button.cta{color:var(--sm-btn-text,#fff);}\n';
    if (T.comp) {
      var ct = '';
      if (T.comp.btnText) ct += '.btn-primary,.fc-send,button.cta,.su-call{color:' + T.comp.btnText + ' !important;}\n';
      if (T.comp.chipText) ct += '.chip.active{color:' + T.comp.chipText + ';}\n';
      inject('sm-da-comp', ct);
    }
    try { window.SM_IMGBANK = T.imgBank || null; } catch (e) {}
    try { window.SM_SCENES = T.scenes || null; } catch (e) {} // confettis / pluie de saison (toggles lus par l'app)
    // Médaillons de badges (.hex) pilotés par famille — les vrais emblèmes SMBadge gardent leur DA propre
    if (T.badges) {
      var bd = T.badges, gp = function (x, i, d) { return (x && x[i]) || d; };
      css += '.hex.grad-violet{--c1:' + gp(bd.social, 0, '#b9a6ff') + ';--c2:' + gp(bd.social, 1, '#7c5cff') + ';}\n';
      css += '.hex.grad-teal{--c1:' + gp(bd.securite, 0, '#34d3c0') + ';--c2:' + gp(bd.securite, 1, '#0fa99b') + ';}\n';
      css += '.hex.grad-gold{--c1:' + gp(bd.accomplissement, 0, '#ffd15c') + ';--c2:' + gp(bd.accomplissement, 1, '#e8961f') + ';}\n';
      if (bd.exploration) css += '.hex:not(.grad-violet):not(.grad-gold):not(.grad-teal){--c1:' + gp(bd.exploration, 0, '#ff8a5c') + ';--c2:' + gp(bd.exploration, 1, '#ff5a4d') + ';background:linear-gradient(135deg,var(--c1),var(--c2));}\n';
    }
    try {
      var _st = (T.icon && T.icon.style) || 'fill';
      window.SM_ICON_STYLE = _st;
      try { localStorage.setItem('sm_icon_style', _st); } catch (e) {}
      document.body.classList.toggle('sm-native', _st === 'native');
      window.SM_NO_EMOJIZE = (_st === 'native') || !!(T.emoji && T.emoji.off);
      window.SM_EMOJI_KEEP = new Set((T.emoji && T.emoji.keepNative) || []);
      if (window.SMIconize) window.SMIconize(document.body);
    } catch (e) {}
    var _cm = (T.icon && T.icon.colorMode) || 'natural';
    var _styl = (T.icon && T.icon.style) || 'fill';
    if (_styl !== 'native') {
      if (_cm === 'mono') {
        css += '[data-smicon]{--icc:' + ((T.icon && T.icon.mono) || '#FFF6E9') + ';}\n';
      } else if (_cm === 'themed' && T.iconColors && Object.keys(T.iconColors).length) {
        // THÉMÉE : contrôle explicite par catégorie (couleurs éditées dans la console)
        Object.keys(T.iconColors).forEach(function (c) { css += '[data-smicon="' + c + '"]{--icc:' + T.iconColors[c] + ';}\n'; });
        if (T.icon && T.icon.perMode && T.iconColorsByMode) {
          Object.keys(T.iconColorsByMode).forEach(function (mk) {
            var mm = T.modes[mk]; if (!mm) return;
            var msel = modeSelector(mm), byc = T.iconColorsByMode[mk] || {};
            Object.keys(byc).forEach(function (c) { css += msel + ' [data-smicon="' + c + '"]{--icc:' + byc[c] + ';}\n'; });
          });
        }
      } else {
        // NATURELLE / défaut : emblèmes HARMONISÉS avec les joyaux de CHAQUE mode -> fini
        // l'arc-en-ciel figé identique sur tous les presets ; chaque preset a sa collection.
        var cats = (T.iconColors && Object.keys(T.iconColors).length) ? Object.keys(T.iconColors) : _ICC_CATS;
        Object.keys(T.modes).forEach(function (k) {
          var m = T.modes[k]; if (!m || (!m.page && !m.ink)) return;
          var msel = modeSelector(m), pal = _deriveIcc(m.j1, m.j2, m.page || '#ffffff');
          cats.forEach(function (cat) { css += msel + ' [data-smicon="' + cat + '"]{--icc:' + (pal[_iccRole(cat)] || pal.neutral) + ';}\n'; });
        });
      }
      css += '.cic[data-smicon] svg,[data-smicon] .smicon,[data-smicon] svg{color:var(--icc, currentColor);}\n';
    }
    if (T.sizes) css += ':root{--sm-tile:' + (T.sizes.tile || 74) + 'px;--sm-icon:' + (T.sizes.iconTile || 38) + 'px;}\n';
    if (T.typo) {
      var tc = T.typo.titleColor, bc = T.typo.bodyColor, mc = T.typo.metaColor, tcss = '';
      if (tc) { css += ':root{--sm-title:' + tc + ';}\n'; tcss += 'h1,h2,h3,.feature h2,.brand b,.logo-text,.t-name,.sname{color:' + tc + ';}\n'; }
      if (bc) { css += ':root{--sm-body:' + bc + ';}\n'; tcss += 'body,.bubble,.fpost-body{color:' + bc + ';}\n'; }
      if (mc) { css += ':root{--sm-meta:' + mc + ';}\n'; tcss += '.smeta,.muted,.sub,.meta,.hint,.small{color:' + mc + ';}\n'; }
      inject('sm-da-typo', tcss);
    }
    inject('sm-da-vars', css);
    if (T.fonts) {
      var f = '', fams = [];
      if (T.fonts.body) { f += "body{font-family:'" + T.fonts.body + "',system-ui,sans-serif;}\n"; fams.push(T.fonts.body); }
      if (T.fonts.heading) { f += "h1,h2,h3,.brand b,.logo-text,.feature h2,.t-name{font-family:'" + T.fonts.heading + "',serif;}\n"; fams.push(T.fonts.heading); }
      inject('sm-da-fonts', f);
      fams.forEach(function (fam) {
        if (!fam) return;
        var id = 'sm-da-font-' + fam.replace(/[^a-z0-9]/gi, '');
        if (document.getElementById(id)) return;
        var base = 'https://fonts.googleapis.com/css2?family=';
        var weights = ':wght@400;500;600;700;800;900';
        var disp = '&display=swap';
        var fam2 = encodeURIComponent(fam).replace(/%20/g, '+');
        var l = document.createElement('link');
        l.id = id; l.rel = 'stylesheet';
        l.href = base + fam2 + weights + disp;
        document.head.appendChild(l);
      });
    }
    var e = T.effects || {};
    document.body.classList.toggle('sm-no-polish', e.polish === false);
    document.body.classList.toggle('sm-mirror', !!e.mirror);
    document.body.classList.toggle('sm-no-shadow', e.shadow === false);
    document.body.classList.toggle('sm-icc', !!(T.iconColors && Object.keys(T.iconColors).length));
    if (T.a11y) document.documentElement.style.fontSize = ((T.a11y.fontScale || 100) / 100 * 16) + 'px';
  }

  function applyStrings(S) {
    if (!S) return;
    window.SM_STR = S;
    if (typeof window.i18nT === 'function' && !window.i18nT.__smPatched) {
      var orig = window.i18nT;
      window.i18nT = function (fr, vars) {
        var ov = S[fr];
        if (ov && typeof ov === 'object') {
          var lang = (typeof window.currentLang !== 'undefined' && window.currentLang === 'en');
          if (lang && ov.en != null) return interpolate(ov.en, vars);
          if (!lang && ov.fr != null) return interpolate(ov.fr, vars);
        }
        return orig.apply(this, arguments);
      };
      window.i18nT.__smPatched = true;
    }
  }
  function interpolate(s, vars) {
    if (!vars) return s;
    return s.replace(/\{(\w+)\}/g, function (_, k) { return vars[k] != null ? vars[k] : '{' + k + '}'; });
  }
  function boot() {
    try { applyTokens(getTokens()); } catch (e) {} try { applyStrings(getStrings()); } catch (e) {}
    // DA PUBLIÉE POUR TOUS : si aucun brouillon local (admin en test), on va chercher la DA publiée
    // en base (da_tokens id='live') et on l'applique → tous les utilisateurs reçoivent la DA publiée.
    try {
      if (!getTokens() && window.db && window.db.from) {
        // 1 seule ligne (id entier) → on prend la plus récente, schéma-agnostique.
        window.db.from('da_tokens').select('tokens').order('updated_at', { ascending: false }).limit(1)
          .then(function (r) { var row = r && r.data && r.data[0]; if (row && row.tokens && row.tokens.publishedLive) { try { applyTokens(row.tokens); } catch (e) {} } }) // n'applique QUE les DA publiées volontairement (garde-fou anti vieille ligne)
          .catch(function () {});
      }
    } catch (e) {}
  }
  if (document.readyState !== 'loading') boot(); else document.addEventListener('DOMContentLoaded', boot);
  // Banque d'images pilotable : renvoie l'URL configuree pour une categorie/mot-cle
  // si c'est une vraie URL (http...), sinon null (l'app garde son repli).
  window.SMImg = function (key, seed) {
    try {
      var b = window.SM_IMGBANK || {}; var v = b[key];
      if (typeof v === 'string' && /^https?:/i.test(v)) {
        var sg = encodeURIComponent(String(seed == null ? '' : seed));
        return v + (v.indexOf('?') < 0 ? ('?sig=' + sg) : ('&sig=' + sg));
      }
    } catch (e) {}
    return null;
  };
  window.SMDA = { apply: applyTokens, applyStrings: applyStrings, boot: boot,
    // dérivateurs exposés pour que l'APERÇU de la console rende EXACTEMENT comme l'app
    deriveIcc: _deriveIcc, iccRole: _iccRole, bestAccent: _bestAccent, card: _card,
    toC: _toC, mix: _mix, rgb2hsl: _rgb2hsl, badgeHueShift: function (j1) { return Math.round(_rgb2hsl(j1)[0] - 38); },
    saveDraft: function (t, strings) { try { localStorage.setItem('sm_da_live', JSON.stringify(t)); if (strings) localStorage.setItem('sm_strings_live', JSON.stringify(strings)); } catch (e) {} } };
})();
