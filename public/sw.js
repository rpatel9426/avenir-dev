/*
 * Avenir service worker.
 * Minimal, dependency-free. Its job:
 *   1. Satisfy PWA installability (a fetch handler + manifest + https).
 *   2. Cache static assets so repeat loads are instant.
 *   3. Show a graceful offline screen if a navigation fails with no network.
 * It intentionally never caches API routes or auth so data stays fresh.
 */

const CACHE = "avenir-static-v2";
/*
 * The plan is the one thing you need on a plane, so /plan is kept as a
 * stale-while-revalidate copy: the last version you loaded is always
 * readable offline, and it refreshes silently whenever there is a network.
 * Nothing else is cached this way — a stale Today or a stale Coach would be
 * worse than an honest offline screen.
 */
const OFFLINE_FIRST_PATHS = ["/plan"];

const OFFLINE_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Offline · Avenir</title>
<style>
  html,body{height:100%;margin:0;background:#f4f2ed;color:#141a16;
    font-family:system-ui,-apple-system,sans-serif;
    display:flex;align-items:center;justify-content:center;text-align:center}
  .wrap{max-width:20rem;padding:2rem}
  h1{font-size:1.25rem;margin:0 0 .5rem;letter-spacing:-.01em}
  p{color:#5d6461;font-size:.9rem;line-height:1.5;margin:0}
  .dot{width:8px;height:8px;border-radius:50%;background:#1f6b3a;
    display:inline-block;margin-bottom:1rem}
</style></head><body><div class="wrap">
  <span class="dot"></span>
  <h1>No signal</h1>
  <p>Your plan is still here — open Plan and it will load from the last time you had a connection. Nothing you've run is lost.</p>
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

  // Navigations: network-first, fall back to a cached copy where we keep one,
  // then to an offline screen.
  if (request.mode === "navigate") {
    const keepOffline = OFFLINE_FIRST_PATHS.includes(url.pathname);

    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (keepOffline && response.ok) {
            const cache = await caches.open(CACHE);
            cache.put(request, response.clone());
          }
          return response;
        } catch {
          if (keepOffline) {
            const cached = await caches.match(request);
            if (cached) return cached;
          }
          return new Response(OFFLINE_HTML, {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          });
        }
      })()
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
