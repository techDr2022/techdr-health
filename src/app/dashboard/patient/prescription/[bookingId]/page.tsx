import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PrintPrescriptionButton } from "@/components/patient/PrintPrescriptionButton";
import { DownloadPrescriptionPdfButton } from "@/components/patient/DownloadPrescriptionPdfButton";

type Medicine = {
  name: string;
  dosage: string;
  duration: string;
  instructions?: string;
};

export const dynamic = "force-dynamic";

export default async function PatientPrescriptionPage({
  params,
}: {
  params: { bookingId: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "PATIENT") redirect("/dashboard");

  const booking = await prisma.booking.findUnique({
    where: { id: params.bookingId },
    include: {
      doctor: true,
      patient: { select: { name: true, email: true, phone: true } },
      prescriptionRecord: true,
    },
  });

  if (!booking || booking.patientId !== session.user.id) {
    redirect("/dashboard/patient");
  }

  if (!booking.prescriptionRecord) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Prescription not available</h1>
        <p className="text-sm text-slate-600">
          Your doctor has not sent a prescription for this consultation yet.
        </p>
        <Link
          href="/dashboard/patient"
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const medicines = (booking.prescriptionRecord.medicines as Medicine[]) || [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Digital Prescription</h1>
          <p className="mt-1 text-sm text-slate-600">Show this page to any doctor for follow-up consultation.</p>
        </div>
        <div className="flex gap-2">
          {booking.prescriptionRecord.pdfUrl ? (
            <DownloadPrescriptionPdfButton href={`/api/prescription/${booking.id}/pdf`} />
          ) : null}
          <PrintPrescriptionButton />
          <Link
            href="/dashboard/patient"
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Back
          </Link>
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Patient Details</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Info label="Name" value={booking.patient.name || "-"} />
          <Info label="Email" value={booking.patient.email || "-"} />
          <Info label="Phone" value={booking.patient.phone || "-"} />
          <Info
            label="Consultation Date"
            value={booking.scheduledAt.toLocaleString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Doctor Details</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Info label="Doctor" value={booking.doctor.displayName} />
          <Info label="Specialty" value={booking.doctor.specialty} />
          <Info label="Credentials" value={booking.doctor.credentials} />
          <Info
            label="Prescription Sent"
            value={
              booking.prescriptionRecord.sentAt
                ? booking.prescriptionRecord.sentAt.toLocaleString("en-IN")
                : "Not recorded"
            }
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Clinical Notes</h2>
        <p className="mt-3 text-sm text-slate-900">
          <span className="font-semibold">Diagnosis: </span>
          {booking.prescriptionRecord.diagnosis}
        </p>
        {booking.prescriptionRecord.instructions ? (
          <p className="mt-2 text-sm text-slate-700">
            <span className="font-semibold">Instructions: </span>
            {booking.prescriptionRecord.instructions}
          </p>
        ) : null}
        {booking.prescriptionRecord.followUpDate ? (
          <p className="mt-2 text-sm text-slate-700">
            <span className="font-semibold">Follow-up date: </span>
            {booking.prescriptionRecord.followUpDate.toLocaleDateString("en-IN")}
          </p>
        ) : null}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Medicines</h2>
        <div className="mt-3 space-y-3">
          {medicines.map((medicine, index) => (
            <div key={`${medicine.name}-${index}`} className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-semibold text-slate-900">
                {index + 1}. {medicine.name}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Dosage: {medicine.dosage} | Duration: {medicine.duration}
              </p>
              {medicine.instructions ? (
                <p className="mt-1 text-sm text-slate-600">{medicine.instructions}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
