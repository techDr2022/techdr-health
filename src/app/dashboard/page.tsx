import Link from "next/link";
import { prisma } from "@/lib/prisma";
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
    return <div className="mx-auto max-w-3xl px-4 py-10">No doctor profile found.</div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold">Doctor Dashboard</h1>
      <p className="text-sm text-muted-foreground">Welcome back, {data.doctor.displayName}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric title="Today's Appointments" value={String(data.todayCount)} />
        <Metric title="Gross Fees (Month)" value={`INR ${data.gross.toLocaleString("en-IN")}`} />
        <Metric title="Platform Fee (25%)" value={`INR ${data.platformFee.toLocaleString("en-IN")}`} />
        <Metric title="Net Earnings" value={`INR ${data.net.toLocaleString("en-IN")}`} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink href="/dashboard/bookings" label="View bookings" />
        <QuickLink href="/dashboard/earnings" label="Earnings breakdown" />
        <QuickLink href="/dashboard/subscription" label="Subscription status" />
        <QuickLink href="/dashboard/profile" label="Edit profile" />
        <QuickLink href="/dashboard/availability" label="Manage availability" />
        <QuickLink href="/dashboard/reviews" label="Patient reviews" />
        <QuickLink href="/dashboard/blogs" label="Blog CMS" />
      </div>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="rounded-xl border bg-white p-4 text-sm font-medium hover:bg-slate-50">
      {label}
    </Link>
  );
}
