"use client";

import Script from "next/script";
import { CheckCircle2, X } from "lucide-react";
import { RegisterFlowSteps } from "@/components/join/RegisterFlowSteps";
import { useDoctorRegisterFlow } from "@/components/join/useDoctorRegisterFlow";
import { Button } from "@/components/ui/button";

type DoctorJoinModalFormProps = {
  onClose: () => void;
  onSuccess?: () => void;
  initialReferralCode?: string;
};

export function DoctorJoinModalForm({
  onClose,
  onSuccess,
  initialReferralCode,
}: DoctorJoinModalFormProps) {
  const flow = useDoctorRegisterFlow({
    skipPlanSelection: true,
    isModal: true,
    initialReferralCode,
    onSuccess,
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
    scrollRef,
    nextStep,
    prevStep,
    completeOnboarding,
  } = flow;

  const progress = (displayStep / visibleSteps.length) * 100;

  return (
    <>
      <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="lazyOnload" />
      <div className="flex h-full min-h-0 flex-col bg-white">
        <header className="shrink-0 border-b border-slate-800/50 bg-slate-900 px-4 py-4 text-white sm:px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                Doctor Growth Program
              </p>
              <h2 className="mt-1 text-lg font-semibold leading-tight">Join as Doctor</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>
                Step {displayStep} of {visibleSteps.length}
              </span>
              <span className="font-medium text-emerald-300">{STEP_LABELS[step]}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {referralCode ? (
            <p className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
              Referred by a fellow doctor (code: {referralCode}).
            </p>
          ) : null}

          {isPaymentVerified ? (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-100">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Payment verified
            </div>
          ) : null}
        </header>

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5"
        >
          <RegisterFlowSteps flow={flow} layout="modal" />
        </div>

        <footer className="shrink-0 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
          {resumeMessage ? (
            <p className="mb-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {resumeMessage}
            </p>
          ) : null}
          {error ? (
            <p className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={step === minStep || isBusy}
              className="min-w-[88px]"
            >
              Back
            </Button>
            {step === 4 ? (
              <Button
                type="button"
                onClick={completeOnboarding}
                disabled={isBusy}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {isBusy ? "Submitting..." : "Submit"}
              </Button>
            ) : step !== 2 || isPaymentVerified ? (
              <Button
                type="button"
                onClick={nextStep}
                className="min-w-[100px] bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Continue
              </Button>
            ) : (
              <div className="w-[88px]" />
            )}
          </div>
        </footer>
      </div>
    </>
  );
}
