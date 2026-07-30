import { goalMeta } from "@/lib/goal-meta";
import { formatDistance, formatDuration, formatPace } from "@/lib/utils";
import type { Run } from "@/lib/supabase/types";

function relativeDay(iso: string): string {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function RunListItem({ run }: { run: Run }) {
  const meta = goalMeta(run.goal);
  const Icon = meta.icon;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card/60 p-4">
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.color}`}
      >
        <Icon className="size-5" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate font-semibold">{meta.label}</p>
          <span className="shrink-0 text-xs text-muted-foreground">
            {relativeDay(run.started_at)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground tabular-nums">
          <span className="font-medium text-foreground">
            {formatDistance(run.distance_m)} km
          </span>
          <span>{formatDuration(run.duration_s)}</span>
          {run.avg_pace_sec_per_km != null && (
            <span>{formatPace(run.avg_pace_sec_per_km)} /km</span>
          )}
        </div>
      </div>
    </div>
  );
}
