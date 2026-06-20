"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, FileText, Loader2, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

type ContextPayload = {
  originalDoctorName: string;
  originalSpecialty: string;
  originalScheduledAt: string;
  originalDiagnosis: string | null;
  originalPrescription: {
    diagnosis: string | null;
    medicines: Array<{ name: string; dosage: string; duration: string; instructions: string }>;
    instructions: string | null;
  } | null;
  soapSummary: {
    subjective: string;
    assessment: string;
    plan: string;
  } | null;
  healthRecords: Array<{ id: string; name: string; type: string }>;
};

type SecondOpinionRecordsPanelProps = {
  bookingId: string;
  enabled: boolean;
};

export function SecondOpinionRecordsPanel({ bookingId, enabled }: SecondOpinionRecordsPanelProps) {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<ContextPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadContext = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/bookings/second-opinion-context?bookingId=${encodeURIComponent(bookingId)}`
      );
      const data = (await response.json()) as ContextPayload & { error?: string };
      if (!response.ok) {
        setContext(null);
        setError(data.error || "Records not shared yet.");
        return;
      }
      setContext(data);
    } catch {
      setError("Unable to load original records.");
    } finally {
      setLoading(false);
    }
  }, [bookingId, enabled]);

  useEffect(() => {
    void loadContext();
  }, [loadContext]);

  if (!enabled) return null;

  return (
    <div className="absolute left-3 top-3 z-20 w-[min(100%,280px)] rounded-xl border border-violet-400/25 bg-[#12101f]/95 backdrop-blur-md shadow-xl">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left"
      >
        <span className="flex items-center gap-2 text-[11px] font-semibold text-violet-200">
          <Stethoscope className="h-3.5 w-3.5" />
          Original records
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-white/40" /> : <ChevronDown className="h-4 w-4 text-white/40" />}
      </button>

      {open ? (
        <div className="max-h-64 overflow-y-auto border-t border-white/[0.06] px-3 py-2.5 space-y-2.5">
          {loading ? (
            <div className="flex items-center gap-2 text-[11px] text-white/50">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading…
            </div>
          ) : error ? (
            <p className="text-[10px] text-amber-300/90">{error}</p>
          ) : context ? (
            <>
              <div className="text-[10px] text-white/55">
                Prior: {context.originalDoctorName} · {context.originalSpecialty}
                <br />
                {new Date(context.originalScheduledAt).toLocaleDateString("en-IN")}
              </div>
              {context.originalDiagnosis ? (
                <p className="text-[10px] text-white/75">
                  <span className="font-semibold text-white/90">Diagnosis:</span> {context.originalDiagnosis}
                </p>
              ) : null}
              {context.originalPrescription?.medicines?.length ? (
                <div>
                  <p className="text-[10px] font-semibold text-white/80">Prior prescription</p>
                  <ul className="mt-1 space-y-1">
                    {context.originalPrescription.medicines.slice(0, 4).map((med) => (
                      <li key={med.name} className="text-[10px] text-white/60">
                        {med.name} · {med.dosage}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {context.soapSummary ? (
                <div className="rounded-lg bg-white/[0.04] p-2">
                  <p className="text-[10px] font-semibold text-white/80">SOAP summary</p>
                  {context.soapSummary.assessment ? (
                    <p className="mt-1 text-[10px] text-white/55 line-clamp-3">{context.soapSummary.assessment}</p>
                  ) : null}
                </div>
              ) : null}
              {context.healthRecords.length ? (
                <div>
                  <p className="text-[10px] font-semibold text-white/80">Shared health records</p>
                  <ul className="mt-1 space-y-1">
                    {context.healthRecords.map((record) => (
                      <li key={record.id} className="flex items-center gap-1.5 text-[10px] text-white/60">
                        <FileText className="h-3 w-3 shrink-0" />
                        <span className="truncate">{record.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          ) : null}
          <button
            type="button"
            onClick={() => void loadContext()}
            className={cn("text-[10px] text-violet-300 hover:text-violet-200")}
          >
            Refresh
          </button>
        </div>
      ) : null}
    </div>
  );
}
