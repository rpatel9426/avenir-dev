"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mic } from "lucide-react";
import { Chip, CoachMessage, PlanDiff } from "@/components/ds/atoms";
import { proposeChange, type PlanChange } from "@/lib/plan-change";
import { applyPlanChange, revertPlanChange } from "@/app/(app)/coach/actions";

interface Turn {
  id: number;
  from: "coach" | "runner";
  text: string;
}

interface DiffTurn {
  id: number;
  afterTurn: number;
  change: PlanChange;
  status: "pending" | "accepted" | "declined";
  /** What the session was before, so Undo restores it exactly. */
  previous?: { kind: string; detail: string | null; tag: string | null };
}

/* Two openers, as drawn — the ones a runner actually reaches for. */
const CHIPS = ["Move tomorrow", "Am I on track?"];

/*
 * Any report of pain enters triage and the coach may not prescribe through it.
 * Catching it here matters because this is where a runner would naturally type
 * it, and a generative reply is exactly the dangerous thing.
 */
const PAIN =
  /\b(hurt|hurts|hurting|pain|painful|injur|sore|strain|sprain|tear|torn|ache|aching|niggl|shin split|tendon|tendinitis|plantar)\b/i;

export function CoachConversation({
  opener,
  goal,
  targetPace,
}: {
  opener: string;
  goal: string;
  targetPace: number;
  runnerName: string;
}) {
  const [turns, setTurns] = useState<Turn[]>([
    { id: 0, from: "coach", text: opener },
  ]);
  const [diffs, setDiffs] = useState<DiffTurn[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  // A monotonic counter rather than a clock: ids only need to be unique.
  const nextId = useRef(1);
  const router = useRouter();

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [turns, diffs, thinking]);

  async function send(message: string) {
    const text = message.trim();
    if (!text || thinking) return;

    const turnId = nextId.current;
    nextId.current += 3;
    setDraft("");
    setNotice(null);
    setTurns((t) => [...t, { id: turnId, from: "runner", text }]);

    // Pain never reaches the model. Triage first, always.
    if (PAIN.test(text)) {
      setTurns((t) => [
        ...t,
        {
          id: turnId + 1,
          from: "coach",
          text: "Stop there — I'm not going to give you a plan until I understand this. Four questions.",
        },
      ]);
      router.push("/triage");
      return;
    }

    setThinking(true);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          // Off the run there is no live telemetry, so the context describes
          // the session being discussed rather than one in progress.
          context: {
            goal,
            elapsed: 0,
            distanceKm: 0,
            currentPace: targetPace,
            targetPace,
            heartRate: 0,
            cadence: 0,
          },
        }),
      });

      const data = (await res.json()) as { reply?: string | null };

      if (data.reply) {
        setTurns((t) => [
          ...t,
          { id: turnId + 1, from: "coach", text: data.reply as string },
        ]);

        // Chat that *does things*: a consequential reply lands as a change the
        // runner can accept in one tap, not advice to re-enter somewhere else.
        const change = proposeChange(text);
        if (change) {
          setDiffs((d) => [
            ...d,
            { id: turnId + 2, afterTurn: turnId + 1, change, status: "pending" },
          ]);
        }
      } else {
        // Problems are said in words and given an action — never a red banner.
        setNotice(
          res.status === 402
            ? "Talking to me is part of the full plan. Everything else stays yours."
            : "I didn't catch that one. Try again in a moment."
        );
      }
    } catch {
      setNotice("I can't reach you right now. Your message is still here.");
    } finally {
      setThinking(false);
    }
  }

  /** Accept writes the session; undo puts back exactly what was there. */
  async function accept(diff: DiffTurn) {
    setDiffs((d) =>
      d.map((x) => (x.id === diff.id ? { ...x, status: "accepted" } : x))
    );
    const res = await applyPlanChange(
      diff.change.weekdayOffset,
      diff.change.kind,
      diff.change.detail
    );
    if (res.previous) {
      setDiffs((d) =>
        d.map((x) => (x.id === diff.id ? { ...x, previous: res.previous } : x))
      );
    }
  }

  async function decline(diff: DiffTurn) {
    if (diff.status === "accepted") {
      setDiffs((d) =>
        d.map((x) => (x.id === diff.id ? { ...x, status: "pending" } : x))
      );
      if (diff.previous) {
        await revertPlanChange(diff.change.weekdayOffset, diff.previous);
      }
      return;
    }
    setDiffs((d) =>
      d.map((x) => (x.id === diff.id ? { ...x, status: "declined" } : x))
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-13rem)] flex-col">
      <div className="flex flex-1 flex-col gap-[14px] pb-2">
        {turns.map((turn) => (
          <div key={turn.id} className="flex flex-col gap-[14px]">
            <CoachMessage from={turn.from}>{turn.text}</CoachMessage>
            {diffs
              .filter((d) => d.afterTurn === turn.id)
              .map((d) => (
                <PlanDiff
                  key={d.id}
                  before={d.change.before}
                  after={d.change.after}
                  status={d.status}
                  onAccept={() => accept(d)}
                  onDecline={() => decline(d)}
                />
              ))}
          </div>
        ))}
        {thinking && (
          <div className="t-label flex items-center gap-2 self-start">
            <Loader2 className="size-3 animate-spin" />
            Thinking
          </div>
        )}
        {notice && <p className="t-body self-start text-attention-ink">{notice}</p>}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-[4.5rem] flex flex-col gap-2.5 bg-background pt-2">
        <div className="flex flex-wrap gap-2">
          {CHIPS.map((chip) => (
            <Chip key={chip} onClick={() => send(chip)}>
              {chip}
            </Chip>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
          className="flex items-center gap-2.5"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Tell me anything…"
            aria-label="Message your coach"
            className="h-[50px] flex-1 rounded-full border border-transparent bg-muted px-5 text-sm text-foreground placeholder:text-tint-strong focus-visible:border-[1.5px] focus-visible:border-accent focus-visible:bg-card focus-visible:outline-none"
          />
          <button
            type="submit"
            disabled={thinking}
            aria-label={draft.trim() ? "Send" : "Talk to your coach"}
            className="flex size-[50px] shrink-0 items-center justify-center rounded-full bg-accent-wash text-accent disabled:opacity-50"
          >
            <Mic className="size-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
