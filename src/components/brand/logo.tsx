import { cn } from "@/lib/utils";

/** The Avenir motion-mark: a forward-leaning chevron formed from two strides. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn("size-8", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="avenir-mark" x1="4" y1="28" x2="28" y2="4" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--color-primary)" />
          <stop offset="1" stopColor="var(--color-accent)" />
        </linearGradient>
      </defs>
      <path
        d="M6 25.5 L15 6.5 a1.6 1.6 0 0 1 2.9 0 L27 25.5"
        stroke="url(#avenir-mark)"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 25.5 L16.5 15"
        stroke="var(--color-primary)"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
    </svg>
  );
}

/** Full wordmark lockup: mark + "Avenir". */
export function Logo({
  className,
  markClassName,
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={markClassName} />
      <span className="text-lg font-semibold tracking-tight">Avenir</span>
    </span>
  );
}
