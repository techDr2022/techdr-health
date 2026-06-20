"use client";

import type { ChangeEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { SPECIALTIES } from "@/data/specialties";
import { SUBSCRIPTION_PLANS } from "@/lib/plans";
import type { ParsedDoctorResume } from "@/lib/doctor-resume-parse";
import {
  DEFAULT_FORM_STATE,
  DEFAULT_UPLOADS,
  DOCUMENT_FILE_TYPES,
  getInitialPlan,
  getInitialStep,
  getVisibleSteps,
  IMAGE_FILE_TYPES,
  MAX_FILE_SIZE,
  STEP_LABELS,
  type FormState,
  type RegisterStep,
  type UploadState,
} from "@/components/join/register-flow-shared";

declare global {
  interface Window {
    Cashfree?: (options: { mode: "sandbox" | "production" }) => {
      checkout: (options: {
        paymentSessionId: string;
        redirectTarget?: "_self" | "_blank" | "_modal";
      }) => Promise<{ error?: { message?: string } }>;
    };
  }
}

export type UseDoctorRegisterFlowOptions = {
  initialPlanId?: string;
  initialReferralCode?: string;
  skipPlanSelection?: boolean;
  isModal?: boolean;
  onSuccess?: () => void;
};

export function useDoctorRegisterFlow({
  initialPlanId,
  initialReferralCode,
  skipPlanSelection = false,
  isModal = false,
  onSuccess,
}: UseDoctorRegisterFlowOptions = {}) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<RegisterStep>(() =>
    getInitialStep(initialPlanId, skipPlanSelection)
  );
  const visibleSteps = getVisibleSteps(skipPlanSelection);
  const displayStep = visibleSteps.indexOf(step) + 1;
  const minStep = skipPlanSelection ? 2 : 1;
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
  const [referralCode] = useState(() => initialReferralCode?.trim().toUpperCase() ?? "");
  const [resumeMessage, setResumeMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const selectedPlan = SUBSCRIPTION_PLANS[form.planType];
  const specialtyOptions = useMemo(() => SPECIALTIES.map((s) => s.name), []);
  const showFreeOffer = isModal && (!isPaymentVerified || isFreeListingGranted);

  useEffect(() => {
    if (!isModal) return;
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, isModal]);

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
        // Ignore fetch errors.
      }
    };
    void loadFreeSlots();
    return () => {
      isMounted = false;
    };
  }, []);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleArrayValue<K extends keyof FormState>(key: K, value: string) {
    const arr = form[key];
    if (!Array.isArray(arr)) return;
    const next = arr.includes(value) ? arr.filter((item) => item !== value) : [...arr, value];
    setForm((prev) => ({ ...prev, [key]: next as FormState[K] }));
  }

  function applyResumeData(data: ParsedDoctorResume, filledFields?: number) {
    setForm((prev) => ({
      ...prev,
      entityName: data.entityName || prev.entityName,
      email: data.email || prev.email,
      phone: data.phone || prev.phone,
      specialty: data.specialty || prev.specialty,
      subSpecialties: data.subSpecialties?.length ? data.subSpecialties : prev.subSpecialties,
      experience: data.experience || prev.experience,
      credentials: data.credentials || prev.credentials,
      medRegNumber: data.medRegNumber || prev.medRegNumber,
      languages: data.languages?.length ? data.languages : prev.languages,
      consultationFee: data.consultationFee || prev.consultationFee,
      whatsappNumber: data.whatsappNumber || data.phone || prev.whatsappNumber,
      clinicName: data.clinicName || prev.clinicName,
      hospitalName: data.hospitalName || prev.hospitalName,
      address: data.address || prev.address,
      city: data.city || prev.city,
      pincode: data.pincode || prev.pincode,
      numberOfDoctors: data.numberOfDoctors || prev.numberOfDoctors,
    }));
    setError(null);
    if (typeof filledFields === "number") {
      setResumeMessage(`Resume analyzed — ${filledFields} field(s) auto-filled. Review before continuing.`);
    }
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
    return Boolean(uploads.medRegCertUrl && uploads.govIdUrl && uploads.profilePhotoUrl);
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
    if (step > minStep) setStep((s) => (s - 1) as RegisterStep);
  }

  function handleFileChange(key: keyof UploadState, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setUploads((prev) => ({ ...prev, [key]: null }));
      return;
    }
    const allowedTypes =
      key === "profilePhotoUrl" || key === "logoUrl" ? IMAGE_FILE_TYPES : DOCUMENT_FILE_TYPES;
    if (!allowedTypes.includes(file.type)) {
      setError(
        key === "profilePhotoUrl" || key === "logoUrl"
          ? "Only JPG, PNG, and WEBP images are allowed."
          : "Only PDF, JPG, PNG, and WEBP files are allowed."
      );
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
      referralCode: referralCode || undefined,
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
        // Keep fallback.
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
      if (!orderResponse.ok) throw new Error("Unable to initialize payment.");
      const orderData = (await orderResponse.json()) as {
        orderId: string;
        paymentSessionId?: string;
        cashfreeMode?: string;
      };
      if (!window.Cashfree) throw new Error("Payment SDK not loaded. Please refresh and retry.");
      if (!orderData.paymentSessionId) throw new Error("Cashfree session is missing. Please retry.");
      const cashfree = window.Cashfree({
        mode: orderData.cashfreeMode === "PROD" ? "production" : "sandbox",
      });
      const checkoutResult = await cashfree.checkout({
        paymentSessionId: orderData.paymentSessionId,
        redirectTarget: isModal ? "_self" : "_modal",
      });
      if (checkoutResult.error) {
        throw new Error(checkoutResult.error.message || "Payment was not completed.");
      }
      const verify = await fetch("/api/subscriptions/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderData.orderId, applicationId: app.id }),
      });
      if (!verify.ok) {
        setError("Payment succeeded, but verification failed. Contact support.");
        return;
      }
      setIsPaymentVerified(true);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed.");
    } finally {
      setIsBusy(false);
    }
  }

  async function uploadJoinDocument(
    appId: string,
    file: File,
    documentType: "med-reg-cert" | "gov-id" | "profile-photo" | "logo"
  ) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", documentType);
    const response = await fetch(`/api/join/applications/${appId}/documents`, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      let message = "Unable to upload document.";
      try {
        const body = (await response.json()) as { error?: string };
        if (body.error) message = body.error;
      } catch {
        // Keep fallback.
      }
      throw new Error(message);
    }
    const data = (await response.json()) as { key: string };
    return data.key;
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
      const [medRegCertUrl, govIdUrl, profilePhotoUrl] = await Promise.all([
        uploadJoinDocument(applicationId, uploads.medRegCertUrl!, "med-reg-cert"),
        uploadJoinDocument(applicationId, uploads.govIdUrl!, "gov-id"),
        uploadJoinDocument(applicationId, uploads.profilePhotoUrl!, "profile-photo"),
      ]);
      const response = await fetch(`/api/join/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          medRegCertUrl,
          govIdUrl,
          degreeDocUrl: null,
          clinicRegUrl: null,
          profilePhotoUrl,
          logoUrl: uploads.logoUrl
            ? await uploadJoinDocument(applicationId, uploads.logoUrl, "logo")
            : null,
        }),
      });
      if (!response.ok) throw new Error("Unable to complete onboarding. Please retry.");
      const signInResult = await signIn("email-password", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        redirect: false,
      });
      if (signInResult?.error) {
        onSuccess?.();
        router.push(`/login?callbackUrl=${encodeURIComponent("/dashboard")}`);
        return;
      }
      onSuccess?.();
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete onboarding.");
    } finally {
      setIsBusy(false);
    }
  }

  return {
    step,
    displayStep,
    visibleSteps,
    minStep,
    form,
    uploads,
    applicationId,
    isPaymentVerified,
    isFreeListingGranted,
    freeSlotsRemaining,
    error,
    referralCode,
    resumeMessage,
    isBusy,
    selectedPlan,
    specialtyOptions,
    showFreeOffer,
    scrollRef,
    STEP_LABELS,
    updateField,
    toggleArrayValue,
    applyResumeData,
    handleFileChange,
    handlePayment,
    nextStep,
    prevStep,
    completeOnboarding,
    setError,
    setResumeMessage,
  };
}

export type DoctorRegisterFlow = ReturnType<typeof useDoctorRegisterFlow>;
