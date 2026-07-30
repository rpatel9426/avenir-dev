import { getRecentRuns } from "@/lib/session";
import { totals } from "@/lib/stats";
import { formatDuration } from "@/lib/utils";
import { RunListItem } from "@/components/app/run-list-item";

export default async function HistoryPage() {
  const runs = await getRecentRuns();
  const t = totals(runs);

  return (
    <div className="space-y-7">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Your runs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every session, banked and building.
        </p>
      </header>

      {/* Totals */}
      <div className="grid grid-cols-3 gap-3">
        <TotalCard label="Runs" value={`${t.runs}`} />
        <TotalCard label="Distance" value={`${t.distanceKm.toFixed(1)}`} unit="km" />
        <TotalCard label="Time" value={formatDuration(t.durationS)} />
      </div>

      {/* Log */}
      <section className="space-y-3">
        {runs.map((run) => (
          <RunListItem key={run.id} run={run} />
        ))}
      </section>
    </div>
  );
}

function TotalCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4 text-center">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 tabular-nums text-xl font-semibold tracking-tight">
        {value}
        {unit && <span className="text-sm text-muted-foreground"> {unit}</span>}
      </p>
    </div>
  );
}
