/* ============================================================
   SunMates — icônes "maison" (UI) dans la DA coucher de soleil.
   API : window.SMIcon(name, {size}) -> string SVG
         window.SMIconRender(root)   -> remplit [data-smicon] et .search .ico
   ============================================================ */
(function () {
  var DEFS = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
    '<linearGradient id="sm-ico-sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF8A3D"/><stop offset="1" stop-color="#FF5A4D"/></linearGradient>' +
    '</defs></svg>';
  function injectDefs() {
    if (document.getElementById('sm-icon-defs')) return;
    var d = document.createElement('div');
    d.id = 'sm-icon-defs';
    d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    d.innerHTML = DEFS;
    (document.body || document.documentElement).appendChild(d);
  }

  var ICONS = {
    coffee: { style:'tile', svg:'<path d="M9 13.5h12.5a1.5 1.5 0 0 1 1.5 1.5v3.5a6.5 6.5 0 0 1-6.5 6.5h-2A6.5 6.5 0 0 1 8 18.5V14.5A1 1 0 0 1 9 13.5Z" fill="#fff"/><path d="M22.5 14.6h1.4a2.6 2.6 0 0 1 0 5.2h-1.1" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2.4" stroke-linecap="round"/><path d="M12.5 5.5c-1 1.2-1 2.3 0 3.5M16 5c-1 1.2-1 2.3 0 3.5M19.5 5.5c-1 1.2-1 2.3 0 3.5" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2.4" stroke-linecap="round"/>' },
    eco: { style:'tile', svg:'<path d="M25 6c0 9-4 15-12.5 15.5C9 21.7 7 19 7 15.5 7 9.6 12.6 6.5 25 6Z" fill="#fff"/><path d="M7.5 26c2-6 6-11 14-17" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2.6" stroke-linecap="round"/><path d="M12 16.5c2 .3 4-.3 5.5-1.8M16 11.2c1.6.3 3.2-.1 4.6-1.2" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2.2" stroke-linecap="round"/>' },
    near: { style:'tile', svg:'<path d="M16 4.5c-4.7 0-8.5 3.7-8.5 8.3 0 5.8 6.6 12.4 8 13.7a.7.7 0 0 0 1 0c1.4-1.3 8-7.9 8-13.7 0-4.6-3.8-8.3-8.5-8.3Z" fill="#fff"/><circle cx="16" cy="12.8" r="3.4" fill="rgba(255,255,255,.85)"/><circle cx="16" cy="12.8" r="3.4" fill="none" stroke="#fff" stroke-width="1.6"/>' },
    rating: { style:'tile', svg:'<path d="M16 4.5l3.1 6.6 7.1.9c1 .1 1.4 1.3.7 2l-5.2 4.9 1.4 7c.2 1-.9 1.8-1.8 1.3L16 23.9l-6.3 3.3c-.9.5-2-.3-1.8-1.3l1.4-7-5.2-4.9c-.7-.7-.3-1.9.7-2l7.1-.9Z" fill="#fff"/><path d="M16 9.5l1.9 4 .5 1" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2.2" stroke-linecap="round"/>' },
    popular: { style:'tile', svg:'<path d="M16 3.5c1 4-2.5 5.5-4.5 8.5C9 15.6 8 18.4 8 21c0 4.6 3.6 7.5 8 7.5s8-2.9 8-7.5c0-3.8-2.3-6.5-4.3-9.2-.9 1.3-2 2-3.2 1.4 2-3.2.5-7-.5-9.7Z" fill="#fff"/><path d="M16 18c1.2 1 1.8 2.2 1.8 3.6 0 1.9-1.6 3-3.6 3" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2.4" stroke-linecap="round"/>' },
    quest: { style:'tile', svg:'<circle cx="16" cy="16" r="11.5" fill="#fff"/><circle cx="16" cy="16" r="7" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2.6"/><circle cx="16" cy="16" r="2.6" fill="rgba(255,255,255,.85)"/>' },
    games: { style:'tile', svg:'<path d="M10.5 10.5h11c3 0 5 2.3 5.6 5.4l.7 4.1c.4 2.4-1.3 4.5-3.6 4.5-1.4 0-2.3-.8-3-1.8l-.9-1.3a2 2 0 0 0-1.6-.9h-5.4a2 2 0 0 0-1.6.9l-.9 1.3c-.7 1-1.6 1.8-3 1.8-2.3 0-4-2.1-3.6-4.5l.7-4.1c.6-3.1 2.6-5.4 5.6-5.4Z" fill="#fff"/><path d="M10.5 15v4M8.5 17h4" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2.4" stroke-linecap="round"/><circle cx="20.5" cy="15.5" r="1.6" fill="rgba(255,255,255,.85)"/><circle cx="23.5" cy="18.5" r="1.6" fill="rgba(255,255,255,.85)"/>' },
    medal: { style:'tile', svg:'<path d="M11 4.5l3 7.5M21 4.5l-3 7.5" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2.8" stroke-linecap="round"/><circle cx="16" cy="19.5" r="8.5" fill="#fff"/><path d="M16 14.5l1.5 3.1 3.4.5-2.5 2.4.6 3.4-3-1.6-3 1.6.6-3.4-2.5-2.4 3.4-.5Z" fill="rgba(255,255,255,.85)"/>' },
    coupon: { style:'tile', svg:'<path d="M5 11.5h22a1 1 0 0 1 1 1v2.2a2.3 2.3 0 0 0 0 4.6v2.2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2.2a2.3 2.3 0 0 0 0-4.6V12.5a1 1 0 0 1 1-1Z" fill="#fff"/><path d="M16 12.5v2M16 18v2M16 23.5v1" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2.2" stroke-linecap="round"/>' },
    rank: { style:'tile', svg:'<path d="M10 5.5h12v6a6 6 0 0 1-12 0Z" fill="#fff"/><path d="M10 7.5H6.5v1.5a3.5 3.5 0 0 0 3.5 3.5M22 7.5h3.5v1.5a3.5 3.5 0 0 1-3.5 3.5" fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2.4" stroke-linecap="round"/><path d="M16 17.5v4" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round"/><path d="M11 27.5c0-2.2 2.2-3.5 5-3.5s5 1.3 5 3.5Z" fill="#fff"/>' },
    search: { style:'warm', svg:'<circle cx="14" cy="14" r="8.5" fill="url(#sm-ico-sun)"/><circle cx="14" cy="14" r="4.4" fill="#fff" opacity=".9"/><path d="M20.5 20.5l5.5 5.5" fill="none" stroke="url(#sm-ico-sun)" stroke-width="3.4" stroke-linecap="round"/><circle cx="11.6" cy="11.6" r="1.4" fill="#ffd15c"/>' },
    bell: { style:'warm', svg:'<path d="M16 4.5c-4.4 0-7 3-7 7.2 0 5-1.8 7-3 8.4-.6.7-.1 1.9.8 1.9h18.4c.9 0 1.4-1.2.8-1.9-1.2-1.4-3-3.4-3-8.4 0-4.2-2.6-7.2-7-7.2Z" fill="url(#sm-ico-sun)"/><path d="M13 25c.4 1.8 1.6 2.8 3 2.8s2.6-1 3-2.8Z" fill="#ffd15c"/><circle cx="16" cy="4" r="2.1" fill="#19b36b"/>' }
  };

  window.SMIcon = function (name, opts) {
    injectDefs();
    opts = opts || {};
    var ic = ICONS[name]; if (!ic) return '';
    var size = opts.size || (ic.style === 'warm' ? 20 : 26);
    return '<svg class="smicon smicon-' + name + '" viewBox="0 0 32 32" width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:block">' + ic.svg + '</svg>';
  };
  window.SMIcon.has = function (name) { return !!ICONS[name]; };

  function render(root) {
    injectDefs();
    var r = root || document;
    r.querySelectorAll('[data-smicon]').forEach(function (el) {
      var n = el.getAttribute('data-smicon'); if (!ICONS[n] || el.getAttribute('data-smdone')) return;
      var s = parseInt(el.getAttribute('data-smicon-size'), 10) || (ICONS[n].style === 'warm' ? 20 : 26);
      el.innerHTML = window.SMIcon(n, { size: s });
      el.setAttribute('data-smdone', '1');
    });
    // toutes les barres de recherche (loupe) d'un coup
    r.querySelectorAll('.search > .ico').forEach(function (el) {
      if (el.getAttribute('data-smdone')) return;
      el.innerHTML = window.SMIcon('search', { size: 18 });
      el.setAttribute('data-smdone', '1');
    });
  }
  window.SMIconRender = render;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { render(); });
  else render();
})();
