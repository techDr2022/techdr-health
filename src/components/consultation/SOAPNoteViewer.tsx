"use client";

import { useState } from "react";
import { Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";
import type { SoapNoteClient } from "@/lib/soap-notes";

type SOAPNoteViewerProps = {
  bookingId: string;
  note: SoapNoteClient;
  canShare?: boolean;
};

const SECTIONS = [
  { key: "subjective" as const, title: "Subjective" },
  { key: "objective" as const, title: "Objective" },
  { key: "assessment" as const, title: "Assessment" },
  { key: "plan" as const, title: "Plan" },
];

export function SOAPNoteViewer({ bookingId, note: initialNote, canShare }: SOAPNoteViewerProps) {
  const [note, setNote] = useState(initialNote);
  const [sharing, setSharing] = useState(false);

  async function toggleShare(share: boolean) {
    setSharing(true);
    try {
      const response = await fetch(`/api/soap-notes/${bookingId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ share }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || "Unable to update sharing");
      }
      const data = (await response.json()) as { note: SoapNoteClient };
      setNote(data.note);
      toast.success(share ? "Note shared with patient" : "Sharing removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Share update failed");
    } finally {
      setSharing(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">SOAP Note</h2>
          <p className="mt-1 text-xs text-slate-500">
            {note.finalized
              ? `Finalized ${note.finalizedat ? new Date(note.finalizedat).toLocaleString("en-IN") : ""}`
              : "Draft — not finalized"}
            {note.aidraftused ? " · AI draft used" : ""}
          </p>
        </div>
        {canShare && note.finalized ? (
          <button
            type="button"
            disabled={sharing}
            onClick={() => void toggleShare(!note.patientshared)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {sharing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            {note.patientshared ? "Revoke patient access" : "Share with patient"}
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map(({ key, title }) => (
          <div key={key} className={key === "plan" ? "sm:col-span-2" : ""}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</h3>
            <p className="mt-2 text-sm text-slate-800 whitespace-pre-wrap">{note[key]?.trim() || "—"}</p>
          </div>
        ))}
      </div>

      {note.patientshared ? (
        <p className="text-xs text-emerald-700">
          Visible to patient
          {note.sharedat ? ` since ${new Date(note.sharedat).toLocaleString("en-IN")}` : ""}
        </p>
      ) : canShare ? (
        <p className="text-xs text-slate-500">Not shared with patient yet.</p>
      ) : null}
    </section>
  );
}
