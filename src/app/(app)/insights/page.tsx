import { getRecentRuns } from "@/lib/session";
import { weeklyDistanceKm } from "@/lib/stats";
import { formatPace } from "@/lib/utils";
import type { Run } from "@/lib/supabase/types";

/**
 * Insights.
 *
 * Deliberately rationed — three cards, once a week, written as observations
 * rather than metrics. This is the screen that proves the coach is paying
 * attention, so it must never feel auto-generated: every card below is only
 * shown when there is genuinely something to say, and the screen says so
 * plainly when there isn't.
 */
export default async function InsightsPage() {
  const runs = await getRecentRuns();
  const cards = observations(runs);

  return (
    <div className="flex min-h-[calc(100dvh-11rem)] flex-col gap-6">
      <div className="t-label">Insights · weekly</div>

      <h1 className="t-voice text-pretty">
        {cards.length === 0
          ? "Nothing worth telling you yet."
          : cards.length === 1
            ? "One thing I noticed this week"
            : `${cards.length === 2 ? "Two" : "Three"} things I noticed this week`}
      </h1>

      {cards.length === 0 ? (
        <p className="t-lead text-foreground/80">
          I&apos;d rather say nothing than invent a pattern. A few more runs and
          there will be something real here.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {cards.map((c) => (
            <div key={c.kind} className="flex flex-col gap-2 rounded-[18px] bg-card p-[18px]">
              <div
                className={`t-label tracking-[0.12em] ${
                  c.kind === "Watch" ? "text-attention-ink" : "text-muted-foreground"
                }`}
              >
                {c.kind}
              </div>
              <p className="text-sm leading-[1.5] text-foreground/80 text-pretty">
                {c.body}
              </p>
            </div>
          ))}
        </div>
      )}

      <p className="mt-auto pb-2 t-meta">
        Sunday evenings. Never more than three.
      </p>
    </div>
  );
}

interface Observation {
  kind: "Pattern" | "Strength" | "Watch";
  body: string;
}

/** Only what the data actually supports. Three at most, and often fewer. */
function observations(runs: Run[]): Observation[] {
  const out: Observation[] = [];
  if (runs.length < 3) return out;

  const paces = runs
    .map((r) => r.avg_pace_sec_per_km)
    .filter((p): p is number => typeof p === "number");

  if (paces.length >= 4) {
    const recent = paces.slice(0, 2);
    const older = paces.slice(-2);
    const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    const delta = Math.round(avg(older) - avg(recent));

    if (delta >= 8) {
      out.push({
        kind: "Strength",
        body: `You're running ${delta} seconds a kilometre quicker than when you started, at the same effort. That's fitness, not a good day.`,
      });
    } else if (delta <= -8) {
      out.push({
        kind: "Pattern",
        body: `Your recent runs are about ${Math.abs(delta)} seconds a kilometre slower than your earlier ones. Often that's fatigue carrying forward rather than lost fitness.`,
      });
    }
  }

  const longest = Math.max(...runs.map((r) => r.distance_m ?? 0)) / 1000;
  if (longest >= 10) {
    out.push({
      kind: "Pattern",
      body: `Your longest run so far is ${longest.toFixed(1)} km. You carry that one further into the week than you think — the two days after it are where the plan bends.`,
    });
  }

  const week = weeklyDistanceKm(runs);
  if (week > 0 && paces.length > 0) {
    out.push({
      kind: "Watch",
      body: `You've banked ${week.toFixed(0)} km this week at around ${formatPace(
        Math.round(paces.reduce((a, b) => a + b, 0) / paces.length)
      )} a kilometre. Adding distance and pace in the same week is the usual way people get hurt — we'll move one at a time.`,
    });
  }

  return out.slice(0, 3);
}
