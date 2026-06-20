"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, FlaskConical, Loader2 } from "lucide-react";
import { LAB_TEST_PANELS } from "@/data/lab-test-panels";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LabTestBookingFormProps = {
  defaultCity?: string;
  defaultPhone?: string;
  bookingId?: string;
  suggestedPanelId?: string;
  className?: string;
};

export function LabTestBookingForm({
  defaultCity = "",
  defaultPhone = "",
  bookingId,
  suggestedPanelId,
  className,
}: LabTestBookingFormProps) {
  const [panelId, setPanelId] = useState(suggestedPanelId ?? LAB_TEST_PANELS[0]?.id ?? "basic");
  const [city, setCity] = useState(defaultCity);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState(defaultPhone);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/lab-tests/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ panelId, city, address, phone, bookingId }),
      });
      const data = (await response.json()) as { error?: string; affiliateUrl?: string };

      if (!response.ok || !data.affiliateUrl) {
        setError(data.error ?? "Unable to create lab test request.");
        return;
      }

      window.open(data.affiliateUrl, "_blank", "noopener,noreferrer");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const selectedPanel = LAB_TEST_PANELS.find((panel) => panel.id === panelId);

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-5", className)}>
      <div className="grid gap-3 sm:grid-cols-2">
        {LAB_TEST_PANELS.map((panel) => (
          <label
            key={panel.id}
            className={cn(
              "cursor-pointer rounded-xl border p-4 transition-colors",
              panelId === panel.id
                ? "border-emerald-500 bg-emerald-50"
                : "border-slate-200 bg-white hover:border-emerald-200"
            )}
          >
            <input
              type="radio"
              name="panel"
              value={panel.id}
              checked={panelId === panel.id}
              onChange={() => setPanelId(panel.id)}
              className="sr-only"
            />
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-900">{panel.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{panel.description}</p>
              </div>
              <span className="shrink-0 text-xs font-semibold text-emerald-700">{panel.priceHint}</span>
            </div>
            <p className="mt-2 text-xs text-slate-600">{panel.tests.join(" · ")}</p>
          </label>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-slate-700">City *</span>
          <input
            required
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="e.g. Hyderabad"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Phone</span>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="For phlebotomist callback"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="font-medium text-slate-700">Home collection address (optional)</span>
        <textarea
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          rows={2}
          placeholder="Flat, street, landmark"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
        />
      </label>

      {selectedPanel ? (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
          You will be redirected to our lab partner to complete booking for{" "}
          <strong>{selectedPanel.name}</strong>. TechDrHealth earns a referral fee at no extra cost to
          you.
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={loading} className="rounded-xl">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating request...
            </>
          ) : (
            <>
              <FlaskConical className="mr-2 h-4 w-4" />
              Book lab tests
              <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </>
          )}
        </Button>
        <Button type="button" variant="outline" asChild className="rounded-xl">
          <Link href="/dashboard/patient/lab-tests">View my requests</Link>
        </Button>
      </div>
    </form>
  );
}
