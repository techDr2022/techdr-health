import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { WaitingRoomClient } from "@/components/consultation/WaitingRoomClient";

export default async function WaitingRoomPage({
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
    },
  });
  if (!booking) redirect("/dashboard/bookings");

  const isPatient = booking.patientId === session.user.id;
  const isDoctor = booking.doctor.userId === session.user.id;
  if (!isPatient && !isDoctor) redirect("/dashboard/bookings");

  const duration = Math.max(
    1,
    Math.round((booking.endsAt.getTime() - booking.scheduledAt.getTime()) / (1000 * 60))
  );

  return (
    <WaitingRoomClient
      booking={{
        id: booking.id,
        doctorName: booking.doctor.displayName,
        specialty: booking.doctor.specialty,
        credentials: booking.doctor.credentials,
        scheduledAt: booking.scheduledAt.toISOString(),
        duration,
        patientName: booking.patient.name,
      }}
      role={isDoctor ? "doctor" : "patient"}
    />
  );
}
