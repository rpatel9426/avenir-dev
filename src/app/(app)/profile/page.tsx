import Link from "next/link";
import { getProfile, getRecentRuns } from "@/lib/session";
import { totals, weeklyDistanceKm } from "@/lib/stats";
import { formatPace } from "@/lib/utils";
import { isPremium } from "@/lib/entitlements";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { SignOutButton } from "@/components/app/sign-out-button";
import { WeeklyVolume } from "@/components/app/weekly-volume";

/**
 * You. Opens with a sentence, not a chart — one chart maximum, and the only
 * highlighted bar is this week. Predicted finish is the number the runner
 * actually cares about, so it sits at the bottom as a reward for scrolling.
 */
export default async function ProfilePage() {
  const [profile, runs] = await Promise.all([getProfile(), getRecentRuns()]);
  const t = totals(runs);
  const premium = isPremium(profile);
  const weekKm = weeklyDistanceKm(runs);

  const longest = runs.reduce(
    (max, r) => Math.max(max, r.distance_m ?? 0),
    0
  );
  const easyPace = profile.preferred_pace_sec_per_km;

  return (
    <div className="flex min-h-[calc(100dvh-11rem)] flex-col gap-[26px]">
      <header className="flex flex-col gap-3">
        <div className="t-label">Since you started</div>
        {/* Never fake data, never a shrug — always one way out. */}
        <h1 className="t-voice text-pretty">
          {t.runs === 0
            ? "Nothing to show yet — you haven't run with me."
            : t.runs < 4
              ? `Nothing to show yet — you've run ${t.runs === 1 ? "once" : `${t.runs} times`}.`
              : `You've run ${t.runs} times and banked ${t.distanceKm.toFixed(0)} kilometres. That's the whole story.`}
        </h1>
      </header>

      <WeeklyVolume runs={runs} thisWeekKm={weekKm} />

      {/* Rows, not tiles: each is a fact with the number the runner wants. */}
      <div className="flex flex-col">
        <StatRow
          label="Easy pace"
          note={easyPace ? "The pace I'll hold you to" : "I'm still learning it"}
          value={easyPace ? formatPace(easyPace) : "—"}
        />
        <StatRow
          label="Longest run"
          note={longest > 0 ? "On the record" : "Still ahead of you"}
          value={longest > 0 ? (longest / 1000).toFixed(1) : "—"}
          unit={longest > 0 ? " km" : undefined}
        />
        <StatRow
          label="Time on your feet"
          note="Updated after every run"
          value={`${Math.round(t.durationS / 3600)}`}
          unit=" h"
          last={t.runs >= 4}
        />
        {t.runs < 4 && (
          <StatRow
            label="Next milestone"
            note="When trends start to mean something"
            value={`${4 - t.runs} more`}
            unit=" runs"
            last
          />
        )}
      </div>

      {/* R2 · the model the coach holds of you, readable and correctable. */}
      <Link
        href="/about-you"
        className="open-mark flex items-center justify-between rounded-[18px] bg-muted px-[18px] py-4"
      >
        <span className="flex flex-col gap-0.5">
          <span className="text-[15px] font-semibold">
            What I think I know about you
          </span>
          <span className="t-meta">
            Everything that shapes what I ask of you. Change any of it.
          </span>
        </span>
      </Link>

      <Link
        href="/pricing"
        className="open-mark flex items-center justify-between rounded-[18px] bg-muted px-[18px] py-4"
      >
        <span className="flex flex-col gap-0.5">
          <span className="text-[15px] font-semibold">
            Avenir {premium ? "Premium" : "Free"}
          </span>
          <span className="t-meta">
            {premium
              ? "Full voice conversation unlocked."
              : "Everything you need to run coached."}
          </span>
        </span>
      </Link>

      <div className="flex flex-col">
        <StatRow label="Weekly goal" note="What I plan around" value={`${profile.weekly_goal_km}`} unit=" km" />
        <div className="flex items-center justify-between border-b border-border py-[17px]">
          <div className="flex flex-col gap-[3px]">
            <div className="text-[15px] font-semibold leading-[1.2]">Appearance</div>
            <div className="t-meta">Light for the app, dark for the run</div>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex flex-col">
        <NavRow label="Insights" note="Three things, once a week" href="/insights" />
        <NavRow label="Recovery" note="What today should cost you" href="/recovery" />
        <NavRow label="Settings" note="Coach, training, your data" href="/settings" last />
      </div>

      <div className="mt-auto pb-2">
        <SignOutButton />
      </div>
    </div>
  );
}

function NavRow({
  label,
  note,
  href,
  last = false,
}: {
  label: string;
  note: string;
  href: string;
  last?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`open-mark flex items-center justify-between gap-4 border-t border-border py-[15px] ${
        last ? "border-b" : ""
      }`}
    >
      <span className="flex flex-col gap-[3px]">
        <span className="text-[15px] font-semibold leading-[1.2]">{label}</span>
        <span className="t-meta">{note}</span>
      </span>
    </Link>
  );
}

function StatRow({
  label,
  note,
  value,
  unit,
  last = false,
}: {
  label: string;
  note: string;
  value: string;
  unit?: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between border-t border-border py-[17px] ${
        last ? "border-b" : ""
      }`}
    >
      <div className="flex flex-col gap-[3px]">
        <div className="text-[15px] font-semibold leading-[1.2]">{label}</div>
        <div className="t-meta">{note}</div>
      </div>
      <div className="text-[17px] font-semibold">
        {value}
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}
