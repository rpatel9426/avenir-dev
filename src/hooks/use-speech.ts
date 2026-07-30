"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ------------------------------------------------------------------ *
 * Text-to-speech — the coach's voice.
 * Uses the browser's built-in SpeechSynthesis (no external service, works
 * offline, supported on iOS Safari + Chrome). We pick the most natural English
 * voice available and speak short, calm phrases.
 * ------------------------------------------------------------------ */

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  const en = voices.filter((v) => v.lang?.toLowerCase().startsWith("en"));
  const pool = en.length > 0 ? en : voices;
  // Prefer known-natural voices, then any local en voice.
  const preferred = [
    "samantha",
    "google us english",
    "microsoft aria",
    "microsoft jenny",
    "daniel",
    "karen",
  ];
  for (const name of preferred) {
    const match = pool.find((v) => v.name.toLowerCase().includes(name));
    if (match) return match;
  }
  return pool.find((v) => v.localService) ?? pool[0];
}

export function useSpeechSynthesis() {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    // Client-only feature detection — must run after mount to stay SSR-safe.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(true);

    const load = () => {
      voiceRef.current = pickVoice(window.speechSynthesis.getVoices());
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      // Interrupt any in-flight line so coaching always feels current.
      window.speechSynthesis.cancel();

      const u = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) u.voice = voiceRef.current;
      u.rate = 1.0;
      u.pitch = 1.0;
      u.volume = 1.0;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    },
    []
  );

  const cancel = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { supported, speaking, speak, cancel };
}

/* ------------------------------------------------------------------ *
 * Speech recognition — the runner talking back, hands-free.
 * Uses the Web Speech API (webkitSpeechRecognition), which listens on the
 * system's *active* audio input — so when AirPods (or any Bluetooth headset)
 * are connected, the runner simply speaks and we hear them through the buds,
 * no need to hold or tap the phone.
 *
 * Hands-free mode listens continuously and auto-restarts when the browser ends
 * a segment. While the coach is speaking we `pause()` recognition so it never
 * hears its own voice, then `resume()` once it's done.
 * ------------------------------------------------------------------ */

type RecognitionResult = { transcript: string; confidence: number };
type RecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<ArrayLike<RecognitionResult> & { isFinal: boolean }>;
};
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: RecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
};

export function useSpeechRecognition(
  onFinal: (transcript: string) => void,
  opts?: { continuous?: boolean }
) {
  const continuous = opts?.continuous ?? false;
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);

  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const onFinalRef = useRef(onFinal);
  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  // keepAlive: we want to be listening. paused: temporarily muted (coach talking).
  const keepAlive = useRef(false);
  const paused = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const Ctor =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike })
        .SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike })
        .webkitSpeechRecognition;
    if (!Ctor) return;

    // Client-only feature detection — must run after mount to stay SSR-safe.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(true);
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.continuous = continuous;

    rec.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) {
          const transcript = result[0]?.transcript?.trim();
          if (transcript) onFinalRef.current(transcript);
        }
      }
    };
    rec.onend = () => {
      setListening(false);
      // Auto-restart in hands-free mode unless we're intentionally paused/stopped.
      if (keepAlive.current && !paused.current) {
        try {
          rec.start();
          setListening(true);
        } catch {
          /* already starting */
        }
      }
    };
    rec.onerror = (e) => {
      setListening(false);
      // A denied mic permission should not loop forever.
      if (e?.error === "not-allowed" || e?.error === "service-not-allowed") {
        keepAlive.current = false;
      }
    };
    recRef.current = rec;

    return () => {
      keepAlive.current = false;
      try {
        rec.abort();
      } catch {
        /* noop */
      }
    };
  }, [continuous]);

  const start = useCallback(() => {
    if (!recRef.current) return;
    keepAlive.current = continuous;
    paused.current = false;
    try {
      recRef.current.start();
      setListening(true);
    } catch {
      /* start() throws if already running; ignore. */
    }
  }, [continuous]);

  const stop = useCallback(() => {
    keepAlive.current = false;
    paused.current = false;
    recRef.current?.stop();
    setListening(false);
  }, []);

  /** Temporarily stop listening (e.g. while the coach speaks). */
  const pause = useCallback(() => {
    if (!keepAlive.current) return;
    paused.current = true;
    recRef.current?.stop();
  }, []);

  /** Resume after a pause. */
  const resume = useCallback(() => {
    if (!keepAlive.current || !paused.current) return;
    paused.current = false;
    try {
      recRef.current?.start();
      setListening(true);
    } catch {
      /* onend will restart */
    }
  }, []);

  return { supported, listening, start, stop, pause, resume };
}
