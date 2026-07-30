import { Flame, Gauge, Leaf, Mountain, Timer, Zap } from "lucide-react";
import type { RunGoal } from "@/lib/supabase/types";

export interface GoalMeta {
  label: string;
  icon: typeof Flame;
  /** Tailwind text colour class for the goal accent. */
  color: string;
  bg: string;
}

export const GOAL_META: Record<RunGoal, GoalMeta> = {
  easy: { label: "Easy Run", icon: Leaf, color: "text-primary", bg: "bg-primary/12" },
  tempo: { label: "Tempo", icon: Gauge, color: "text-accent", bg: "bg-accent/12" },
  intervals: { label: "Intervals", icon: Zap, color: "text-accent", bg: "bg-accent/12" },
  long: { label: "Long Run", icon: Mountain, color: "text-primary", bg: "bg-primary/12" },
  recovery: { label: "Recovery", icon: Leaf, color: "text-primary", bg: "bg-primary/12" },
  race: { label: "Race", icon: Flame, color: "text-destructive", bg: "bg-destructive/12" },
};

export function goalMeta(goal: RunGoal): GoalMeta {
  return GOAL_META[goal] ?? { label: goal, icon: Timer, color: "text-foreground", bg: "bg-secondary" };
}
