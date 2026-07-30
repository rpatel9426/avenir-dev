/*
 * Avenir service worker.
 * Minimal, dependency-free. Its job:
 *   1. Satisfy PWA installability (a fetch handler + manifest + https).
 *   2. Cache static assets so repeat loads are instant.
 *   3. Show a graceful offline screen if a navigation fails with no network.
 * It intentionally never caches API routes or auth so data stays fresh.
 */

const CACHE = "avenir-static-v1";

const OFFLINE_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Offline · Avenir</title>
<style>
  html,body{height:100%;margin:0;background:#0b0d11;color:#f5f6f7;
    font-family:system-ui,-apple-system,sans-serif;
    display:flex;align-items:center;justify-content:center;text-align:center}
  .wrap{max-width:20rem;padding:2rem}
  h1{font-size:1.25rem;margin:0 0 .5rem;letter-spacing:-.01em}
  p{color:#9aa0a6;font-size:.9rem;line-height:1.5;margin:0}
  .dot{width:8px;height:8px;border-radius:50%;background:#c6f24e;
    display:inline-block;margin-bottom:1rem}
</style></head><body><div class="wrap">
  <span class="dot"></span>
  <h1>You're offline</h1>
  <p>Avenir needs a connection to load. Your runs are safe — reconnect and pull to refresh.</p>
</div></body></html>`;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Drop stale caches from older versions.
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // let cross-origin pass through
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) return;

  // Navigations: network-first, fall back to an offline screen.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(OFFLINE_HTML, {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          })
      )
    );
    return;
  }

  // Static assets (JS/CSS/fonts/images): cache-first for instant repeat loads.
  const cacheable =
    url.pathname.startsWith("/_next/static") ||
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "font" ||
    request.destination === "image";

  if (!cacheable) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      } catch {
        return cached ?? Response.error();
      }
    })()
  );
});
