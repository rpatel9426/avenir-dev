import Link from "next/link";
import { getProfile } from "@/lib/session";
import { getWorkout } from "@/lib/workouts";
import { formatPace } from "@/lib/utils";

/**
 * Race preparation.
 *
 * A pacing plan written as a narrative, not a splits table — it has to be
 * rememberable while exhausted, which a grid of numbers is not. The primary
 * action turns the plan into a training session, so race day is never the
 * first rehearsal.
 */
export default async function RacePage() {
  const profile = await getProfile();
  const race = getWorkout("race");

  // Everything hangs off one target pace, so the acts stay internally honest.
  const target = profile.preferred_pace_sec_per_km ?? race.targetPace;
  const held = formatPace(target);
  const conservative = formatPace(target + 10);
  const marathonSeconds = target * 42.2;
  const finish = `${Math.floor(marathonSeconds / 3600)}:${String(
    Math.round((marathonSeconds % 3600) / 60)
  ).padStart(2, "0")}`;

  const ACTS = [
    {
      range: "0–10",
      title: `Hold back · ${conservative}`,
      body: "It will feel too slow. That's the point.",
    },
    {
      range: "10–25",
      title: `Settle · ${held}`,
      body: "Gel at 12, 18 and 24. I'll remind you.",
    },
    {
      range: "25–35",
      title: `The honest part · ${held}`,
      body: "This is where I'll do most of the talking.",
    },
    {
      range: "35–42",
      title: "Whatever's left",
      body: "No target. You'll know what you have.",
    },
  ];

  return (
    <div className="flex min-h-[calc(100dvh-11rem)] flex-col gap-5">
      <div className="t-label">Race day</div>
      <h1 className="t-voice">Your race, in four acts</h1>

      <div className="flex flex-col gap-2.5">
        {ACTS.map((act) => (
          <div
            key={act.range}
            className="flex gap-[14px] rounded-[18px] bg-card p-[18px]"
          >
            <div className="w-12 shrink-0">
              <div className="t-label">KM</div>
              <div className="mt-1 text-[15px] font-bold tabular-nums">
                {act.range}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-sm font-bold leading-[1.2]">{act.title}</div>
              <div className="t-meta">{act.body}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-[26px] border-y border-border py-4">
        <Fact value="14°" label="Typical" />
        <Fact value={finish} label="Target" />
        <Fact value="3" label="Gels" />
      </div>

      <div className="mt-auto flex flex-col gap-2.5 pb-2">
        {/* Race day is never the first rehearsal. */}
        <Link
          href="/run?w=race"
          className="flex h-14 items-center justify-center rounded-full bg-primary text-[15px] font-bold text-primary-foreground"
        >
          Rehearse this on Sunday
        </Link>
        <Link
          href="/coach"
          className="text-center text-[12.5px] font-medium text-muted-foreground"
        >
          Talk to me about race day
        </Link>
      </div>
    </div>
  );
}

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-[5px]">
      <div className="text-[22px] font-semibold tabular-nums">{value}</div>
      <div className="t-label tracking-[0.1em]">{label}</div>
    </div>
  );
}
