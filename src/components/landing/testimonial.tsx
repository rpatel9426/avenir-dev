import { Reveal } from "@/components/motion/reveal";
import { Topo } from "@/components/brand/topo";

const QUOTES = [
  {
    quote:
      "The live coaching completely changed how I run. I finally know when to push and when to hold back — my pace has never been more consistent.",
    name: "Ren M.",
    detail: "Marathoner · 3:12 PB",
  },
  {
    quote:
      "It genuinely feels like a coach is next to me. Calm when I need calm, sharp when I need pushing. I look forward to every run now.",
    name: "Sam T.",
    detail: "Half-marathon · improving",
  },
];

export function Testimonial() {
  return (
    <section className="px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <p className="label-mono text-accent">Loved by runners</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Trusted to guide every{" "}
            <span className="font-editorial italic text-accent">session</span>
          </h2>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-2">
          {QUOTES.map((q, i) => (
            <Reveal key={q.name} delay={i}>
              <figure className="relative h-full overflow-hidden rounded-3xl border border-border bg-card/60 p-8">
                <Topo className="absolute -right-16 -top-10 h-56 w-56 text-border/40" />
                <blockquote className="relative text-lg leading-relaxed text-foreground/90">
                  &ldquo;{q.quote}&rdquo;
                </blockquote>
                <figcaption className="relative mt-6 flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-semibold text-primary-foreground">
                    {q.name.charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{q.name}</p>
                    <p className="label-mono text-muted-foreground">{q.detail}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
