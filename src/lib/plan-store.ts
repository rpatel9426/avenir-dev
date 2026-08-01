import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { LOAD, WEEK, plannedWeek, weekStart, type PlannedDay } from "@/lib/plan";
import { getWorkout } from "@/lib/workouts";
import type { RunGoal } from "@/lib/supabase/types";

/**
 * The runner's week, read from the database rather than a constant.
 *
 * The template in lib/plan.ts is now only a starting shape: the first time a
 * runner looks at a week, it's written into plan_sessions, and from then on
 * that row is the truth. That's what makes an accepted plan change in Coach
 * survive a refresh and show up on the Plan tab.
 *
 * Demo mode has no database, so it keeps using the template directly.
 */

const RUN_KINDS: RunGoal[] = [
  "easy",
  "long",
  "tempo",
  "intervals",
  "recovery",
  "race",
];

function isRunKind(kind: string): kind is RunGoal {
  return (RUN_KINDS as string[]).includes(kind);
}

/** An ISO date (YYYY-MM-DD) in local time, which is how the rows are keyed. */
export function isoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toPlannedDay(
  row: { scheduled_on: string; kind: string; detail: string | null; tag: string | null },
  now: Date
): PlannedDay {
  // Parse as local midnight so the weekday label matches the runner's calendar.
  const [y, m, d] = row.scheduled_on.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const workout = isRunKind(row.kind) ? getWorkout(row.kind) : null;

  return {
    id: isRunKind(row.kind) ? row.kind : (row.kind as "rest" | "strength"),
    detail: row.detail ?? undefined,
    tag: row.tag ?? undefined,
    date,
    workout,
    isToday: date.toDateString() === now.toDateString(),
    name: workout
      ? workout.name
      : row.kind === "strength"
        ? "Strength"
        : "Rest",
  };
}

/**
 * This week's sessions. Seeds from the template on first read so a new runner
 * has a plan without a separate onboarding write.
 */
export async function getWeek(now = new Date()): Promise<PlannedDay[]> {
  if (!isSupabaseConfigured()) return plannedWeek(now);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return plannedWeek(now);

  const monday = weekStart(now);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const { data: rows } = await supabase
    .from("plan_sessions")
    .select("scheduled_on, kind, detail, tag")
    .eq("user_id", user.id)
    .gte("scheduled_on", isoDate(monday))
    .lte("scheduled_on", isoDate(sunday))
    .order("scheduled_on");

  if (rows && rows.length > 0) {
    return rows.map((r) => toPlannedDay(r, now));
  }

  // First look at this week — write the template, then use it.
  const seed = WEEK.map((entry, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return {
      user_id: user.id,
      scheduled_on: isoDate(date),
      kind: entry.id,
      detail: entry.detail ?? null,
      tag: entry.tag ?? null,
      load: LOAD[entry.id] ?? 0.5,
    };
  });

  const { error } = await supabase
    .from("plan_sessions")
    .upsert(seed, { onConflict: "user_id,scheduled_on" });

  // A failed seed is not worth a broken screen — fall back to the template.
  if (error) return plannedWeek(now);

  return seed.map((r) => toPlannedDay(r, now));
}

/** Today's session, from the same source as the Plan tab. */
export async function getToday(now = new Date()): Promise<PlannedDay> {
  const week = await getWeek(now);
  return week.find((d) => d.isToday) ?? week[0];
}
