import type { Run } from "@/lib/supabase/types";

/** Sum of distance (metres) for runs started within the last 7 days. */
export function weeklyDistanceKm(runs: Run[]): number {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const metres = runs
    .filter((r) => new Date(r.started_at).getTime() >= weekAgo)
    .reduce((sum, r) => sum + r.distance_m, 0);
  return metres / 1000;
}

/** Consecutive-day streak counting back from today (or yesterday). */
export function currentStreak(runs: Run[]): number {
  if (runs.length === 0) return 0;

  const days = new Set(
    runs.map((r) => new Date(r.started_at).toDateString())
  );

  let streak = 0;
  const cursor = new Date();
  // Allow the streak to be "alive" if you haven't run yet today.
  if (!days.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export interface RunTotals {
  runs: number;
  distanceKm: number;
  durationS: number;
}

export function totals(runs: Run[]): RunTotals {
  return {
    runs: runs.length,
    distanceKm: runs.reduce((s, r) => s + r.distance_m, 0) / 1000,
    durationS: runs.reduce((s, r) => s + r.duration_s, 0),
  };
}

/** Time-of-day greeting. */
export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/** Pick the coached session Avenir recommends today, by day of week. */
export function recommendedWorkoutId(date = new Date()): string {
  // A simple, sensible weekly rotation.
  const plan = [
    "recovery", // Sun
    "easy", // Mon
    "intervals", // Tue
    "easy", // Wed
    "tempo", // Thu
    "easy", // Fri
    "long", // Sat
  ];
  return plan[date.getDay()];
}
