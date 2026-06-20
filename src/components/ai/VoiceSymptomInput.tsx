"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import type { AppLanguage } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import {
  extractTranscript,
  getSpeechLocale,
  getSpeechRecognitionConstructor,
  isSpeechRecognitionSupported,
} from "@/lib/speech-recognition";
import { cn } from "@/lib/utils";

const SILENCE_MS = 2000;

type VoiceSymptomInputProps = {
  language: AppLanguage;
  onTranscript: (text: string, isFinal: boolean) => void;
  onSilenceSubmit?: (text: string) => void;
  disabled?: boolean;
  className?: string;
  minSubmitLength?: number;
};

export function VoiceSymptomInput({
  language,
  onTranscript,
  onSilenceSubmit,
  disabled = false,
  className,
  minSubmitLength = 3,
}: VoiceSymptomInputProps) {
  const [supported] = useState(() => isSpeechRecognitionSupported());
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<ReturnType<typeof createRecognition> | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const latestTextRef = useRef("");
  const buttonRef = useRef<HTMLButtonElement>(null);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current !== null) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const scheduleSilenceSubmit = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = window.setTimeout(() => {
      const text = latestTextRef.current.trim();
      if (text.length >= minSubmitLength) {
        onSilenceSubmit?.(text);
      }
      recognitionRef.current?.stop();
    }, SILENCE_MS);
  }, [clearSilenceTimer, minSubmitLength, onSilenceSubmit]);

  const stopListening = useCallback(() => {
    clearSilenceTimer();
    recognitionRef.current?.stop();
    setListening(false);
  }, [clearSilenceTimer]);

  const startListening = useCallback(() => {
    if (disabled) return;
    const Ctor = getSpeechRecognitionConstructor();
    if (!Ctor) return;

    clearSilenceTimer();
    latestTextRef.current = "";

    const recognition = createRecognition(Ctor, language);
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const { combined, finalText } = extractTranscript(event);
      latestTextRef.current = combined;
      onTranscript(combined, Boolean(finalText));
      scheduleSilenceSubmit();
    };

    recognition.onerror = () => {
      stopListening();
    };

    recognition.onend = () => {
      setListening(false);
      clearSilenceTimer();
    };

    try {
      recognition.start();
      setListening(true);
    } catch {
      stopListening();
    }
  }, [
    clearSilenceTimer,
    disabled,
    language,
    onTranscript,
    scheduleSilenceSubmit,
    stopListening,
  ]);

  const toggleListening = useCallback(() => {
    if (listening) {
      stopListening();
      return;
    }
    startListening();
  }, [listening, startListening, stopListening]);

  useEffect(() => {
    return () => {
      clearSilenceTimer();
      recognitionRef.current?.abort();
    };
  }, [clearSilenceTimer]);

  useEffect(() => {
    if (!listening) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.code !== "Space" || event.repeat) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (document.activeElement !== buttonRef.current) return;
      event.preventDefault();
      toggleListening();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [listening, toggleListening]);

  if (!supported) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        aria-pressed={listening}
        aria-label={listening ? t(language, "voiceStop") : t(language, "voiceStart")}
        className={cn(
          "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition",
          listening
            ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
            : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {listening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </button>

      {listening ? (
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <VoiceWaveform />
          <span className="truncate text-xs text-muted-foreground">{t(language, "voiceListening")}</span>
        </div>
      ) : null}
    </div>
  );
}

function createRecognition(
  Ctor: new () => import("@/lib/speech-recognition").BrowserSpeechRecognition,
  language: AppLanguage
) {
  const recognition = new Ctor();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = getSpeechLocale(language);
  return recognition;
}

function VoiceWaveform() {
  return (
    <div className="flex h-6 items-end gap-0.5" aria-hidden>
      {[0, 1, 2, 3, 4].map((bar) => (
        <span
          key={bar}
          className="voice-wave-bar w-1 rounded-full bg-emerald-500"
          style={{ animationDelay: `${bar * 0.12}s` }}
        />
      ))}
    </div>
  );
}
