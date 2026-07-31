"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "How does Avenir coach me during a run?",
    a: "Avenir reads your live pace, heart rate, cadence and distance every second, and speaks short coaching cues in your ear — when to ease back, when to push, and encouragement right where you usually struggle. You can also talk back and it responds.",
  },
  {
    q: "Do I need a smartwatch or wearable?",
    a: "No. Avenir works with just your phone and a pair of earbuds. Wearable and GPS-watch integrations are on the roadmap, but they're never required to get fully coached.",
  },
  {
    q: "What makes Avenir different from other running apps?",
    a: "Most apps tell you what to do before a run, or what happened after. Avenir coaches you during it — live, spoken, and personalised to how you actually run. It's a companion, not a dashboard.",
  },
  {
    q: "Can beginners use Avenir?",
    a: "Absolutely. Pick an easy run, press start, and Avenir keeps you at a conversational effort so you build fitness sustainably instead of burning out. It adapts as you get stronger.",
  },
  {
    q: "How much does it cost?",
    a: "The full run experience and live coaching cues are free. Talking to your coach — the two-way, generative voice conversation — is part of Avenir Premium. No credit card required to start.",
  },
  {
    q: "Is my running data secure?",
    a: "Yes. Your data is stored on your own private account with row-level security, and it's never sold. You're always in control of it.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="px-5 py-20">
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <p className="label-mono text-accent">FAQ</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need,{" "}
            <span className="font-editorial italic text-accent">all in one place</span>
          </h2>
        </Reveal>

        <div className="mt-12 divide-y divide-border border-y border-border">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="label-mono text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 font-medium">{item.q}</span>
                  <Plus
                    className={cn(
                      "size-5 shrink-0 text-muted-foreground transition-transform duration-300",
                      isOpen && "rotate-45 text-accent"
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pl-11 pr-8 text-sm leading-relaxed text-muted-foreground">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
