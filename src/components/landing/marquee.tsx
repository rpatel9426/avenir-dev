import { LogoMark } from "@/components/brand/logo";

/* The devices the coach reads from — a claim, not decoration. */
const PHRASES = [
  "Garmin",
  "Apple Watch",
  "Coros",
  "Strava",
  "Whoop",
  "Oura",
];

/**
 * An edge-to-edge scrolling band — the marquee motif from the references.
 * The content is duplicated so the -50% translate loops seamlessly.
 */
export function Marquee() {
  const items = [...PHRASES, ...PHRASES];
  return (
    <div className="relative flex overflow-hidden border-y border-border bg-accent-wash py-4">
      <div className="flex shrink-0 animate-marquee items-center gap-6 whitespace-nowrap pr-6">
        {items.map((phrase, i) => (
          <span key={i} className="flex items-center gap-6">
            <span className="t-label">
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
