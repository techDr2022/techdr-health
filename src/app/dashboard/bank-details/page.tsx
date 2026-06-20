import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BankDetailsForm } from "@/components/dashboard/BankDetailsForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDoctorPayoutHistory } from "@/lib/cron/sendWeeklyDoctorPayoutSummary";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardBankDetailsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "DOCTOR") redirect("/dashboard/patient");

  const doctor = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!doctor) {
    return <div className="mx-auto max-w-3xl px-4 py-10">No doctor account found.</div>;
  }

  const payoutHistory = await getDoctorPayoutHistory(doctor.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Bank Details</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add your payout account to receive weekly settlements via Cashfree after completed
          consultations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payout account</CardTitle>
        </CardHeader>
        <CardContent>
          <BankDetailsForm />
        </CardContent>
      </Card>

      {payoutHistory.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Recent payouts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {payoutHistory.map((payout) => (
              <div
                key={payout.id}
                className="flex items-center justify-between border-b pb-2 last:border-0"
              >
                <div>
                  <p className="font-medium">
                    INR {payout.amountinr.toLocaleString("en-IN")} · {payout.bookingcount}{" "}
                    consultation{payout.bookingcount === 1 ? "" : "s"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ref {payout.reference} · {payout.status}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {(payout.processedat ?? payout.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
