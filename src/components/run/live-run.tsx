"use client";

import Link from "next/link";
import {
  Activity,
  Heart,
  Loader2,
  Lock,
  Mic,
  MicOff,
  Mountain,
  Pause,
  Play,
  Sparkles,
  Square,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoachFeed } from "@/components/run/coach-feed";
import { MetricTile } from "@/components/run/metric-tile";
import { ProgressRing } from "@/components/app/progress-ring";
import { formatDistance, formatDuration, formatPace } from "@/lib/utils";
import { goalMeta } from "@/lib/goal-meta";
import { cn } from "@/lib/utils";
import type { LiveMetrics, RunStatus, CoachLine } from "@/hooks/use-run-session";
import type { Workout } from "@/lib/workouts";

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
  const meta = goalMeta(workout.id);
  const completion = Math.min(1, metrics.distance / workout.distance);
  const paused = status === "paused";

  const drift = metrics.currentPace - workout.targetPace;
  const paceAccent =
    drift > 12 ? "destructive" : drift < -12 ? "accent" : "primary";

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`flex size-9 items-center justify-center rounded-lg ${meta.bg} ${meta.color}`}>
            <meta.icon className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">{workout.name}</p>
            <p className="text-xs text-muted-foreground">
              Target {formatPace(workout.targetPace)} /km
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleVoice}
            aria-label={voiceEnabled ? "Mute coach" : "Unmute coach"}
            aria-pressed={voiceEnabled}
            className={cn(
              "flex size-9 items-center justify-center rounded-full border border-border transition-colors",
              voiceEnabled ? "bg-accent/15 text-accent" : "text-muted-foreground"
            )}
          >
            {voiceEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>
          <span className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            <span
              className={`size-1.5 rounded-full ${paused ? "bg-muted-foreground" : "animate-pulse bg-primary"}`}
            />
            {paused ? "Paused" : "Live"}
          </span>
        </div>
      </header>

      {/* Hero: distance ring + elapsed time */}
      <div className="flex flex-col items-center pt-2">
        <ProgressRing value={completion} size={216} stroke={12}>
          <span className="text-[0.65rem] uppercase tracking-widest text-muted-foreground">
            Distance
          </span>
          <span className="tabular-nums text-6xl font-semibold leading-none tracking-tight">
            {formatDistance(metrics.distance)}
          </span>
          <span className="mt-1 text-sm text-muted-foreground">
            of {(workout.distance / 1000).toFixed(0)} km
          </span>
        </ProgressRing>
        <p className="mt-4 tabular-nums text-xl font-medium text-muted-foreground">
          {formatDuration(metrics.elapsed)}
        </p>
      </div>

      {/* Coaching feed */}
      <CoachFeed cues={cues} speaking={speaking} />

      {/* Secondary metrics */}
      <div className="grid grid-cols-4 gap-2.5">
        <MetricTile
          label="Pace"
          value={formatPace(metrics.currentPace)}
          unit="/km"
          accent={paceAccent}
        />
        <MetricTile
          label="Heart"
          value={`${metrics.heartRate}`}
          unit="bpm"
          accent="destructive"
          icon={<Heart className="size-3" />}
        />
        <MetricTile
          label="Cadence"
          value={`${metrics.cadence}`}
          unit="spm"
          icon={<Activity className="size-3" />}
        />
        <MetricTile
          label="Elev"
          value={`${Math.round(metrics.elevation)}`}
          unit="m"
          icon={<Mountain className="size-3" />}
        />
      </div>

      {/* Controls: Pause · Talk · Finish */}
      <div className="flex items-center justify-between gap-3 pt-1">
        {paused ? (
          <Button size="icon" variant="secondary" onClick={onResume} aria-label="Resume">
            <Play className="fill-current" />
          </Button>
        ) : (
          <Button size="icon" variant="secondary" onClick={onPause} aria-label="Pause">
            <Pause className="fill-current" />
          </Button>
        )}

        {/* Free tier: talking to the coach is Premium — show an upgrade path
            instead of the hands-free control. */}
        {!premium ? (
          <Link
            href="/pricing"
            className="relative flex h-14 flex-1 items-center justify-center gap-2 rounded-full border border-accent/40 bg-accent/10 font-semibold text-accent transition-all active:scale-[0.98]"
          >
            <Lock className="size-4" />
            Unlock voice coaching
            <Sparkles className="size-4" />
          </Link>
        ) : (
        /* Hands-free talk — the conversational centrepiece. Speak through your
           AirPods; no need to touch the phone. */
        <button
          type="button"
          onClick={onToggleHandsFree}
          disabled={!micSupported}
          aria-pressed={handsFree}
          className={cn(
            "relative flex h-14 flex-1 items-center justify-center gap-2 rounded-full font-semibold transition-all active:scale-[0.98] disabled:opacity-60",
            handsFree
              ? "bg-accent text-accent-foreground"
              : "bg-secondary text-foreground"
          )}
        >
          {handsFree && listening && !speaking && (
            <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-accent/40" />
          )}
          {!micSupported ? (
            <>
              <MicOff className="size-5" />
              Voice unavailable
            </>
          ) : thinking ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Thinking…
            </>
          ) : !handsFree ? (
            <>
              <Mic className="size-5" />
              Talk hands-free
            </>
          ) : speaking ? (
            <>
              <Volume2 className="size-5" />
              Avenir speaking…
            </>
          ) : (
            <>
              <Mic className="size-5" />
              Listening — tap to stop
            </>
          )}
        </button>
        )}

        <Button
          size="icon"
          variant={paused ? "destructive" : "outline"}
          onClick={onFinish}
          aria-label="Finish run"
        >
          <Square className="fill-current" />
        </Button>
      </div>
    </div>
  );
}
