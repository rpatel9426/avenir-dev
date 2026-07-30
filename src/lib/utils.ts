import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names safely, resolving conflicts (e.g. `p-2 p-4` -> `p-4`).
 * Used by every UI primitive so variants can be overridden from call sites.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a duration given in seconds as `H:MM:SS` (or `MM:SS` under an hour). */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = m.toString().padStart(h > 0 ? 2 : 1, "0");
  const ss = s.toString().padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Convert a pace in seconds-per-kilometre to a `M:SS /km` label. */
export function formatPace(secondsPerKm: number): string {
  if (!isFinite(secondsPerKm) || secondsPerKm <= 0) return "--:--";
  const m = Math.floor(secondsPerKm / 60);
  const s = Math.round(secondsPerKm % 60);
  // Handle rounding that pushes seconds to 60.
  const adjM = s === 60 ? m + 1 : m;
  const adjS = s === 60 ? 0 : s;
  return `${adjM}:${adjS.toString().padStart(2, "0")}`;
}

/** Format a distance in metres as kilometres with two decimals. */
export function formatDistance(metres: number): string {
  return (metres / 1000).toFixed(2);
}
