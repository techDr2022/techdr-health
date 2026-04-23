import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { BookingActionControls } from "@/components/dashboard/BookingActionControls";

export const dynamic = "force-dynamic";

export default async function DashboardBookingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "DOCTOR") redirect("/dashboard/patient");

  const doctor = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!doctor) return <div className="mx-auto max-w-3xl px-4 py-10">No doctor account found.</div>;

  const bookings = await prisma.booking.findMany({
    where: { doctorId: doctor.id },
    include: { patient: { select: { name: true } } },
    orderBy: { scheduledAt: "desc" },
    take: 150,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold">Bookings</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Consultation</th>
              <th className="px-4 py-3">Fee</th>
              <th className="px-4 py-3">Payout</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b last:border-0">
                <td className="px-4 py-3">{booking.scheduledAt.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">{booking.patient.name}</td>
                <td className="px-4 py-3">{booking.consultType}</td>
                <td className="px-4 py-3">INR {booking.consultFee.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">INR {booking.doctorPayoutINR.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">
                  <Badge variant={booking.payStatus === "CAPTURED" ? "default" : "outline"}>
                    {booking.payStatus}
                  </Badge>
                </td>
                <td className="px-4 py-3">{booking.status}</td>
                <td className="px-4 py-3">
                  <div className="space-y-2">
                    {booking.consultType === "VIDEO" && booking.status !== "COMPLETED" ? (
                      <Link
                        href={`/consultation/${booking.id}/waiting`}
                        className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
                      >
                        Start Consultation
                      </Link>
                    ) : null}
                    <BookingActionControls
                      bookingId={booking.id}
                      status={booking.status}
                      scheduledAtISO={booking.scheduledAt.toISOString()}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
