"use client";

import { useMemo, useState } from "react";
import { PreRun } from "@/components/run/pre-run";
import { RunBriefing } from "@/components/run/run-briefing";
import { RunSession } from "@/components/run/run-session";
import { DISTANCE_OPTIONS_KM, getWorkout, type Workout } from "@/lib/workouts";

type Phase = "plan" | "brief" | "live";

/** Snap a distance (km) to the nearest offered option so a chip is always active. */
function nearestDistance(km: number): number {
  return DISTANCE_OPTIONS_KM.reduce((best, opt) =>
    Math.abs(opt - km) < Math.abs(best - km) ? opt : best
  );
}

/**
 * Top-level state machine for the Run tab:
 *   plan (choose session + distance) → briefing (coach explains) → live run.
 * Remounting RunSession via `key` guarantees a clean slate for every run.
 */
export function RunExperience({
  initialWorkoutId,
  premium,
}: {
  initialWorkoutId: string;
  premium: boolean;
}) {
  const [workout, setWorkout] = useState<Workout>(() =>
    getWorkout(initialWorkoutId)
  );
  const [distanceKm, setDistanceKm] = useState<number>(() =>
    nearestDistance(getWorkout(initialWorkoutId).distance / 1000)
  );
  const [phase, setPhase] = useState<Phase>("plan");
  const [runKey, setRunKey] = useState(0);

  // Apply the chosen distance goal to the session.
  const effectiveWorkout = useMemo<Workout>(
    () => ({ ...workout, distance: distanceKm * 1000 }),
    [workout, distanceKm]
  );

  if (phase === "plan") {
    return (
      <PreRun
        workout={workout}
        distanceKm={distanceKm}
        onSelect={(w) => {
          setWorkout(w);
          setDistanceKm(nearestDistance(w.distance / 1000));
        }}
        onDistanceChange={setDistanceKm}
        onContinue={() => setPhase("brief")}
      />
    );
  }

  if (phase === "brief") {
    return (
      <RunBriefing
        workout={effectiveWorkout}
        distanceKm={distanceKm}
        onBack={() => setPhase("plan")}
        onStart={() => {
          setRunKey((k) => k + 1);
          setPhase("live");
        }}
      />
    );
  }

  return (
    <RunSession
      key={`${workout.id}-${distanceKm}-${runKey}`}
      workout={effectiveWorkout}
      premium={premium}
    />
  );
}
