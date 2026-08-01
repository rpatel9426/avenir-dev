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
  /** Days from Monday, so the change lands on a real row in plan_sessions. */
  weekdayOffset: number;
  /** The session kind it becomes. */
  kind: string;
  detail: string | null;
}

const RULES: { test: RegExp; change: PlanChange }[] = [
  {
    // Can't run today — the session moves rather than disappearing.
    test: /(can'?t run|no time|skip|busy|travel|away)/i,
    change: {
      before: "Thu · Tempo",
      after: "Sat · Tempo",
      weekdayOffset: 5,
      kind: "tempo",
      detail: "Moved from Thursday",
    },
  },
  {
    test: /(tired|exhaust|drained|heavy|wrecked|slept badly|no sleep)/i,
    change: {
      before: "Thu · Tempo",
      after: "Thu · Easy 25′",
      weekdayOffset: 3,
      kind: "easy",
      detail: "25 min · you were flat",
    },
  },
  {
    test: /(move|reschedul|swap|shift|tomorrow)/i,
    change: {
      before: "Thu · Tempo",
      after: "Fri · Tempo",
      weekdayOffset: 4,
      kind: "tempo",
      detail: "Moved from Thursday",
    },
  },
  {
    test: /(easier|too hard|too much|reduce|cut back|lighter)/i,
    change: {
      before: "Sun · Long run",
      after: "Sun · Long run, shorter",
      weekdayOffset: 6,
      kind: "long",
      detail: "Shortened · conversational throughout",
    },
  },
];

/** The change a message implies, or null when the coach is only talking. */
export function proposeChange(message: string): PlanChange | null {
  return RULES.find((r) => r.test.test(message))?.change ?? null;
}
