import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ensureAdminAccess } from "@/lib/admin-access";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await ensureAdminAccess();

  return (
    <div className="min-h-screen bg-slate-100 p-3 sm:p-5">
      <div className="mx-auto max-w-[1500px]">
        <div className="grid min-h-[calc(100vh-40px)] gap-3 lg:grid-cols-[280px_1fr]">
          <aside className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-300/25 lg:sticky lg:top-5 lg:self-start lg:max-h-[calc(100vh-40px)] lg:overflow-y-auto">
            <AdminSidebar />
          </aside>
          <main className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-300/25 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
