"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Plan } from "@/lib/entitlements";

export interface UpgradeResult {
  ok: boolean;
  message: string;
}

/**
 * Set the current user's plan.
 *
 * NOTE: this is the entitlement flip only — there is no payment processing yet.
 * The production version would run this *after* a successful Stripe Checkout
 * webhook, not directly from a button. It's wired this way now so the free/
 * premium gate is testable end-to-end.
 */
export async function setPlan(plan: Plan): Promise<UpgradeResult> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: "Connect Supabase to manage real plans. (Demo is already Premium.)",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Please log in first." };

  const { error } = await supabase
    .from("profiles")
    .update({ plan })
    .eq("id", user.id);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/pricing");
  revalidatePath("/profile");
  return {
    ok: true,
    message: plan === "premium" ? "You're on Premium. Enjoy the coach." : "Switched to Free.",
  };
}
