// AI-POWERED
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Loader2,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RatingStars } from "@/components/ui/RatingStars";
import { ConsultationFeeTag } from "@/components/ui/ConsultationFeeTag";
import { getSafeImageSrc } from "@/lib/image";
import { cn } from "@/lib/utils";

type MatchedDoctor = {
  id: string;
  slug: string;
  name: string;
  specialty: string;
  credentials: string;
  experience: number;
  consultFee: number;
  photoUrl: string | null;
  rating: number;
  reviewCount: number;
};

type SymptomResult = {
  specialties: string[];
  urgencyLevel: "emergency" | "urgent" | "routine";
  reasoning: string;
  recommendedDoctors: MatchedDoctor[];
};

type Step = "input" | "loading" | "results";

const URGENCY_CONFIG = {
  emergency: {
    label: "Emergency",
    className: "bg-red-600 text-white",
    banner: "If you are experiencing a medical emergency, call 112 or go to the nearest emergency room immediately.",
  },
  urgent: {
    label: "Urgent",
    className: "bg-amber-500 text-white",
    banner: null,
  },
  routine: {
    label: "Routine",
    className: "bg-emerald-600 text-white",
    banner: null,
  },
} as const;

type SymptomCheckerProps = {
  variant?: "default" | "compact";
  className?: string;
};

export function SymptomChecker({ variant = "default", className }: SymptomCheckerProps) {
  const [step, setStep] = useState<Step>("input");
  const [symptoms, setSymptoms] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("");
  const [result, setResult] = useState<SymptomResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fallback, setFallback] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (symptoms.trim().length < 10) {
      setError("Please describe your symptoms in at least 10 characters.");
      return;
    }

    setError(null);
    setFallback(false);
    setStep("loading");

    try {
      const response = await fetch("/api/ai/symptom-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: symptoms.trim(),
          patientAge: patientAge ? Number(patientAge) : undefined,
          patientGender: patientGender.trim() || undefined,
        }),
      });

      const data = (await response.json()) as SymptomResult & {
        error?: string;
        fallback?: boolean;
      };

      if (!response.ok || data.fallback) {
        setFallback(true);
        setError(data.error ?? "AI is temporarily unavailable. Browse specialists manually.");
        setStep("input");
        return;
      }

      setResult(data);
      setStep("results");
    } catch {
      setFallback(true);
      setError("Unable to analyse symptoms right now. Please try again or browse doctors manually.");
      setStep("input");
    }
  }

  function handleReset() {
    setStep("input");
    setResult(null);
    setError(null);
    setFallback(false);
  }

  const urgency = result ? URGENCY_CONFIG[result.urgencyLevel] : null;

  return (
    <section
      className={cn(
        "rounded-2xl border border-emerald-100 bg-white shadow-sm",
        variant === "compact" ? "p-4 sm:p-5" : "p-6 sm:p-8",
        className
      )}
      aria-label="AI symptom checker"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <Sparkles className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h2 className="font-heading text-lg font-semibold text-[#0A1628] sm:text-xl">
            AI Symptom Checker
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Describe how you feel — we&apos;ll suggest the right specialist. Not a diagnosis tool.
          </p>
        </div>
      </div>

      {step === "input" && (
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <Label htmlFor="symptoms" className="text-sm font-medium">
              What symptoms are you experiencing?
            </Label>
            <Textarea
              id="symptoms"
              value={symptoms}
              onChange={(event) => setSymptoms(event.target.value)}
              placeholder="e.g. Persistent headache for 3 days, sensitivity to light, mild nausea..."
              className="mt-1.5 min-h-[100px] rounded-xl"
              aria-describedby={error ? "symptom-error" : undefined}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="patientAge" className="text-sm font-medium">
                Age (optional)
              </Label>
              <Input
                id="patientAge"
                type="number"
                min={0}
                max={120}
                value={patientAge}
                onChange={(event) => setPatientAge(event.target.value)}
                placeholder="35"
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="patientGender" className="text-sm font-medium">
                Gender (optional)
              </Label>
              <Input
                id="patientGender"
                value={patientGender}
                onChange={(event) => setPatientGender(event.target.value)}
                placeholder="e.g. Female"
                className="mt-1.5 rounded-xl"
              />
            </div>
          </div>

          {error ? (
            <div
              id="symptom-error"
              role="alert"
              className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
            >
              {error}
              {fallback ? (
                <Link
                  href="/book"
                  className="mt-1 inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
                >
                  Browse all doctors <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : null}
            </div>
          ) : null}

          <Button type="submit" className="w-full rounded-xl sm:w-auto">
            <Stethoscope className="mr-2 h-4 w-4" />
            Find matching doctors
          </Button>
        </form>
      )}

      {step === "loading" && (
        <div className="mt-8 flex flex-col items-center justify-center py-10 text-center" aria-live="polite">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" aria-hidden />
          <p className="mt-3 text-sm font-medium text-slate-700">Analysing your symptoms...</p>
          <p className="mt-1 text-xs text-muted-foreground">This usually takes a few seconds</p>
        </div>
      )}

      {step === "results" && result && urgency ? (
        <div className="mt-5 space-y-5">
          {result.urgencyLevel === "emergency" ? (
            <div
              role="alert"
              className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
            >
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden />
              <div>
                <p className="font-semibold">Emergency attention may be needed</p>
                <p className="mt-1">{urgency.banner}</p>
                <p className="mt-1 font-medium">India emergency helpline: 112</p>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <Badge className={urgency.className}>{urgency.label}</Badge>
            {result.specialties.map((specialty) => (
              <Badge key={specialty} variant="outline">
                {specialty}
              </Badge>
            ))}
          </div>

          <p className="text-sm leading-relaxed text-slate-700">{result.reasoning}</p>

          {result.recommendedDoctors.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">Recommended doctors</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {result.recommendedDoctors.map((doctor) => (
                  <Card key={doctor.id} className="overflow-hidden border-border/80">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={getSafeImageSrc(
                              doctor.photoUrl,
                              "/images/placeholders/doctor-avatar.svg"
                            )}
                            alt={doctor.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-[#0A1628]">{doctor.name}</p>
                          <p className="text-xs text-primary">{doctor.specialty}</p>
                          <p className="text-xs text-muted-foreground">{doctor.credentials}</p>
                          <div className="mt-1 flex items-center gap-1.5">
                            <RatingStars value={doctor.rating} size={12} />
                            <span className="text-[10px] text-muted-foreground">
                              ({doctor.reviewCount})
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
                        <ConsultationFeeTag inr={doctor.consultFee} />
                        <Button asChild size="sm" className="rounded-lg">
                          <Link href={`/book?doctor=${doctor.slug}`}>Book Now</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-muted-foreground">
              No matching doctors available right now.{" "}
              <Link href="/book" className="font-semibold text-emerald-700 hover:underline">
                Browse all specialists
              </Link>
            </div>
          )}

          <Button variant="outline" onClick={handleReset} className="rounded-xl">
            Check different symptoms
          </Button>
        </div>
      ) : null}
    </section>
  );
}
