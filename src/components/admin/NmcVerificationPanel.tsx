"use client";

import { useState } from "react";
import { ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { buildNmcRegistrySearchUrl } from "@/lib/nmc-verification";

type NmcVerificationPanelProps = {
  doctorId: string;
  medRegNumber: string;
  nmcVerified: boolean;
  nmcVerifiedAt: string | null;
};

export function NmcVerificationPanel({
  doctorId,
  medRegNumber,
  nmcVerified: initialVerified,
  nmcVerifiedAt,
}: NmcVerificationPanelProps) {
  const [nmcVerified, setNmcVerified] = useState(initialVerified);
  const [verifiedAt, setVerifiedAt] = useState(nmcVerifiedAt);
  const [loading, setLoading] = useState(false);

  async function markVerified() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/doctors/verify-nmc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId }),
      });
      const data = (await response.json()) as {
        error?: string;
        nmcVerifiedAt?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }
      setNmcVerified(true);
      setVerifiedAt(data.nmcVerifiedAt ?? new Date().toISOString());
      toast.success("NMC registration marked as verified.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to verify NMC.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600" aria-hidden />
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">NMC Registration Verification</p>
            <p className="mt-1 text-xs text-slate-600">
              Verify the doctor&apos;s registration on the NMC Indian Medical Register before approving
              their application.
            </p>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Registration number</p>
            <p className="mt-1 font-mono font-medium text-slate-900">{medRegNumber}</p>
          </div>

          <a
            href={buildNmcRegistrySearchUrl(medRegNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:underline"
          >
            Search on nmc.org.in
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

          {nmcVerified ? (
            <p className="text-xs font-medium text-emerald-700">
              Verified
              {verifiedAt ? ` on ${new Date(verifiedAt).toLocaleString("en-IN")}` : ""}
            </p>
          ) : (
            <Button type="button" size="sm" disabled={loading} onClick={() => void markVerified()}>
              {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
              Mark NMC Verified
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
