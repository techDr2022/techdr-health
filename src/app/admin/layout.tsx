import type { ReactNode } from "react";
import { ensureAdminAccess } from "@/lib/admin-access";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await ensureAdminAccess();

  return (
    <div className="min-h-screen bg-slate-100 p-3 sm:p-5">
      <div className="mx-auto max-w-[1500px] lg:relative">
        <aside className="border-b border-slate-200 lg:fixed lg:inset-y-5 lg:w-[280px] lg:overflow-y-auto lg:rounded-3xl lg:border lg:border-slate-200 lg:bg-white lg:shadow-xl lg:shadow-slate-300/25">
          <AdminSidebar />
        </aside>
        <main className="mt-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-300/25 sm:p-6 lg:mt-0 lg:ml-[300px] lg:min-h-[calc(100vh-40px)] lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
