"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Gauge,
  Loader2,
  Mountain,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { completeOnboarding } from "@/app/onboarding/actions";
import type { ExperienceLevel } from "@/lib/supabase/types";

type MotivationStyle = "calm" | "tough" | "data";

const TOTAL_STEPS = 5;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [experience, setExperience] = useState<ExperienceLevel | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [motivation, setMotivation] = useState<MotivationStyle | null>(null);
  const [weeklyKm, setWeeklyKm] = useState<number | null>(null);

  const canAdvance = [
    name.trim().length > 0,
    experience !== null,
    focus !== null,
    motivation !== null,
    weeklyKm !== null,
  ][step];

  /**
   * Save the answers, then leave onboarding. The navigation stays OUTSIDE a
   * transition on purpose: `router.push` followed by `router.refresh()` inside
   * one never settled, so the button span spun forever and the runner could
   * never reach the dashboard. `replace` also keeps onboarding out of history.
   */
  const finish = async () => {
    setSaving(true);
    try {
      await completeOnboarding({
        displayName: name.trim() || "Runner",
        experience: experience ?? "intermediate",
        weeklyGoalKm: weeklyKm ?? 30,
        preferredPaceSecPerKm: null,
      });
    } catch {
      // Never strand the runner on the last step — the profile is editable later.
    }
    router.replace("/dashboard");
  };

  const next = () => (step < TOTAL_STEPS - 1 ? setStep((s) => s + 1) : finish());
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="relative flex min-h-dvh flex-col px-5 pb-8 pt-6">
      <div className="aurora pointer-events-none absolute inset-0 -z-10" />

      {/* Progress */}
      <div className="mx-auto flex w-full max-w-sm items-center gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={back}
            aria-label="Back"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-5" />
          </button>
        ) : (
          <LogoMark className="size-6" />
        )}
        <div className="flex flex-1 gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-300",
                i <= step ? "bg-primary" : "bg-secondary"
              )}
            />
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 0 && (
              <Step
                eyebrow="Welcome to Avenir"
                title="First, what should your coach call you?"
              >
                <Input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canAdvance && next()}
                  placeholder="Your first name"
                  className="text-lg"
                />
              </Step>
            )}

            {step === 1 && (
              <Step eyebrow="Your running" title="How would you describe yourself?">
                <div className="space-y-3">
                  {(
                    [
                      ["beginner", "New to running", "Building the habit and base fitness."],
                      ["intermediate", "Regular runner", "Comfortable with a few runs a week."],
                      ["advanced", "Experienced", "Structured training and racing."],
                    ] as const
                  ).map(([value, label, desc]) => (
                    <SelectCard
                      key={value}
                      selected={experience === value}
                      onClick={() => setExperience(value)}
                      title={label}
                      desc={desc}
                    />
                  ))}
                </div>
              </Step>
            )}

            {step === 2 && (
              <Step eyebrow="Your focus" title="What are you training for right now?">
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      ["fitness", "General fitness", TrendingUp],
                      ["race", "A race", Target],
                      ["endurance", "Endurance", Mountain],
                      ["speed", "Getting faster", Gauge],
                    ] as const
                  ).map(([value, label, Icon]) => (
                    <IconCard
                      key={value}
                      selected={focus === value}
                      onClick={() => setFocus(value)}
                      label={label}
                      icon={<Icon className="size-5" />}
                    />
                  ))}
                </div>
              </Step>
            )}

            {step === 3 && (
              <Step eyebrow="Your coach" title="How do you like to be coached?">
                <div className="space-y-3">
                  {(
                    [
                      ["calm", "Calm & steady", "Measured, reassuring, never pushy."],
                      ["tough", "Honest & direct", "Straight talk when you need it."],
                      ["data", "Data-driven", "Precise cues grounded in the numbers."],
                    ] as const
                  ).map(([value, label, desc]) => (
                    <SelectCard
                      key={value}
                      selected={motivation === value}
                      onClick={() => setMotivation(value)}
                      title={label}
                      desc={desc}
                    />
                  ))}
                </div>
              </Step>
            )}

            {step === 4 && (
              <Step eyebrow="Your goal" title="How far do you want to run each week?">
                <div className="grid grid-cols-2 gap-3">
                  {[15, 25, 35, 50].map((km) => (
                    <IconCard
                      key={km}
                      selected={weeklyKm === km}
                      onClick={() => setWeeklyKm(km)}
                      label={`${km} km`}
                      icon={<span className="text-lg font-semibold tabular-nums">{km}</span>}
                    />
                  ))}
                </div>
              </Step>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="mx-auto w-full max-w-sm">
        <Button
          size="lg"
          className="w-full"
          onClick={next}
          disabled={!canAdvance || saving}
        >
          {saving ? (
            <Loader2 className="animate-spin" />
          ) : step === TOTAL_STEPS - 1 ? (
            <>
              <Sparkles className="size-4" />
              Enter Avenir
            </>
          ) : (
            <>
              Continue
              <ArrowRight />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function Step({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-accent">{eyebrow}</p>
      <h1 className="mt-2 mb-6 text-2xl font-semibold leading-tight tracking-tight">
        {title}
      </h1>
      {children}
    </div>
  );
}

function SelectCard({
  selected,
  onClick,
  title,
  desc,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  desc: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-colors",
        selected ? "border-accent/40 bg-accent-wash" : "border-border bg-card/60"
      )}
    >
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
        )}
      >
        {selected && <Check className="size-4" strokeWidth={3} />}
      </span>
    </motion.button>
  );
}

function IconCard({
  selected,
  onClick,
  label,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl border p-5 transition-colors",
        selected
          ? "border-accent/40 bg-accent-wash text-foreground"
          : "border-border bg-card/60 text-muted-foreground"
      )}
    >
      <span className={cn(selected ? "text-accent" : "text-muted-foreground")}>
        {icon}
      </span>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </motion.button>
  );
}
