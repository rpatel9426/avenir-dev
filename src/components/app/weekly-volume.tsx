import type { Run } from "@/lib/supabase/types";

/**
 * Weekly volume · the one chart in the product.
 *
 * Bars are neutral, not accent — a chart is a value, and green means action.
 * Only this week is highlighted, so the shape reads in half a second without
 * a legend. Numbers count up on first paint elsewhere; a chart doesn't move.
 */
export function WeeklyVolume({
  runs,
  thisWeekKm,
  weeks = 7,
}: {
  runs: Run[];
  thisWeekKm: number;
  weeks?: number;
}) {
  const now = new Date();
  const buckets = Array.from({ length: weeks }, (_, i) => {
    // i = 0 is the oldest week shown, weeks - 1 is the current one.
    const weeksAgo = weeks - 1 - i;
    const start = new Date(now);
    start.setDate(now.getDate() - ((now.getDay() + 6) % 7) - weeksAgo * 7);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);

    const km = runs
      .filter((r) => {
        const d = new Date(r.created_at);
        return d >= start && d < end;
      })
      .reduce((sum, r) => sum + (r.distance_m ?? 0) / 1000, 0);

    return { km, current: weeksAgo === 0 };
  });

  const peak = Math.max(...buckets.map((b) => b.km), thisWeekKm, 1);

  // Three weeks is when a trend starts meaning anything. Before that the chart
  // keeps its shape — so the screen doesn't reflow later — but claims nothing.
  const tooEarly = runs.length < 4;

  return (
    <section className="flex flex-col gap-[14px]">
      <div className="flex items-baseline justify-between">
        <div className="t-label tracking-[0.12em]">Weekly volume</div>
        <div className="text-[13px] font-semibold">
          {tooEarly ? "—" : `${thisWeekKm.toFixed(0)} km`}
        </div>
      </div>

      <div className={`flex h-24 items-end gap-[7px] ${tooEarly ? "opacity-50" : ""}`}>
        {buckets.map((b, i) => (
          <div
            key={i}
            className={`flex-1 rounded-[5px] ${
              b.current && !tooEarly ? "bg-foreground" : "bg-foreground/[0.08]"
            }`}
            style={{
              height: tooEarly
                ? `${b.km > 0 ? 34 : 8}%`
                : `${Math.max(6, (b.km / peak) * 100)}%`,
            }}
          />
        ))}
      </div>

      {tooEarly && (
        <p className="t-body text-muted-foreground">
          I need about three weeks before trends mean anything. Until then
          I&apos;d rather show you nothing than something made up.
        </p>
      )}

      <div className="flex justify-between font-mono text-[9.5px] font-medium text-tint-strong">
        <span>W1</span>
        <span>W{weeks}</span>
      </div>
    </section>
  );
}
