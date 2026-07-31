import { getProfile, getRecentRuns } from "@/lib/session";
import { WORKOUTS, getWorkout } from "@/lib/workouts";
import { weeklyDistanceKm } from "@/lib/stats";
import { WorkoutRow, Metric, OpenRow } from "@/components/ds/atoms";
import { formatPace } from "@/lib/utils";

export default function PlanPage() {
  return <PlanContent />;
}

/** Relative effort per session — the load bar is a width, never a number. */
const LOAD: Record<string, number> = {
  recovery: 0.2,
  easy: 0.4,
  long: 0.95,
  tempo: 0.75,
  intervals: 0.85,
  race: 1,
};

/** The week the coach has written, Monday first. */
const WEEK_SHAPE = [
  "easy",
  "intervals",
  "recovery",
  "tempo",
  "easy",
  "long",
  "recovery",
] as const;

async function PlanContent() {
  const [profile, runs] = await Promise.all([getProfile(), getRecentRuns()]);

  const weekKm = weeklyDistanceKm(runs);
  const goalKm = profile.weekly_goal_km;
  // Monday of the current week, so the row dates line up with real calendar days.
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));

  const days = WEEK_SHAPE.map((id, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const workout = getWorkout(id);
    return {
      id,
      workout,
      date,
      isToday: date.toDateString() === now.toDateString(),
      isPast: date < now && date.toDateString() !== now.toDateString(),
    };
  });

  const plannedKm = WEEK_SHAPE.reduce(
    (sum, id) => sum + getWorkout(id).distance / 1000,
    0
  );

  return (
    <div className="flex flex-col gap-7">
      <header className="flex flex-col gap-2">
        <div className="t-label">This week</div>
        <h1 className="t-voice">The shape of your week.</h1>
      </header>

      <div className="flex gap-[26px] rounded-[22px] bg-card p-[22px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border dark:border-border dark:shadow-none">
        <Metric value={weekKm.toFixed(0)} unit={` / ${goalKm} km`} label="Banked" />
        <Metric value={plannedKm.toFixed(0)} unit=" km" label="Planned" />
      </div>

      <section className="flex flex-col gap-2">
        {days.map(({ id, workout, date, isToday, isPast }) => (
          <WorkoutRow
            key={date.toISOString()}
            day={date.toLocaleDateString("en-GB", { weekday: "short" })}
            date={date.getDate()}
            name={workout.name}
            detail={`${workout.durationLabel.replace("~", "")} · ${formatPace(
              workout.targetPace
            )} /km`}
            load={LOAD[id] ?? 0.5}
            selected={isToday}
            href={isPast ? undefined : `/run?w=${id}`}
            className={isPast ? "opacity-55" : undefined}
          />
        ))}
      </section>

      <div className="flex flex-col gap-4 rounded-[22px] bg-card p-[22px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border dark:border-border dark:shadow-none">
        <div className="t-label">Your goal</div>
        <p className="t-body">
          {goalKm} km a week, at{" "}
          {profile.preferred_pace_sec_per_km
            ? `${formatPace(profile.preferred_pace_sec_per_km)} /km`
            : "a pace I'm still learning"}
          . The plan rebuilds itself around what you actually run — nothing here
          is a streak you can break.
        </p>
        <OpenRow label="Talk to me about the plan" href="/coach" />
      </div>

      <p className="t-meta">
        {WORKOUTS.length} session types in rotation. Today is marked; past days
        stay on the record rather than disappearing.
      </p>
    </div>
  );
}
