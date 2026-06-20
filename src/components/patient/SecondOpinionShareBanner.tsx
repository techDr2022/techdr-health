"use client";

import { useState } from "react";
import { Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";

type SecondOpinionShareBannerProps = {
  bookingId: string;
  doctorName: string;
  alreadyShared?: boolean;
};

export function SecondOpinionShareBanner({
  bookingId,
  doctorName,
  alreadyShared = false,
}: SecondOpinionShareBannerProps) {
  const [shared, setShared] = useState(alreadyShared);
  const [loading, setLoading] = useState(false);

  if (shared) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
        Records shared with {doctorName} for this second opinion.
      </div>
    );
  }

  async function handleShare() {
    setLoading(true);
    try {
      const response = await fetch("/api/bookings/share-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const data = (await response.json()) as { error?: string; ok?: boolean };
      if (!response.ok) throw new Error(data.error || "Unable to share records.");
      setShared(true);
      toast.success(`Prior records shared with ${doctorName}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to share records.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-violet-200 bg-violet-50 p-3">
      <p className="text-xs font-semibold text-violet-900">Share prior records?</p>
      <p className="mt-1 text-xs text-violet-800/80">
        Share your health vault files and prior SOAP summary with {doctorName} before the consult.
      </p>
      <button
        type="button"
        disabled={loading}
        onClick={() => void handleShare()}
        className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-violet-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-600 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Share2 className="h-3.5 w-3.5" />}
        Share records
      </button>
    </div>
  );
}
