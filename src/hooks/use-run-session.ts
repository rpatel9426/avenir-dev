"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { nextCue, type CoachCue, type RunSnapshot } from "@/lib/coach";
import { getMemory } from "@/lib/ai/memory";
import type { Workout } from "@/lib/workouts";

export type RunStatus = "idle" | "running" | "paused" | "finished";

export interface LiveMetrics {
  elapsed: number; // seconds
  distance: number; // metres
  currentPace: number; // sec / km (instantaneous, smoothed)
  avgPace: number; // sec / km
  heartRate: number; // bpm
  calories: number;
  cadence: number; // spm
  elevation: number; // cumulative gain, metres
}

export interface CoachLine extends CoachCue {
  id: number;
  atSecond: number;
  /** Who is speaking. Engine cues + AI replies are "coach"; voice input is "runner". */
  role: "coach" | "runner";
}

const initialMetrics = (): LiveMetrics => ({
  elapsed: 0,
  distance: 0,
  currentPace: 0,
  avgPace: 0,
  heartRate: 96,
  calories: 0,
  cadence: 0,
  elevation: 0,
});

/**
 * Drives a live, coached run.
 *
 * For the MVP the pace/heart-rate stream is *simulated* — it drifts naturally
 * around the workout's target so the coaching feels alive without needing a
 * phone strapped to a treadmill. To go live, replace the body of the interval
 * tick with the browser Geolocation API (`navigator.geolocation.watchPosition`)
 * and a Bluetooth/Web heart-rate source; everything downstream stays the same.
 *
 * All simulation state lives in refs and is advanced inside the interval
 * callback (a real side effect), never inside a setState updater — so it stays
 * correct under React Strict Mode's double-invoked updaters.
 */
export function useRunSession(workout: Workout) {
  const [status, setStatus] = useState<RunStatus>("idle");
  const [metrics, setMetrics] = useState<LiveMetrics>(initialMetrics);
  const [cues, setCues] = useState<CoachLine[]>([]);

  // Mutable simulation state.
  const metricsRef = useRef<LiveMetrics>(initialMetrics());
  const paceRef = useRef(workout.targetPace + 25); // start a touch slow
  const lastCueAt = useRef(0);
  const spokenKm = useRef<Set<number>>(new Set());
  const cueId = useRef(0);
  const paceSum = useRef(0);
  const paceCount = useRef(0);
  const gradeRef = useRef(0); // current terrain grade, fraction (e.g. 0.03 = 3%)

  const reset = useCallback(() => {
    setStatus("idle");
    metricsRef.current = initialMetrics();
    setMetrics(initialMetrics());
    setCues([]);
    paceRef.current = workout.targetPace + 25;
    lastCueAt.current = 0;
    spokenKm.current = new Set();
    cueId.current = 0;
    paceSum.current = 0;
    paceCount.current = 0;
    gradeRef.current = 0;
  }, [workout.targetPace]);

  const start = useCallback(() => setStatus("running"), []);
  const pause = useCallback(() => setStatus("paused"), []);
  const resume = useCallback(() => setStatus("running"), []);
  const finish = useCallback(() => setStatus("finished"), []);

  useEffect(() => {
    if (status !== "running") return;

    const interval = setInterval(() => {
      const prev = metricsRef.current;
      const elapsed = prev.elapsed + 1;
      const target = workout.targetPace;

      // --- Simulated pace: random walk pulled toward target pace. ---
      const pull = (target - paceRef.current) * 0.08;
      const noise = (Math.random() - 0.5) * 14;
      paceRef.current = Math.max(
        target - 70,
        Math.min(target + 90, paceRef.current + pull + noise)
      );
      const currentPace = paceRef.current;

      // Distance this second = 1000 / (sec per km).
      const deltaM = 1000 / currentPace;
      const distance = prev.distance + deltaM;

      // Simulated terrain: grade random-walks between -5% and +7%; we bank only
      // the positive gain, the way a watch reports elevation.
      gradeRef.current = Math.max(
        -0.05,
        Math.min(0.07, gradeRef.current + (Math.random() - 0.5) * 0.012)
      );
      const elevation = prev.elevation + Math.max(0, gradeRef.current) * deltaM;

      paceSum.current += currentPace;
      paceCount.current += 1;
      const avgPace = paceSum.current / paceCount.current;

      // Heart rate drifts toward an effort-appropriate target + a slow climb,
      // and lifts a little on the hills.
      const effort =
        1 - Math.min(1, Math.max(0, (currentPace - (target - 70)) / 160));
      const hrTarget =
        128 + effort * 46 + Math.min(18, elapsed / 90) + gradeRef.current * 120;
      const heartRate = Math.max(
        90,
        Math.round(
          prev.heartRate +
            (hrTarget - prev.heartRate) * 0.06 +
            (Math.random() - 0.5) * 2
        )
      );

      const cadence = Math.round(168 + effort * 14 + (Math.random() - 0.5) * 4);
      const calories = Math.round((elapsed / 60) * 11.5);

      const next: LiveMetrics = {
        elapsed,
        distance,
        currentPace,
        avgPace,
        heartRate,
        calories,
        cadence,
        elevation,
      };
      metricsRef.current = next;
      setMetrics(next);

      // --- Ask the coach whether to speak. ---
      const snapshot: RunSnapshot = {
        elapsed,
        distance,
        currentPace,
        targetPace: target,
        heartRate,
        goal: workout.id,
        goalDistance: workout.distance,
        struggleAtKm: getMemory().struggleAtKm,
      };
      const cue = nextCue(snapshot, lastCueAt.current, spokenKm.current);
      if (cue) {
        lastCueAt.current = elapsed;
        cueId.current += 1;
        const line: CoachLine = {
          ...cue,
          id: cueId.current,
          atSecond: elapsed,
          role: "coach",
        };
        setCues((c) => [line, ...c].slice(0, 30));
        if (cue.tone === "finish") {
          setTimeout(() => setStatus("finished"), 600);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status, workout]);

  /** Append a line the runner spoke aloud (voice input). */
  const pushRunner = useCallback((message: string): CoachLine => {
    cueId.current += 1;
    const line: CoachLine = {
      id: cueId.current,
      atSecond: metricsRef.current.elapsed,
      role: "runner",
      tone: "encourage",
      message,
    };
    setCues((c) => [line, ...c].slice(0, 30));
    return line;
  }, []);

  /** Append a coach reply (e.g. from the AI conversational endpoint). */
  const pushCoach = useCallback((message: string): CoachLine => {
    lastCueAt.current = metricsRef.current.elapsed;
    cueId.current += 1;
    const line: CoachLine = {
      id: cueId.current,
      atSecond: metricsRef.current.elapsed,
      role: "coach",
      tone: "encourage",
      message,
    };
    setCues((c) => [line, ...c].slice(0, 30));
    return line;
  }, []);

  return {
    status,
    metrics,
    cues,
    start,
    pause,
    resume,
    finish,
    reset,
    pushRunner,
    pushCoach,
  };
}
