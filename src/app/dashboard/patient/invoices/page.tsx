import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, FileText } from "lucide-react";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PatientInvoicesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "PATIENT") redirect("/dashboard");

  const invoices = await prisma.booking.findMany({
    where: {
      patientId: session.user.id,
      payStatus: "CAPTURED",
      invoicepdfkey: { not: null },
    },
    include: {
      doctor: { select: { displayName: true, specialty: true } },
    },
    orderBy: { invoiceissuedat: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Invoices</h1>
        <p className="mt-1 text-sm text-slate-600">
          Download GST tax invoices for your completed consultation payments.
        </p>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-sm text-muted-foreground">
            <FileText className="h-10 w-10 text-slate-300" />
            <p>No invoices yet. Invoices are generated automatically after payment confirmation.</p>
            <Button asChild variant="outline">
              <Link href="/book">Book a consultation</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your invoices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {invoice.invoicenumber || "Invoice"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {invoice.doctor.displayName} · {invoice.doctor.specialty}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {invoice.invoiceissuedat?.toLocaleDateString("en-IN") ?? "—"} · INR{" "}
                    {invoice.totalPatientPays.toLocaleString("en-IN")}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <a href={`/api/patient/invoices/${invoice.id}/pdf`} target="_blank" rel="noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </a>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
