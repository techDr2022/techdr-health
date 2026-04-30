import { prisma } from "@/lib/prisma";
import { ensureAdminAccess } from "@/lib/admin-access";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  await ensureAdminAccess();
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: { doctor: { select: { displayName: true } } },
    take: 250,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-semibold">Bookings & Earnings</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full min-w-[1080px] text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Booking</th>
              <th className="px-4 py-3">Doctor</th>
              <th className="px-4 py-3">Consultation</th>
              <th className="px-4 py-3">Platform Fee</th>
              <th className="px-4 py-3">GST</th>
              <th className="px-4 py-3">Doctor Payout</th>
              <th className="px-4 py-3">Payment</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{booking.id.slice(-8)}</p>
                  <p className="text-xs text-muted-foreground">
                    {booking.scheduledAt.toLocaleDateString("en-IN")}
                  </p>
                </td>
                <td className="px-4 py-3">{booking.doctor.displayName}</td>
                <td className="px-4 py-3">
                  <p>INR {booking.consultFee.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-muted-foreground">{booking.consultType}</p>
                </td>
                <td className="px-4 py-3">INR {booking.platformFeeINR.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">INR {booking.gstINR.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">INR {booking.doctorPayoutINR.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">
                  <Badge variant={booking.payStatus === "CAPTURED" ? "default" : "outline"}>
                    {booking.payStatus}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
