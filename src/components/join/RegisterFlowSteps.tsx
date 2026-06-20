"use client";

import type { ChangeEvent } from "react";
import { SUBSCRIPTION_PLANS, type PlanType } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResumeAutofillUpload } from "@/components/join/ResumeAutofillUpload";
import { LANGUAGES } from "@/components/join/register-flow-shared";
import type { DoctorRegisterFlow } from "@/components/join/useDoctorRegisterFlow";
import { cn } from "@/lib/utils";

type RegisterFlowStepsProps = {
  flow: DoctorRegisterFlow;
  layout: "page" | "modal";
};

function FileInput({
  label,
  file,
  accept,
  onChange,
}: {
  label: string;
  file: File | null;
  accept: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type="file" accept={accept} onChange={onChange} />
      {file ? <p className="text-xs text-muted-foreground">Selected: {file.name}</p> : null}
    </div>
  );
}

export function RegisterFlowSteps({ flow, layout }: RegisterFlowStepsProps) {
  const isModal = layout === "modal";
  const gridClass = isModal ? "flex flex-col gap-4" : "grid gap-4 md:grid-cols-2";
  const spanFull = !isModal ? "md:col-span-2" : "";

  const {
    step,
    form,
    uploads,
    isBusy,
    isPaymentVerified,
    isFreeListingGranted,
    freeSlotsRemaining,
    selectedPlan,
    specialtyOptions,
    showFreeOffer,
    updateField,
    toggleArrayValue,
    applyResumeData,
    handleFileChange,
    handlePayment,
    setError,
    setResumeMessage,
  } = flow;

  const resumeProps = {
    disabled: isBusy,
    onParsed: (data: Parameters<typeof applyResumeData>[0], filledFields?: number) =>
      applyResumeData(data, filledFields),
    onError: (message: string) => {
      setError(message);
      setResumeMessage(null);
    },
  };

  return (
    <>
      {step === 1 ? (
        <div className="grid gap-4 md:grid-cols-3">
          {(Object.keys(SUBSCRIPTION_PLANS) as PlanType[]).map((planType) => {
            const plan = SUBSCRIPTION_PLANS[planType];
            const active = form.planType === planType;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => updateField("planType", planType)}
                className={cn(
                  "rounded-2xl border p-5 text-left transition",
                  active
                    ? "border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100"
                    : "border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/40"
                )}
              >
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{plan.badge}</p>
                <p className="mt-2 text-lg font-semibold">{plan.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  INR {plan.price.toLocaleString("en-IN")} / year
                </p>
              </button>
            );
          })}
        </div>
      ) : null}

      {step === 2 ? (
        <div className={gridClass}>
          <ResumeAutofillUpload {...resumeProps} compact={isModal} />

          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input
              value={form.entityName}
              onChange={(e) => updateField("entityName", e.target.value)}
              placeholder="Dr. Jane Smith"
            />
          </div>
          <div className="space-y-2">
            <Label>Email Address *</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Phone Number *</Label>
            <Input
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>
          <div className="space-y-2">
            <Label>Password *</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Confirm Password *</Label>
            <Input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
            />
          </div>

          {isModal ? (
            <div
              className={cn(
                "rounded-xl border p-4",
                showFreeOffer
                  ? "border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-teal-50"
                  : "border-emerald-100 bg-emerald-50/50"
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{selectedPlan.name}</p>
                {showFreeOffer ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400 line-through">
                      INR {selectedPlan.price.toLocaleString("en-IN")}
                    </span>
                    <span className="rounded-full bg-emerald-600 px-3 py-0.5 text-sm font-bold uppercase text-white">
                      Free
                    </span>
                  </div>
                ) : (
                  <p className="text-lg font-semibold text-emerald-700">
                    {isFreeListingGranted
                      ? "FREE"
                      : `INR ${selectedPlan.price.toLocaleString("en-IN")}`}
                  </p>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-600">
                {showFreeOffer ? (
                  <>
                    First 500 doctors join free (
                    {typeof freeSlotsRemaining === "number"
                      ? `${freeSlotsRemaining} slots left`
                      : "checking slots"}
                    ).
                  </>
                ) : (
                  <>First 500 listings get free annual subscription.</>
                )}
              </p>
              <Button
                onClick={handlePayment}
                disabled={isBusy || isPaymentVerified}
                className="mt-3 w-full bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {isPaymentVerified
                  ? isFreeListingGranted
                    ? "Free listing activated"
                    : "Payment verified"
                  : isBusy
                    ? "Processing..."
                    : showFreeOffer
                      ? "Claim free listing & continue"
                      : "Pay and continue"}
              </Button>
              <p
                className={cn(
                  "mt-2 text-xs font-medium",
                  isPaymentVerified ? "text-emerald-600" : "text-amber-600"
                )}
              >
                {isPaymentVerified
                  ? "You can continue to the next step."
                  : "Complete eligibility check to continue."}
              </p>
            </div>
          ) : null}

          {!isModal ? (
            <>
              <div
                className={cn(
                  "space-y-2 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5",
                  spanFull
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-semibold">{selectedPlan.name}</p>
                  <p className="text-xl font-semibold text-emerald-700">
                    {isFreeListingGranted
                      ? "FREE"
                      : `INR ${selectedPlan.price.toLocaleString("en-IN")}`}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  First 500 listings get free annual subscription (
                  {typeof freeSlotsRemaining === "number"
                    ? `${freeSlotsRemaining} free slots left`
                    : "checking free slots"}
                  ). After that, secure Cashfree payment applies.
                </p>
                <Button
                  onClick={handlePayment}
                  disabled={isBusy || isPaymentVerified}
                  className="mt-4 w-full bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {isPaymentVerified
                    ? isFreeListingGranted
                      ? "Free listing activated"
                      : "Payment verified"
                    : isBusy
                      ? "Processing..."
                      : "Check eligibility / pay and continue"}
                </Button>
              </div>
              <div className={cn("space-y-2", spanFull)}>
                <Label>Payment status</Label>
                <p
                  className={cn(
                    "text-sm font-medium",
                    isPaymentVerified ? "text-emerald-600" : "text-amber-600"
                  )}
                >
                  {isPaymentVerified
                    ? isFreeListingGranted
                      ? "Free subscription granted - you can continue to next step."
                      : "Payment completed - you can continue to next step."
                    : "Pending - complete payment check first."}
                </p>
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {step === 3 ? (
        <div className={gridClass}>
          <ResumeAutofillUpload {...resumeProps} compact={isModal} />
          <div className="space-y-2">
            <Label>Specialty *</Label>
            <select
              value={form.specialty}
              onChange={(event) => updateField("specialty", event.target.value)}
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/40"
            >
              <option value="">Choose specialty</option>
              {specialtyOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Years of Experience *</Label>
            <Input
              type="number"
              value={form.experience}
              onChange={(e) => updateField("experience", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Credentials *</Label>
            <Input
              value={form.credentials}
              onChange={(e) => updateField("credentials", e.target.value)}
              placeholder="MBBS, MD"
            />
          </div>
          <div className="space-y-2">
            <Label>Consultation Fee (INR) *</Label>
            <Input
              type="number"
              value={form.consultationFee}
              onChange={(e) => updateField("consultationFee", e.target.value)}
            />
            {!isModal ? (
              <p className="text-xs text-muted-foreground">
                Note: 25% platform fee applies on each consultation.
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label>Medical Registration Number</Label>
            <Input
              value={form.medRegNumber}
              onChange={(e) => updateField("medRegNumber", e.target.value)}
              placeholder="State medical council registration"
            />
          </div>
          <div className="space-y-2">
            <Label>WhatsApp Number *</Label>
            <Input
              value={form.whatsappNumber}
              onChange={(e) => updateField("whatsappNumber", e.target.value)}
              placeholder="Enter WhatsApp number"
            />
          </div>
          <div className={cn("space-y-2", spanFull)}>
            <Label>Languages</Label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((language) => (
                <button
                  key={language}
                  type="button"
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition-colors",
                    form.languages.includes(language)
                      ? "border-teal-500 bg-teal-50 text-teal-800"
                      : "border-slate-200 text-slate-700 hover:border-slate-300"
                  )}
                  onClick={() => toggleArrayValue("languages", language)}
                >
                  {language}
                </button>
              ))}
            </div>
          </div>
          {form.planType !== "INDIVIDUAL" ? (
            <>
              <div className="space-y-2">
                <Label>{form.planType === "CLINIC" ? "Clinic Name *" : "Hospital Name *"}</Label>
                <Input
                  value={form.planType === "CLINIC" ? form.clinicName : form.hospitalName}
                  onChange={(e) =>
                    form.planType === "CLINIC"
                      ? updateField("clinicName", e.target.value)
                      : updateField("hospitalName", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Address *</Label>
                <Input value={form.address} onChange={(e) => updateField("address", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>City *</Label>
                <Input value={form.city} onChange={(e) => updateField("city", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Pincode *</Label>
                <Input value={form.pincode} onChange={(e) => updateField("pincode", e.target.value)} />
              </div>
              {form.planType === "CLINIC" ? (
                <div className="space-y-2">
                  <Label>Number of Doctors (max 2) *</Label>
                  <Input
                    type="number"
                    value={form.numberOfDoctors}
                    onChange={(e) => updateField("numberOfDoctors", e.target.value)}
                  />
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}

      {step === 4 ? (
        <>
          <div className={gridClass}>
            <FileInput
              label="Medical Registration Certificate *"
              file={uploads.medRegCertUrl}
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(event) => handleFileChange("medRegCertUrl", event)}
            />
            <FileInput
              label="Government ID Proof *"
              file={uploads.govIdUrl}
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(event) => handleFileChange("govIdUrl", event)}
            />
            <FileInput
              label="Profile Photo *"
              file={uploads.profilePhotoUrl}
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={(event) => handleFileChange("profilePhotoUrl", event)}
            />
            {form.planType !== "INDIVIDUAL" ? (
              <FileInput
                label="Clinic/Hospital Logo"
                file={uploads.logoUrl}
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={(event) => handleFileChange("logoUrl", event)}
              />
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            Upload required documents. Your profile photo appears across listing and profile pages.
          </p>
        </>
      ) : null}
    </>
  );
}
