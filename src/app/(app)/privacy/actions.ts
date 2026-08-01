"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export interface ExportPayload {
  exportedAt: string;
  profile: Record<string, unknown> | null;
  runs: Record<string, unknown>[];
}

/**
 * Everything Avenir holds about the runner, as one JSON document.
 *
 * Export is the primary action on the privacy screen and deletion sits beside
 * it, unhidden — "the runner never starts over" only means something if they
 * can take the record with them.
 */
export async function exportMyData(): Promise<ExportPayload | { error: string }> {
  if (!isSupabaseConfigured()) {
    return { error: "Connect Supabase to export real data." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in first." };

  const [{ data: profile }, { data: runs }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("runs")
      .select("*")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false }),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    profile: profile ?? null,
    runs: runs ?? [],
  };
}

/**
 * Delete every run and reset the coach's model of the runner.
 *
 * Deliberately scoped: this clears the training record and the profile fields
 * the coach reasons from. It does not remove the login itself — that has to go
 * through Supabase auth admin, which the browser session can't reach, and
 * silently half-deleting an account is worse than saying so.
 */
export async function deleteMyData(): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Connect Supabase to manage real data." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Please log in first." };

  const { error: runsError } = await supabase
    .from("runs")
    .delete()
    .eq("user_id", user.id);

  if (runsError) return { ok: false, message: runsError.message };

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      preferred_pace_sec_per_km: null,
      plan_paused_until: null,
    })
    .eq("id", user.id);

  if (profileError) return { ok: false, message: profileError.message };

  return {
    ok: true,
    message:
      "Done. Every run is gone and I've forgotten what I learned from them.",
  };
}
