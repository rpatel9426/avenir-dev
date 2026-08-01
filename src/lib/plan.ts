import { getWorkout, type Workout } from "@/lib/workouts";
import type { Run, RunGoal } from "@/lib/supabase/types";

/**
 * The week the coach has written. Shared by Today and Plan so the two screens
 * can never disagree about what today is — a rest day on one and a session on
 * the other is exactly the seam the design critique warns about.
 */
export type PlanEntryId = RunGoal | "rest" | "strength";

export interface PlanEntry {
  id: PlanEntryId;
  detail?: string;
  /** A coach edit is tagged, never silent. */
  tag?: string;
}

/** Monday first. Rest is a row like any other — the plan includes not running. */
export const WEEK: PlanEntry[] = [
  { id: "rest" },
  { id: "easy" },
  { id: "strength", detail: "25 min · calves & hips" },
  { id: "easy", detail: "30 min · calf permitting", tag: "Moved" },
  { id: "rest" },
  { id: "tempo" },
  { id: "long", detail: "Conversational throughout" },
];

/** Relative effort. Load is shown as a bar width, never a number. */
export const LOAD: Record<string, number> = {
  recovery: 0.35,
  easy: 0.5,
  long: 1,
  tempo: 0.8,
  intervals: 0.9,
  race: 1,
  strength: 0.4,
  rest: 0,
};

/** Monday of the week containing `date`. */
export function weekStart(date = new Date()): Date {
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export interface PlannedDay extends PlanEntry {
  date: Date;
  isToday: boolean;
  name: string;
  workout: Workout | null;
}

export function plannedWeek(now = new Date()): PlannedDay[] {
  const monday = weekStart(now);

  return WEEK.map((entry, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    const isRun = entry.id !== "rest" && entry.id !== "strength";
    const workout = isRun ? getWorkout(entry.id) : null;

    return {
      ...entry,
      date,
      workout,
      isToday: date.toDateString() === now.toDateString(),
      name: workout
        ? workout.name
        : entry.id === "strength"
          ? "Strength"
          : "Rest",
    };
  });
}

export function today(now = new Date()): PlannedDay {
  const week = plannedWeek(now);
  return week.find((d) => d.isToday) ?? week[0];
}

/**
 * Days since the last run. Drives "the return" — the screen the document calls
 * the highest-stakes in the product. Null when there's no history at all.
 */
export function daysSinceLastRun(runs: Run[], now = new Date()): number | null {
  if (runs.length === 0) return null;

  const last = runs.reduce((latest, r) => {
    const d = new Date(r.created_at);
    return d > latest ? d : latest;
  }, new Date(0));

  const ms = now.getTime() - last.getTime();
  return Math.floor(ms / 86_400_000);
}

/** A gap long enough that making it up all at once would be the real risk. */
export const RETURN_THRESHOLD_DAYS = 7;
