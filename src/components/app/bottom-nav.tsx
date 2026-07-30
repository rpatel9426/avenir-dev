"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { History, Home, Play, User } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/history", label: "Runs", icon: History },
  { href: "/run", label: "Run", icon: Play, primary: true },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  // The Run screen is immersive — hide the dock so nothing overlaps the live
  // controls and there's no way to wander off mid-run by accident.
  if (pathname.startsWith("/run")) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
      <div className="glass mx-auto flex max-w-md items-center justify-around rounded-full border border-border p-1.5 shadow-lg shadow-black/30">
        {ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");

          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className="relative -my-3 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_24px_-6px] shadow-primary/60 transition-transform active:scale-95"
              >
                <item.icon className="size-6 fill-current" />
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 rounded-full py-2.5 text-[0.65rem] font-medium transition-colors",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-secondary/70"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <item.icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
