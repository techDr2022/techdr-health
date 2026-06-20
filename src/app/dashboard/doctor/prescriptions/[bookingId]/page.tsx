// AI-POWERED
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PrescriptionDraftReview } from "@/components/ai/PrescriptionDraftReview";
import { getBookingBeneficiaryLabel } from "@/lib/family-members";

export const dynamic = "force-dynamic";

function extractChiefComplaint(notes: string | null | undefined): string {
  if (!notes) return "Not documented";
  const match = notes.match(/Chief complaint:\s*(.+)/i);
  return match?.[1]?.trim() || notes.slice(0, 500);
}

type AiDraft = {
  summary: string;
  diagnosis: string;
  medications: Array<{
    name: string;
    dosage: string;
    duration: string;
    instructions: string;
  }>;
  followUpRecommendation: string;
  lifestyle: string[];
};

export default async function DoctorPrescriptionReviewPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "DOCTOR") redirect("/dashboard/patient");

  const doctor = await prisma.doctorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!doctor) redirect("/dashboard");

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, doctorId: doctor.id },
    include: {
      patient: { select: { name: true } },
      doctor: { select: { specialty: true, displayName: true } },
      prescriptionRecord: true,
      familymember: true,
    },
  });

  if (!booking) notFound();

  const initialDraft = booking.prescriptionRecord?.aiDraft as AiDraft | null;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <Link href="/dashboard/bookings" className="text-sm text-emerald-700 hover:underline">
          ← Back to bookings
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Prescription review</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {getBookingBeneficiaryLabel(booking)} · {booking.doctor.specialty} ·{" "}
          {booking.scheduledAt.toLocaleDateString("en-IN")}
        </p>
      </div>

      <PrescriptionDraftReview
        bookingId={booking.id}
        specialty={booking.doctor.specialty}
        chiefComplaint={extractChiefComplaint(booking.notes)}
        doctorNotes={booking.notes ?? undefined}
        initialDraft={initialDraft}
      />
    </div>
  );
}
