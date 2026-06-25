// SunMates — service worker (PWA)
// Démarrage quasi-instantané + offline réel : on précache la coquille, on met en
// cache à la volée les libs CDN et les images (avatars, tuiles de carte) en
// "stale-while-revalidate" (on sert le cache tout de suite, on rafraîchit en fond).
// Les écritures Supabase (POST/PATCH…) ne sont jamais touchées.
const VER = "v816";
const SHELL_CACHE = "sunmates-shell-" + VER;   // coquille (versionnée → purge à chaque déploiement)
const RUNTIME = "sunmates-rt-" + VER;          // libs CDN/fonts (regénéré par version, re-précaché à l'install)
// #15/#8 : cache MÉDIA STABLE (NON versionné) → avatars, photos (quêtes/check-ins), emojis.
// Ces URLs sont stables (le contenu ne change pas), donc on les GARDE entre les déploiements :
// fini le rechargement de toutes les images à chaque MAJ de version. Borné en taille (LRU).
// ⚠️ STORAGE (23/06) : renommé "…-v2" pour PURGER l'ancien cache (272 réponses OPAQUES × ~7 Mo
// de padding Chrome = 1,8 Go fantôme rapporté pour ~16 Mo réels). Désormais on ne cache QUE
// du non-opaque (fetch forcé en CORS) et les TUILES de carte sont sorties du SW (cf. fetch).
const MEDIA = "sunmates-media-v2";
const MEDIA_MAX = 60;
// Depuis la bascule vitrine (v567) : "./" + "./index.html" = la VITRINE (accueil) ;
// "./app.html" = l'APPLICATION. Les deux sont précachées → l'app installée marche hors-ligne.
const SHELL = ["./", "./index.html", "./app.html", "./manifest.json", "./icon.svg", "./styles.css", "./sunmates-badges.js", "./sunmates-icons-v2.js", "./sm_country_stories.js", "./sunmates-motion.js",
  "./icon-192.png", "./icon-512.png", "./icon-180.png", "./icon-maskable-512.png", "./badge-96.png"];
// Libs CDN précachées dès l'install → carte/QR/etc. dispo INSTANTANÉMENT et hors-ligne (cache plus "lourd" mais + fluide).
const CDN_PRECACHE = [
  // Client Supabase PINNÉ + précaché : tout le JS applicatif en dépend → offline réel (évite l'« app morte » au 1er lancement hors-ligne).
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.108.2",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js",
  "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css",
  "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css",
  // Fond de carte vectoriel « SunMates » (MapLibre GL dans Leaflet) → fluide + offline.
  "https://unpkg.com/maplibre-gl@4/dist/maplibre-gl.js",
  "https://unpkg.com/maplibre-gl@4/dist/maplibre-gl.css",
  "https://unpkg.com/@maplibre/maplibre-gl-leaflet/leaflet-maplibre-gl.js",
  "https://cdn.jsdelivr.net/gh/davidshimjs/qrcodejs/qrcode.min.js",
  "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js",
  // GSAP (couche motion) précaché → animations dispo hors-ligne aussi.
  "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js",
  // Polices SunMates (Fraunces + Manrope) précachées → texte net dès le 1er rendu, même hors-ligne.
  "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,500&family=Manrope:wght@400;500;600;700;800&display=swap",
];

