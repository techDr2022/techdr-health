import { prisma } from "@/lib/prisma";
import {
  sendRenewalReminderEmail,
  sendSubscriptionExpiredEmail,
} from "@/lib/email";

export async function checkExpiringSubscriptions() {
  const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const today = new Date();

  const expiringSoon = await prisma.subscription.findMany({
    where: { expiresAt: { lte: in7Days, gte: today }, status: "ACTIVE" },
    include: { doctor: { include: { user: true } } },
  });

  for (const sub of expiringSoon) {
    if (sub.renewalReminderSent) continue;

    if (sub.doctor.user.email && sub.expiresAt) {
      await sendRenewalReminderEmail(sub.doctor.user.email, sub.expiresAt, sub.plan);
    }

    await prisma.subscription.update({
      where: { id: sub.id },
      data: { renewalReminderSent: true },
    });
  }

  const expired = await prisma.subscription.findMany({
    where: { expiresAt: { lt: today }, status: "ACTIVE" },
    include: { doctor: { include: { user: true } } },
  });

  for (const sub of expired) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "EXPIRED" },
    });

    await prisma.doctorProfile.updateMany({
      where: { id: sub.doctorId },
      data: { isVisible: false },
    });

    if (sub.doctor.user.email) {
      await sendSubscriptionExpiredEmail(sub.doctor.user.email, sub.plan);
    }
  }

  return {
    expiringSoonCount: expiringSoon.length,
    expiredCount: expired.length,
  };
}
