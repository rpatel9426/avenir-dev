/**
 * Small, self-contained "app analytics" visuals for the landing feature cards
 * and app-screen mockups — the chart/map/route imagery from the reference,
 * drawn as SVG so there are no raster assets and everything is theme-aware.
 */

/** A GPS-style route line on a faint grid. */
export function RouteMap({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 120" fill="none" className={className} aria-hidden="true">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" stroke="currentColor" strokeWidth="0.5" className="text-border" />
        </pattern>
      </defs>
      <rect width="220" height="120" fill="url(#grid)" opacity="0.5" />
      <path
        d="M18 96 C 50 96, 52 40, 84 44 S 128 96, 156 72 S 196 28, 204 26"
        stroke="var(--color-primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="18" cy="96" r="4" fill="var(--color-primary)" />
      <circle cx="204" cy="26" r="4" fill="var(--color-accent)" />
    </svg>
  );
}

/** A bar chart with a highlighted final bar (weekly volume / analytics). */
export function BarsChart({ className }: { className?: string }) {
  const bars = [40, 55, 34, 68, 48, 74, 90];
  return (
    <svg viewBox="0 0 220 120" fill="none" className={className} aria-hidden="true">
      {bars.map((h, i) => (
        <rect
          key={i}
          x={12 + i * 30}
          y={110 - h}
          width="18"
          height={h}
          rx="4"
          fill={i === bars.length - 1 ? "var(--color-primary)" : "currentColor"}
          className={i === bars.length - 1 ? "" : "text-secondary"}
        />
      ))}
    </svg>
  );
}

/** A pace sparkline. */
export function Sparkline({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 120" fill="none" className={className} aria-hidden="true">
      <path
        d="M8 80 L44 66 L80 74 L116 40 L152 52 L188 24 L212 32"
        stroke="var(--color-accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 80 L44 66 L80 74 L116 40 L152 52 L188 24 L212 32 L212 118 L8 118 Z"
        fill="var(--color-accent)"
        opacity="0.12"
      />
    </svg>
  );
}

/** A donut/ring stat (recovery, zone, goal completion). */
export function RingStat({
  value = 0.72,
  label = "72",
  sub = "Zone 2",
  className,
}: {
  value?: number;
  label?: string;
  sub?: string;
  className?: string;
}) {
  const r = 44;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" stroke="currentColor" className="text-secondary" />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        strokeWidth="10"
        strokeLinecap="round"
        stroke="var(--color-primary)"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value)}
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="58" textAnchor="middle" className="fill-foreground tabular-nums" fontSize="26" fontWeight="600">
        {label}
      </text>
      <text x="60" y="78" textAnchor="middle" className="fill-muted-foreground" fontSize="10">
        {sub}
      </text>
    </svg>
  );
}
