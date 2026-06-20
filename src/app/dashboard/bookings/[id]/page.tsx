import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { SOAPNoteViewer } from "@/components/consultation/SOAPNoteViewer";
import { prisma } from "@/lib/prisma";
import { toSoapNoteClient } from "@/lib/soap-notes";
import { getBookingBeneficiaryLabel } from "@/lib/family-members";

export const dynamic = "force-dynamic";

export default async function DoctorBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "DOCTOR") redirect("/dashboard/patient");

  const doctor = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!doctor) redirect("/dashboard");

  const booking = await prisma.booking.findFirst({
    where: { id: id, doctorId: doctor.id },
    include: {
      patient: { select: { name: true, email: true } },
      doctor: { select: { specialty: true, displayName: true } },
      prescriptionRecord: true,
      soapnote: true,
      familymember: true,
    },
  });
  if (!booking) notFound();

  const soapNote = booking.soapnote ? toSoapNoteClient(booking.soapnote) : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div>
        <Link href="/dashboard/bookings" className="text-sm text-emerald-700 hover:underline">
          ← Back to bookings
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Consultation record</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {getBookingBeneficiaryLabel(booking)} · {booking.doctor.specialty} ·{" "}
          {booking.scheduledAt.toLocaleString("en-IN")} · {booking.status}
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Patient</h2>
        <p className="mt-2 text-sm text-slate-800">{getBookingBeneficiaryLabel(booking)}</p>
        {booking.familymember ? (
          <p className="text-xs text-slate-500">Account holder: {booking.patient.name}</p>
        ) : null}
        <p className="text-xs text-slate-500">{booking.patient.email}</p>
      </section>

      {soapNote ? (
        <SOAPNoteViewer bookingId={booking.id} note={soapNote} canShare />
      ) : (
        <section className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5">
          <p className="text-sm text-slate-600">No SOAP note was documented for this consultation.</p>
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        {booking.status === "COMPLETED" ? (
          <Link
            href={`/dashboard/doctor/prescriptions/${booking.id}`}
            className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Prescription review
          </Link>
        ) : null}
        {booking.consultType === "VIDEO" && booking.status !== "COMPLETED" ? (
          <Link
            href={`/consultation/${booking.id}/waiting`}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Open consultation room
          </Link>
        ) : null}
      </div>
    </div>
  );
}
