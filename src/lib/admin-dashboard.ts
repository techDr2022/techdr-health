import { subDays } from "date-fns";
import { prisma } from "@/lib/prisma";

export type DashboardPeriod = "today" | "week" | "month";

type TrendPoint = {
  date: string;
  bookings: number;
  revenueINR: number;
};

export type AdminDashboardData = {
  period: DashboardPeriod;
  rangeLabel: string;
  kpis: {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    noShowBookings: number;
    captureRate: number;
    platformRevenueINR: number;
  };
  bookingOps: {
    upcomingNext24h: number;
    pendingPaymentNearSlot: number;
    recentStatusChanges24h: number;
  };
  doctorMetrics: {
    approvedDoctors: number;
    visibleDoctors: number;
    activeDoctorsWithBookings: number;
    avgRating: number;
    utilizationPerVisibleDoctor: number;
  };
  patientMetrics: {
    uniquePatients: number;
    newPatients: number;
    returningPatients: number;
    followUpShare: number;
  };
  financeMetrics: {
    totalCollectionsINR: number;
    platformFeeINR: number;
    gstINR: number;
    doctorPayoutINR: number;
    payoutStatusBreakdown: Array<{ status: string; count: number }>;
  };
  alerts: Array<{
    key: string;
    title: string;
    count: number;
    href: string;
    severity: "high" | "medium" | "low";
  }>;
  trends: {
    last7Days: TrendPoint[];
    last30Days: TrendPoint[];
  };
  comparisons: {
    totalBookingsDeltaPct: number;
    captureRateDeltaPct: number;
    platformRevenueDeltaPct: number;
    collectionsDeltaPct: number;
  };
};

function getPeriodStart(period: DashboardPeriod, now: Date) {
  if (period === "today") return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === "week") return subDays(now, 6);
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function getPreviousRange(period: DashboardPeriod, periodStart: Date, periodEnd: Date) {
  if (period === "today") {
    const prevStart = subDays(periodStart, 1);
    const prevEnd = subDays(periodEnd, 1);
    return { prevStart, prevEnd };
  }
  if (period === "week") {
    const prevStart = subDays(periodStart, 7);
    const prevEnd = subDays(periodEnd, 7);
    return { prevStart, prevEnd };
  }
  const prevStart = new Date(periodStart.getFullYear(), periodStart.getMonth() - 1, 1);
  const prevEnd = new Date(periodStart.getFullYear(), periodStart.getMonth(), 0, 23, 59, 59, 999);
  return { prevStart, prevEnd };
}

function pctDelta(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return round(((current - previous) / previous) * 100);
}

async function getTrend(days: number) {
  const now = new Date();
  const start = subDays(now, days - 1);
  const bookings = await prisma.booking.findMany({
    where: { createdAt: { gte: start, lte: now } },
    select: { createdAt: true, totalPatientPays: true, payStatus: true },
  });

  const map = new Map<string, { bookings: number; revenueINR: number }>();
  for (let i = 0; i < days; i += 1) {
    const day = subDays(now, days - 1 - i);
    const key = day.toISOString().slice(0, 10);
    map.set(key, { bookings: 0, revenueINR: 0 });
  }

  for (const booking of bookings) {
    const key = booking.createdAt.toISOString().slice(0, 10);
    const existing = map.get(key);
    if (!existing) continue;
    existing.bookings += 1;
    if (booking.payStatus === "CAPTURED") {
      existing.revenueINR += booking.totalPatientPays;
    }
  }

  return Array.from(map.entries()).map(([date, value]) => ({
    date,
    bookings: value.bookings,
    revenueINR: value.revenueINR,
  }));
}

