import { auth } from "@/auth";
import {
  ConsultationJoinRole,
  verifyConsultationJoinToken,
} from "@/lib/consultation-join";

type BookingParticipant = {
  id: string;
  status: string;
  patientId: string;
  doctor: { userId: string };
};

export type ConsultationAccess = {
  role: ConsultationJoinRole;
  viaToken: boolean;
};

const JOINABLE_STATUSES = new Set(["UPCOMING", "ONGOING"]);

export function isJoinableBookingStatus(status: string) {
  return JOINABLE_STATUSES.has(status);
}

export async function resolveConsultationAccess(
  bookingId: string,
  booking: BookingParticipant,
  joinToken?: string | null
): Promise<ConsultationAccess | null> {
  if (joinToken) {
    const payload = verifyConsultationJoinToken(joinToken);
    if (!payload || payload.b !== bookingId) return null;
    return { role: payload.r, viaToken: true };
  }

  const session = await auth();
  if (!session?.user?.id) return null;

  if (booking.doctor.userId === session.user.id) {
    return { role: "doctor", viaToken: false };
  }
  if (booking.patientId === session.user.id) {
    return { role: "patient", viaToken: false };
  }

  return null;
}
