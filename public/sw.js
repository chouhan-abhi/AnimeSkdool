const CACHE_NAME = "anime-calendar-static-v4";
const RUNTIME_CACHE = "anime-calendar-runtime-v4";
const MAX_RUNTIME_ENTRIES = 50; // Reduced for mobile - prevent memory issues
const MAX_IMAGE_CACHE_SIZE = 20; // Limit image cache separately
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/skdool.svg",
  "/offline.html",
  "/offline.png",
];

// Utility → limit cache size - iterative to prevent stack overflow
async function limitCacheSize(cacheName, maxItems) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    // Use iterative approach instead of recursion to prevent stack overflow
    while (keys.length > maxItems) {
      try {
        await cache.delete(keys[0]);
        keys.shift(); // Remove from array
      } catch (error) {
        console.error("Error deleting cache key:", error);
        keys.shift(); // Continue even if delete fails
      }
    }
  } catch (error) {
    console.error(`Error limiting cache size for ${cacheName}:`, error);
  }
}

// Install → cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .catch((error) => {
        console.error("Service Worker install error:", error);
        // Continue even if caching fails
      })
  );
  self.skipWaiting();
});

// Activate → clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key).catch((err) => {
              console.error(`Error deleting cache ${key}:`, err);
              return null; // Continue even if delete fails
            }))
        )
      )
      .catch((error) => {
        console.error("Service Worker activate error:", error);
      })
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
      caches.match(request)
        .then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              // Only cache successful responses
              if (networkResponse && networkResponse.status === 200 && networkResponse.clone) {
                caches.open(RUNTIME_CACHE)
                  .then((cache) => {
                    try {
                      cache.put(request, networkResponse.clone());
                      limitCacheSize(RUNTIME_CACHE, MAX_RUNTIME_ENTRIES);
                    } catch (error) {
                      console.error("Error caching API response:", error);
                    }
                  })
                  .catch((error) => {
                    console.error("Error opening cache for API:", error);
                  });
              }
              return networkResponse;
            })
            .catch((error) => {
              console.error("API fetch error:", error);
              // Offline fallback → return cached API response
              if (cachedResponse) return cachedResponse;
              return new Response(
                JSON.stringify({ data: [], message: "Offline mode: No cached data" }),
                { 
                  headers: { "Content-Type": "application/json" },
                  status: 200
                }
              );
            });

          return cachedResponse || fetchPromise;
        })
        .catch((error) => {
          console.error("Cache match error for API:", error);
          // Fallback to network
          return fetch(request).catch(() => new Response(
            JSON.stringify({ data: [], message: "Offline mode: No cached data" }),
            { 
              headers: { "Content-Type": "application/json" },
              status: 200
            }
          ));
        })
    );
    return;
  }

  // ✅ Images → Cache First with fallback (limited cache size for mobile)
  if (request.destination === "image") {
    event.respondWith(
      caches.match(request)
        .then((cached) => {
          if (cached) return cached;
          
          return fetch(request)
            .then((response) => {
              // Only cache successful image responses
              if (response && response.status === 200 && response.clone) {
                caches.open(RUNTIME_CACHE)
                  .then((cache) => {
                    try {
                      cache.put(request, response.clone());
                      // Use smaller limit for images on mobile
                      limitCacheSize(RUNTIME_CACHE, MAX_IMAGE_CACHE_SIZE);
                    } catch (error) {
                      console.error("Error caching image:", error);
                    }
                  })
                  .catch((error) => {
                    console.error("Error opening cache for image:", error);
                  });
              }
              return response;
            })
            .catch((error) => {
              console.error("Image fetch error:", error);
              return caches.match("/offline.png").catch(() => {
                // If offline.png also fails, return empty response
                return new Response("", { status: 404 });
              });
            });
        })
        .catch((error) => {
          console.error("Cache match error for image:", error);
          // Fallback to network
          return fetch(request).catch(() => caches.match("/offline.png").catch(() => new Response("", { status: 404 })));
        })
    );
    return;
  }

  // ✅ Static files → Stale While Revalidate
  event.respondWith(
    caches.match(request)
      .then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            // Only cache successful responses that are cloneable
            if (response && response.status === 200 && response.clone) {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  try {
                    cache.put(request, response.clone());
                  } catch (error) {
                    console.error("Error caching static file:", error);
                  }
                })
                .catch((error) => {
                  console.error("Error opening cache for static file:", error);
                });
            }
            return response;
          })
          .catch((error) => {
            console.error("Static file fetch error:", error);
            if (request.mode === "navigate") {
              return caches.match("/index.html").catch(() => {
                // If index.html is not cached, return empty response
                return new Response("", { status: 404 });
              });
            }
            // Return cached version if available
            return cached || new Response("", { status: 404 });
          });

        return cached || fetchPromise;
      })
      .catch((error) => {
        console.error("Cache match error for static file:", error);
        // Fallback to network
        return fetch(request).catch(() => {
          if (request.mode === "navigate") {
            return caches.match("/index.html").catch(() => new Response("", { status: 404 }));
          }
          return new Response("", { status: 404 });
        });
      })
  );
});
