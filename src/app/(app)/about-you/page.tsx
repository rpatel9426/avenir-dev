import Link from "next/link";
import { getProfile, getRecentRuns } from "@/lib/session";
import { formatPace } from "@/lib/utils";
import { BeliefRow } from "@/components/app/belief-row";

/**
 * What I think I know about you.
 *
 * Norman's system image as a screen: the runner can read the model the coach
 * holds of them and edit it. One wrong, confident assertion is what converts a
 * trusting beginner into a churned user, so every claim here is correctable.
 *
 * It doubles as the privacy answer the product never gave.
 */
export default async function AboutYouPage() {
  const [profile, runs] = await Promise.all([getProfile(), getRecentRuns()]);

  const easyPace = profile.preferred_pace_sec_per_km;

  // The coach admits it's still guessing early on. Certainty with no confidence
  // signal is how an AI coach becomes confidently wrong to a beginner.
  const confidence =
    runs.length >= 12 ? "High" : runs.length >= 4 ? "Building" : "Guessing";

  return (
    <div className="flex min-h-[calc(100dvh-11rem)] flex-col gap-4">
      <Link href="/profile" className="text-[15px] text-muted-foreground">
        ‹ You
      </Link>

      <h1 className="t-voice text-pretty">What I think I know about you</h1>

      <p className="text-[13px] leading-[1.55] text-tint-strong text-pretty">
        Everything here shapes what I ask of you. Change any of it — you know
        your body better than my data does.
      </p>

      <div className="flex flex-col">
        <BeliefRow
          id="easy_pace"
          label="Easy pace"
          note={runs.length > 0 ? `From ${runs.length} runs` : "Not learned yet"}
          value={easyPace ? formatPace(easyPace) : "Still learning"}
          options={
            easyPace
              ? [
                  { value: formatPace(easyPace - 20), label: "Faster than that" },
                  { value: formatPace(easyPace), label: "That's right" },
                  { value: formatPace(easyPace + 20), label: "Slower than that" },
                ]
              : []
          }
        />
        <BeliefRow
          id="sleep_sensitivity"
          label="Sleep sensitivity"
          note="How much a short night changes my advice"
          value="Medium"
          options={[
            { value: "Low", label: "I run fine on little sleep" },
            { value: "Medium", label: "It affects me somewhat" },
            { value: "High", label: "It wrecks me" },
          ]}
        />
        <BeliefRow
          id="watching"
          label="Niggles I'm watching"
          note="From what you've told me in triage"
          value="Nothing right now"
          options={[
            { value: "Nothing right now", label: "All clear" },
            { value: "Calf, right", label: "Right calf" },
            { value: "Knee, left", label: "Left knee" },
          ]}
        />
        <BeliefRow
          id="best_days"
          label="Best days to run"
          note="I plan your week around these"
          value="Tue Thu Sat Sun"
          options={[
            { value: "Tue Thu Sat Sun", label: "Tue, Thu, Sat, Sun" },
            { value: "Mon Wed Fri Sun", label: "Mon, Wed, Fri, Sun" },
            { value: "Weekends only", label: "Weekends only" },
          ]}
        />
        <BeliefRow
          id="motivation"
          label="Motivation"
          note="How I talk to you when it's hard"
          value="Responds to progress, not pressure"
          options={[
            { value: "Responds to progress, not pressure", label: "Progress, not pressure" },
            { value: "Wants it straight", label: "Straight talk" },
            { value: "Wants the numbers", label: "Give me the numbers" },
          ]}
        />
        <BeliefRow
          id="confidence"
          label="Confidence in my read"
          note="Improves with every run"
          value={confidence}
          readOnly
          last
        />
      </div>

      <div className="mt-auto flex flex-col gap-2.5 pb-2">
        <Link
          href="/privacy"
          className="flex h-13 items-center justify-center rounded-full bg-secondary text-[13.5px] font-semibold text-foreground/70"
        >
          What data I use, and what I don&apos;t
        </Link>
        <p className="text-center text-[11.5px] leading-[1.5] text-muted-foreground">
          Export or delete everything, any time.
        </p>
      </div>
    </div>
  );
}
