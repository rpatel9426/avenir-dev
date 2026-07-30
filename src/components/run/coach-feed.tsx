"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import type { CoachLine } from "@/hooks/use-run-session";
import { cn } from "@/lib/utils";

const TONE_STYLES: Record<string, string> = {
  push: "text-primary",
  finish: "text-primary",
  milestone: "text-primary",
  ease: "text-accent",
  encourage: "text-accent",
  steady: "text-foreground",
  start: "text-foreground",
};

/**
 * The coaching feed. The newest coach line is spotlighted at the top; earlier
 * lines — including anything the runner said aloud — scroll gently beneath it,
 * forming a transcript of the run's conversation.
 */
export function CoachFeed({
  cues,
  speaking,
}: {
  cues: CoachLine[];
  speaking?: boolean;
}) {
  const latest = cues.find((c) => c.role === "coach") ?? null;
  const history = cues.filter((c) => c.id !== latest?.id);

  return (
    <div className="space-y-3">
      {/* Spotlight — the coach's current line. */}
      <div className="glass min-h-[7rem] rounded-3xl border border-border p-5">
        <div className="flex items-center gap-2 text-xs font-medium text-accent">
          <span className="flex size-6 items-center justify-center rounded-full bg-accent/15">
            <Volume2 className="size-3.5" />
          </span>
          Avenir
          <span className="ml-auto flex items-center gap-1 text-muted-foreground">
            <span
              className={cn(
                "size-1.5 rounded-full bg-primary",
                speaking ? "animate-ping" : "animate-pulse"
              )}
            />
            {speaking ? "speaking" : "coaching"}
          </span>
        </div>
        <div className="mt-3 min-h-[3rem]">
          <AnimatePresence mode="wait">
            {latest ? (
              <motion.p
                key={latest.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className={cn(
                  "text-lg font-medium leading-snug",
                  TONE_STYLES[latest.tone] ?? "text-foreground"
                )}
              >
                {latest.message}
              </motion.p>
            ) : (
              <motion.p
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg font-medium leading-snug text-muted-foreground"
              >
                Listening to your first strides…
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Transcript */}
      {history.length > 0 && (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {history.slice(0, 5).map((cue) =>
              cue.role === "runner" ? (
                <motion.div
                  key={cue.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0 }}
                  className="flex justify-end"
                >
                  <span className="rounded-2xl rounded-br-sm bg-primary/15 px-3 py-1.5 text-sm text-foreground">
                    {cue.message}
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key={cue.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2 px-1 text-sm text-muted-foreground"
                >
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-border" />
                  <span className="leading-snug">{cue.message}</span>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
