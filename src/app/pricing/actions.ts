"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  STRIPE_PRICE_ID,
  isStripeConfigured,
  siteUrl,
  stripe,
} from "@/lib/stripe";
import type { Plan } from "@/lib/entitlements";

export interface UpgradeResult {
  ok: boolean;
  message: string;
  /** Where to send the runner — Stripe Checkout or the billing portal. */
  redirectTo?: string;
}

/**
 * Start a Premium subscription.
 *
 * The plan is NOT flipped here. Checkout hands off to Stripe, and the webhook
 * at /api/stripe/webhook is what grants the entitlement — so a closed tab, a
 * failed card or a replayed request can never mint a free subscription.
 */
export async function startCheckout(): Promise<UpgradeResult> {
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

  // No Stripe keys — fall back to the direct flip so the gate stays testable.
  if (!isStripeConfigured()) {
    return setPlan("premium");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  try {
    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
      // Either reuse the customer we already know, or let Stripe create one and
      // prefill the email so the runner isn't retyping what we already have.
      ...(profile?.stripe_customer_id
        ? { customer: profile.stripe_customer_id }
        : { customer_email: user.email ?? undefined }),
      // Both are echoed back on the webhook, so the grant is tied to a user.
      client_reference_id: user.id,
      subscription_data: { metadata: { supabase_user_id: user.id } },
      metadata: { supabase_user_id: user.id },
      allow_promotion_codes: true,
      success_url: `${siteUrl()}/pricing?upgraded=1`,
      cancel_url: `${siteUrl()}/pricing`,
    });

    if (!session.url) {
      return { ok: false, message: "Stripe didn't return a checkout link." };
    }
    return {
      ok: true,
      message: "Taking you to checkout…",
      redirectTo: session.url,
    };
  } catch (error) {
    // Problems are said in words and given an action — never a red banner.
    const detail = error instanceof Error ? error.message : "Unknown error";
    return { ok: false, message: `Checkout couldn't start. ${detail}` };
  }
}

/**
 * Manage or cancel an existing subscription.
 *
 * Cancelling goes to Stripe's billing portal rather than a retention funnel —
 * no dark patterns, on purpose. The runner keeps every run either way.
 */
export async function openBillingPortal(): Promise<UpgradeResult> {
  if (!isSupabaseConfigured() || !isStripeConfigured()) {
    return { ok: false, message: "Billing isn't connected yet." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Please log in first." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return { ok: false, message: "There's no subscription on this account yet." };
  }

  try {
    const session = await stripe().billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${siteUrl()}/profile`,
    });
    return { ok: true, message: "Opening billing…", redirectTo: session.url };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    return { ok: false, message: `Couldn't open billing. ${detail}` };
  }
}

/**
 * Set the current user's plan directly.
 *
 * Used by the no-Stripe fallback so the free/premium gate stays testable. When
 * Stripe is configured this is not reachable from the upgrade button — only a
 * verified webhook grants Premium.
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
    message:
      plan === "premium"
        ? "You're on Premium. Enjoy the coach."
        : "Switched to Free.",
  };
}
