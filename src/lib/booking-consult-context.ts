import { BookingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function isFirstConsultWithDoctor(
  patientId: string,
  doctorId: string,
  excludeBookingId?: string
): Promise<boolean> {
  const priorCount = await prisma.booking.count({
    where: {
      patientId,
      doctorId,
      status: BookingStatus.COMPLETED,
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
    },
  });
  return priorCount === 0;
}
