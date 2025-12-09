const CACHE_NAME = "anime-calendar-static-v5";
const API_CACHE = "anime-calendar-api-v5";
const IMAGE_CACHE = "anime-calendar-images-v5";

// Separate limits for each cache type
const MAX_API_ENTRIES = 30;
const MAX_IMAGE_ENTRIES = 15;

const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/skdool.svg",
];

// Utility → limit cache size - iterative to prevent stack overflow
async function limitCacheSize(cacheName, maxItems) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    // Only clean up if we exceed the limit
    if (keys.length <= maxItems) return;
    
    // Delete oldest entries (FIFO)
    const toDelete = keys.slice(0, keys.length - maxItems);
    for (const key of toDelete) {
      try {
        await cache.delete(key);
      } catch (error) {
        // Continue even if delete fails
      }
    }
  } catch (error) {
    // Silently fail - don't crash the service worker
  }
}

// Install → cache static assets only
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .catch(() => {
        // Continue even if caching fails
      })
  );
  self.skipWaiting();
});

// Activate → clean old caches
self.addEventListener("activate", (event) => {
  const validCaches = [CACHE_NAME, API_CACHE, IMAGE_CACHE];
  
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !validCaches.includes(key))
            .map((key) => caches.delete(key).catch(() => null))
        )
      )
      .catch(() => {
        // Continue even if cleanup fails
      })
  );
  self.clients.claim();
});

// Fetch → different strategies based on request type
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== "GET") return;

  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith("http")) return;

  // ✅ API requests (Jikan API) → Network First with Cache Fallback
  // Changed from Cache First to Network First to prevent stale data issues
  if (request.url.includes("api.jikan.moe")) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Only cache successful responses
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(API_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
                // Clean up old entries asynchronously
                limitCacheSize(API_CACHE, MAX_API_ENTRIES);
              })
              .catch(() => {});
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed → try cache
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) return cachedResponse;
              // No cache → return empty data response
              return new Response(
                JSON.stringify({ data: [], message: "Offline" }),
                { 
                  headers: { "Content-Type": "application/json" },
                  status: 200
                }
              );
            });
        })
    );
    return;
  }

  // ✅ Images → Cache First (images don't change often)
  if (request.destination === "image") {
    event.respondWith(
      caches.match(request)
        .then((cached) => {
          if (cached) return cached;
          
          return fetch(request)
            .then((response) => {
              if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(IMAGE_CACHE)
                  .then((cache) => {
                    cache.put(request, responseToCache);
                    // Clean up old entries asynchronously
                    limitCacheSize(IMAGE_CACHE, MAX_IMAGE_ENTRIES);
                  })
                  .catch(() => {});
              }
              return response;
            })
            .catch(() => {
              // Return empty response for failed images
              return new Response("", { status: 404 });
            });
        })
        .catch(() => {
          return fetch(request).catch(() => new Response("", { status: 404 }));
        })
    );
    return;
  }

  // ✅ Static files → Network First (for fresh builds)
  // This ensures users get the latest JS/CSS after deployments
  if (request.destination === "script" || 
      request.destination === "style" || 
      request.url.includes("/assets/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(request, responseToCache))
              .catch(() => {});
          }
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then((cached) => cached || new Response("", { status: 404 }));
        })
    );
    return;
  }

  // ✅ Navigation requests → Network First with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // ✅ Everything else → Network only (don't cache)
  // This prevents cache bloat from misc requests
});

// Listen for messages to clear cache (useful for debugging)
self.addEventListener("message", (event) => {
  if (event.data === "CLEAR_CACHE") {
    caches.keys().then((keys) => {
      for (const key of keys) {
        caches.delete(key);
      }
    });
  }
});
