"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { Chip, CoachMessage } from "@/components/ds/atoms";
import { Input } from "@/components/ui/input";

interface Turn {
  id: number;
  from: "coach" | "runner";
  text: string;
}

/* The silent path: the coach still answers, without anyone having to type. */
const OPENERS = [
  "I can't run today",
  "Something hurts",
  "How's my week going?",
  "Make tomorrow easier",
];

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
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [turns, thinking]);

  async function send(message: string) {
    const text = message.trim();
    if (!text || thinking) return;

    setDraft("");
    setNotice(null);
    setTurns((t) => [...t, { id: Date.now(), from: "runner", text }]);
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

      const data = (await res.json()) as { reply?: string | null; error?: string };

      if (data.reply) {
        setTurns((t) => [
          ...t,
          { id: Date.now() + 1, from: "coach", text: data.reply as string },
        ]);
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

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        {turns.map((turn) => (
          <CoachMessage key={turn.id} from={turn.from}>
            {turn.text}
          </CoachMessage>
        ))}
        {thinking && (
          <div className="t-label flex items-center gap-2 self-start">
            <Loader2 className="size-3 animate-spin" />
            Thinking
          </div>
        )}
        <div ref={endRef} />
      </div>

      {notice && <p className="t-body text-attention-ink">{notice}</p>}

      <div className="flex flex-wrap gap-2">
        {OPENERS.map((o) => (
          <Chip key={o} onClick={() => send(o)}>
            {o}
          </Chip>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
        className="flex items-center gap-2"
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Tell me anything…"
          aria-label="Message your coach"
        />
        <button
          type="submit"
          disabled={!draft.trim() || thinking}
          aria-label="Send"
          className="flex size-[50px] shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-[filter] duration-[90ms] active:brightness-110 disabled:bg-secondary disabled:text-foreground/30"
        >
          <ArrowUp className="size-5" />
        </button>
      </form>
    </div>
  );
}
