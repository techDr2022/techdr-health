import { PlanType, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendReferralMilestoneEmail } from "@/lib/email";

export const REFERRAL_BONUS_DAYS = 30;

export const REFERRAL_MILESTONE_TIERS = [
  { milestone: 3, rewardtype: "CASH", rewardvalue: "500", label: "₹500 cash bonus" },
  { milestone: 5, rewardtype: "BONUS_DAYS", rewardvalue: "30", label: "1 extra free subscription month" },
  { milestone: 10, rewardtype: "PLAN_UPGRADE", rewardvalue: "CLINIC", label: "Clinic plan upgrade" },
  { milestone: 25, rewardtype: "CASH", rewardvalue: "2000", label: "₹2,000 cash bonus" },
] as const;

type DbClient = Prisma.TransactionClient | typeof prisma;

export function buildReferralCode(displayName: string, doctorId: string): string {
  const prefix = displayName
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 4)
    .toUpperCase()
    .padEnd(4, "X");
  const suffix = doctorId.slice(-4).toUpperCase();
  return `${prefix}${suffix}`;
}

export function buildPatientReferralCode(doctorReferralCode: string): string {
  return `PAT-${doctorReferralCode}`;
}

export async function ensureDoctorReferralCode(
  doctorId: string,
  displayName: string,
  client: DbClient = prisma
): Promise<string> {
  const existing = await client.doctorProfile.findUnique({
    where: { id: doctorId },
    select: { referralcode: true, patientreferralcode: true, displayName: true },
  });
  if (existing?.referralcode) {
    if (!existing.patientreferralcode) {
      await client.doctorProfile.update({
        where: { id: doctorId },
        data: { patientreferralcode: buildPatientReferralCode(existing.referralcode) },
      });
    }
    return existing.referralcode;
  }

  let code = buildReferralCode(displayName, doctorId);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const collision = await client.doctorProfile.findUnique({
      where: { referralcode: code },
      select: { id: true },
    });
    if (!collision) break;
    code = buildReferralCode(displayName, `${doctorId}${attempt}`);
  }

  const updated = await client.doctorProfile.update({
    where: { id: doctorId },
    data: {
      referralcode: code,
      patientreferralcode: buildPatientReferralCode(code),
    },
    select: { referralcode: true },
  });

  return updated.referralcode ?? code;
}

export async function resolveReferrerDoctorId(referralCode: string): Promise<string | null> {
  const normalized = referralCode.trim().toUpperCase();
  if (!normalized) return null;

  const referrer = await prisma.doctorProfile.findFirst({
    where: { referralcode: { equals: normalized, mode: "insensitive" } },
    select: { id: true },
  });
  return referrer?.id ?? null;
}

export async function recordDoctorReferral(
  referrerDoctorId: string,
  referredDoctorId: string,
  client: DbClient = prisma
): Promise<void> {
  if (referrerDoctorId === referredDoctorId) return;

  await client.doctorReferral.upsert({
    where: { referreddoctorid: referredDoctorId },
    create: {
      referrerdoctorid: referrerDoctorId,
      referreddoctorid: referredDoctorId,
      status: "PENDING",
    },
    update: {},
  });
}

function addBonusDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
}

async function extendReferrerSubscription(
  referrerDoctorId: string,
  days: number,
  client: DbClient = prisma
): Promise<void> {
  const subscription = await client.subscription.findUnique({
    where: { doctorId: referrerDoctorId },
  });
  if (!subscription) return;

  const now = new Date();
  const baseDate =
    subscription.expiresAt && subscription.expiresAt > now ? subscription.expiresAt : now;

  await client.subscription.update({
    where: { doctorId: referrerDoctorId },
    data: {
      expiresAt: addBonusDays(baseDate, days),
      status: subscription.status === "EXPIRED" ? "ACTIVE" : subscription.status,
      expiredEmailSent: false,
      renewalReminderSent: false,
    },
  });
}

async function applyMilestoneReward(
  doctorId: string,
  tier: (typeof REFERRAL_MILESTONE_TIERS)[number],
  client: DbClient = prisma
) {
  if (tier.rewardtype === "BONUS_DAYS") {
    await extendReferrerSubscription(doctorId, Number(tier.rewardvalue), client);
    return;
  }

  if (tier.rewardtype === "PLAN_UPGRADE" && tier.rewardvalue === "CLINIC") {
    const subscription = await client.subscription.findUnique({
      where: { doctorId },
      select: { plan: true },
    });
    if (subscription && subscription.plan === PlanType.INDIVIDUAL) {
      await client.subscription.update({
        where: { doctorId },
        data: { plan: PlanType.CLINIC },
      });
    }
  }
}

