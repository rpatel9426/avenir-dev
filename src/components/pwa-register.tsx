"use client";

import { useEffect } from "react";

/**
 * Registers the service worker so Avenir is installable and works offline.
 * Only in production — a SW in dev fights with hot-reload and caches stale code.
 */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* registration is best-effort; the app works fine without it */
      });
    };
    // Register after load so it never competes with first paint.
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}
