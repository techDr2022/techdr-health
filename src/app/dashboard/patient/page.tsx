import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PatientDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  if (session.user.role !== "PATIENT") {
    redirect("/dashboard");
  }

  const bookings = await prisma.booking.findMany({
    where: { patientId: session.user.id },
    include: { doctor: true, review: true },
    orderBy: { scheduledAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold text-slate-900">Patient Dashboard</h1>
      <p className="mt-2 text-sm text-slate-600">Join your upcoming video consultations and view status updates.</p>

      <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
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
                    <Link
                      href={`/dashboard/patient/review/${booking.id}`}
                      className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                    >
                      {booking.review ? "Edit Review" : "Write Review"}
                    </Link>
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
