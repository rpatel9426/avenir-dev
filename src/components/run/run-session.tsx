"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRunSession } from "@/hooks/use-run-session";
import {
  useSpeechRecognition,
  useSpeechSynthesis,
} from "@/hooks/use-speech";
import { LiveRun } from "@/components/run/live-run";
import { RunSummary } from "@/components/run/run-summary";
import type { Workout } from "@/lib/workouts";
import type { RunContext } from "@/lib/ai/responder";

/**
 * Owns a single live run for the given workout. Auto-starts on mount (it's
 * rendered only once the runner has pressed Start), coordinates voice — the
 * coach speaks its lines aloud, and in hands-free mode the runner can just talk
 * (through their AirPods) without touching the phone — then swaps to the summary
 * when the run finishes. Keyed by workout id upstream so each run is fresh.
 */
export function RunSession({
  workout,
  premium,
}: {
  workout: Workout;
  premium: boolean;
}) {
  const session = useRunSession(workout);
  const { status, start, reset, cues, metrics, gps, pushRunner, pushCoach } =
    session;

  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [handsFree, setHandsFree] = useState(false);
  const [thinking, setThinking] = useState(false);

  const { supported: ttsSupported, speaking, speak, cancel } =
    useSpeechSynthesis();

  const lastSpokenId = useRef<number>(0);
  const metricsRef = useRef(metrics);

  // Keep the ref pointing at the latest metrics so the voice handler reads
  // current values without re-subscribing on every tick.
  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);

  useEffect(() => {
    start();
  }, [start]);

  // Speak each new coach line once, when voice is on.
  useEffect(() => {
    const latestCoach = cues.find((c) => c.role === "coach");
    if (!latestCoach) return;
    if (latestCoach.id === lastSpokenId.current) return;
    lastSpokenId.current = latestCoach.id;
    if (voiceEnabled && ttsSupported) speak(latestCoach.message);
  }, [cues, voiceEnabled, ttsSupported, speak]);

  // Handle the runner speaking: show it, ask the coach, speak the reply.
  const handleTranscript = useCallback(
    async (transcript: string) => {
      const m = metricsRef.current;
      pushRunner(transcript);
      setThinking(true);
      const context: RunContext = {
        goal: workout.id,
        elapsed: m.elapsed,
        distanceKm: m.distance / 1000,
        currentPace: m.currentPace,
        targetPace: workout.targetPace,
        // Zero means "not measured" — the responder skips those cues.
        heartRate: m.heartRate ?? 0,
        cadence: m.cadence ?? 0,
      };
      try {
        const res = await fetch("/api/coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: transcript, context }),
        });
        const data = (await res.json()) as { reply?: string };
        if (data.reply) pushCoach(data.reply);
      } catch {
        pushCoach("I'm still here with you. Keep your rhythm smooth and breathing easy.");
      } finally {
        setThinking(false);
      }
    },
    [workout, pushRunner, pushCoach]
  );

  const {
    supported: micSupported,
    listening,
    start: startListening,
    stop: stopListening,
    pause: pauseListening,
    resume: resumeListening,
  } = useSpeechRecognition(handleTranscript, { continuous: true });

  // While the coach is speaking, pause the mic so it never hears itself.
  useEffect(() => {
    if (!handsFree) return;
    if (speaking) pauseListening();
    else resumeListening();
  }, [speaking, handsFree, pauseListening, resumeListening]);

  const toggleHandsFree = useCallback(() => {
    setHandsFree((on) => {
      if (on) {
        stopListening();
        return false;
      }
      startListening();
      return true;
    });
  }, [startListening, stopListening]);

  const toggleVoice = useCallback(() => {
    setVoiceEnabled((v) => {
      if (v) cancel();
      return !v;
    });
  }, [cancel]);

  if (status === "finished") {
    return (
      <RunSummary
        workout={workout}
        metrics={metrics}
        onRunAgain={() => {
          lastSpokenId.current = 0;
          reset();
          start();
        }}
      />
    );
  }

  return (
    <LiveRun
      workout={workout}
      metrics={metrics}
      cues={cues}
      status={status}
      gps={gps}
      voiceEnabled={voiceEnabled}
      onToggleVoice={toggleVoice}
      speaking={speaking}
      premium={premium}
      handsFree={handsFree}
      onToggleHandsFree={toggleHandsFree}
      listening={listening}
      thinking={thinking}
      micSupported={micSupported}
      onPause={session.pause}
      onResume={session.resume}
      onFinish={session.finish}
    />
  );
}
