/**
 * Pain triage.
 *
 * A first-time marathoner's most likely failure is injury, not motivation, and
 * it is the one moment where a confident AI voice is actively dangerous. So
 * "something hurts" cannot lead to a cheerful session swap: it enters a real
 * flow, and the coach suspends prescribing until it has the four answers that
 * separate a niggle from an injury.
 *
 * Three outcomes only. The third is a hard stop, and no "start run" control
 * exists anywhere on that route.
 */

export type Site =
  | "Knee"
  | "Calf"
  | "Shin"
  | "Achilles"
  | "Foot"
  | "Hip"
  | "Hamstring"
  | "Somewhere else";

export const SITES: Site[] = [
  "Knee",
  "Calf",
  "Shin",
  "Achilles",
  "Foot",
  "Hip",
  "Hamstring",
  "Somewhere else",
];

export type Duration = "today" | "days" | "week" | "weeks";
export type YesNo = "yes" | "no";

export const DURATIONS: { id: Duration; label: string }[] = [
  { id: "today", label: "It started today" },
  { id: "days", label: "A few days" },
  { id: "week", label: "About a week" },
  { id: "weeks", label: "Two weeks or more" },
];

export interface TriageAnswers {
  site: Site | null;
  duration: Duration | null;
  changesGait: YesNo | null;
  hurtsAtRest: YesNo | null;
}

export const QUESTIONS = [
  "Before anything else — where is it?",
  "How long has it been there?",
  "Does it change how you run?",
  "Does it hurt at rest?",
] as const;

/** The three questions still to come, listed so the runner sees the shape. */
export const REMAINING_LABELS = [
  "How long has it been there?",
  "Does it change how you run?",
  "Does it hurt at rest?",
] as const;

export type Outcome = "keep" | "reassess" | "professional";

const LONG_STANDING: Duration[] = ["week", "weeks"];

/**
 * Which of the three outcomes the answers imply.
 *
 * Deliberately cautious: any two of {long-standing, altered gait, pain at rest}
 * routes to a professional. This is not a diagnosis — it is a decision about
 * whether the coach is still qualified to be giving instructions at all.
 */
export function outcomeFor(a: TriageAnswers): Outcome {
  const longStanding = a.duration ? LONG_STANDING.includes(a.duration) : false;
  const gait = a.changesGait === "yes";
  const rest = a.hurtsAtRest === "yes";

  const flags = [longStanding, gait, rest].filter(Boolean).length;

  if (flags >= 2) return "professional";
  if (flags === 1) return "reassess";
  return "keep";
}

/** How long the plan pauses itself for each outcome, in days. 0 = not paused. */
export function pauseDaysFor(outcome: Outcome): number {
  if (outcome === "professional") return 14;
  if (outcome === "reassess") return 2;
  return 0;
}

export function isComplete(a: TriageAnswers): boolean {
  return (
    a.site !== null &&
    a.duration !== null &&
    a.changesGait !== null &&
    a.hurtsAtRest !== null
  );
}
