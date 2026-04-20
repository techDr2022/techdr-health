import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { VideoRoomClient } from "@/components/consultation/VideoRoomClient";

type Medicine = {
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
};

export default async function VideoRoomPage({
  params,
}: {
  params: { bookingId: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const booking = await prisma.booking.findUnique({
    where: { id: params.bookingId },
    include: {
      doctor: true,
      patient: true,
      prescriptionRecord: true,
    },
  });
  if (!booking) redirect("/dashboard/bookings");

  const isDoctor = booking.doctor.userId === session.user.id;
  const isPatient = booking.patientId === session.user.id;
  if (!isDoctor && !isPatient) redirect("/dashboard/bookings");

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
      role={isDoctor ? "doctor" : "patient"}
      doctorName={booking.doctor.displayName}
      patientName={booking.patient.name}
      specialty={booking.doctor.specialty}
      duration={duration}
      existingPrescription={existingPrescription}
    />
  );
}
