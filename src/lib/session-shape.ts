import { formatPace } from "@/lib/utils";
import type { Workout } from "@/lib/workouts";

/**
 * A session drawn as a shape.
 *
 * Block height encodes effort, so the structure of a workout is understood
 * before a single word is read. `emphasis` marks the part that is the point of
 * the session — everything else is there to make that part possible.
 */
export interface Segment {
  /** The mono label on the left: a duration or a distance. */
  amount: string;
  label: string;
  /** 0–1, drawn as block height. */
  effort: number;
  emphasis?: boolean;
}

export function segmentsFor(workout: Workout): Segment[] {
  const easy = formatPace(workout.targetPace + 60);
  const target = formatPace(workout.targetPace);

  switch (workout.id) {
    case "tempo":
      return [
        { amount: "15 min", label: `Warm up · ${easy}`, effort: 0.35 },
        { amount: "3 km", label: `Tempo · ${target}`, effort: 1, emphasis: true },
        { amount: "3 min", label: "Float · easy", effort: 0.2 },
        { amount: "3 km", label: `Tempo · ${target}`, effort: 1, emphasis: true },
        { amount: "10 min", label: "Cool down", effort: 0.35 },
      ];

    case "intervals":
      return [
        { amount: "10 min", label: `Warm up · ${easy}`, effort: 0.35 },
        { amount: "6 ×", label: `400 m · ${target}`, effort: 1, emphasis: true },
        { amount: "90 s", label: "Float between each", effort: 0.2 },
        { amount: "10 min", label: "Cool down", effort: 0.35 },
      ];

    case "long":
      return [
        { amount: "10 min", label: "Ease into it", effort: 0.35 },
        {
          amount: `${(workout.distance / 1000).toFixed(0)} km`,
          label: `Conversational · ${target}`,
          effort: 0.8,
          emphasis: true,
        },
        { amount: "5 min", label: "Walk it off", effort: 0.15 },
      ];

    case "race":
      return [
        { amount: "15 min", label: "Warm up · shake out", effort: 0.35 },
        { amount: "Race", label: `Hold ${target}`, effort: 1, emphasis: true },
        { amount: "10 min", label: "Walk, then eat", effort: 0.15 },
      ];

    case "recovery":
      return [
        {
          amount: workout.durationLabel.replace("~", ""),
          label: `Easy throughout · ${easy}`,
          effort: 0.3,
          emphasis: true,
        },
      ];

    default:
      return [
        { amount: "5 min", label: "Ease into it", effort: 0.3 },
        {
          amount: workout.durationLabel.replace("~", ""),
          label: `Conversational · ${target}`,
          effort: 0.55,
          emphasis: true,
        },
        { amount: "5 min", label: "Cool down", effort: 0.25 },
      ];
  }
}

/** The one explanation component, used everywhere — same pattern as Home. */
export function whyThisSession(workout: Workout): string {
  switch (workout.id) {
    case "tempo":
      return "Race pace should eventually feel like this does now. Two blocks instead of one continuous effort because of where you are in the block, not because you can't hold it.";
    case "intervals":
      return "Short and fast, with real recovery between. The point is turnover, not exhaustion — if the last rep is slower than the first, we went too hard.";
    case "long":
      return "Time on your feet is the session. Pace is almost irrelevant here; finishing it comfortable is the whole objective.";
    case "recovery":
      return "This one is meant to feel too easy. It exists so the hard sessions land, and running it faster costs you the next one.";
    case "race":
      return "Everything you've banked, spent on purpose. Go out slower than feels right and you'll pass people at the end.";
    default:
      return "Conversational effort, nothing more. Most of your running should feel like this — it's what makes the sharp sessions possible.";
  }
}
