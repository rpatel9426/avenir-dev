"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { weekStart } from "@/lib/plan";
import { isoDate } from "@/lib/plan-store";
import type { BeliefKey } from "@/lib/beliefs";

/**
 * Record a correction.
 *
 * The correction has to be absorbed, not filed — so this revalidates Today and
 * Plan as well as the page it came from. The runner should see the change land
 * on the screens that act on it.
 */
export async function correctBelief(
  key: BeliefKey,
  value: string
): Promise<{ ok: boolean }> {
  if (!isSupabaseConfigured()) return { ok: false };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { error } = await supabase.from("coach_beliefs").upsert(
    {
      user_id: user.id,
      key,
      value,
      corrected_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,key" }
  );

  /*
   * Absorbed, not filed. Changing which days you can run has to actually
   * reshape the week — otherwise the correction is cosmetic, which is exactly
   * the failure the design critique calls out. Clearing the untouched days of
   * this week makes the next read rebuild them from the new answer; days
   * already run, or already edited by the coach, are left alone.
   */
  if (key === "best_days" && !error) {
    const monday = weekStart();
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    await supabase
      .from("plan_sessions")
      .delete()
      .eq("user_id", user.id)
      .is("tag", null)
      .is("completed_run_id", null)
      .gte("scheduled_on", isoDate(monday))
      .lte("scheduled_on", isoDate(sunday));
  }

  revalidatePath("/about-you");
  revalidatePath("/dashboard");
  revalidatePath("/plan");
  return { ok: !error };
}
