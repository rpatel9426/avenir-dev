"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, Heart, Volume2 } from "lucide-react";

const LINES = [
  { tone: "Steady", text: "Right on pace. Beautiful rhythm — hold here." },
  { tone: "Push", text: "You've got another gear. Drive the arms, stay light." },
  { tone: "Milestone", text: "3K down. Composed and strong — eyes ahead." },
  { tone: "Ease", text: "Heart rate's climbing. Relax the jaw, ease it back." },
];

export function CoachPreview() {
  const [i, setI] = useState(0);
  const [pace, setPace] = useState("5:12");
  const [hr, setHr] = useState(154);

  useEffect(() => {
    const cue = setInterval(() => setI((v) => (v + 1) % LINES.length), 3200);
    const tick = setInterval(() => {
      const p = 300 + Math.round((Math.random() - 0.5) * 16);
      setPace(`${Math.floor(p / 60)}:${(p % 60).toString().padStart(2, "0")}`);
      setHr(150 + Math.round(Math.random() * 10));
    }, 1600);
    return () => {
      clearInterval(cue);
      clearInterval(tick);
    };
  }, []);

  return (
    <div className="glass relative rounded-[2rem] border border-border p-5 shadow-2xl shadow-black/40">
      {/* Coach message. */}
      <div className="mb-5 flex items-start gap-3 rounded-2xl bg-accent/10 p-4">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/20">
          <Volume2 className="size-4 text-accent" />
        </span>
        <div className="min-h-[2.75rem]">
          <AnimatePresence mode="wait">
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="text-sm leading-snug text-foreground/90"
            >
              {LINES[i].text}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Live metrics. */}
      <div className="grid grid-cols-3 gap-3">
        <Metric label="Pace" value={pace} unit="/km" />
        <Metric label="Distance" value="3.42" unit="km" />
        <Metric label="Time" value="17:48" unit="" />
      </div>

      <div className="mt-3 flex items-center justify-between rounded-2xl bg-secondary/50 px-4 py-3">
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <Heart className="size-4 text-destructive" />
          Heart rate
        </span>
        <span className="tabular-nums text-sm font-semibold">
          <motion.span key={hr} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }}>
            {hr}
          </motion.span>{" "}
          bpm
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Activity className="size-3.5 text-primary" />
        Avenir is listening to your run
        <span className="ml-auto flex items-center gap-1">
          <span className="size-1.5 animate-pulse rounded-full bg-primary" />
          Live
        </span>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-2xl bg-secondary/50 px-3 py-3 text-center">
      <p className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 tabular-nums text-xl font-semibold tracking-tight">
        {value}
      </p>
      {unit && <p className="text-[0.65rem] text-muted-foreground">{unit}</p>}
    </div>
  );
}
