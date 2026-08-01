"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Loader2, Lock } from "lucide-react";
import { CoachFeed } from "@/components/run/coach-feed";
import { formatDistance, formatDuration, formatPace } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type {
  LiveMetrics,
  RunStatus,
  CoachLine,
  GpsState,
} from "@/hooks/use-run-session";
import type { Workout } from "@/lib/workouts";

/*
 * The silent path — a run club, a quiet street, or no breath to spare.
 * "Something hurts" is the one chip that must not lead to a coaching reply:
 * it enters triage, because the coach may not prescribe through pain.
 */
const SILENT_CHIPS = ["This feels hard", "How far left?"];

/**
 * Whether the run still has a live signal.
 *
 * Mid-run is the worst possible moment for an error, so this never becomes a
 * dialog: the value that can't be trusted is dashed out rather than frozen at
 * a lie, and the coach degrades to what it can still measure. Today this
 * tracks connectivity; when real GPS replaces the simulation, a lost fix
 * feeds the same state.
 */
function subscribeToConnectivity(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

function useSignal() {
  const online = useSyncExternalStore(
    subscribeToConnectivity,
    () => navigator.onLine,
    () => true // Assume a signal while rendering on the server.
  );

  // How long the signal has been gone, so the label states a fact rather than
  // a vague warning. Only ever set from the interval, never during render.
  const [secondsLost, setSecondsLost] = useState(0);

  useEffect(() => {
    if (online) return;
    let elapsed = 0;
    const id = setInterval(() => {
      elapsed += 1;
      setSecondsLost(elapsed);
    }, 1000);
    return () => clearInterval(id);
  }, [online]);

  return { online, secondsLost };
}

export function LiveRun({
  workout,
  metrics,
  cues,
  status,
  gps,
  voiceEnabled,
  onToggleVoice,
  speaking,
  premium,
  handsFree,
  onToggleHandsFree,
  listening,
  thinking,
  micSupported,
  onPause,
  onResume,
  onFinish,
}: {
  workout: Workout;
  metrics: LiveMetrics;
  cues: CoachLine[];
  status: RunStatus;
  gps: GpsState;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  speaking: boolean;
  premium: boolean;
  handsFree: boolean;
  onToggleHandsFree: () => void;
  listening: boolean;
  thinking: boolean;
  micSupported: boolean;
  onPause: () => void;
  onResume: () => void;
  onFinish: () => void;
}) {
  const paused = status === "paused";
  const km = Math.max(1, Math.floor(metrics.distance / 1000) + 1);
  const { online, secondsLost } = useSignal();

  // Pace is only true once there are enough fixes to compute it from.
  const hasPace = gps === "tracking" && metrics.currentPace > 0;
  const gpsLabel =
    gps === "denied"
      ? "Location is off"
      : gps === "unavailable"
        ? "No location on this device"
        : gps === "acquiring"
          ? "Finding you"
          : null;

  /*
   * Indoors, pace is fiction — a treadmill belt and a GPS disagree, and the
   * honest response is to change which number is the hero rather than to
   * estimate one. Cadence and heart rate are the only true readings in here,
   * so distance is deliberately absent instead of guessed.
   */
  const [treadmill, setTreadmill] = useState(false);
  const beltKmh = Math.round((3600 / workout.targetPace) * 2) / 2;
  const maxHr = 190; // A standing-in estimate until a real profile value exists.
  const hrPercent =
    metrics.heartRate === null
      ? null
      : Math.round((metrics.heartRate / maxHr) * 100);

  // Pace is the one number that has to be true, so it never animates and the
  // judgement beside it is a word, not a colour.
  const drift = metrics.currentPace - workout.targetPace;
  const verdict =
    drift > 12 ? "EASING OFF" : drift < -12 ? "AHEAD OF TARGET" : "ON TARGET";

  return (
    <div className="flex min-h-[calc(100dvh-3rem)] flex-col gap-5">
      {/* Status line — what run this is, and the one body signal worth glancing at. */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex size-[7px]">
            {!paused && online && !gpsLabel && (
              <span className="animate-pulse-soft absolute inset-0 rounded-full bg-accent" />
            )}
            <span
              className={cn(
                "relative size-[7px] rounded-full",
                gpsLabel || !online ? "bg-attention" : "bg-accent"
              )}
            />
          </span>
          <span
            className={cn(
              "t-label",
              gpsLabel || !online ? "text-attention" : "text-foreground/50"
            )}
          >
            {treadmill
              ? `${workout.name} · Treadmill`
              : gpsLabel
                ? gpsLabel
                : online
                  ? `${workout.name} · KM ${km}`
                  : `Signal lost · ${secondsLost}s ago`}
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleVoice}
          aria-pressed={voiceEnabled}
          className="t-label text-tint-strong"
        >
          {!voiceEnabled
            ? "MUTED"
            : metrics.heartRate === null
              ? "NO HR SENSOR"
              : `${metrics.heartRate} BPM`}
        </button>
      </header>

      {/* The metric. Nothing on this screen is louder — and when it can't be
          trusted it is dashed out rather than frozen at a lie. */}
      {treadmill ? (
        <>
          <div className="flex flex-col gap-0.5">
            <div className="t-metric">{metrics.cadence}</div>
            <div className="t-label text-tint-strong">
              Cadence · target 170–176
            </div>
          </div>
          <div className="flex gap-7">
            <div className="flex flex-col gap-[5px]">
              <div className="text-[25px] font-semibold tabular-nums">
                {formatDuration(metrics.elapsed)}
              </div>
              <div className="t-label tracking-[0.1em]">Elapsed</div>
            </div>
            <div className="flex flex-col gap-[5px]">
              <div className="text-[25px] font-semibold tabular-nums">
                {hrPercent ?? "—"}
                {hrPercent !== null && (
                  <span className="text-xs text-muted-foreground">%</span>
                )}
              </div>
              <div className="t-label tracking-[0.1em]">Of max HR</div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-0.5">
          <div className={cn("t-metric", !hasPace && "text-tint-strong")}>
            {hasPace ? formatPace(metrics.currentPace) : "—:——"}
          </div>
          <div className="t-label text-tint-strong">
            {gps === "denied"
              ? "Turn location on to measure this run"
              : gps === "unavailable"
                ? "This device can't measure distance"
                : hasPace
                  ? `Pace /km · ${paused ? "PAUSED" : verdict}`
                  : "Pace /km · still recording"}
          </div>
          <div className="t-label mt-2 tracking-[0.1em] text-tint-strong">
            {formatDuration(metrics.elapsed)} · {formatDistance(metrics.distance)}{" "}
            KM
          </div>
        </div>
      )}

      {/* The coach. Voice out, and — for the full plan — voice in. Offline it
          degrades to what it can still measure rather than going silent. */}
      {treadmill ? (
        <>
          <div className="flex flex-col gap-[9px] rounded-[20px] border border-attention/25 bg-attention-wash p-[18px]">
            <div className="t-label tracking-[0.14em] text-attention">
              No GPS indoors
            </div>
            <p className="text-[14.5px] leading-[1.5] text-foreground/90 text-pretty">
              I can&apos;t see your pace in here, so I&apos;m coaching you on
              effort and cadence instead. Set the belt to {beltKmh} km/h and put
              it at 1% — that&apos;s your {workout.name.toLowerCase()} today.
            </p>
          </div>
          <div className="flex items-center justify-between rounded-[18px] bg-secondary px-[18px] py-4">
            <span className="flex flex-col gap-[3px]">
              <span className="text-[13.5px] font-semibold leading-[1.2]">
                Belt speed
              </span>
              <span className="text-[11.5px] leading-[1.2] text-muted-foreground">
                Tell me if you change it
              </span>
            </span>
            <span className="text-[15px] font-bold">
              {beltKmh}
              <span className="text-[11px] font-medium text-muted-foreground">
                {" "}
                KM/H
              </span>
            </span>
          </div>
        </>
      ) : online ? (
        <CoachFeed
          cues={cues}
          speaking={speaking}
          listening={handsFree && listening}
        />
      ) : (
        <div className="flex flex-col gap-2 rounded-[20px] border border-attention/25 bg-attention-wash p-[18px]">
          <div className="t-label tracking-[0.12em] text-attention">Coach</div>
          <p className="text-base leading-[1.5] text-foreground/90 text-pretty">
            Signal&apos;s gone — I&apos;m still counting time and heart rate.
            Keep the effort where it is and I&apos;ll pick you up on the other
            side.
          </p>
        </div>
      )}

      {premium && (
        <div className="flex flex-col gap-[9px]">
          <div className="t-label tracking-[0.12em] text-tint-strong">
            Or say nothing — tap instead
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/triage"
              className="rounded-[22px] border border-attention/40 bg-attention-wash px-4 py-[13px] text-[12.5px] font-semibold text-attention"
            >
              Something hurts
            </Link>
            {SILENT_CHIPS.map((chip) => (
              <span
                key={chip}
                className="rounded-[22px] bg-secondary px-4 py-[13px] text-[12.5px] font-medium text-foreground/70"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Controls. 60px mid-run — sweaty thumbs, cold fingers, gloves. */}
      <div className="mt-auto flex flex-col gap-3 pb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={paused ? onResume : onPause}
            className="flex size-15 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-foreground/60"
          >
            {paused ? "Resume" : "Pause"}
          </button>

          {!online ? (
            /* Nothing to talk to while offline, so the control says what it
               can still do rather than sitting there disabled. */
            <div className="flex h-15 flex-1 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-foreground/75">
              Coach by effort instead
            </div>
          ) : !premium ? (
            <Link
              href="/pricing"
              className="flex h-15 flex-1 items-center justify-center gap-2 rounded-full border border-accent/40 bg-accent-wash text-[15px] font-bold text-accent"
            >
              <Lock className="size-4" />
              Unlock voice coaching
            </Link>
          ) : (
            <button
              type="button"
              onClick={onToggleHandsFree}
              disabled={!micSupported}
              aria-pressed={handsFree}
              className={cn(
                "flex h-15 flex-1 items-center justify-center gap-2 rounded-full text-[15px] font-bold transition-[filter] duration-[90ms] active:brightness-110 disabled:opacity-60",
                handsFree
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-foreground"
              )}
            >
              {!micSupported ? (
                "Voice unavailable"
              ) : thinking ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Thinking
                </>
              ) : !handsFree ? (
                "Tap to talk"
              ) : speaking ? (
                "Avenir speaking"
              ) : (
                "Tap to stop listening"
              )}
            </button>
          )}
        </div>

        {/*
          R6 · A run can always be shortened with the coach. The word
          "incomplete" is banned — this ends the run and the summary states
          what the short run achieved.
        */}
        <div className="flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={onFinish}
            className="h-11 text-[12.5px] font-semibold text-muted-foreground"
          >
            Wrap it up
          </button>
          <button
            type="button"
            onClick={() => setTreadmill((t) => !t)}
            aria-pressed={treadmill}
            className="h-11 text-[12.5px] font-semibold text-muted-foreground"
          >
            {treadmill ? "I'm outside" : "I'm on a treadmill"}
          </button>
        </div>
      </div>
    </div>
  );
}
