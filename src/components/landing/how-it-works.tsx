import { Reveal } from "@/components/motion/reveal";

const STEPS = [
  {
    n: "01",
    title: "Tell Avenir your goal",
    body: "Pick a session or a target — a 5K, an easy shakeout, a marathon build. Avenir sets the plan.",
  },
  {
    n: "02",
    title: "Press start and run",
    body: "Earbuds in, phone in pocket. Avenir tracks your effort live and coaches you through every kilometre.",
  },
  {
    n: "03",
    title: "Finish stronger, every time",
    body: "Get a clear breakdown, bank the run, and watch your fitness build with each session you complete.",
  },
];

export function HowItWorks() {
  return (
    <section className="px-5 py-20">
      <div className="mx-auto max-w-4xl">
        <Reveal className="text-center">
          <p className="text-sm font-medium text-accent">How it works</p>
          <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            From first stride to finish line
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i} className="relative">
              <div className="text-4xl font-semibold tracking-tight text-accent/30">
                {s.n}
              </div>
              <h3 className="mt-3 text-lg font-semibold tracking-tight">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
