import Link from "next/link";
import { Metric } from "@/components/ds/atoms";
import { formatPace } from "@/lib/utils";
import type { RunGoal } from "@/lib/supabase/types";
import type { Workout } from "@/lib/workouts";

/** The effort a session sits at, in the runner's language rather than a number. */
const ZONE: Record<RunGoal, string> = {
  easy: "Zone 2",
  recovery: "Zone 1",
  long: "Zone 2",
  tempo: "Threshold",
  intervals: "VO₂ max",
  race: "Race effort",
};

/**
 * Today's session. One question per screen: what do I do today? The card
 * answers it with a sentence's worth of structure — name, effort, the two
 * numbers that matter — and nothing else.
 */
export function TodaySession({ workout }: { workout: Workout }) {
  const paceLow = formatPace(workout.targetPace);
  const paceHigh = formatPace(workout.targetPace + 30);
  const minutes = workout.durationLabel.replace(/[^\d]/g, "");

  return (
    <div className="flex flex-col gap-[18px] rounded-[22px] bg-card p-[22px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border dark:border-border dark:shadow-none">
      <div className="flex items-center justify-between gap-3">
        <h2 className="t-title">{workout.name}</h2>
        <span className="t-label rounded-full bg-accent-wash px-2.5 py-1.5 tracking-[0.1em] text-accent">
          {ZONE[workout.id]}
        </span>
      </div>

      <div className="flex gap-[26px]">
        <Metric value={minutes} unit=" min" label="Duration" />
        <Metric value={paceLow} unit={`–${paceHigh}`} label="Pace /km" />
      </div>

      <div className="h-px bg-border" />

      <details className="group">
        <summary className="open-mark flex cursor-pointer list-none items-center justify-between text-[12.5px] font-medium text-muted-foreground [&::-webkit-details-marker]:hidden">
          Why this run?
        </summary>
        <p className="t-body mt-3 text-muted-foreground">{workout.tagline}</p>
      </details>
    </div>
  );
}

/** The primary action. 60px, ink on paper, with the commitment stated on it. */
export function StartRunAction({ workout }: { workout: Workout }) {
  const minutes = workout.durationLabel.replace(/[^\d]/g, "");

  return (
    <div className="flex flex-col gap-3">
      <Link
        href={`/run?w=${workout.id}`}
        className="flex h-15 items-center justify-center gap-2.5 rounded-full bg-primary text-base font-bold text-primary-foreground transition-[filter] duration-[90ms] active:brightness-110"
      >
        Start run
        <span className="text-[13px] font-medium text-primary-foreground/50">
          {minutes}:00
        </span>
      </Link>
      <Link
        href="/coach?ask=cant-run"
        className="text-center text-[12.5px] font-medium text-muted-foreground"
      >
        Can&apos;t run today?
      </Link>
    </div>
  );
}
