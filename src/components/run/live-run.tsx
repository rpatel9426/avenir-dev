"use client";

import Link from "next/link";
import { Loader2, Lock } from "lucide-react";
import { CoachFeed } from "@/components/run/coach-feed";
import { formatDistance, formatDuration, formatPace } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { LiveMetrics, RunStatus, CoachLine } from "@/hooks/use-run-session";
import type { Workout } from "@/lib/workouts";

/*
 * The silent path — a run club, a quiet street, or no breath to spare.
 * "Something hurts" is the one chip that must not lead to a coaching reply:
 * it enters triage, because the coach may not prescribe through pain.
 */
const SILENT_CHIPS = ["This feels hard", "How far left?"];

export function LiveRun({
  workout,
  metrics,
  cues,
  status,
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
            {!paused && (
              <span className="animate-pulse-soft absolute inset-0 rounded-full bg-accent" />
            )}
            <span className="relative size-[7px] rounded-full bg-accent" />
          </span>
          <span className="t-label text-foreground/50">
            {workout.name} · KM {km}
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleVoice}
          aria-pressed={voiceEnabled}
          className="t-label text-tint-strong"
        >
          {voiceEnabled ? `${metrics.heartRate} BPM` : "MUTED"}
        </button>
      </header>

      {/* The metric. Nothing on this screen is louder. */}
      <div className="flex flex-col gap-0.5">
        <div className="t-metric">{formatPace(metrics.currentPace)}</div>
        <div className="t-label text-tint-strong">
          Pace /km · {paused ? "PAUSED" : verdict}
        </div>
        <div className="t-label mt-2 tracking-[0.1em] text-tint-strong">
          {formatDuration(metrics.elapsed)} · {formatDistance(metrics.distance)} KM
        </div>
      </div>

      {/* The coach. Voice out, and — for the full plan — voice in. */}
      <CoachFeed cues={cues} speaking={speaking} listening={handsFree && listening} />

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

          {!premium ? (
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
        <button
          type="button"
          onClick={onFinish}
          className="h-11 text-[12.5px] font-semibold text-muted-foreground"
        >
          Wrap it up
        </button>
      </div>
    </div>
  );
}
