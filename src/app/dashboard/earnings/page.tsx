import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DashboardEarningsPage() {
  const doctor = await prisma.doctorProfile.findFirst({ select: { id: true } });
  if (!doctor) return <div className="mx-auto max-w-3xl px-4 py-10">No doctor account found.</div>;

  const bookings = await prisma.booking.findMany({
    where: {
      doctorId: doctor.id,
      createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    },
  });

  const totalConsultations = bookings.length;
  const gross = bookings.reduce((sum, b) => sum + b.consultFee, 0);
  const platformFee = bookings.reduce((sum, b) => sum + b.platformFeeINR, 0);
  const net = bookings.reduce((sum, b) => sum + b.doctorPayoutINR, 0);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold">Earnings</h1>
      <Card>
        <CardHeader>
          <CardTitle>This Month&apos;s Earnings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Total Consultations" value={String(totalConsultations)} />
          <Row label="Gross Consultation Fees" value={`INR ${gross.toLocaleString("en-IN")}`} />
          <Row label="Platform Fee (25%)" value={`- INR ${platformFee.toLocaleString("en-IN")}`} />
          <Row label="Net Earnings (You Keep)" value={`INR ${net.toLocaleString("en-IN")}`} strong />
        </CardContent>
      </Card>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b pb-2 last:border-0">
      <p className={strong ? "font-semibold" : "text-muted-foreground"}>{label}</p>
      <p className={strong ? "text-base font-semibold" : "font-medium"}>{value}</p>
    </div>
  );
}
