import Link from "next/link";
import { getProfile, getRecentRuns } from "@/lib/session";
import { getBeliefs } from "@/lib/beliefs";
import { getWeek } from "@/lib/plan-store";

/**
 * New device.
 *
 * "The runner never starts over" stops being a slogan here. This is a receipt
 * rather than a setup flow: it lists what survived, names the single thing
 * that didn't, and makes that skippable — so a new phone never costs a run.
 *
 * Everything below is counted from the account, not asserted. If a number is
 * wrong the runner will notice immediately, which is the point of a receipt.
 */
export default async function WelcomeBackPage() {
  const [profile, runs, beliefs, week] = await Promise.all([
    getProfile(),
    getRecentRuns(),
    getBeliefs(),
    getWeek(),
  ]);

  const sessions = week.filter((d) => d.workout).length;
  const known = Object.keys(beliefs).length;
  const since = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="flex min-h-[calc(100dvh-11rem)] flex-col gap-5">
      <div className="t-label">New phone · signed in</div>

      <h1 className="t-voice text-pretty">
        Nothing to set up. I remember all of it.
      </h1>

      <div className="flex flex-col">
        <Kept
          label="Runs"
          value={runs.length === 0 ? "None yet" : `${runs.length} · all of them`}
        />
        <Kept label="Plan" value={`This week · ${sessions} sessions`} />
        <Kept
          label="Conversations"
          value={since ? `Since ${since}` : "From the start"}
        />
        <Kept
          label="What I know about you"
          value={known > 0 ? "Intact" : "Still learning you"}
          last
        />
      </div>

      {/* The one thing that genuinely doesn't travel with an account. */}
      <div className="flex flex-col gap-2 rounded-[18px] bg-attention-wash p-[18px]">
        <div className="t-label tracking-[0.12em] text-attention-ink">
          Your watch
        </div>
        <p className="text-[13.5px] leading-[1.55] text-foreground/75 text-pretty">
          A watch is paired to a phone, not to an account, so it&apos;s the only
          thing that needs doing again. Two taps and we&apos;re back.
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-2.5 pb-2">
        <Link
          href="/settings"
          className="flex h-14 items-center justify-center rounded-full bg-primary text-[15px] font-bold text-primary-foreground"
        >
          Reconnect my watch
        </Link>
        <Link
          href="/dashboard"
          className="text-center text-[12.5px] font-medium text-muted-foreground"
        >
          Do it later — today&apos;s run works without it
        </Link>
      </div>
    </div>
  );
}

function Kept({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 border-t border-border py-[15px] ${
        last ? "border-b" : ""
      }`}
    >
      <span className="text-[13.5px] font-medium text-foreground/75">
        {label}
      </span>
      <span className="shrink-0 text-[13px] font-semibold">{value}</span>
    </div>
  );
}
