import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="px-5 py-20">
      <Reveal className="mx-auto max-w-4xl">
        <div className="aurora relative overflow-hidden rounded-[2rem] border border-border px-6 py-16 text-center sm:px-12">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Your next run is waiting.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Lace up and let Avenir take it from here. Your best running starts
            with your next step.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/signup">
                Start running free
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="/dashboard">Explore the demo</Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
