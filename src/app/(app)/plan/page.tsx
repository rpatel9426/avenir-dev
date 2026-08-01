import Link from "next/link";
import { getProfile, getRecentRuns } from "@/lib/session";
import { weeklyDistanceKm } from "@/lib/stats";
import { LOAD, WEEK } from "@/lib/plan";
import { getWeek } from "@/lib/plan-store";
import { getWorkout } from "@/lib/workouts";
import { WorkoutRow } from "@/components/ds/atoms";
import { formatPace } from "@/lib/utils";

export default function PlanPage() {
  return <PlanContent />;
}

async function PlanContent() {
  const [profile, runs] = await Promise.all([getProfile(), getRecentRuns()]);

  const weekKm = weeklyDistanceKm(runs);
  const goalKm = profile.weekly_goal_km;

  const days = (await getWeek()).map((day, i) => ({
    ...day,
    offset: i,
    detail:
      day.detail ??
      (day.workout
        ? `${day.workout.durationLabel.replace("~", "")} · ${formatPace(
            day.workout.targetPace
          )} /km`
        : undefined),
    // Rows open the session rather than starting it — depth on tap, and the
    // open-mark is the only thing that promises it.
    href: `/session/${i}`,
  }));

  const plannedKm = WEEK.reduce((sum, e) => {
    if (e.id === "rest" || e.id === "strength") return sum;
    return sum + getWorkout(e.id).distance / 1000;
  }, 0);

  return (
    <div className="flex min-h-[calc(100dvh-11rem)] flex-col">
      <header className="flex flex-col gap-1.5">
        <div className="t-label">
          This week · {plannedKm.toFixed(0)} km planned
        </div>
        <h1 className="t-voice">Build block</h1>
      </header>

      {/* A list, not a grid — a month grid asks the runner to do the reading. */}
      <div className="mt-[22px] flex flex-col">
        {days.map((day) => (
          <WorkoutRow
            key={day.date.toISOString()}
            variant="list"
            day={day.date.toLocaleDateString("en-GB", { weekday: "short" })}
            date={String(day.date.getDate()).padStart(2, "0")}
            name={day.name}
            detail={day.detail}
            tag={day.tag}
            load={LOAD[day.id] ?? 0.5}
            selected={day.isToday}
            href={day.href}
          />
        ))}
      </div>

      <Link
        href="/race"
        className="open-mark mt-auto flex items-center justify-between border-t border-border py-[15px]"
      >
        <span className="flex flex-col gap-[3px]">
          <span className="text-[15px] font-semibold leading-[1.2]">Race day</span>
          <span className="t-meta">Your race, in four acts</span>
        </span>
      </Link>

      <Link
        href="/coach"
        className="mb-[18px] rounded-[18px] bg-muted px-[18px] py-4 text-[13px] leading-[1.5] text-foreground/65 text-pretty"
      >
        {weekKm >= goalKm
          ? "You're past the week's distance already. Two weeks of building left, then you get an easy one."
          : `${(goalKm - weekKm).toFixed(0)} km left this week. Two weeks of building, then you get an easy one.`}{" "}
        <span className="text-accent">Talk to me about the plan →</span>
      </Link>
    </div>
  );
}
