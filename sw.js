const CACHE_VERSION = "v2";
const STATIC_CACHE = `green-habits-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `green-habits-runtime-${CACHE_VERSION}`;

const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./icons/icon.svg",
];

function isCacheable(response) {
  return Boolean(response && response.ok);
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (isCacheable(networkResponse)) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (_error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return caches.match("./index.html");
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const networkPromise = fetch(request)
    .then(async (networkResponse) => {
      if (isCacheable(networkResponse)) {
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => null);

  if (cached) {
    return cached;
  }

  const networkResponse = await networkPromise;
  if (networkResponse) {
    return networkResponse;
  }

  if (request.mode === "navigate") {
    return caches.match("./index.html");
  }

  return new Response("Offline", {
    status: 503,
    statusText: "Offline",
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isNavigation = request.mode === "navigate";

  if (!isSameOrigin) {
    if (isNavigation) {
      event.respondWith(networkFirst(request));
    }
    return;
  }

  if (isNavigation) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});
