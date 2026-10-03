const CACHE_NAME = "app-assets-v2";
// Base path of the app ("/" at the domain root, or "/reel-offline-music-video-app/" on GitHub Pages).
const BASE = new URL(".", self.location.href).pathname;
const OFFLINE_URL = `${BASE}offline.html`;
// The SPA serves the same HTML (the app shell) for every route. The last shell
// loaded online is saved under this key so the app can open offline.
const SHELL_URL = BASE.endsWith("/") ? BASE : `${BASE}/`;
// Never precache the shell at install. Its HTML embeds Vite-hashed asset URLs,
// and only a shell saved during a real page load has its chunks cached with it.
const urlsToCache = [
  OFFLINE_URL,
  `${BASE}icon/icon-192.png`,
  `${BASE}icon/icon-512.png`,
  `${BASE}icon/icon-maskable-192.png`,
  `${BASE}icon/icon-maskable-512.png`,
];
const matchCached = (request) => caches.match(request, { cacheName: CACHE_NAME });
const isHtml = (response) => (response.headers.get("content-type") ?? "").includes("text/html");

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => Promise.allSettled(urlsToCache.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  let url;
  try {
    url = new URL(event.request.url);
  } catch {
    return;
  }
  // Cross-origin (Convex file storage, fonts) is handled by the browser
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith(`${BASE}auth`)) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok && isHtml(response)) {
            const shellToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(SHELL_URL, shellToCache));
          }
          return response;
        })
        .catch(() =>
          matchCached(SHELL_URL)
            .then((shell) => shell ?? matchCached(OFFLINE_URL))
            .then((cached) => cached ?? new Response("Offline", { status: 503 })),
        ),
    );
    return;
  }

  if (!url.pathname.startsWith(`${BASE}assets/`) && !urlsToCache.includes(url.pathname)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response.ok || isHtml(response)) {
          return matchCached(event.request).then((cached) => cached ?? response);
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        return response;
      })
      .catch(() =>
        matchCached(event.request).then(
          (cached) => cached ?? new Response("Offline", { status: 503 }),
        ),
      ),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith("app-assets-") && cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
