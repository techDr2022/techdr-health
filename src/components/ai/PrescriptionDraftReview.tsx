// AI-POWERED
"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DrugRestrictionWarnings } from "@/components/consultation/DrugRestrictionWarnings";
import type { DrugValidationResult } from "@/lib/drug-restrictions";

type Medication = {
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
};

type AiDraft = {
  summary: string;
  diagnosis: string;
  medications: Medication[];
  followUpRecommendation: string;
  lifestyle: string[];
  warnings?: DrugValidationResult[];
};

type PrescriptionDraftReviewProps = {
  bookingId: string;
  specialty: string;
  chiefComplaint: string;
  doctorNotes?: string;
  joinToken?: string;
  initialDraft?: AiDraft | null;
};

const EMPTY_MED: Medication = {
  name: "",
  dosage: "",
  duration: "",
  instructions: "",
};

export function PrescriptionDraftReview({
  bookingId,
  specialty,
  chiefComplaint,
  doctorNotes,
  joinToken,
  initialDraft,
}: PrescriptionDraftReviewProps) {
  const [aiDraft, setAiDraft] = useState<AiDraft | null>(initialDraft ?? null);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [fallback, setFallback] = useState(false);

  const [diagnosis, setDiagnosis] = useState(initialDraft?.diagnosis ?? "");
  const [instructions, setInstructions] = useState(
    initialDraft?.followUpRecommendation ?? ""
  );
  const [medicines, setMedicines] = useState<Medication[]>(
    initialDraft?.medications?.length ? initialDraft.medications : [{ ...EMPTY_MED }]
  );
  const [followUpDate, setFollowUpDate] = useState("");
  const [drugWarnings, setDrugWarnings] = useState<DrugValidationResult[]>([]);

  useEffect(() => {
    if (initialDraft) {
      setAiDraft(initialDraft);
      setDiagnosis(initialDraft.diagnosis);
      setInstructions(initialDraft.followUpRecommendation);
      setMedicines(
        initialDraft.medications.length ? initialDraft.medications : [{ ...EMPTY_MED }]
      );
    }
  }, [initialDraft]);

  const generateDraft = useCallback(async () => {
    setGenerating(true);
    setFallback(false);
    try {
      const response = await fetch("/api/ai/consultation-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          chiefComplaint,
          doctorNotes,
          specialty,
          joinToken,
        }),
      });

      const data = (await response.json()) as AiDraft & {
        error?: string;
        fallback?: boolean;
        warnings?: DrugValidationResult[];
      };
      if (!response.ok || data.fallback) {
        setFallback(true);
        toast.error(data.error ?? "AI draft unavailable. Complete the form manually.");
        return;
      }

      setAiDraft(data);
      setDiagnosis(data.diagnosis);
      setInstructions(data.followUpRecommendation);
      setMedicines(data.medications.length ? data.medications : [{ ...EMPTY_MED }]);
      setDrugWarnings(data.warnings ?? []);
      if ((data.warnings?.length ?? 0) > 0) {
        toast.warning("AI draft contains medicines restricted under telemedicine rules.");
      } else {
        toast.success("AI draft generated");
      }
    } catch {
      setFallback(true);
      toast.error("Unable to generate AI draft.");
    } finally {
      setGenerating(false);
    }
  }, [bookingId, chiefComplaint, doctorNotes, specialty, joinToken]);

  async function handleApproveAndSend() {
    if (!diagnosis.trim()) {
      toast.error("Diagnosis is required.");
      return;
    }

    const validMeds = medicines.filter((med) => med.name.trim());
    if (validMeds.length === 0) {
      toast.error("Add at least one medication.");
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/video/prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          diagnosis: diagnosis.trim(),
          medicines: validMeds,
          instructions: instructions.trim() || undefined,
          followUpDate: followUpDate || undefined,
          joinToken,
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        violations?: DrugValidationResult[];
      };
      if (!response.ok) {
        if (response.status === 422 && data.violations?.length) {
          setDrugWarnings(data.violations);
        }
        toast.error(data.error ?? "Failed to send prescription.");
        return;
      }

      setDrugWarnings([]);
      toast.success("Prescription sent to patient");
    } catch {
      toast.error("Failed to send prescription.");
    } finally {
      setSending(false);
    }
  }

  function updateMedicine(index: number, field: keyof Medication, value: string) {
    setMedicines((prev) =>
      prev.map((med, idx) => (idx === index ? { ...med, [field]: value } : med))
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <h2 className="font-semibold text-slate-900">AI Draft</h2>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void generateDraft()}
            disabled={generating}
            className="rounded-lg"
          >
            {generating ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
            {aiDraft ? "Regenerate" : "Generate draft"}
          </Button>
        </div>

        {fallback ? (
          <p className="mt-3 text-sm text-amber-700">
            AI unavailable — use the editable form on the right.
          </p>
        ) : null}

        {aiDraft ? (
          <div className="mt-4 space-y-4 text-sm">
            <DrugRestrictionWarnings warnings={drugWarnings} />
            <div>
              <Badge variant="secondary" className="mb-2">
                Summary
              </Badge>
              <p className="leading-relaxed text-slate-700">{aiDraft.summary}</p>
            </div>
            <div>
              <Badge variant="secondary" className="mb-2">
                Diagnosis
              </Badge>
              <p className="text-slate-700">{aiDraft.diagnosis}</p>
            </div>
            {aiDraft.lifestyle.length > 0 ? (
              <div>
                <Badge variant="secondary" className="mb-2">
                  Lifestyle
                </Badge>
                <ul className="list-inside list-disc text-slate-700">
                  {aiDraft.lifestyle.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            Generate an AI draft from the consultation context to speed up prescription writing.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">Editable prescription</h2>

        <DrugRestrictionWarnings warnings={drugWarnings} className="mt-3" />

        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Input
              id="diagnosis"
              value={diagnosis}
              onChange={(event) => setDiagnosis(event.target.value)}
              className="mt-1.5 rounded-xl"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label>Medications</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setMedicines((prev) => [...prev, { ...EMPTY_MED }])}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add row
              </Button>
            </div>
            <div className="mt-2 space-y-3">
              {medicines.map((med, index) => (
                <div key={index} className="grid gap-2 rounded-xl border border-slate-100 p-3">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setMedicines((prev) => prev.filter((_, idx) => idx !== index))
                      }
                      className="text-slate-400 hover:text-red-600"
                      aria-label="Remove medication"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <Input
                    placeholder="Medicine name"
                    value={med.name}
                    onChange={(event) => updateMedicine(index, "name", event.target.value)}
                    className="rounded-lg"
                  />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      placeholder="Dosage"
                      value={med.dosage}
                      onChange={(event) => updateMedicine(index, "dosage", event.target.value)}
                      className="rounded-lg"
                    />
                    <Input
                      placeholder="Duration"
                      value={med.duration}
                      onChange={(event) => updateMedicine(index, "duration", event.target.value)}
                      className="rounded-lg"
                    />
                  </div>
                  <Input
                    placeholder="Instructions"
                    value={med.instructions}
                    onChange={(event) =>
                      updateMedicine(index, "instructions", event.target.value)
                    }
                    className="rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="instructions">Follow-up / instructions</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              className="mt-1.5 rounded-xl"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="followUpDate">Follow-up date (optional)</Label>
            <Input
              id="followUpDate"
              type="date"
              value={followUpDate}
              onChange={(event) => setFollowUpDate(event.target.value)}
              className="mt-1.5 rounded-xl"
            />
          </div>

          <Button
            type="button"
            onClick={() => void handleApproveAndSend()}
            disabled={sending}
            className="w-full rounded-xl"
          >
            {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Approve &amp; Send to Patient
          </Button>
        </div>
      </div>
    </div>
  );
}
