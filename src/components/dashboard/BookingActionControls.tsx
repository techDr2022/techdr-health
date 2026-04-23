"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type BookingActionControlsProps = {
  bookingId: string;
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  scheduledAtISO: string;
};

function toDateTimeLocalValue(isoValue: string) {
  const date = new Date(isoValue);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export function BookingActionControls({
  bookingId,
  status,
  scheduledAtISO,
}: BookingActionControlsProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<"CONFIRM" | "CANCEL" | "RESCHEDULE" | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [rescheduleAt, setRescheduleAt] = useState<string>(() =>
    toDateTimeLocalValue(scheduledAtISO)
  );
  const [reason, setReason] = useState("");

  const disabled = useMemo(() => status === "COMPLETED", [status]);

  async function manage(action: "CONFIRM" | "CANCEL" | "RESCHEDULE") {
    setError(null);
    setLoadingAction(action);
    try {
      const response = await fetch("/api/bookings/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          action,
          rescheduledAt: action === "RESCHEDULE" ? new Date(rescheduleAt).toISOString() : undefined,
          reason: reason.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "Failed to update booking");
      }

      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update booking");
    } finally {
      setLoadingAction(null);
    }
  }

  if (status === "CANCELLED" || status === "COMPLETED") {
    return <span className="text-xs text-muted-foreground">No action</span>;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        <Button
          size="sm"
          className="h-8 text-xs"
          disabled={disabled || loadingAction !== null}
          onClick={() => void manage("CONFIRM")}
        >
          {loadingAction === "CONFIRM" ? "Confirming..." : "Confirm"}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="h-8 text-xs"
          disabled={disabled || loadingAction !== null}
          onClick={() => void manage("CANCEL")}
        >
          {loadingAction === "CANCEL" ? "Cancelling..." : "Cancel"}
        </Button>
      </div>
      <Input
        type="datetime-local"
        value={rescheduleAt}
        onChange={(e) => setRescheduleAt(e.target.value)}
        className="h-8 text-xs"
        disabled={loadingAction !== null}
      />
      <Input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (optional)"
        className="h-8 text-xs"
        disabled={loadingAction !== null}
      />
      <Button
        size="sm"
        variant="outline"
        className="h-8 text-xs"
        disabled={disabled || loadingAction !== null || !rescheduleAt}
        onClick={() => void manage("RESCHEDULE")}
      >
        {loadingAction === "RESCHEDULE" ? "Rescheduling..." : "Reschedule"}
      </Button>
      {error ? <p className="text-[11px] text-red-600">{error}</p> : null}
    </div>
  );
}
