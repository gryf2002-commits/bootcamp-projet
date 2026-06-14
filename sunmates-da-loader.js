/* ============================================================
   SunMates — DA Loader (runtime)
   Lit les tokens DA (Supabase `da_tokens`, sinon brouillon localStorage)
   et les applique à l'app : joyaux par mode, tailles, effets, polices,
   couleurs des emblèmes (si la banque est en currentColor), logos, textes.
   À inclure APRÈS sunmates-icons-v2.js et le gros script de l'app :
     <script src="sunmates-da-loader.js?v=1"></script>
   L'app peut injecter les données avant le boot :
     window.SM_DA_TOKENS  = {...}   // objet tokens (export de la console)
     window.SM_DA_STRINGS = {...}   // overrides de textes {origFR:{fr?,en?}}
   Repli automatique : localStorage 'sm_da_live' / 'sm_strings_live'
   (le bouton « Tester en live » de la console écrit ces clés).
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
  function applyTokens(T) {
    if (!T || !T.modes) return;
    var css = '';
    // 1) Joyaux uniformes par mode (l'app pilote les tuiles via --ic1/--ic2)
    Object.keys(T.modes).forEach(function (k) {
      var m = T.modes[k], sel = modeSelector(m);
      ['.cic[data-smicon]', '.jo-ic[data-smicon]', '.smgem', '.thumb'].forEach(function (cl) {
        css += sel + ' ' + cl + '{--ic1:' + m.j1 + ';--ic2:' + m.j2 + ';}\n';
      });
      // encre des logos par mode (si tu exposes --sm-logo)
      if (T.logos && T.logos[k]) css += sel + '{--sm-logo:' + T.logos[k] + ';}\n';
    });
    // 2) Couleur des emblèmes par catégorie (effet seulement si la banque est en currentColor)
    if (T.iconColors) {
      Object.keys(T.iconColors).forEach(function (c) {
        css += '[data-smicon="' + c + '"]{--icc:' + T.iconColors[c] + ';}\n';
      });
      css += '.cic[data-smicon] svg,[data-smicon] .smicon,[data-smicon] svg{color:var(--icc, currentColor);}\n';
    }
    // 3) Tailles & effets (exposés en variables, à consommer côté CSS app si besoin)
    if (T.sizes) css += ':root{--sm-tile:' + (T.sizes.tile || 74) + 'px;--sm-icon:' + (T.sizes.iconTile || 38) + 'px;}\n';
    inject('sm-da-vars', css);
    // 4) Polices
    if (T.fonts) {
      var f = '';
      if (T.fonts.body) f += "body{font-family:'" + T.fonts.body + "',system-ui,sans-serif;}\n";
      if (T.fonts.heading) f += "h1,h2,h3,.brand b,.logo-text,.feature h2,.t-name{font-family:'" + T.fonts.heading + "',serif;}\n";
      inject('sm-da-fonts', f);
    }
    // 5) Toggles d'effets (l'app peut styliser via ces classes)
    var e = T.effects || {};
    document.body.classList.toggle('sm-no-polish', e.polish === false);
    document.body.classList.toggle('sm-mirror', !!e.mirror);
    document.body.classList.toggle('sm-no-shadow', e.shadow === false);
    if (T.a11y) document.documentElement.style.fontSize = ((T.a11y.fontScale || 100) / 100 * 16) + 'px';
  }
  // ---- Textes : override de i18nT (clé = FR d'origine) ----
  function applyStrings(S) {
    if (!S) return;
    window.SM_STR = S;
    if (typeof window.i18nT === 'function' && !window.i18nT.__smPatched) {
      var orig = window.i18nT;
      var en = (typeof window.currentLang !== 'undefined' && window.currentLang === 'en');
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
  // API publique : l'admin appelle SMDA.apply(tokens) pour aperçu instantané
  window.SMDA = { apply: applyTokens, applyStrings: applyStrings, boot: boot,
    saveDraft: function (t, strings) { try { localStorage.setItem('sm_da_live', JSON.stringify(t)); if (strings) localStorage.setItem('sm_strings_live', JSON.stringify(strings)); } catch (e) {} } };
})();