self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    // Best-effort PAR FICHIER (addAll est atomique : 1 asset manquant viderait toute la coquille → offline cassé).
    // cache:"reload" → on précache une coquille FRAÎCHE (jamais la version périmée du cache HTTP/CDN).
    try { const c = await caches.open(SHELL_CACHE); await Promise.allSettled(SHELL.map(async (u) => { try { const r = await fetch(u, { cache: "reload" }); if (r && r.ok) await c.put(u, r); } catch (e) {} })); } catch (e) {}
    // Les CDN en best-effort (ne bloquent pas l'install si offline/CORS).
    try { const r = await caches.open(RUNTIME); await Promise.allSettled(CDN_PRECACHE.map((u) => r.add(u))); } catch (e) {}
  })());
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    // On garde les caches de la version courante ET le cache MÉDIA stable (#15 : ne pas purger
    // avatars/photos à chaque MAJ → fini le rechargement de toutes les images à chaque deploy).
    // Le rename MEDIA → "…-v2" fait que l'ancien "sunmates-media" (1,8 Go opaque) est SUPPRIMÉ ici.
    await Promise.all(keys.filter((k) => k !== SHELL_CACHE && k !== RUNTIME && k !== MEDIA).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Borne la taille d'un cache (LRU grossier : on supprime les plus anciennes entrées en tête).
async function trimCache(cacheName, max) {
  try { const c = await caches.open(cacheName); const keys = await c.keys(); if (keys.length > max) { for (let i = 0; i < keys.length - max; i++) await c.delete(keys[i]); } } catch (e) {}
}
// Récupère une ressource tierce en CORS d'abord → réponse de type "cors" (TAILLE RÉELLE, sans le
// padding ~7 Mo que Chrome ajoute aux réponses opaques). jsdelivr/unpkg/cartocdn/openfreemap/
// pravatar/picsum/Supabase Storage envoient tous les en-têtes CORS. Si un tiers ne les renvoie pas,
// le fetch CORS échoue → REPLI RÉSEAU DIRECT (jamais no-cors) : on sert la ressource mais le
// garde-fou ci-dessous l'empêchera d'entrer (opaque/erreur) dans le cache.
async function fetchCorsFirst(req) {
  try {
    return await fetch(new Request(req.url, { mode: "cors", credentials: "omit" }));
  } catch (e) {
    return fetch(req).catch(() => null);
  }
}
// Réponse depuis le cache, rafraîchie en fond (stale-while-revalidate).
async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  // Pour les MÉDIAS déjà en cache : on sert le cache et on NE re-fetch PAS (cache-first) → instantané
  // et zéro requête réseau inutile (avatars/emojis ne changent pas). Sinon on va chercher + on stocke.
  if (cached && cacheName === MEDIA) return cached;
  const network = fetchCorsFirst(req).then((res) => {
    // GARDE-FOU : ne JAMAIS mettre une réponse OPAQUE en cache (c'était la cause du 1,8 Go fantôme).
    if (res && res.ok && res.type !== "opaque") { cache.put(req, res.clone()).then(() => { if (cacheName === MEDIA) trimCache(MEDIA, MEDIA_MAX); }).catch(() => {}); }
    return res;
  }).catch(() => null);
  return cached || (await network) || new Response("", { status: 504 });
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return; // ne touche pas aux écritures Supabase

  const url = new URL(req.url);

  // 0) TUILES DE CARTE : JAMAIS dans le SW. Elles sont nombreuses, lourdes et varient au
  // zoom/déplacement → c'était le gros du cache média gonflé (opaques + padding). Le cache HTTP
  // du navigateur les gère très bien. On laisse passer au réseau sans respondWith (= pas de cache SW).
  const NO_SW_CACHE = ["tiles.openfreemap.org", "basemaps.cartocdn.com", "tile.openstreetmap.org"];
  if (NO_SW_CACHE.some((h) => url.host === h || url.host.endsWith("." + h))) return;

  // 1) Navigation : réseau d'abord (dernière version), MAIS avec un GARDE-FOU de TIMEOUT.
  // cache:"no-store" → on bypasse le cache HTTP du navigateur + le CDN GitHub Pages/Fastly.
  //   ⚠️ BUG « chargement infini » corrigé (v468) : sans timeout, si l'edge est lent juste
  //   après un déploiement, la requête réseau ne résout NI ne rejette → la page tournait à
  //   l'infini. On court-circuite désormais après 6 s en servant la coquille en cache (toujours
  //   la version courante : précachée fraîche à l'install). Hors-ligne → repli immédiat aussi.
  if (req.mode === "navigate") {
    e.respondWith((async () => {
      // Deux entrées HTML depuis la bascule vitrine : racine/index.html = VITRINE, app.html = APP.
      // On sert/replie sur la BONNE coquille selon le chemin → l'app installée (qui redirige vers
      // app.html) reste fonctionnelle hors-ligne, et la vitrine ne « mange » jamais l'app.
      const isApp = /(^|\/)app\.html$/i.test(url.pathname);
      const shellKey = isApp ? "./app.html" : "./index.html";
      const fallback = () => caches.match(shellKey)
        .then((c) => c || caches.match("./app.html"))
        .then((c) => c || fetch(req.url).catch(() => new Response("", { status: 504 })));
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 6000);
        const res = await fetch(req.url, { cache: "no-store", signal: ctrl.signal });
        clearTimeout(timer);
        if (res && res.ok) { const c = res.clone(); caches.open(SHELL_CACHE).then((cc) => cc.put(shellKey, c)).catch(() => {}); }
        return res;
      } catch (e) {
        return fallback();
      }
    })());
    return;
  }

  // 2) Même origine (JS, CSS, icônes, manifest) : RÉSEAU D'ABORD (sans cache HTTP), cache en secours (offline).
  // → on a TOUJOURS le code le plus frais (zéro état « cache hybride » ancien/nouveau qui buggue),
  //   tout en restant utilisable hors-ligne grâce au repli sur la coquille.
  if (url.origin === self.location.origin) {
    e.respondWith(
      fetch(req, { cache: "no-store" }).then((res) => {
        if (res && res.ok) { const c = res.clone(); caches.open(SHELL_CACHE).then((cc) => cc.put(req, c)).catch(() => {}); }
        return res;
      // FIX OFFLINE (#35) : ignoreSearch ! La coquille précache « sunmates-badges.js » SANS
      // query, mais la page le demande avec « ?v=NNN » → match raté hors-ligne, et le repli
      // index.html renvoyait du HTML à la place du JS = écran mort en mode avion.
      }).catch(() => caches.match(req, { ignoreSearch: true }).then((c) => c || caches.match("./app.html")))
    );
    return;
  }

  // 3) CDN libs (Leaflet, fonts, gstatic, tuiles de carte) + images : SWR runtime.
  // IMPORTANT : Supabase n'est PAS dans cette liste → ses GET REST/Auth (profils, messages,
  // session/token) ne sont JAMAIS servis depuis le cache (données toujours fraîches pour une
  // app temps réel/sécurité). Seules ses IMAGES Storage (avatars) sont cachées via `isImg`.
  const host = url.hostname;
  // Images (avatars Supabase Storage, photos de quêtes/check-ins, emojis Twemoji, picsum, pravatar)
  // → cache MÉDIA STABLE (survit aux MAJ, cache-first = instantané). #15 photos.
  // Les TUILES de carte ont déjà été exclues plus haut (NO_SW_CACHE).
  const isImg = req.destination === "image"
    || /(^|\.)(images\.unsplash\.com|picsum\.photos|fastly\.picsum\.photos|i\.pravatar\.cc)$/i.test(host)
    || (/(^|\.)supabase\.co$/i.test(host) && /\/storage\//.test(url.pathname));
  if (isImg) { e.respondWith(staleWhileRevalidate(req, MEDIA)); return; }
  // Libs/fonts CDN (versionnées) → RUNTIME (re-précaché à l'install).
  const isCdn = /(^|\.)(jsdelivr\.net|unpkg\.com|cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)$/i.test(host);
  if (isCdn) { e.respondWith(staleWhileRevalidate(req, RUNTIME)); return; }
  // Sinon : réseau direct.
});

