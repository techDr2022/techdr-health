"use client";

import { useEffect, useRef, useState } from "react";

export function useConsultTimer(durationMinutes: number, onTimeUp?: () => void) {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalSeconds = durationMinutes * 60;
  const remaining = Math.max(0, totalSeconds - elapsed);
  const percentage = totalSeconds > 0 ? Math.min(100, (elapsed / totalSeconds) * 100) : 0;

  const format = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const start = () => {
    if (intervalRef.current) return;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        if (prev + 1 >= totalSeconds) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsRunning(false);
          onTimeUp?.();
          return totalSeconds;
        }
        return prev + 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    elapsed,
    remaining,
    percentage,
    isRunning,
    start,
    elapsedFormatted: format(elapsed),
    remainingFormatted: format(remaining),
    totalFormatted: format(totalSeconds),
    isWarning: remaining <= 180,
    isCritical: remaining <= 60,
  };
}
