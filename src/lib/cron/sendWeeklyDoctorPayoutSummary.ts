import { prisma } from "@/lib/prisma";
import { sendWeeklyDoctorPayoutSummaryEmail } from "@/lib/email";

const SUMMARY_RECIPIENT = process.env.WEEKLY_PAYOUT_SUMMARY_TO || "info@techdr.in";

function toISTDateLabel(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
  }).format(date);
}

export async function sendWeeklyDoctorPayoutSummary() {
  const now = new Date();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const bookings = await prisma.booking.findMany({
    where: {
      payStatus: "CAPTURED",
      payoutStatus: { in: ["PENDING", "PROCESSING"] },
      scheduledAt: { gte: weekStart, lt: now },
    },
    select: {
      doctorId: true,
      doctorPayoutINR: true,
      doctor: {
        select: {
          displayName: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      },
    },
  });

  const payoutsByDoctor = new Map<
    string,
    { doctorName: string; doctorEmail: string; consultations: number; amountINR: number }
  >();

  for (const booking of bookings) {
    const doctorName = booking.doctor.displayName || "Unknown Doctor";
    const doctorEmail = booking.doctor.user.email || "-";
    const key = `${booking.doctorId}:${doctorEmail}`;
    const existing = payoutsByDoctor.get(key);
    if (existing) {
      existing.consultations += 1;
      existing.amountINR += booking.doctorPayoutINR;
      continue;
    }

    payoutsByDoctor.set(key, {
      doctorName,
      doctorEmail,
      consultations: 1,
      amountINR: booking.doctorPayoutINR,
    });
  }

  const rows = Array.from(payoutsByDoctor.values()).sort((a, b) => b.amountINR - a.amountINR);
  const totalAmountINR = rows.reduce((sum, row) => sum + row.amountINR, 0);
  const totalConsultations = rows.reduce((sum, row) => sum + row.consultations, 0);
  const weekLabel = `${toISTDateLabel(weekStart)} to ${toISTDateLabel(now)}`;

  await sendWeeklyDoctorPayoutSummaryEmail(SUMMARY_RECIPIENT, {
    weekLabel,
    rows,
    totalAmountINR,
    totalConsultations,
  });

  return {
    recipient: SUMMARY_RECIPIENT,
    weekLabel,
    doctorsIncluded: rows.length,
    totalConsultations,
    totalAmountINR,
  };
}
