"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

/**
 * The page argues one thing — the coach talks to you mid-run — and the hero
 * says it in a single antithesis. No feature list up here; the claim has to
 * land before anything else is offered.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-16 pt-24 sm:pt-32">
      <div className="aurora pointer-events-none absolute inset-0 -z-10" />

      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <motion.span
          className="t-label rounded-full bg-card px-3.5 py-2"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Now coaching out loud, mid-run
        </motion.span>

        <motion.h1
          className="mt-7 max-w-3xl text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          Other apps tell you what you ran.
          <br />
          <span className="font-editorial font-normal italic tracking-normal text-accent">
            Avenir runs with you.
          </span>
        </motion.h1>

        <motion.p
          className="mt-6 max-w-xl text-pretty text-lg leading-[1.5] text-muted-foreground"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          An AI coach that knows your goal, your week and your legs — and says
          the right thing at kilometre thirty, while you&apos;re still out
          there.
        </motion.p>

        <motion.div
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          <Button size="lg" asChild>
            <Link href="/signup">Start training free</Link>
          </Button>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/dashboard">Hear the coach</Link>
          </Button>
        </motion.div>

        <p className="t-label mt-6">
          No credit card · Works with Garmin, Apple Watch, Coros
        </p>
      </div>
    </section>
  );
}
