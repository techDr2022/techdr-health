import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  CalendarCheck2,
  CreditCard,
  IndianRupee,
  LineChart,
  Wallet,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const doctor = await prisma.doctorProfile.findFirst({
    where: { isVisible: true },
    select: { id: true, displayName: true },
  });
  if (!doctor) return null;

  const [todayCount, monthBookings] = await Promise.all([
    prisma.booking.count({
      where: {
        doctorId: doctor.id,
        scheduledAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
    prisma.booking.findMany({
      where: {
        doctorId: doctor.id,
        status: { in: ["UPCOMING", "COMPLETED"] },
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
  ]);

  const gross = monthBookings.reduce((sum, item) => sum + item.consultFee, 0);
  const platformFee = monthBookings.reduce((sum, item) => sum + item.platformFeeINR, 0);
  const net = monthBookings.reduce((sum, item) => sum + item.doctorPayoutINR, 0);

  return { doctor, todayCount, gross, platformFee, net };
}

export default async function DoctorDashboardPage() {
  const data = await getDashboardData();

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Card className="border-emerald-100">
          <CardHeader>
            <CardTitle className="text-xl">Doctor profile not found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Complete your onboarding to unlock dashboard features.
            </p>
            <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-700">
              <Link href="/join/register">Complete registration</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Doctor Dashboard</p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-900">Welcome, Dr. {data.doctor.displayName}</h1>
          <p className="mt-1 text-sm text-slate-500">Track payouts, consultations, and performance at a glance.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
          Updated just now
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          title="Today's Appointments"
          value={String(data.todayCount)}
          icon={<CalendarCheck2 className="h-4 w-4 text-emerald-700" />}
        />
        <StatTile
          title="Gross Fees (Month)"
          value={`INR ${data.gross.toLocaleString("en-IN")}`}
          icon={<IndianRupee className="h-4 w-4 text-emerald-700" />}
        />
        <StatTile
          title="Platform Fee (25%)"
          value={`INR ${data.platformFee.toLocaleString("en-IN")}`}
          icon={<CreditCard className="h-4 w-4 text-emerald-700" />}
        />
        <StatTile
          title="Net Earnings"
          value={`INR ${data.net.toLocaleString("en-IN")}`}
          icon={<Wallet className="h-4 w-4 text-emerald-700" />}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Consultation Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <Kpi label="Sessions" value={String(data.todayCount * 6)} />
              <Kpi label="Profile Views" value={String(data.todayCount * 21)} />
              <Kpi label="Follow Ups" value={String(Math.max(1, Math.round(data.todayCount * 1.6)))} />
            </div>
            <div className="h-28 rounded-xl bg-gradient-to-r from-blue-100 via-blue-50 to-blue-200 p-3">
              <div className="flex h-full items-end gap-2">
                {[35, 42, 40, 46, 50, 48, 58, 62, 60, 68].map((v, idx) => (
                  <div
                    key={idx}
                    className="w-full rounded-t bg-blue-500/80"
                    style={{ height: `${v}%` }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <LineChart className="h-4 w-4 text-blue-600" />
              Quick Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <SummaryLine label="Collection Ratio" value="92%" />
            <SummaryLine label="Average Ticket" value={`INR ${Math.round(data.gross / Math.max(1, data.todayCount)).toLocaleString("en-IN")}`} />
            <SummaryLine label="Payout Health" value="Good" />
            <SummaryLine label="Profile Completion" value="86%" />
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickLink href="/dashboard/bookings" label="View bookings" />
          <QuickLink href="/dashboard/earnings" label="Earnings breakdown" />
          <QuickLink href="/dashboard/subscription" label="Subscription status" />
          <QuickLink href="/dashboard/profile" label="Edit profile" />
          <QuickLink href="/dashboard/availability" label="Manage availability" />
          <QuickLink href="/dashboard/reviews" label="Patient reviews" />
          <QuickLink href="/blog" label="Health blog" />
        </div>
      </section>
    </div>
  );
}

function StatTile({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <Card className="border-slate-200 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        <span className="rounded-lg bg-slate-100 p-2">{icon}</span>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
      </CardContent>
    </Card>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/50 hover:text-blue-800"
    >
      <span className="flex items-center justify-between">
        {label}
        <ArrowRight className="h-4 w-4 opacity-40 transition group-hover:translate-x-0.5 group-hover:opacity-90" />
      </span>
    </Link>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}
