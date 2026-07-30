"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { ExperienceLevel } from "@/lib/supabase/types";

export interface OnboardingData {
  displayName: string;
  experience: ExperienceLevel;
  weeklyGoalKm: number;
  preferredPaceSecPerKm: number | null;
}

/**
 * Persist the runner's onboarding answers to their profile. In demo mode (no
 * Supabase), this is a no-op — the flow still completes and lands on the
 * dashboard, which reads from demo data.
 */
export async function completeOnboarding(
  data: OnboardingData
): Promise<{ saved: boolean }> {
  if (!isSupabaseConfigured()) return { saved: false };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { saved: false };

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    display_name: data.displayName,
    experience_level: data.experience,
    weekly_goal_km: data.weeklyGoalKm,
    preferred_pace_sec_per_km: data.preferredPaceSecPerKm,
  });

  return { saved: !error };
}
