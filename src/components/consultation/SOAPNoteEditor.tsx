"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Loader2, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { SoapNoteClient } from "@/lib/soap-notes";

type SOAPNoteEditorProps = {
  bookingId: string;
  role: "doctor" | "patient";
  consultType: string;
  initialNote?: SoapNoteClient | null;
  joinToken?: string | null;
  onFinalized?: (note: SoapNoteClient) => void;
};

const FIELDS = [
  { key: "subjective" as const, label: "S — Subjective", hint: "Patient history & symptoms" },
  { key: "objective" as const, label: "O — Objective", hint: "Exam findings & vitals" },
  { key: "assessment" as const, label: "A — Assessment", hint: "Diagnosis / impression" },
  { key: "plan" as const, label: "P — Plan", hint: "Treatment & follow-up" },
];

const EMPTY: SoapNoteClient = {
  subjective: "",
  objective: "",
  assessment: "",
  plan: "",
  aidraftused: false,
  finalized: false,
  finalizedat: null,
  patientshared: false,
  sharedat: null,
  updatedAt: new Date().toISOString(),
};

export function SOAPNoteEditor({
  bookingId,
  role,
  consultType,
  initialNote,
  joinToken,
  onFinalized,
}: SOAPNoteEditorProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [note, setNote] = useState<SoapNoteClient>(initialNote || EMPTY);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initialNote?.updatedAt ?? null);
  const noteRef = useRef(note);
  const dirtyRef = useRef(dirty);

  useEffect(() => {
    noteRef.current = note;
  }, [note]);

  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  const canEdit = role === "doctor" && !note.finalized;

  const saveNote = useCallback(
    async (silent = false) => {
      if (!canEdit || !dirtyRef.current) return;
      setSaving(true);
      try {
        const current = noteRef.current;
        const response = await fetch(`/api/soap-notes/${bookingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subjective: current.subjective,
            objective: current.objective,
            assessment: current.assessment,
            plan: current.plan,
            joinToken: joinToken || undefined,
          }),
        });
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(payload.error || "Save failed");
        }
        const data = (await response.json()) as { note: SoapNoteClient };
        setNote(data.note);
        setDirty(false);
        setLastSavedAt(data.note.updatedAt);
        if (!silent) toast.success("SOAP note saved");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to save";
        if (!silent) toast.error(message);
      } finally {
        setSaving(false);
      }
    },
    [bookingId, canEdit, joinToken]
  );

  useEffect(() => {
    if (!canEdit) return;
    const interval = window.setInterval(() => {
      void saveNote(true);
    }, 30_000);
    return () => window.clearInterval(interval);
  }, [canEdit, saveNote]);

  function updateField(key: keyof SoapNoteClient, value: string) {
    if (!canEdit) return;
    setNote((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  async function generateDraft() {
    if (!canEdit) return;
    setDrafting(true);
    try {
      const response = await fetch("/api/ai/soap-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, joinToken: joinToken || undefined }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || "AI draft unavailable");
      }
      const data = (await response.json()) as { note: SoapNoteClient };
      setNote(data.note);
      setDirty(false);
      setLastSavedAt(data.note.updatedAt);
      toast.success("AI draft applied — review before finalizing");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI draft failed");
    } finally {
      setDrafting(false);
    }
  }

  async function finalizeNote() {
    if (!canEdit) return;
    await saveNote(true);
    setFinalizing(true);
    try {
      const response = await fetch(`/api/soap-notes/${bookingId}/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinToken: joinToken || undefined }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || "Finalize failed");
      }
      const data = (await response.json()) as { note: SoapNoteClient };
      setNote(data.note);
      setDirty(false);
      toast.success("SOAP note finalized");
      onFinalized?.(data.note);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to finalize");
    } finally {
      setFinalizing(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-white/[0.06] flex-none">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-white/70 hover:text-white"
        >
          {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          SOAP Note
          {note.finalized ? (
            <span className="inline-flex items-center gap-0.5 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] text-emerald-300">
              <Lock className="w-2.5 h-2.5" /> Final
            </span>
          ) : null}
        </button>
        <span className="text-[9px] text-white/30 truncate">
          {consultType}
          {lastSavedAt ? ` · ${new Date(lastSavedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : ""}
        </span>
      </div>

      {!collapsed ? (
        <>
          {role === "doctor" ? (
            <div className="flex flex-wrap gap-1.5 px-3 py-2 border-b border-white/[0.06] flex-none">
              <button
                type="button"
                disabled={!canEdit || drafting}
                onClick={() => void generateDraft()}
                className="inline-flex items-center gap-1 rounded-lg bg-violet-600/80 px-2.5 py-1.5 text-[10px] font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
              >
                {drafting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                AI Draft
              </button>
              <button
                type="button"
                disabled={!canEdit || saving}
                onClick={() => void saveNote()}
                className="rounded-lg border border-white/15 px-2.5 py-1.5 text-[10px] font-semibold text-white/80 hover:bg-white/[0.06] disabled:opacity-50"
              >
                {saving ? "Saving…" : dirty ? "Save now" : "Saved"}
              </button>
              <button
                type="button"
                disabled={!canEdit || finalizing}
                onClick={() => void finalizeNote()}
                className="rounded-lg bg-emerald-600/90 px-2.5 py-1.5 text-[10px] font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {finalizing ? "Finalizing…" : "Finalize"}
              </button>
            </div>
          ) : null}

          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2.5">
            {FIELDS.map(({ key, label, hint }) => (
              <div key={key}>
                <label className="block text-[10px] font-semibold text-white/50 mb-1">
                  {label}
                  <span className="font-normal text-white/30 ml-1">· {hint}</span>
                </label>
                {canEdit ? (
                  <textarea
                    value={note[key]}
                    onChange={(e) => updateField(key, e.target.value)}
                    rows={key === "plan" ? 3 : 2}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 text-[11px] text-white placeholder:text-white/25 focus:border-blue-400/40 focus:outline-none resize-none"
                    placeholder={`Enter ${label.split(" — ")[1]?.toLowerCase() || key}…`}
                  />
                ) : (
                  <p className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2 text-[11px] text-white/80 whitespace-pre-wrap min-h-[2.5rem]">
                    {note[key]?.trim() || "—"}
                  </p>
                )}
              </div>
            ))}
            {note.aidraftused && canEdit ? (
              <p className="text-[9px] text-violet-300/70">AI draft used — verify all sections before finalizing.</p>
            ) : null}
            {note.finalized && role === "patient" ? (
              <p className="text-[9px] text-emerald-300/70">Shared by your doctor for your records.</p>
            ) : null}
          </div>
        </>
      ) : (
        <p className="px-3 py-3 text-[10px] text-white/35 flex-none">Expand to view clinical documentation.</p>
      )}
    </div>
  );
}
