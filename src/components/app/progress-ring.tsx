"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * An animated circular progress ring. Used for weekly goals and run summaries.
 * `value` is 0–1. Colour follows `currentColor` on the wrapper unless overridden.
 */
export function ProgressRing({
  value,
  size = 132,
  stroke = 10,
  children,
  trackClassName = "text-secondary",
  progressClassName = "text-primary",
}: {
  value: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
  trackClassName?: string;
  progressClassName?: string;
}) {
  const clamped = Math.max(0, Math.min(1, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className={trackClassName}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          className={progressClassName}
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - clamped) }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
