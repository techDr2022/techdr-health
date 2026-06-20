import { prisma } from "@/lib/prisma";

export const TDS_SECTION_194J_RATE = 0.1;
export const TDS_THRESHOLD_INR = 30_000;

export function getIndianFinancialYearStart(date: Date): Date {
  const month = date.getMonth();
  const year = date.getFullYear();
  const startYear = month >= 3 ? year : year - 1;
  return new Date(startYear, 3, 1);
}

export async function getDoctorYtdGrossInr(
  doctorId: string,
  asOf: Date,
  excludeBookingIds: string[] = []
) {
  const fyStart = getIndianFinancialYearStart(asOf);
  const aggregate = await prisma.booking.aggregate({
    where: {
      doctorId,
      payStatus: "CAPTURED",
      status: "COMPLETED",
      scheduledAt: { gte: fyStart, lt: asOf },
      ...(excludeBookingIds.length > 0 ? { id: { notIn: excludeBookingIds } } : {}),
    },
    _sum: { doctorPayoutINR: true },
  });

  return aggregate._sum.doctorPayoutINR ?? 0;
}

export type PayoutCalculation = {
  grossAmount: number;
  tdsDeducted: number;
  netPayable: number;
  tdsRate: number;
  tdsApplicable: boolean;
  ytdGrossInr: number;
};

export async function calculatePayout(
  doctorId: string,
  grossAmount: number,
  options?: { asOf?: Date; excludeBookingIds?: string[] }
): Promise<PayoutCalculation> {
  const asOf = options?.asOf ?? new Date();
  const excludeBookingIds = options?.excludeBookingIds ?? [];
  const ytdGrossInr = await getDoctorYtdGrossInr(doctorId, asOf, excludeBookingIds);
  const cumulativeInr = ytdGrossInr + grossAmount;
  const tdsApplicable = cumulativeInr >= TDS_THRESHOLD_INR;
  const tdsRate = tdsApplicable ? TDS_SECTION_194J_RATE : 0;
  const tdsDeducted = tdsApplicable ? Math.round(grossAmount * tdsRate) : 0;
  const netPayable = grossAmount - tdsDeducted;

  return {
    grossAmount,
    tdsDeducted,
    netPayable,
    tdsRate,
    tdsApplicable,
    ytdGrossInr,
  };
}

export async function allocateBookingTdsShares(args: {
  doctorId: string;
  bookingIds: string[];
  grossAmount: number;
  tdsDeducted: number;
  tdsRate: number;
}) {
  if (args.bookingIds.length === 0 || args.grossAmount <= 0) return;

  const bookings = await prisma.booking.findMany({
    where: { id: { in: args.bookingIds }, doctorId: args.doctorId },
    select: { id: true, doctorPayoutINR: true },
  });

  let allocated = 0;
  for (let index = 0; index < bookings.length; index += 1) {
    const booking = bookings[index];
    const isLast = index === bookings.length - 1;
    const share = isLast
      ? args.tdsDeducted - allocated
      : Math.round((args.tdsDeducted * booking.doctorPayoutINR) / args.grossAmount);
    allocated += share;

    await prisma.platformEarning.updateMany({
      where: { bookingId: booking.id },
      data: {
        tdsdeducted: share,
        tdsrate: args.tdsRate,
        netpayable: booking.doctorPayoutINR - share,
      },
    });
  }
}
