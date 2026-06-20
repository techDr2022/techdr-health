import { AlertTriangle } from "lucide-react";
import type { DrugValidationResult } from "@/lib/drug-restrictions";
import { cn } from "@/lib/utils";

type DrugRestrictionWarningsProps = {
  warnings: DrugValidationResult[];
  className?: string;
  title?: string;
};

export function DrugRestrictionWarnings({
  warnings,
  className,
  title = "Telemedicine prescribing restrictions (TPG 2020)",
}: DrugRestrictionWarningsProps) {
  if (warnings.length === 0) return null;

  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs text-amber-950",
        className
      )}
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden />
        <div className="space-y-2">
          <p className="font-semibold">{title}</p>
          <ul className="list-inside list-disc space-y-1 leading-relaxed">
            {warnings.map((warning) => (
              <li key={`${warning.drugName}-${warning.schedule}`}>
                <span className="font-medium">{warning.drugName}</span>
                {warning.schedule ? ` (Schedule ${warning.schedule})` : null}
                {warning.reason ? ` — ${warning.reason}` : null}
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-amber-800">
            Remove or replace flagged medicines before sending. AI suggestions require physician review.
          </p>
        </div>
      </div>
    </div>
  );
}
