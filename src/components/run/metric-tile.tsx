import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** A single live metric readout. Large, tabular, calm. */
export function MetricTile({
  label,
  value,
  unit,
  hero = false,
  accent,
  icon,
}: {
  label: string;
  value: string;
  unit?: string;
  hero?: boolean;
  accent?: "primary" | "accent" | "destructive";
  icon?: ReactNode;
}) {
  const accentClass =
    accent === "primary"
      ? "text-primary"
      : accent === "accent"
        ? "text-accent"
        : accent === "destructive"
          ? "text-destructive"
          : "text-foreground";

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-border bg-card/50 px-4 py-3",
        hero && "items-center bg-transparent border-transparent px-0"
      )}
    >
      <span className="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </span>
      <span
        className={cn(
          "tabular-nums font-semibold tracking-tight",
          hero ? "text-7xl leading-none mt-2" : "text-2xl mt-0.5",
          accentClass
        )}
      >
        {value}
      </span>
      {unit && (
        <span className={cn("text-muted-foreground", hero ? "mt-2 text-sm" : "text-xs")}>
          {unit}
        </span>
      )}
    </div>
  );
}
