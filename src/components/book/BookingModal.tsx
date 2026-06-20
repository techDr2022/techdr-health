"use client";

import Script from "next/script";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { ArrowRight, Loader2, Stethoscope } from "lucide-react";
import type { ConsultType } from "@prisma/client";
import type { DoctorRecord } from "@/types/catalog";
import type { DoctorSlotsResponse } from "@/lib/doctor-slots";
import { CONSULT_TYPE_LABELS } from "@/lib/consult-fee";
import { calculateDoctorPayout } from "@/lib/plans";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TelemedicineConsentCheckbox } from "@/components/consent/TelemedicineConsentCheckbox";
import { FamilyMemberPicker } from "@/components/patient/FamilyMembersPanel";
import type { FamilyMemberRecord } from "@/lib/family-members";
import {
  applySecondOpinionSurcharge,
  buildSecondOpinionConcern,
  type SecondOpinionPrefill,
} from "@/lib/second-opinion";
import { applySurgeToFee } from "@/lib/pricing";
import { cn } from "@/lib/utils";

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

type BookingStep = 1 | 2;

type PatientDetails = {
  fullName: string;
  phone: string;
  email: string;
  concern: string;
};

const initialDetails: PatientDetails = {
  fullName: "",
  phone: "",
  email: "",
  concern: "",
};

