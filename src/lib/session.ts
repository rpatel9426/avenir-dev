import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { DEMO_PROFILE, DEMO_RUNS } from "@/lib/demo";
import type { Profile, Run } from "@/lib/supabase/types";

/**
 * Resolve the current runner's profile. Returns the demo profile whenever
 * Supabase isn't configured or no one is signed in, so every screen renders.
 */
export async function getProfile(): Promise<Profile> {
  if (!isSupabaseConfigured()) return DEMO_PROFILE;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return DEMO_PROFILE;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profile) return profile;

  // Signed in but no profile row yet — synthesise one from auth metadata.
  // Real accounts start on the free plan.
  return {
    ...DEMO_PROFILE,
    id: user.id,
    plan: "free",
    display_name:
      (user.user_metadata?.display_name as string | undefined) ??
      user.email?.split("@")[0] ??
      "Runner",
  };
}

/** Recent runs for the current runner, newest first. Demo data as fallback. */
export async function getRecentRuns(): Promise<Run[]> {
  if (!isSupabaseConfigured()) return DEMO_RUNS;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return DEMO_RUNS;

  const { data } = await supabase
    .from("runs")
    .select("*")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(50);

  return data && data.length > 0 ? data : DEMO_RUNS;
}
