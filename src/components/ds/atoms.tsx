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
  className,
}: {
  day: string;
  date: string | number;
  name: string;
  detail: string;
  /** 0–1. Drawn as a width because a runner reads relative effort, not a score. */
  load?: number;
  href?: string;
  selected?: boolean;
  className?: string;
}) {
  const body = (
    <div
      className={cn(
        "flex items-center gap-[14px] rounded-[14px] bg-muted p-[14px] transition-colors",
        selected && "bg-accent-wash",
        href && "active:brightness-95 dark:active:brightness-110",
        className
      )}
    >
      <div className="w-[34px] shrink-0 font-mono text-[10px] leading-[1.4] font-medium uppercase">
        {day}
        <br />
        {date}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="t-title truncate">{name}</div>
        <div className="t-meta truncate">{detail}</div>
      </div>
      <div
        aria-hidden
        className="h-1 shrink-0 rounded-full bg-foreground"
        style={{ width: `${Math.round(12 + Math.min(Math.max(load, 0), 1) * 26)}px` }}
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
        "animate-rise max-w-[88%] px-4 py-[14px] text-[13px] leading-[1.5]",
        from === "coach"
          ? "self-start rounded-[18px_18px_18px_6px] border border-border bg-card"
          : "self-end rounded-[18px_18px_6px_18px] bg-accent-wash text-accent dark:text-accent",
        className
      )}
    >
      {children}
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
