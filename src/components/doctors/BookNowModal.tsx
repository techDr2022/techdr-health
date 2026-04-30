"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { ArrowRight, CalendarClock } from "lucide-react";
import type { DoctorRecord } from "@/types/catalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const TIME_SLOTS = [
  "09:00 AM",
  "10:30 AM",
  "12:00 PM",
  "02:00 PM",
  "04:30 PM",
  "06:00 PM",
];

function formatDateForInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function slotToMinutes(slot: string) {
  const match = slot.trim().toUpperCase().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!match) return Number.NaN;
  const [, hh, mm, meridian] = match;
  const hour = Number(hh);
  const minutes = Number(mm);
  const hour24 = meridian === "PM" ? (hour % 12) + 12 : hour % 12;
  return hour24 * 60 + minutes;
}

type BookingState = {
  fullName: string;
  phone: string;
  email: string;
  appointmentDate: string;
  timeSlot: string;
  concern: string;
};

type BookingStep = 1 | 2;

const initialState: BookingState = {
  fullName: "",
  phone: "",
  email: "",
  appointmentDate: "",
  timeSlot: "",
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
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/bookings/acknowledge", blob);
      return;
    }
  } catch (error) {
    console.error("booking acknowledgement beacon failed", error);
  }

  void fetch("/api/bookings/acknowledge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch((error) => {
    console.error("booking acknowledgement background request failed", error);
  });
}

type BookNowModalProps = {
  doctor: DoctorRecord;
  triggerLabel?: string;
  triggerClassName?: string;
  triggerVariant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  triggerSize?: "default" | "sm" | "lg" | "icon";
};

