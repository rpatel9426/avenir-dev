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

  /*
   * Light for the app, dark for the run. The run opts itself into night
   * regardless of the app's theme: it is read at arm's length, outdoors,
   * often before sunrise, and the night palette is the one the accent
   * measures 13:1 against.
   */
  return (
    <div className="dark relative -mt-6 min-h-dvh pt-6 text-foreground">
      {/* Full-bleed night, behind the centred column rather than inside it. */}
      <div className="fixed inset-0 -z-10 bg-background" />
      <RunExperience
        initialWorkoutId={initialWorkoutId}
        premium={isPremium(profile)}
      />
    </div>
  );
}
