import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LabReportAnalyser } from "@/components/ai/LabReportAnalyser";
import { HealthPassBadge } from "@/components/patient/HealthPassBadge";
import { SecondOpinionSharePrompt } from "@/components/patient/SecondOpinionSharePrompt";

export const dynamic = "force-dynamic";

export default async function PatientDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  if (session.user.role !== "PATIENT") {
    redirect("/dashboard");
  }

  const bookings = await prisma.booking.findMany({
    where: { patientId: session.user.id },
    include: { doctor: true, review: true, prescriptionRecord: { select: { id: true } } },
    orderBy: { scheduledAt: "desc" },
    take: 100,
  });

  const secondOpinionShareBookings = bookings
    .filter((b) => b.issecondopinion)
    .map((b) => ({
      id: b.id,
      doctorName: b.doctor.displayName,
      shareConsent: b.secondopinionshareconsent,
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Patient Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Join upcoming consultations and manage visit history.</p>
        </div>
        <HealthPassBadge userId={session.user.id} />
      </div>

      <Suspense fallback={null}>
        <SecondOpinionSharePrompt bookings={secondOpinionShareBookings} />
      </Suspense>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total Bookings" value={String(bookings.length)} />
        <StatCard label="Upcoming" value={String(bookings.filter((b) => b.status === "UPCOMING").length)} />
        <StatCard label="Completed" value={String(bookings.filter((b) => b.status === "COMPLETED").length)} />
      </div>

      <div className="rounded-xl border border-emerald-100 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Lab Report Analyser</h2>
            <p className="text-sm text-muted-foreground">
              Upload a PDF to get AI insights and specialist recommendations.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/dashboard/patient/lab-tests" className="text-emerald-700 hover:underline">
              Book lab tests →
            </Link>
            <Link href="/lab-report-analyser" className="text-emerald-700 hover:underline">
              Open full page →
            </Link>
          </div>
        </div>
        <LabReportAnalyser patientId={session.user.id} className="mt-4" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Doctor</th>
              <th className="px-4 py-3">Specialty</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b last:border-0">
                <td className="px-4 py-3">{booking.doctor.displayName}</td>
                <td className="px-4 py-3">{booking.doctor.specialty}</td>
                <td className="px-4 py-3">{booking.scheduledAt.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">{booking.consultType}</td>
                <td className="px-4 py-3">{booking.status}</td>
                <td className="px-4 py-3">
                  {booking.status === "COMPLETED" ? (
                    <div className="flex flex-wrap gap-2">
                      {booking.prescriptionRecord ? (
                        <Link
                          href={`/dashboard/patient/prescription/${booking.id}`}
                          className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
                        >
                          View Prescription
                        </Link>
                      ) : null}
                      <Link
                        href={`/book?secondOpinionFor=${booking.id}`}
                        className="inline-flex items-center rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-violet-500"
                      >
                        Get Second Opinion
                      </Link>
                      <Link
                        href={`/dashboard/patient/review/${booking.id}`}
                        className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                      >
                        {booking.review ? "Edit Review" : "Write Review"}
                      </Link>
                    </div>
                  ) : booking.issecondopinion && !booking.secondopinionshareconsent ? (
                    <span className="text-xs text-violet-700 font-medium">Share records pending</span>
                  ) : booking.consultType === "VIDEO" ? (
                    <Link
                      href={`/consultation/${booking.id}/waiting`}
                      className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
                    >
                      Join Call
                    </Link>
                  ) : (
                    <span className="text-xs text-muted-foreground">No action</span>
                  )}
                </td>
              </tr>
            ))}
            {bookings.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-muted-foreground" colSpan={6}>
                  No bookings found yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
