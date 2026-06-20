"use client";

import { cn } from "@/lib/utils";
import {
  AppLanguage,
  LANGUAGE_OPTIONS,
  storeLanguage,
} from "@/lib/i18n";

type LanguageSelectorProps = {
  value: AppLanguage;
  onChange: (language: AppLanguage) => void;
  className?: string;
  compact?: boolean;
};

export function LanguageSelector({
  value,
  onChange,
  className,
  compact = false,
}: LanguageSelectorProps) {
  function handleSelect(code: AppLanguage) {
    storeLanguage(code);
    onChange(code);
    void fetch("/api/patient/preferred-lang", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: code }),
    }).catch(() => {
      // Guest users or logged-out sessions can still use localStorage.
    });
  }

  return (
    <div
      className={cn("inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5", className)}
      role="group"
      aria-label="Language"
    >
      {LANGUAGE_OPTIONS.map((option) => (
        <button
          key={option.code}
          type="button"
          onClick={() => handleSelect(option.code)}
          className={cn(
            "rounded-md px-2 py-1 text-xs font-semibold transition",
            value === option.code
              ? "bg-white text-emerald-700 shadow-sm"
              : "text-slate-600 hover:text-slate-900",
            compact ? "min-w-[2rem]" : "min-w-[2.25rem]"
          )}
          title={option.nativeLabel}
          aria-pressed={value === option.code}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
