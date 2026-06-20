"use client";

import { useSearchParams } from "next/navigation";
import { SecondOpinionShareBanner } from "@/components/patient/SecondOpinionShareBanner";

type PendingShareProps = {
  bookings: Array<{
    id: string;
    doctorName: string;
    shareConsent: boolean;
  }>;
};

export function SecondOpinionSharePrompt({ bookings }: PendingShareProps) {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("shareSecondOpinion")?.trim();

  const pending = bookings.filter((b) => !b.shareConsent);
  if (pending.length === 0 && !highlightId) return null;

  const highlighted = highlightId
    ? bookings.find((b) => b.id === highlightId)
    : pending[0];

  if (!highlighted) return null;

  return (
    <div className="rounded-xl border border-violet-200 bg-white p-4">
      <h2 className="text-lg font-semibold text-slate-900">Second opinion — share prior records</h2>
      <p className="mt-1 text-sm text-slate-600">
        Help your new doctor review your case by sharing records from your prior consultation.
      </p>
      <div className="mt-3 max-w-lg">
        <SecondOpinionShareBanner
          bookingId={highlighted.id}
          doctorName={highlighted.doctorName}
          alreadyShared={highlighted.shareConsent}
        />
      </div>
    </div>
  );
}
