// SunMates — service worker (PWA)
// Démarrage quasi-instantané + offline réel : on précache la coquille, on met en
// cache à la volée les libs CDN et les images (avatars, tuiles de carte) en
// "stale-while-revalidate" (on sert le cache tout de suite, on rafraîchit en fond).
// Les écritures Supabase (POST/PATCH…) ne sont jamais touchées.
const VER = "v362";
const SHELL_CACHE = "sunmates-shell-" + VER;   // coquille (versionnée → purge à chaque déploiement)
const RUNTIME = "sunmates-rt-" + VER;          // CDN + images (regénéré par version)
const SHELL = ["./", "./index.html", "./manifest.json", "./icon.svg", "./sunmates-badges.js", "./sunmates-icons.js",
  "./icon-192.png", "./icon-512.png", "./icon-180.png", "./icon-maskable-512.png", "./badge-96.png"];
// Libs CDN précachées dès l'install → carte/QR/etc. dispo INSTANTANÉMENT et hors-ligne (cache plus "lourd" mais + fluide).
const CDN_PRECACHE = [
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js",
  "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css",
  "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css",
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
    // On garde uniquement les caches de la version courante.
    await Promise.all(keys.filter((k) => k !== SHELL_CACHE && k !== RUNTIME).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Réponse depuis le cache, rafraîchie en fond (stale-while-revalidate).
async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const network = fetch(req).then((res) => {
    if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone()).catch(() => {});
    return res;
  }).catch(() => null);
  return cached || (await network) || new Response("", { status: 504 });
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return; // ne touche pas aux écritures Supabase

  const url = new URL(req.url);

  // 1) Navigation : réseau d'abord (pour avoir la dernière version), repli coquille hors-ligne.
  // cache:"no-store" → on BYPASSE le cache HTTP du navigateur ET le CDN GitHub Pages/Fastly
  //   (qui peuvent servir un index.html périmé plusieurs minutes) → on a TOUJOURS le HTML le plus frais.
  if (req.mode === "navigate") {
    e.respondWith(fetch(req.url, { cache: "no-store" }).catch(() => caches.match("./index.html")));
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
      }).catch(() => caches.match(req).then((c) => c || caches.match("./index.html")))
    );
    return;
  }

  // 3) CDN libs (Leaflet, fonts, gstatic, tuiles de carte) + images : SWR runtime.
  // IMPORTANT : Supabase n'est PAS dans cette liste → ses GET REST/Auth (profils, messages,
  // session/token) ne sont JAMAIS servis depuis le cache (données toujours fraîches pour une
  // app temps réel/sécurité). Seules ses IMAGES Storage (avatars) sont cachées via `isImg`.
  const host = url.hostname;
  const isCdn = /(^|\.)(jsdelivr\.net|unpkg\.com|cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com|tile\.openstreetmap\.org|basemaps\.cartocdn\.com|picsum\.photos|fastly\.picsum\.photos)$/i.test(host);
  const isImg = req.destination === "image";
  if (isCdn || isImg) {
    e.respondWith(staleWhileRevalidate(req, RUNTIME));
    return;
  }
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
