// SunMates — service worker (PWA)
// Met en cache la "coquille" de l'app pour un démarrage rapide et un
// fonctionnement de base hors-ligne. Les appels Supabase/CDN passent
// toujours par le réseau (non mis en cache).
const CACHE = "sunmates-v61";
const SHELL = ["./", "./index.html", "./manifest.json", "./icon.svg",
  "./icon-192.png", "./icon-512.png", "./icon-180.png", "./icon-maskable-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return; // ne touche pas aux écritures Supabase
  // Navigation : réseau d'abord, repli sur la coquille en cache (hors-ligne)
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).catch(() => caches.match("./index.html")));
    return;
  }
  // Autres GET de même origine : cache d'abord, sinon réseau
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    e.respondWith(caches.match(req).then((c) => c || fetch(req)));
  }
});

// --- Web Push : afficher la notification reçue (même app fermée) ---
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { title: "SunMates", body: e.data ? e.data.text() : "" }; }
  const title = d.title || "SunMates";
  const opts = {
    body: d.body || "",
    icon: "icon.svg",
    badge: "icon.svg",
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
