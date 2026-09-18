const CACHE_NAME = "forework-v2";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.svg",
  "/icon-512.svg",
  "/vite.svg",
];

// Install event - precache core shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - robust caching strategy ensuring a valid Response is always returned
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests, API calls, and cross-origin requests
  if (
    event.request.method !== "GET" ||
    url.pathname.startsWith("/api/") ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // Navigation requests: Network-first, fallback to cached index.html or fallback Response
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch {
          const cached = (await caches.match("/index.html")) || (await caches.match("/"));
          if (cached) return cached;
          return new Response(
            "<!DOCTYPE html><html><head><title>ForeWork Offline</title></head><body><h2>Offline</h2><p>Please check your internet connection and refresh.</p></body></html>",
            {
              status: 200,
              headers: { "Content-Type": "text/html" },
            }
          );
        }
      })()
    );
    return;
  }

  // Static assets: Cache-first, then network update
  if (
    url.pathname.startsWith("/assets/") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js")
  ) {
    event.respondWith(
      (async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, responseToCache);
          }
          return networkResponse;
        } catch {
          return new Response("", { status: 404, statusText: "Not Found" });
        }
      })()
    );
    return;
  }

  // Default: Network with cache fallback, guaranteed never to resolve to undefined
  event.respondWith(
    (async () => {
      try {
        const networkResponse = await fetch(event.request);
        return networkResponse;
      } catch {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        return new Response("", { status: 404, statusText: "Not Found" });
      }
    })()
  );
});
