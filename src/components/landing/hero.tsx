"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CoachPreview } from "@/components/landing/coach-preview";
import { Topo } from "@/components/brand/topo";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pt-28 pb-16 sm:pt-36">
      {/* Ambient aurora glow + topographic contour texture. */}
      <div className="aurora pointer-events-none absolute inset-0 -z-10" />
      <Topo className="absolute -right-40 -top-24 -z-10 h-[36rem] w-[36rem] text-border/50" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Badge variant="outline" className="label-mono mb-6 backdrop-blur">
            <Sparkles className="size-3.5 text-accent" />
            AI coaching, in your ear
          </Badge>
        </motion.div>

        <motion.h1
          className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          Every run,{" "}
          <span className="font-editorial italic tracking-normal text-accent">
            perfectly&nbsp;coached
          </span>
          .
        </motion.h1>

        <motion.p
          className="mt-5 max-w-md text-pretty text-lg text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          Avenir reads your pace, effort and rhythm in real time — then talks you
          through it. Like having an elite coach on every stride.
        </motion.p>

        <motion.div
          className="mt-8 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.19, ease: [0.22, 1, 0.36, 1] }}
        >
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/signup">
              Start running free
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <Link href="/dashboard">Try the demo</Link>
          </Button>
        </motion.div>

        <motion.p
          className="mt-4 text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          No credit card · No wearable required · Works on any phone
        </motion.p>
      </div>

      {/* Floating live-coaching preview. */}
      <motion.div
        className="mx-auto mt-14 max-w-sm"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <CoachPreview />
      </motion.div>
    </section>
  );
}
