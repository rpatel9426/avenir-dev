import { Metric } from "@/components/ds/atoms";

/**
 * The difference — the argument the whole page exists to make.
 *
 * A plan can't see you fading at kilometre eighteen; a dashboard can only tell
 * you afterwards. So the section pairs the claim with the moment itself, drawn
 * as the live screen rather than described.
 */
const CLAIMS = [
  "Roughly four cues an hour. Silence is the default.",
  "Ask anything out loud, hands never leave your sides.",
  "Every conversation is remembered into tomorrow's plan.",
];

export function Difference() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2 md:items-center">
        <div>
          <p className="t-label tracking-[0.14em]">The difference</p>
          <h2 className="mt-4 text-balance text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl">
            The coaching happens while it still matters.
          </h2>
          <p className="mt-5 text-pretty leading-[1.6] text-muted-foreground">
            A plan can&apos;t see you fading at kilometre eighteen. A dashboard
            can only tell you about it afterwards. Avenir listens to your pace,
            heart rate and cadence in real time and speaks when — and only when
            — there&apos;s something worth saying.
          </p>

          <ul className="mt-7 flex flex-col gap-3">
            {CLAIMS.map((c) => (
              <li key={c} className="flex gap-3 text-sm leading-[1.5]">
                <span
                  aria-hidden
                  className="mt-[7px] size-1.5 shrink-0 rounded-full bg-accent"
                />
                {c}
              </li>
            ))}
          </ul>
        </div>

        {/* The moment, drawn in the run's own palette rather than described. */}
        <div className="dark rounded-[28px] bg-background p-7 text-foreground shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
          <p className="t-label text-accent">KM 30 · Coach speaking</p>
          <p className="mt-4 text-[17px] leading-[1.5] text-pretty">
            “This is the part you rehearsed in August. Shoulders down, shorten
            the stride, and stop doing maths — you&apos;re ahead.”
          </p>
          <div className="mt-7 flex gap-8 border-t border-border pt-6">
            <Metric value="5:58" label="Pace" />
            <Metric value="163" label="HR" />
            <Metric value="30.2" label="KM" />
          </div>
        </div>
      </div>
    </section>
  );
}
