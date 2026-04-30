"use client";

type DashboardPeriod = "today" | "week" | "month";

export function ExportActions({ period }: { period: DashboardPeriod }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <a
        href={`/api/admin/dashboard/export?period=${period}`}
        className="rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
      >
        Export CSV
      </a>
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
      >
        Export PDF
      </button>
    </div>
  );
}
