"use client";

import Script from "next/script";
import { CheckCircle2 } from "lucide-react";
import { RegisterFlowSteps } from "@/components/join/RegisterFlowSteps";
import { useDoctorRegisterFlow } from "@/components/join/useDoctorRegisterFlow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type RegisterFlowProps = {
  initialPlanId?: string;
  initialReferralCode?: string;
  skipPlanSelection?: boolean;
};

export function RegisterFlow({
  initialPlanId,
  initialReferralCode,
  skipPlanSelection = false,
}: RegisterFlowProps) {
  const flow = useDoctorRegisterFlow({
    initialPlanId,
    initialReferralCode,
    skipPlanSelection,
    isModal: false,
  });

  const {
    step,
    displayStep,
    visibleSteps,
    minStep,
    isBusy,
    isPaymentVerified,
    referralCode,
    error,
    resumeMessage,
    STEP_LABELS,
    nextStep,
    prevStep,
    completeOnboarding,
  } = flow;

  return (
    <>
      <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Card className="overflow-hidden border-emerald-100 shadow-xl shadow-emerald-100/40">
          <CardHeader className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Badge className="bg-emerald-500 text-white">Doctor Growth Program</Badge>
                <CardTitle className="mt-3 text-2xl font-semibold sm:text-3xl">
                  Join as Doctor / Clinic / Hospital
                </CardTitle>
                <p className="mt-2 text-sm text-slate-200">
                  Step {displayStep} of {visibleSteps.length} - {STEP_LABELS[step]}
                </p>
              </div>
              {isPaymentVerified ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-100">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Payment verified
                </div>
              ) : null}
            </div>
            {referralCode ? (
              <p className="mt-3 rounded-lg border border-emerald-300/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
                Referred by a fellow doctor (code: {referralCode}). Their subscription extends when you
                join.
              </p>
            ) : null}
            <div
              className={cn(
                "mt-5 grid gap-2",
                visibleSteps.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"
              )}
            >
              {visibleSteps.map((key, index) => (
                <div
                  key={key}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-medium",
                    key <= step
                      ? "border-emerald-300/50 bg-emerald-400/20 text-emerald-100"
                      : "border-white/20 bg-white/5 text-slate-300"
                  )}
                >
                  {index + 1}. {STEP_LABELS[key]}
                </div>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6 sm:p-8">
            <RegisterFlowSteps flow={flow} layout="page" />
            {resumeMessage ? (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                {resumeMessage}
              </p>
            ) : null}
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <div className="flex items-center justify-between gap-3">
              <Button variant="outline" onClick={prevStep} disabled={step === minStep || isBusy}>
                Back
              </Button>
              {step === 4 ? (
                <Button
                  onClick={completeOnboarding}
                  disabled={isBusy}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {isBusy ? "Submitting..." : "Submit onboarding"}
                </Button>
              ) : step !== 2 || isPaymentVerified ? (
                <Button onClick={nextStep} className="bg-emerald-600 text-white hover:bg-emerald-700">
                  Continue
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
