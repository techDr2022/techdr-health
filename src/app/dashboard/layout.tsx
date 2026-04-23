import type { ReactNode } from "react";
import { DashboardNav } from "@/components/layout/DashboardNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 p-3 sm:p-5">
      <div className="mx-auto max-w-[1400px] rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-300/30">
        <div className="grid min-h-[calc(100vh-40px)] lg:grid-cols-[260px_1fr]">
          <div className="border-b border-slate-200 lg:sticky lg:top-3 lg:self-start lg:border-b-0 lg:border-r">
            <DashboardNav />
          </div>
          <div className="min-w-0 bg-white p-4 sm:p-6 lg:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
