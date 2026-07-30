/**
 * Avenir coaching engine.
 * ------------------------
 * Turns the live state of a run into a short, human coaching cue — the kind of
 * thing a good coach says into your ear. It's deliberately rule-based and
 * dependency-free so the MVP works offline and instantly, but it's shaped like
 * an async model call: `nextCue()` is pure and easy to replace with a call to
 * the Claude API (see `docs`/README for the drop-in) when you want generative,
 * personalised coaching.
 */

export type CoachTone =
  | "start"
  | "steady"
  | "push"
  | "ease"
  | "milestone"
  | "encourage"
  | "finish";

export interface CoachCue {
  tone: CoachTone;
  message: string;
}

export interface RunSnapshot {
  /** Seconds elapsed since the run started. */
  elapsed: number;
  /** Distance covered so far, in metres. */
  distance: number;
  /** Current pace, seconds per kilometre. */
  currentPace: number;
  /** Target pace for this workout, seconds per kilometre. */
  targetPace: number;
  /** Current heart rate, bpm. */
  heartRate: number;
  /** The runner's workout intent. */
  goal: "easy" | "long" | "tempo" | "intervals" | "recovery" | "race";
  /** Optional distance goal in metres — enables finish-line coaching. */
  goalDistance?: number;
  /** Memory: the km where this runner historically struggles (enables a cue). */
  struggleAtKm?: number;
}

/**
 * Recently spoken lines, so the coach never repeats itself back-to-back.
 * Module-level because only one run is ever active at a time; it slides as new
 * cues arrive and is harmless across runs.
 */
const recent: string[] = [];

const pick = (arr: string[]): string => {
  const fresh = arr.filter((line) => !recent.includes(line));
  const pool = fresh.length > 0 ? fresh : arr;
  const chosen = pool[Math.floor(Math.random() * pool.length)];
  recent.push(chosen);
  if (recent.length > 6) recent.shift();
  return chosen;
};

/** Human-readable km label, e.g. 3 -> "3K". */
const kmLabel = (metres: number) => `${Math.floor(metres / 1000)}K`;

/**
 * Decide the next coaching cue for the given snapshot.
 *
 * @param snap        current live run state
 * @param lastCueAt   elapsed-seconds when we last spoke (to avoid chattiness)
 * @param spokenKm    set of km milestones already celebrated
 * @returns a cue to speak, or null if the coach should stay quiet for now
 */
export function nextCue(
  snap: RunSnapshot,
  lastCueAt: number,
  spokenKm: Set<number>
): CoachCue | null {
  const { elapsed, distance, currentPace, targetPace, heartRate, goal } = snap;

  // Kick things off in the first few seconds.
  if (elapsed <= 3 && lastCueAt === 0) {
    return { tone: "start", message: startLine(goal) };
  }

  // Celebrate every whole kilometre exactly once.
  const km = Math.floor(distance / 1000);
  if (km >= 1 && !spokenKm.has(km)) {
    spokenKm.add(km);
    // Finish line takes priority over a routine milestone.
    if (snap.goalDistance && distance >= snap.goalDistance - 25) {
      return { tone: "finish", message: finishLine() };
    }
    // Memory: a knowing word right where this runner usually struggles.
    if (snap.struggleAtKm && km === Math.floor(snap.struggleAtKm)) {
      return { tone: "encourage", message: struggleLine(kmLabel(distance)) };
    }
    return { tone: "milestone", message: milestoneLine(km, kmLabel(distance)) };
  }

  // Finish-line push when closing in on the distance goal.
  if (
    snap.goalDistance &&
    distance >= snap.goalDistance - 250 &&
    distance < snap.goalDistance - 25 &&
    elapsed - lastCueAt > 12
  ) {
    return { tone: "push", message: finalPushLine() };
  }

  // Stay quiet unless enough time has passed since the last cue.
  const gap = elapsed - lastCueAt;
  if (gap < 22) return null;

  // Pace guidance is the coach's bread and butter.
  const drift = currentPace - targetPace; // +ve => slower than target
  const tolerance = goal === "recovery" || goal === "easy" ? 18 : 10;

  if (drift > tolerance) {
    return { tone: "push", message: pushLine(goal) };
  }
  if (drift < -tolerance) {
    // Running hot. On easy days, rein it in; on hard days, allow it once.
    if (goal === "easy" || goal === "recovery" || goal === "long") {
      return { tone: "ease", message: easeLine() };
    }
  }

  // Heart-rate awareness.
  if (heartRate > 178 && goal !== "intervals" && goal !== "race") {
    return { tone: "ease", message: hrHighLine() };
  }

  // Otherwise: keep the runner locked in with steady encouragement.
  return {
    tone: Math.random() > 0.55 ? "steady" : "encourage",
    message: Math.random() > 0.55 ? steadyLine() : encourageLine(elapsed),
  };
}

