import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  languages: string[];
  max?: number;
  variant?: "inline" | "compact" | "profile";
  className?: string;
};

const HIGHLIGHT_STYLES = [
  "border-sky-300 bg-sky-100 text-sky-900",
  "border-emerald-300 bg-emerald-100 text-emerald-900",
  "border-violet-300 bg-violet-100 text-violet-900",
  "border-amber-300 bg-amber-100 text-amber-900",
  "border-rose-300 bg-rose-100 text-rose-900",
  "border-cyan-300 bg-cyan-100 text-cyan-900",
] as const;

function LanguagePills({
  languages,
  max,
  size = "sm",
}: {
  languages: string[];
  max?: number;
  size?: "sm" | "md";
}) {
  const shown = max ? languages.slice(0, max) : languages;
  const extra = max && languages.length > max ? languages.length - max : 0;

  const pillBase =
    size === "md"
      ? "rounded-lg border px-3 py-1.5 text-sm font-bold shadow-sm"
      : "rounded-md border px-2 py-0.5 text-[11px] font-bold shadow-sm";

  const pipeClass =
    size === "md"
      ? "px-1.5 text-base font-medium text-slate-400"
      : "px-1 text-[11px] font-medium text-slate-400";

  return (
    <span className="inline-flex flex-wrap items-center gap-y-1.5">
      {shown.map((language, index) => (
        <span key={`${language}-${index}`} className="inline-flex items-center">
          {index > 0 ? <span className={pipeClass} aria-hidden>|</span> : null}
          <span
            className={cn(
              pillBase,
              HIGHLIGHT_STYLES[index % HIGHLIGHT_STYLES.length]
            )}
          >
            {language}
          </span>
        </span>
      ))}
      {extra > 0 ? (
        <span className="inline-flex items-center">
          <span className={pipeClass} aria-hidden>|</span>
          <span
            className={cn(
              pillBase,
              "border-slate-300 bg-slate-100 text-slate-700"
            )}
          >
            +{extra}
          </span>
        </span>
      ) : null}
    </span>
  );
}

export function DoctorLanguages({
  languages,
  max,
  variant = "inline",
  className,
}: Props) {
  if (!languages.length) return null;

  if (variant === "profile") {
    return (
      <div className={cn("flex items-start gap-3.5", className)}>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Languages className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 pt-0.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Languages spoken
          </p>
          <div className="mt-3">
            <LanguagePills languages={languages} size="md" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <span className={cn("inline-flex flex-wrap items-center gap-1", className)}>
        <Languages className="h-3 w-3 shrink-0 text-slate-500" aria-hidden />
        <LanguagePills languages={languages} max={max} size="sm" />
      </span>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <Languages className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
      <LanguagePills languages={languages} max={max} size="sm" />
    </div>
  );
}
