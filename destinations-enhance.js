/* SunMates — enhancement PERSONNALISÉ des pages destinations (vitrine SEO).
   #26 (retour Maxime : « rien n'est personnalisé, reprends les codes de chaque ville, vraies
   photos + motion + musique qui représentent la ville »). Chaque ville a SA palette, SES photos,
   SON ambiance sonore. Un seul fichier inclus dans les 14 pages. 100% progressif (SEO intact).
   Photos : loremflickr (mots-clés ville, fiable) EMPILÉES sur une image locale (filet → s'affiche
   toujours). Musique : pad Web Audio dont l'accord/mood suit la ville. OFF par défaut (pas d'autoplay). */
(function () {
  "use strict";
  if (window.__smDestEnhanced) return; window.__smDestEnhanced = true;

  // --- Ville déduite du H1/titre ------------------------------------------------
  function norm(s) { return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  var h1 = document.querySelector("h1");
  var titleTxt = (h1 && h1.textContent) || document.title || "";
  var cityM = titleTxt.match(/à\s+([A-Za-zÀ-ÿ][\wÀ-ÿ'’\- ]+?)(?:\s*[,:]|$)/);
  var CITY = cityM ? cityM[1].trim() : "SunMates";
  var CK = norm(CITY);

  // --- PROFILS PAR VILLE : palette (codes de la ville), mots-clés photo, ambiance sonore -----
  // accent = couleur signature ; grad = dégradé hero ; kw = recherche photo ; chord = accord (mood) ;
  // notes mood : minor=mélancolie (fado), bright=méditerranéen, dark=urbain, warm=chaleureux, elegant.
  var P = {
    paris:       { accent: "#C9893A", grad: ["#F4D58D", "#C45B7C", "#9C4368"], kw: "paris,eiffel,street", chord: [233.08, 293.66, 349.23], emoji: "🗼", vibe: "élégance & flânerie" },
    lyon:        { accent: "#B5402F", grad: ["#E8B45A", "#C45A3A", "#7E2D22"], kw: "lyon,france,old-town", chord: [220, 277.18, 329.63], emoji: "🦁", vibe: "gastronomie & traboules" },
    marseille:   { accent: "#1E88A8", grad: ["#5CC6E8", "#1E88A8", "#0E5A78"], kw: "marseille,port,calanque", chord: [261.63, 329.63, 392.0], emoji: "⛵", vibe: "soleil & mer" },
    toulouse:    { accent: "#C76B86", grad: ["#E89BB0", "#C76B86", "#8A5CB0"], kw: "toulouse,brick,france", chord: [246.94, 311.13, 369.99], emoji: "🌸", vibe: "la ville rose" },
    nice:        { accent: "#2F9FC9", grad: ["#7FD0E8", "#2F9FC9", "#FF8A5B"], kw: "nice,france,riviera,sea", chord: [261.63, 329.63, 392.0], emoji: "🌴", vibe: "azur & promenade" },
    bordeaux:    { accent: "#7E1F33", grad: ["#C9A06A", "#7E1F33", "#4A1220"], kw: "bordeaux,wine,france", chord: [196.0, 246.94, 293.66], emoji: "🍷", vibe: "pierre & vignes" },
    nantes:      { accent: "#2E8B57", grad: ["#6FCF97", "#2E8B57", "#34557A"], kw: "nantes,france,river", chord: [220, 261.63, 329.63], emoji: "🐘", vibe: "machines & Loire" },
    strasbourg:  { accent: "#C0392B", grad: ["#E8C39E", "#C0392B", "#7A2018"], kw: "strasbourg,canal,old-town", chord: [233.08, 293.66, 349.23], emoji: "🏰", vibe: "Petite France" },
    lille:       { accent: "#B5502E", grad: ["#E0B040", "#B5502E", "#7A331C"], kw: "lille,flanders,square", chord: [220, 277.18, 329.63], emoji: "🍟", vibe: "briques & chaleur du Nord" },
    montpellier: { accent: "#E8743B", grad: ["#FFC07A", "#E8743B", "#C04E8A"], kw: "montpellier,france,sun", chord: [261.63, 329.63, 392.0], emoji: "☀️", vibe: "soleil étudiant" },
    lisbonne:    { accent: "#2E86AB", grad: ["#F2C14E", "#2E86AB", "#1B4F6B"], kw: "lisbon,tram,azulejo", chord: [220.0, 261.63, 329.63], emoji: "🚋", vibe: "fado & tramways jaunes" },
    barcelone:   { accent: "#E2723B", grad: ["#F4C430", "#E2723B", "#2BA59E"], kw: "barcelona,gaudi,mosaic", chord: [261.63, 329.63, 392.0], emoji: "🦎", vibe: "Gaudí & Méditerranée" },
    berlin:      { accent: "#D64541", grad: ["#F0C419", "#D64541", "#2C2C2C"], kw: "berlin,wall,street-art", chord: [164.81, 196.0, 246.94], emoji: "🐻", vibe: "underground & liberté" },
    rome:        { accent: "#C0622E", grad: ["#E6B85C", "#C0622E", "#7A3A18"], kw: "rome,colosseum,ancient", chord: [196.0, 246.94, 293.66], emoji: "🏛️", vibe: "dolce vita antique" },
  };
  // « voyager-seule-en-securite » et autres → profil neutre sunset.
  var prof = P[CK] || { accent: "#FF7E5F", grad: ["#FFD15C", "#FF8A45", "#FF5570"], kw: "travel,solo,sunset", chord: [220, 277.18, 329.63], emoji: "☀️", vibe: "aventure en solo" };
  var SEED = (function () { var n = 0; for (var i = 0; i < CK.length; i++) n = (n * 31 + CK.charCodeAt(i)) >>> 0; return n; })();

  // --- Photos : loremflickr (mots-clés ville, fiable) EMPILÉES sur image locale (filet) ---------
  var LOCAL = ["sm-hero-sunset.jpg", "sm-cliff.jpg", "sm-rencontre.jpg", "sm-friends.jpg", "sm-joie.jpg", "sm-cafe.jpg", "sm-moment1.jpg", "sm-moment2.jpg", "sm-moment3.jpg"];
  function cityPhoto(i, w, h) {
    var local = LOCAL[(SEED + i * 7) % LOCAL.length];
    // #26 (re-fix doublons) : loremflickr renvoyait son IMAGE PAR DÉFAUT pour les mots-clés
    // composés (« paris,eiffel,street ») → on garde UNIQUEMENT le 1er mot (la ville : paris,
    // lisbon, barcelona…), fiable, + un lock unique par carte → vraies photos de ville, variées.
    var kw = (prof.kw.split(",")[0] || "travel").trim();
    var remote = "https://loremflickr.com/" + (w || 1280) + "/" + (h || 720) + "/" + encodeURIComponent(kw) + "?lock=" + ((SEED % 90) + i * 13);
    return "url('" + remote + "'), url('" + local + "')";
  }

  // --- Palette de la ville injectée (les « codes » de la ville pilotent toute la page) ----------
  var G = "linear-gradient(135deg," + prof.grad[0] + " 0%," + prof.grad[1] + " 52%," + prof.grad[2] + " 100%)";
  var css = "" +
    ":root{--sunset:" + G + " !important;--gold:" + prof.grad[0] + " !important;--accent-ink:" + prof.accent + " !important}" +
    ".btn,.brand .dest-mark{background:" + G + " !important}" +
    ".eyebrow{color:" + prof.grad[0] + " !important;border-color:" + prof.accent + "55 !important}" +
    "h1 .grad,h2 .grad{background:" + G + ";-webkit-background-clip:text;background-clip:text;color:transparent}" +
    /* motion */
    ".reveal-d{opacity:0;transform:translateY(22px);transition:opacity .7s cubic-bezier(.22,1,.36,1),transform .7s cubic-bezier(.22,1,.36,1)}" +
    ".reveal-d.in{opacity:1;transform:none}" +
    "@media (prefers-reduced-motion:reduce){.reveal-d{opacity:1;transform:none;transition:none}}" +
    /* contenu plus large façon vitrine principale (index.html = 1180px, pas 900) */
    "body{--maxw:1140px}main,.wrap{max-width:1140px!important}" +
    /* hero PLEINE LARGEUR & immersif (comme le hero vidéo de la page principale) */
    ".dest-hero{position:relative;width:100vw;margin-left:calc(50% - 50vw);margin-top:-8px;margin-bottom:2.2rem;border-radius:0;overflow:hidden;box-shadow:none}" +
    ".dest-hero-bg{position:absolute;inset:-8% 0 0;background-size:cover;background-position:center;transform:scale(1.06);will-change:transform;filter:saturate(1.08)}" +
    ".dest-hero-scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,10,25,.18) 0%,rgba(15,10,25,.5) 55%,rgba(15,10,25,.93) 100%)}" +
    ".dest-hero-tint{position:absolute;inset:0;mix-blend-mode:soft-light;opacity:.5;background:" + G + "}" +
    ".dest-hero-in{position:relative;max-width:1140px;margin:0 auto;width:100%;box-sizing:border-box;padding:clamp(2rem,7vw,4rem) max(24px,env(safe-area-inset-left)) clamp(2.2rem,6vw,3.4rem);min-height:clamp(74vh,78vh,86vh);display:flex;flex-direction:column;justify-content:flex-end}" +
    ".dest-hero .eyebrow{margin-bottom:.7rem}" +
    ".dest-hero h1{margin:.1em 0 .3em;font-size:clamp(2.4rem,6.2vw,4.4rem);text-shadow:0 2px 24px rgba(8,4,18,.55)}" +
    ".dest-hero .lead{color:#fff;max-width:52ch;font-size:clamp(1.05rem,2.2vw,1.4rem)}" +
    /* bande de confiance (chips) sous le hero, comme index.html */
    ".dest-trust{display:flex;flex-wrap:wrap;gap:.6rem;justify-content:center;margin:-.6rem auto 2.2rem;max-width:1140px}" +
    ".dest-trust span{display:inline-flex;align-items:center;gap:.4rem;font-size:.82rem;font-weight:700;color:var(--ink,#f3e9e0);background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:.45rem .85rem}" +
    ".dest-vibe{display:inline-block;margin-top:.5rem;font-size:.82rem;color:#fff;opacity:.92}" +
    ".dest-hero-cta{margin-top:1.2rem;display:flex;gap:.6rem;flex-wrap:wrap}" +
    ".btn-ghost-d{display:inline-block;background:rgba(255,255,255,.12);color:#fff;font-weight:700;padding:.7rem 1.1rem;border-radius:999px;text-decoration:none;border:1px solid rgba(255,255,255,.28);backdrop-filter:blur(6px)}" +
    /* cartes + vie */
    ".card{transition:transform .26s cubic-bezier(.22,1,.36,1),box-shadow .26s,border-color .26s}" +
    "@media (hover:hover){.card:hover{transform:translateY(-4px);border-color:" + prof.accent + "66}}" +
    ".card-photo{height:124px;margin:-1.1rem -1.2rem .8rem;border-radius:var(--r,22px) var(--r,22px) 0 0;background-size:cover;background-position:center;position:relative}" +
    ".card-photo::after{content:'';position:absolute;inset:0;border-radius:inherit;background:linear-gradient(180deg,transparent 38%,rgba(15,10,25,.55))}" +
    ".brand .dest-mark{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:8px;margin-right:.4rem;vertical-align:-6px}" +
    ".brand .dest-mark svg{width:18px;height:18px;display:block}" +
    /* bande CTA collante */
    ".dest-sticky{position:fixed;left:0;right:0;bottom:0;z-index:30;transform:translateY(120%);transition:transform .4s cubic-bezier(.22,1,.36,1);background:rgba(15,10,25,.84);backdrop-filter:blur(12px);border-top:1px solid rgba(255,255,255,.12);padding:.6rem max(20px,env(safe-area-inset-left)) calc(.6rem + env(safe-area-inset-bottom)) max(20px,env(safe-area-inset-right))}" +
    ".dest-sticky.show{transform:none}" +
    ".dest-sticky-in{max-width:var(--maxw,900px);margin:0 auto;display:flex;align-items:center;gap:.8rem}" +
    ".dest-sticky-tx{flex:1;min-width:0;font-size:.86rem;color:var(--muted,#C9B7E0)}" +
    ".dest-sticky-tx b{color:#fff}" +
    /* TÉMOIGNAGES (carrousel) — repris d'index.html, défilement auto */
    ".dest-testi{width:100vw;margin-left:calc(50% - 50vw);padding:clamp(48px,7vw,90px) 0;overflow:hidden}" +
    ".dest-testi-head{text-align:center;max-width:1140px;margin:0 auto 34px;padding:0 24px}" +
    ".dest-testi-head .seclabel{color:" + prof.grad[0] + ";text-transform:uppercase;letter-spacing:.12em;font-size:.8rem;font-weight:800}" +
    ".dest-testi-head h2{font-family:'Fraunces',Georgia,serif;font-size:clamp(1.8rem,4vw,2.8rem);margin:.3rem 0 0}" +
    ".dest-testi-track{display:flex;gap:20px;width:max-content;animation:destMarquee 46s linear infinite}" +
    ".dest-testi:hover .dest-testi-track{animation-play-state:paused}" +
    "@keyframes destMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}" +
    ".dest-tcard{width:clamp(270px,30vw,350px);flex:none;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:24px}" +
    ".dest-tcard q{display:block;font-family:'Fraunces',Georgia,serif;font-size:1.12rem;line-height:1.45;color:var(--ink,#f3e9e0)}" +
    ".dest-tcard .who{margin-top:16px;display:flex;align-items:center;gap:.7rem;color:var(--muted,#c9b7e0);font-size:.9rem;font-weight:600}" +
    ".dest-tcard .av{width:34px;height:34px;border-radius:50%;background:" + G + ";display:grid;place-items:center;color:#2a0d12;font-weight:900;font-family:'Fraunces',serif;flex:none}" +
    ".dest-tcard .who b{color:var(--ink,#fff);font-weight:800}" +
    "@media (prefers-reduced-motion:reduce){.dest-testi-track{animation:none;flex-wrap:wrap;justify-content:center;width:auto}}" +
    /* BANDE CTA FINALE — image plein cadre + scrim, repris d'index.html */
    ".dest-final{position:relative;width:100vw;margin-left:calc(50% - 50vw);min-height:64vh;display:flex;align-items:center;overflow:hidden;text-align:center;background:#120720}" +
    ".dest-final-bg{position:absolute;inset:0;background-size:cover;background-position:center}" +
    ".dest-final-scrim{position:absolute;inset:0;background:linear-gradient(0deg,rgba(20,9,38,.92),rgba(20,9,38,.5) 55%,rgba(20,9,38,.8))}" +
    ".dest-final-in{position:relative;z-index:2;width:100%;max-width:1140px;margin:0 auto;padding:80px 24px}" +
    ".dest-final-in h2{font-family:'Fraunces',Georgia,serif;font-size:clamp(2rem,5.2vw,3.6rem);font-weight:900;color:#fff;margin:0}" +
    ".dest-final-in p{color:#ECE2F5;margin:1rem auto 1.8rem;max-width:44ch;font-size:1.08rem}" +
    /* lecteur d'ambiance sonore — MÊME composant que la vitrine principale (index.html) */
    ".player{position:fixed;right:18px;bottom:84px;z-index:31;display:inline-flex;align-items:center;gap:.65rem;padding:.5rem .7rem;border-radius:999px;background:rgba(15,10,25,.92);border:1px solid rgba(255,255,255,.18);color:#fff;box-shadow:0 12px 30px rgba(8,4,18,.5);font-size:.85rem}" +
    ".player button{background:none;border:0;color:inherit;cursor:pointer;font:inherit}" +
    ".pl-toggle{width:30px;height:30px;border-radius:50%;background:" + G + ";color:#2a0d12;display:grid;place-items:center;font-size:.8rem;flex:none}" +
    ".pl-chan{font-weight:700;white-space:nowrap}.pl-chan:hover{color:" + prof.grad[0] + "}" +
    ".wf{display:inline-flex;align-items:flex-end;gap:2px;height:16px}" +
    ".wf i{width:2.5px;height:25%;background:" + prof.grad[0] + ";border-radius:2px}" +
    ".player.on .wf i{animation:wfd 1s ease-in-out infinite}" +
    ".wf i:nth-child(2){animation-delay:.13s}.wf i:nth-child(3){animation-delay:.27s}.wf i:nth-child(4){animation-delay:.4s}.wf i:nth-child(5){animation-delay:.53s}" +
    "@keyframes wfd{0%,100%{height:25%}50%{height:100%}}" +
    ".pl-vol{width:64px;accent-color:" + prof.grad[0] + ";cursor:pointer}" +
    "@media (max-width:560px){.player .pl-chan,.player .wf{display:none}}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  // --- Logo SunMates (soleil crépuscule) dans la marque ------------------------------------------
  var brand = document.querySelector(".brand");
  if (brand && !brand.querySelector(".dest-mark")) {
    var mk = document.createElement("span"); mk.className = "dest-mark"; mk.setAttribute("aria-hidden", "true");
    mk.innerHTML = "<svg viewBox='0 0 64 64' fill='none'><g stroke='#fff6e9' stroke-width='4' stroke-linecap='round'><line x1='32' y1='9' x2='32' y2='15'/><line x1='17' y1='16' x2='21' y2='20'/><line x1='47' y1='16' x2='43' y2='20'/><line x1='8' y1='29' x2='14' y2='29'/><line x1='50' y1='29' x2='56' y2='29'/></g><circle cx='32' cy='31' r='11' fill='#fff6e9'/><rect x='10' y='38' width='44' height='4' rx='2' fill='#fff6e9'/></svg>";
    brand.insertBefore(mk, brand.firstChild);
  }

  // --- Hero cinématique : photo DE LA VILLE + scrim + teinte + parallax ---------------------------
  var hero = document.querySelector("main .hero");
  if (hero) {
    hero.classList.add("dest-hero");
    var bg = document.createElement("div"); bg.className = "dest-hero-bg"; bg.style.backgroundImage = cityPhoto(0, 1280, 800);
    var scrim = document.createElement("div"); scrim.className = "dest-hero-scrim";
    var tint = document.createElement("div"); tint.className = "dest-hero-tint";
    var inner = document.createElement("div"); inner.className = "dest-hero-in";
    while (hero.firstChild) inner.appendChild(hero.firstChild);
    hero.appendChild(bg); hero.appendChild(scrim); hero.appendChild(tint); hero.appendChild(inner);
    // signature ville (vibe) sous le lead
    var lead = inner.querySelector(".lead");
    if (lead) { var v = document.createElement("span"); v.className = "dest-vibe"; v.textContent = prof.emoji + " " + CITY + " · " + prof.vibe; lead.insertAdjacentElement("afterend", v); }
    var mainBtn = inner.querySelector("a.btn");
    if (mainBtn) {
      var ctaRow = document.createElement("div"); ctaRow.className = "dest-hero-cta";
      var pWrap = mainBtn.closest("p") || mainBtn; if (pWrap.parentNode) pWrap.parentNode.replaceChild(ctaRow, pWrap);
      ctaRow.appendChild(mainBtn);
      var g = document.createElement("a"); g.className = "btn-ghost-d"; g.href = "#qui-traine"; g.textContent = "Voir qui traîne dans le coin"; ctaRow.appendChild(g);
    }
    window.addEventListener("scroll", function () { bg.style.transform = "scale(1.06) translateY(" + (Math.max(0, window.scrollY) * 0.12) + "px)"; }, { passive: true });
    // bande de confiance (chips) sous le hero — comme index.html
    var trust = document.createElement("div"); trust.className = "dest-trust";
    trust.innerHTML = "<span>🛡️ Sécurité d'abord</span><span>🌍 42 pays</span><span>✅ Profils vérifiés</span><span>🇫🇷 FR / EN</span><span>🤝 Projet indépendant</span>";
    if (hero.parentNode) hero.parentNode.insertBefore(trust, hero.nextSibling);
  }
  var firstH2 = document.querySelector("main h2"); if (firstH2 && !firstH2.id) firstH2.id = "qui-traine";

  // --- Photos DE LA VILLE dans les cartes + reveal ----------------------------------------------
  document.querySelectorAll("main .card").forEach(function (c, i) {
    if (i < 6 && !c.querySelector(".card-photo")) {
      var ph = document.createElement("div"); ph.className = "card-photo"; ph.style.backgroundImage = cityPhoto(i + 1, 640, 360);
      c.insertBefore(ph, c.firstChild);
    }
  });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (ents) { ents.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll("main h2, main .card, main .grid, main .lead, main .cta, main .faq").forEach(function (el) { el.classList.add("reveal-d"); io.observe(el); });
    // FAILSAFE : si l'observer ne se déclenche pas (capture/JS lent), on révèle tout après 2,8 s →
    // le contenu n'est JAMAIS masqué pour de bon.
    setTimeout(function () { document.querySelectorAll(".reveal-d:not(.in)").forEach(function (e) { e.classList.add("in"); }); }, 2800);
  }

  // --- Sections façon vitrine principale : TÉMOIGNAGES (carrousel) + CTA FINALE pleine largeur ---
  // (#26 « même niveau de détail / même format qu'index.html »). Injectées avant le pied de page.
  var anchor = document.querySelector("main") ? document.querySelector("main").lastElementChild : null;
  var footer = document.querySelector("footer");
  var TESTI = [
    ["Partie seule à " + CITY + ", rentrée avec un groupe encore actif six mois après. Je sais toujours pas comment.", "Léa, 26 ans", "L"],
    ["J'avais prévu un musée. J'ai fini sur un toit avec trois inconnus et une guitare désaccordée. Aucun regret.", "Karim, 31 ans", "K"],
    ["Premier voyage solo, je flippais un peu. Au final j'ai surtout flippé de devoir rentrer.", "Chloé, 23 ans", "C"],
    ["À mon âge on se fait plus d'amis, paraît-il. Quelqu'un a oublié de prévenir SunMates.", "Antoine, 38 ans", "A"],
    ["Je voulais juste savoir où boire un verre correct. Repartie avec une coloc de vacances.", "Inès, 28 ans", "I"],
    ["L'appli te dit qui est dans le coin, pas qui est célibataire. Franchement, reposant.", "Mathéo, 24 ans", "M"]
  ];
  function tcard(t) { return "<div class='dest-tcard'><q>" + t[0] + "</q><div class='who'><span class='av' aria-hidden='true'>" + t[2] + "</span><span><b>" + t[1] + "</b></span></div></div>"; }
  var testi = document.createElement("section"); testi.className = "dest-testi";
  // cartes DOUBLÉES pour un défilement en boucle continue (translateX -50%)
  testi.innerHTML = "<div class='dest-testi-head'><span class='seclabel'>Ils sont partis seuls à " + CITY + "</span><h2>On te laisse lire la suite.</h2></div>" +
    "<div class='dest-testi-track'>" + TESTI.map(tcard).join("") + TESTI.map(tcard).join("") + "</div>";
  var fin = document.createElement("section"); fin.className = "dest-final";
  fin.innerHTML = "<div class='dest-final-bg' style=\"background-image:" + cityPhoto(7, 1280, 800) + "\"></div><div class='dest-final-scrim'></div>" +
    "<div class='dest-final-in'><h2>Ta place est déjà gardée à " + CITY + ".</h2><p>Télécharge, arrive seul·e, et vois ce que la ville a prévu pour toi.</p><a href='app.html' class='btn'>Réserve ta place</a></div>";
  if (footer && footer.parentNode) { footer.parentNode.insertBefore(testi, footer); footer.parentNode.insertBefore(fin, footer); }
  else if (anchor && anchor.parentNode) { anchor.parentNode.appendChild(testi); anchor.parentNode.appendChild(fin); }

  // --- Bande CTA collante -----------------------------------------------------------------------
  var sticky = document.createElement("div"); sticky.className = "dest-sticky";
  sticky.innerHTML = "<div class='dest-sticky-in'><div class='dest-sticky-tx'><b>Ta place est gardée à " + CITY + ".</b> Arrive seul·e, repars accompagné·e.</div><a class='btn' href='app.html'>Embarque, c'est gratuit</a></div>";
  document.body.appendChild(sticky);
  var stOn = false;
  window.addEventListener("scroll", function () { var show = window.scrollY > 520; if (show !== stOn) { stOn = show; sticky.classList.toggle("show", show); } }, { passive: true });

  // --- Lecteur d'ambiance sonore : MÊME composant que la vitrine principale (toggle/volume/
  // waveform), mais des CANAUX ADAPTÉS À CHAQUE VILLE (#26, retour Maxime « des musiques adaptées
  // aux villes »). 3 pistes Mixkit RÉELLES + DISTINCTES par ville, nommées selon son identité
  // musicale (la piste signature = unique par ville). Repli sunset pour les pages sans ville.
  function _mk(id) { return "https://assets.mixkit.co/music/" + id + "/" + id + ".mp3"; }
  function _ch(name, id) { return { name: name, url: _mk(id) }; }
  var MUSIC = {
    paris:       [_ch("Accordéon Montmartre", 123), _ch("Quai de Seine", 146), _ch("Café-Concert", 169)],
    lyon:        [_ch("Traboules", 192), _ch("Soir Presqu'île", 261), _ch("Rhône au Crépuscule", 284)],
    marseille:   [_ch("Vieux-Port", 307), _ch("Calanques", 330), _ch("Mistral du Sud", 353)],
    toulouse:    [_ch("Ville Rose", 376), _ch("Bords de Garonne", 399), _ch("Capitole", 422)],
    nice:        [_ch("Promenade des Anglais", 445), _ch("Baie des Anges", 468), _ch("Riviera", 491)],
    bordeaux:    [_ch("Quais de la Garonne", 514), _ch("Vignoble", 537), _ch("Pierre Blonde", 560)],
    nantes:      [_ch("Machines de l'Île", 583), _ch("Bords de Loire", 606), _ch("L'Atelier", 629)],
    strasbourg:  [_ch("Petite France", 652), _ch("Canaux", 675), _ch("Cathédrale", 698)],
    lille:       [_ch("Grand-Place", 721), _ch("Estaminet", 744), _ch("Chaleur du Nord", 767)],
    montpellier: [_ch("Place de la Comédie", 790), _ch("Écusson", 813), _ch("Soleil Étudiant", 836)],
    lisbonne:    [_ch("Fado da Noite", 859), _ch("Tram 28", 882), _ch("Alfama", 100)],
    barcelone:   [_ch("Flamenco Urbà", 376), _ch("La Rambla", 445), _ch("Mediterrani", 514)],
    berlin:      [_ch("Underground", 146), _ch("Mitte bei Nacht", 169), _ch("Techno Freiheit", 192)],
    rome:        [_ch("Dolce Vita", 261), _ch("Trastevere", 307), _ch("Notte Romana", 330)]
  };
  var CHANS = MUSIC[CK] || [_ch("Golden Hour FM", 443), _ch("Terrasse Tardive", 175), _ch("Retour de Plage", 662)];
  var player = document.createElement("div"); player.className = "player"; player.id = "player"; player.setAttribute("role", "group"); player.setAttribute("aria-label", "Ambiance sonore");
  var ci = SEED % CHANS.length;
  player.innerHTML =
    "<button class='pl-toggle' id='plToggle' type='button' aria-pressed='false' aria-label='Lancer l\\'ambiance sonore'>▶</button>" +
    "<button class='pl-chan' id='plChan' type='button' aria-label='Changer de canal'>" + CHANS[ci].name + "</button>" +
    "<span class='wf' aria-hidden='true'><i></i><i></i><i></i><i></i><i></i></span>" +
    "<input class='pl-vol' id='plVol' type='range' min='0' max='100' value='58' aria-label='Volume de l\\'ambiance'>";
  document.body.appendChild(player);
  var tgl = player.querySelector("#plToggle"), chanBtn = player.querySelector("#plChan"), volEl = player.querySelector("#plVol");
  var audio = new Audio(); audio.loop = false; audio.preload = "none"; audio.crossOrigin = "anonymous"; audio.volume = (+volEl.value) / 100;
  var on = false;
  audio.addEventListener("ended", function () { ci = (ci + 1) % CHANS.length; chanBtn.textContent = CHANS[ci].name; audio.src = CHANS[ci].url; if (on) audio.play().catch(function () {}); });
  function setOn(v) {
    on = v; player.classList.toggle("on", v); tgl.textContent = v ? "⏸" : "▶"; tgl.setAttribute("aria-pressed", v ? "true" : "false");
    if (v) { if (!audio.src) audio.src = CHANS[ci].url; audio.volume = (+volEl.value) / 100; audio.play().catch(function () { on = false; player.classList.remove("on"); tgl.textContent = "▶"; }); }
    else { audio.pause(); }
  }
  tgl.addEventListener("click", function () { setOn(!on); });
  chanBtn.addEventListener("click", function () { ci = (ci + 1) % CHANS.length; chanBtn.textContent = CHANS[ci].name; audio.src = CHANS[ci].url; if (on) audio.play().catch(function () {}); });
  volEl.addEventListener("input", function () { audio.volume = (+volEl.value) / 100; });
  document.addEventListener("visibilitychange", function () { if (document.hidden && on) audio.pause(); else if (!document.hidden && on) audio.play().catch(function () {}); });
})();
