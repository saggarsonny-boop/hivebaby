// ParkBack service worker
// Caches the app shell so the page loads in underground garages with no signal.

// Cache name bumped from v2 → v3 to force re-install on every existing client
// and clear stale precached "/" HTML from the PR #66–#70 era. Bump again
// (v3 → v4 etc) any time a future change might leave users stuck on a stale
// app-shell snapshot.
const CACHE_NAME = "parkback-shell-v3";
const STALE_CACHE_NAMES = ["parkback-shell-v2"];
const SHELL_URLS = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(SHELL_URLS).catch(() => {
        // Don't block install on a single failed asset.
      })
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Explicit cleanup of known-stale caches first (defensive — the generic
      // sweep below would also catch these, but naming them makes the intent
      // obvious and survives a future rename of CACHE_NAME).
      await Promise.all(
        STALE_CACHE_NAMES.map((n) => caches.delete(n).catch(() => {}))
      );
      // Generic sweep of anything else not matching current.
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
      await self.clients.claim();
      // Tell every open client (Safari tabs + home-screen PWA windows) that a
      // new SW is now active, so anyone holding a stale precached "/" from a
      // prior build can reload to the fresh HTML/JS without a manual refresh.
      const clients = await self.clients.matchAll({ type: "window" });
      for (const c of clients) {
        c.postMessage({ type: "SW_ACTIVATED", cache: CACHE_NAME });
      }
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Don't cache geolocation, camera, or any API calls.
  if (url.pathname.startsWith("/api/")) return;

  // Network-first for the page itself, fallback to cache for offline garages.
  if (url.pathname === "/" || url.pathname === "/find") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match("/")))
    );
    return;
  }

  // Cache-first for static shell assets.
  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res.ok && SHELL_URLS.some((u) => url.pathname === u)) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return res;
      });
    })
  );
});
