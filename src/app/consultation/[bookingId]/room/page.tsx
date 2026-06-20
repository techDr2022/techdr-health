import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { VideoRoomClient } from "@/components/consultation/VideoRoomClient";
import {
  isJoinableBookingStatus,
  resolveConsultationAccess,
} from "@/lib/consultation-access";
import { toSoapNoteClient } from "@/lib/soap-notes";
import { getBookingBeneficiaryName } from "@/lib/family-members";

type Medicine = {
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
};

export default async function VideoRoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { bookingId } = await params;
  const resolvedSearchParams = await searchParams;
  const joinToken = resolvedSearchParams.token?.trim() || null;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      doctor: true,
      patient: true,
      prescriptionRecord: true,
      soapnote: true,
      familymember: true,
    },
  });
  if (!booking) redirect("/");

  const access = await resolveConsultationAccess(bookingId, booking, joinToken);
  if (!access) {
    const session = await auth();
    if (!session?.user?.id) {
      const callbackUrl = `/consultation/${bookingId}/room${
        joinToken ? `?token=${encodeURIComponent(joinToken)}` : ""
      }`;
      redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }
    redirect("/dashboard/bookings");
  }

  if (!isJoinableBookingStatus(booking.status)) {
    redirect("/");
  }

  const duration = Math.max(
    1,
    Math.round((booking.endsAt.getTime() - booking.scheduledAt.getTime()) / (1000 * 60))
  );

  const existingPrescription = booking.prescriptionRecord
    ? {
        diagnosis: booking.prescriptionRecord.diagnosis,
        medicines: (booking.prescriptionRecord.medicines as Medicine[]) || [],
        instructions: booking.prescriptionRecord.instructions,
        followUpDate: booking.prescriptionRecord.followUpDate?.toISOString() || null,
        sentAt: booking.prescriptionRecord.sentAt?.toISOString() || null,
      }
    : null;

  const accessRole = access.role;

  const beneficiaryAge = booking.familymember
    ? Math.floor(
        (Date.now() - booking.familymember.dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;
  const beneficiaryGender = booking.familymember?.gender ?? null;

  const initialSoapNote =
    booking.soapnote &&
    (accessRole === "doctor" || booking.soapnote.patientshared)
      ? toSoapNoteClient(booking.soapnote)
      : null;

  return (
    <VideoRoomClient
      bookingId={booking.id}
      role={accessRole}
      doctorName={booking.doctor.displayName}
      patientName={getBookingBeneficiaryName(booking)}
      specialty={booking.doctor.specialty}
      duration={duration}
      consultType={booking.consultType}
      existingPrescription={existingPrescription}
      initialSoapNote={initialSoapNote}
      joinToken={joinToken}
      patientAge={beneficiaryAge}
      patientGender={beneficiaryGender}
      isSecondOpinion={booking.issecondopinion}
      secondOpinionShareConsent={booking.secondopinionshareconsent}
    />
  );
}
