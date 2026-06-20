"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "techdr-ai-cross-border-ack";

type AiCrossBorderNoticeProps = {
  className?: string;
  onAcknowledgedChange?: (acknowledged: boolean) => void;
};

export function AiCrossBorderNotice({ className, onAcknowledgedChange }: AiCrossBorderNoticeProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) === "1";
      setAcknowledged(stored);
      onAcknowledgedChange?.(stored);
    } catch {
      // ignore
    }
  }, [onAcknowledgedChange]);

  function handleChange(checked: boolean) {
    setAcknowledged(checked);
    onAcknowledgedChange?.(checked);
    try {
      if (checked) localStorage.setItem(STORAGE_KEY, "1");
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-950",
        className
      )}
      role="note"
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden />
        <p className="leading-relaxed">
          Your data may be processed by Anthropic (USA) for this AI feature. This is a navigation
          aid only — not a medical diagnosis. See our{" "}
          <a href="/privacy-policy" className="font-semibold underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
      <label className="mt-2 flex cursor-pointer items-center gap-2">
        <Checkbox
          checked={acknowledged}
          onCheckedChange={(value) => handleChange(value === true)}
          aria-label="Acknowledge cross-border AI data processing"
        />
        <span>I understand and wish to continue</span>
      </label>
    </div>
  );
}

export function useAiCrossBorderAcknowledged() {
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    try {
      setAcknowledged(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setAcknowledged(false);
    }
  }, []);

  return acknowledged;
}
