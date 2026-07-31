"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { CoachLine } from "@/hooks/use-run-session";
import { cn } from "@/lib/utils";

/**
 * The coach's card. One thing moves at a time: the voice arrives by opacity
 * plus a 4px rise, and nothing else on the live screen animates while it does.
 * When the runner is being listened to, the same card turns accent and shows
 * what was heard — so the state is never in doubt at arm's length.
 */
export function CoachFeed({
  cues,
  speaking,
  listening = false,
}: {
  cues: CoachLine[];
  speaking?: boolean;
  listening?: boolean;
}) {
  const latest = cues.find((c) => c.role === "coach") ?? null;
  const lastHeard = cues.find((c) => c.role === "runner") ?? null;
  const history = cues.filter((c) => c.id !== latest?.id).slice(0, 3);

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          "flex min-h-[7rem] flex-col gap-[13px] rounded-[22px] p-5 transition-colors",
          listening
            ? "border border-accent/40 bg-accent-wash"
            : "border border-border bg-secondary"
        )}
      >
        <div className="flex items-center gap-[9px]">
          {listening ? (
            <>
              <span aria-hidden className="flex h-4 items-end gap-[2.5px]">
                {[0, 0.1, 0.2, 0.3].map((delay) => (
                  <span
                    key={delay}
                    className="animate-wave w-[2.5px] rounded-sm bg-accent"
                    style={{ height: "16px", animationDelay: `${delay}s` }}
                  />
                ))}
              </span>
              <span className="t-label text-accent">Listening · tap to stop</span>
            </>
          ) : (
            <span className="t-label text-tint-strong">
              {speaking ? "Avenir speaking" : "Avenir"}
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={listening ? lastHeard?.id ?? "listening" : latest?.id ?? "waiting"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "text-[16.5px] leading-[1.45] text-pretty",
              listening ? "text-accent" : "text-foreground"
            )}
          >
            {listening
              ? lastHeard
                ? `“${lastHeard.message}”`
                : "Go ahead — I'm listening."
              : (latest?.message ?? "Listening to your first strides.")}
          </motion.p>
        </AnimatePresence>
      </div>

      {history.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {history.map((cue) => (
            <p
              key={cue.id}
              className={cn(
                "t-meta truncate",
                cue.role === "runner" && "text-right text-tint-strong"
              )}
            >
              {cue.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
