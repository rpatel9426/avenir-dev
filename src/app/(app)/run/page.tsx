import { RunExperience } from "@/components/run/run-experience";
import { recommendedWorkoutId } from "@/lib/stats";
import { getProfile } from "@/lib/session";
import { isPremium } from "@/lib/entitlements";

export default async function RunPage({
  searchParams,
}: {
  searchParams: Promise<{ w?: string }>;
}) {
  const { w } = await searchParams;
  const [profile] = await Promise.all([getProfile()]);
  const initialWorkoutId = w ?? recommendedWorkoutId();

  return (
    <RunExperience
      initialWorkoutId={initialWorkoutId}
      premium={isPremium(profile)}
    />
  );
}
