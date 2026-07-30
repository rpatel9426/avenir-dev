import { cn } from "@/lib/utils";

/**
 * A faint topographic-contour texture — the line-art motif from the design
 * references. Purely decorative; rendered as concentric, slightly-offset rings
 * so it reads like an elevation map without any raster asset.
 */
export function Topo({ className }: { className?: string }) {
  // Concentric contours with a gentle drift so they feel hand-surveyed.
  const rings = Array.from({ length: 11 }, (_, i) => {
    const t = i / 10;
    return {
      rx: 60 + i * 46,
      ry: 48 + i * 40,
      cx: 300 + Math.sin(i * 1.2) * 26,
      cy: 300 + Math.cos(i * 0.9) * 22,
      opacity: 0.5 - t * 0.34,
    };
  });

  return (
    <svg
      viewBox="0 0 600 600"
      fill="none"
      aria-hidden="true"
      className={cn("pointer-events-none select-none", className)}
    >
      <g stroke="currentColor" strokeWidth="1">
        {rings.map((r, i) => (
          <ellipse
            key={i}
            cx={r.cx}
            cy={r.cy}
            rx={r.rx}
            ry={r.ry}
            opacity={r.opacity}
          />
        ))}
      </g>
    </svg>
  );
}
