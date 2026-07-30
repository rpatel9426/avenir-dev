import type { RunGoal } from "@/lib/supabase/types";

export interface Workout {
  id: RunGoal;
  name: string;
  tagline: string;
  /** Target pace in seconds per kilometre. */
  targetPace: number;
  /** Suggested distance in metres (used for the finish-line coaching). */
  distance: number;
  /** Rough duration label for the card. */
  durationLabel: string;
  accent: "primary" | "accent";
}

/**
 * The starter library of coached sessions. Paces here are sensible defaults for
 * an intermediate runner; a real deployment would personalise these from the
 * runner's `preferred_pace_sec_per_km`.
 */
export const WORKOUTS: Workout[] = [
  {
    id: "easy",
    name: "Easy Run",
    tagline: "Conversational effort to build your base.",
    targetPace: 360, // 6:00 /km
    distance: 5000,
    durationLabel: "~30 min",
    accent: "primary",
  },
  {
    id: "tempo",
    name: "Tempo",
    tagline: "Comfortably hard. Sharpen your threshold.",
    targetPace: 300, // 5:00 /km
    distance: 6000,
    durationLabel: "~30 min",
    accent: "accent",
  },
  {
    id: "intervals",
    name: "Intervals",
    tagline: "Fast reps to unlock a new gear.",
    targetPace: 270, // 4:30 /km
    distance: 5000,
    durationLabel: "~28 min",
    accent: "accent",
  },
  {
    id: "long",
    name: "Long Run",
    tagline: "Time on feet. Patience and endurance.",
    targetPace: 375, // 6:15 /km
    distance: 12000,
    durationLabel: "~75 min",
    accent: "primary",
  },
  {
    id: "recovery",
    name: "Recovery",
    tagline: "Gentle shakeout to help you rebuild.",
    targetPace: 400, // 6:40 /km
    distance: 4000,
    durationLabel: "~25 min",
    accent: "primary",
  },
  {
    id: "race",
    name: "Race",
    tagline: "Race-effort execution. Composed and committed.",
    targetPace: 285, // 4:45 /km
    distance: 5000,
    durationLabel: "~24 min",
    accent: "accent",
  },
];

/** Distance options (km) offered on the pre-run screen. */
export const DISTANCE_OPTIONS_KM = [3, 5, 8, 10, 15, 21];

export function getWorkout(id: string): Workout {
  return WORKOUTS.find((w) => w.id === id) ?? WORKOUTS[0];
}
