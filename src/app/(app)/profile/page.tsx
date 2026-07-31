import Link from "next/link";
import { ArrowUpRight, Gauge, Sparkles, Target, TrendingUp } from "lucide-react";
import { getProfile, getRecentRuns } from "@/lib/session";
import { totals } from "@/lib/stats";
import { formatPace } from "@/lib/utils";
import { isPremium } from "@/lib/entitlements";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { SignOutButton } from "@/components/app/sign-out-button";

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export default async function ProfilePage() {
  const [profile, runs] = await Promise.all([getProfile(), getRecentRuns()]);
  const t = totals(runs);
  const premium = isPremium(profile);
  const initial = (profile.display_name ?? "R").charAt(0).toUpperCase();

  return (
    <div className="space-y-7">
      {/* Identity */}
      <header className="flex flex-col items-center pt-4 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-3xl font-semibold text-primary-foreground">
          {initial}
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          {profile.display_name ?? "Runner"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {LEVEL_LABEL[profile.experience_level]} runner
        </p>
      </header>

      {/* Lifetime stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={TrendingUp} label="Total km" value={t.distanceKm.toFixed(0)} />
        <StatCard icon={Gauge} label="Runs" value={`${t.runs}`} />
        <StatCard
          icon={Target}
          label="Goal pace"
          value={profile.preferred_pace_sec_per_km ? formatPace(profile.preferred_pace_sec_per_km) : "—"}
        />
      </div>

      {/* Plan */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Plan</h2>
        <Link
          href="/pricing"
          className="flex items-center gap-4 rounded-2xl border border-border bg-card/60 p-4 transition-colors hover:border-accent/40"
        >
          <span
            className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${premium ? "bg-accent-wash text-accent" : "bg-secondary text-muted-foreground"}`}
          >
            <Sparkles className="size-5" />
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold">Avenir {premium ? "Premium" : "Free"}</p>
              {premium && <Badge>Active</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">
              {premium
                ? "Full voice conversation unlocked."
                : "Upgrade to talk to your coach hands-free."}
            </p>
          </div>
          <ArrowUpRight className="size-5 text-muted-foreground" />
        </Link>
      </section>

      {/* Settings */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Preferences</h2>

        <Row label="Weekly goal" value={`${profile.weekly_goal_km} km`} />
        <Row
          label="Preferred pace"
          value={
            profile.preferred_pace_sec_per_km
              ? `${formatPace(profile.preferred_pace_sec_per_km)} /km`
              : "Not set"
          }
        />

        <div className="flex items-center justify-between rounded-2xl border border-border bg-card/60 p-4">
          <div>
            <p className="font-medium">Appearance</p>
            <p className="text-sm text-muted-foreground">Dark by default</p>
          </div>
          <ThemeToggle />
        </div>
      </section>

      <SignOutButton />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4 text-center">
      {/* Neutral: a stat is a value, and green means action. */}
      <Icon className="mx-auto mb-2 size-4 text-muted-foreground" />
      <p className="tabular-nums text-lg font-semibold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-card/60 p-4">
      <p className="font-medium">{label}</p>
      <p className="text-muted-foreground">{value}</p>
    </div>
  );
}