// Permet à la page de demander une activation immédiate du nouveau SW.
self.addEventListener("message", (e) => { if (e.data === "skipWaiting") self.skipWaiting(); });

// --- Web Push : afficher la notification reçue (même app fermée) ---
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { title: "SunMates", body: e.data ? e.data.text() : "" }; }
  const title = d.title || "SunMates";
  const opts = {
    body: d.body || "",
    icon: "./icon-192.png",            // grande icône couleur (côté droit de la notif)
    badge: "./badge-96.png",           // petite icône monochrome (barre d'état Android) — silhouette blanche, plus de « pavé gris »
    tag: d.tag || "sunmates",
    renotify: false,                   // une notif du même tag remplace, n'empile pas
    vibrate: [60, 30, 60],             // petite vibration douce → ressenti « app native », pas brutal
    data: { url: d.url || "./app.html", tab: d.tab || "" }, // P2.38 : onglet cible (ouvre l'app, pas la vitrine)
  };
  e.waitUntil(self.registration.showNotification(title, opts));
});

// --- Rotation d'abonnement push (FCM en change parfois SANS action de l'utilisateur) :
// on se réabonne aussitôt, puis on demande à la page (si ouverte) de re-sauvegarder
// l'abonnement dans Supabase. Sinon, la sauvegarde se fait à la prochaine ouverture
// (subscribePush tourne à chaque init de session). Sans ce handler → notifs mortes en silence.
const VAPID_PUBLIC_SW = "BDroKpS-uCezrK7igjxCD9Ih8a5OgPQ3AtOuza220aSx8CzR3LIw9EwkkObyHZVMI1wyT24_w48Ho7CUnAAPZ_0";
function _b64ToU8(b64) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const b = (b64 + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b); const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}
self.addEventListener("pushsubscriptionchange", (e) => {
  e.waitUntil(
    self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: _b64ToU8(VAPID_PUBLIC_SW) })
      .then(() => self.clients.matchAll({ type: "window" }))
      .then((cl) => cl.forEach((c) => { try { c.postMessage({ type: "sm-resub" }); } catch (_) {} }))
      .catch(() => {})
  );
});

// --- Clic sur la notification : ouvrir / focaliser l'app SUR LE BON ONGLET (P2.38) ---
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const data = e.notification.data || {};
  const tab = data.tab || "";
  // Si l'app est déjà ouverte → on la focalise ET on lui dit quel onglet afficher (postMessage).
  // Sinon → on ouvre une fenêtre avec ?tab=… (la page lit ce paramètre au démarrage).
  const target = tab ? ("./app.html?tab=" + encodeURIComponent(tab)) : (data.url || "./app.html");
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((cl) => {
      for (const c of cl) {
        if ("focus" in c) { if (tab) { try { c.postMessage({ type: "sm-nav", tab: tab }); } catch (_) {} } return c.focus(); }
      }
      if (clients.openWindow) return clients.openWindow(target);
    })
  );
});
