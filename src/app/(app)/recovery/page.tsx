import Link from "next/link";
import { getRecentRuns } from "@/lib/session";
import { daysSinceLastRun } from "@/lib/plan";

/**
 * Recovery.
 *
 * The score exists, but it never stands alone — it is always followed by the
 * decision it caused. A low score is information, not a failure state, so it
 * borrows the attention blue-grey and there is no red anywhere in the system.
 *
 * The coach describes rather than diagnoses: "your sleep is down and your HRV
 * is below baseline, so I'd keep today easy" — not "your nervous system isn't
 * fine". Same reassurance, defensible.
 */
export default async function RecoveryPage() {
  const runs = await getRecentRuns();
  const gap = daysSinceLastRun(runs);

  // Readiness is derived from what the app can actually observe today: how
  // recently the runner ran, and how hard. Wearable inputs slot in here.
  const lastLoad = runs[0] ? Math.min(1, (runs[0].distance_m ?? 0) / 15000) : 0;
  const rest = gap === null ? 1 : Math.min(1, gap / 2);
  const readiness = Math.round(55 + rest * 30 - lastLoad * 15);
  const low = readiness < 65;

  return (
    <div className="flex min-h-[calc(100dvh-11rem)] flex-col gap-6">
      <div className="t-label">Recovery · this morning</div>

      <div className="flex items-end gap-3">
        <span
          className={`t-metric ${low ? "text-attention-ink" : "text-foreground"}`}
        >
          {readiness}
        </span>
        <span className="t-label pb-3">
          readiness
          <br />
          out of 100
        </span>
      </div>

      {/* The score never stands alone — this is the decision it caused. */}
      <p className="t-lead text-foreground/85">
        {gap === null
          ? "Nothing to read yet. Run once and I'll start learning what your normal looks like."
          : low
            ? `You last ran ${gap === 0 ? "today" : `${gap} ${gap === 1 ? "day" : "days"} ago`}, and it was a solid one. Today stays conversational — that's the decision, not a warning.`
            : `You're rested and the last session has been absorbed. Today can be whatever the plan says.`}
      </p>

      <div className="flex flex-col">
        <Signal
          label="Days since your last run"
          value={gap === null ? "—" : String(gap)}
          note={gap !== null && gap > 3 ? "Longer than usual for you" : "In your normal range"}
        />
        <Signal
          label="Last session load"
          value={runs[0] ? `${((runs[0].distance_m ?? 0) / 1000).toFixed(1)} km` : "—"}
          note="What I'm assuming you're still absorbing"
        />
        <Signal
          label="Sleep and HRV"
          value="Not connected"
          note="Connect a watch and I'll use these instead of guessing"
          last
        />
      </div>

      <div className="mt-auto pb-2">
        <Link
          href="/coach"
          className="flex h-14 items-center justify-center rounded-full bg-secondary text-[14.5px] font-semibold"
        >
          Ask the coach about this
        </Link>
      </div>
    </div>
  );
}

function Signal({
  label,
  value,
  note,
  last = false,
}: {
  label: string;
  value: string;
  note: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 border-t border-border py-[15px] ${
        last ? "border-b" : ""
      }`}
    >
      <span className="flex flex-col gap-[3px]">
        <span className="text-[13.5px] font-semibold leading-[1.2]">{label}</span>
        <span className="t-meta">{note}</span>
      </span>
      <span className="shrink-0 text-[15px] font-semibold">{value}</span>
    </div>
  );
}
