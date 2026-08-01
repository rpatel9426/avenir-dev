import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * What the coach thinks it knows about the runner.
 *
 * Every claim on /about-you is one of these. Storing them is what turns
 * "that's not right" from a screen effect into a correction the coach
 * actually carries forward.
 */

export type BeliefKey =
  | "easy_pace"
  | "sleep_sensitivity"
  | "watching"
  | "best_days"
  | "motivation";

export interface Belief {
  value: string;
  /** Set when the runner corrected it, rather than the coach inferring it. */
  corrected: boolean;
}

export type Beliefs = Partial<Record<BeliefKey, Belief>>;

/** Defaults the coach starts from before it has learned anything. */
export const DEFAULT_BELIEFS: Record<BeliefKey, string> = {
  easy_pace: "Still learning",
  sleep_sensitivity: "Medium",
  watching: "Nothing right now",
  best_days: "Tue Thu Sat Sun",
  motivation: "Responds to progress, not pressure",
};

export async function getBeliefs(): Promise<Beliefs> {
  if (!isSupabaseConfigured()) return {};

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const { data } = await supabase
    .from("coach_beliefs")
    .select("key, value, corrected_at")
    .eq("user_id", user.id);

  const out: Beliefs = {};
  for (const row of data ?? []) {
    out[row.key as BeliefKey] = {
      value: row.value,
      corrected: row.corrected_at !== null,
    };
  }
  return out;
}
