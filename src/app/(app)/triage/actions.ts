"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * Pause the plan.
 *
 * "Your plan is paused" has to be true, not reassuring copy — nothing may be
 * scheduled and nothing may count against the runner while it holds. Today
 * reads this and refuses to offer a run.
 */
export async function pausePlan(days: number): Promise<{ ok: boolean }> {
  if (!isSupabaseConfigured() || days <= 0) return { ok: false };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const until = new Date();
  until.setDate(until.getDate() + days);

  const { error } = await supabase
    .from("profiles")
    .update({ plan_paused_until: until.toISOString() })
    .eq("id", user.id);

  revalidatePath("/dashboard");
  revalidatePath("/plan");
  return { ok: !error };
}

/** Lift the pause — the runner's call, once they're ready. */
export async function resumePlan(): Promise<{ ok: boolean }> {
  if (!isSupabaseConfigured()) return { ok: false };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { error } = await supabase
    .from("profiles")
    .update({ plan_paused_until: null })
    .eq("id", user.id);

  revalidatePath("/dashboard");
  revalidatePath("/plan");
  return { ok: !error };
}
