import type { Profile, Run } from "@/lib/supabase/types";

/**
 * Local demo data so the app is fully explorable before Supabase is connected.
 * Once real auth + tables are live, these are only used as a fallback for the
 * signed-out demo experience.
 */

export const DEMO_PROFILE: Profile = {
  id: "demo-user",
  display_name: "Alex",
  experience_level: "intermediate",
  weekly_goal_km: 30,
  preferred_pace_sec_per_km: 330,
  plan: "premium", // demo shows the full experience, incl. voice conversation
  // The demo runner has never been through Stripe — there is nothing to bill.
  stripe_customer_id: null,
  stripe_subscription_id: null,
  created_at: new Date().toISOString(),
};

const daysAgo = (n: number) =>
  new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

export const DEMO_RUNS: Run[] = [
  {
    id: "r1",
    user_id: "demo-user",
    goal: "tempo",
    distance_m: 6120,
    duration_s: 1908,
    avg_pace_sec_per_km: 312,
    avg_heart_rate: 162,
    calories: 372,
    notes: "Felt strong on the second half.",
    started_at: daysAgo(1),
    created_at: daysAgo(1),
  },
  {
    id: "r2",
    user_id: "demo-user",
    goal: "easy",
    distance_m: 5030,
    duration_s: 1806,
    avg_pace_sec_per_km: 359,
    avg_heart_rate: 141,
    calories: 305,
    notes: null,
    started_at: daysAgo(3),
    created_at: daysAgo(3),
  },
  {
    id: "r3",
    user_id: "demo-user",
    goal: "long",
    distance_m: 12240,
    duration_s: 4590,
    avg_pace_sec_per_km: 375,
    avg_heart_rate: 149,
    calories: 742,
    notes: "Negative split the last 3K.",
    started_at: daysAgo(5),
    created_at: daysAgo(5),
  },
  {
    id: "r4",
    user_id: "demo-user",
    goal: "intervals",
    distance_m: 5000,
    duration_s: 1650,
    avg_pace_sec_per_km: 330,
    avg_heart_rate: 168,
    calories: 340,
    notes: "6 x 800m. Hard but held pace.",
    started_at: daysAgo(8),
    created_at: daysAgo(8),
  },
];
