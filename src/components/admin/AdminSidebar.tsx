"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { BarChart3, CalendarDays, CreditCard, FileCheck2, LogOut, Stethoscope, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/profiles", label: "Profiles", icon: Users },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/admin/earnings", label: "Earnings", icon: CreditCard },
  { href: "/admin/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/admin/applications", label: "Applications", icon: FileCheck2 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col bg-slate-950 px-3 py-4 text-slate-100 sm:px-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Admin Console</p>
        <h2 className="mt-2 text-lg font-semibold">techDr Control Panel</h2>
      </div>

      <nav className="mt-6 space-y-1">
        {ADMIN_LINKS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                active ? "bg-cyan-500 text-slate-950" : "text-slate-200 hover:bg-slate-800"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => void signOut({ callbackUrl: "/login" })}
        className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </aside>
  );
}
