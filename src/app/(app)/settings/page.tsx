import Link from "next/link";
import { getProfile } from "@/lib/session";
import { isPremium } from "@/lib/entitlements";
import { formatPaceIn, isUnits, paceLabel, type Units } from "@/lib/units";
import { GoalAndUnits } from "@/components/app/goal-and-units";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { SignOutButton } from "@/components/app/sign-out-button";
import { getBeliefs } from "@/lib/beliefs";

/**
 * Settings, written in the runner's language rather than the system's —
 * "how often it speaks / only when it matters" instead of a notification
 * frequency stepper. Subscription state is stated plainly at the top rather
 * than buried at the bottom.
 */
export default async function SettingsPage() {
  const [profile, beliefs] = await Promise.all([getProfile(), getBeliefs()]);
  const premium = isPremium(profile);
  const units: Units = isUnits(profile.units) ? profile.units : "km";

  return (
    <div className="flex min-h-[calc(100dvh-11rem)] flex-col gap-6">
      <div className="t-label">Settings</div>

      <header className="flex flex-col gap-0.5">
        <h1 className="text-[17px] font-bold">
          {profile.display_name ?? "Runner"}
        </h1>
        <p className="text-[11.5px] text-accent">
          {premium ? "Avenir Premium · active" : "Avenir Free"}
        </p>
      </header>

      <Group title="Coach">
        <Row label="Voice during runs" value="On, spoken aloud" href="/profile" />
        <Row
          label="How often it speaks"
          value="Only when it matters"
          href="/profile"
        />
        <Row label="Weekly insights" value="Sunday evenings" href="/insights" last />
      </Group>

      <Group title="Training">
        <Row
          label="Days I can run"
          value={beliefs.best_days?.value ?? "Tue Thu Sat Sun"}
          href="/about-you"
        />
        <Row
          label="Easy pace"
          value={
            profile.preferred_pace_sec_per_km
              ? `${formatPaceIn(profile.preferred_pace_sec_per_km, units)} ${paceLabel(units)}`
              : "Still learning"
          }
          href="/about-you"
          last
        />
      </Group>

      {/* The two the runner actually reaches for, editable in place. */}
      <GoalAndUnits weeklyGoalKm={profile.weekly_goal_km} units={units} />

      <Group title="You">
        <Row label="What I know about you" value="" href="/about-you" />
        <Row label="Your data" value="Export or delete" href="/privacy" />
        <Row
          label="Subscription"
          value={premium ? "Manage or cancel" : "See plans"}
          href="/pricing"
        />
        <Row
          label="Signed in on a new phone?"
          value="What travels with you"
          href="/welcome-back"
          last
        />
      </Group>

      <div className="flex items-center justify-between border-b border-t border-border py-[15px]">
        <span className="flex flex-col gap-[3px]">
          <span className="text-[13.5px] font-semibold leading-[1.2]">
            Appearance
          </span>
          <span className="t-meta">Light for the app, dark for the run</span>
        </span>
        <ThemeToggle />
      </div>

      <div className="mt-auto pb-2">
        <SignOutButton />
      </div>
    </div>
  );
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-1.5">
      <div className="t-label tracking-[0.12em]">{title}</div>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

function Row({
  label,
  value,
  href,
  last = false,
}: {
  label: string;
  value: string;
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
      <span className="text-[13.5px] font-medium">{label}</span>
      <span className="shrink-0 text-[13px] text-muted-foreground">{value}</span>
    </Link>
  );
}
