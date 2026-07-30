import { Activity, Heart, Volume2 } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { BarsChart, RingStat } from "@/components/landing/mini-charts";

/** A minimal phone frame wrapping mock app UI. */
function Phone({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="relative mx-auto w-[248px] rounded-[2.4rem] border border-border bg-card p-2 shadow-2xl shadow-black/40">
        {/* notch */}
        <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-background" />
        <div className="h-[510px] overflow-hidden rounded-[1.9rem] bg-background p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="rounded-xl bg-secondary/50 px-2 py-2 text-center">
      <p className="label-mono text-[0.55rem] text-muted-foreground">{label}</p>
      <p className="tabular-nums text-base font-semibold">{value}</p>
      {unit && <p className="text-[0.55rem] text-muted-foreground">{unit}</p>}
    </div>
  );
}

export function AppShowcase() {
  return (
    <section className="overflow-hidden px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="label-mono text-accent">The app</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Designed for every{" "}
            <span className="font-editorial italic text-accent">kilometre</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Big, glanceable numbers. A calm coach in your ear. Nothing between you and the run.
          </p>
        </Reveal>

        <div className="mt-14 flex flex-col items-center justify-center gap-8 sm:flex-row sm:items-start sm:gap-6">
          {/* Live run screen */}
          <Reveal delay={0}>
            <Phone className="sm:mt-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold leading-tight">Tempo</p>
                  <p className="label-mono text-[0.55rem] text-muted-foreground">5:00 /KM</p>
                </div>
                <span className="flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[0.6rem] text-muted-foreground">
                  <span className="size-1.5 animate-pulse rounded-full bg-primary" /> LIVE
                </span>
              </div>
              <div className="mt-6 flex justify-center">
                <RingStat className="size-40" value={0.58} label="3.42" sub="OF 6 KM" />
              </div>
              <div className="glass mt-6 rounded-2xl border border-border p-3">
                <p className="flex items-center gap-1.5 text-[0.6rem] font-medium text-accent">
                  <Volume2 className="size-3" /> AVENIR
                </p>
                <p className="mt-1 text-xs leading-snug">
                  Right on pace. Beautiful rhythm — hold here.
                </p>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Stat label="PACE" value="4:58" unit="/km" />
                <Stat label="HEART" value="154" unit="bpm" />
                <Stat label="CAD" value="176" unit="spm" />
              </div>
            </Phone>
          </Reveal>

          {/* Analytics screen */}
          <Reveal delay={1}>
            <Phone>
              <div>
                <p className="label-mono text-[0.55rem] text-muted-foreground">GOOD MORNING</p>
                <p className="text-lg font-semibold tracking-tight">Alex</p>
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-card/60 p-3">
                <RingStat className="size-16 shrink-0" value={0.77} label="23" sub="KM" />
                <div>
                  <p className="text-xs font-semibold">Weekly goal</p>
                  <p className="text-[0.65rem] text-muted-foreground">7 km to go — on track.</p>
                </div>
              </div>
              <div className="mt-3 rounded-2xl border border-border bg-card/60 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold">This week</p>
                  <TrendUp />
                </div>
                <BarsChart className="mt-2 h-20 w-full text-secondary" />
              </div>
              <div className="mt-3 space-y-2">
                {[
                  ["Tempo", "6.1 km", "31:48"],
                  ["Easy Run", "5.0 km", "30:06"],
                ].map(([n, d, t]) => (
                  <div key={n} className="flex items-center gap-2 rounded-xl border border-border bg-card/60 p-2.5">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-primary/12 text-primary">
                      <Activity className="size-3.5" />
                    </span>
                    <p className="flex-1 text-xs font-medium">{n}</p>
                    <p className="tabular-nums text-[0.65rem] text-muted-foreground">{d} · {t}</p>
                  </div>
                ))}
              </div>
            </Phone>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function TrendUp() {
  return (
    <span className="flex items-center gap-1 text-[0.6rem] font-medium text-primary">
      <Heart className="size-3 fill-current" /> +8%
    </span>
  );
}
