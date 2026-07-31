import Link from "next/link";
import { cn } from "@/lib/utils";

/*
 * The two atoms the design system allows variants on, plus the small parts
 * every screen reuses. Everything here is presentational and server-safe.
 */

/** label/10 — machine facts. Dates, units, "WEEK 7 OF 18". */
export function Label({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("t-label", className)} {...props} />;
}

/**
 * Workout row · the system's first atom. Date · name · load bar.
 * Reused in Plan, Today, history and race prep. Load is a width, never a number.
 */
export function WorkoutRow({
  day,
  date,
  name,
  detail,
  load = 0.5,
  href,
  selected = false,
  tag,
  variant = "card",
  className,
}: {
  day: string;
  date: string | number;
  name: string;
  detail?: string;
  /** 0–1. Drawn as a width because a runner reads relative effort, not a score. */
  load?: number;
  href?: string;
  selected?: boolean;
  /** A coach edit is tagged, never silent. Attention blue-grey, never red. */
  tag?: string;
  /** `card` is the atom as specified; `list` is the calendar's hairline row. */
  variant?: "card" | "list";
  className?: string;
}) {
  const list = variant === "list";

  const body = (
    <div
      className={cn(
        "flex items-center transition-colors",
        list
          ? "gap-4 border-b border-border py-[15px] last:border-b-0"
          : "gap-[14px] rounded-[14px] bg-muted p-[14px]",
        !list && selected && "bg-accent-wash",
        // Today gets a wash that fades out rather than a block of colour.
        list &&
          selected &&
          "-mx-3 rounded-xl bg-gradient-to-r from-accent-wash to-transparent px-3",
        href && "active:brightness-95 dark:active:brightness-110",
        className
      )}
    >
      <div
        className={cn(
          "shrink-0 font-mono text-[10px] font-medium uppercase leading-[1.4]",
          list ? "w-9" : "w-[34px]",
          list && !selected && "text-muted-foreground"
        )}
      >
        {day}
        <br />
        {date}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div
          className={cn(
            "truncate",
            list ? "text-sm leading-[1.2]" : "t-title",
            list && (selected ? "font-bold" : "font-semibold"),
            list && !detail && "font-medium text-muted-foreground"
          )}
        >
          {name}
          {tag && (
            <span className="t-label pl-1 align-middle text-attention-ink">
              {tag}
            </span>
          )}
        </div>
        {detail && (
          <div className="truncate text-[11.5px] leading-[1.2] text-muted-foreground">
            {detail}
          </div>
        )}
      </div>

      <div
        aria-hidden
        className={cn(
          "h-1 shrink-0 rounded-full",
          load > 0 ? "bg-foreground" : "bg-border",
          list && !selected && load > 0 && "opacity-30"
        )}
        style={{
          width: list
            ? "34px"
            : `${Math.round(12 + Math.min(Math.max(load, 0), 1) * 26)}px`,
          ...(list && load > 0
            ? { transform: `scaleX(${Math.min(Math.max(load, 0.15), 1)})`, transformOrigin: "left" }
            : {}),
        }}
      />
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}

/**
 * Coach message · the second atom. The tail corner marks who is speaking;
 * the coach is the only element that arrives by opacity plus a 4px rise.
 */
export function CoachMessage({
  children,
  from = "coach",
  className,
}: {
  children: React.ReactNode;
  from?: "coach" | "runner";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "animate-rise text-[14.5px] leading-[1.5] text-pretty",
        from === "coach"
          ? "max-w-[88%] self-start rounded-[20px_20px_20px_6px] bg-muted px-[18px] py-4"
          : "max-w-[80%] self-end rounded-[20px_20px_6px_20px] bg-accent px-[18px] py-[14px] font-medium text-accent-foreground",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * The inline plan diff — what makes the coach a coach rather than a chat box.
 * Every consequential reply lands as a change the runner accepts in one tap,
 * so nothing has to be re-entered somewhere else.
 */
export function PlanDiff({
  before,
  after,
  onAccept,
  onDecline,
  status = "pending",
}: {
  before: string;
  after: string;
  onAccept?: () => void;
  onDecline?: () => void;
  status?: "pending" | "accepted" | "declined";
}) {
  return (
    <div className="animate-rise flex w-[88%] flex-col gap-2.5 self-start rounded-[18px] border border-border bg-card p-[18px]">
      <div className="t-label">
        {status === "accepted" ? "Plan updated" : "Proposed change"}
      </div>
      <div className="flex justify-between gap-3 text-[13px] font-medium leading-[1.4]">
        <span className="text-muted-foreground line-through">{before}</span>
        <span className="text-right">{after}</span>
      </div>

      {status === "pending" ? (
        <div className="mt-0.5 flex gap-2">
          <button
            type="button"
            onClick={onAccept}
            className="h-[38px] flex-1 rounded-full bg-accent text-[12.5px] font-bold text-accent-foreground"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={onDecline}
            className="h-[38px] flex-1 rounded-full bg-secondary text-[12.5px] font-semibold text-foreground/70"
          >
            Not yet
          </button>
        </div>
      ) : (
        /* R8 · every change is reversible for 24 hours and stays on the record. */
        <div className="flex items-center justify-between">
          <span className="t-meta">
            {status === "accepted" ? "Applied just now" : "Left as it was"}
          </span>
          {status === "accepted" && (
            <button
              type="button"
              onClick={onDecline}
              className="text-[12px] font-semibold text-accent"
            >
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Metric pair — a value and its mono label. No metric below 24px. */
export function Metric({
  value,
  unit,
  label,
  className,
}: {
  value: string;
  unit?: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-[5px]", className)}>
      <div className="tabular-nums text-2xl font-semibold">
        {value}
        {unit && (
          <span className="text-[13px] font-normal text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      <div className="t-label tracking-[0.1em]">{label}</div>
    </div>
  );
}

/** Chip — selected or default. Selection is one of the two jobs green has. */
export function Chip({
  selected = false,
  className,
  ...props
}: React.ComponentProps<"button"> & { selected?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-full px-[14px] py-[9px] text-xs font-medium transition-colors",
        selected
          ? "bg-accent-wash font-semibold text-accent"
          : "bg-muted text-foreground/70 hover:brightness-95 dark:hover:brightness-125",
        className
      )}
      {...props}
    />
  );
}

/**
 * The open-mark · one signifier for depth, used everywhere and never on
 * anything that isn't tappable. Neutral, so the mark keeps one meaning.
 */
export function OpenRow({
  label,
  href,
  onClick,
  className,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  const classes = cn(
    "open-mark flex w-full items-center justify-between text-[12.5px] font-medium text-muted-foreground",
    className
  );
  return href ? (
    <Link href={href} className={classes}>
      <span>{label}</span>
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={classes}>
      <span>{label}</span>
    </button>
  );
}
