"use client";

import Script from "next/script";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key?: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: { color: string };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

function parseTimeSlotTo24h(slot: string) {
  const normalized = slot.trim().toUpperCase();
  const match = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (!match) return null;

  const hour12 = Number(match[1]);
  const minute = Number(match[2]);
  const meridian = match[3];

  if (Number.isNaN(hour12) || Number.isNaN(minute) || hour12 < 1 || hour12 > 12) {
    return null;
  }

  const hour24 = meridian === "PM" ? (hour12 % 12) + 12 : hour12 % 12;
  return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function toScheduledAtISO(date: string, slot: string) {
  const hhmm = parseTimeSlotTo24h(slot);
  if (!hhmm) return null;
  return `${date}T${hhmm}:00+05:30`;
}

export function ConsultPaymentClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const details = useMemo(
    () => ({
      doctorSlug: searchParams.get("doctorSlug") ?? "",
      doctorName: searchParams.get("doctorName") ?? "",
      patientName: searchParams.get("patientName") ?? "",
      patientEmail: searchParams.get("patientEmail") ?? "",
      patientPhone: searchParams.get("patientPhone") ?? "",
      appointmentDate: searchParams.get("appointmentDate") ?? "",
      timeSlot: searchParams.get("timeSlot") ?? "",
    }),
    [searchParams]
  );

  const canPay = Boolean(
    details.doctorSlug &&
      details.patientName &&
      details.patientEmail &&
      details.patientPhone &&
      details.appointmentDate &&
      details.timeSlot
  );

  useEffect(() => {
    if (!isPaid) return;
    const timer = window.setTimeout(() => {
      router.push("/dashboard/patient");
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [isPaid, router]);

  async function handlePayNow() {
    setError(null);
    if (!canPay) {
      setError("Booking details are missing. Please fill the form again.");
      return;
    }

    const scheduledAt = toScheduledAtISO(details.appointmentDate, details.timeSlot);
    if (!scheduledAt) {
      setError("Invalid appointment slot. Please choose a valid date and time.");
      return;
    }

    try {
      setIsBusy(true);
      const orderResponse = await fetch("/api/bookings/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorSlug: details.doctorSlug,
          scheduledAt,
        }),
      });

      if (!orderResponse.ok) {
        const payload = (await orderResponse.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error || "Unable to create payment order.");
      }

      const orderData = (await orderResponse.json()) as {
        orderId: string;
        bookingId: string;
        amount: number;
        currency: string;
        keyId?: string;
      };

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK is not loaded. Please refresh and try again.");
      }

      const payment = new window.Razorpay({
        key: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "techDr Tele Health",
        description: "Video consultation booking",
        order_id: orderData.orderId,
        prefill: {
          name: details.patientName,
          email: details.patientEmail,
          contact: details.patientPhone,
        },
        theme: { color: "#06b6d4" },
        handler: async (response) => {
          const verifyResponse = await fetch("/api/bookings/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              bookingId: orderData.bookingId,
            }),
          });

          if (!verifyResponse.ok) {
            setError("Payment completed but verification failed. Please contact support.");
            return;
          }

          setIsPaid(true);
        },
      });

      payment.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed. Please try again.");
    } finally {
      setIsBusy(false);
    }
  }

  if (isPaid) {
    return (
      <div className="mx-auto mt-8 max-w-2xl rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-xl shadow-emerald-100/60">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">Payment successful</h1>
        <p className="mt-2 text-sm text-slate-600">
          Your consultation slot is now reserved. Our care team will contact you with final confirmation.
        </p>
        <p className="mt-1 text-xs text-slate-500">Redirecting to your dashboard...</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/dashboard/patient">Go to dashboard</Link>
          </Button>
          <Button variant="outline" onClick={() => router.push("/consult")}>
            Book another consultation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="mx-auto mt-8 max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Step 2: Payment</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">Complete Razorpay payment</h1>
        <p className="mt-2 text-sm text-slate-600">
          Confirm your details and proceed with secure payment to reserve your video consultation slot.
        </p>

        <div className="mt-6 space-y-2 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4 text-sm text-slate-700">
          <p>
            <span className="font-semibold text-slate-900">Doctor:</span>{" "}
            {details.doctorName || details.doctorSlug || "-"}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Patient:</span> {details.patientName || "-"}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Email:</span> {details.patientEmail || "-"}
          </p>
          <p>
            <span className="font-semibold text-slate-900">WhatsApp:</span> {details.patientPhone || "-"}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Date:</span> {details.appointmentDate || "-"}
          </p>
          <p>
            <span className="font-semibold text-slate-900">Time:</span> {details.timeSlot || "-"}
          </p>
        </div>

        <Button
          onClick={handlePayNow}
          disabled={isBusy || !canPay}
          className="mt-6 h-12 w-full rounded-xl bg-cyan-500 text-sm font-bold text-slate-950 hover:bg-cyan-400"
        >
          {isBusy ? "Opening payment..." : "Pay with Razorpay"}
        </Button>

        {error ? <p className="mt-3 text-sm font-medium text-red-600">{error}</p> : null}
      </div>
    </>
  );
}