export async function getAdminDashboardData(period: DashboardPeriod): Promise<AdminDashboardData> {
  const now = new Date();
  const periodStart = getPeriodStart(period, now);
  const periodEnd = now;
  const { prevStart, prevEnd } = getPreviousRange(period, periodStart, periodEnd);

  const [
    bookingAggregate,
    bookingStatusCounts,
    capturedBookingsCount,
    pendingPaymentNearSlot,
    upcomingNext24h,
    recentStatusChanges24h,
    approvedDoctors,
    visibleDoctors,
    activeDoctorsWithBookings,
    reviewAggregate,
    uniquePatientsInPeriod,
    uniquePatientsBeforePeriod,
    followUpCount,
    financeAggregate,
    payoutStatusBreakdown,
    failedPaymentsCount,
    missedConsultationsCount,
    pendingApplicationsCount,
    stalePendingApplicationsCount,
    trend7,
    trend30,
    prevBookingAggregate,
    prevCapturedCount,
    prevFinanceAggregate,
  ] = await Promise.all([
    prisma.booking.aggregate({
      where: { createdAt: { gte: periodStart, lte: periodEnd } },
      _sum: {
        totalPatientPays: true,
        platformFeeINR: true,
        gstINR: true,
        doctorPayoutINR: true,
      },
      _count: { _all: true },
    }),
    prisma.booking.groupBy({
      by: ["status"],
      _count: { _all: true },
      where: { createdAt: { gte: periodStart, lte: periodEnd } },
    }),
    prisma.booking.count({
      where: { createdAt: { gte: periodStart, lte: periodEnd }, payStatus: "CAPTURED" },
    }),
    prisma.booking.count({
      where: {
        payStatus: { not: "CAPTURED" },
        scheduledAt: { lte: new Date(now.getTime() + 2 * 60 * 60 * 1000), gte: subDays(now, 1) },
      },
    }),
    prisma.booking.count({
      where: {
        status: "UPCOMING",
        scheduledAt: { gte: now, lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.booking.count({
      where: {
        updatedAt: { gte: subDays(now, 1), lte: now },
        status: { in: ["COMPLETED", "CANCELLED", "NO_SHOW"] },
      },
    }),
    prisma.doctorProfile.count({ where: { approvalStatus: "APPROVED" } }),
    prisma.doctorProfile.count({ where: { approvalStatus: "APPROVED", isVisible: true } }),
    prisma.booking.groupBy({
      by: ["doctorId"],
      where: { createdAt: { gte: periodStart, lte: periodEnd } },
      _count: { _all: true },
    }),
    prisma.review.aggregate({
      _avg: { rating: true },
      where: { createdAt: { gte: periodStart, lte: periodEnd }, isPublished: true },
    }),
    prisma.booking.findMany({
      where: { createdAt: { gte: periodStart, lte: periodEnd } },
      distinct: ["patientId"],
      select: { patientId: true },
    }),
    prisma.booking.findMany({
      where: { createdAt: { lt: periodStart } },
      distinct: ["patientId"],
      select: { patientId: true },
    }),
    prisma.booking.count({
      where: { createdAt: { gte: periodStart, lte: periodEnd }, followUpDate: { not: null } },
    }),
    prisma.booking.aggregate({
      where: { createdAt: { gte: periodStart, lte: periodEnd }, payStatus: "CAPTURED" },
      _sum: {
        totalPatientPays: true,
        platformFeeINR: true,
        gstINR: true,
        doctorPayoutINR: true,
      },
    }),
    prisma.booking.groupBy({
      by: ["payoutStatus"],
      _count: { _all: true },
      where: { createdAt: { gte: periodStart, lte: periodEnd }, payStatus: "CAPTURED" },
    }),
    prisma.booking.count({
      where: { createdAt: { gte: periodStart, lte: periodEnd }, payStatus: "FAILED" },
    }),
    prisma.consultationRoom.count({
      where: { createdAt: { gte: periodStart, lte: periodEnd }, status: "MISSED" },
    }),
    prisma.doctorProfile.count({ where: { approvalStatus: "PENDING" } }),
    prisma.doctorProfile.count({
      where: { approvalStatus: "PENDING", createdAt: { lte: subDays(now, 3) } },
    }),
    getTrend(7),
    getTrend(30),
    prisma.booking.aggregate({
      where: { createdAt: { gte: prevStart, lte: prevEnd } },
      _count: { _all: true },
    }),
    prisma.booking.count({
      where: { createdAt: { gte: prevStart, lte: prevEnd }, payStatus: "CAPTURED" },
    }),
    prisma.booking.aggregate({
      where: { createdAt: { gte: prevStart, lte: prevEnd }, payStatus: "CAPTURED" },
      _sum: {
        totalPatientPays: true,
        platformFeeINR: true,
      },
    }),
  ]);

  const statusMap = new Map(bookingStatusCounts.map((item) => [item.status, item._count._all]));
  const totalBookings = bookingAggregate._count._all ?? 0;
  const completedBookings = statusMap.get("COMPLETED") ?? 0;
  const cancelledBookings = statusMap.get("CANCELLED") ?? 0;
  const noShowBookings = statusMap.get("NO_SHOW") ?? 0;
  const captureRate = totalBookings > 0 ? round((capturedBookingsCount / totalBookings) * 100) : 0;
  const prevTotalBookings = prevBookingAggregate._count._all ?? 0;
  const prevCaptureRate =
    prevTotalBookings > 0 ? round((prevCapturedCount / prevTotalBookings) * 100) : 0;

  const seenBefore = new Set(uniquePatientsBeforePeriod.map((entry) => entry.patientId));
  const uniquePatients = uniquePatientsInPeriod.length;
  let newPatients = 0;
  for (const patient of uniquePatientsInPeriod) {
    if (!seenBefore.has(patient.patientId)) newPatients += 1;
  }
  const returningPatients = Math.max(0, uniquePatients - newPatients);
  const followUpShare = totalBookings > 0 ? round((followUpCount / totalBookings) * 100) : 0;

  const payoutBreakdown = payoutStatusBreakdown.map((row) => ({
    status: row.payoutStatus,
    count: row._count._all,
  }));

  const alerts: AdminDashboardData["alerts"] = [
    {
      key: "pending_payment_near_slot",
      title: "Uncaptured payments near slot time",
      count: pendingPaymentNearSlot,
      href: "/admin/bookings",
      severity: "high",
    },
    {
      key: "failed_payments",
      title: "Failed payments in selected period",
      count: failedPaymentsCount,
      href: "/admin/bookings",
      severity: failedPaymentsCount > 0 ? "high" : "low",
    },
    {
      key: "missed_consultations",
      title: "Missed consultations",
      count: missedConsultationsCount,
      href: "/admin/bookings",
      severity: missedConsultationsCount > 0 ? "medium" : "low",
    },
    {
      key: "stale_applications",
      title: "Pending applications older than 3 days",
      count: stalePendingApplicationsCount,
      href: "/admin/applications",
      severity: stalePendingApplicationsCount > 0 ? "medium" : "low",
    },
    {
      key: "pending_applications",
      title: "Total pending applications",
      count: pendingApplicationsCount,
      href: "/admin/applications",
      severity: pendingApplicationsCount > 10 ? "medium" : "low",
    },
  ];

  const rangeLabel =
    period === "today"
      ? "Today"
      : period === "week"
        ? "Last 7 days"
        : now.toLocaleString("en-IN", { month: "long", year: "numeric" });

  return {
    period,
    rangeLabel,
    kpis: {
      totalBookings,
      completedBookings,
      cancelledBookings,
      noShowBookings,
      captureRate,
      platformRevenueINR: bookingAggregate._sum.platformFeeINR ?? 0,
    },
    bookingOps: {
      upcomingNext24h,
      pendingPaymentNearSlot,
      recentStatusChanges24h,
    },
    doctorMetrics: {
      approvedDoctors,
      visibleDoctors,
      activeDoctorsWithBookings: activeDoctorsWithBookings.length,
      avgRating: round(reviewAggregate._avg.rating ?? 0),
      utilizationPerVisibleDoctor:
        visibleDoctors > 0 ? round(totalBookings / visibleDoctors) : 0,
    },
    patientMetrics: {
      uniquePatients,
      newPatients,
      returningPatients,
      followUpShare,
    },
    financeMetrics: {
      totalCollectionsINR: financeAggregate._sum.totalPatientPays ?? 0,
      platformFeeINR: financeAggregate._sum.platformFeeINR ?? 0,
      gstINR: financeAggregate._sum.gstINR ?? 0,
      doctorPayoutINR: financeAggregate._sum.doctorPayoutINR ?? 0,
      payoutStatusBreakdown: payoutBreakdown,
    },
    alerts: alerts.filter((item) => item.count > 0),
    trends: {
      last7Days: trend7,
      last30Days: trend30,
    },
    comparisons: {
      totalBookingsDeltaPct: pctDelta(totalBookings, prevTotalBookings),
      captureRateDeltaPct: pctDelta(captureRate, prevCaptureRate),
      platformRevenueDeltaPct: pctDelta(
        bookingAggregate._sum.platformFeeINR ?? 0,
        prevFinanceAggregate._sum.platformFeeINR ?? 0
      ),
      collectionsDeltaPct: pctDelta(
        financeAggregate._sum.totalPatientPays ?? 0,
        prevFinanceAggregate._sum.totalPatientPays ?? 0
      ),
    },
  };
}
