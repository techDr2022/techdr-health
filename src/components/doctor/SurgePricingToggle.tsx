"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type SurgePricingToggleProps = {
  initialEnabled: boolean;
};

export function SurgePricingToggle({ initialEnabled }: SurgePricingToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);

  async function handleToggle(next: boolean) {
    setLoading(true);
    try {
      const response = await fetch("/api/doctor/surge-pricing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      const data = (await response.json()) as { error?: string; surgePricingEnabled?: boolean };
      if (!response.ok) throw new Error(data.error || "Unable to update surge pricing.");
      setEnabled(Boolean(data.surgePricingEnabled));
      toast.success(next ? "Surge pricing enabled for your slots." : "Surge pricing disabled for your slots.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update surge pricing.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">Dynamic surge pricing</p>
          <p className="mt-1 text-sm text-slate-600">
            Peak hours, weekends, and high-demand specialties can apply up to 50% surge on your consult fee.
            Patients see the adjusted rate before payment.
          </p>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => void handleToggle(!enabled)}
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
            enabled ? "bg-emerald-600" : "bg-slate-300"
          } disabled:opacity-60`}
          aria-pressed={enabled}
          aria-label={enabled ? "Disable surge pricing" : "Enable surge pricing"}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        {loading ? (
          <span className="inline-flex items-center gap-1.5">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving…
          </span>
        ) : enabled ? (
          "Surge pricing is active on your bookable slots."
        ) : (
          "Surge pricing is off — patients pay your standard consult fee."
        )}
      </p>
    </div>
  );
}
