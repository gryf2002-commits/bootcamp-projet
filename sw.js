// SunMates — service worker (PWA)
// Démarrage quasi-instantané + offline réel : on précache la coquille, on met en
// cache à la volée les libs CDN et les images (avatars, tuiles de carte) en
// "stale-while-revalidate" (on sert le cache tout de suite, on rafraîchit en fond).
// Les écritures Supabase (POST/PATCH…) ne sont jamais touchées.
const VER = "v483";
const SHELL_CACHE = "sunmates-shell-" + VER;   // coquille (versionnée → purge à chaque déploiement)
const RUNTIME = "sunmates-rt-" + VER;          // libs CDN/fonts (regénéré par version, re-précaché à l'install)
// #15/#8 : cache MÉDIA STABLE (NON versionné) → avatars, photos (quêtes/check-ins), tuiles de carte.
// Ces URLs sont stables (le contenu ne change pas), donc on les GARDE entre les déploiements :
// fini le rechargement de toutes les images/tuiles à chaque MAJ de version. Borné en taille (LRU).
const MEDIA = "sunmates-media";
const MEDIA_MAX = 350;
const SHELL = ["./", "./index.html", "./manifest.json", "./icon.svg", "./sunmates-badges.js", "./sunmates-icons-v2.js", "./sunmates-da-loader.js",
  "./icon-192.png", "./icon-512.png", "./icon-180.png", "./icon-maskable-512.png", "./badge-96.png"];
// Libs CDN précachées dès l'install → carte/QR/etc. dispo INSTANTANÉMENT et hors-ligne (cache plus "lourd" mais + fluide).
const CDN_PRECACHE = [
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
    // avatars/photos/tuiles à chaque MAJ → fini le rechargement de toutes les images à chaque deploy).
    await Promise.all(keys.filter((k) => k !== SHELL_CACHE && k !== RUNTIME && k !== MEDIA).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Borne la taille d'un cache (LRU grossier : on supprime les plus anciennes entrées en tête).
async function trimCache(cacheName, max) {
  try { const c = await caches.open(cacheName); const keys = await c.keys(); if (keys.length > max) { for (let i = 0; i < keys.length - max; i++) await c.delete(keys[i]); } } catch (e) {}
}
// Réponse depuis le cache, rafraîchie en fond (stale-while-revalidate).
async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  // Pour les MÉDIAS déjà en cache : on sert le cache et on NE re-fetch PAS (cache-first) → instantané
  // et zéro requête réseau inutile (avatars/tuiles ne changent pas). Sinon on va chercher + on stocke.
  if (cached && cacheName === MEDIA) return cached;
  const network = fetch(req).then((res) => {
    if (res && (res.ok || res.type === "opaque")) { cache.put(req, res.clone()).then(() => { if (cacheName === MEDIA) trimCache(MEDIA, MEDIA_MAX); }).catch(() => {}); }
    return res;
  }).catch(() => null);
  return cached || (await network) || new Response("", { status: 504 });
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return; // ne touche pas aux écritures Supabase

  const url = new URL(req.url);

  // 1) Navigation : réseau d'abord (dernière version), MAIS avec un GARDE-FOU de TIMEOUT.
  // cache:"no-store" → on bypasse le cache HTTP du navigateur + le CDN GitHub Pages/Fastly.
  //   ⚠️ BUG « chargement infini » corrigé (v468) : sans timeout, si l'edge est lent juste
  //   après un déploiement, la requête réseau ne résout NI ne rejette → la page tournait à
  //   l'infini. On court-circuite désormais après 6 s en servant la coquille en cache (toujours
  //   la version courante : précachée fraîche à l'install). Hors-ligne → repli immédiat aussi.
  if (req.mode === "navigate") {
    e.respondWith((async () => {
      const fallback = () => caches.match("./index.html").then((c) => c || fetch(req.url).catch(() => new Response("", { status: 504 })));
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 6000);
        const res = await fetch(req.url, { cache: "no-store", signal: ctrl.signal });
        clearTimeout(timer);
        if (res && res.ok) { const c = res.clone(); caches.open(SHELL_CACHE).then((cc) => cc.put("./index.html", c)).catch(() => {}); }
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
      }).catch(() => caches.match(req, { ignoreSearch: true }).then((c) => c || caches.match("./index.html")))
    );
    return;
  }

  // 3) CDN libs (Leaflet, fonts, gstatic, tuiles de carte) + images : SWR runtime.
  // IMPORTANT : Supabase n'est PAS dans cette liste → ses GET REST/Auth (profils, messages,
  // session/token) ne sont JAMAIS servis depuis le cache (données toujours fraîches pour une
  // app temps réel/sécurité). Seules ses IMAGES Storage (avatars) sont cachées via `isImg`.
  const host = url.hostname;
  // Tuiles de carte + images (avatars Supabase Storage, photos de quêtes/check-ins, picsum, pravatar)
  // → cache MÉDIA STABLE (survit aux MAJ, cache-first = instantané). #8 carte + #15 photos.
  // tiles.openfreemap.org = style JSON + glyphes + tuiles vectorielles (.pbf) du fond SunMates.
  const isTile = /(^|\.)(tile\.openstreetmap\.org|basemaps\.cartocdn\.com|tiles\.openfreemap\.org)$/i.test(host);
  const isImg = req.destination === "image"
    || /(^|\.)(picsum\.photos|fastly\.picsum\.photos|i\.pravatar\.cc)$/i.test(host)
    || (/(^|\.)supabase\.co$/i.test(host) && /\/storage\//.test(url.pathname));
  if (isImg || isTile) { e.respondWith(staleWhileRevalidate(req, MEDIA)); return; }
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
    data: { url: d.url || "./", tab: d.tab || "" }, // P2.38 : onglet cible transporté dans la notif
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
  const target = tab ? ("./?tab=" + encodeURIComponent(tab)) : (data.url || "./");
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((cl) => {
      for (const c of cl) {
        if ("focus" in c) { if (tab) { try { c.postMessage({ type: "sm-nav", tab: tab }); } catch (_) {} } return c.focus(); }
      }
      if (clients.openWindow) return clients.openWindow(target);
    })
  );
});
