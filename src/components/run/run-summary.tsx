"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Metric } from "@/components/ds/atoms";
import { formatDistance, formatDuration, formatPace } from "@/lib/utils";
import { saveRun } from "@/app/(app)/run/actions";
import type { LiveMetrics } from "@/hooks/use-run-session";
import type { Workout } from "@/lib/workouts";

type Effort = "easier" | "right" | "harder";

const EFFORTS: { id: Effort; label: string }[] = [
  { id: "easier", label: "Easier than expected" },
  { id: "right", label: "About right" },
  { id: "harder", label: "Harder than expected" },
];

/**
 * Post-run. Two screens, in order.
 *
 * First: what the run was, in the coach's words, and then effort — the only
 * interactive thing on the screen, as three 60px targets that *are* the way
 * forward. Perceived effort is how the coach learns, so it can't be grey
 * tertiary text under a filled button.
 *
 * Second: the consequence, named. Input → visible adaptation, with undo.
 */
export function RunSummary({
  workout,
  metrics,
  onRunAgain,
}: {
  workout: Workout;
  metrics: LiveMetrics;
  onRunAgain: () => void;
}) {
  const router = useRouter();
  const [effort, setEffort] = useState<Effort | null>(null);
  const [undone, setUndone] = useState(false);

  // Persist the run once, in the background, as soon as the summary mounts.
  useEffect(() => {
    saveRun({
      goal: workout.id,
      distance_m: metrics.distance,
      duration_s: metrics.elapsed,
      avg_pace_sec_per_km: metrics.avgPace,
      avg_heart_rate: metrics.heartRate ?? null,
      calories: metrics.calories,
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shortened = metrics.distance < workout.distance * 0.9;

  if (effort) {
    return (
      <Consequence
        effort={effort}
        workout={workout}
        undone={undone}
        onUndo={() => setUndone(true)}
        onKeep={() => {
          router.push("/dashboard");
          router.refresh();
        }}
        onTalk={() => router.push("/coach")}
      />
    );
  }

  return (
    <div className="aurora flex min-h-[calc(100dvh-3rem)] flex-col gap-5">
      <div className="t-label">
        {workout.name} · {shortened ? "shortened, done" : "done"}
      </div>

      {/* The headline reframes a short run as the harder achievement. The word
          "incomplete" appears nowhere in the product. */}
      <h1 className="t-voice text-pretty">
        {shortened
          ? `${minutes(metrics.elapsed)} minutes you didn't have to run. That counts more than ${minutes(
              workout.distance / (workout.targetPace / 60) / 60 || 40
            )} on a good day.`
          : "You saw the whole session through, and you finished composed."}
      </h1>

      <div className="flex gap-[22px] border-y border-border py-[18px]">
        <Metric value={formatDuration(metrics.elapsed)} label="Time" />
        <Metric value={formatDistance(metrics.distance)} label="km" />
        <Metric value={formatPace(metrics.avgPace)} label="Avg /km" />
      </div>

      <div className="flex flex-col gap-[11px]">
        <div className="t-label tracking-[0.12em]">How hard did that feel?</div>
        {EFFORTS.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => setEffort(e.id)}
            className="flex h-15 items-center rounded-full bg-secondary px-[22px] text-left text-[14.5px] font-semibold transition-[filter] duration-[90ms] active:brightness-110"
          >
            {e.label}
          </button>
        ))}
      </div>

      <div className="mt-auto flex flex-col items-center gap-4 pb-6">
        <p className="text-center text-xs text-tint-strong">
          Answering takes one tap and changes tomorrow.
        </p>
        <button
          type="button"
          onClick={onRunAgain}
          className="text-[12.5px] font-semibold text-muted-foreground"
        >
          Run again
        </button>
      </div>
    </div>
  );
}

/**
 * The loop that was missing: the runner says how it felt, and the plan visibly
 * moves. The coach takes the blame for a mis-set pace — the difference between
 * a system that grades you and one that works for you.
 */
function Consequence({
  effort,
  workout,
  undone,
  onUndo,
  onKeep,
  onTalk,
}: {
  effort: Effort;
  workout: Workout;
  undone: boolean;
  onUndo: () => void;
  onKeep: () => void;
  onTalk: () => void;
}) {
  const easy = formatPace(workout.targetPace);
  const easySlow = formatPace(workout.targetPace + 30);
  const eased = formatPace(workout.targetPace + 15);
  const easedSlow = formatPace(workout.targetPace + 45);

  const changes =
    effort === "harder"
      ? [
          { label: "Thursday", before: "Tempo 8 km", after: "Easy 35′" },
          {
            label: "Your easy pace",
            before: `${easy}–${easySlow}`,
            after: `${eased}–${easedSlow}`,
          },
        ]
      : effort === "easier"
        ? [{ label: "Thursday", before: "Easy 30′", after: "Tempo 6 km" }]
        : [{ label: "This week", before: "Unchanged", after: "Holding as planned" }];

  return (
    <div className="aurora flex min-h-[calc(100dvh-3rem)] flex-col gap-5">
      <div className="t-label">
        You said:{" "}
        {effort === "harder"
          ? "harder than expected"
          : effort === "easier"
            ? "easier than expected"
            : "about right"}
      </div>

      <h1 className="t-voice text-pretty">
        {undone
          ? "Put back as it was."
          : effort === "right"
            ? "Then we hold the line."
            : `Then I've changed ${changes.length === 1 ? "one thing" : "two things"}.`}
      </h1>

      {!undone && (
        <div className="flex flex-col gap-2.5">
          {changes.map((c) => (
            <div
              key={c.label}
              className="flex flex-col gap-[9px] rounded-[18px] bg-muted p-[18px]"
            >
              <div className="t-label tracking-[0.12em]">{c.label}</div>
              <div className="flex items-center justify-between gap-3 text-sm leading-[1.3]">
                <span className="text-muted-foreground line-through">
                  {c.before}
                </span>
                <span className="font-bold">{c.after}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="t-body text-foreground/70">
        {effort === "harder"
          ? "Runs at “harder than expected” mean my easy pace was too quick for you, not that you're unfit. That's my error, and it's fixed."
          : effort === "easier"
            ? "You had more in you than I asked for, so I'll ask for a little more next time."
            : "That's the read I wanted. Nothing needs to move."}
      </p>

      <div className="mt-auto flex flex-col gap-[11px] pb-6">
        <button
          type="button"
          onClick={onKeep}
          className="h-[58px] rounded-full bg-primary text-[15.5px] font-bold text-primary-foreground transition-[filter] duration-[90ms] active:brightness-110"
        >
          Good — keep it
        </button>
        <div className="flex gap-2.5">
          {/* R8 · reversible for 24 hours, and on the record either way. */}
          <button
            type="button"
            onClick={onUndo}
            disabled={undone}
            className="h-12 flex-1 rounded-full bg-secondary text-[12.5px] font-semibold text-foreground/70 disabled:opacity-50"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={onTalk}
            className="h-12 flex-1 rounded-full bg-secondary text-[12.5px] font-semibold text-foreground/70"
          >
            Talk about it
          </button>
        </div>
      </div>
    </div>
  );
}

function minutes(seconds: number): string {
  return String(Math.max(1, Math.round(seconds / 60)));
}
