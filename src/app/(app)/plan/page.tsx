import Link from "next/link";
import { getProfile, getRecentRuns } from "@/lib/session";
import { getWorkout } from "@/lib/workouts";
import { weeklyDistanceKm } from "@/lib/stats";
import { WorkoutRow } from "@/components/ds/atoms";
import { formatPace } from "@/lib/utils";
import type { RunGoal } from "@/lib/supabase/types";

export default function PlanPage() {
  return <PlanContent />;
}

/** Relative effort. Load is shown as a bar width, not a number. */
const LOAD: Record<string, number> = {
  recovery: 0.35,
  easy: 0.5,
  long: 1,
  tempo: 0.8,
  intervals: 0.9,
  race: 1,
  strength: 0.4,
  rest: 0,
};

/**
 * The week the coach has written, Monday first. A rest day is a row like any
 * other — the plan includes not running, so it can't be read as a gap.
 */
const WEEK: { id: RunGoal | "rest" | "strength"; detail?: string; tag?: string }[] = [
  { id: "rest" },
  { id: "easy" },
  { id: "strength", detail: "25 min · calves & hips" },
  { id: "easy", detail: "30 min · calf permitting", tag: "Moved" },
  { id: "rest" },
  { id: "tempo" },
  { id: "long", detail: "Conversational throughout" },
];

async function PlanContent() {
  const [profile, runs] = await Promise.all([getProfile(), getRecentRuns()]);

  const weekKm = weeklyDistanceKm(runs);
  const goalKm = profile.weekly_goal_km;

  // Monday of the current week, so the rows line up with real calendar days.
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));

  const days = WEEK.map((entry, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    const isRun = entry.id !== "rest" && entry.id !== "strength";
    const workout = isRun ? getWorkout(entry.id) : null;

    return {
      ...entry,
      date,
      isToday: date.toDateString() === now.toDateString(),
      name: workout
        ? workout.name
        : entry.id === "strength"
          ? "Strength"
          : "Rest",
      detail:
        entry.detail ??
        (workout
          ? `${workout.durationLabel.replace("~", "")} · ${formatPace(
              workout.targetPace
            )} /km`
          : undefined),
      href: workout ? `/run?w=${entry.id}` : undefined,
    };
  });

  const plannedKm = WEEK.reduce((sum, e) => {
    if (e.id === "rest" || e.id === "strength") return sum;
    return sum + getWorkout(e.id).distance / 1000;
  }, 0);

  return (
    <div className="flex min-h-[calc(100dvh-11rem)] flex-col">
      <header className="flex flex-col gap-1.5">
        <div className="t-label">
          This week · {plannedKm.toFixed(0)} km planned
        </div>
        <h1 className="t-voice">Build block</h1>
      </header>

      {/* A list, not a grid — a month grid asks the runner to do the reading. */}
      <div className="mt-[22px] flex flex-col">
        {days.map((day) => (
          <WorkoutRow
            key={day.date.toISOString()}
            variant="list"
            day={day.date.toLocaleDateString("en-GB", { weekday: "short" })}
            date={String(day.date.getDate()).padStart(2, "0")}
            name={day.name}
            detail={day.detail}
            tag={day.tag}
            load={LOAD[day.id] ?? 0.5}
            selected={day.isToday}
            href={day.href}
          />
        ))}
      </div>

      <Link
        href="/coach"
        className="mb-[18px] mt-auto rounded-[18px] bg-muted px-[18px] py-4 text-[13px] leading-[1.5] text-foreground/65 text-pretty"
      >
        {weekKm >= goalKm
          ? "You're past the week's distance already. Two weeks of building left, then you get an easy one."
          : `${(goalKm - weekKm).toFixed(0)} km left this week. Two weeks of building, then you get an easy one.`}{" "}
        <span className="text-accent">Talk to me about the plan →</span>
      </Link>
    </div>
  );
}
