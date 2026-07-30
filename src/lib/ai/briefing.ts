import type { Workout } from "@/lib/workouts";
import type { RunnerMemory } from "@/lib/ai/memory";
import { formatPace } from "@/lib/utils";

/**
 * Builds the coach's pre-run briefing — the moment Avenir explains today's
 * session in the context of who you are. Deterministic and memory-aware so it
 * feels personal without needing a model call before the run even starts.
 *
 * Returns 2–3 short lines meant to be shown (and spoken) one after another.
 */
export function buildBriefing(
  workout: Workout,
  mem: RunnerMemory,
  goalDistanceKm: number
): string[] {
  const paceLabel = `${formatPace(workout.targetPace)} /km`;
  const lines: string[] = [];

  // 1) What we're doing today.
  const intent: Record<Workout["id"], string> = {
    easy: `Today is an easy ${goalDistanceKm}K. The whole point is control — keep it conversational.`,
    long: `Today is a ${goalDistanceKm}K long run. We're building endurance, so patience early is everything.`,
    tempo: `Today is a ${goalDistanceKm}K tempo around ${paceLabel}. Comfortably hard — we hold the effort, not chase it.`,
    intervals: `Today is intervals over ${goalDistanceKm}K near ${paceLabel}. Sharp and controlled on the fast stretches.`,
    recovery: `Today is a gentle ${goalDistanceKm}K recovery run. This one is for healing — no ego.`,
    race: `Today is a ${goalDistanceKm}K at race effort. Trust the work you've put in and stay composed.`,
  };
  lines.push(intent[workout.id]);

  // 2) A memory-driven insight tailored to the session.
  if (workout.id === "easy" || workout.id === "recovery") {
    lines.push(
      `Last week you ${mem.lastWeek.note}. Let's stay patient today and keep the heart rate honest.`
    );
  } else if (workout.id === "long") {
    lines.push(
      `You tend to ${mem.weaknesses[0] ?? "fade late"} — so we start slower than feels right and finish strong.`
    );
  } else {
    lines.push(
      `You ${mem.tendencies[0] ?? "start a little fast"}, so ease into the first rep. Your ${mem.strengths[0] ?? "engine"} will carry you.`
    );
  }

  // 3) A calm send-off.
  lines.push("I'll be with you the whole way. Whenever you're ready — let's run.");

  return lines;
}
