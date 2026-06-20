import { BookingStatus, PayStatus, PayoutStatus, Payoutrecordstatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  addCashfreeBeneficiary,
  buildDoctorBeneficiaryId,
  buildPayoutTransferId,
  isCashfreePayoutEnabled,
  requestCashfreeTransfer,
  withPayoutRetry,
} from "@/lib/cashfree-payouts";
import { allocateBookingTdsShares, calculatePayout } from "@/lib/payout";
import { sendPayoutProcessedEmail } from "@/lib/email";

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const ACCOUNT_REGEX = /^\d{9,18}$/;

export function normalizeIfsc(value: string) {
  return value.trim().toUpperCase();
}

export function validateBankAccountInput(input: {
  accountName: string;
  accountNumber: string;
  ifsc: string;
}) {
  const accountname = input.accountName.trim();
  const accountnumber = input.accountNumber.replace(/\s/g, "");
  const ifsc = normalizeIfsc(input.ifsc);

  if (accountname.length < 2) {
    return { ok: false as const, error: "Account holder name is required." };
  }
  if (!ACCOUNT_REGEX.test(accountnumber)) {
    return { ok: false as const, error: "Enter a valid bank account number (9-18 digits)." };
  }
  if (!IFSC_REGEX.test(ifsc)) {
    return { ok: false as const, error: "Enter a valid IFSC code." };
  }

  return { ok: true as const, accountname, accountnumber, ifsc };
}

export function maskAccountNumber(accountNumber: string) {
  const digits = accountNumber.replace(/\D/g, "");
  if (digits.length <= 4) return digits;
  return `${"•".repeat(Math.max(4, digits.length - 4))}${digits.slice(-4)}`;
}

export async function upsertDoctorBankAccount(args: {
  doctorId: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
  email: string;
  phone?: string | null;
}) {
  const validated = validateBankAccountInput({
    accountName: args.accountName,
    accountNumber: args.accountNumber,
    ifsc: args.ifsc,
  });
  if (!validated.ok) {
    throw new Error(validated.error);
  }

  const beneId = buildDoctorBeneficiaryId(args.doctorId);
  let cashfreebeneficiaryid: string | null = beneId;
  let verified = false;

  if (isCashfreePayoutEnabled()) {
    const beneficiary = await withPayoutRetry(() =>
      addCashfreeBeneficiary({
        beneId,
        name: validated.accountname,
        email: args.email,
        phone: args.phone || "9999999999",
        bankAccount: validated.accountnumber,
        ifsc: validated.ifsc,
      })
    );
    verified = beneficiary.status === "SUCCESS";
    cashfreebeneficiaryid = beneId;
  } else {
    verified = true;
  }

  return prisma.doctorbankaccount.upsert({
    where: { doctorid: args.doctorId },
    create: {
      doctorid: args.doctorId,
      accountname: validated.accountname,
      accountnumber: validated.accountnumber,
      ifsc: validated.ifsc,
      verified,
      cashfreebeneficiaryid,
    },
    update: {
      accountname: validated.accountname,
      accountnumber: validated.accountnumber,
      ifsc: validated.ifsc,
      verified,
      cashfreebeneficiaryid,
    },
  });
}

type DoctorPayoutCandidate = {
  doctorId: string;
  doctorName: string;
  doctorEmail: string;
  beneId: string;
  bookingIds: string[];
  grossInr: number;
  tdsInr: number;
  netInr: number;
};

export type WeeklyPayoutRunResult = {
  weekLabel: string;
  payoutsEnabled: boolean;
  processed: number;
  failed: number;
  skipped: number;
  totalAmountINR: number;
  rows: Array<{
    doctorName: string;
    doctorEmail: string;
    consultations: number;
    amountINR: number;
    status: "PAID" | "FAILED" | "SKIPPED";
    reason?: string;
  }>;
};

