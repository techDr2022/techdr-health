"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Activity,
  CalendarDays,
  CreditCard,
  Home,
  LogOut,
  Settings,
  Star,
  User,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DOCTOR_DASHBOARD_LINKS = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/dashboard/earnings", label: "Earnings", icon: Wallet },
  { href: "/dashboard/subscription", label: "Subscription", icon: CreditCard },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/availability", label: "Availability", icon: Activity },
  { href: "/dashboard/reviews", label: "Reviews", icon: Star },
];

const PATIENT_DASHBOARD_LINKS = [
  { href: "/dashboard/patient", label: "Overview", icon: Home },
  { href: "/consult", label: "Book Consultation", icon: CalendarDays },
  { href: "/dashboard/patient", label: "My Consultations", icon: Activity },
  { href: "/profile", label: "Profile", icon: User },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userName = session?.user?.name ?? "Doctor Account";
  const userEmail = session?.user?.email ?? "dashboard@techdrhealth.com";
  const isPatient = session?.user?.role === "PATIENT" || pathname.startsWith("/dashboard/patient");
  const options = isPatient ? PATIENT_DASHBOARD_LINKS : DOCTOR_DASHBOARD_LINKS;
  const dashboardTitle = isPatient ? "Patient Portal" : "Doctor Portal";

  return (
    <aside className="flex h-full flex-col bg-slate-50 p-3 sm:p-4 lg:max-h-[calc(100vh-24px)] lg:overflow-y-auto">
      <div className="mb-4 sm:mb-5">
        <Link href="/" className="inline-flex items-center rounded-xl bg-white px-3 py-2 shadow-sm">
          <Image src="/techdrhealth-logo.png" alt="techDrHealth" width={148} height={40} className="h-8 w-auto" />
        </Link>
        <p className="mt-3 text-xs text-slate-500">{dashboardTitle}</p>
      </div>

      <div className="space-y-2">
        <p className="px-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Options</p>

        <nav className="mt-2 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          {options.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition",
                  active
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/25"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <nav className="mt-2 hidden space-y-1 lg:block">
          {options.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/25"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-1">
          <Button variant="ghost" className="w-full justify-start text-slate-700 hover:bg-slate-100" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          <Button variant="ghost" className="w-full justify-start text-slate-700 hover:bg-slate-100" asChild>
            <Link href="/dashboard/profile?panel=delete">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="mt-2 w-full border-slate-200 bg-white text-slate-700 hover:bg-slate-100 lg:mt-3"
          onClick={() => void signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-1 h-4 w-4" />
          Logout
        </Button>

      </div>

      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3 lg:mt-auto">
        <p className="truncate text-sm font-semibold text-slate-800">{userName}</p>
        <p className="truncate text-xs text-slate-500">{userEmail}</p>
      </div>
    </aside>
  );
}
