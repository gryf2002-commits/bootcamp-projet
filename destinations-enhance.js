/* SunMates — enhancement des pages destinations (vitrine SEO).
   #26 (retour Maxime) : « une DA de motion, des photos, du mouvement comme la vitrine
   principale, des CTA clairs, de la vie, et des musiques qui les représentent ».
   Un SEUL fichier inclus dans les 14 pages voyager-seul-a-*.html (structure identique).
   100% progressif : si JS off, la page reste lisible (SEO intact). */
(function () {
  "use strict";
  if (window.__smDestEnhanced) return; window.__smDestEnhanced = true;

  // --- Ville déduite du H1 / titre (« Voyager seul à Paris ») -------------------
  function hash(s) { var n = 0; for (var i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) >>> 0; return n; }
  var h1 = document.querySelector("h1");
  var titleTxt = (h1 && h1.textContent) || document.title || "";
  var cityM = titleTxt.match(/à\s+([A-Za-zÀ-ÿ][\wÀ-ÿ'’\- ]+?)(?:\s*[,:]|$)/);
  var CITY = cityM ? cityM[1].trim() : "SunMates";
  var SEED = hash(CITY);

  // --- Photos locales embarquées (toujours dispo, comme dans l'app) -------------
  var HERO_POOL = ["sm-hero-sunset.jpg", "sm-cliff.jpg", "sm-rencontre.jpg", "sm-friends.jpg", "sm-joie.jpg"];
  var CARD_POOL = ["sm-cafe.jpg", "sm-moment1.jpg", "sm-moment2.jpg", "sm-moment3.jpg", "sm-friends.jpg", "sm-joie.jpg", "sm-rencontre.jpg", "sm-cliff.jpg"];
  var heroImg = HERO_POOL[SEED % HERO_POOL.length];

  // --- 1) Styles (motion + photos + vie) ----------------------------------------
  var css = "" +
    ".reveal-d{opacity:0;transform:translateY(22px);transition:opacity .7s cubic-bezier(.22,1,.36,1),transform .7s cubic-bezier(.22,1,.36,1)}" +
    ".reveal-d.in{opacity:1;transform:none}" +
    "@media (prefers-reduced-motion:reduce){.reveal-d{opacity:1;transform:none;transition:none}}" +
    /* hero cinématique avec photo + parallax léger */
    ".dest-hero{position:relative;border-radius:26px;overflow:hidden;margin:.6rem 0 1.4rem;box-shadow:var(--shadow,0 22px 60px rgba(8,4,18,.45))}" +
    ".dest-hero-bg{position:absolute;inset:-8% 0 0;background-size:cover;background-position:center;transform:scale(1.06);will-change:transform;filter:saturate(1.05)}" +
    ".dest-hero-scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(25,14,46,.18) 0%,rgba(25,14,46,.55) 58%,rgba(25,14,46,.92) 100%)}" +
    ".dest-hero-in{position:relative;padding:clamp(1.4rem,5vw,2.6rem)1.3rem 1.5rem;min-height:clamp(320px,52vw,440px);display:flex;flex-direction:column;justify-content:flex-end}" +
    ".dest-hero .eyebrow{margin-bottom:.7rem}" +
    ".dest-hero h1{margin:.1em 0 .35em;text-shadow:0 2px 24px rgba(8,4,18,.5)}" +
    ".dest-hero .lead{color:#fff;max-width:46ch}" +
    ".dest-hero-cta{margin-top:1.2rem;display:flex;gap:.6rem;flex-wrap:wrap}" +
    ".btn-ghost-d{display:inline-block;background:rgba(255,255,255,.1);color:#fff;font-weight:700;padding:.7rem 1.1rem;border-radius:999px;text-decoration:none;border:1px solid rgba(255,255,255,.25);backdrop-filter:blur(6px)}" +
    /* photos de cartes + vie au survol */
    ".card{transition:transform .26s cubic-bezier(.22,1,.36,1),box-shadow .26s,border-color .26s}" +
    "@media (hover:hover){.card:hover{transform:translateY(-4px);border-color:var(--line2,rgba(255,255,255,.18))}}" +
    ".card-photo{height:120px;margin:-1.1rem -1.2rem .8rem;border-radius:var(--r,22px)var(--r,22px)0 0;background-size:cover;background-position:center;position:relative}" +
    ".card-photo::after{content:'';position:absolute;inset:0;border-radius:inherit;background:linear-gradient(180deg,transparent 40%,rgba(25,14,46,.5))}" +
    /* marque + logo */
    ".brand .dest-mark{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:8px;margin-right:.4rem;vertical-align:-6px;background:linear-gradient(160deg,#3a1e57,#7a3f5e)}" +
    ".brand .dest-mark svg{width:18px;height:18px;display:block}" +
    /* bande CTA collante en bas (mouvement + CTA clair) */
    ".dest-sticky{position:fixed;left:0;right:0;bottom:0;z-index:30;transform:translateY(120%);transition:transform .4s cubic-bezier(.22,1,.36,1);background:rgba(25,14,46,.82);backdrop-filter:blur(12px);border-top:1px solid rgba(255,255,255,.12);padding:.6rem max(20px,env(safe-area-inset-left)) calc(.6rem + env(safe-area-inset-bottom)) max(20px,env(safe-area-inset-right))}" +
    ".dest-sticky.show{transform:none}" +
    ".dest-sticky-in{max-width:var(--maxw,900px);margin:0 auto;display:flex;align-items:center;gap:.8rem}" +
    ".dest-sticky-tx{flex:1;min-width:0;font-size:.86rem;color:var(--muted,#C9B7E0)}" +
    ".dest-sticky-tx b{color:#fff}" +
    /* bouton son (ambiance) */
    ".dest-audio{position:fixed;right:14px;bottom:84px;z-index:31;width:46px;height:46px;border-radius:50%;border:1px solid rgba(255,255,255,.22);background:rgba(25,14,46,.8);backdrop-filter:blur(8px);color:#FFD15C;font-size:1.15rem;cursor:pointer;box-shadow:0 8px 22px rgba(8,4,18,.5);display:grid;place-items:center;transition:transform .2s}" +
    ".dest-audio:active{transform:scale(.92)}" +
    ".dest-audio.on{background:var(--sunset,linear-gradient(135deg,#FFD15C,#FF5570));color:#1a0e2e}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  // --- 2) Logo : la marque SunMates (soleil crépuscule, cohérent app + vitrine) ---
  var brand = document.querySelector(".brand");
  if (brand && !brand.querySelector(".dest-mark")) {
    var mk = document.createElement("span"); mk.className = "dest-mark"; mk.setAttribute("aria-hidden", "true");
    mk.innerHTML = "<svg viewBox='0 0 64 64' fill='none'><g stroke='#FFD15C' stroke-width='4' stroke-linecap='round'><line x1='32' y1='9' x2='32' y2='15'/><line x1='17' y1='16' x2='21' y2='20'/><line x1='47' y1='16' x2='43' y2='20'/><line x1='8' y1='29' x2='14' y2='29'/><line x1='50' y1='29' x2='56' y2='29'/></g><circle cx='32' cy='31' r='11' fill='#fff6e9'/><rect x='10' y='38' width='44' height='4' rx='2' fill='#FFD15C'/></svg>";
    brand.insertBefore(mk, brand.firstChild);
  }

  // --- 3) Hero cinématique : on enrobe le hero existant avec photo + scrim --------
  var hero = document.querySelector("main .hero");
  if (hero) {
    hero.classList.add("dest-hero");
    var bg = document.createElement("div"); bg.className = "dest-hero-bg"; bg.style.backgroundImage = "url('" + heroImg + "')";
    var scrim = document.createElement("div"); scrim.className = "dest-hero-scrim";
    var inner = document.createElement("div"); inner.className = "dest-hero-in";
    while (hero.firstChild) inner.appendChild(hero.firstChild);
    hero.appendChild(bg); hero.appendChild(scrim); hero.appendChild(inner);
    // 2e CTA « ghost » clair à côté du principal
    var mainBtn = inner.querySelector("a.btn");
    if (mainBtn) {
      var ctaRow = document.createElement("div"); ctaRow.className = "dest-hero-cta";
      var pWrap = mainBtn.closest("p") || mainBtn;
      if (pWrap.parentNode) pWrap.parentNode.replaceChild(ctaRow, pWrap);
      ctaRow.appendChild(mainBtn);
      var g = document.createElement("a"); g.className = "btn-ghost-d"; g.href = "#qui-traine"; g.textContent = "Voir qui traîne dans le coin";
      ctaRow.appendChild(g);
    }
    // parallax léger du fond au scroll
    var onScroll = function () { var y = Math.max(0, window.scrollY); bg.style.transform = "scale(1.06) translateY(" + (y * 0.12) + "px)"; };
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // ancre pour le CTA hero
  var firstH2 = document.querySelector("main h2"); if (firstH2 && !firstH2.id) firstH2.id = "qui-traine";

  // --- 4) Photos dans les premières cartes + reveal au scroll --------------------
  var cards = document.querySelectorAll("main .card");
  cards.forEach(function (c, i) {
    if (i < 6 && !c.querySelector(".card-photo")) {
      var ph = document.createElement("div"); ph.className = "card-photo";
      ph.style.backgroundImage = "url('" + CARD_POOL[(SEED + i * 7) % CARD_POOL.length] + "')";
      c.insertBefore(ph, c.firstChild);
    }
  });
  // tout ce qui doit apparaître en cascade
  var revealEls = document.querySelectorAll("main h2, main .card, main .grid, main .lead, main .cta, main .faq");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { el.classList.add("reveal-d"); io.observe(el); });
  }

  // --- 5) Bande CTA collante (mouvement + CTA clair, comme la vitrine) -----------
  var sticky = document.createElement("div"); sticky.className = "dest-sticky";
  sticky.innerHTML = "<div class='dest-sticky-in'><div class='dest-sticky-tx'><b>Ta place est gardée à " + CITY + ".</b> Arrive seul·e, repars accompagné·e.</div><a class='btn' href='app.html'>Embarque, c'est gratuit</a></div>";
  document.body.appendChild(sticky);
  var stOn = false;
  window.addEventListener("scroll", function () {
    var show = window.scrollY > 520; if (show !== stOn) { stOn = show; sticky.classList.toggle("show", show); }
  }, { passive: true });

  // --- 6) Ambiance sonore qui « représente » la ville (générative, sans asset) ---
  // Pad doux Web Audio : accord choisi selon la ville (seed) → chaque destination a SA couleur
  // sonore. OFF par défaut (jamais d'autoplay), un bouton clair pour l'activer.
  var btn = document.createElement("button"); btn.className = "dest-audio"; btn.type = "button";
  btn.setAttribute("aria-label", "Activer l'ambiance sonore de " + CITY); btn.textContent = "🔈";
  document.body.appendChild(btn);
  var actx = null, nodes = [], playing = false;
  var CHORDS = [[196.0, 246.94, 293.66], [220.0, 277.18, 329.63], [174.61, 220.0, 261.63], [164.81, 207.65, 246.94], [185.0, 233.08, 277.18]];
  function startAudio() {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      var master = actx.createGain(); master.gain.value = 0; master.connect(actx.destination);
      var chord = CHORDS[SEED % CHORDS.length];
      chord.forEach(function (f, i) {
        var o = actx.createOscillator(); o.type = i === 0 ? "sine" : "triangle"; o.frequency.value = f;
        var g = actx.createGain(); g.gain.value = i === 0 ? 0.16 : 0.07;
        var lfo = actx.createOscillator(); lfo.frequency.value = 0.06 + i * 0.02; var lg = actx.createGain(); lg.gain.value = 0.04;
        lfo.connect(lg); lg.connect(g.gain); o.connect(g); g.connect(master); o.start(); lfo.start();
        nodes.push(o, lfo);
      });
      master.gain.linearRampToValueAtTime(0.5, actx.currentTime + 1.4); nodes.push(master);
      playing = true; btn.classList.add("on"); btn.textContent = "🔊";
    } catch (e) {}
  }
  function stopAudio() {
    try { nodes.forEach(function (n) { try { if (n.stop) n.stop(); else if (n.disconnect) n.disconnect(); } catch (e) {} }); } catch (e) {}
    nodes = []; playing = false; btn.classList.remove("on"); btn.textContent = "🔈";
  }
  btn.addEventListener("click", function () { if (playing) stopAudio(); else { if (actx && actx.resume) actx.resume(); startAudio(); } });
})();
