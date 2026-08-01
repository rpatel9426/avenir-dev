"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isoDate } from "@/lib/plan-store";
import { weekStart } from "@/lib/plan";

export interface AcceptedChange {
  ok: boolean;
  /** What the session was before, so Undo can put it back exactly. */
  previous?: { kind: string; detail: string | null; tag: string | null };
}

/**
 * Apply a plan change the runner accepted.
 *
 * Until now Accept only changed what was on screen. This writes the session,
 * tags it as a coach edit — never silent — and returns what it replaced so the
 * 24-hour undo has something true to restore.
 */
export async function applyPlanChange(
  weekdayOffset: number,
  kind: string,
  detail: string | null
): Promise<AcceptedChange> {
  if (!isSupabaseConfigured()) return { ok: false };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const date = weekStart();
  date.setDate(date.getDate() + weekdayOffset);
  const on = isoDate(date);

  const { data: before } = await supabase
    .from("plan_sessions")
    .select("kind, detail, tag")
    .eq("user_id", user.id)
    .eq("scheduled_on", on)
    .maybeSingle();

  const { error } = await supabase.from("plan_sessions").upsert(
    {
      user_id: user.id,
      scheduled_on: on,
      kind,
      detail,
      tag: "Moved",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,scheduled_on" }
  );

  revalidatePath("/plan");
  revalidatePath("/dashboard");

  return {
    ok: !error,
    previous: before ?? undefined,
  };
}

/** Put a session back exactly as it was. Reversibility is the cheapest trust. */
export async function revertPlanChange(
  weekdayOffset: number,
  previous: { kind: string; detail: string | null; tag: string | null }
): Promise<{ ok: boolean }> {
  if (!isSupabaseConfigured()) return { ok: false };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const date = weekStart();
  date.setDate(date.getDate() + weekdayOffset);

  const { error } = await supabase.from("plan_sessions").upsert(
    {
      user_id: user.id,
      scheduled_on: isoDate(date),
      kind: previous.kind,
      detail: previous.detail,
      tag: previous.tag,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,scheduled_on" }
  );

  revalidatePath("/plan");
  revalidatePath("/dashboard");
  return { ok: !error };
}
