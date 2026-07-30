"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { RunGoal } from "@/lib/supabase/types";

export interface SaveRunInput {
  goal: RunGoal;
  distance_m: number;
  duration_s: number;
  avg_pace_sec_per_km: number;
  avg_heart_rate: number;
  calories: number;
}

export interface SaveRunResult {
  saved: boolean;
  reason?: string;
}

/**
 * Persist a completed run. When Supabase isn't configured (demo mode) we simply
 * report `saved: false` — the UI still celebrates the run, it just isn't stored.
 */
export async function saveRun(input: SaveRunInput): Promise<SaveRunResult> {
  if (!isSupabaseConfigured()) {
    return { saved: false, reason: "demo" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { saved: false, reason: "signed-out" };

  const { error } = await supabase.from("runs").insert({
    user_id: user.id,
    goal: input.goal,
    distance_m: Math.round(input.distance_m),
    duration_s: Math.round(input.duration_s),
    avg_pace_sec_per_km: Math.round(input.avg_pace_sec_per_km),
    avg_heart_rate: Math.round(input.avg_heart_rate),
    calories: Math.round(input.calories),
    started_at: new Date(Date.now() - input.duration_s * 1000).toISOString(),
  });

  if (error) return { saved: false, reason: error.message };
  return { saved: true };
}