function sendAcknowledgementInBackground(payload: {
  doctorSlug: string;
  patientName: string;
  patientEmail: string;
  patientWhatsApp: string;
  appointmentDate: string;
  timeSlot: string;
  concern: string;
}) {
  const body = JSON.stringify(payload);
  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon("/api/bookings/acknowledge", new Blob([body], { type: "application/json" }));
      return;
    }
  } catch {
    // ignore
  }
  void fetch("/api/bookings/acknowledge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

function SlotSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="flex gap-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="h-14 w-14 shrink-0 rounded-xl bg-slate-100" />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-10 rounded-xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}

export type BookingModalProps = {
  doctor: DoctorRecord;
  triggerLabel?: string;
  triggerClassName?: string;
  triggerVariant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  triggerSize?: "default" | "sm" | "lg" | "icon";
  secondOpinion?: SecondOpinionPrefill | null;
};

export function BookingModal({
  doctor,
  triggerLabel = "Book Now",
  triggerClassName,
  triggerVariant = "default",
  triggerSize = "sm",
  secondOpinion = null,
}: BookingModalProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const slotGridRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<BookingStep>(1);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberRecord[]>([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<"self" | string>("self");
  const [slotsData, setSlotsData] = useState<DoctorSlotsResponse | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedScheduledAt, setSelectedScheduledAt] = useState("");
  const [consultType, setConsultType] = useState<ConsultType>("VIDEO");
  const [details, setDetails] = useState<PatientDetails>(initialDetails);
  const [consentGiven, setConsentGiven] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const selectedDay = useMemo(
    () => slotsData?.days.find((day) => day.date === selectedDate) ?? null,
    [slotsData, selectedDate]
  );

  const selectedSlotMeta = useMemo(() => {
    if (!selectedScheduledAt || !slotsData) return null;
    for (const day of slotsData.days) {
      const slot = day.slots.find((item) => item.scheduledAt === selectedScheduledAt);
      if (slot) return slot;
    }
    return null;
  }, [selectedScheduledAt, slotsData]);

  const consultFee = slotsData?.consultFeeByType[consultType] ?? doctor.consultFee;
  const isSecondOpinionBooking = Boolean(secondOpinion);
  const isSameOriginalDoctor = secondOpinion?.originalDoctorSlug === doctor.slug;
  const surgeMultiplier = selectedSlotMeta?.surgeMultiplier ?? 1;
  const surgedFee = applySurgeToFee(consultFee, surgeMultiplier);
  const surchargedFee = applySecondOpinionSurcharge(surgedFee, isSecondOpinionBooking);
  const feePreview = useMemo(() => calculateDoctorPayout(surchargedFee), [surchargedFee]);
  const surgeBadge = selectedSlotMeta?.surgeBadge ?? null;

  const loadSlots = useCallback(async () => {
    setSlotsLoading(true);
    setSlotsError(null);
    try {
      const response = await fetch(
        `/api/doctors/${encodeURIComponent(doctor.slug)}/slots?consultType=${consultType}`
      );
      const data = (await response.json()) as DoctorSlotsResponse & { error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to load slots.");
      setSlotsData(data);

      const firstAvailable = data.days
        .flatMap((day) => day.slots.filter((slot) => slot.available).map((slot) => ({ day, slot })))
        .at(0);

      if (firstAvailable) {
        setSelectedDate(firstAvailable.day.date);
        setSelectedSlot(firstAvailable.slot.label);
        setSelectedScheduledAt(firstAvailable.slot.scheduledAt);
      } else if (data.days[0]) {
        setSelectedDate(data.days[0].date);
        setSelectedSlot("");
        setSelectedScheduledAt("");
      }
    } catch (error) {
      setSlotsError(error instanceof Error ? error.message : "Unable to load slots.");
    } finally {
      setSlotsLoading(false);
    }
  }, [consultType, doctor.slug]);

  useEffect(() => {
    if (!open || !secondOpinion) return;
    setDetails((prev) => ({
      ...prev,
      concern: prev.concern.trim() ? prev.concern : buildSecondOpinionConcern(secondOpinion),
    }));
  }, [open, secondOpinion]);

  useEffect(() => {
    if (!open) return;
    void loadSlots();
  }, [open, loadSlots]);

  useEffect(() => {
    if (!open || session?.user?.role !== "PATIENT") {
      setFamilyMembers([]);
      return;
    }
    void fetch("/api/family/list")
      .then((response) => (response.ok ? response.json() : { members: [] }))
      .then((data: { members?: FamilyMemberRecord[] }) => {
        setFamilyMembers(data.members ?? []);
      })
      .catch(() => setFamilyMembers([]));
  }, [open, session?.user?.role]);

  useEffect(() => {
    if (step !== 2 || session?.user?.role !== "PATIENT") return;
    if (selectedBeneficiary === "self") {
      setDetails((prev) => ({
        ...prev,
        fullName: session.user?.name || prev.fullName,
        email: session.user?.email || prev.email,
      }));
      return;
    }
    const member = familyMembers.find((item) => item.id === selectedBeneficiary);
    if (member) {
      setDetails((prev) => ({
        ...prev,
        fullName: member.name,
        email: session.user?.email || prev.email,
      }));
    }
  }, [step, selectedBeneficiary, familyMembers, session?.user?.email, session?.user?.name, session?.user?.role]);

  const bookingForFamily = selectedBeneficiary !== "self";
  const nameFieldLocked = bookingForFamily;

  useEffect(() => {
    if (!selectedDay || !selectedSlot || !slotGridRef.current) return;
    const button = slotGridRef.current.querySelector<HTMLButtonElement>(
      `[data-slot-label="${selectedSlot}"]`
    );
    button?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [selectedDay, selectedSlot, slotsLoading]);

  function updateDetail<K extends keyof PatientDetails>(key: K, value: PatientDetails[K]) {
    setDetails((prev) => ({ ...prev, [key]: value }));
  }

  function canContinueFromStep1() {
    return Boolean(selectedDate && selectedSlot && selectedScheduledAt);
  }

  function canPay() {
    return Boolean(
      details.fullName.trim() &&
        details.phone.trim() &&
        details.email.trim() &&
        details.concern.trim() &&
        consentGiven &&
        selectedScheduledAt
    );
  }

  async function handlePay() {
    setSubmitError(null);
    if (!canPay()) {
      if (!consentGiven) {
        setConsentError(true);
        setSubmitError("Please accept telemedicine consent before payment.");
      } else {
        setSubmitError("Please complete all required fields.");
      }
      return;
    }

    setIsPaying(true);
    try {
      sendAcknowledgementInBackground({
        doctorSlug: doctor.slug,
        patientName: details.fullName.trim(),
        patientEmail: details.email.trim(),
        patientWhatsApp: details.phone.trim(),
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        concern: details.concern.trim(),
      });

      const orderResponse = await fetch("/api/bookings/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorSlug: doctor.slug,
          scheduledAt: selectedScheduledAt,
          consultationType: consultType,
          patientName: details.fullName.trim(),
          patientEmail: details.email.trim(),
          patientPhone: details.phone.trim(),
          concern: details.concern.trim(),
          consentGiven: true,
          familyMemberId: bookingForFamily ? selectedBeneficiary : undefined,
          secondOpinionForBookingId: secondOpinion?.originalBookingId,
        }),
      });

      const orderData = (await orderResponse.json()) as {
        error?: string;
        orderId?: string;
        bookingId?: string;
        paymentSessionId?: string;
        cashfreeMode?: string;
      };

      if (!orderResponse.ok) {
        throw new Error(orderData.error || "Unable to create booking order.");
      }
      if (!orderData.paymentSessionId || !window.Cashfree) {
        throw new Error("Payment session unavailable. Please try again.");
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

      const verifyResponse = await fetch("/api/bookings/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderData.orderId,
          bookingId: orderData.bookingId,
        }),
      });

      if (!verifyResponse.ok) {
        setSubmitError("Payment completed but verification failed. Contact support with your receipt.");
        return;
      }

      setPaymentSuccess(true);
      setTimeout(() => {
        setOpen(false);
        const shareParam = secondOpinion && orderData.bookingId
          ? `?shareSecondOpinion=${orderData.bookingId}`
          : "";
        router.push(`/dashboard/patient${shareParam}`);
        router.refresh();
      }, 1200);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Payment failed.");
    } finally {
      setIsPaying(false);
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setTimeout(() => {
        setStep(1);
        setSlotsData(null);
        setSelectedDate("");
        setSelectedSlot("");
        setSelectedScheduledAt("");
        setConsultType("VIDEO");
        setDetails(initialDetails);
        setConsentGiven(false);
        setConsentError(false);
        setSubmitError(null);
        setPaymentSuccess(false);
        setSelectedBeneficiary("self");
        setFamilyMembers([]);
      }, 150);
    }
  }

  const consultTypes = slotsData?.consultTypes ?? (["VIDEO"] as ConsultType[]);

  return (
    <>
      <Script src="https://sdk.cashfree.com/js/v3/cashfree.js" strategy="lazyOnload" />
      <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
        <DialogPrimitive.Trigger
          render={
            <Button
              size={triggerSize}
              variant={triggerVariant}
              className={cn("gap-1 shadow-sm", triggerClassName)}
            >
              {triggerLabel} <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          }
        />
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm data-ending-style:opacity-0 data-starting-style:opacity-0 transition-opacity duration-150" />
          <DialogPrimitive.Popup
            className={cn(
              "fixed left-1/2 top-1/2 z-50 flex max-h-[92vh] w-[calc(100vw-1rem)] max-w-[680px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-2xl",
              "duration-150 transition data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:scale-95 data-starting-style:scale-95"
            )}
          >
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
              <DialogPrimitive.Title className="font-heading text-xl font-semibold text-slate-900 sm:text-2xl">
                Book Consultation
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-sm text-slate-600">
                with {doctor.name} · {doctor.credentials}
                {isSecondOpinionBooking ? (
                  <span className="mt-1 block text-violet-700 font-medium">
                    Second opinion · prior consult with {secondOpinion?.originalDoctorName}
                  </span>
                ) : null}
              </DialogPrimitive.Description>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold">
                <div
                  className={cn(
                    "rounded-lg border px-3 py-2 text-center",
                    step === 1
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 text-slate-500"
                  )}
                >
                  1. Choose slot
                </div>
                <div
                  className={cn(
                    "rounded-lg border px-3 py-2 text-center",
                    step === 2
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 text-slate-500"
                  )}
                >
                  2. Details &amp; pay
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
              {isSameOriginalDoctor ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  Second opinion must be with a different doctor. You previously consulted{" "}
                  {secondOpinion?.originalDoctorName}.
                </div>
              ) : null}

              {paymentSuccess ? (
                <div className="py-10 text-center">
                  <p className="text-lg font-semibold text-emerald-700">Payment successful!</p>
                  <p className="mt-1 text-sm text-slate-600">Redirecting to your dashboard…</p>
                </div>
              ) : null}

              {!paymentSuccess && !isSameOriginalDoctor && step === 1 ? (
                <div className="grid gap-5 lg:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Available slots
                    </p>
                    {slotsLoading ? <div className="mt-3"><SlotSkeleton /></div> : null}
                    {slotsError ? (
                      <p className="mt-3 text-sm text-red-600">{slotsError}</p>
                    ) : null}
                    {!slotsLoading && slotsData ? (
                      <div className="mt-3 space-y-3">
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {slotsData.days.map((day) => (
                            <button
                              key={day.date}
                              type="button"
                              onClick={() => {
                                setSelectedDate(day.date);
                                setSelectedSlot("");
                                setSelectedScheduledAt("");
                              }}
                              className={cn(
                                "flex min-w-[4.5rem] flex-col items-center rounded-xl border px-2 py-2 text-center text-xs font-semibold transition-colors",
                                selectedDate === day.date
                                  ? "border-emerald-500 bg-emerald-500 text-white"
                                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-300"
                              )}
                            >
                              <span>{day.label.split(" ")[0]}</span>
                              <span className="text-[10px] opacity-80">
                                {day.label.split(" ").slice(1).join(" ")}
                              </span>
                            </button>
                          ))}
                        </div>
                        <div ref={slotGridRef} className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                          {(selectedDay?.slots ?? []).map((slot) => (
                            <button
                              key={`${selectedDate}-${slot.label}`}
                              type="button"
                              data-slot-label={slot.label}
                              disabled={!slot.available}
                              onClick={() => {
                                setSelectedSlot(slot.label);
                                setSelectedScheduledAt(slot.scheduledAt);
                              }}
                              className={cn(
                                "h-10 rounded-xl border text-sm font-semibold transition-colors",
                                !slot.available && "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300",
                                slot.available &&
                                  selectedSlot === slot.label &&
                                  "border-emerald-500 bg-emerald-500 text-white",
                                slot.available &&
                                  selectedSlot !== slot.label &&
                                  "border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-400"
                              )}
                            >
                              {slot.label}
                              {slot.surgeMultiplier > 1 ? (
                                <span className="ml-1 text-[9px] font-bold text-amber-700">+{Math.round((slot.surgeMultiplier - 1) * 100)}%</span>
                              ) : null}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <SummaryPanel
                    doctor={doctor}
                    consultTypes={consultTypes}
                    consultType={consultType}
                    onConsultTypeChange={setConsultType}
                    consultFee={consultFee}
                    finalConsultFee={surchargedFee}
                    feePreview={feePreview}
                    selectedDate={selectedDate}
                    selectedSlot={selectedSlot}
                    isSecondOpinion={isSecondOpinionBooking}
                    surgeBadge={surgeBadge}
                    surgeMultiplier={surgeMultiplier}
                  />
                </div>
              ) : null}

              {!paymentSuccess && !isSameOriginalDoctor && step === 2 ? (
                <div className="grid gap-5 lg:grid-cols-2">
                  <SummaryPanel
                    doctor={doctor}
                    consultTypes={consultTypes}
                    consultType={consultType}
                    onConsultTypeChange={setConsultType}
                    consultFee={consultFee}
                    finalConsultFee={surchargedFee}
                    feePreview={feePreview}
                    selectedDate={selectedDate}
                    selectedSlot={selectedSlot}
                    compact
                    isSecondOpinion={isSecondOpinionBooking}
                    surgeBadge={surgeBadge}
                    surgeMultiplier={surgeMultiplier}
                  />
                  <div className="space-y-3">
                    {session?.user?.role === "PATIENT" ? (
                      <FamilyMemberPicker
                        members={familyMembers}
                        selectedId={selectedBeneficiary}
                        onSelect={setSelectedBeneficiary}
                      />
                    ) : null}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5 sm:col-span-2">
                        <Label htmlFor={`name-${doctor.slug}`}>
                          {bookingForFamily ? "Patient name" : "Full name"}
                        </Label>
                        <Input
                          id={`name-${doctor.slug}`}
                          value={details.fullName}
                          readOnly={nameFieldLocked}
                          onChange={(e) => updateDetail("fullName", e.target.value)}
                          className={cn(
                            "h-11 rounded-xl bg-slate-50",
                            nameFieldLocked && "cursor-not-allowed opacity-90"
                          )}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`phone-${doctor.slug}`}>WhatsApp</Label>
                        <Input
                          id={`phone-${doctor.slug}`}
                          value={details.phone}
                          onChange={(e) => updateDetail("phone", e.target.value)}
                          className="h-11 rounded-xl bg-slate-50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`email-${doctor.slug}`}>Email</Label>
                        <Input
                          id={`email-${doctor.slug}`}
                          type="email"
                          value={details.email}
                          onChange={(e) => updateDetail("email", e.target.value)}
                          className="h-11 rounded-xl bg-slate-50"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`concern-${doctor.slug}`}>Health concern</Label>
                      <Textarea
                        id={`concern-${doctor.slug}`}
                        rows={3}
                        value={details.concern}
                        onChange={(e) => updateDetail("concern", e.target.value)}
                        placeholder="Briefly describe your symptoms"
                        className="rounded-xl bg-slate-50"
                      />
                    </div>
                    <TelemedicineConsentCheckbox
                      id={`consent-${doctor.slug}`}
                      checked={consentGiven}
                      onCheckedChange={(checked) => {
                        setConsentGiven(checked);
                        if (checked) setConsentError(false);
                      }}
                      error={consentError}
                    />
                  </div>
                </div>
              ) : null}

              {submitError ? (
                <p className="mt-3 text-sm font-medium text-red-600">{submitError}</p>
              ) : null}
            </div>

            {!paymentSuccess ? (
              <div className="border-t border-slate-100 bg-white p-4 sm:px-6">
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <DialogPrimitive.Close
                    render={
                      <Button type="button" variant="outline" className="rounded-xl" disabled={isPaying}>
                        Cancel
                      </Button>
                    }
                  />
                  {step === 1 ? (
                    <Button
                      type="button"
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-500"
                      disabled={!canContinueFromStep1() || slotsLoading}
                      onClick={() => {
                        setSubmitError(null);
                        if (!canContinueFromStep1()) {
                          setSubmitError("Please select a date and time slot.");
                          return;
                        }
                        setStep(2);
                      }}
                    >
                      Continue
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-xl"
                        disabled={isPaying}
                        onClick={() => setStep(1)}
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-500 sm:min-w-[160px]"
                        disabled={isPaying || !canPay()}
                        onClick={() => void handlePay()}
                      >
                        {isPaying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Redirecting to payment…
                          </>
                        ) : (
                          `Pay ₹${feePreview.totalPatientPays.toLocaleString("en-IN")}`
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ) : null}
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}

function SummaryPanel({
  doctor,
  consultTypes,
  consultType,
  onConsultTypeChange,
  consultFee,
  finalConsultFee,
  feePreview,
  selectedDate,
  selectedSlot,
  compact,
  isSecondOpinion,
  surgeBadge,
  surgeMultiplier = 1,
}: {
  doctor: DoctorRecord;
  consultTypes: ConsultType[];
  consultType: ConsultType;
  onConsultTypeChange: (type: ConsultType) => void;
  consultFee: number;
  finalConsultFee: number;
  feePreview: ReturnType<typeof calculateDoctorPayout>;
  selectedDate: string;
  selectedSlot: string;
  compact?: boolean;
  isSecondOpinion?: boolean;
  surgeBadge?: string | null;
  surgeMultiplier?: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
          <Stethoscope className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">{doctor.name}</p>
          <p className="text-xs text-slate-600">{doctor.credentials}</p>
        </div>
      </div>

      {!compact ? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Consult type</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {consultTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onConsultTypeChange(type)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  consultType === type
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
                )}
              >
                {CONSULT_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4 space-y-1.5 text-sm text-slate-700">
        {selectedDate && selectedSlot ? (
          <p>
            <span className="font-medium text-slate-900">Slot:</span> {selectedDate} · {selectedSlot}
          </p>
        ) : (
          <p className="text-slate-500">Select a slot to continue</p>
        )}
        <p>
          <span className="font-medium text-slate-900">Consult fee:</span>{" "}
          {surgeMultiplier > 1 ? (
            <>
              <span className="text-slate-400 line-through">₹{consultFee.toLocaleString("en-IN")}</span>{" "}
              <span>₹{finalConsultFee.toLocaleString("en-IN")}</span>
            </>
          ) : (
            <>₹{consultFee.toLocaleString("en-IN")}</>
          )}
          {isSecondOpinion ? (
            <span className="ml-1 text-xs text-violet-700">(+15% second opinion)</span>
          ) : null}
        </p>
        {surgeBadge ? (
          <p className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
            {surgeBadge}
          </p>
        ) : null}
        <p>
          <span className="font-medium text-slate-900">You pay:</span> ₹
          {feePreview.totalPatientPays.toLocaleString("en-IN")}
          <span className="text-xs text-slate-500"> (incl. GST)</span>
        </p>
        <p className="text-xs text-emerald-700">Health Pass discounts apply automatically at checkout.</p>
      </div>
    </div>
  );
}
