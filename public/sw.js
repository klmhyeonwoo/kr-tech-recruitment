const CACHE_NAME = "nklcb-v1";
const STATIC_ASSETS = ["/", "/font/PretendardVariable.ttf"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const isNavigationRequest =
    event.request.mode === "navigate" ||
    event.request.headers.get("accept")?.includes("text/html");

  if (isNavigationRequest) {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(event.request).then(
          (cached) =>
            cached ||
            new Response(
              `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>네카라쿠배 채용</title></head><body style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;background:#17171c;color:#fff;margin:0"><div style="text-align:center"><p style="font-size:2rem;margin-bottom:1rem">📶</p><p style="font-size:1.4rem;color:#8b95a1">네트워크에 연결해주세요</p></div></body></html>`,
              { headers: { "Content-Type": "text/html; charset=utf-8" } }
            )
        )
      )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (
          response.ok &&
          (url.pathname.startsWith("/font/") ||
            url.pathname.startsWith("/icon/") ||
            url.pathname.startsWith("/images/") ||
            url.pathname.endsWith(".svg") ||
            url.pathname.endsWith(".png") ||
            url.pathname.endsWith(".webp"))
        ) {
          const clone = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
