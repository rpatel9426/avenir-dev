import { getProfile, getRecentRuns } from "@/lib/session";
import { getWorkout } from "@/lib/workouts";
import { recommendedWorkoutId } from "@/lib/stats";
import { CoachConversation } from "@/components/app/coach-conversation";
import { LogoMark } from "@/components/brand/logo";

export default function CoachPage() {
  return <CoachContent />;
}

/** Copy is reviewed like design, so the coach doesn't say "a easy run". */
function article(word: string): string {
  return /^[aeiou]/i.test(word) ? "an" : "a";
}

/**
 * Coach. Chat that *does things* — every consequential reply lands as an inline
 * plan diff. Insights live here rather than in a data section, because an
 * insight is the coach talking, not a chart.
 */
async function CoachContent() {
  const [profile, runs] = await Promise.all([getProfile(), getRecentRuns()]);
  const workout = getWorkout(recommendedWorkoutId());

  return (
    <div className="flex flex-col">
      {/* The subtitle is the trust device: it says what the coach remembers. */}
      <header className="mb-4 flex items-center gap-3">
        <span className="flex size-[34px] items-center justify-center rounded-full bg-accent text-accent-foreground">
          <LogoMark className="size-4" />
        </span>
        <div className="flex flex-col gap-0.5">
          <div className="text-[15px] font-bold leading-none">Coach</div>
          <div className="text-[11px] leading-none text-muted-foreground">
            {runs.length > 0
              ? `Remembers all ${runs.length} of your runs`
              : "Learning you from run one"}
          </div>
        </div>
      </header>

      <CoachConversation
        opener={`Today is ${article(workout.name)} ${workout.name.toLowerCase()}. ${
          workout.tagline
        } Tell me how you're feeling and I'll adjust it.`}
        goal={workout.id}
        targetPace={workout.targetPace}
        runnerName={profile.display_name ?? "Runner"}
      />
    </div>
  );
}
