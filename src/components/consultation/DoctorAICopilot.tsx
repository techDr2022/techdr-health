"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Sparkles, Stethoscope, Pill, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { COPILOT_DISCLAIMER } from "@/lib/ai/copilot-shared";

type TabId = "differential" | "interactions" | "guidelines";

type DifferentialItem = {
  name: string;
  icd10: string;
  confidence: "high" | "medium" | "low";
  redFlags: string[];
};

type InteractionItem = {
  drugs: string[];
  severity: "MILD" | "MODERATE" | "SEVERE";
  description: string;
  scheduleXFlag?: boolean;
};

type GuidelineCard = {
  title: string;
  summary: string;
  keyPoints: string[];
  referralCriteria: string[];
  source: string;
};

type DoctorAICopilotProps = {
  bookingId: string;
  patientAge?: number | null;
  patientGender?: string | null;
};

const TABS: Array<{ id: TabId; label: string; icon: typeof Stethoscope }> = [
  { id: "differential", label: "Differential", icon: Stethoscope },
  { id: "interactions", label: "Interactions", icon: Pill },
  { id: "guidelines", label: "Guidelines", icon: BookOpen },
];

const CONFIDENCE_STYLE = {
  high: "text-emerald-400 bg-emerald-500/15 border-emerald-400/30",
  medium: "text-amber-400 bg-amber-500/15 border-amber-400/30",
  low: "text-white/50 bg-white/5 border-white/10",
};

const SEVERITY_STYLE = {
  MILD: "text-sky-400 bg-sky-500/15 border-sky-400/30",
  MODERATE: "text-amber-400 bg-amber-500/15 border-amber-400/30",
  SEVERE: "text-red-400 bg-red-500/15 border-red-400/30",
};

