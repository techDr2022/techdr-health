"use client";

import Script from "next/script";
import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { CheckCircle2 } from "lucide-react";
import { SPECIALTIES } from "@/data/specialties";
import {
  PLAN_ID_TO_TYPE,
  SUBSCRIPTION_PLANS,
  type PlanType,
} from "@/lib/plans";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RegisterStep = 1 | 2 | 3 | 4;
type UploadValue = File | null;

type FormState = {
  planType: PlanType;
  entityName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  specialty: string;
  subSpecialties: string[];
  experience: string;
  credentials: string;
  medRegNumber: string;
  languages: string[];
  consultationFee: string;
  whatsappNumber: string;
  clinicName: string;
  hospitalName: string;
  address: string;
  city: string;
  pincode: string;
  numberOfDoctors: string;
};

type UploadState = {
  medRegCertUrl: UploadValue;
  govIdUrl: UploadValue;
  profilePhotoUrl: UploadValue;
  logoUrl: UploadValue;
};

declare global {
  interface Window {
    Cashfree?: (options: { mode: "sandbox" | "production" }) => {
      checkout: (options: { paymentSessionId: string; redirectTarget?: "_self" | "_blank" | "_modal" }) => Promise<{
        error?: { message?: string };
      }>;
    };
  }
}

const LANGUAGES = [
  "English",
  "Hindi",
  "Telugu",
  "Tamil",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Gujarati",
  "Bengali",
];

const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/jpg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const DEFAULT_FORM_STATE: FormState = {
  planType: "INDIVIDUAL",
  entityName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  specialty: "",
  subSpecialties: [],
  experience: "",
  credentials: "",
  medRegNumber: "",
  languages: [],
  consultationFee: "500",
  whatsappNumber: "",
  clinicName: "",
  hospitalName: "",
  address: "",
  city: "",
  pincode: "",
  numberOfDoctors: "1",
};

const DEFAULT_UPLOADS: UploadState = {
  medRegCertUrl: null,
  govIdUrl: null,
  profilePhotoUrl: null,
  logoUrl: null,
};

const STEP_LABELS: Record<RegisterStep, string> = {
  1: "Choose Plan",
  2: "Account + Payment",
  3: "Professional Profile",
  4: "Documents + Submit",
};

function getInitialPlan(initialPlanId?: string): PlanType {
  if (!initialPlanId) return "INDIVIDUAL";
  return PLAN_ID_TO_TYPE[initialPlanId] ?? "INDIVIDUAL";
}

function getInitialStep(initialPlanId?: string): RegisterStep {
  if (!initialPlanId) return 1;
  return PLAN_ID_TO_TYPE[initialPlanId] ? 2 : 1;
}

