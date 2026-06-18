import { prisma } from "@/lib/prisma";
import { fetchCashfreeOrder } from "@/lib/cashfree";
import { sendBookingStatusUpdateEmail, sendSubscriptionConfirmationEmail } from "@/lib/email";
import { buildConsultationJoinUrl } from "@/lib/consultation-join";
import { getSiteUrl } from "@/lib/site-config";

type BookingCaptureResult =
  | { ok: true; type: "booking"; bookingId: string; alreadyCaptured: boolean }
  | { ok: false; error: string };

type SubscriptionCaptureResult =
  | { ok: true; type: "subscription"; doctorId: string; alreadyActive: boolean }
  | { ok: false; error: string };

export type PaymentCaptureResult = BookingCaptureResult | SubscriptionCaptureResult;

function isPaidOrder(orderStatus: string) {
  return orderStatus === "PAID";
}

export async function captureBookingPayment(
  orderId: string,
  bookingId?: string
): Promise<BookingCaptureResult> {
  const order = await fetchCashfreeOrder(orderId);
  if (!isPaidOrder(order.order_status)) {
    return { ok: false, error: "Payment is not completed yet." };
  }

  const booking = await prisma.booking.findFirst({
    where: {
      cashfreeOrderId: orderId,
      ...(bookingId ? { id: bookingId } : {}),
    },
    include: {
      patient: { select: { email: true, name: true } },
      doctor: {
        include: {
          user: { select: { email: true } },
        },
      },
      earnings: { select: { id: true } },
    },
  });

  if (!booking) {
    return { ok: false, error: "Booking not found for this payment." };
  }

  const alreadyCaptured = booking.payStatus === "CAPTURED";

  if (!alreadyCaptured) {
    const month = booking.scheduledAt.getMonth() + 1;
    const year = booking.scheduledAt.getFullYear();

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: booking.id },
        data: {
          payStatus: "CAPTURED",
          cashfreePaymentId: order.order_id,
        },
      }),
      ...(booking.earnings
        ? []
        : [
            prisma.platformEarning.create({
              data: {
                bookingId: booking.id,
                platformFeeINR: booking.platformFeeINR,
                gstINR: booking.gstINR,
                totalEarned: booking.platformFeeINR + booking.gstINR,
                month,
                year,
              },
            }),
          ]),
    ]);

    const siteUrl = getSiteUrl();
    const scheduleText = booking.scheduledAt.toLocaleString("en-IN");
    const doctorName = booking.doctor.displayName;
    const patientName = booking.patient.name || "Patient";
    const patientJoinUrl = buildConsultationJoinUrl(
      siteUrl,
      booking.id,
      "patient",
      booking.endsAt
    );
    const doctorJoinUrl = buildConsultationJoinUrl(
      siteUrl,
      booking.id,
      "doctor",
      booking.endsAt
    );

    await Promise.allSettled([
      booking.patient.email
        ? sendBookingStatusUpdateEmail(booking.patient.email, {
            audience: "patient",
            status: "CONFIRMED",
            doctorName,
            patientName,
            scheduledAt: scheduleText,
            joinUrl: patientJoinUrl,
          })
        : Promise.resolve(),
      booking.doctor.user.email
        ? sendBookingStatusUpdateEmail(booking.doctor.user.email, {
            audience: "doctor",
            status: "CONFIRMED",
            doctorName,
            patientName,
            scheduledAt: scheduleText,
            joinUrl: doctorJoinUrl,
          })
        : Promise.resolve(),
    ]);
  }

  return { ok: true, type: "booking", bookingId: booking.id, alreadyCaptured };
}

export async function activateSubscriptionPayment(
  orderId: string,
  doctorId?: string
): Promise<SubscriptionCaptureResult> {
  const order = await fetchCashfreeOrder(orderId);
  if (!isPaidOrder(order.order_status)) {
    return { ok: false, error: "Payment is not completed yet." };
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      cashfreeOrderId: orderId,
      ...(doctorId ? { doctorId } : {}),
    },
    include: {
      doctor: {
        include: {
          user: { select: { email: true } },
        },
      },
    },
  });

  if (!subscription) {
    return { ok: false, error: "Subscription not found." };
  }

  const alreadyActive = subscription.status === "ACTIVE" && Boolean(subscription.activatedAt);

  if (!alreadyActive) {
    await prisma.$transaction([
      prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "ACTIVE",
          cashfreePaymentId: order.order_id,
          cashfreeSignature: "cashfree-verified",
          purchasedAt: new Date(),
          activatedAt: new Date(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          renewalReminderSent: false,
          expiredEmailSent: false,
        },
      }),
      prisma.doctorProfile.update({
        where: { id: subscription.doctorId },
        data: { isVisible: false },
      }),
    ]);

    if (subscription.doctor.user.email) {
      await sendSubscriptionConfirmationEmail(
        subscription.doctor.user.email,
        subscription.doctor.displayName
      );
    }
  }

  return {
    ok: true,
    type: "subscription",
    doctorId: subscription.doctorId,
    alreadyActive,
  };
}

export async function capturePaymentByOrderId(orderId: string): Promise<PaymentCaptureResult> {
  if (orderId.startsWith("bkg_")) {
    return captureBookingPayment(orderId);
  }
  if (orderId.startsWith("sub_")) {
    return activateSubscriptionPayment(orderId);
  }

  const booking = await prisma.booking.findFirst({
    where: { cashfreeOrderId: orderId },
    select: { id: true },
  });
  if (booking) {
    return captureBookingPayment(orderId, booking.id);
  }

  const subscription = await prisma.subscription.findFirst({
    where: { cashfreeOrderId: orderId },
    select: { doctorId: true },
  });
  if (subscription) {
    return activateSubscriptionPayment(orderId, subscription.doctorId);
  }

  return { ok: false, error: "No payment record found for this order." };
}

export async function markBookingPaymentFailed(orderId: string) {
  await prisma.booking.updateMany({
    where: { cashfreeOrderId: orderId, payStatus: "PENDING" },
    data: { payStatus: "FAILED" },
  });
}
