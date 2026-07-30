import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="aurora pointer-events-none absolute inset-0 -z-10" />
      <header className="flex items-center justify-between px-5 py-5">
        <Link href="/" aria-label="Avenir home">
          <Logo />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-5 py-8">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
