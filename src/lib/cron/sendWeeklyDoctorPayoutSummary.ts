import { prisma } from "@/lib/prisma";
import { processWeeklyDoctorPayouts } from "@/lib/doctor-payouts";
import { sendWeeklyDoctorPayoutSummaryEmail } from "@/lib/email";

const SUMMARY_RECIPIENT = process.env.WEEKLY_PAYOUT_SUMMARY_TO || "info@techdr.in";

export async function sendWeeklyDoctorPayoutSummary() {
  const result = await processWeeklyDoctorPayouts();

  const totalConsultations = result.rows.reduce((sum, row) => sum + row.consultations, 0);

  await sendWeeklyDoctorPayoutSummaryEmail(SUMMARY_RECIPIENT, {
    weekLabel: result.weekLabel,
    rows: result.rows.map((row) => ({
      doctorName: row.doctorName,
      doctorEmail: row.doctorEmail,
      consultations: row.consultations,
      amountINR: row.amountINR,
      status: row.status,
      reason: row.reason,
    })),
    totalAmountINR: result.totalAmountINR,
    totalConsultations,
    processed: result.processed,
    failed: result.failed,
    skipped: result.skipped,
    payoutsEnabled: result.payoutsEnabled,
  });

  return {
    recipient: SUMMARY_RECIPIENT,
    weekLabel: result.weekLabel,
    doctorsIncluded: result.rows.length,
    totalConsultations,
    totalAmountINR: result.totalAmountINR,
    processed: result.processed,
    failed: result.failed,
    skipped: result.skipped,
    payoutsEnabled: result.payoutsEnabled,
  };
}

export async function getDoctorPayoutHistory(doctorId: string, limit = 10) {
  return prisma.payoutrecord.findMany({
    where: { doctorid: doctorId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      amountinr: true,
      tdsinr: true,
      bookingcount: true,
      reference: true,
      status: true,
      processedat: true,
      createdAt: true,
    },
  });
}
