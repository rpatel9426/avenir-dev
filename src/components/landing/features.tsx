import { BrainCircuit, Gauge, HeartPulse, Route, Target, TrendingUp } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Card } from "@/components/ui/card";
import { BarsChart, RingStat, RouteMap, Sparkline } from "@/components/landing/mini-charts";

export function Features() {
  return (
    <section className="px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-xl text-center">
          <p className="label-mono text-accent">Why Avenir</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need to{" "}
            <span className="font-editorial italic text-accent">become a better runner</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Live coaching, tracking, and recovery insight — in one calm, focused place.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {/* Live tracking — wide, route map */}
          <Reveal delay={0} className="md:col-span-2">
            <Card className="flex h-full flex-col justify-between overflow-hidden bg-card/60 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <span className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-accent-wash text-accent">
                    <Route className="size-5" />
                  </span>
                  <h3 className="text-lg font-semibold tracking-tight">Live tracking</h3>
                  <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                    Pace, distance, heart rate and route — every second of every run.
                  </p>
                </div>
                <span className="label-mono text-muted-foreground">/ GPS</span>
              </div>
              <RouteMap className="mt-6 w-full text-border" />
            </Card>
          </Reveal>

          {/* Recovery — ring */}
          <Reveal delay={1}>
            <Card className="flex h-full flex-col justify-between bg-card/60 p-6">
              <div>
                <span className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-accent/12 text-accent">
                  <HeartPulse className="size-5" />
                </span>
                <h3 className="text-lg font-semibold tracking-tight">Recovery insights</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Know when to push and when to hold back.
                </p>
              </div>
              <RingStat className="mx-auto mt-4 size-28" value={0.72} label="72" sub="RECOVERED" />
            </Card>
          </Reveal>

          {/* Analytics — bars */}
          <Reveal delay={2}>
            <Card className="flex h-full flex-col justify-between bg-card/60 p-6">
              <div>
                <span className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-accent-wash text-accent">
                  <TrendingUp className="size-5" />
                </span>
                <h3 className="text-lg font-semibold tracking-tight">Performance analytics</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Watch fitness compound, week over week.
                </p>
              </div>
              <BarsChart className="mt-5 h-24 w-full text-secondary" />
            </Card>
          </Reveal>

          {/* Adaptive pacing — sparkline */}
          <Reveal delay={3}>
            <Card className="flex h-full flex-col justify-between bg-card/60 p-6">
              <div>
                <span className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-accent/12 text-accent">
                  <Gauge className="size-5" />
                </span>
                <h3 className="text-lg font-semibold tracking-tight">Real-time pacing</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Hear exactly when to lift it or ease back.
                </p>
              </div>
              <Sparkline className="mt-5 h-24 w-full" />
            </Card>
          </Reveal>

          {/* AI + goals — two compact text cards */}
          <Reveal delay={4}>
            <Card className="flex h-full flex-col bg-card/60 p-6">
              <span className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-accent/12 text-accent">
                <BrainCircuit className="size-5" />
              </span>
              <h3 className="text-lg font-semibold tracking-tight">A coach that remembers</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Avenir learns your tendencies — &ldquo;you start fast,&rdquo; &ldquo;stronger than last week&rdquo; — and coaches around them.
              </p>
            </Card>
          </Reveal>

          <Reveal delay={5}>
            <Card className="flex h-full flex-col bg-card/60 p-6">
              <span className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-accent-wash text-accent">
                <Target className="size-5" />
              </span>
              <h3 className="text-lg font-semibold tracking-tight">Goals that stick</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Weekly targets and streaks that turn one good run into a habit.
              </p>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
