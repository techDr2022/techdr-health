"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { calculateDoctorPayout } from "@/lib/plans";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function SliderField({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (n: number) => string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <p className="font-medium">{label}</p>
        <p className="font-semibold text-teal-700">{format(value)}</p>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => {
          const next = Array.isArray(v) ? v[0] : v;
          onChange(typeof next === "number" ? next : value);
        }}
      />
    </div>
  );
}

function ResultCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? "border-teal-500 bg-teal-50 text-teal-900"
          : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

export function EarningsCalculator() {
  const [consultFee, setConsultFee] = useState(500);
  const [dailyConsults, setDailyConsults] = useState(5);

  const values = useMemo(() => {
    const perConsult = calculateDoctorPayout(consultFee);
    const dailyEarning = perConsult.doctorPayout * dailyConsults;
    const monthlyEarning = dailyEarning * 22;
    const yearlyEarning = monthlyEarning * 12;
    return { perConsult, dailyEarning, monthlyEarning, yearlyEarning };
  }, [consultFee, dailyConsults]);

  return (
    <section id="earnings-calculator" className="py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">
              Calculate Your Potential Earnings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <SliderField
              label="Your Consultation Fee"
              value={consultFee}
              min={200}
              max={5000}
              step={50}
              format={(v) => `INR ${v.toLocaleString("en-IN")}`}
              onChange={setConsultFee}
            />

            <SliderField
              label="Consultations per Day"
              value={dailyConsults}
              min={1}
              max={30}
              step={1}
              format={(v) => `${v} patients`}
              onChange={setDailyConsults}
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ResultCard
                label="Per Consultation"
                value={`INR ${values.perConsult.doctorPayout.toLocaleString("en-IN")}`}
              />
              <ResultCard
                label="Daily Earnings"
                value={`INR ${values.dailyEarning.toLocaleString("en-IN")}`}
              />
              <ResultCard
                label="Monthly Earnings"
                value={`INR ${values.monthlyEarning.toLocaleString("en-IN")}`}
              />
              <ResultCard
                label="Yearly Earnings"
                value={`INR ${values.yearlyEarning.toLocaleString("en-IN")}`}
                highlight
              />
            </div>

            <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-muted-foreground">
              Platform fee: INR {values.perConsult.platformFee} (25%) per
              consultation. You receive INR {values.perConsult.doctorPayout} (75%).
            </div>

            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/join/register">Start Earning - Join Now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
