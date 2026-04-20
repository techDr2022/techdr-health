import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

async function getAdminStats() {
  const [activeSubscriptions, pendingApplications, bookingCount, monthEarnings] =
    await Promise.all([
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.doctorProfile.count({ where: { approvalStatus: "PENDING" } }),
      prisma.booking.count(),
      prisma.platformEarning.aggregate({
        _sum: { totalEarned: true },
        where: {
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        },
      }),
    ]);

  return {
    activeSubscriptions,
    pendingApplications,
    bookingCount,
    monthRevenue: monthEarnings._sum.totalEarned ?? 0,
  };
}

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold">Admin Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Platform Revenue (Month)" value={`INR ${stats.monthRevenue.toLocaleString("en-IN")}`} />
        <MetricCard label="Active Subscriptions" value={String(stats.activeSubscriptions)} />
        <MetricCard label="Pending Applications" value={String(stats.pendingApplications)} />
        <MetricCard label="Total Bookings" value={String(stats.bookingCount)} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <QuickLink href="/admin/applications" label="Review Applications" />
        <QuickLink href="/admin/subscriptions" label="Manage Subscriptions" />
        <QuickLink href="/admin/earnings" label="View Earnings Reports" />
        <QuickLink href="/admin/bookings" label="Inspect Booking Transactions" />
        <QuickLink href="/admin/doctors" label="Active Doctors" />
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border bg-white p-4 text-sm font-medium transition hover:bg-slate-50"
    >
      {label}
    </Link>
  );
}
