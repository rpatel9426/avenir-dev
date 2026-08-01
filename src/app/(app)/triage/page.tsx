"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DURATIONS,
  QUESTIONS,
  REMAINING_LABELS,
  SITES,
  isComplete,
  outcomeFor,
  pauseDaysFor,
  type Outcome,
  type TriageAnswers,
} from "@/lib/triage";
import { pausePlan } from "@/app/(app)/triage/actions";

/**
 * Something hurts.
 *
 * Note what's absent from every screen in this flow: no "start run", no plan,
 * no reassurance until the coach has the answers. The coach explicitly
 * suspends prescribing, and on the third outcome it names its own limit —
 * the most credible thing an AI coach can say.
 */
export default function TriagePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<TriageAnswers>({
    site: null,
    duration: null,
    changesGait: null,
    hurtsAtRest: null,
  });
  const [done, setDone] = useState(false);

  const canAdvance = [
    answers.site,
    answers.duration,
    answers.changesGait,
    answers.hurtsAtRest,
  ][step];

  const finish = async () => {
    const outcome = outcomeFor(answers);
    setDone(true);
    // The pause has to be real before the screen claims it.
    await pausePlan(pauseDaysFor(outcome)).catch(() => {});
  };

  const next = () => (step < 3 ? setStep((s) => s + 1) : finish());

  if (done && isComplete(answers)) {
    return <OutcomeScreen outcome={outcomeFor(answers)} answers={answers} />;
  }

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col gap-[18px]">
      <div className="t-label text-attention-ink">
        Something hurts · {step + 1} of 4
      </div>

      <h1 className="t-voice text-pretty">{QUESTIONS[step]}</h1>

      {step === 0 && (
        <p className="text-[13.5px] leading-[1.55] text-tint-strong text-pretty">
          I&apos;m not going to give you a plan until I understand this. Four
          questions.
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {step === 0 &&
          SITES.map((s) => (
            <Option
              key={s}
              label={s}
              selected={answers.site === s}
              onClick={() => setAnswers({ ...answers, site: s })}
            />
          ))}
        {step === 1 &&
          DURATIONS.map((d) => (
            <Option
              key={d.id}
              label={d.label}
              selected={answers.duration === d.id}
              onClick={() => setAnswers({ ...answers, duration: d.id })}
            />
          ))}
        {step === 2 &&
          (["yes", "no"] as const).map((v) => (
            <Option
              key={v}
              label={v === "yes" ? "Yes, I'm favouring it" : "No, I run normally"}
              selected={answers.changesGait === v}
              onClick={() => setAnswers({ ...answers, changesGait: v })}
            />
          ))}
        {step === 3 &&
          (["yes", "no"] as const).map((v) => (
            <Option
              key={v}
              label={v === "yes" ? "Yes, even sitting down" : "No, only when I run"}
              selected={answers.hurtsAtRest === v}
              onClick={() => setAnswers({ ...answers, hurtsAtRest: v })}
            />
          ))}
      </div>

      {step < 3 && (
        <div className="mt-0.5 flex flex-col gap-[9px]">
          <div className="t-label tracking-[0.12em]">Still to ask</div>
          {REMAINING_LABELS.slice(step).map((label) => (
            <div
              key={label}
              className="flex items-center gap-2.5 text-[13px] font-medium text-muted-foreground"
            >
              <span className="size-3.5 shrink-0 rounded-full border-[1.5px] border-foreground/20" />
              {label}
            </div>
          ))}
        </div>
      )}

      <div className="mt-auto flex flex-col gap-[11px] pb-6">
        <button
          type="button"
          onClick={next}
          disabled={!canAdvance}
          className="h-14 rounded-full bg-primary text-[15px] font-bold text-primary-foreground disabled:bg-secondary disabled:text-foreground/30"
        >
          {step < 3 ? "Next" : "That's everything"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/coach")}
          className="text-center text-[12.5px] font-medium text-muted-foreground"
        >
          Describe it in my own words
        </button>
      </div>
    </div>
  );
}

function Option({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        selected
          ? "rounded-[20px] border-[1.5px] border-accent/40 bg-accent-wash px-4 py-3 text-[12.5px] font-bold text-accent"
          : "rounded-[20px] border-[1.5px] border-transparent bg-card px-4 py-3 text-[12.5px] font-medium"
      }
    >
      {label}
    </button>
  );
}