export function BookNowModal({
  doctor,
  triggerLabel = "Book Now",
  triggerClassName,
  triggerVariant = "default",
  triggerSize = "sm",
}: BookNowModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<BookingState>(initialState);
  const [step, setStep] = useState<BookingStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const minDate = useMemo(() => formatDateForInput(new Date()), []);
  const visibleSlots = useMemo(() => {
    if (form.appointmentDate !== minDate) return TIME_SLOTS;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return TIME_SLOTS.filter((slot) => slotToMinutes(slot) >= currentMinutes);
  }, [form.appointmentDate, minDate]);

  useEffect(() => {
    if (form.timeSlot && !visibleSlots.includes(form.timeSlot)) {
      update("timeSlot", "");
    }
  }, [form.timeSlot, visibleSlots]);

  function update<K extends keyof BookingState>(key: K, value: BookingState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function canProceedToReview() {
    return Boolean(
      form.fullName &&
        form.phone &&
        form.email &&
        form.appointmentDate &&
        form.timeSlot &&
        form.concern
    );
  }

  async function handleProceedToCashfree() {
    setSubmitError(null);
    if (!canProceedToReview()) {
      return;
    }

    try {
      setIsSubmitting(true);
      sendAcknowledgementInBackground({
        doctorSlug: doctor.slug,
        patientName: form.fullName,
        patientEmail: form.email,
        patientWhatsApp: form.phone,
        appointmentDate: form.appointmentDate,
        timeSlot: form.timeSlot,
        concern: form.concern,
      });

      const paymentParams = new URLSearchParams({
        doctorSlug: doctor.slug,
        doctorName: doctor.name,
        patientName: form.fullName,
        patientEmail: form.email,
        patientPhone: form.phone,
        appointmentDate: form.appointmentDate,
        timeSlot: form.timeSlot,
        autopay: "1",
      });
      setOpen(false);
      router.push(`/consult/payment?${paymentParams.toString()}`);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to submit booking."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setTimeout(() => {
        setForm(initialState);
        setStep(1);
        setSubmitError(null);
      }, 150);
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Trigger
        render={
          <Button size={triggerSize} variant={triggerVariant} className={cn("gap-1 shadow-sm", triggerClassName)}>
            {triggerLabel} <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        }
      />
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/25 backdrop-blur-sm data-ending-style:opacity-0 data-starting-style:opacity-0 transition-opacity duration-150" />
        <DialogPrimitive.Popup
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100vw-1.5rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-emerald-100 bg-white shadow-2xl",
            "duration-150 transition data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:scale-95 data-starting-style:scale-95"
          )}
        >
          <div className="max-h-[85vh] overflow-y-auto p-5 sm:p-6">
            <div className="mb-5 border-b border-slate-100 pb-4">
              <DialogPrimitive.Title className="font-heading text-2xl font-semibold text-slate-900">
                Book Consultation
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1 text-sm text-slate-600">
                with {doctor.name} ({doctor.credentials})
              </DialogPrimitive.Description>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-semibold">
                <div
                  className={cn(
                    "rounded-lg border px-3 py-2 text-center",
                    step >= 1 ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-slate-200 text-slate-500"
                  )}
                >
                  1. Fill details
                </div>
                <div
                  className={cn(
                    "rounded-lg border px-3 py-2 text-center",
                    step >= 2 ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-slate-200 text-slate-500"
                  )}
                >
                  2. Review
                </div>
                <div
                  className={cn(
                    "rounded-lg border px-3 py-2 text-center",
                    isSubmitting ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-slate-200 text-slate-500"
                  )}
                >
                  3. Cashfree
                </div>
              </div>
            </div>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
              }}
            >
              {step === 1 ? (
                <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor={`fullName-${doctor.slug}`}>Full name</Label>
                  <Input
                    id={`fullName-${doctor.slug}`}
                    required
                    value={form.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    className="h-11 rounded-xl bg-slate-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`phone-${doctor.slug}`}>WhatsApp number</Label>
                  <Input
                    id={`phone-${doctor.slug}`}
                    required
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="h-11 rounded-xl bg-slate-50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`email-${doctor.slug}`}>Email</Label>
                <Input
                  id={`email-${doctor.slug}`}
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="h-11 rounded-xl bg-slate-50"
                />
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Consultation mode
                </p>
                <p className="mt-1 text-sm font-semibold text-emerald-900">Video consultation only</p>
                <p className="mt-1 text-xs text-emerald-700">Each appointment slot is 20 minutes.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`date-${doctor.slug}`}>Preferred date</Label>
                <div className="relative">
                  <CalendarClock className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    id={`date-${doctor.slug}`}
                    type="date"
                    min={minDate}
                    required
                    value={form.appointmentDate}
                    onChange={(e) => update("appointmentDate", e.target.value)}
                    className="h-11 rounded-xl bg-slate-50 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Preferred time slot</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {visibleSlots.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => update("timeSlot", slot)}
                      className={cn(
                        "h-10 rounded-xl border text-sm font-semibold transition-colors",
                        form.timeSlot === slot
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                {form.appointmentDate === minDate && visibleSlots.length === 0 ? (
                  <p className="text-xs text-slate-600">No slots left for today. Please pick another date.</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`concern-${doctor.slug}`}>Health concern</Label>
                <Textarea
                  id={`concern-${doctor.slug}`}
                  required
                  rows={3}
                  value={form.concern}
                  onChange={(e) => update("concern", e.target.value)}
                  placeholder="Briefly describe your symptoms or concern"
                  className="rounded-xl bg-slate-50"
                />
              </div>
                </>
              ) : null}

              {step === 2 ? (
                <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <p className="text-base font-semibold text-slate-900">Review your booking details</p>
                  <p>
                    <span className="font-semibold text-slate-900">Doctor:</span> {doctor.name}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Patient:</span> {form.fullName}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">WhatsApp:</span> {form.phone}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Email:</span> {form.email}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Date:</span> {form.appointmentDate}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Time slot:</span> {form.timeSlot}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Concern:</span> {form.concern}
                  </p>
                </div>
              ) : null}

              <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                <DialogPrimitive.Close
                  render={
                    <Button type="button" variant="outline" className="rounded-xl">
                      Cancel
                    </Button>
                  }
                />
                {step === 1 ? (
                  <Button
                    type="button"
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500"
                    onClick={() => {
                      setSubmitError(null);
                      if (!canProceedToReview()) {
                        setSubmitError("Please fill all required details before continuing.");
                        return;
                      }
                      setStep(2);
                    }}
                  >
                    Next: Review
                  </Button>
                ) : null}
                {step === 2 ? (
                  <>
                    <Button type="button" variant="outline" className="rounded-xl" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button
                      type="button"
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-500"
                      disabled={isSubmitting}
                      onClick={handleProceedToCashfree}
                    >
                      {isSubmitting ? "Redirecting..." : "Confirm & Pay"}
                    </Button>
                  </>
                ) : null}
              </div>
              {submitError ? (
                <p className="text-sm font-medium text-red-600">{submitError}</p>
              ) : null}
            </form>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
