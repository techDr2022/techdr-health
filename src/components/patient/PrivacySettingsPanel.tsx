"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type ConsentState = {
  marketingConsent: boolean;
  marketingConsentAt: string | null;
  dataDeleteRequested: boolean;
  dataDeleteRequestedAt: string | null;
};

export function PrivacySettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [consent, setConsent] = useState<ConsentState | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/patient/update-consent");
        if (!res.ok) throw new Error("Failed to load settings");
        const data = (await res.json()) as ConsentState;
        setConsent(data);
      } catch {
        toast.error("Unable to load privacy settings.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function updateMarketingConsent(marketingConsent: boolean) {
    setSaving(true);
    try {
      const res = await fetch("/api/patient/update-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketingConsent }),
      });
      const data = (await res.json()) as ConsentState & { error?: string };
      if (!res.ok) throw new Error(data.error || "Update failed");
      setConsent({
        marketingConsent: data.marketingConsent,
        marketingConsentAt: data.marketingConsentAt,
        dataDeleteRequested: consent?.dataDeleteRequested ?? false,
        dataDeleteRequestedAt: consent?.dataDeleteRequestedAt ?? null,
      });
      toast.success(marketingConsent ? "Marketing emails enabled." : "Marketing emails disabled.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update consent.");
    } finally {
      setSaving(false);
    }
  }

  async function exportData() {
    setExporting(true);
    try {
      const res = await fetch("/api/patient/data-export");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `techdrhealth-data-${Date.now()}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Your data export has started.");
    } catch {
      toast.error("Unable to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  async function requestDeletion() {
    if (!window.confirm("Request deletion of your personal data? We will respond within 30 days per DPDPA.")) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch("/api/patient/request-deletion", { method: "POST" });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Request failed");
      toast.success(data.message || "Deletion request submitted.");
      setConsent((prev) =>
        prev
          ? {
              ...prev,
              dataDeleteRequested: true,
              dataDeleteRequestedAt: new Date().toISOString(),
            }
          : prev
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to submit request.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading privacy settings...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900">Marketing communications</h2>
            <p className="mt-1 text-sm text-slate-600">
              Receive health tips, follow-up reminders, and platform updates by email.
            </p>
            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
              <Checkbox
                checked={consent?.marketingConsent ?? false}
                disabled={saving}
                onCheckedChange={(value) => void updateMarketingConsent(value === true)}
              />
              <span className="text-sm text-slate-700">
                I agree to receive marketing and health engagement emails from TechDrHealth.
                {consent?.marketingConsentAt ? (
                  <span className="mt-1 block text-xs text-slate-500">
                    Consent recorded: {new Date(consent.marketingConsentAt).toLocaleString("en-IN")}
                  </span>
                ) : null}
              </span>
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Your data rights (DPDPA)</h2>
        <p className="mt-1 text-sm text-slate-600">
          Download a copy of your data or request deletion under the Digital Personal Data Protection Act, 2023.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="outline" disabled={exporting} onClick={() => void exportData()}>
            {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Download my data
          </Button>
          <Button
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50"
            disabled={deleting || consent?.dataDeleteRequested}
            onClick={() => void requestDeletion()}
          >
            {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            {consent?.dataDeleteRequested ? "Deletion requested" : "Request data deletion"}
          </Button>
        </div>
        {consent?.dataDeleteRequested && consent.dataDeleteRequestedAt ? (
          <p className="mt-3 text-xs text-slate-500">
            Request submitted on {new Date(consent.dataDeleteRequestedAt).toLocaleString("en-IN")}. We will respond
            within 30 days.
          </p>
        ) : null}
        <p className="mt-3 text-xs text-slate-500">
          Read our{" "}
          <Link href="/privacy-policy" className="font-semibold text-emerald-700 hover:underline">
            Privacy Policy
          </Link>
          ,{" "}
          <Link href="/telemedicine-consent" className="font-semibold text-emerald-700 hover:underline">
            Telemedicine Consent
          </Link>
          , and{" "}
          <Link href="/grievance" className="font-semibold text-emerald-700 hover:underline">
            Grievance Redressal
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
