"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Stethoscope, Video, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TelemedicineConsentCheckbox } from "@/components/consent/TelemedicineConsentCheckbox";
import { SPECIALTIES } from "@/data/specialties";
import { cn } from "@/lib/utils";

type QueueStatus = {
  queueId: string;
  status: "WAITING" | "MATCHED" | "EXPIRED" | "CANCELLED";
  estimatedWaitMinutes: number;
  bookingId?: string | null;
  doctorName?: string | null;
  paymentRequired?: boolean;
  totalPatientPays?: number | null;
  waitingRoomUrl?: string | null;
};

export function InstantConsultClient() {
  const router = useRouter();
  const [specialtySlug, setSpecialtySlug] = useState("general-medicine");
  const [concern, setConcern] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);

  const pollStatus = useCallback(async (queueId: string) => {
    const response = await fetch(`/api/instant-consult/status/${queueId}`);
    const data = (await response.json()) as QueueStatus & { error?: string };
    if (!response.ok) {
      throw new Error(data.error || "Unable to fetch queue status.");
    }
    setQueueStatus(data);
    return data;
  }, []);

  useEffect(() => {
    if (!queueStatus?.queueId || queueStatus.status !== "WAITING") return;
    const timer = window.setInterval(() => {
      void pollStatus(queueStatus.queueId).catch((err) => {
        setError(err instanceof Error ? err.message : "Status update failed.");
      });
    }, 5000);
    return () => window.clearInterval(timer);
  }, [pollStatus, queueStatus?.queueId, queueStatus?.status]);

  async function handleJoin() {
    if (!consentGiven) {
      setConsentError(true);
      return;
    }
    setBusy(true);
    setError(null);
    setConsentError(false);
    try {
      const response = await fetch("/api/instant-consult/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialtySlug, concern }),
      });
      const data = (await response.json()) as QueueStatus & { error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to join queue.");
      setQueueStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to join queue.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    if (!queueStatus?.queueId) return;
    setBusy(true);
    try {
      const response = await fetch("/api/instant-consult/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queueId: queueStatus.queueId }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Unable to cancel.");
      }
      setQueueStatus(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to cancel.");
    } finally {
      setBusy(false);
    }
  }

  async function handlePayAndJoin() {
    if (!queueStatus?.bookingId) return;
    setPaying(true);
    setError(null);
    try {
      const payResponse = await fetch("/api/instant-consult/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: queueStatus.bookingId }),
      });
      const payData = (await payResponse.json()) as {
        error?: string;
        alreadyPaid?: boolean;
        waitingRoomUrl?: string;
        paymentSessionId?: string;
        orderId?: string;
        cashfreeMode?: string;
      };
      if (!payResponse.ok) throw new Error(payData.error || "Payment setup failed.");

      if (payData.alreadyPaid && payData.waitingRoomUrl) {
        router.push(payData.waitingRoomUrl);
        return;
      }

      if (!window.Cashfree || !payData.paymentSessionId) {
        throw new Error("Payment SDK not ready. Refresh and try again.");
      }

      const cashfree = window.Cashfree({
        mode: payData.cashfreeMode === "PROD" ? "production" : "sandbox",
      });
      const checkout = await cashfree.checkout({
        paymentSessionId: payData.paymentSessionId,
        redirectTarget: "_self",
      });
      if (checkout.error) {
        throw new Error(checkout.error.message || "Payment was not completed.");
      }

      const verifyResponse = await fetch("/api/bookings/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: payData.orderId,
          bookingId: queueStatus.bookingId,
        }),
      });
      if (!verifyResponse.ok) {
        throw new Error("Payment succeeded but verification failed. Contact support.");
      }

      router.push(payData.waitingRoomUrl || `/consultation/${queueStatus.bookingId}/waiting`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed.");
    } finally {
      setPaying(false);
    }
  }

  if (queueStatus?.status === "MATCHED") {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
            <Video className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-slate-900">Doctor matched</h2>
            <p className="mt-1 text-sm text-slate-600">
              {queueStatus.doctorName
                ? `${queueStatus.doctorName} is ready for your instant video consult.`
                : "A doctor is ready for your instant video consult."}
            </p>
            {queueStatus.paymentRequired ? (
              <p className="mt-2 text-sm font-medium text-slate-800">
                Pay INR {queueStatus.totalPatientPays?.toLocaleString("en-IN") ?? "—"} to enter the waiting room.
              </p>
            ) : null}
          </div>
        </div>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        <div className="mt-5 flex flex-wrap gap-3">
          {queueStatus.paymentRequired ? (
            <Button onClick={handlePayAndJoin} disabled={paying}>
              {paying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing payment…
                </>
              ) : (
                "Pay & join waiting room"
              )}
            </Button>
          ) : (
            <Button
              onClick={() =>
                router.push(queueStatus.waitingRoomUrl || `/consultation/${queueStatus.bookingId}/waiting`)
              }
            >
              Enter waiting room
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (queueStatus?.status === "WAITING") {
    return (
      <div className="rounded-3xl border border-sky-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Finding a doctor…</h2>
            <p className="text-sm text-slate-600">
              Estimated wait: ~{queueStatus.estimatedWaitMinutes} min. We&apos;ll match you with the next available
              specialist.
            </p>
          </div>
        </div>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        <Button variant="outline" className="mt-5" onClick={handleCancel} disabled={busy}>
          <XCircle className="mr-2 h-4 w-4" />
          Cancel queue
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-sky-100 p-2 text-sky-700">
          <Stethoscope className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Choose a specialty</h2>
          <p className="mt-1 text-sm text-slate-600">
            Connect with the next available verified doctor — no slot booking required.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {SPECIALTIES.slice(0, 12).map((specialty) => (
          <button
            key={specialty.slug}
            type="button"
            onClick={() => setSpecialtySlug(specialty.slug)}
            className={cn(
              "rounded-xl border px-3 py-2 text-left text-sm transition",
              specialtySlug === specialty.slug
                ? "border-sky-500 bg-sky-50 font-semibold text-sky-900"
                : "border-slate-200 hover:border-sky-300"
            )}
          >
            {specialty.name}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-2">
        <Label htmlFor="instant-concern">Brief concern (optional)</Label>
        <Textarea
          id="instant-concern"
          value={concern}
          onChange={(event) => setConcern(event.target.value)}
          placeholder="Describe your symptoms in a sentence or two"
          rows={3}
        />
      </div>

      <div className="mt-4">
        <TelemedicineConsentCheckbox
          checked={consentGiven}
          onCheckedChange={(checked) => {
            setConsentGiven(checked);
            if (checked) setConsentError(false);
          }}
          error={consentError}
        />
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <Button className="mt-5" onClick={handleJoin} disabled={busy}>
        {busy ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Joining queue…
          </>
        ) : (
          "Find doctor now"
        )}
      </Button>
    </div>
  );
}
