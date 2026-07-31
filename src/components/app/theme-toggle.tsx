"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/** A calm, tactile light/dark switch. Defaults to dark, as Avenir intends. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // Standard hydration guard so the toggle reflects the real theme post-mount.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const isDark = !mounted || theme !== "light";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative inline-flex h-9 w-16 items-center rounded-full border border-border bg-secondary/60 px-1 transition-colors"
    >
      <span
        className={cn(
          "flex size-7 items-center justify-center rounded-full bg-background shadow-sm transition-transform duration-300",
          isDark ? "translate-x-7" : "translate-x-0"
        )}
      >
        {isDark ? (
          <Moon className="size-4 text-accent" />
        ) : (
          <Sun className="size-4 text-accent" />
        )}
      </span>
    </button>
  );
}
