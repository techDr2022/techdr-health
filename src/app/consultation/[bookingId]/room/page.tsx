import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { VideoRoomClient } from "@/components/consultation/VideoRoomClient";
import {
  isJoinableBookingStatus,
  resolveConsultationAccess,
} from "@/lib/consultation-access";

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
  params: { bookingId: string };
  searchParams: { token?: string };
}) {
  const joinToken = searchParams.token?.trim() || null;

  const booking = await prisma.booking.findUnique({
    where: { id: params.bookingId },
    include: {
      doctor: true,
      patient: true,
      prescriptionRecord: true,
    },
  });
  if (!booking) redirect("/");

  const access = await resolveConsultationAccess(params.bookingId, booking, joinToken);
  if (!access) {
    const session = await auth();
    if (!session?.user?.id) {
      const callbackUrl = `/consultation/${params.bookingId}/room${
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

  return (
    <VideoRoomClient
      bookingId={booking.id}
      role={access.role}
      doctorName={booking.doctor.displayName}
      patientName={booking.patient.name}
      specialty={booking.doctor.specialty}
      duration={duration}
      existingPrescription={existingPrescription}
      joinToken={joinToken}
    />
  );
}
