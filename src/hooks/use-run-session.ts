"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { nextCue, type CoachCue, type RunSnapshot } from "@/lib/coach";
import { getMemory } from "@/lib/ai/memory";
import type { Workout } from "@/lib/workouts";

export type RunStatus = "idle" | "running" | "paused" | "finished";

/** Why the run currently has no position — so the UI can say which. */
export type GpsState = "acquiring" | "tracking" | "denied" | "unavailable";

export interface LiveMetrics {
  elapsed: number; // seconds
  distance: number; // metres, from GPS
  currentPace: number; // sec / km over a recent window; 0 until known
  avgPace: number; // sec / km over the whole run
  /** Null unless a real sensor is connected — never estimated. */
  heartRate: number | null;
  calories: number;
  cadence: number | null;
  elevation: number; // cumulative gain, metres, when altitude is available
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
  heartRate: null,
  calories: 0,
  cadence: null,
  elevation: 0,
});

interface Fix {
  lat: number;
  lon: number;
  alt: number | null;
  at: number; // ms
}

/** Metres between two coordinates. */
function haversine(a: Fix, b: Fix): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Fixes worse than this are noise, not movement. */
const ACCURACY_LIMIT_M = 30;
/** Below this, the runner is standing still and the drift is GPS wander. */
const MIN_STEP_M = 2;
/** Above this implied speed (m/s) the fix is a jump, not a sprint. */
const MAX_SPEED_MS = 12;

/**
 * Drives a live, coached run from real GPS.
 *
 * Distance comes from `geolocation.watchPosition` and elapsed time from the
 * wall clock rather than a tick counter — a phone throttles timers the moment
 * the browser is backgrounded, and counting ticks silently under-reports a
 * whole run. Heart rate and cadence stay null until a real sensor exists,
 * because a metric the coach acts on has to be true.
 *
 * Platform limit worth knowing: a web app only receives positions while the
 * page is alive. The run therefore holds a screen wake lock, and a phone
 * locked in a pocket will not track. That gap closes with a native app.
 */
