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
    if (!m.class) return 'body:not(.theme-dusk):not(.theme-winter):not(.theme-tropic)';
    return 'body.' + m.class.trim().split(/\s+/).join('.');
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
  function _bestAccent(j1,j2,page){return _ratio(j1,page)>=_ratio(j2,page)?j1:j2;}
  function _card(page){return _lum(page)>0.4?_mix(page,'#ffffff',0.6):_mix(page,'#ffffff',0.08);}

  function applyTokens(T) {
    if (!T || !T.modes) return;
    var css = '';
    Object.keys(T.modes).forEach(function (k) {
      var m = T.modes[k], sel = modeSelector(m);
      ['.cic[data-smicon]', '.jo-ic[data-smicon]', '.smgem', '.thumb'].forEach(function (cl) {
        css += sel + ' ' + cl + '{--ic1:' + m.j1 + ';--ic2:' + m.j2 + ';}\n';
      });
      if (T.logos && T.logos[k]) css += sel + '{--sm-logo:' + T.logos[k] + ';}\n';
      // Variables-coeur : font bouger fonds/textes/accents/CTA/cartes dans TOUTE l'app.
      if (m.page || m.ink) {
        var pg = m.page || '#ffffff', ink = m.ink || '#222222';
        var ang = (m.angle != null ? m.angle : 160);
        var grad = 'linear-gradient(' + ang + 'deg,' + m.j1 + ',' + m.j2 + ')';
        var acc = _bestAccent(m.j1, m.j2, pg);
        var sc = (T.scenes && T.scenes.accent) || acc;
        css += sel + '{';
        css += '--bg:' + pg + ';';
        css += '--ink:' + ink + ';';
        css += '--text:' + _mix(ink, pg, 0.16) + ';';
        css += '--muted:' + _mix(ink, pg, 0.42) + ';';
        css += '--line:' + _mix(ink, pg, 0.86) + ';';
        css += '--card:' + _card(pg) + ';';
        css += '--cream:' + _mix(pg, acc, 0.06) + ';';
        css += '--accent:' + acc + ';';
        css += '--accent-2:' + m.j1 + ';--accent-3:' + m.j2 + ';';
        css += '--accent-grad:' + grad + ';';
        css += '--accent-soft:' + _rgba(acc, 0.14) + ';';
        css += '--ring:0 0 0 4px ' + _rgba(acc, 0.18) + ';';
        css += '--sm-scene-accent:' + sc + ';';
        css += '}\n';
      }
    });
    // Formes + tailles des tuiles + couleur des logos (consommation globale par le CSS)
    var _shp = (T.effects && T.effects.shape) || 'squircle';
    var _rad = _shp === 'circle' ? '50%' : (_shp === 'rounded' ? '16px' : '28%');
    css += '.thumb,.cic,.smgem,.jo-ic{border-radius:' + _rad + ' !important;}\n';
    if (T.sizes) {
      var _t = T.sizes.tile || 74, _i = T.sizes.iconTile || 38;
      css += '.tile .thumb{width:' + _t + 'px;height:' + _t + 'px;}\n';
      css += '.tile .thumb svg,.tile .thumb .smicon svg{width:' + _i + 'px !important;height:' + _i + 'px !important;}\n';
    }
    css += '.brand .mark svg line,.brand .mark svg path,.brand .mark svg polyline{stroke:var(--sm-logo,#fff);}\n';
    css += '.brand .mark svg circle,.brand .mark svg polygon{fill:var(--sm-logo,#fff);}\n';
    if (T.comp) {
      var ct = '';
      if (T.comp.btnText) ct += '.btn-primary,.fc-send,button.cta,.su-call{color:' + T.comp.btnText + ';}\n';
      if (T.comp.chipText) ct += '.chip.active{color:' + T.comp.chipText + ';}\n';
      inject('sm-da-comp', ct);
    }
    try { window.SM_IMGBANK = T.imgBank || null; } catch (e) {}
    try {
      window.SM_NO_EMOJIZE = !!(T.emoji && T.emoji.off);
      window.SM_EMOJI_KEEP = new Set((T.emoji && T.emoji.keepNative) || []);
      if (window.SMIconize) window.SMIconize(document.body);
    } catch (e) {}
    if (T.iconColors) {
      Object.keys(T.iconColors).forEach(function (c) {
        css += '[data-smicon="' + c + '"]{--icc:' + T.iconColors[c] + ';}\n';
      });
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
  function boot() { try { applyTokens(getTokens()); } catch (e) {} try { applyStrings(getStrings()); } catch (e) {} }
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
    saveDraft: function (t, strings) { try { localStorage.setItem('sm_da_live', JSON.stringify(t)); if (strings) localStorage.setItem('sm_strings_live', JSON.stringify(strings)); } catch (e) {} } };
})();
