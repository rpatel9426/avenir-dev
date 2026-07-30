import { LogoMark } from "@/components/brand/logo";

const PHRASES = [
  "Loved by every pace",
  "Coached in real time",
  "Run further",
  "Chase the next kilometre",
  "Your best run is ahead",
];

/**
 * An edge-to-edge scrolling band — the marquee motif from the references.
 * The content is duplicated so the -50% translate loops seamlessly.
 */
export function Marquee() {
  const items = [...PHRASES, ...PHRASES];
  return (
    <div className="relative flex overflow-hidden border-y border-border bg-primary/[0.06] py-4">
      <div className="flex shrink-0 animate-marquee items-center gap-6 whitespace-nowrap pr-6">
        {items.map((phrase, i) => (
          <span key={i} className="flex items-center gap-6">
            <span className="text-sm font-medium tracking-tight text-foreground/80">
              {phrase}
            </span>
            <LogoMark className="size-4 opacity-60" />
          </span>
        ))}
      </div>
      {/* Soft fade at both edges. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