export async function processWeeklyDoctorPayouts(): Promise<WeeklyPayoutRunResult> {
  const now = new Date();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekLabel = `${weekStart.toLocaleDateString("en-IN")} to ${now.toLocaleDateString("en-IN")}`;
  const payoutsEnabled = isCashfreePayoutEnabled();

  const bookings = await prisma.booking.findMany({
    where: {
      payStatus: PayStatus.CAPTURED,
      status: BookingStatus.COMPLETED,
      payoutStatus: PayoutStatus.PENDING,
      scheduledAt: { gte: weekStart, lt: now },
    },
    select: {
      id: true,
      doctorId: true,
      doctorPayoutINR: true,
      doctor: {
        select: {
          displayName: true,
          user: { select: { email: true } },
          bankaccount: {
            select: {
              verified: true,
              cashfreebeneficiaryid: true,
            },
          },
        },
      },
    },
  });

  const grouped = new Map<string, DoctorPayoutCandidate>();

  for (const booking of bookings) {
    const bank = booking.doctor.bankaccount;
    const beneId =
      bank?.cashfreebeneficiaryid || buildDoctorBeneficiaryId(booking.doctorId);
    const existing = grouped.get(booking.doctorId);
    if (existing) {
      existing.bookingIds.push(booking.id);
      existing.grossInr += booking.doctorPayoutINR;
      continue;
    }

    grouped.set(booking.doctorId, {
      doctorId: booking.doctorId,
      doctorName: booking.doctor.displayName,
      doctorEmail: booking.doctor.user.email,
      beneId,
      bookingIds: [booking.id],
      grossInr: booking.doctorPayoutINR,
      tdsInr: 0,
      netInr: 0,
    });
  }

  const rows: WeeklyPayoutRunResult["rows"] = [];
  let processed = 0;
  let failed = 0;
  let skipped = 0;
  let totalAmountINR = 0;

  for (const candidate of Array.from(grouped.values())) {
    const payoutCalc = await calculatePayout(candidate.doctorId, candidate.grossInr, {
      excludeBookingIds: candidate.bookingIds,
    });
    const tdsInr = payoutCalc.tdsDeducted;
    const netInr = payoutCalc.netPayable;
    candidate.tdsInr = tdsInr;
    candidate.netInr = netInr;

    const bank = await prisma.doctorbankaccount.findUnique({
      where: { doctorid: candidate.doctorId },
    });

    if (!bank?.verified || !bank.cashfreebeneficiaryid) {
      skipped += 1;
      rows.push({
        doctorName: candidate.doctorName,
        doctorEmail: candidate.doctorEmail,
        consultations: candidate.bookingIds.length,
        amountINR: netInr,
        status: "SKIPPED",
        reason: "Verified bank account missing",
      });
      continue;
    }

    if (!payoutsEnabled) {
      skipped += 1;
      rows.push({
        doctorName: candidate.doctorName,
        doctorEmail: candidate.doctorEmail,
        consultations: candidate.bookingIds.length,
        amountINR: netInr,
        status: "SKIPPED",
        reason: "Cashfree payouts disabled",
      });
      continue;
    }

    if (netInr < 1) {
      skipped += 1;
      rows.push({
        doctorName: candidate.doctorName,
        doctorEmail: candidate.doctorEmail,
        consultations: candidate.bookingIds.length,
        amountINR: netInr,
        status: "SKIPPED",
        reason: "Amount below minimum transfer",
      });
      continue;
    }

    const reference = `po_${candidate.doctorId.slice(0, 8)}_${Date.now()}`;
    const transferId = buildPayoutTransferId(reference);

    const payoutRecord = await prisma.payoutrecord.create({
      data: {
        doctorid: candidate.doctorId,
        amountinr: netInr,
        tdsinr: tdsInr,
        bookingcount: candidate.bookingIds.length,
        bookingids: candidate.bookingIds,
        reference,
        status: Payoutrecordstatus.PROCESSING,
      },
    });

    await prisma.booking.updateMany({
      where: { id: { in: candidate.bookingIds } },
      data: { payoutStatus: PayoutStatus.PROCESSING },
    });

    try {
      const transfer = await withPayoutRetry(() =>
        requestCashfreeTransfer({
          beneId: bank.cashfreebeneficiaryid!,
          amountInr: netInr,
          transferId,
          remarks: `Weekly payout ${weekLabel}`,
        })
      );

      const cashfreeReference =
        (transfer.data?.referenceId as string | undefined) ||
        (transfer.data?.transferId as string | undefined) ||
        transferId;

      await prisma.$transaction([
        prisma.payoutrecord.update({
          where: { id: payoutRecord.id },
          data: {
            status: Payoutrecordstatus.SUCCESS,
            cashfreetransferid: String(cashfreeReference),
            processedat: new Date(),
          },
        }),
        prisma.booking.updateMany({
          where: { id: { in: candidate.bookingIds } },
          data: {
            payoutStatus: PayoutStatus.PAID,
            payoutDate: new Date(),
            payoutRef: String(cashfreeReference),
          },
        }),
      ]);

      await allocateBookingTdsShares({
        doctorId: candidate.doctorId,
        bookingIds: candidate.bookingIds,
        grossAmount: candidate.grossInr,
        tdsDeducted: tdsInr,
        tdsRate: payoutCalc.tdsRate,
      }).catch((error) => {
        console.error("tds allocation failed", error);
      });

      processed += 1;
      totalAmountINR += netInr;
      rows.push({
        doctorName: candidate.doctorName,
        doctorEmail: candidate.doctorEmail,
        consultations: candidate.bookingIds.length,
        amountINR: netInr,
        status: "PAID",
      });

      if (candidate.doctorEmail) {
        await sendPayoutProcessedEmail(candidate.doctorEmail, {
          amountINR: netInr,
          reference: String(cashfreeReference),
        }).catch((error) => {
          console.error("payout confirmation email failed", error);
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Transfer failed.";
      failed += 1;

      await prisma.$transaction([
        prisma.payoutrecord.update({
          where: { id: payoutRecord.id },
          data: {
            status: Payoutrecordstatus.FAILED,
            errormessage: message.slice(0, 500),
          },
        }),
        prisma.booking.updateMany({
          where: { id: { in: candidate.bookingIds } },
          data: { payoutStatus: PayoutStatus.FAILED },
        }),
      ]);

      rows.push({
        doctorName: candidate.doctorName,
        doctorEmail: candidate.doctorEmail,
        consultations: candidate.bookingIds.length,
        amountINR: netInr,
        status: "FAILED",
        reason: message,
      });

      console.error("doctor payout failed", {
        doctorId: candidate.doctorId,
        reference,
        error: message,
      });
    }
  }

  return {
    weekLabel,
    payoutsEnabled,
    processed,
    failed,
    skipped,
    totalAmountINR,
    rows: rows.sort((a, b) => b.amountINR - a.amountINR),
  };
}

export async function applyCashfreePayoutWebhook(args: {
  transferId: string;
  status: string;
  referenceId?: string;
}) {
  const normalized = args.status.toUpperCase();
  const payout = await prisma.payoutrecord.findFirst({
    where: {
      OR: [
        { reference: args.transferId },
        { cashfreetransferid: args.transferId },
        ...(args.referenceId
          ? [{ cashfreetransferid: args.referenceId }, { reference: args.referenceId }]
          : []),
      ],
    },
  });

  if (!payout) {
    return { ok: false as const, reason: "Payout record not found." };
  }

  if (normalized === "SUCCESS" || normalized === "COMPLETED") {
    await prisma.$transaction([
      prisma.payoutrecord.update({
        where: { id: payout.id },
        data: {
          status: Payoutrecordstatus.SUCCESS,
          cashfreetransferid: args.referenceId || payout.cashfreetransferid,
          processedat: new Date(),
        },
      }),
      prisma.booking.updateMany({
        where: { id: { in: payout.bookingids } },
        data: {
          payoutStatus: PayoutStatus.PAID,
          payoutDate: new Date(),
          payoutRef: args.referenceId || payout.cashfreetransferid || payout.reference,
        },
      }),
    ]);
    return { ok: true as const, status: "SUCCESS" };
  }

  if (normalized === "FAILED" || normalized === "REVERSED") {
    await prisma.$transaction([
      prisma.payoutrecord.update({
        where: { id: payout.id },
        data: {
          status: Payoutrecordstatus.FAILED,
          errormessage: `Webhook status: ${normalized}`,
        },
      }),
      prisma.booking.updateMany({
        where: { id: { in: payout.bookingids }, payoutStatus: PayoutStatus.PROCESSING },
        data: { payoutStatus: PayoutStatus.FAILED },
      }),
    ]);
    return { ok: true as const, status: "FAILED" };
  }

  return { ok: true as const, status: "IGNORED" };
}
