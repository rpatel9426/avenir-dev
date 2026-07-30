import type { MetadataRoute } from "next";

/**
 * Web App Manifest — makes Avenir installable to the home screen and launchable
 * as a standalone app (no browser chrome), dark-first.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Avenir — AI Running Companion",
    short_name: "Avenir",
    description:
      "An AI running coach that guides every stride — real-time pacing, adaptive workouts, and a voice in your ear.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0d11",
    theme_color: "#0b0d11",
    categories: ["health", "fitness", "sports", "lifestyle"],
    icons: [
      { src: "/pwa-icon?s=192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon?s=512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon?s=512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
