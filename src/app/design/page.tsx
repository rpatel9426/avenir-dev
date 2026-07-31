"use client";

import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ProgressRing } from "@/components/app/progress-ring";
import { MetricTile } from "@/components/run/metric-tile";
import { Reveal } from "@/components/motion/reveal";

/* Eight tokens, no more. */
const COLORS = [
  { name: "Surface", var: "--background", note: "Warm paper. The app at rest." },
  { name: "Raised", var: "--card", note: "Cards — only when grouping is real." },
  { name: "Ink", var: "--primary", note: "Text and primary action, light mode." },
  { name: "Accent", var: "--accent", note: "5.9:1 on paper. Actions and selection only — never a value, a chart or a signifier." },
  { name: "Attention", var: "--attention", note: "Fatigue, weather, offline. Blue-grey, not amber: it survives red-green deficiency." },
  { name: "Tint", var: "--muted-foreground", note: "Secondary text. A solid tint, never an opacity." },
];

/* Seven steps. Nothing below 11.5px, no metric below 24px. */
const TYPE = [
  { label: "metric/82", cls: "t-metric", sample: "5:48" },
  { label: "voice/34", cls: "t-voice", sample: "Morning, Rishi." },
  { label: "lead/19", cls: "t-lead", sample: "Keep today conversational." },
  { label: "title/17", cls: "t-title", sample: "Easy run" },
  { label: "body/14.5", cls: "t-body", sample: "Forty minutes, nothing more." },
  { label: "meta/11.5", cls: "t-meta", sample: "Updated after every long run" },
  { label: "label/10", cls: "t-label", sample: "Week 7 of 18" },
];

export default function DesignSystemPage() {
  return (
    <div className="relative min-h-dvh">
      <div className="aurora pointer-events-none absolute inset-0 -z-10" />

      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
        <Logo />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Home
        </Link>
      </header>

      <main className="mx-auto max-w-3xl space-y-16 px-5 py-8 pb-24">
        {/* Intro */}
        <section>
          <Badge variant="outline">Design system · v1</Badge>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight">
            The Avenir system
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Eight colours, seven type steps, two atoms — a system a two-person
            team can hold in their head. Light paper for the app at rest, night
            for the live run. Serif is the coach&apos;s voice, mono is machine
            fact, sans is everything the runner does.
          </p>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Three rules the system defends: every screen answers one question,
            and the answer is a sentence before it is a number; no streaks, no
            badges, no red; if the coach can say it, we don&apos;t build a
            screen for it.
          </p>
        </section>

        {/* Colour */}
        <Section title="Color" caption="One deep canvas, two purposeful accents. Authored in OKLCH.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {COLORS.map((c) => (
              <div key={c.var} className="overflow-hidden rounded-2xl border border-border">
                <div className="h-20 w-full" style={{ background: `var(${c.var})` }} />
                <div className="p-3">
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="mt-0.5 font-mono text-[0.7rem] text-muted-foreground">
                    {c.var}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{c.note}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Typography */}
        <Section title="Typography" caption="Geist Sans for voice, tabular figures for every metric.">
          <div className="space-y-5">
            {TYPE.map((t) => (
              <div key={t.label} className="flex items-baseline justify-between gap-4 border-b border-border pb-4">
                <span className={t.cls}>{t.sample}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{t.label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Buttons */}
        <Section title="Buttons" caption="Pill-shaped, tactile, with a confident press.">
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </div>
        </Section>

        {/* Cards */}
        <Section title="Cards" caption="Soft surfaces, generous radius, quiet borders.">
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="p-5">
              <p className="font-semibold">Standard card</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The default container for content across the app.
              </p>
            </Card>
            <div className="glass rounded-2xl border border-border p-5">
              <p className="font-semibold">Glass surface</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Frosted, used for navigation and live coaching.
              </p>
            </div>
          </div>
        </Section>

        {/* Navigation */}
        <Section title="Navigation" caption="A floating, thumb-reachable dock. One primary action at the centre.">
          <div className="glass flex items-center justify-around rounded-full border border-border p-1.5">
            <NavDemo label="Home" active />
            <NavDemo label="Runs" />
            <span className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_24px_-6px] shadow-accent/30">
              ▶
            </span>
            <NavDemo label="Profile" />
          </div>
        </Section>

        {/* Components */}
        <Section title="Component library" caption="The building blocks, composed everywhere.">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>Primary</Badge>
              <Badge variant="accent">Accent</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
            <Input placeholder="Input field" />
            <div className="grid grid-cols-3 gap-3">
              <MetricTile label="Pace" value="5:12" unit="/km" accent="primary" />
              <MetricTile label="Heart" value="154" unit="bpm" accent="destructive" icon={<Heart className="size-3" />} />
              <MetricTile label="Cadence" value="176" unit="spm" />
            </div>
          </div>
        </Section>

        {/* Animation */}
        <Section title="Motion" caption="Purposeful, physical, never decorative. Easing [0.22, 1, 0.36, 1].">
          <div className="flex flex-wrap items-center gap-8">
            <div className="text-center">
              <ProgressRing value={0.68} size={120}>
                <span className="tabular-nums text-2xl font-semibold">68%</span>
              </ProgressRing>
              <p className="mt-2 text-xs text-muted-foreground">Animated ring</p>
            </div>
            <div className="flex-1 space-y-2">
              {[0, 1, 2].map((i) => (
                <Reveal key={i} delay={i}>
                  <div className="rounded-xl border border-border bg-card/60 px-4 py-3 text-sm">
                    Reveal on scroll · staggered {i + 1}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Section>
      </main>
    </div>
  );
}

function Section({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-widest text-accent">
        {title}
      </h2>
      <p className="mt-1 mb-5 text-sm text-muted-foreground">{caption}</p>
      {children}
    </section>
  );
}

function NavDemo({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      className={`flex flex-1 flex-col items-center gap-0.5 rounded-full py-2.5 text-[0.65rem] font-medium ${
        active ? "bg-secondary/70 text-foreground" : "text-muted-foreground"
      }`}
    >
      <span className="size-5 rounded-full bg-current opacity-40" />
      {label}
    </span>
  );
}
