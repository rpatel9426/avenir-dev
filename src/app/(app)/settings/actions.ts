"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isUnits, toKm, type Units } from "@/lib/units";

export interface SettingResult {
  ok: boolean;
  message?: string;
}

/**
 * Change the weekly distance goal.
 *
 * Stored in kilometres whatever the runner is looking at, so switching units
 * never nudges the number they set.
 */
export async function setWeeklyGoal(
  value: number,
  units: Units
): Promise<SettingResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Connect Supabase to save preferences." };
  }
  if (!Number.isFinite(value) || value <= 0 || value > 400) {
    return { ok: false, message: "Pick a weekly distance between 1 and 400." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Please log in first." };

  const { error } = await supabase
    .from("profiles")
    .update({ weekly_goal_km: Math.round(toKm(value, units) * 10) / 10 })
    .eq("id", user.id);

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/plan");
  revalidatePath("/profile");
  return { ok: !error, message: error?.message };
}

/** Switch between kilometres and miles. Display only — storage stays metric. */
export async function setUnits(units: string): Promise<SettingResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Connect Supabase to save preferences." };
  }
  if (!isUnits(units)) return { ok: false, message: "Unknown unit." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Please log in first." };

  const { error } = await supabase
    .from("profiles")
    .update({ units })
    .eq("id", user.id);

  revalidatePath("/", "layout");
  return { ok: !error, message: error?.message };
}
