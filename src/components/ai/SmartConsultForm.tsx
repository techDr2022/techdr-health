// AI-POWERED
"use client";

import { useCallback, useState } from "react";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SmartConsultPrefill = {
  chiefComplaint: string;
  duration: string;
  severity: "mild" | "moderate" | "severe";
  relevantHistory: string;
  questionsForDoctor: string[];
};

type SmartConsultFormProps = {
  doctorSpecialty: string;
  patientId?: string;
  labReportText?: string;
  symptomHistory?: string;
  onApply: (data: SmartConsultPrefill) => void;
  className?: string;
};

export function SmartConsultForm({
  doctorSpecialty,
  patientId,
  labReportText,
  symptomHistory,
  onApply,
  className,
}: SmartConsultFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefilled, setPrefilled] = useState(false);
  const [data, setData] = useState<SmartConsultPrefill>({
    chiefComplaint: "",
    duration: "",
    severity: "moderate",
    relevantHistory: "",
    questionsForDoctor: [],
  });

  const runPrefill = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/prefill-consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          doctorSpecialty,
          labReportText,
          symptomHistory,
        }),
      });

      const payload = (await response.json()) as SmartConsultPrefill & {
        error?: string;
        fallback?: boolean;
      };

      if (!response.ok || payload.fallback) {
        setError(payload.error ?? "AI pre-fill is temporarily unavailable.");
        return;
      }

      setData(payload);
      setPrefilled(true);
      onApply(payload);
    } catch {
      setError("Unable to generate pre-fill. Please complete the form manually.");
    } finally {
      setLoading(false);
    }
  }, [patientId, doctorSpecialty, labReportText, symptomHistory, onApply]);

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-600" aria-hidden />
          <span className="text-sm font-medium text-slate-800">Smart pre-consultation</span>
          {prefilled ? (
            <Badge variant="secondary" className="gap-1">
              ✨ AI Pre-filled
            </Badge>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void runPrefill()}
          disabled={loading}
          className="rounded-lg"
        >
          {loading ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          )}
          {prefilled ? "Regenerate" : "AI Pre-fill"}
        </Button>
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-xs text-amber-700">
          {error}
        </p>
      ) : null}

      {prefilled ? (
        <div className="mt-4 space-y-4 rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
          <div>
            <Label htmlFor="ai-chiefComplaint" className="flex items-center gap-1.5 text-sm">
              Chief complaint {prefilled ? <Badge variant="outline" className="text-[10px]">✨ AI</Badge> : null}
            </Label>
            <Textarea
              id="ai-chiefComplaint"
              value={data.chiefComplaint}
              onChange={(event) =>
                setData((prev) => ({ ...prev, chiefComplaint: event.target.value }))
              }
              className="mt-1.5 rounded-xl bg-white"
              rows={3}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="ai-duration" className="text-sm">
                Duration
              </Label>
              <Input
                id="ai-duration"
                value={data.duration}
                onChange={(event) => setData((prev) => ({ ...prev, duration: event.target.value }))}
                className="mt-1.5 rounded-xl bg-white"
              />
            </div>
            <div>
              <Label htmlFor="ai-severity" className="text-sm">
                Severity
              </Label>
              <Select
                value={data.severity}
                onValueChange={(value) =>
                  setData((prev) => ({
                    ...prev,
                    severity: value as SmartConsultPrefill["severity"],
                  }))
                }
              >
                <SelectTrigger id="ai-severity" className="mt-1.5 rounded-xl bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="ai-history" className="text-sm">
              Relevant history
            </Label>
            <Textarea
              id="ai-history"
              value={data.relevantHistory}
              onChange={(event) =>
                setData((prev) => ({ ...prev, relevantHistory: event.target.value }))
              }
              className="mt-1.5 rounded-xl bg-white"
              rows={2}
            />
          </div>

          {data.questionsForDoctor.length > 0 ? (
            <div>
              <p className="text-sm font-medium text-slate-700">Suggested questions for your doctor</p>
              <ul className="mt-1.5 list-inside list-disc space-y-1 text-sm text-slate-600">
                {data.questionsForDoctor.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <Button
            type="button"
            size="sm"
            className="rounded-lg"
            onClick={() => onApply(data)}
          >
            Apply to booking form
          </Button>
        </div>
      ) : null}
    </div>
  );
}