export function RegisterFlow({ initialPlanId }: { initialPlanId?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<RegisterStep>(() => getInitialStep(initialPlanId));
  const [form, setForm] = useState<FormState>({
    ...DEFAULT_FORM_STATE,
    planType: getInitialPlan(initialPlanId),
  });
  const [uploads, setUploads] = useState<UploadState>(DEFAULT_UPLOADS);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [isPaymentVerified, setIsPaymentVerified] = useState(false);
  const [isFreeListingGranted, setIsFreeListingGranted] = useState(false);
  const [freeSlotsRemaining, setFreeSlotsRemaining] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  useEffect(() => {
    let isMounted = true;
    const loadFreeSlots = async () => {
      try {
        const response = await fetch("/api/join/applications", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as { freeSlotsRemaining?: number };
        if (!isMounted || typeof data.freeSlotsRemaining !== "number") return;
        setFreeSlotsRemaining(Math.max(data.freeSlotsRemaining, 0));
      } catch {
        // Ignore fetch errors and keep fallback copy.
      }
    };

    void loadFreeSlots();
    return () => {
      isMounted = false;
    };
  }, []);


  const selectedPlan = SUBSCRIPTION_PLANS[form.planType];
  const specialtyOptions = useMemo(() => SPECIALTIES.map((s) => s.name), []);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleArrayValue<K extends keyof FormState>(
    key: K,
    value: string
  ) {
    const arr = form[key];
    if (!Array.isArray(arr)) return;
    const next = arr.includes(value)
      ? arr.filter((item) => item !== value)
      : [...arr, value];
    setForm((prev) => ({ ...prev, [key]: next as FormState[K] }));
  }

  function validateStep1() {
    return Boolean(form.planType);
  }

  function validateStep2Account() {
    if (!form.entityName || !form.email || !form.phone) return false;
    if (!form.password || form.password !== form.confirmPassword) return false;
    return true;
  }

  function validateStep3Profile() {
    if (!form.specialty || !form.credentials) return false;
    if (!form.experience || !form.consultationFee) return false;
    if (!form.whatsappNumber) return false;
    if (form.planType === "CLINIC") {
      const doctorCount = Number(form.numberOfDoctors);
      if (!form.clinicName || !form.address || !form.city || !form.pincode) return false;
      if (!Number.isFinite(doctorCount) || doctorCount < 1 || doctorCount > 2) return false;
    }
    if (form.planType === "HOSPITAL" && (!form.hospitalName || !form.address || !form.city || !form.pincode)) {
      return false;
    }
    return true;
  }

  function validateUploads() {
    if (!uploads.medRegCertUrl || !uploads.govIdUrl || !uploads.profilePhotoUrl) {
      return false;
    }
    return true;
  }

  function nextStep() {
    setError(null);
    if (step === 1 && !validateStep1()) {
      setError("Please choose a plan.");
      return;
    }
    if (step === 2 && !isPaymentVerified) {
      setError("Please complete payment before continuing.");
      return;
    }
    if (step === 3 && !validateStep3Profile()) {
      setError("Please complete all required profile fields correctly before continuing.");
      return;
    }
    if (step < 4) setStep((s) => (s + 1) as RegisterStep);
  }

  function prevStep() {
    setError(null);
    if (step > 1) setStep((s) => (s - 1) as RegisterStep);
  }

  function handleFileChange(
    key: keyof UploadState,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setUploads((prev) => ({ ...prev, [key]: null }));
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError("Only PDF or JPG files are allowed.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Each file must be under 5MB.");
      return;
    }

    setError(null);
    setUploads((prev) => ({ ...prev, [key]: file }));
  }

  async function createApplicationIfNeeded() {
    if (applicationId) {
      return { id: applicationId, isFreeListingGranted };
    }

    const payload = {
      ...form,
      medRegCertUrl: uploads.medRegCertUrl?.name ?? null,
      govIdUrl: uploads.govIdUrl?.name ?? null,
      degreeDocUrl: null,
      clinicRegUrl: null,
      profilePhotoUrl: uploads.profilePhotoUrl?.name ?? null,
      logoUrl: uploads.logoUrl?.name ?? null,
    };

    const response = await fetch("/api/join/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let message = "Unable to create your application.";
      try {
        const body = (await response.json()) as { error?: string };
        if (body.error) message = body.error;
      } catch {
        // Keep fallback message if body isn't JSON
      }
      throw new Error(message);
    }

    const data = (await response.json()) as {
      id: string;
      isFreeListingGranted?: boolean;
      freeSlotsRemaining?: number;
    };
    setApplicationId(data.id);
    setIsFreeListingGranted(Boolean(data.isFreeListingGranted));
    if (typeof data.freeSlotsRemaining === "number") {
      setFreeSlotsRemaining(Math.max(data.freeSlotsRemaining, 0));
    }
    return { id: data.id, isFreeListingGranted: Boolean(data.isFreeListingGranted) };
  }

  async function handlePayment() {
    try {
      if (!validateStep2Account()) {
        setError("Please complete account details to proceed with payment.");
        return;
      }
      setIsBusy(true);
      setError(null);

      const app = await createApplicationIfNeeded();

      if (app.isFreeListingGranted) {
        setIsPaymentVerified(true);
        setStep(3);
        return;
      }

      const orderResponse = await fetch("/api/subscriptions/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType: form.planType, applicationId: app.id }),
      });

      if (!orderResponse.ok) {
        throw new Error("Unable to initialize payment.");
      }

      const orderData = (await orderResponse.json()) as {
        orderId: string;
        amount: number;
        currency: string;
        paymentSessionId?: string;
        cashfreeMode?: string;
      };

      if (!window.Cashfree) {
        throw new Error("Payment SDK not loaded. Please refresh and retry.");
      }
      if (!orderData.paymentSessionId) {
        throw new Error("Cashfree session is missing. Please retry.");
      }

      const cashfree = window.Cashfree({
        mode: orderData.cashfreeMode === "PROD" ? "production" : "sandbox",
      });
      const checkoutResult = await cashfree.checkout({
        paymentSessionId: orderData.paymentSessionId,
        redirectTarget: "_modal",
      });
      if (checkoutResult.error) {
        throw new Error(checkoutResult.error.message || "Payment was not completed.");
      }
      const verify = await fetch("/api/subscriptions/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderData.orderId,
          applicationId: app.id,
        }),
      });
      if (!verify.ok) {
        setError("Payment succeeded, but verification failed. Contact support.");
        return;
      }
      setIsPaymentVerified(true);
      setStep(3);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Payment failed.";
      setError(message);
    } finally {
      setIsBusy(false);
    }
  }

  async function completeOnboarding() {
    try {
      setError(null);
      if ((!isPaymentVerified && !isFreeListingGranted) || !applicationId) {
        setError("Please complete payment verification first.");
        return;
      }
      if (!validateStep3Profile()) {
        setError("Please complete profile details before submitting.");
        return;
      }
      if (!validateUploads()) {
        setError("Please upload all mandatory documents.");
        return;
      }

      setIsBusy(true);
      const response = await fetch(`/api/join/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          medRegCertUrl: uploads.medRegCertUrl?.name ?? null,
          govIdUrl: uploads.govIdUrl?.name ?? null,
          degreeDocUrl: null,
          clinicRegUrl: null,
          profilePhotoUrl: uploads.profilePhotoUrl?.name ?? null,
          logoUrl: uploads.logoUrl?.name ?? null,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to complete onboarding. Please retry.");
      }

      const signInResult = await signIn("email-password", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push(`/login?callbackUrl=${encodeURIComponent("/dashboard/doctor")}`);
        return;
      }

      router.push("/dashboard/doctor");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to complete onboarding.";
      setError(message);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <>
      <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Card className="overflow-hidden border-emerald-100 shadow-xl shadow-emerald-100/40">
          <CardHeader className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Badge className="bg-emerald-500 text-white">Doctor Growth Program</Badge>
                <CardTitle className="mt-3 text-2xl font-semibold sm:text-3xl">
                  Join as Doctor / Clinic / Hospital
                </CardTitle>
                <p className="mt-2 text-sm text-slate-200">
                  Step {step} of 4 - {STEP_LABELS[step]}
                </p>
              </div>
              {isPaymentVerified ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-100">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Payment verified
                </div>
              ) : null}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(Object.keys(STEP_LABELS) as unknown as RegisterStep[]).map((key) => (
                <div
                  key={key}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                    key <= step
                      ? "border-emerald-300/50 bg-emerald-400/20 text-emerald-100"
                      : "border-white/20 bg-white/5 text-slate-300"
                  }`}
                >
                  {key}. {STEP_LABELS[key]}
                </div>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6 sm:p-8">
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
                      className={`rounded-2xl border p-5 text-left transition ${
                        active
                          ? "border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100"
                          : "border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/40"
                      }`}
                    >
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{plan.badge}</p>
                      <p className="mt-2 text-lg font-semibold">{plan.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">INR {plan.price.toLocaleString("en-IN")} / year</p>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Full Name / Entity Name *</Label>
                  <Input
                    value={form.entityName}
                    onChange={(e) => updateField("entityName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number *</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
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
                <div className="space-y-2 md:col-span-2 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-base font-semibold">{selectedPlan.name}</p>
                    <p className="text-xl font-semibold text-emerald-700">
                      {isFreeListingGranted ? "FREE" : `INR ${selectedPlan.price.toLocaleString("en-IN")}`}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
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
                <div className="space-y-2 md:col-span-2">
                  <Label>Payment status</Label>
                  <p className={`text-sm font-medium ${isPaymentVerified ? "text-emerald-600" : "text-amber-600"}`}>
                    {isPaymentVerified
                      ? isFreeListingGranted
                        ? "Free subscription granted - you can continue to next step."
                        : "Payment completed - you can continue to next step."
                      : "Pending - complete payment check first."}
                  </p>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Specialty *</Label>
                  <select
                    value={form.specialty}
                    onChange={(event) => updateField("specialty", event.target.value)}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/40"
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
                  <p className="text-xs text-muted-foreground">
                    Note: 25% will be platform fee. If consultation fee is INR 1000, INR 250 will be platform charges
                    to maintain high-security servers.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp Number *</Label>
                  <Input
                    value={form.whatsappNumber}
                    onChange={(e) => updateField("whatsappNumber", e.target.value)}
                    placeholder="Enter WhatsApp number"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Languages</Label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((language) => (
                      <button
                        key={language}
                        type="button"
                        className={`rounded-full border px-3 py-1 text-xs ${
                          form.languages.includes(language)
                            ? "border-teal-500 bg-teal-50 text-teal-800"
                            : "border-slate-200"
                        }`}
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
                      <Label>
                        {form.planType === "CLINIC" ? "Clinic Name *" : "Hospital Name *"}
                      </Label>
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
                      <Input
                        value={form.address}
                        onChange={(e) => updateField("address", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>City *</Label>
                      <Input
                        value={form.city}
                        onChange={(e) => updateField("city", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pincode *</Label>
                      <Input
                        value={form.pincode}
                        onChange={(e) => updateField("pincode", e.target.value)}
                      />
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
              <div className="grid gap-4 md:grid-cols-2">
                <FileInput
                  label="Medical Registration Certificate *"
                  file={uploads.medRegCertUrl}
                  onChange={(event) => handleFileChange("medRegCertUrl", event)}
                />
                <FileInput
                  label="Government ID Proof *"
                  file={uploads.govIdUrl}
                  onChange={(event) => handleFileChange("govIdUrl", event)}
                />
                <FileInput
                  label="Profile Photo * (Used across all pages)"
                  file={uploads.profilePhotoUrl}
                  onChange={(event) => handleFileChange("profilePhotoUrl", event)}
                />
                {form.planType !== "INDIVIDUAL" ? (
                  <FileInput
                    label="Clinic/Hospital Logo"
                    file={uploads.logoUrl}
                    onChange={(event) => handleFileChange("logoUrl", event)}
                  />
                ) : null}
              </div>
            ) : null}
            {step === 4 ? (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                <p className="text-sm text-muted-foreground">
                  Upload required documents and your final profile photo. This photo will
                  appear across doctor listing, profile, and related pages.
                </p>
              </div>
            ) : null}

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={prevStep} disabled={step === 1 || isBusy}>
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

function FileInput({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type="file" accept=".pdf,.jpg,.jpeg" onChange={onChange} />
      {file ? <p className="text-xs text-muted-foreground">Selected: {file.name}</p> : null}
    </div>
  );
}
