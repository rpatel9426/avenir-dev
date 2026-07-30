/**
 * Avenir's memory of the runner.
 * ------------------------------
 * This is what makes Avenir a *companion* rather than a tracker — it remembers
 * how you run. For the MVP the profile is seeded with realistic values, but the
 * shape is deliberately the one a real system would compute from workout history
 * (see `supabase/schema.sql` → `runs`). When live history exists, replace
 * `getMemory()` with a query + aggregation; nothing downstream changes.
 */

export type MotivationStyle = "calm" | "tough" | "data";

export interface RunnerMemory {
  displayName: string;
  experience: "beginner" | "intermediate" | "advanced";
  motivationStyle: MotivationStyle;

  /** Typical easy pace, seconds per km — the baseline the coach reasons from. */
  easyPaceSecPerKm: number;
  /** Resting + threshold heart-rate anchors for zone awareness. */
  restingHr: number;
  thresholdHr: number;

  /** Behavioural tendencies the coach references live. */
  tendencies: string[];
  strengths: string[];
  weaknesses: string[];

  /** A lightweight "last week" snapshot for comparative coaching. */
  lastWeek: {
    distanceKm: number;
    avgHr: number;
    note: string;
  };

  /** The distance (km) where this runner historically struggles. */
  struggleAtKm: number;
}

export const DEMO_MEMORY: RunnerMemory = {
  displayName: "Alex",
  experience: "intermediate",
  motivationStyle: "calm",
  easyPaceSecPerKm: 345, // 5:45 /km
  restingHr: 52,
  thresholdHr: 172,
  // Phrased so they read naturally after "You ..." / "Your ...".
  tendencies: [
    "start a little fast in the first kilometre",
    "settle into a strong rhythm once warmed up",
    "let your cadence drop when tired",
  ],
  strengths: ["quick recovery after hills", "steady, controlled breathing"],
  weaknesses: ["fade slightly in the final third of long runs"],
  lastWeek: {
    distanceKm: 28,
    avgHr: 148,
    note: "drifted above Zone 2 after the third kilometre on the easy run",
  },
  struggleAtKm: 6,
};

/**
 * Returns the runner's memory. Simulated today; swap for a Supabase-derived
 * aggregation once there's real workout history.
 */
export function getMemory(): RunnerMemory {
  return DEMO_MEMORY;
}

/** Heart-rate zone (1–5) for a given bpm, from the runner's anchors. */
export function hrZone(bpm: number, mem: RunnerMemory): number {
  const { restingHr, thresholdHr } = mem;
  const reserve = thresholdHr - restingHr;
  const frac = (bpm - restingHr) / reserve;
  if (frac < 0.55) return 1;
  if (frac < 0.72) return 2;
  if (frac < 0.87) return 3;
  if (frac < 1.0) return 4;
  return 5;
}

/**
 * A compact, human summary of the runner used to prime the coach (both the
 * OpenAI system prompt and the local responder). Kept short on purpose.
 */
export function memorySummary(mem: RunnerMemory): string {
  return [
    `${mem.displayName} is an ${mem.experience} runner.`,
    `Easy pace ~${Math.floor(mem.easyPaceSecPerKm / 60)}:${String(
      mem.easyPaceSecPerKm % 60
    ).padStart(2, "0")}/km, threshold HR ~${mem.thresholdHr}.`,
    `Tendencies: ${mem.tendencies.join("; ")}.`,
    `Strengths: ${mem.strengths.join("; ")}.`,
    `Watch-outs: ${mem.weaknesses.join("; ")}.`,
    `Last week: ${mem.lastWeek.distanceKm}km, avg HR ${mem.lastWeek.avgHr}, ${mem.lastWeek.note}.`,
    `Prefers ${mem.motivationStyle} motivation.`,
  ].join(" ");
}
