import { addMinutes } from "date-fns";
import { prisma } from "@/lib/prisma";
import { notifyConsultationReminder } from "@/lib/push-notifications";

const REMINDER_WINDOW_MINUTES = 30;

export async function sendConsultationReminders() {
  const now = new Date();
  const windowStart = addMinutes(now, REMINDER_WINDOW_MINUTES - 5);
  const windowEnd = addMinutes(now, REMINDER_WINDOW_MINUTES + 5);

  const bookings = await prisma.booking.findMany({
    where: {
      status: "UPCOMING",
      payStatus: "CAPTURED",
      reminderpushsent: false,
      scheduledAt: {
        gte: windowStart,
        lte: windowEnd,
      },
    },
    include: {
      doctor: { select: { displayName: true } },
    },
    take: 100,
  });

  let sent = 0;
  for (const booking of bookings) {
    const minutesUntil = Math.max(
      1,
      Math.round((booking.scheduledAt.getTime() - now.getTime()) / (60 * 1000))
    );

    notifyConsultationReminder({
      patientUserId: booking.patientId,
      doctorName: booking.doctor.displayName,
      bookingId: booking.id,
      minutesUntil,
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { reminderpushsent: true },
    });
    sent += 1;
  }

  return { checked: bookings.length, sent };
}
