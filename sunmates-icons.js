/* ============================================================
   SunMates — icônes "maison" (UI) dans la DA coucher de soleil.
   API : window.SMIcon(name, {size}) -> string SVG
         window.SMIconRender(root)   -> remplit [data-smicon] et .search .ico
   ============================================================ */
(function () {
  var DEFS = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
    '<linearGradient id="sm-ico-sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF9D3D"/><stop offset="1" stop-color="#FF5A4D"/></linearGradient>' +
    '<linearGradient id="sm-ico-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFCD4E"/><stop offset="1" stop-color="#E8961F"/></linearGradient>' +
    '<linearGradient id="sm-ico-teal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#46d6b0"/><stop offset="1" stop-color="#1f9e8c"/></linearGradient>' +
    '<linearGradient id="sm-ico-violet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a98fff"/><stop offset="1" stop-color="#7a5cff"/></linearGradient>' +
    '<radialGradient id="sm-ico-gloss" cx="36%" cy="26%" r="50%"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
    '<linearGradient id="sm-ico-iv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFBF5"/><stop offset="1" stop-color="#FFE6CC"/></linearGradient>' +
    '<filter id="sm-ico-drop" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="1" stdDeviation="0.9" flood-color="#7a2415" flood-opacity="0.4"/></filter>' +
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
    coffee: { style:'tile', svg:'<path d="M9 13.5h12.5a1.5 1.5 0 0 1 1.5 1.5v3.5a6.5 6.5 0 0 1-6.5 6.5h-2A6.5 6.5 0 0 1 8 18.5V14.5A1 1 0 0 1 9 13.5Z" fill="url(#sm-ico-iv)"/><path d="M22.5 14.6h1.4a2.6 2.6 0 0 1 0 5.2h-1.1" fill="none" stroke="#E8961F" stroke-width="2.4" stroke-linecap="round"/><path d="M12.5 6c-1 1.2-1 2.3 0 3.5M16 5.5c-1 1.2-1 2.3 0 3.5M19.5 6c-1 1.2-1 2.3 0 3.5" fill="none" stroke="#ffd15c" stroke-width="2.4" stroke-linecap="round"/>' },
    eco: { style:'tile', svg:'<path d="M25 6c0 9-4 15-12.5 15.5C9 21.7 7 19 7 15.5 7 9.6 12.6 6.5 25 6Z" fill="url(#sm-ico-iv)"/><path d="M7.5 26c2-6 6-11 14-17" fill="none" stroke="#E8961F" stroke-width="2.2" stroke-linecap="round" opacity=".7"/><path d="M12 16.5c2 .3 4-.3 5.5-1.8" fill="none" stroke="#E8961F" stroke-width="1.8" stroke-linecap="round" opacity=".55"/>' },
    near: { style:'tile', svg:'<path d="M16 4.5c-4.7 0-8.5 3.7-8.5 8.3 0 5.8 6.6 12.4 8 13.7a.7.7 0 0 0 1 0c1.4-1.3 8-7.9 8-13.7 0-4.6-3.8-8.3-8.5-8.3Z" fill="url(#sm-ico-iv)"/><circle cx="16" cy="12.8" r="3.4" fill="#ffd15c"/>' },
    rating: { style:'tile', svg:'<path d="M16 4.5l3.1 6.6 7.1.9c1 .1 1.4 1.3.7 2l-5.2 4.9 1.4 7c.2 1-.9 1.8-1.8 1.3L16 23.9l-6.3 3.3c-.9.5-2-.3-1.8-1.3l1.4-7-5.2-4.9c-.7-.7-.3-1.9.7-2l7.1-.9Z" fill="url(#sm-ico-iv)"/><path d="M16 9l2 4.2 1 .2" fill="none" stroke="#E8961F" stroke-width="1.6" stroke-linecap="round" opacity=".5"/>' },
    popular: { style:'tile', svg:'<path d="M16 3.5c1 4-2.5 5.5-4.5 8.5C9 15.6 8 18.4 8 21c0 4.6 3.6 7.5 8 7.5s8-2.9 8-7.5c0-3.8-2.3-6.5-4.3-9.2-.9 1.3-2 2-3.2 1.4 2-3.2.5-7-.5-9.7Z" fill="url(#sm-ico-iv)"/><path d="M16 16c1.5 1.3 2.3 2.8 2.3 4.5 0 2.2-1.8 3.6-4.3 3.6" fill="none" stroke="#ffd15c" stroke-width="2.6" stroke-linecap="round"/>' },
    quest: { style:'tile', svg:'<circle cx="16" cy="16" r="11" fill="none" stroke="url(#sm-ico-iv)" stroke-width="3"/><circle cx="16" cy="16" r="5.2" fill="none" stroke="url(#sm-ico-iv)" stroke-width="2.6"/><circle cx="16" cy="16" r="2" fill="#ffd15c"/>' },
    games: { style:'tile', svg:'<path d="M10.5 10.5h11c3 0 5 2.3 5.6 5.4l.7 4.1c.4 2.4-1.3 4.5-3.6 4.5-1.4 0-2.3-.8-3-1.8l-.9-1.3a2 2 0 0 0-1.6-.9h-5.4a2 2 0 0 0-1.6.9l-.9 1.3c-.7 1-1.6 1.8-3 1.8-2.3 0-4-2.1-3.6-4.5l.7-4.1c.6-3.1 2.6-5.4 5.6-5.4Z" fill="url(#sm-ico-iv)"/><path d="M10.5 15v4M8.5 17h4" fill="none" stroke="#E8961F" stroke-width="2.4" stroke-linecap="round"/><circle cx="20.5" cy="15.5" r="1.7" fill="#ffd15c"/><circle cx="23.5" cy="18.5" r="1.7" fill="#ffd15c"/>' },
    medal: { style:'tile', svg:'<path d="M11 4.5l3 7.5M21 4.5l-3 7.5" fill="none" stroke="#E8961F" stroke-width="2.8" stroke-linecap="round"/><circle cx="16" cy="19.5" r="8.5" fill="url(#sm-ico-iv)"/><path d="M16 14.8l1.4 2.9 3.2.5-2.3 2.2.5 3.2-2.8-1.5-2.8 1.5.5-3.2-2.3-2.2 3.2-.5Z" fill="#ffd15c"/>' },
    coupon: { style:'tile', svg:'<path d="M5 11.5h22a1 1 0 0 1 1 1v2.2a2.3 2.3 0 0 0 0 4.6v2.2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2.2a2.3 2.3 0 0 0 0-4.6V12.5a1 1 0 0 1 1-1Z" fill="url(#sm-ico-iv)"/><path d="M16 12.5v2M16 18v2M16 23.5v1" fill="none" stroke="#E8961F" stroke-width="2.2" stroke-linecap="round"/>' },
    rank: { style:'tile', svg:'<path d="M9 5h14v6.5a7 7 0 0 1-14 0z" fill="url(#sm-ico-iv)"/><path d="M9 7H5.4a3.4 3.4 0 0 0 3.9 5.2M23 7h3.6a3.4 3.4 0 0 1-3.9 5.2" fill="none" stroke="url(#sm-ico-iv)" stroke-width="2.6" stroke-linecap="round"/><rect x="14.2" y="17" width="3.6" height="4.6" fill="url(#sm-ico-iv)"/><rect x="10.5" y="21" width="11" height="3" rx="1.3" fill="url(#sm-ico-iv)"/><path d="M9 28.5c0-2.6 3-4.2 7-4.2s7 1.6 7 4.2z" fill="url(#sm-ico-iv)"/><path d="M16 6.8l1.3 2.7 3 .2-2.3 2 .7 2.9L16 13l-2.7 1.6.7-2.9-2.3-2 3-.2z" fill="#ffd15c"/>' },
    shop: { style:'tile', svg:'<path d="M8 11h16l-1.2 13.6a2.4 2.4 0 0 1-2.4 2.2H11.6a2.4 2.4 0 0 1-2.4-2.2Z" fill="url(#sm-ico-iv)"/><path d="M12 12V9.5a4 4 0 0 1 8 0V12" fill="none" stroke="#E8961F" stroke-width="2.4" stroke-linecap="round"/><circle cx="16" cy="17" r="2" fill="#ffd15c"/>' },
    search: { style:'warm', svg:'<circle cx="14" cy="14" r="8.5" fill="url(#sm-ico-sun)"/><circle cx="14" cy="14" r="4.4" fill="#fff" opacity=".9"/><path d="M20.5 20.5l5.5 5.5" fill="none" stroke="url(#sm-ico-sun)" stroke-width="3.4" stroke-linecap="round"/><circle cx="11.6" cy="11.6" r="1.4" fill="#ffd15c"/>' },
    bell: { style:'warm', svg:'<path d="M16 4.5c-4.4 0-7 3-7 7.2 0 5-1.8 7-3 8.4-.6.7-.1 1.9.8 1.9h18.4c.9 0 1.4-1.2.8-1.9-1.2-1.4-3-3.4-3-8.4 0-4.2-2.6-7.2-7-7.2Z" fill="url(#sm-ico-sun)"/><path d="M13 25c.4 1.8 1.6 2.8 3 2.8s2.6-1 3-2.8Z" fill="#ffd15c"/><circle cx="16" cy="4" r="2.1" fill="#19b36b"/>' },
    firstaid: { style:'warm', svg:'<rect x="6" y="6" width="20" height="20" rx="6" fill="url(#sm-ico-sun)"/><path d="M16 11v10M11 16h10" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/>' },
    safetravel: { style:'warm', svg:'<path d="M16 4l10 3v7c0 7-5 11-10 13C11 25 6 21 6 14V7z" fill="url(#sm-ico-teal)"/><path d="M11 15.5l3.5 3.5L21 11.5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' },
    report: { style:'warm', svg:'<rect x="8" y="5" width="2.6" height="22" rx="1.3" fill="#c47a52"/><path d="M11 6.5h13l-3.2 4 3.2 4H11z" fill="url(#sm-ico-sun)"/>' },
    history: { style:'warm', svg:'<circle cx="16" cy="16" r="11" fill="url(#sm-ico-gold)"/><circle cx="16" cy="16" r="11" fill="none" stroke="#E8961F" stroke-width="1.4"/><path d="M16 10v6.4l4.2 2.6" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>' },
    contact: { style:'warm', svg:'<path d="M6 13l13-6v18l-13-6z" fill="url(#sm-ico-violet)"/><path d="M6 13H4.5a2 2 0 0 0 0 6H6z" fill="#7a5cff"/><path d="M22 12c2 1.6 2 6.4 0 8" fill="none" stroke="#ffd15c" stroke-width="2.2" stroke-linecap="round"/><path d="M11 19v4a2 2 0 0 0 4 0v-2" fill="none" stroke="#7a5cff" stroke-width="2.2" stroke-linecap="round"/>' },
    users: { style:'tile', svg:'<circle cx="11.5" cy="12" r="4.4" fill="url(#sm-ico-iv)"/><path d="M4 25c0-4.2 3.3-6.8 7.5-6.8s7.5 2.6 7.5 6.8z" fill="url(#sm-ico-iv)"/><circle cx="22" cy="12.5" r="3.7" fill="#ffd15c"/><path d="M16.5 25c0-3.6 2.7-6 5.5-6s5.5 2.4 5.5 6z" fill="#ffd15c"/>' },
    shieldsafe: { style:'tile', svg:'<path d="M16 4l11 3.5v6.5c0 7.5-5.5 12-11 14C10.5 26 5 21.5 5 14V7.5z" fill="url(#sm-ico-iv)"/><path d="M11 16l3.5 3.5L21 12" stroke="#FF5A4D" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' },
    usersolo: { style:'tile', svg:'<circle cx="16" cy="11" r="5.2" fill="url(#sm-ico-iv)"/><path d="M5 27c0-6 5-10 11-10s11 4 11 10z" fill="url(#sm-ico-iv)"/>' },
    crown: { style:'tile', svg:'<path d="M5 12l5.5 6 5.5-9 5.5 9 5.5-6-3 14H8z" fill="url(#sm-ico-iv)"/><path d="M8 26h16v3H8z" fill="url(#sm-ico-iv)"/><circle cx="16" cy="9.5" r="2" fill="#ffd15c"/><circle cx="6" cy="12" r="1.6" fill="#ffd15c"/><circle cx="26" cy="12" r="1.6" fill="#ffd15c"/>' },
    phone: { style:'tile', svg:'<path d="M9 5c1.5 0 2.7 1 3.1 2.5l1 3.6c.3 1.1-.1 2.3-1 3l-1.7 1.3c1.3 2.7 3.5 4.9 6.2 6.2l1.3-1.7c.7-.9 1.9-1.3 3-1l3.6 1c1.5.4 2.5 1.6 2.5 3.1v3c0 1.8-1.5 3.1-3.2 2.9C16.5 26.9 6.1 16.5 5.1 8.2 4.9 6.5 6.2 5 8 5z" fill="url(#sm-ico-iv)"/>' },
    signal: { style:'tile', svg:'<rect x="8" y="5" width="2.6" height="22" rx="1.3" fill="url(#sm-ico-iv)"/><path d="M11 6h13l-3.2 4.2L24 14.5H11z" fill="url(#sm-ico-iv)"/><circle cx="17" cy="10.2" r="1.5" fill="#FF5A4D"/>' },
    alert: { style:'tile', svg:'<path d="M16 5.5l12.5 21.5a1.5 1.5 0 0 1-1.3 2.2H4.8a1.5 1.5 0 0 1-1.3-2.2z" fill="url(#sm-ico-iv)"/><path d="M16 13v6.5" stroke="#FF5A4D" stroke-width="2.8" stroke-linecap="round"/><circle cx="16" cy="24" r="1.7" fill="#FF5A4D"/>' },
    aid: { style:'tile', svg:'<rect x="6" y="6" width="20" height="20" rx="6" fill="url(#sm-ico-iv)"/><path d="M16 11v10M11 16h10" stroke="#FF5A4D" stroke-width="3.2" stroke-linecap="round"/>' },
    chat: { style:'tile', svg:'<path d="M6 9.5a4.5 4.5 0 0 1 4.5-4.5h11a4.5 4.5 0 0 1 4.5 4.5v6a4.5 4.5 0 0 1-4.5 4.5H14l-6 5v-5a4.5 4.5 0 0 1-2-3.7z" fill="url(#sm-ico-iv)"/><circle cx="12" cy="12.5" r="1.7" fill="#FF8A3D"/><circle cx="16" cy="12.5" r="1.7" fill="#FF8A3D"/><circle cx="20" cy="12.5" r="1.7" fill="#FF8A3D"/>' }
  };

  window.SMIcon = function (name, opts) {
    injectDefs();
    opts = opts || {};
    var ic = ICONS[name]; if (!ic) return '';
    var size = opts.size || (ic.style === 'warm' ? 20 : 26);
    var inner = ic.style === 'tile' ? '<g filter="url(#sm-ico-drop)">' + ic.svg + '</g>' : ic.svg;
    return '<svg class="smicon smicon-' + name + '" viewBox="0 0 32 32" width="' + size + '" height="' + size + '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:block">' + inner + '</svg>';
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
