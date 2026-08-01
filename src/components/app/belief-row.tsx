"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

/**
 * One thing the coach believes about the runner, and the repair for it.
 *
 * The correction has to be visibly absorbed — "noted, I'll weight sleep less
 * for you" — because a correction that gets filed rather than applied is worse
 * than no correction at all.
 */
export function BeliefRow({
  label,
  note,
  value,
  options = [],
  readOnly = false,
  last = false,
}: {
  id: string;
  label: string;
  note: string;
  value: string;
  options?: Option[];
  readOnly?: boolean;
  last?: boolean;
}) {
  const [current, setCurrent] = useState(value);
  const [open, setOpen] = useState(false);
  const [corrected, setCorrected] = useState(false);

  const editable = !readOnly && options.length > 0;

  return (
    <div className={cn("border-t border-border", last && "border-b")}>
      <button
        type="button"
        disabled={!editable}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-3.5 text-left disabled:cursor-default"
      >
        <span className="flex flex-col gap-0.5">
          <span className="text-[13.5px] font-semibold leading-[1.2]">
            {label}
          </span>
          <span className="text-[11px] leading-[1.2] text-muted-foreground">
            {corrected ? "You corrected this just now" : note}
          </span>
        </span>
        <span
          className={cn(
            "shrink-0 text-[13.5px] font-semibold",
            corrected && "text-accent"
          )}
        >
          {current}
          {editable && (
            <span className="pl-1 font-normal text-accent">
              {open ? "⌄" : "›"}
            </span>
          )}
        </span>
      </button>

      {open && editable && (
        <div className="flex flex-col gap-2 pb-4">
          {/* "That's not right" made concrete: pick what is right instead. */}
          <p className="t-meta">That&apos;s not right? Tell me what is.</p>
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                setCurrent(o.value);
                setCorrected(o.value !== value);
                setOpen(false);
              }}
              className={cn(
                "rounded-[14px] px-4 py-3 text-left text-[13px] font-medium transition-colors",
                current === o.value
                  ? "bg-accent-wash font-semibold text-accent"
                  : "bg-muted"
              )}
            >
              {o.label}
            </button>
          ))}
          <p className="t-meta">
            I&apos;ll apply this to today&apos;s session, not just file it.
          </p>
        </div>
      )}
    </div>
  );
}
