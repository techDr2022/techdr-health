// AI-POWERED
"use client";

import { useCallback, useState, type DragEvent } from "react";
import Link from "next/link";
import { FileText, Loader2, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AiCrossBorderNotice } from "@/components/consent/AiCrossBorderNotice";
import { cn } from "@/lib/utils";

type LabParameter = {
  name: string;
  value: string;
  unit: string;
  normalRange: string;
  status: "normal" | "low" | "high" | "critical";
};

type AnalysisResult = {
  summary: string;
  parameters: LabParameter[];
  flaggedCount: number;
  recommendedSpecialty: string;
  recommendedAction: "routine_consult" | "urgent_consult" | "emergency";
  disclaimer: string;
};

const STATUS_STYLES: Record<LabParameter["status"], string> = {
  normal: "bg-emerald-50 text-emerald-800 border-emerald-200",
  low: "bg-amber-50 text-amber-900 border-amber-200",
  high: "bg-amber-50 text-amber-900 border-amber-200",
  critical: "bg-red-50 text-red-900 border-red-200",
};

const ACTION_LABELS = {
  routine_consult: "Routine consultation recommended",
  urgent_consult: "Urgent consultation recommended",
  emergency: "Seek emergency care immediately",
} as const;

type LabReportAnalyserProps = {
  patientId?: string;
  bookingId?: string;
  className?: string;
};

export function LabReportAnalyser({ patientId, bookingId, className }: LabReportAnalyserProps) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fallback, setFallback] = useState(false);
  const [aiAcknowledged, setAiAcknowledged] = useState(false);

  const analyseFile = useCallback(
    async (selected: File) => {
      if (!aiAcknowledged) {
        setError("Please acknowledge the AI data processing notice before uploading.");
        return;
      }
      if (selected.type !== "application/pdf") {
        setError("Please upload a PDF lab report.");
        return;
      }

      setFile(selected);
      setLoading(true);
      setError(null);
      setFallback(false);
      setResult(null);

      try {
        const formData = new FormData();
        formData.append("file", selected);
        if (patientId) formData.append("patientId", patientId);
        if (bookingId) formData.append("bookingId", bookingId);

        const response = await fetch("/api/ai/analyse-lab-report", {
          method: "POST",
          body: formData,
        });

        const data = (await response.json()) as AnalysisResult & {
          error?: string;
          fallback?: boolean;
        };

        if (!response.ok || data.fallback) {
          setFallback(true);
          setError(data.error ?? "AI analysis is temporarily unavailable.");
          return;
        }

        setResult(data);
      } catch {
        setFallback(true);
        setError("Unable to analyse the report. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [aiAcknowledged, patientId, bookingId]
  );

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files[0];
    if (dropped) void analyseFile(dropped);
  }

  const specialtySlug =
    result?.recommendedSpecialty
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "general-medicine";

  return (
    <div className={cn("space-y-5", className)}>
      <AiCrossBorderNotice onAcknowledgedChange={setAiAcknowledged} />
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          dragging ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-slate-50"
        )}
      >
        <Upload className="mx-auto h-8 w-8 text-emerald-600" aria-hidden />
        <p className="mt-3 font-medium text-slate-900">Drop your lab report PDF here</p>
        <p className="mt-1 text-sm text-muted-foreground">or click to browse (max 10MB)</p>
        <label className="mt-4 inline-block">
          <input
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={(event) => {
              const selected = event.target.files?.[0];
              if (selected) void analyseFile(selected);
            }}
          />
          <span className="inline-flex cursor-pointer items-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">
            Select PDF
          </span>
        </label>
        {file ? (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-600">
            <FileText className="h-3.5 w-3.5" />
            {file.name}
          </p>
        ) : null}
      </div>

      {loading ? (
        <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-6" aria-live="polite">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            Analysing lab report...
          </div>
          <div className="h-4 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
          <div className="mt-4 h-32 animate-pulse rounded-xl bg-slate-100" />
        </div>
      ) : null}

      {error ? (
        <div role="alert" className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p>{error}</p>
            {fallback ? (
              <Link href="/book" className="mt-1 inline-block font-semibold text-emerald-700 hover:underline">
                Book a doctor manually →
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      {result ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={result.flaggedCount > 0 ? "destructive" : "secondary"}>
                {result.flaggedCount} flagged
              </Badge>
              <Badge variant="outline">{ACTION_LABELS[result.recommendedAction]}</Badge>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">{result.summary}</p>
          </div>

          {result.parameters.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Parameter</th>
                    <th className="px-4 py-3">Value</th>
                    <th className="px-4 py-3">Normal range</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.parameters.map((param) => (
                    <tr key={`${param.name}-${param.value}`} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{param.name}</td>
                      <td className="px-4 py-3">
                        {param.value} {param.unit}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{param.normalRange}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
                            STATUS_STYLES[param.status] ?? STATUS_STYLES.normal
                          )}
                        >
                          {param.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          <p className="text-xs text-muted-foreground">{result.disclaimer}</p>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-xl">
              <Link href={`/book?specialty=${encodeURIComponent(specialtySlug)}`}>
                Book Consultation with {result.recommendedSpecialty}
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/dashboard/patient/lab-tests">Book follow-up lab tests</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
