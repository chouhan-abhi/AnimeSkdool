const CACHE_NAME = "anime-calendar-static-v3";
const RUNTIME_CACHE = "anime-calendar-runtime-v3";
const MAX_RUNTIME_ENTRIES = 100; // store more API responses
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/skdool.svg",
  "/offline.html",
  "/offline.png",
];

// Utility → limit cache size
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    return limitCacheSize(cacheName, maxItems);
  }
}

// Install → cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate → clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch → different strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only cache GET requests
  if (request.method !== "GET") return;

  // ✅ API requests (Jikan API) → Cache First, then Network
  if (request.url.includes("api.jikan.moe")) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, networkResponse.clone());
                limitCacheSize(RUNTIME_CACHE, MAX_RUNTIME_ENTRIES);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Offline fallback → return cached API response
            if (cachedResponse) return cachedResponse;
            return new Response(
              JSON.stringify({ data: [], message: "Offline mode: No cached data" }),
              { headers: { "Content-Type": "application/json" } }
            );
          });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // ✅ Images → Cache First with fallback
  if (request.destination === "image") {
    event.respondWith(
      caches.match(request).then((cached) => {
        return (
          cached ||
          fetch(request)
            .then((response) => {
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, response.clone());
                limitCacheSize(RUNTIME_CACHE, MAX_RUNTIME_ENTRIES);
              });
              return response;
            })
            .catch(() => caches.match("/offline.png"))
        );
      })
    );
    return;
  }

  // ✅ Static files → Stale While Revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            caches.open(CACHE_NAME).then((cache) =>
              cache.put(request, response.clone())
            );
          }
          return response;
        })
        .catch(() => {
          if (request.mode === "navigate") {
            return caches.match("/index.html"); // serve app shell offline
          }
        });

      return cached || fetchPromise;
    })
  );
});