export function useRunSession(workout: Workout) {
  const [status, setStatus] = useState<RunStatus>("idle");
  const [metrics, setMetrics] = useState<LiveMetrics>(initialMetrics);
  const [cues, setCues] = useState<CoachLine[]>([]);
  const [gps, setGps] = useState<GpsState>("acquiring");

  const metricsRef = useRef<LiveMetrics>(initialMetrics());
  const lastCueAt = useRef(0);
  const spokenKm = useRef<Set<number>>(new Set());
  const cueId = useRef(0);

  // Clock. Elapsed is derived, never accumulated, so throttling can't lose it.
  const startedAt = useRef<number | null>(null);
  const pausedTotal = useRef(0);
  const pausedAt = useRef<number | null>(null);

  // Position.
  const lastFix = useRef<Fix | null>(null);
  const distanceRef = useRef(0);
  const elevationRef = useRef(0);
  /** Recent (distance, time) samples for the rolling pace window. */
  const recent = useRef<{ m: number; at: number }[]>([]);

  const reset = useCallback(() => {
    setStatus("idle");
    metricsRef.current = initialMetrics();
    setMetrics(initialMetrics());
    setCues([]);
    lastCueAt.current = 0;
    spokenKm.current = new Set();
    cueId.current = 0;
    startedAt.current = null;
    pausedTotal.current = 0;
    pausedAt.current = null;
    lastFix.current = null;
    distanceRef.current = 0;
    elevationRef.current = 0;
    recent.current = [];
  }, []);

  const start = useCallback(() => {
    startedAt.current = Date.now();
    pausedTotal.current = 0;
    pausedAt.current = null;
    setStatus("running");
  }, []);

  const pause = useCallback(() => {
    pausedAt.current = Date.now();
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    if (pausedAt.current) {
      pausedTotal.current += Date.now() - pausedAt.current;
      pausedAt.current = null;
    }
    // Drop the stale fix so the pause gap isn't counted as distance run.
    lastFix.current = null;
    setStatus("running");
  }, []);

  const finish = useCallback(() => setStatus("finished"), []);

  /* --- Position ---------------------------------------------------------- */
  useEffect(() => {
    if (status !== "running") return;

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      // Deferred a tick so the state change is a reaction to the environment
      // rather than a synchronous cascade during the effect body.
      const t = setTimeout(() => setGps("unavailable"), 0);
      return () => clearTimeout(t);
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setGps("tracking");
        const fix: Fix = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          alt: pos.coords.altitude,
          at: pos.timestamp,
        };

        if (pos.coords.accuracy > ACCURACY_LIMIT_M) return;

        const prev = lastFix.current;
        lastFix.current = fix;
        if (!prev) return;

        const metres = haversine(prev, fix);
        const seconds = Math.max(0.001, (fix.at - prev.at) / 1000);

        // Reject GPS wander while standing, and teleports between towers.
        if (metres < MIN_STEP_M) return;
        if (metres / seconds > MAX_SPEED_MS) return;

        distanceRef.current += metres;
        recent.current.push({ m: metres, at: fix.at });
        // Keep a 45-second window — long enough to be stable, short enough to
        // still be "current".
        const cutoff = fix.at - 45_000;
        recent.current = recent.current.filter((r) => r.at >= cutoff);

        if (prev.alt !== null && fix.alt !== null) {
          const gain = fix.alt - prev.alt;
          if (gain > 0 && gain < 15) elevationRef.current += gain;
        }
      },
      (err) => {
        setGps(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable");
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 20_000 }
    );

    return () => navigator.geolocation.clearWatch(id);
  }, [status]);

  /* --- Screen wake lock -------------------------------------------------- */
  useEffect(() => {
    if (status !== "running") return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = async () => {
      try {
        lock = await navigator.wakeLock?.request("screen");
      } catch {
        // Denied or unsupported — the run still works while the screen is on.
      }
    };
    request();

    // iOS drops the lock whenever the page is hidden; take it again on return.
    const onVisible = () => {
      if (!cancelled && document.visibilityState === "visible") request();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      lock?.release().catch(() => {});
    };
  }, [status]);

  /* --- Clock and coaching ------------------------------------------------ */
  useEffect(() => {
    if (status !== "running") return;

    const tick = () => {
      if (!startedAt.current) return;

      const elapsed = Math.floor(
        (Date.now() - startedAt.current - pausedTotal.current) / 1000
      );
      const distance = distanceRef.current;

      // Pace over the rolling window; 0 until there's enough movement to mean
      // anything, so the screen shows "—" rather than a number that isn't true.
      const windowM = recent.current.reduce((s, r) => s + r.m, 0);
      const windowS =
        recent.current.length > 1
          ? (recent.current[recent.current.length - 1].at -
              recent.current[0].at) /
            1000
          : 0;
      const currentPace =
        windowM > 20 && windowS > 5 ? (windowS / windowM) * 1000 : 0;
      const avgPace = distance > 50 ? (elapsed / distance) * 1000 : 0;

      const next: LiveMetrics = {
        elapsed,
        distance,
        currentPace,
        avgPace,
        heartRate: null,
        cadence: null,
        calories: Math.round((elapsed / 60) * 11.5),
        elevation: elevationRef.current,
      };
      metricsRef.current = next;
      setMetrics(next);

      const snapshot: RunSnapshot = {
        elapsed,
        distance,
        currentPace,
        targetPace: workout.targetPace,
        heartRate: 0, // No sensor: the engine skips heart-rate cues.
        goal: workout.id,
        goalDistance: workout.distance,
        struggleAtKm: getMemory().struggleAtKm,
      };
      const cue = nextCue(snapshot, lastCueAt.current, spokenKm.current);
      if (cue) {
        lastCueAt.current = elapsed;
        cueId.current += 1;
        setCues((c) =>
          [
            { ...cue, id: cueId.current, atSecond: elapsed, role: "coach" as const },
            ...c,
          ].slice(0, 30)
        );
        if (cue.tone === "finish") {
          setTimeout(() => setStatus("finished"), 600);
        }
      }
    };

    const interval = setInterval(tick, 1000);
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
    gps,
    start,
    pause,
    resume,
    finish,
    reset,
    pushRunner,
    pushCoach,
  };
}
