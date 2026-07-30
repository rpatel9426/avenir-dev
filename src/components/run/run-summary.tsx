"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/app/progress-ring";
import { Topo } from "@/components/brand/topo";
import { goalMeta } from "@/lib/goal-meta";
import { formatDistance, formatDuration, formatPace } from "@/lib/utils";
import { saveRun } from "@/app/(app)/run/actions";
import type { LiveMetrics } from "@/hooks/use-run-session";
import type { Workout } from "@/lib/workouts";

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
  const [saving, setSaving] = useState(false);
  const meta = goalMeta(workout.id);
  const completion = Math.min(1, metrics.distance / workout.distance);

  // Persist the run once, in the background, as soon as the summary mounts.
  useEffect(() => {
    saveRun({
      goal: workout.id,
      distance_m: metrics.distance,
      duration_s: metrics.elapsed,
      avg_pace_sec_per_km: metrics.avgPace,
      avg_heart_rate: metrics.heartRate,
      calories: metrics.calories,
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFinish = () => {
    setSaving(true);
    router.push("/history");
    router.refresh();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
          className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground"
        >
          <Check className="size-7" strokeWidth={3} />
        </motion.div>
        <h1 className="text-2xl font-semibold tracking-tight">Run complete</h1>
        <p className="mt-1 text-muted-foreground">
          {meta.label} · Well run. Here&apos;s how it went.
        </p>
      </div>

      <div className="relative flex justify-center">
        <Topo className="absolute -z-10 h-72 w-72 text-border/60" />
        <ProgressRing value={completion} size={180} stroke={12}>
          <span className="tabular-nums text-4xl font-semibold tracking-tight">
            {formatDistance(metrics.distance)}
          </span>
          <span className="text-sm text-muted-foreground">kilometres</span>
        </ProgressRing>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SummaryStat label="Time" value={formatDuration(metrics.elapsed)} />
        <SummaryStat label="Avg pace" value={`${formatPace(metrics.avgPace)} /km`} />
        <SummaryStat label="Avg heart rate" value={`${metrics.heartRate} bpm`} />
        <SummaryStat label="Calories" value={`${metrics.calories}`} />
      </div>

      <div className="rounded-2xl border border-accent/20 bg-accent/10 p-4">
        <p className="text-sm font-medium text-accent">Coach&apos;s note</p>
        <p className="mt-1 text-sm text-foreground/90">
          {completion >= 0.98
            ? "You saw the whole session through and finished composed. That consistency is exactly what builds a stronger runner."
            : "Strong effort today. Every kilometre you banked is fitness in the bank — come back fresh and we go again."}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button size="lg" className="w-full" onClick={handleFinish} disabled={saving}>
          {saving && <Loader2 className="animate-spin" />}
          {saving ? "Saving…" : "Save & finish"}
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="w-full"
          onClick={onRunAgain}
          disabled={saving}
        >
          <RotateCcw />
          Run again
        </Button>
      </div>
    </motion.div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 tabular-nums text-xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}
