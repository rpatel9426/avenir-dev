import Link from "next/link";
import { getProfile, getRecentRuns } from "@/lib/session";
import { greeting, weeklyDistanceKm } from "@/lib/stats";
import { RETURN_THRESHOLD_DAYS, daysSinceLastRun } from "@/lib/plan";
import { getToday, getWeek } from "@/lib/plan-store";
import { StartRunAction, TodaySession } from "@/components/app/today-session";
import { OpenRow } from "@/components/ds/atoms";
import type { Run } from "@/lib/supabase/types";
import type { PlannedDay } from "@/lib/plan";

export default function DashboardPage() {
  return <TodayContent />;
}

/**
 * Today. One question — what do I do today? — and the answer is a sentence
 * before it is a number. Three states share one layout, which is the proof
 * that the layout survives having nothing to do:
 *
 *   · a session
 *   · a rest day (the same screen with the button removed)
 *   · the return, after a gap long enough that the plan had to be rebuilt
 */
async function TodayContent() {
  const [profile, runs] = await Promise.all([getProfile(), getRecentRuns()]);

  const now = new Date();
  const day = await getToday(now);
  const weekKm = weeklyDistanceKm(runs);
  const goalKm = profile.weekly_goal_km;
  const name = profile.display_name ?? "Runner";
  const gap = daysSinceLastRun(runs, now);

  const dateLabel = now
    .toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
    .replace(",", "");

  const header = (
    <header className="flex items-baseline justify-between">
      <div className="t-label">{dateLabel}</div>
      <div className="font-mono text-[10px] font-medium text-tint-strong">
        {weekKm.toFixed(0)} / {goalKm} km this week
      </div>
    </header>
  );

  // A paused plan outranks everything. Triage decided the coach shouldn't be
  // prescribing, so no session — and no start button — appears here.
  const pausedUntil = profile.plan_paused_until
    ? new Date(profile.plan_paused_until)
    : null;
  if (pausedUntil && pausedUntil > now) {
    const daysLeft = Math.max(
      1,
      Math.ceil((pausedUntil.getTime() - now.getTime()) / 86_400_000)
    );
    return <Paused header={header} daysLeft={daysLeft} />;
  }

  if (gap !== null && gap >= RETURN_THRESHOLD_DAYS) {
    return <TheReturn header={header} gapDays={gap} runs={runs} />;
  }

  if (!day.workout) {
    return <RestDay header={header} name={name} day={day} />;
  }

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col gap-6">
      {header}

      <h1 className="t-voice">
        {greeting()}, {name}.
      </h1>

      <p className="t-lead text-foreground/80">
        {homeLine(day.workout.name, weekKm, goalKm)}
      </p>

      <TodaySession workout={day.workout} />

      {runs.length > 0 && (
        <OpenRow label={`${runs.length} runs banked`} href="/profile" />
      )}

      <div className="mt-auto pt-4">
        <StartRunAction workout={day.workout} />
      </div>
    </div>
  );
}

/**
 * Paused by triage. The hard stop, carried onto Today: nothing is scheduled,
 * nothing counts against the runner, and there is no way to start a run from
 * this screen — that's the requirement, not a styling choice.
 */
function Paused({
  header,
  daysLeft: days,
}: {
  header: React.ReactNode;
  daysLeft: number;
}) {
  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col gap-5">
      {header}

      <h1 className="t-voice">We&apos;re holding here.</h1>

      <p className="t-lead text-foreground/80">
        Your plan is paused while that settles. Nothing is scheduled and
        nothing is counting against you.
      </p>

      <div className="flex flex-col gap-[9px] rounded-[18px] bg-attention-wash p-[18px]">
        <div className="t-label tracking-[0.12em] text-attention-ink">
          Paused
        </div>
        <p className="text-[13.5px] leading-[1.55] text-foreground/70">
          {days} {days === 1 ? "day" : "days"} left. I&apos;ll ask how it feels
          before we start again — there&apos;s room for this without losing the
          goal.
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-3 pb-4">
        <Link
          href="/coach"
          className="flex h-14 items-center justify-center rounded-full bg-primary text-[15px] font-bold text-primary-foreground"
        >
          Tell me how it feels
        </Link>
        <Link
          href="/plan"
          className="text-center text-[12.5px] font-medium text-muted-foreground"
        >
          See what&apos;s waiting
        </Link>
      </div>
    </div>
  );
}

/**
 * Rest day. The same screen with the button removed. The escape hatch at the
 * bottom respects the runner who feels great without letting the plan be
 * quietly overridden.
 */
