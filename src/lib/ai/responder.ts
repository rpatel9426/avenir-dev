import { hrZone, type RunnerMemory } from "@/lib/ai/memory";
import { formatPace } from "@/lib/utils";

export interface RunContext {
  goal: string;
  elapsed: number;
  distanceKm: number;
  currentPace: number; // sec/km
  targetPace: number; // sec/km
  heartRate: number;
  cadence: number;
}

/**
 * The local conversational coach — a smart, intent-based fallback used whenever
 * OpenAI isn't configured. It keeps voice interaction genuinely useful (and the
 * demo magical) with zero setup. The OpenAI path in `/api/coach` supersedes this
 * when a key is present; both share the same persona and memory.
 */
export function localCoachReply(
  message: string,
  ctx: RunContext,
  mem: RunnerMemory
): string {
  const m = message.toLowerCase();
  const zone = hrZone(ctx.heartRate, mem);
  const drift = ctx.currentPace - ctx.targetPace; // +ve = slower than target

  // Tired / struggling.
  if (/(tired|exhaust|dying|can'?t|struggl|hard|heavy|hurts?|pain|cramp)/.test(m)) {
    if (zone >= 4) {
      return "I hear you — your heart rate is high. Ease the pace a little, drop the shoulders, and breathe out slowly. We reset together.";
    }
    return "That's the work talking, and you're handling it. Relax the jaw, shorten the stride a touch, and stay with your breathing. I've got you.";
  }

  // How am I doing?
  if (/(how('?s| is| am)|doing|pace|going|look)/.test(m)) {
    if (Math.abs(drift) <= 8) {
      return `Right on target at ${formatPace(ctx.currentPace)} per k, heart rate in Zone ${zone}. This is exactly where we want to be.`;
    }
    if (drift > 8) {
      return `A little behind target — you're at ${formatPace(ctx.currentPace)}. No panic. Lift the cadence gently and we'll bring it back.`;
    }
    return `You're a touch quick at ${formatPace(ctx.currentPace)}. Ease back slightly so we don't pay for it later.`;
  }

  // Heart rate question.
  if (/(heart|hr|zone|bpm)/.test(m)) {
    return `Heart rate's ${ctx.heartRate}, that's Zone ${zone}. ${
      zone >= 4 ? "Let's ease it down a notch." : "Nicely controlled — hold here."
    }`;
  }

  // Water / walk / break.
  if (/(walk|break|stop|water|rest)/.test(m)) {
    return "Totally fine to take a few easy steps and a sip. Walk it for twenty seconds, then we ease back into rhythm.";
  }

  // Motivation / encouragement.
  if (/(motivat|encourag|push|keep going|come on|help)/.test(m)) {
    return `Remember why you laced up. Lean on your ${mem.strengths[0] ?? "strong engine"} — settle in, trust it, and we finish this together.`;
  }

  // Distance / how far.
  if (/(how far|distance|left|remaining|done)/.test(m)) {
    return `You're ${ctx.distanceKm.toFixed(2)} k in and moving well. Stay present — one relaxed kilometre at a time.`;
  }

  // Fallback: acknowledge + steady cue.
  return "I'm right here with you. Keep your rhythm smooth and your breathing easy — you're doing the work.";
}