export async function checkAndAwardMilestones(
  doctorId: string,
  client: DbClient = prisma
): Promise<number> {
  const successfulJoins = await client.doctorReferral.count({
    where: { referrerdoctorid: doctorId, status: "REWARDED" },
  });

  const existing = await client.referralmilestone.findMany({
    where: { doctorid: doctorId },
    select: { milestone: true },
  });
  const awardedSet = new Set(existing.map((item) => item.milestone));

  let newlyAwarded = 0;

  for (const tier of REFERRAL_MILESTONE_TIERS) {
    if (successfulJoins < tier.milestone || awardedSet.has(tier.milestone)) continue;

    await client.referralmilestone.create({
      data: {
        doctorid: doctorId,
        milestone: tier.milestone,
        rewardtype: tier.rewardtype,
        rewardvalue: tier.rewardvalue,
        paid: tier.rewardtype !== "CASH",
      },
    });

    await applyMilestoneReward(doctorId, tier, client);
    newlyAwarded += 1;

    const doctor = await client.doctorProfile.findUnique({
      where: { id: doctorId },
      select: {
        displayName: true,
        user: { select: { email: true } },
      },
    });

    if (doctor?.user.email) {
      void sendReferralMilestoneEmail(doctor.user.email, {
        entityName: doctor.displayName,
        milestone: tier.milestone,
        rewardLabel: tier.label,
      }).catch((error) => {
        console.error("[referrals] milestone email failed", error);
      });
    }
  }

  return newlyAwarded;
}

export async function applyReferralRewardWhenDoctorJoins(
  referredDoctorId: string,
  client: DbClient = prisma
): Promise<boolean> {
  const referral = await client.doctorReferral.findUnique({
    where: { referreddoctorid: referredDoctorId },
    select: {
      id: true,
      referrerdoctorid: true,
      status: true,
      rewardgrantedat: true,
    },
  });

  if (!referral || referral.rewardgrantedat || referral.status === "REWARDED") {
    return false;
  }

  const referredSubscription = await client.subscription.findUnique({
    where: { doctorId: referredDoctorId },
    select: { status: true },
  });

  if (referredSubscription?.status !== "ACTIVE") {
    return false;
  }

  const now = new Date();

  await client.doctorReferral.update({
    where: { id: referral.id },
    data: {
      status: "REWARDED",
      joinedat: now,
      rewardgrantedat: now,
    },
  });

  await extendReferrerSubscription(referral.referrerdoctorid, REFERRAL_BONUS_DAYS, client);
  await checkAndAwardMilestones(referral.referrerdoctorid, client);
  return true;
}

export function getNextMilestoneTarget(successfulJoins: number) {
  const next = REFERRAL_MILESTONE_TIERS.find((tier) => successfulJoins < tier.milestone);
  if (!next) {
    const last = REFERRAL_MILESTONE_TIERS[REFERRAL_MILESTONE_TIERS.length - 1];
    return { target: last.milestone, label: last.label, remaining: 0, completed: true };
  }
  return {
    target: next.milestone,
    label: next.label,
    remaining: next.milestone - successfulJoins,
    completed: false,
  };
}

export async function getMonthlyReferralLeaderboard(limit = 10) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const grouped = await prisma.doctorReferral.groupBy({
    by: ["referrerdoctorid"],
    where: {
      status: "REWARDED",
      rewardgrantedat: { gte: startOfMonth },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  });

  const doctorIds = grouped.map((row) => row.referrerdoctorid);
  const doctors =
    doctorIds.length > 0
      ? await prisma.doctorProfile.findMany({
          where: { id: { in: doctorIds } },
          select: { id: true, displayName: true },
        })
      : [];
  const nameById = new Map(doctors.map((doctor) => [doctor.id, doctor.displayName]));

  return grouped.map((row, index) => ({
    rank: index + 1,
    referralCount: row._count.id,
    label: nameById.get(row.referrerdoctorid) ?? `Doctor #${index + 1}`,
  }));
}