/* ------------------------------------------------------------------ *
 * Copy banks. Kept intentionally short, warm and specific — the voice
 * of a coach who's next to you, not a fitness tracker reading numbers.
 * ------------------------------------------------------------------ */

function startLine(goal: RunSnapshot["goal"]): string {
  const byGoal: Record<RunSnapshot["goal"], string[]> = {
    easy: [
      "Let's ease into it. Relax the shoulders, find your rhythm.",
      "Nice and easy to start. This one's about time on feet.",
    ],
    long: [
      "Long run today. Start slower than feels right — patience pays off later.",
      "We're in this for the distance. Settle in, breathe deep.",
    ],
    tempo: [
      "Tempo day. Build into it — the effort comes soon.",
      "Let's warm the legs up, then we lock into that comfortably-hard pace.",
    ],
    intervals: [
      "Intervals today. Loose and ready — first rep coming up.",
      "Let's get sharp. Ease through this warm-up.",
    ],
    recovery: [
      "Recovery run. Keep it gentle — you're here to heal, not to prove.",
      "Easy does it. Let the legs turn over softly.",
    ],
    race: [
      "Race pace. Trust your training and stay composed.",
      "Here we go. Controlled and confident — you've earned this.",
    ],
  };
  return pick(byGoal[goal]);
}

function milestoneLine(km: number, label: string): string {
  return pick([
    `${label} down. Smooth and strong — keep that form.`,
    `That's ${label}. You're settling into a great rhythm.`,
    `${label} in the bank. Breathing controlled, eyes ahead.`,
    `${label} done. Every step from here is a step you've earned.`,
    km >= 5
      ? `${label} — this is where the strong runners are made. Stay with it.`
      : `${label}. Looking composed out there.`,
  ]);
}

function pushLine(goal: RunSnapshot["goal"]): string {
  const base = [
    "Let's lift it a touch — shorten the ground time, drive the arms.",
    "Bit more here. Pick up the cadence, stay light on your feet.",
    "You've got another gear — reach for it now.",
  ];
  if (goal === "tempo" || goal === "race" || goal === "intervals") {
    base.push("This is the effort we came for. Hold the line and push.");
  }
  return pick(base);
}

function easeLine(): string {
  return pick([
    "Ease back a hair — save that fire for later.",
    "A little quick there. Relax the pace, let the breathing catch up.",
    "Dial it back gently. Smooth beats fast today.",
  ]);
}

function hrHighLine(): string {
  return pick([
    "Heart rate's climbing — take a breath, drop the effort a notch.",
    "Let's bring the heart rate down. Relax the jaw, ease the pace.",
  ]);
}

function steadyLine(): string {
  return pick([
    "Right on pace. This is exactly it — hold here.",
    "Locked in. Beautiful rhythm, keep it turning.",
    "That's the pace. Nothing to change — just flow.",
    "Perfectly steady. Let the miles come to you.",
  ]);
}

function encourageLine(elapsed: number): string {
  const mins = Math.floor(elapsed / 60);
  return pick([
    "You're doing the work. This is what progress feels like.",
    "Strong and composed. I'm right here with you.",
    mins > 0
      ? `${mins} ${mins === 1 ? "minute" : "minutes"} of quality work behind you. Keep stacking them.`
      : "Every stride is banking fitness. Stay present.",
    "Chin up, gaze soft. You were built for this.",
  ]);
}

function finalPushLine(): string {
  return pick([
    "Home stretch — empty the tank, leave nothing out here.",
    "The line's in sight. Everything you've got, right now.",
    "This is it. Drive to the finish — you're stronger than the distance.",
  ]);
}

function struggleLine(label: string): string {
  return pick([
    `${label} — this is usually where it gets tough for you. I know. Stay with me and we move through it together.`,
    `Right around ${label} is where you tend to dip. Not today — shoulders down, breathe, we hold.`,
    `This is your patch, ${label}. You've been here before and come out the other side. Settle in.`,
  ]);
}

function finishLine(): string {
  return pick([
    "That's the run. Outstanding work today — be proud of that one.",
    "Done. You showed up and delivered. Ease down and breathe it in.",
    "Finished strong. That's how you build a runner. Well done.",
  ]);
}
