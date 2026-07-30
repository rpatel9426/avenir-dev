"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/brand/logo";
import { useSpeechSynthesis } from "@/hooks/use-speech";
import { getMemory } from "@/lib/ai/memory";
import { buildBriefing } from "@/lib/ai/briefing";
import { goalMeta } from "@/lib/goal-meta";
import { cn } from "@/lib/utils";
import type { Workout } from "@/lib/workouts";

/**
 * The coach's pre-run briefing. Explains today's session in the context of the
 * runner's memory, spoken aloud, before the run begins.
 */
export function RunBriefing({
  workout,
  distanceKm,
  onStart,
  onBack,
}: {
  workout: Workout;
  distanceKm: number;
  onStart: () => void;
  onBack: () => void;
}) {
  const meta = goalMeta(workout.id);
  const lines = useMemo(
    () => buildBriefing(workout, getMemory(), distanceKm),
    [workout, distanceKm]
  );

  const { supported, speak, cancel } = useSpeechSynthesis();
  const [voice, setVoice] = useState(true);

  // Speak the briefing once on arrival (the "Continue" tap is our gesture).
  useEffect(() => {
    if (voice && supported) speak(lines.join(" "));
    return () => cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleVoice = () => {
    setVoice((v) => {
      if (v) cancel();
      else if (supported) speak(lines.join(" "));
      return !v;
    });
  };

  return (
    <div className="flex min-h-[80dvh] flex-col">
      <header className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        {supported && (
          <button
            type="button"
            onClick={toggleVoice}
            aria-label={voice ? "Mute" : "Unmute"}
            className={cn(
              "flex size-9 items-center justify-center rounded-full border border-border transition-colors",
              voice ? "bg-accent/15 text-accent" : "text-muted-foreground"
            )}
          >
            {voice ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>
        )}
      </header>

      <div className="flex flex-1 flex-col justify-center py-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          className="mb-6 flex items-center gap-3"
        >
          <span className="flex size-12 items-center justify-center rounded-2xl bg-accent/12">
            <LogoMark className="size-7" />
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-accent">
              Pre-run briefing
            </p>
            <p className={cn("text-sm font-semibold", meta.color)}>
              {workout.name} · {distanceKm} km
            </p>
          </div>
        </motion.div>

        <div className="space-y-4">
          {lines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "text-pretty leading-relaxed",
                i === 0 ? "text-2xl font-semibold tracking-tight" : "text-lg text-muted-foreground"
              )}
            >
              {line}
            </motion.p>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 + lines.length * 0.6 }}
        className="sticky bottom-6"
      >
        <Button
          size="lg"
          className="w-full"
          onClick={() => {
            cancel();
            onStart();
          }}
        >
          <Play className="fill-current" />
          Start run
        </Button>
      </motion.div>
    </div>
  );
}
