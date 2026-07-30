"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { goalMeta } from "@/lib/goal-meta";
import { formatPace } from "@/lib/utils";
import type { Workout } from "@/lib/workouts";

/** The headline card on the dashboard: the session Avenir recommends today. */
export function TodaySession({ workout }: { workout: Workout }) {
  const meta = goalMeta(workout.id);
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/run?w=${workout.id}`} className="block">
        <div className="aurora relative overflow-hidden rounded-3xl border border-border p-6 transition-transform active:scale-[0.99]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          <div className="flex items-center gap-2 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" />
            Today&apos;s coached session
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className={`flex size-12 items-center justify-center rounded-2xl ${meta.bg} ${meta.color}`}>
              <Icon className="size-6" />
            </span>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                {workout.name}
              </h2>
              <p className="text-sm text-muted-foreground">{workout.tagline}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-secondary/40 p-3 text-center">
            <Stat label="Target pace" value={`${formatPace(workout.targetPace)}`} unit="/km" />
            <Stat label="Distance" value={`${(workout.distance / 1000).toFixed(0)}`} unit="km" />
            <Stat label="Duration" value={workout.durationLabel.replace("~", "")} unit="" />
          </div>

          <div className="mt-5 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Avenir will coach you live
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              Start
              <ArrowRight className="size-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div>
      <p className="text-[0.6rem] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 tabular-nums text-lg font-semibold tracking-tight">
        {value}
        {unit && <span className="text-xs text-muted-foreground"> {unit}</span>}
      </p>
    </div>
  );
}
