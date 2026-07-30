import { NextResponse } from "next/server";
import { getMemory } from "@/lib/ai/memory";
import { coachSystemPrompt } from "@/lib/ai/system-prompt";
import { localCoachReply, type RunContext } from "@/lib/ai/responder";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { formatPace } from "@/lib/utils";

export const runtime = "nodejs";

interface CoachRequest {
  message: string;
  context: RunContext;
}

/**
 * The live coaching endpoint. Given what the runner just said and the live state
 * of their run, returns a short spoken coaching reply.
 *
 * - With `ANTHROPIC_API_KEY` set → generative coaching from Claude, primed with
 *   the coach persona + runner memory.
 * - Without a key → the local intent-based responder, so voice still works.
 *
 * Latency note: this reply is spoken aloud mid-run, so speed matters more than
 * depth. We run Claude *without* extended thinking (the default on Opus 4.8) and
 * cap the reply length — a one-or-two-sentence cue should come back fast.
 */
export async function POST(request: Request) {
  let body: CoachRequest;
  try {
    body = (await request.json()) as CoachRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { message, context } = body;
  if (!message || !context) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // 1) Rate limit — protects against runaway loops / abuse driving up token cost.
  //    20 coaching turns per minute per client is plenty for a real run.
  const limit = rateLimit(clientKey(request), 20, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests. Give it a moment.", reply: null },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  // 2) Auth + premium gate — talking to the coach is a paid feature.
  //    When Supabase is live we require a signed-in Premium user (logged-out
  //    callers can't burn tokens). With no Supabase (local demo), it's open so
  //    the showcase stays fully functional.
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "auth_required", reply: null },
        { status: 401 }
      );
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.plan !== "premium") {
      return NextResponse.json(
        {
          error: "premium_required",
          reply:
            "Talking to your coach is part of Avenir Premium. Upgrade to chat hands-free mid-run.",
        },
        { status: 402 }
      );
    }
  }

  const mem = getMemory();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // No key → local responder (keeps the demo fully functional, zero setup).
  if (!apiKey) {
    return NextResponse.json({
      reply: localCoachReply(message, context, mem),
      source: "local",
    });
  }

  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey });

    const userState = [
      `Live run state:`,
      `- session: ${context.goal}`,
      `- elapsed: ${Math.round(context.elapsed)}s`,
      `- distance: ${context.distanceKm.toFixed(2)} km`,
      `- current pace: ${formatPace(context.currentPace)} /km (target ${formatPace(context.targetPace)} /km)`,
      `- heart rate: ${context.heartRate} bpm`,
      `- cadence: ${context.cadence} spm`,
      ``,
      `The runner just said: "${message}"`,
      `Reply as the coach, spoken aloud, one or two short sentences.`,
    ].join("\n");

    const completion = await client.messages.create({
      model: process.env.ANTHROPIC_COACH_MODEL ?? "claude-opus-4-8",
      max_tokens: 120,
      // Cache the persona + memory so repeat calls in a run are cheap and fast.
      system: [
        {
          type: "text",
          text: coachSystemPrompt(mem),
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userState }],
    });

    const reply = completion.content
      .filter((block) => block.type === "text")
      .map((block) => (block.type === "text" ? block.text : ""))
      .join(" ")
      .trim();

    return NextResponse.json({
      reply: reply || localCoachReply(message, context, mem),
      source: "claude",
    });
  } catch (err) {
    // Any API hiccup gracefully degrades to the local responder.
    console.error("[coach] Claude error, falling back to local:", err);
    return NextResponse.json({
      reply: localCoachReply(message, context, mem),
      source: "local-fallback",
    });
  }
}
