import type { ExperienceLevel } from "@/lib/supabase/types";
import type { PlanEntry, PlanEntryId } from "@/lib/plan";

/**
 * Build a week from what the coach actually knows about the runner.
 *
 * The old template was fixed, which meant a beginner who could only run at
 * weekends still got five sessions on weekdays — the plan looked personal and
 * wasn't. This takes the two inputs that genuinely change the shape of a week:
 * how much running the runner is used to, and which days they can run.
 */

const DAY_TOKENS: Record<string, number> = {
  mon: 0,
  tue: 1,
  wed: 2,
  thu: 3,
  fri: 4,
  sat: 5,
  sun: 6,
};

/** "Tue Thu Sat Sun" → [1, 3, 5, 6]. Falls back to a sensible spread. */
export function parseDays(value: string | undefined): number[] {
  if (!value) return [1, 3, 5, 6];

  const lower = value.toLowerCase();
  if (lower.includes("weekend")) return [5, 6];

  const found = Object.entries(DAY_TOKENS)
    .filter(([token]) => lower.includes(token))
    .map(([, index]) => index)
    .sort((a, b) => a - b);

  return found.length > 0 ? found : [1, 3, 5, 6];
}

/** How many runs a week each level should be doing. */
function runsPerWeek(level: ExperienceLevel): number {
  if (level === "beginner") return 3;
  if (level === "advanced") return 5;
  return 4;
}

/**
 * The sessions, hardest first, so that when the runner has fewer days
 * available it's the optional quality work that drops rather than the long run.
 */
function sessionsFor(level: ExperienceLevel): PlanEntryId[] {
  if (level === "beginner") return ["long", "easy", "easy"];
  if (level === "advanced")
    return ["long", "intervals", "tempo", "easy", "easy"];
  return ["long", "tempo", "easy", "easy"];
}

export function buildWeek(
  level: ExperienceLevel,
  availableDays: number[]
): PlanEntry[] {
  const days = availableDays.length > 0 ? availableDays : [1, 3, 5, 6];
  const wanted = Math.min(runsPerWeek(level), days.length);
  const sessions = sessionsFor(level).slice(0, wanted);

  // The long run goes on the last available day — usually a weekend — and the
  // rest spread backwards from there, so hard days don't end up adjacent.
  const chosen = pickSpread(days, wanted);
  const week: PlanEntry[] = Array.from({ length: 7 }, () => ({ id: "rest" }));

  const longDay = chosen[chosen.length - 1];
  week[longDay] = { id: sessions[0] };

  const others = chosen.slice(0, -1);
  sessions.slice(1).forEach((id, i) => {
    if (others[i] === undefined) return;
    week[others[i]] = { id };
  });

  // A beginner benefits more from one strength day than from a fourth run.
  if (level === "beginner") {
    const free = week.findIndex((e, i) => e.id === "rest" && !days.includes(i));
    if (free >= 0) {
      week[free] = { id: "strength", detail: "25 min · calves & hips" };
    }
  }

  return week;
}

/** Choose `count` days from `days`, spread as evenly as the week allows. */
function pickSpread(days: number[], count: number): number[] {
  if (count >= days.length) return [...days];
  const step = (days.length - 1) / (count - 1 || 1);
  const out: number[] = [];
  for (let i = 0; i < count; i += 1) {
    out.push(days[Math.round(i * step)]);
  }
  return [...new Set(out)].sort((a, b) => a - b);
}
