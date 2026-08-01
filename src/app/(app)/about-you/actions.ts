"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
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

  revalidatePath("/about-you");
  revalidatePath("/dashboard");
  revalidatePath("/plan");
  return { ok: !error };
}
