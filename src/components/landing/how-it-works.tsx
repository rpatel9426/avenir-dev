/**
 * Everything else exists to set that moment up.
 *
 * Three numbered claims, each a consequence of the coach being present during
 * the run rather than after it. No icons — the numbers carry the sequence, and
 * words are faster to read than glyphs you have to learn.
 */
const ITEMS = [
  {
    n: "01",
    title: "A plan that moves when you do",
    body: "Sick, travelling, or simply wrecked? Say so. The next twelve weeks reshape around it in seconds, and the forecast updates honestly.",
  },
  {
    n: "02",
    title: "It reads your recovery before you do",
    body: "Sleep, load and last week's work decide whether today is speed work or forty easy minutes — and you're told which, in a sentence.",
  },
  {
    n: "03",
    title: "Race day, rehearsed for weeks",
    body: "Pacing, fuelling and the bad patch at thirty — practised in training, so the real thing is the fourth time rather than the first.",
  },
];

export function HowItWorks() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="max-w-2xl text-balance text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl">
          Everything else exists to set that moment up.
        </h2>
        <p className="mt-4 max-w-xl text-pretty leading-[1.6] text-muted-foreground">
          One plan, rewritten continuously, so you never have to decide what
          today should be.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {ITEMS.map((item) => (
            <div
              key={item.n}
              className="flex flex-col gap-3 rounded-[22px] bg-card p-7 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:border dark:border-border dark:shadow-none"
            >
              <span className="font-mono text-[10px] font-medium tracking-[0.14em] text-accent">
                {item.n}
              </span>
              <h3 className="text-[17px] font-bold leading-[1.25]">
                {item.title}
              </h3>
              <p className="text-pretty text-sm leading-[1.55] text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