const COPY: Record<
  Outcome,
  { eyebrow: string; headline: string; body: string; pausedFor: string }
> = {
  keep: {
    eyebrow: "What I'd do · outcome 1 of 3",
    headline: "That sounds like a niggle, not an injury.",
    body: "New, no limp, and quiet when you sit down. We keep training, but we take the edge off this week and I'll ask again after your next run.",
    pausedFor: "",
  },
  reassess: {
    eyebrow: "What I'd do · outcome 2 of 3",
    headline: "Let's stop and look at this again in 48 hours.",
    body: "One thing here concerns me, and running through it is how a niggle becomes six weeks off. Two days changes almost nothing in your training and quite a lot in your odds.",
    pausedFor: "48 hours",
  },
  professional: {
    eyebrow: "What I'd do · outcome 3 of 3",
    headline: "This is past what I should advise on.",
    body: "I'm a coach, not a clinician — that combination needs someone who can put hands on it.",
    pausedFor: "two weeks",
  },
};

function OutcomeScreen({
  outcome,
  answers,
}: {
  outcome: Outcome;
  answers: TriageAnswers;
}) {
  const copy = COPY[outcome];
  const site = (answers.site ?? "it").toLowerCase();

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col gap-[18px]">
      <div className="t-label text-attention-ink">{copy.eyebrow}</div>
      <h1 className="t-voice text-pretty">{copy.headline}</h1>
      <p className="text-[15px] leading-[1.55] text-foreground/72 text-pretty">
        {copy.body}
      </p>

      {outcome !== "keep" && (
        <div className="flex flex-col gap-[9px] rounded-[18px] bg-attention-wash p-[18px]">
          <div className="t-label tracking-[0.12em] text-attention-ink">
            Your plan is paused
          </div>
          <p className="text-[13.5px] leading-[1.55] text-foreground/70 text-pretty">
            Nothing is scheduled and nothing is counting against you for the
            next {copy.pausedFor}. There&apos;s room for this without losing
            the goal.
          </p>
        </div>
      )}

      <div className="flex flex-col">
        <AdviceRow label="Walking" value="Fine, if painless" />
        <AdviceRow
          label="Cycling / swimming"
          value={outcome === "professional" ? "Ask them first" : "Good substitutes"}
        />
        <AdviceRow
          label="Running"
          value={outcome === "keep" ? "Easy only, this week" : "Not yet"}
          attention={outcome !== "keep"}
          last
        />
      </div>

      {/* No "start run" control exists on this route, by design. */}
      <div className="mt-auto flex flex-col gap-[11px] pb-6">
        {outcome === "professional" ? (
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(
              `sports physiotherapist near me ${site} pain`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 items-center justify-center rounded-full bg-primary text-[14.5px] font-bold text-primary-foreground"
          >
            Find a physio near me
          </a>
        ) : (
          <Link
            href="/coach"
            className="flex h-14 items-center justify-center rounded-full bg-primary text-[14.5px] font-bold text-primary-foreground"
          >
            Talk to me about it
          </Link>
        )}
        <Link
          href="/dashboard"
          className="flex h-13 items-center justify-center rounded-full bg-secondary text-[13.5px] font-semibold text-foreground/70"
        >
          {outcome === "keep" ? "Back to today" : "Remind me to check in"}
        </Link>
      </div>
    </div>
  );
}

function AdviceRow({
  label,
  value,
  attention = false,
  last = false,
}: {
  label: string;
  value: string;
  attention?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between border-t border-border py-3.5 ${
        last ? "border-b" : ""
      }`}
    >
      <span className="text-[13.5px] font-medium text-foreground/72">{label}</span>
      <span
        className={`text-[13px] ${
          attention ? "font-semibold text-attention-ink" : "font-medium text-muted-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
