import type { Profile } from "@/lib/supabase/types";

/**
 * Avenir's free/premium model.
 *
 * FREE  — the full run experience: tracking, local coaching cues (spoken aloud),
 *         history, dashboard. Costs us nothing per run.
 * PREMIUM — talking *to* the coach: the two-way, generative voice conversation
 *         (hands-free listening + the /api/coach model calls). This is the only
 *         thing that incurs token cost, so it's the paid tier.
 */
export type Plan = "free" | "premium";

export function isPremium(profile: Pick<Profile, "plan"> | null): boolean {
  return profile?.plan === "premium";
}

/** Marketing copy for the pricing page + upgrade prompts. */
export const PLANS = {
  free: {
    name: "Free",
    price: "$0",
    tagline: "Everything you need to run coached.",
    features: [
      "Unlimited coached runs",
      "Live spoken coaching cues",
      "Pace, heart rate & elevation tracking",
      "Run history & weekly goals",
    ],
  },
  premium: {
    name: "Premium",
    price: "$9.99",
    tagline: "Talk to your coach, hands-free.",
    features: [
      "Everything in Free",
      "Two-way voice conversation with Avenir",
      "Ask anything mid-run, hands-free",
      "Memory-aware, generative coaching",
    ],
  },
} as const;
