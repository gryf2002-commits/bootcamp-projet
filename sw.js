// SunMates — service worker (PWA)
// Démarrage quasi-instantané + offline réel : on précache la coquille, on met en
// cache à la volée les libs CDN et les images (avatars, tuiles de carte) en
// "stale-while-revalidate" (on sert le cache tout de suite, on rafraîchit en fond).
// Les écritures Supabase (POST/PATCH…) ne sont jamais touchées.
const VER = "v275";
const SHELL_CACHE = "sunmates-shell-" + VER;   // coquille (versionnée → purge à chaque déploiement)
const RUNTIME = "sunmates-rt-" + VER;          // CDN + images (regénéré par version)
const SHELL = ["./", "./index.html", "./manifest.json", "./icon.svg", "./sunmates-badges.js", "./sunmates-icons.js",
  "./icon-192.png", "./icon-512.png", "./icon-180.png", "./icon-maskable-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
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
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).catch(() => caches.match("./index.html")));
    return;
  }

  // 2) Même origine (index.js bundlé, icônes, manifest) : SWR sur la coquille → instantané + frais.
  if (url.origin === self.location.origin) {
    e.respondWith(staleWhileRevalidate(req, SHELL_CACHE));
    return;
  }

  // 3) CDN libs (Supabase, Leaflet, fonts, gstatic…) + images de carte/avatars : SWR runtime.
  const host = url.hostname;
  const isCdn = /(^|\.)(jsdelivr\.net|unpkg\.com|cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com|tile\.openstreetmap\.org|basemaps\.cartocdn\.com|supabase\.co)$/i.test(host);
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
    icon: "./icon-192.png",            // vraie icône couleur, nette
    badge: "./icon-192.png",
    tag: d.tag || "sunmates",
    data: { url: d.url || "./" },
  };
  e.waitUntil(self.registration.showNotification(title, opts));
});

// --- Clic sur la notification : ouvrir / focaliser l'app ---
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const target = (e.notification.data && e.notification.data.url) || "./";
  e.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((cl) => {
      for (const c of cl) { if ("focus" in c) return c.focus(); }
      if (clients.openWindow) return clients.openWindow(target);
    })
  );
});
