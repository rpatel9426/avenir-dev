import { getProfile } from "@/lib/session";
import { getWorkout } from "@/lib/workouts";
import { recommendedWorkoutId } from "@/lib/stats";
import { CoachConversation } from "@/components/app/coach-conversation";

export default function CoachPage() {
  return <CoachContent />;
}

/**
 * Coach. The conversation is the surface — insights live here rather than in a
 * data section, because an insight is the coach talking, not a chart.
 */
async function CoachContent() {
  const profile = await getProfile();
  const workout = getWorkout(recommendedWorkoutId());

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="t-label">Coach</div>
        <h1 className="t-voice">Ask me anything.</h1>
      </header>

      <CoachConversation
        opener={`Today is a ${workout.name.toLowerCase()}. ${workout.tagline} Tell me how you're feeling and I'll adjust it.`}
        goal={workout.id}
        targetPace={workout.targetPace}
        runnerName={profile.display_name ?? "Runner"}
      />
    </div>
  );
}
