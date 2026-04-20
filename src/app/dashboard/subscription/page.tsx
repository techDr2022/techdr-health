import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DashboardSubscriptionPage() {
  const doctor = await prisma.doctorProfile.findFirst({ select: { id: true } });
  if (!doctor) return <div className="mx-auto max-w-3xl px-4 py-10">No doctor account found.</div>;

  const subscription = await prisma.subscription.findFirst({
    where: { doctorId: doctor.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold">Subscription</h1>
      <Card>
        <CardHeader>
          <CardTitle>Current Plan Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Line label="Plan" value={subscription?.plan ?? "No active subscription"} />
          <Line label="Status" value={subscription?.status ?? "-"} />
          <Line label="Annual Fee" value={subscription ? `INR ${subscription.priceINR.toLocaleString("en-IN")}` : "-"} />
          <Line
            label="Expires On"
            value={subscription?.expiresAt ? subscription.expiresAt.toLocaleDateString("en-IN") : "-"}
          />
          <Button asChild>
            <Link href="/join/register">Renew or Upgrade Plan</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b pb-2 last:border-0">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
