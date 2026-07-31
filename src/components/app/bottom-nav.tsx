"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/*
 * Four tabs is the most a 6am brain navigates without reading — and they are
 * words, not icons: four labels are faster to read than four glyphs you have
 * to learn, and they scale with the system font size.
 */
const ITEMS = [
  { href: "/dashboard", label: "Today" },
  { href: "/plan", label: "Plan" },
  { href: "/coach", label: "Coach" },
  { href: "/profile", label: "You" },
];

export function BottomNav() {
  const pathname = usePathname();

  // The live run is immersive — nothing overlaps the controls, and there's no
  // way to wander off mid-run by accident.
  if (pathname.startsWith("/run")) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background">
      <div className="mx-auto flex max-w-md justify-between px-[34px] pb-[max(1.625rem,env(safe-area-inset-bottom))] pt-[14px]">
        {ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-[42px] flex-1 items-start justify-center text-[10.5px] font-semibold transition-colors",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