async function RestDay({
  header,
  name,
  day,
}: {
  header: React.ReactNode;
  name: string;
  day: PlannedDay;
}) {
  const week = await getWeek();
  const tomorrow = week.find((d) => d.date > day.date && d.workout);
  const runs = week.filter((d) => d.workout);
  const km = runs.reduce((sum, d) => sum + (d.workout?.distance ?? 0) / 1000, 0);

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col gap-5">
      {header}

      <h1 className="t-voice">Nothing today, {name}.</h1>

      <p className="t-lead text-foreground/80">
        Rest is the part of the plan people skip. Yesterday&apos;s work is still
        being absorbed — walking is plenty.
      </p>

      {/* A calm surface rather than a photograph. No stock imagery anywhere. */}
      <div
        aria-hidden
        className="flex h-[136px] items-center justify-center rounded-[22px]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, var(--muted) 0 9px, transparent 9px 18px)",
        }}
      />

      <div className="flex flex-col">
        <RestRow
          label="Tomorrow"
          value={
            tomorrow?.workout
              ? `${tomorrow.workout.name} · ${tomorrow.workout.durationLabel.replace("~", "")}`
              : "Rest again"
          }
        />
        <RestRow
          label="This week"
          value={`${km.toFixed(0)} km across ${runs.length} runs`}
          last
        />
      </div>

      <div className="mt-auto flex flex-col gap-3 pb-4">
        <button
          type="button"
          className="h-14 rounded-full bg-secondary text-[14.5px] font-semibold"
        >
          15 min mobility instead
        </button>
        <Link
          href="/coach"
          className="text-center text-[12.5px] font-medium text-muted-foreground"
        >
          I feel good — give me something
        </Link>
      </div>
    </div>
  );
}

/**
 * The return. No guilt, no broken-streak graphic, no catching up — an honest
 * revised forecast and a twenty-minute way back in. "The runner never starts
 * over" is a design constraint, not a tagline.
 */
async function TheReturn({
  header,
  gapDays,
  runs,
}: {
  header: React.ReactNode;
  gapDays: number;
  runs: Run[];
}) {
  const week = await getWeek();
  const longest = week.reduce(
    (max, d) => Math.max(max, (d.workout?.distance ?? 0) / 1000),
    0
  );
  const peak = week.reduce((sum, d) => sum + (d.workout?.distance ?? 0) / 1000, 0);

  // A gap costs fitness; the honest thing is to say by how much and move on.
  const softenedPeak = Math.round(peak * 0.9);
  const softenedLong = Math.round(longest * 0.66);

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col gap-[22px]">
      {header}

      <h1 className="t-voice">Welcome back.</h1>

      <p className="text-[18px] leading-[1.5] text-foreground/85 text-pretty">
        You missed {gapDays} days. That&apos;s fine — it happens to everyone
        training for this. I&apos;ve rebuilt the next fortnight so you
        don&apos;t try to make it up all at once.
      </p>

      <div className="flex flex-col gap-3 rounded-[20px] bg-muted p-[18px]">
        <div className="t-label tracking-[0.12em]">What changed</div>
        <ChangeRow label="Peak weekly volume" value={`${Math.round(peak)} → ${softenedPeak} km`} />
        <ChangeRow label="Long run this Sunday" value={`${Math.round(longest)} → ${softenedLong} km`} />
        <ChangeRow
          label="Runs on the record"
          value={`${runs.length}, all of them kept`}
          attention
        />
      </div>

      <p className="text-sm leading-[1.5] text-muted-foreground text-pretty">
        The goal is still very much on. Today is twenty easy minutes to get the
        habit back, nothing else.
      </p>

      <div className="mt-auto flex flex-col gap-3 pb-4">
        <Link
          href="/run?w=recovery"
          className="flex h-15 items-center justify-center gap-2.5 rounded-full bg-primary text-base font-bold text-primary-foreground transition-[filter] duration-[90ms] active:brightness-110"
        >
          Start run
          <span className="text-[13px] font-medium text-primary-foreground/55">
            20:00
          </span>
        </Link>
        <Link
          href="/coach"
          className="text-center text-[12.5px] font-medium text-muted-foreground"
        >
          Talk to me about the gap
        </Link>
      </div>
    </div>
  );
}

function ChangeRow({
  label,
  value,
  attention = false,
}: {
  label: string;
  value: string;
  attention?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3 text-[13px] font-medium leading-[1.4]">
      <span className="text-muted-foreground">{label}</span>
      <span className={attention ? "text-attention-ink" : undefined}>{value}</span>
    </div>
  );
}

function RestRow({
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
      className={`flex items-center justify-between border-t border-border py-[15px] ${
        last ? "border-b" : ""
      }`}
    >
      <span className="text-sm font-medium text-foreground/75">{label}</span>
      <span className="text-[13px] font-medium text-muted-foreground">{value}</span>
    </div>
  );
}

/**
 * The coach's one sentence. One clause of reasoning, then the instruction —
 * second person, present tense, no exclamation marks, and praise names a
 * behaviour rather than a feeling.
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
