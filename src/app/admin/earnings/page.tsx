import { prisma } from "@/lib/prisma";
import { ensureAdminAccess } from "@/lib/admin-access";
import { SUBSCRIPTION_PLANS } from "@/lib/plans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

async function getEarningsData() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [bookingEarnings, subscriptions] = await Promise.all([
    prisma.platformEarning.aggregate({
      _sum: { totalEarned: true, platformFeeINR: true, gstINR: true },
      where: { month, year },
    }),
    prisma.subscription.groupBy({
      by: ["plan"],
      _count: { _all: true },
      where: { status: "ACTIVE" },
    }),
  ]);

  const counts = {
    INDIVIDUAL: 0,
    CLINIC: 0,
    HOSPITAL: 0,
  };

  for (const item of subscriptions) {
    counts[item.plan] = item._count._all;
  }

  const subscriptionsRevenue =
    counts.INDIVIDUAL * SUBSCRIPTION_PLANS.INDIVIDUAL.price +
    counts.CLINIC * SUBSCRIPTION_PLANS.CLINIC.price +
    counts.HOSPITAL * SUBSCRIPTION_PLANS.HOSPITAL.price;

  return {
    month,
    year,
    counts,
    subscriptionsRevenue,
    bookingRevenue: bookingEarnings._sum.totalEarned ?? 0,
    platformFeeTotal: bookingEarnings._sum.platformFeeINR ?? 0,
    gstTotal: bookingEarnings._sum.gstINR ?? 0,
  };
}

export default async function AdminEarningsPage() {
  await ensureAdminAccess();
  const data = await getEarningsData();

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold">Platform Earnings Report</h1>
      <p className="text-sm text-muted-foreground">
        Reporting month: {data.month}/{data.year}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric title="Booking Revenue (Fees + GST)" value={data.bookingRevenue} />
        <Metric title="Platform Fee Component" value={data.platformFeeTotal} />
        <Metric title="GST Component" value={data.gstTotal} />
        <Metric title="Subscription Revenue" value={data.subscriptionsRevenue} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Breakdown (Active Subscriptions)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row
            label={`Individual (INR ${SUBSCRIPTION_PLANS.INDIVIDUAL.price.toLocaleString("en-IN")} x ${data.counts.INDIVIDUAL})`}
            value={data.counts.INDIVIDUAL * SUBSCRIPTION_PLANS.INDIVIDUAL.price}
          />
          <Row
            label={`Clinic (INR ${SUBSCRIPTION_PLANS.CLINIC.price.toLocaleString("en-IN")} x ${data.counts.CLINIC})`}
            value={data.counts.CLINIC * SUBSCRIPTION_PLANS.CLINIC.price}
          />
          <Row
            label={`Hospital (INR ${SUBSCRIPTION_PLANS.HOSPITAL.price.toLocaleString("en-IN")} x ${data.counts.HOSPITAL})`}
            value={data.counts.HOSPITAL * SUBSCRIPTION_PLANS.HOSPITAL.price}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">INR {value.toLocaleString("en-IN")}</p>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b pb-2 last:border-0">
      <p>{label}</p>
      <p className="font-medium">INR {value.toLocaleString("en-IN")}</p>
    </div>
  );
}