async function getDoctorMonthlyReferralRank(doctorId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const grouped = await prisma.doctorReferral.groupBy({
    by: ["referrerdoctorid"],
    where: {
      status: "REWARDED",
      rewardgrantedat: { gte: startOfMonth },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  const index = grouped.findIndex((row) => row.referrerdoctorid === doctorId);
  if (index === -1) return { monthlyReferrals: 0, monthlyRank: null as number | null };

  return {
    monthlyReferrals: grouped[index]._count.id,
    monthlyRank: index + 1,
  };
}

export async function getDoctorReferralStats(doctorId: string) {
  const [doctor, referrals, milestones, leaderboard, monthlyStats] = await Promise.all([
    prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      select: { displayName: true, referralcode: true, patientreferralcode: true },
    }),
    prisma.doctorReferral.findMany({
      where: { referrerdoctorid: doctorId },
      orderBy: { createdAt: "desc" },
      include: {
        referred: { select: { displayName: true, createdAt: true } },
      },
    }),
    prisma.referralmilestone.findMany({
      where: { doctorid: doctorId },
      orderBy: { milestone: "asc" },
    }),
    getMonthlyReferralLeaderboard(10),
    getDoctorMonthlyReferralRank(doctorId),
  ]);

  if (!doctor) return null;

  const referralCode = doctor.referralcode
    ? doctor.referralcode
    : await ensureDoctorReferralCode(doctorId, doctor.displayName);

  const refreshedDoctor = await prisma.doctorProfile.findUnique({
    where: { id: doctorId },
    select: { patientreferralcode: true },
  });

  const patientReferralCode =
    refreshedDoctor?.patientreferralcode ?? buildPatientReferralCode(referralCode);

  const successfulJoins = referrals.filter((item) => item.status === "REWARDED").length;
  const pendingReferrals = referrals.filter((item) => item.status === "PENDING").length;
  const monthsEarned = successfulJoins;
  const nextMilestone = getNextMilestoneTarget(successfulJoins);

  const pendingCashRewards = milestones.filter(
    (item) => item.rewardtype === "CASH" && !item.paid
  );
  const totalPendingCashInr = pendingCashRewards.reduce(
    (sum, item) => sum + Number(item.rewardvalue || 0),
    0
  );

  return {
    referralCode,
    patientReferralCode,
    referrals,
    successfulJoins,
    pendingReferrals,
    monthsEarned,
    milestones,
    nextMilestone,
    pendingCashRewards,
    totalPendingCashInr,
    monthlyReferrals: monthlyStats.monthlyReferrals,
    monthlyRank: monthlyStats.monthlyRank,
    leaderboard,
  };
}

export function mapReferralStatsForCard(
  stats: NonNullable<Awaited<ReturnType<typeof getDoctorReferralStats>>>,
  siteUrl: string
) {
  return {
    referralCode: stats.referralCode,
    patientReferralCode: stats.patientReferralCode,
    referralLink: `${siteUrl}/join/register?ref=${encodeURIComponent(stats.referralCode)}`,
    patientReferralLink: `${siteUrl}/book?pref=${encodeURIComponent(stats.patientReferralCode)}`,
    successfulJoins: stats.successfulJoins,
    pendingReferrals: stats.pendingReferrals,
    monthsEarned: stats.monthsEarned,
    totalPendingCashInr: stats.totalPendingCashInr,
    monthlyReferrals: stats.monthlyReferrals,
    monthlyRank: stats.monthlyRank,
    leaderboard: stats.leaderboard,
    nextMilestone: stats.nextMilestone,
    milestones: stats.milestones.map((item) => ({
      id: item.id,
      milestone: item.milestone,
      rewardtype: item.rewardtype,
      rewardvalue: item.rewardvalue,
      awardedat: item.awardedat.toISOString(),
      paid: item.paid,
    })),
    referrals: stats.referrals.map((item) => ({
      id: item.id,
      status: item.status,
      createdAt: item.createdAt.toISOString(),
      joinedat: item.joinedat?.toISOString() ?? null,
      referred: {
        displayName: item.referred.displayName,
        createdAt: item.referred.createdAt.toISOString(),
      },
    })),
  };
}

export async function listPendingCashMilestones() {
  return prisma.referralmilestone.findMany({
    where: { rewardtype: "CASH", paid: false },
    orderBy: { awardedat: "asc" },
    include: {
      doctor: {
        select: {
          displayName: true,
          referralcode: true,
          user: { select: { email: true, phone: true } },
        },
      },
    },
  });
}

export async function markReferralMilestonePaid(milestoneId: string) {
  return prisma.referralmilestone.update({
    where: { id: milestoneId },
    data: { paid: true },
  });
}
