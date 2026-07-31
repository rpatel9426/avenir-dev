"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { goalMeta } from "@/lib/goal-meta";
import { formatPace, cn } from "@/lib/utils";
import { WORKOUTS, DISTANCE_OPTIONS_KM, type Workout } from "@/lib/workouts";

/** The pre-run screen: choose a coached session and a distance goal, then brief. */
export function PreRun({
  workout,
  distanceKm,
  onSelect,
  onDistanceChange,
  onContinue,
}: {
  workout: Workout;
  distanceKm: number;
  onSelect: (w: Workout) => void;
  onDistanceChange: (km: number) => void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-7">
      <header className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Dashboard
        </Link>
        <span className="text-sm text-muted-foreground">Plan your run</span>
      </header>

      {/* Session type */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Session
        </h2>
        {WORKOUTS.map((w) => {
          const meta = goalMeta(w.id);
          const Icon = meta.icon;
          const selected = w.id === workout.id;
          return (
            <motion.button
              key={w.id}
              type="button"
              onClick={() => onSelect(w)}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors",
                selected
                  ? "border-accent/40 bg-accent-wash"
                  : "border-border bg-card/60 hover:border-border"
              )}
            >
              <span className={cn("flex size-11 items-center justify-center rounded-xl", meta.bg, meta.color)}>
                <Icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{w.name}</p>
                <p className="truncate text-sm text-muted-foreground">{w.tagline}</p>
              </div>
              <div className="text-right">
                <p className="tabular-nums text-sm font-medium">{formatPace(w.targetPace)}</p>
                <p className="text-xs text-muted-foreground">/km</p>
              </div>
            </motion.button>
          );
        })}
      </section>

      {/* Distance goal */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Distance goal
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          {DISTANCE_OPTIONS_KM.map((km) => {
            const selected = km === distanceKm;
            return (
              <button
                key={km}
                type="button"
                onClick={() => onDistanceChange(km)}
                className={cn(
                  "rounded-xl border py-3 text-center tabular-nums transition-colors",
                  selected
                    ? "border-accent/40 bg-accent-wash text-foreground"
                    : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="text-lg font-semibold">{km}</span>
                <span className="text-xs"> km</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Continue to the briefing */}
      <div className="sticky bottom-6 pt-2">
        <Button size="lg" className="w-full" onClick={onContinue}>
          Continue
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
