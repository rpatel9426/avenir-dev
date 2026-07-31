import { getProfile, getRecentRuns } from "@/lib/session";
import { getWorkout } from "@/lib/workouts";
import { greeting, recommendedWorkoutId, weeklyDistanceKm } from "@/lib/stats";
import { StartRunAction, TodaySession } from "@/components/app/today-session";
import { OpenRow } from "@/components/ds/atoms";

export default function DashboardPage() {
  return <TodayContent />;
}

/**
 * Today. The screen answers one question — what do I do today? — and the
 * answer is a sentence before it is a number. No streak to break, no badge,
 * no red: motivation by competence, not loss aversion.
 */
async function TodayContent() {
  const [profile, runs] = await Promise.all([getProfile(), getRecentRuns()]);

  const workout = getWorkout(recommendedWorkoutId());
  const weekKm = weeklyDistanceKm(runs);
  const goalKm = profile.weekly_goal_km;
  const name = profile.display_name ?? "Runner";

  const today = new Date();
  const dateLabel = today
    .toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
    .replace(",", "");

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col gap-6">
      <header className="flex items-baseline justify-between">
        <div className="t-label">{dateLabel}</div>
        <div className="font-mono text-[10px] font-medium text-tint-strong">
          {weekKm.toFixed(0)} / {goalKm} km this week
        </div>
      </header>

      <h1 className="t-voice">
        {greeting()}, {name}.
      </h1>

      <p className="t-lead text-foreground/80">{homeLine(workout.name, weekKm, goalKm)}</p>

      <TodaySession workout={workout} />

      {runs.length > 0 && (
        <OpenRow label={`${runs.length} runs banked`} href="/profile" />
      )}

      <div className="mt-auto pt-4">
        <StartRunAction workout={workout} />
      </div>
    </div>
  );
}

/**
 * The coach's one sentence. One clause of reasoning, then the instruction —
 * second person, present tense, no exclamation marks and no praise of feeling.
 */
function homeLine(workoutName: string, weekKm: number, goalKm: number): string {
  const remaining = goalKm - weekKm;
  const session = workoutName.toLowerCase();

  if (weekKm === 0) {
    return `Nothing banked this week yet, so we start gently — ${session} today, and I'll read what it tells me.`;
  }
  if (remaining <= 0) {
    return `You're past the week's distance already, which means today is about quality, not more — keep the ${session} honest.`;
  }
  if (remaining <= 5) {
    return `You're ${remaining.toFixed(1)} km from the week's mark and moving well, so hold the ${session} conversational.`;
  }
  return `You've been consistent this week — keep today's ${session} conversational and leave something in the tank.`;
}
