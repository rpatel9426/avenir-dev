import Link from "next/link";
import { Flame } from "lucide-react";
import { getProfile, getRecentRuns } from "@/lib/session";
import { getWorkout } from "@/lib/workouts";
import {
  currentStreak,
  greeting,
  recommendedWorkoutId,
  weeklyDistanceKm,
} from "@/lib/stats";
import { TodaySession } from "@/components/app/today-session";
import { ProgressRing } from "@/components/app/progress-ring";
import { RunListItem } from "@/components/app/run-list-item";

export default function DashboardPage() {
  return <DashboardContent />;
}

async function DashboardContent() {
  const [profile, runs] = await Promise.all([getProfile(), getRecentRuns()]);

  const workout = getWorkout(recommendedWorkoutId());
  const weekKm = weeklyDistanceKm(runs);
  const goalKm = profile.weekly_goal_km;
  const streak = currentStreak(runs);
  const recent = runs.slice(0, 3);

  return (
    <div className="space-y-7">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{greeting()},</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {profile.display_name ?? "Runner"}
          </h1>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3 py-1.5">
          <Flame className="size-4 text-primary" />
          <span className="text-sm font-semibold tabular-nums">{streak}</span>
          <span className="text-xs text-muted-foreground">day streak</span>
        </div>
      </header>

      {/* Today's session */}
      <TodaySession workout={workout} />

      {/* Weekly goal */}
      <section>
        <div className="flex items-center gap-5 rounded-3xl border border-border bg-card/60 p-5">
          <ProgressRing value={goalKm ? weekKm / goalKm : 0} size={116} stroke={9}>
            <span className="tabular-nums text-2xl font-semibold tracking-tight">
              {weekKm.toFixed(0)}
            </span>
            <span className="text-[0.65rem] text-muted-foreground">of {goalKm} km</span>
          </ProgressRing>
          <div className="flex-1">
            <h3 className="font-semibold">Weekly goal</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {weekKm >= goalKm
                ? "Goal smashed. Outstanding week of running."
                : `${(goalKm - weekKm).toFixed(1)} km to go. You're on track — keep stacking runs.`}
            </p>
          </div>
        </div>
      </section>

      {/* Recent runs */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Recent runs</h3>
          <Link href="/history" className="text-sm text-primary hover:underline">
            See all
          </Link>
        </div>
        <div className="space-y-3">
          {recent.map((run) => (
            <RunListItem key={run.id} run={run} />
          ))}
        </div>
      </section>
    </div>
  );
}