export function DoctorAICopilot({ bookingId, patientAge, patientGender }: DoctorAICopilotProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabId>("differential");
  const [loading, setLoading] = useState(false);

  const [symptoms, setSymptoms] = useState("");
  const [differentials, setDifferentials] = useState<DifferentialItem[]>([]);

  const [drugs, setDrugs] = useState("");
  const [interactions, setInteractions] = useState<InteractionItem[]>([]);

  const [condition, setCondition] = useState("");
  const [guidelines, setGuidelines] = useState<GuidelineCard[]>([]);
  const [guidelinesCached, setGuidelinesCached] = useState(false);

  async function runDifferential() {
    if (symptoms.trim().length < 5) {
      toast.error("Describe symptoms in a few words.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/ai/differential-dx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: symptoms.trim(),
          patientAge: patientAge ?? undefined,
          patientGender: patientGender ?? undefined,
          bookingId,
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        differentials?: DifferentialItem[];
      };
      if (!response.ok) throw new Error(data.error || "Unable to generate differentials.");
      setDifferentials(data.differentials ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI unavailable.");
    } finally {
      setLoading(false);
    }
  }

  async function runInteractions() {
    if (!drugs.trim()) {
      toast.error("Enter drug names separated by commas.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/ai/drug-interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drugs: drugs.trim(), bookingId }),
      });
      const data = (await response.json()) as {
        error?: string;
        interactions?: InteractionItem[];
      };
      if (!response.ok) throw new Error(data.error || "Unable to check interactions.");
      setInteractions(data.interactions ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI unavailable.");
    } finally {
      setLoading(false);
    }
  }

  async function runGuidelines() {
    if (condition.trim().length < 2) {
      toast.error("Enter a condition or diagnosis.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/ai/clinical-guidelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ condition: condition.trim(), bookingId }),
      });
      const data = (await response.json()) as {
        error?: string;
        cards?: GuidelineCard[];
        cached?: boolean;
      };
      if (!response.ok) throw new Error(data.error || "Unable to load guidelines.");
      setGuidelines(data.cards ?? []);
      setGuidelinesCached(Boolean(data.cached));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI unavailable.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open AI clinical copilot"
        className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex flex-col items-center gap-1 rounded-xl border border-violet-400/30 bg-violet-500/20 px-2.5 py-3 text-violet-200 shadow-lg backdrop-blur-sm hover:bg-violet-500/30 transition-colors"
      >
        <Sparkles className="h-4 w-4" />
        <span className="text-[9px] font-semibold uppercase tracking-wide">Copilot</span>
      </button>
    );
  }

  return (
    <aside className="absolute inset-y-0 right-0 z-20 flex w-full max-w-[300px] flex-col border-l border-violet-400/20 bg-[#12101f]/95 backdrop-blur-md shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-400" />
          <p className="text-[12px] font-semibold text-white">AI Copilot</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close AI copilot"
          className="rounded-lg p-1 text-white/40 hover:bg-white/10 hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex border-b border-white/[0.06]">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[9px] font-semibold border-b-2 transition-colors",
              tab === id
                ? "border-violet-400 text-violet-300 bg-violet-500/[0.06]"
                : "border-transparent text-white/35 hover:text-white/60"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {tab === "differential" ? (
          <>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Patient symptoms, duration, key findings…"
              rows={4}
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[12px] text-white placeholder:text-white/30 focus:border-violet-400/40 focus:outline-none"
            />
            {(patientAge != null || patientGender) && (
              <p className="text-[10px] text-white/35">
                Context: {[patientAge != null ? `Age ${patientAge}` : null, patientGender].filter(Boolean).join(" · ")}
              </p>
            )}
            <button
              type="button"
              disabled={loading}
              onClick={() => void runDifferential()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-2 text-[12px] font-semibold text-white hover:bg-violet-500 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Stethoscope className="h-3.5 w-3.5" />}
              Get differentials
            </button>
            {differentials.map((item) => (
              <div key={`${item.name}-${item.icd10}`} className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[12px] font-semibold text-white">{item.name}</p>
                  <span className={cn("rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase", CONFIDENCE_STYLE[item.confidence])}>
                    {item.confidence}
                  </span>
                </div>
                {item.icd10 ? <p className="mt-1 text-[10px] text-white/40">ICD-10: {item.icd10}</p> : null}
                {item.redFlags?.length ? (
                  <ul className="mt-2 space-y-1">
                    {item.redFlags.map((flag) => (
                      <li key={flag} className="text-[10px] text-red-300/90">⚠ {flag}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </>
        ) : null}

        {tab === "interactions" ? (
          <>
            <textarea
              value={drugs}
              onChange={(e) => setDrugs(e.target.value)}
              placeholder="Drug names, comma-separated (e.g. metformin, aspirin, warfarin)"
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[12px] text-white placeholder:text-white/30 focus:border-violet-400/40 focus:outline-none"
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => void runInteractions()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-2 text-[12px] font-semibold text-white hover:bg-violet-500 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pill className="h-3.5 w-3.5" />}
              Check interactions
            </button>
            {interactions.length === 0 && !loading ? (
              <p className="text-[10px] text-white/35">Schedule X drugs are always flagged as SEVERE.</p>
            ) : null}
            {interactions.map((item, index) => (
              <div
                key={`${item.drugs.join("-")}-${index}`}
                className={cn(
                  "rounded-lg border p-2.5",
                  item.scheduleXFlag ? "border-red-400/30 bg-red-500/10" : "border-white/10 bg-white/[0.03]"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-medium text-white">{item.drugs.join(" + ")}</p>
                  <span className={cn("rounded border px-1.5 py-0.5 text-[9px] font-semibold", SEVERITY_STYLE[item.severity])}>
                    {item.severity}
                  </span>
                </div>
                <p className="mt-1.5 text-[10px] text-white/55 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </>
        ) : null}

        {tab === "guidelines" ? (
          <>
            <input
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="Condition (e.g. Type 2 diabetes, URTI)"
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-[12px] text-white placeholder:text-white/30 focus:border-violet-400/40 focus:outline-none"
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => void runGuidelines()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-2 text-[12px] font-semibold text-white hover:bg-violet-500 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BookOpen className="h-3.5 w-3.5" />}
              Load guidelines
            </button>
            {guidelinesCached ? (
              <p className="text-[10px] text-emerald-400/80">Cached reference (24h)</p>
            ) : null}
            {guidelines.map((card) => (
              <div key={card.title} className="rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
                <p className="text-[12px] font-semibold text-white">{card.title}</p>
                <p className="mt-1 text-[10px] text-white/50 leading-relaxed">{card.summary}</p>
                {card.keyPoints?.length ? (
                  <ul className="mt-2 list-disc pl-4 space-y-0.5">
                    {card.keyPoints.slice(0, 4).map((point) => (
                      <li key={point} className="text-[10px] text-white/60">{point}</li>
                    ))}
                  </ul>
                ) : null}
                {card.source ? <p className="mt-2 text-[9px] text-white/30">Source: {card.source}</p> : null}
              </div>
            ))}
          </>
        ) : null}
      </div>

      <div className="border-t border-white/[0.06] p-2.5">
        <p className="text-[9px] leading-relaxed text-white/30">{COPILOT_DISCLAIMER}</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-2 flex w-full items-center justify-center gap-1 text-[10px] text-white/40 hover:text-white/70"
        >
          <ChevronLeft className="h-3 w-3" />
          Collapse
        </button>
      </div>
    </aside>
  );
}
