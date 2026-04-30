"use client";

export function PrintPrescriptionButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
    >
      Print / Save PDF
    </button>
  );
}
