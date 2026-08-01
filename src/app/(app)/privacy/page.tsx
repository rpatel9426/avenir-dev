"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteMyData, exportMyData } from "@/app/(app)/privacy/actions";

/**
 * What data I use, and what I don't.
 *
 * Export is the primary action and deletion is one tap away, unhidden. The
 * consequence is stated in the coach's own terms rather than as a legal
 * notice — which is more honest, and more persuasive about exporting first.
 */
export default function PrivacyPage() {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");

  const onExport = async () => {
    setBusy(true);
    setNote(null);
    const data = await exportMyData();
    setBusy(false);

    if ("error" in data) {
      setNote(data.error);
      return;
    }

    // Handed straight to the runner as a file — nothing leaves for a server.
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "avenir-my-data.json";
    a.click();
    URL.revokeObjectURL(url);
    setNote("Downloaded. That's everything I hold.");
  };

  const onDelete = async () => {
    setBusy(true);
    const res = await deleteMyData();
    setBusy(false);
    setConfirming(false);
    setTyped("");
    setNote(res.message);
  };

  return (
    <div className="flex min-h-[calc(100dvh-11rem)] flex-col gap-4">
      <Link href="/about-you" className="text-[15px] text-muted-foreground">
        ‹ What I know
      </Link>

      <h1 className="t-voice text-pretty">What I use, and what I don&apos;t</h1>

      <div className="flex flex-col">
        <DataRow label="Your runs" value="Distance, time, pace, heart rate" used />
        <DataRow label="What you tell me" value="Effort, pain reports, corrections" used />
        <DataRow label="Your goal and week" value="Shapes every session I write" used />
        <DataRow label="Location history" value="Never stored" />
        <DataRow label="Your contacts" value="Never read" />
        <DataRow label="Anything sold to advertisers" value="Never. Not ever." last />
      </div>

      <p className="t-body text-muted-foreground">
        The coaching model sees your training, not your identity. Voice replies
        are generated from the run in front of you and what you&apos;ve told me.
      </p>

      <div className="mt-auto flex flex-col gap-2.5 pb-2">
        <button
          type="button"
          onClick={onExport}
          disabled={busy}
          className="h-14 rounded-full bg-primary text-[15px] font-bold text-primary-foreground disabled:opacity-60"
        >
          Export everything
        </button>

        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="h-13 rounded-full bg-secondary text-[13.5px] font-semibold text-foreground/70"
          >
            Delete my runs and what you&apos;ve learned
          </button>
        ) : (
          <div className="flex flex-col gap-2.5 rounded-[18px] bg-attention-wash p-[18px]">
            <p className="text-[13.5px] leading-[1.55] text-pretty">
              Every run goes, and I&apos;ll be a stranger again — I won&apos;t
              know your pace, your patterns or your history. Export first if
              you might want it back. Type <b>DELETE</b> to confirm.
            </p>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              aria-label="Type DELETE to confirm"
              className="h-12 rounded-full border border-transparent bg-card px-5 text-sm focus-visible:border-[1.5px] focus-visible:border-accent focus-visible:outline-none"
            />
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setConfirming(false);
                  setTyped("");
                }}
                className="h-12 flex-1 rounded-full bg-secondary text-[13px] font-semibold"
              >
                Keep it all
              </button>
              <button
                type="button"
                onClick={onDelete}
                disabled={typed !== "DELETE" || busy}
                className="h-12 flex-1 rounded-full bg-attention-ink text-[13px] font-semibold text-white disabled:opacity-40"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {note && <p className="t-body text-center text-muted-foreground">{note}</p>}
      </div>
    </div>
  );
}

function DataRow({
  label,
  value,
  used = false,
  last = false,
}: {
  label: string;
  value: string;
  used?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 border-t border-border py-3.5 ${
        last ? "border-b" : ""
      }`}
    >
      <span className="text-[13.5px] font-semibold">{label}</span>
      <span
        className={`text-right text-[12.5px] ${
          used ? "text-muted-foreground" : "font-semibold text-attention-ink"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
