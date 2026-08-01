"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setUnits, setWeeklyGoal } from "@/app/(app)/settings/actions";
import { distanceLabel, fromKm, type Units } from "@/lib/units";
import { cn } from "@/lib/utils";

/**
 * The two preferences a runner actually reaches for, made editable.
 *
 * The goal is shown in whichever unit they're using and converted on the way
 * in, so switching between kilometres and miles never quietly changes the
 * number they set.
 */
export function GoalAndUnits({
  weeklyGoalKm,
  units,
}: {
  weeklyGoalKm: number;
  units: Units;
}) {
  const router = useRouter();
  const [unit, setUnit] = useState<Units>(units);
  const [goal, setGoal] = useState(() =>
    String(Math.round(fromKm(weeklyGoalKm, units)))
  );
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const changeUnits = async (next: Units) => {
    if (next === unit) return;
    setBusy(true);
    // Show the same distance expressed the other way, rather than the same
    // number relabelled — 30 km is not 30 miles.
    setGoal(String(Math.round(fromKm(weeklyGoalKm, next))));
    setUnit(next);
    const res = await setUnits(next);
    setNote(res.ok ? null : (res.message ?? "Couldn't save that."));
    setBusy(false);
    if (res.ok) router.refresh();
  };

  const saveGoal = async () => {
    const value = Number(goal);
    setBusy(true);
    const res = await setWeeklyGoal(value, unit);
    setNote(res.ok ? "Saved. I'll plan around that." : (res.message ?? "Couldn't save that."));
    setBusy(false);
    if (res.ok) router.refresh();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 border-t border-border py-[15px]">
        <span className="flex flex-col gap-[3px]">
          <span className="text-[13.5px] font-semibold leading-[1.2]">
            Weekly goal
          </span>
          <span className="t-meta">What I plan your week around</span>
        </span>
        <span className="flex items-center gap-2">
          <input
            inputMode="numeric"
            value={goal}
            onChange={(e) => setGoal(e.target.value.replace(/[^\d]/g, ""))}
            onBlur={saveGoal}
            aria-label={`Weekly goal in ${distanceLabel(unit)}`}
            className="h-11 w-16 rounded-full border border-transparent bg-muted text-center text-[15px] font-semibold focus-visible:border-[1.5px] focus-visible:border-accent focus-visible:bg-card focus-visible:outline-none"
          />
          <span className="text-[13px] text-muted-foreground">
            {distanceLabel(unit)}
          </span>
        </span>
      </div>

      <div className="flex items-center justify-between gap-4 border-b border-t border-border py-[15px]">
        <span className="flex flex-col gap-[3px]">
          <span className="text-[13.5px] font-semibold leading-[1.2]">Units</span>
          <span className="t-meta">Everything is shown in these</span>
        </span>
        <span className="flex gap-1.5">
          {(["km", "mi"] as const).map((u) => (
            <button
              key={u}
              type="button"
              disabled={busy}
              onClick={() => changeUnits(u)}
              aria-pressed={unit === u}
              className={cn(
                "h-11 rounded-full px-4 text-[13px] transition-colors",
                unit === u
                  ? "bg-accent-wash font-bold text-accent"
                  : "bg-muted font-medium text-foreground/70"
              )}
            >
              {u === "km" ? "Kilometres" : "Miles"}
            </button>
          ))}
        </span>
      </div>

      {note && <p className="t-meta">{note}</p>}
    </div>
  );
}
