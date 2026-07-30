import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-border">
      <div className="mx-auto max-w-6xl px-5 pt-14">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Your AI running companion. Coached in real time, every stride.
            </p>
          </div>
          <nav className="flex items-center gap-5 text-sm text-muted-foreground">
            <Link href="/design" className="transition-colors hover:text-foreground">
              Design system
            </Link>
            <Link href="/login" className="transition-colors hover:text-foreground">
              Log in
            </Link>
            <Link href="/signup" className="transition-colors hover:text-foreground">
              Sign up
            </Link>
          </nav>
        </div>

        <p className="mt-10 label-mono text-muted-foreground">
          © {new Date().getFullYear()} Avenir — 51.5074° N, 0.1278° W
        </p>
      </div>

      {/* Oversized wordmark bleeding off the bottom edge. */}
      <div
        aria-hidden="true"
        className="pointer-events-none -mb-[2vw] mt-8 select-none bg-gradient-to-b from-foreground/[0.16] to-foreground/[0.04] bg-clip-text text-center text-[20vw] font-semibold leading-[0.8] tracking-tighter text-transparent"
      >
        AVENIR
      </div>
    </footer>
  );
}
