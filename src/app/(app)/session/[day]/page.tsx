import Link from "next/link";
import { notFound } from "next/navigation";
import { getWeek } from "@/lib/plan-store";
import { segmentsFor, whyThisSession } from "@/lib/session-shape";

/**
 * Workout detail. The session is drawn as a shape — block height encodes
 * effort — so its structure is understood before a word is read. "Why this
 * session" is the same disclosure pattern as Today: one explanation
 * component, used everywhere.
 */
export default async function SessionPage({
  params,
}: {
  params: Promise<{ day: string }>;
}) {
  const { day } = await params;
  const offset = Number(day);
  if (!Number.isInteger(offset) || offset < 0 || offset > 6) notFound();

  const week = await getWeek();
  const entry = week[offset];
  if (!entry) notFound();

  const dateLabel = entry.date
    .toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })
    .replace(",", "");

  if (!entry.workout) {
    return (
      <div className="flex min-h-[calc(100dvh-11rem)] flex-col gap-5">
        <div className="t-label">{dateLabel}</div>
        <h1 className="t-voice">{entry.name}</h1>
        <p className="t-lead text-foreground/80">
          {entry.name === "Rest"
            ? "Nothing scheduled, on purpose. Rest is the part of the plan people skip."
            : entry.detail ?? "Off your feet, but still part of the week."}
        </p>
        <div className="mt-auto pb-2">
          <Link
            href="/plan"
            className="flex h-14 items-center justify-center rounded-full bg-secondary text-[14.5px] font-semibold"
          >
            Back to the week
          </Link>
        </div>
      </div>
    );
  }

  const segments = segmentsFor(entry.workout);
  const isKey = entry.workout.id === "tempo" || entry.workout.id === "intervals" || entry.workout.id === "long";

  return (
    <div className="flex min-h-[calc(100dvh-11rem)] flex-col gap-5">
      <div className="t-label">
        {dateLabel} · {isKey ? "Key session" : "Session"}
      </div>

      <h1 className="t-voice">{entry.workout.name}</h1>

      {/* The shape. Height is effort; the emphasised blocks are the point. */}
      <div className="flex flex-col gap-[9px]">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-[14px]">
            <div
              className={`w-11 shrink-0 font-mono text-[9.5px] font-medium uppercase ${
                s.emphasis ? "text-accent" : "text-muted-foreground"
              }`}
            >
              {s.amount}
            </div>
            <div
              className={`flex flex-1 items-center rounded-[9px] px-3 ${
                s.emphasis
                  ? "border border-accent/35 bg-accent-wash text-[13px] font-semibold text-accent"
                  : "bg-secondary text-[12.5px] font-medium text-foreground/75"
              }`}
              style={{ height: `${Math.round(26 + s.effort * 22)}px` }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-[7px] rounded-[18px] bg-muted px-[18px] py-4">
        <div className="t-label tracking-[0.12em]">Why this session</div>
        <p className="text-sm leading-[1.5] text-foreground/78 text-pretty">
          {whyThisSession(entry.workout)}
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-2.5 pb-2">
        <Link
          href={`/run?w=${entry.workout.id}`}
          className="flex h-14 items-center justify-center rounded-full bg-primary text-[15px] font-bold text-primary-foreground"
        >
          Start this run
        </Link>
        <Link
          href="/coach"
          className="flex h-14 items-center justify-center rounded-full bg-secondary text-[14.5px] font-semibold"
        >
          Move this session
        </Link>
      </div>
    </div>
  );
}
