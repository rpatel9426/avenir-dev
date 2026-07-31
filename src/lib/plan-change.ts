/**
 * Proposed plan changes.
 *
 * The Coach screen's whole argument is that a consequential reply lands as an
 * inline diff the runner accepts in one tap — no free-floating advice they have
 * to re-enter somewhere else. This reads the runner's intent and names the
 * change it implies.
 *
 * Scope note: accepting a change is currently local to the session. Persisting
 * it (and the 24-hour undo plus plan history that R8 requires) needs a plan
 * table in Supabase — tracked as roadmap Phase 3.
 */

export interface PlanChange {
  /** What the plan says now. Rendered struck through. */
  before: string;
  /** What it would say instead. */
  after: string;
}

const RULES: { test: RegExp; change: PlanChange }[] = [
  {
    // Pain and tightness never gamble — the session comes down, not out.
    test: /(hurt|pain|sore|tight|niggl|calf|knee|shin|achilles|hamstring)/i,
    change: {
      before: "Thu · Tempo 8 km",
      after: "Thu · Easy 30′",
    },
  },
  {
    test: /(can'?t run|no time|skip|busy|travel|away)/i,
    change: {
      before: "Thu · Tempo 8 km",
      after: "Sat · Tempo 8 km",
    },
  },
  {
    test: /(tired|exhaust|drained|heavy|wrecked|slept badly|no sleep)/i,
    change: {
      before: "Tomorrow · Intervals",
      after: "Tomorrow · Easy 25′",
    },
  },
  {
    test: /(move|reschedul|swap|shift|tomorrow)/i,
    change: {
      before: "Tomorrow · Intervals",
      after: "Fri · Intervals",
    },
  },
  {
    test: /(easier|too hard|too much|reduce|cut back|lighter)/i,
    change: {
      before: "Sat · Long run 21 km",
      after: "Sat · Long run 18 km",
    },
  },
];

/** The change a message implies, or null when the coach is only talking. */
export function proposeChange(message: string): PlanChange | null {
  return RULES.find((r) => r.test.test(message))?.change ?? null;
}
