import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { WaitingRoomClient } from "@/components/consultation/WaitingRoomClient";
import {
  isJoinableBookingStatus,
  resolveConsultationAccess,
} from "@/lib/consultation-access";
import { getBookingBeneficiaryName } from "@/lib/family-members";

export default async function WaitingRoomPage({
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
      familymember: true,
    },
  });
  if (!booking) redirect("/");

  const access = await resolveConsultationAccess(bookingId, booking, joinToken);
  if (!access) {
    const session = await auth();
    if (!session?.user?.id) {
      const callbackUrl = `/consultation/${bookingId}/waiting${
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

  return (
    <WaitingRoomClient
      booking={{
        id: booking.id,
        doctorName: booking.doctor.displayName,
        specialty: booking.doctor.specialty,
        credentials: booking.doctor.credentials,
        scheduledAt: booking.scheduledAt.toISOString(),
        duration,
        patientName: getBookingBeneficiaryName(booking),
      }}
      role={access.role}
      joinToken={joinToken}
    />
  );
}
