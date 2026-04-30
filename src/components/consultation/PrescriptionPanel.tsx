"use client";

import { useEffect, useState } from "react";
import { Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Medicine = {
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
};

type PrescriptionData = {
  diagnosis?: string;
  medicines?: Medicine[];
  instructions?: string | null;
  followUpDate?: string | null;
  sentAt?: string | null;
};

interface PrescriptionPanelProps {
  bookingId: string;
  role: "doctor" | "patient";
  initialData?: PrescriptionData | null;
  onSent?: (data: PrescriptionData) => void;
}

const EMPTY_MED: Medicine = { name: "", dosage: "", duration: "", instructions: "" };

export function PrescriptionPanel({ bookingId, role, initialData, onSent }: PrescriptionPanelProps) {
  const [diagnosis, setDiagnosis] = useState(initialData?.diagnosis || "");
  const [medicines, setMedicines] = useState<Medicine[]>(initialData?.medicines || [EMPTY_MED]);
  const [instructions, setInstructions] = useState(initialData?.instructions || "");
  const [followUpDate, setFollowUpDate] = useState(initialData?.followUpDate?.split("T")[0] || "");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(Boolean(initialData?.sentAt));

  useEffect(() => {
    setDiagnosis(initialData?.diagnosis || "");
    setMedicines(initialData?.medicines || [EMPTY_MED]);
    setInstructions(initialData?.instructions || "");
    setFollowUpDate(initialData?.followUpDate?.split("T")[0] || "");
    setSent(Boolean(initialData?.sentAt));
  }, [initialData]);

  function addMedicine() {
    setMedicines((prev) => [...prev, { ...EMPTY_MED }]);
  }

  function removeMedicine(index: number) {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  }

  function updateMedicine(index: number, field: keyof Medicine, value: string) {
    setMedicines((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  async function sendPrescription() {
    if (!diagnosis.trim()) {
      toast.error("Please enter a diagnosis");
      return;
    }
    const preparedMedicines = medicines
      .map((m) => ({
        name: m.name.trim(),
        dosage: m.dosage.trim(),
        duration: m.duration.trim(),
        instructions: m.instructions.trim(),
      }))
      .filter((m) => m.name);

    if (!preparedMedicines.length) {
      toast.error("Please add at least one medicine");
      return;
    }
    if (preparedMedicines.some((m) => !m.dosage || !m.duration)) {
      toast.error("Please fill dosage and duration for each medicine");
      return;
    }
    if (preparedMedicines.some((m) => !m.name.trim())) {
      toast.error("Please fill all medicine names");
      return;
    }

    setSending(true);
    try {
      const payload = {
        bookingId,
        diagnosis: diagnosis.trim(),
        medicines: preparedMedicines,
        instructions: instructions.trim(),
        followUpDate: followUpDate || null,
      };
      const response = await fetch("/api/video/prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to send prescription");

      const nextData: PrescriptionData = {
        diagnosis,
        medicines: preparedMedicines,
        instructions: instructions.trim(),
        followUpDate: followUpDate || null,
        sentAt: new Date().toISOString(),
      };
      setSent(true);
      onSent?.(nextData);
      toast.success("Prescription sent to patient");
    } catch {
      toast.error("Failed to send prescription");
    } finally {
      setSending(false);
    }
  }

  if (role === "patient") {
    if (!initialData?.diagnosis) {
      return (
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div>
            <div className="text-3xl mb-3">📋</div>
            <p className="text-white/40 text-[13px]">Your prescription will appear here once doctor sends it.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="rounded-xl border border-blue-400/20 bg-blue-500/[0.07] px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-300">Digital Prescription</p>
          <p className="text-[11px] text-white/70 mt-0.5">Review medicine plan and follow-up details below.</p>
        </div>
        <div className="bg-green-500/[0.08] border border-green-400/15 rounded-xl p-3">
          <p className="text-green-400/80 text-[10px] font-semibold uppercase tracking-wide mb-1">
            Prescription from Doctor
          </p>
          <p className="text-white font-semibold text-[13px]">Diagnosis: {initialData.diagnosis}</p>
        </div>

        {(initialData.medicines || []).map((medicine, index) => (
          <div key={`${medicine.name}-${index}`} className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-white font-semibold text-[13px]">{medicine.name}</span>
              <span className="text-blue-300 text-[10px] font-semibold bg-blue-500/15 px-2 py-0.5 rounded-md">
                {medicine.duration}
              </span>
            </div>
            <p className="text-white/45 text-[11px]">Dosage: {medicine.dosage}</p>
            {medicine.instructions ? (
              <p className="text-white/45 text-[11px]">{medicine.instructions}</p>
            ) : null}
          </div>
        ))}

        {initialData.instructions ? (
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-3">
            <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wide mb-1">Instructions</p>
            <p className="text-white/70 text-[12px] leading-relaxed">{initialData.instructions}</p>
          </div>
        ) : null}

        {initialData.followUpDate ? (
          <div className="bg-amber-500/[0.06] border border-amber-400/15 rounded-xl p-3">
            <p className="text-amber-400/70 text-[10px] font-semibold uppercase tracking-wide mb-1">Follow-up</p>
            <p className="text-white font-semibold text-[13px]">
              {new Date(initialData.followUpDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
      <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-white/45">Prescription Builder</p>
        <p className="text-[11px] text-white/65 mt-0.5">Patient receives this instantly in consultation panel.</p>
      </div>
      <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/[0.08] px-3 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-300">Clinical Note</p>
        <p className="text-[11px] text-white/70 mt-0.5">
          Confirm diagnosis, dosage, and follow-up before sending to patient.
        </p>
      </div>
      <div>
        <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wide mb-1.5">Diagnosis *</label>
        <input
          value={diagnosis}
          onChange={(event) => setDiagnosis(event.target.value)}
          placeholder="e.g. Viral fever"
          className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-white text-[12px] outline-none focus:border-blue-400 transition-colors placeholder:text-white/20"
        />
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wide mb-1.5">Medicines</label>
        {medicines.map((medicine, index) => (
          <div key={`medicine-${index}`} className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-3 mb-2">
            <div className="flex gap-2 mb-2">
              <input
                value={medicine.name}
                onChange={(event) => updateMedicine(index, "name", event.target.value)}
                placeholder="Medicine name"
                className="flex-1 bg-white/[0.06] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-[12px] outline-none focus:border-blue-400 transition-colors placeholder:text-white/20"
              />
              {medicines.length > 1 ? (
                <button onClick={() => removeMedicine(index)} className="text-white/25 hover:text-red-400 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={medicine.dosage}
                onChange={(event) => updateMedicine(index, "dosage", event.target.value)}
                placeholder="Dosage (1-0-1)"
                className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-white/70 text-[11px] outline-none focus:border-blue-400 transition-colors placeholder:text-white/15"
              />
              <input
                value={medicine.duration}
                onChange={(event) => updateMedicine(index, "duration", event.target.value)}
                placeholder="Duration (5 days)"
                className="bg-white/[0.05] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-white/70 text-[11px] outline-none focus:border-blue-400 transition-colors placeholder:text-white/15"
              />
            </div>
            <input
              value={medicine.instructions}
              onChange={(event) => updateMedicine(index, "instructions", event.target.value)}
              placeholder="Instructions (after food, before sleep, etc.)"
              className="mt-2 w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-white/70 text-[11px] outline-none focus:border-blue-400 transition-colors placeholder:text-white/15"
            />
          </div>
        ))}
        <button
          onClick={addMedicine}
          className="w-full py-2 bg-blue-500/10 border border-dashed border-blue-400/25 text-blue-400 text-[11px] font-semibold rounded-lg hover:bg-blue-500/15 transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3 h-3" /> Add Medicine
        </button>
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wide mb-1.5">Instructions</label>
        <textarea
          value={instructions}
          onChange={(event) => setInstructions(event.target.value)}
          placeholder="Diet, exercise, and follow-up advice..."
          className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-white text-[12px] outline-none focus:border-blue-400 transition-colors placeholder:text-white/20 resize-none h-20"
        />
      </div>

      <div>
        <label className="block text-[10px] font-semibold text-white/40 uppercase tracking-wide mb-1.5">Follow-up Date</label>
        <input
          type="date"
          value={followUpDate}
          onChange={(event) => setFollowUpDate(event.target.value)}
          className="w-full bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 text-white text-[12px] outline-none focus:border-blue-400 transition-colors [color-scheme:dark]"
        />
      </div>

      <button
        onClick={sendPrescription}
        disabled={sending}
        aria-label="Send prescription to patient"
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[13px] rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-auto"
      >
        <Send className="w-4 h-4" />
        {sending ? "Sending..." : sent ? "Resend Prescription" : "Send to Patient"}
      </button>
    </div>
  );
}
